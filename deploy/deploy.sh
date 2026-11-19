#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

PROJECT_ID="${PROJECT_ID:-cpe334-team45}"
REGION="${REGION:-asia-southeast1}"
AR_REPOSITORY="${AR_REPOSITORY:-equipflow}"
AR_IMAGE="${AR_IMAGE:-app}"
SQL_INSTANCE="${SQL_INSTANCE:-equipflow-pg}"
DB_NAME="${DB_NAME:-equipflow}"
DB_USER="${DB_USER:-appuser}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-equipflow}"
CLOUD_RUN_MIGRATION_JOB="${CLOUD_RUN_MIGRATION_JOB:-equipflow-migrate}"
RUNTIME_SA_NAME="${RUNTIME_SA_NAME:-equipflow-runner}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$repo_root" rev-parse HEAD)}"
RUN_INITIAL_SEED="${RUN_INITIAL_SEED:-true}"
BUILD_METHOD="${BUILD_METHOD:-cloudbuild}"

[[ "$IMAGE_TAG" =~ ^[0-9a-f]{40}$ ]] || {
  echo 'IMAGE_TAG must be a full 40-character commit SHA.' >&2
  exit 1
}
[[ "$RUN_INITIAL_SEED" == true || "$RUN_INITIAL_SEED" == false ]] || {
  echo 'RUN_INITIAL_SEED must be true or false.' >&2
  exit 1
}
[[ "$BUILD_METHOD" == cloudbuild || "$BUILD_METHOD" == docker ]] || {
  echo 'BUILD_METHOD must be cloudbuild or docker.' >&2
  exit 1
}

runtime_sa_email="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
image_base="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${AR_IMAGE}"

echo "Enabling required GCP APIs on project ${PROJECT_ID}..."
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  --project="$PROJECT_ID" --quiet

if ! gcloud artifacts repositories describe "$AR_REPOSITORY" \
  --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating Artifact Registry repository ${AR_REPOSITORY} in ${REGION}..."
  gcloud artifacts repositories create "$AR_REPOSITORY" \
    --repository-format=docker \
    --location="$REGION" \
    --project="$PROJECT_ID" \
    --description="EquipFlow container images" \
    --quiet
fi

if ! gcloud sql instances describe "$SQL_INSTANCE" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating Cloud SQL PostgreSQL 16 instance ${SQL_INSTANCE} in ${REGION}..."
  gcloud sql instances create "$SQL_INSTANCE" \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --edition=ENTERPRISE \
    --storage-size=10GB \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --quiet
fi

INSTANCE_CONNECTION_NAME="$(gcloud sql instances describe "$SQL_INSTANCE" \
  --project="$PROJECT_ID" --format='value(connectionName)')"
[[ -n "$INSTANCE_CONNECTION_NAME" ]] || {
  echo "Failed to resolve Cloud SQL connectionName for ${SQL_INSTANCE}." >&2
  exit 1
}

if ! gcloud sql databases describe "$DB_NAME" \
  --instance="$SQL_INSTANCE" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating PostgreSQL database ${DB_NAME} on ${SQL_INSTANCE}..."
  gcloud sql databases create "$DB_NAME" \
    --instance="$SQL_INSTANCE" \
    --project="$PROJECT_ID" \
    --quiet
fi

if ! gcloud secrets describe DATABASE_URL --project="$PROJECT_ID" >/dev/null 2>&1; then
  DB_PASSWORD="$(openssl rand -hex 24)"
  if gcloud sql users list --instance="$SQL_INSTANCE" --project="$PROJECT_ID" \
    --format='value(name)' | grep -Fxq "$DB_USER"; then
    gcloud sql users set-password "$DB_USER" \
      --instance="$SQL_INSTANCE" --project="$PROJECT_ID" \
      --password="$DB_PASSWORD" --quiet
  else
    gcloud sql users create "$DB_USER" \
      --instance="$SQL_INSTANCE" --project="$PROJECT_ID" \
      --password="$DB_PASSWORD" --quiet
  fi

  db_url="postgresql://${DB_USER}:${DB_PASSWORD}@localhost/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"
  printf '%s' "$db_url" | gcloud secrets create DATABASE_URL \
    --project="$PROJECT_ID" --replication-policy=automatic --data-file=- --quiet
  unset DB_PASSWORD db_url
fi

if ! gcloud secrets describe JWT_SECRET --project="$PROJECT_ID" >/dev/null 2>&1; then
  jwt_secret="$(openssl rand -hex 32)"
  printf '%s' "$jwt_secret" | gcloud secrets create JWT_SECRET \
    --project="$PROJECT_ID" --replication-policy=automatic --data-file=- --quiet
  unset jwt_secret
fi

if ! gcloud secrets describe DEMO_USER_PASSWORD --project="$PROJECT_ID" >/dev/null 2>&1; then
  demo_pw="${DEMO_USER_PASSWORD:-}"
  if [[ -z "${demo_pw// }" ]] || [[ "$demo_pw" == replace-with-* ]]; then
    echo 'DEMO_USER_PASSWORD must be set to a non-placeholder password when creating the DEMO_USER_PASSWORD secret for the first time.' >&2
    exit 1
  fi
  printf '%s' "$demo_pw" | gcloud secrets create DEMO_USER_PASSWORD \
    --project="$PROJECT_ID" --replication-policy=automatic --data-file=- --quiet
  unset demo_pw
fi

if ! gcloud iam service-accounts describe "$runtime_sa_email" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating runtime service account ${runtime_sa_email}..."
  gcloud iam service-accounts create "$RUNTIME_SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="EquipFlow Cloud Run Runtime SA" \
    --quiet
fi

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${runtime_sa_email}" \
  --role="roles/cloudsql.client" \
  --condition=None \
  --quiet >/dev/null

for secret_name in DATABASE_URL JWT_SECRET DEMO_USER_PASSWORD; do
  gcloud secrets add-iam-policy-binding "$secret_name" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:${runtime_sa_email}" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet >/dev/null
done

if [[ "$BUILD_METHOD" == cloudbuild ]]; then
  project_number="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
  if [[ -n "$project_number" ]]; then
    for build_sa in \
      "${project_number}-compute@developer.gserviceaccount.com" \
      "${project_number}@cloudbuild.gserviceaccount.com"; do
      if gcloud iam service-accounts describe "$build_sa" \
        --project="$PROJECT_ID" >/dev/null 2>&1; then
        gcloud artifacts repositories add-iam-policy-binding "$AR_REPOSITORY" \
          --location="$REGION" \
          --project="$PROJECT_ID" \
          --member="serviceAccount:${build_sa}" \
          --role="roles/artifactregistry.writer" \
          --quiet >/dev/null
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
          --member="serviceAccount:${build_sa}" \
          --role="roles/logging.logWriter" \
          --condition=None \
          --quiet >/dev/null
        gcloud projects add-iam-policy-binding "$PROJECT_ID" \
          --member="serviceAccount:${build_sa}" \
          --role="roles/storage.objectViewer" \
          --condition=None \
          --quiet >/dev/null
      fi
    done
  fi

  echo "Building and pushing commit-SHA images (${IMAGE_TAG}) via Google Cloud Build..."
  gcloud builds submit "$repo_root" \
    --project="$PROJECT_ID" \
    --region="$REGION" \
    --config="$repo_root/deploy/cloudbuild.yaml" \
    --substitutions="_IMAGE_BASE=${image_base},_IMAGE_TAG=${IMAGE_TAG}" \
    --quiet
else
  echo "Building and pushing commit-SHA images (${IMAGE_TAG}) for linux/amd64..."
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
  docker build --platform linux/amd64 --tag "${image_base}:${IMAGE_TAG}" "$repo_root"
  docker build --platform linux/amd64 --target db-tools --tag "${image_base}:${IMAGE_TAG}-db-tools" "$repo_root"
  docker push "${image_base}:${IMAGE_TAG}"
  docker push "${image_base}:${IMAGE_TAG}-db-tools"
fi

resolve_digest() {
  local image_ref="$1"
  local digest
  digest="$(gcloud artifacts docker images describe "$image_ref" \
    --project="$PROJECT_ID" \
    --format='value(image_summary.fully_qualified_digest)')"
  [[ "$digest" == "$image_base@sha256:"* ]] || {
    echo "Could not resolve ${image_ref} to an Artifact Registry SHA-256 digest." >&2
    return 1
  }
  printf '%s' "$digest"
}

runtime_digest="$(resolve_digest "${image_base}:${IMAGE_TAG}")"
migration_digest="$(resolve_digest "${image_base}:${IMAGE_TAG}-db-tools")"

job_action="create"
if gcloud run jobs describe "$CLOUD_RUN_MIGRATION_JOB" \
  --project="$PROJECT_ID" --region="$REGION" >/dev/null 2>&1; then
  job_action="update"
fi

echo "Configuring Cloud Run migration job ${CLOUD_RUN_MIGRATION_JOB} (${job_action})..."
gcloud run jobs "$job_action" "$CLOUD_RUN_MIGRATION_JOB" \
  --image="$migration_digest" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --service-account="$runtime_sa_email" \
  --set-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,DEMO_USER_PASSWORD=DEMO_USER_PASSWORD:latest" \
  --command=npm \
  --args="run,db:migrate" \
  --max-retries=0 \
  --task-timeout=5m \
  --quiet

echo "Executing database migration job before service rollout..."
gcloud run jobs execute "$CLOUD_RUN_MIGRATION_JOB" \
  --wait --project="$PROJECT_ID" --region="$REGION" --quiet

if [[ "$RUN_INITIAL_SEED" == true ]]; then
  echo "Executing one-time production database seed..."
  gcloud run jobs execute "$CLOUD_RUN_MIGRATION_JOB" \
    --args="run,db:seed" \
    --wait --project="$PROJECT_ID" --region="$REGION" --quiet
fi

echo "Deploying Cloud Run service ${CLOUD_RUN_SERVICE} by immutable digest..."
gcloud run deploy "$CLOUD_RUN_SERVICE" \
  --image="$runtime_digest" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$runtime_sa_email" \
  --add-cloudsql-instances="$INSTANCE_CONNECTION_NAME" \
  --set-env-vars="NODE_ENV=production,HOST=0.0.0.0" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest" \
  --port=8080 \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi \
  --cpu=1 \
  --allow-unauthenticated \
  --quiet

service_url="$(gcloud run services describe "$CLOUD_RUN_SERVICE" \
  --project="$PROJECT_ID" --region="$REGION" --format='value(status.url)')"
latest_revision="$(gcloud run services describe "$CLOUD_RUN_SERVICE" \
  --project="$PROJECT_ID" --region="$REGION" --format='value(status.latestReadyRevisionName)')"
[[ "$service_url" == https://* ]] || {
  echo 'Cloud Run did not return an HTTPS service URL.' >&2
  exit 1
}

python3 "$repo_root/deploy/smoke_test.py" "$service_url"

echo "=== EquipFlow First-Deploy Evidence (C-04) ==="
echo "IMAGE_TAG=$IMAGE_TAG"
echo "RUNTIME_DIGEST=$runtime_digest"
echo "MIGRATION_DIGEST=$migration_digest"
echo "SERVICE_URL=$service_url"
echo "LATEST_REVISION=$latest_revision"
