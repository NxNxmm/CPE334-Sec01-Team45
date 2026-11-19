#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-cpe334-team45}"
REGION="${REGION:-asia-southeast1}"
AR_REPOSITORY="${AR_REPOSITORY:-equipflow}"
AR_IMAGE="${AR_IMAGE:-app}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-equipflow}"
CLOUD_RUN_MIGRATION_JOB="${CLOUD_RUN_MIGRATION_JOB:-equipflow-migrate}"
RUNTIME_SA_NAME="${RUNTIME_SA_NAME:-equipflow-runner}"
DEPLOYER_SA_NAME="${DEPLOYER_SA_NAME:-equipflow-deployer}"
WIF_POOL_NAME="${WIF_POOL_NAME:-github-pool}"
WIF_PROVIDER_NAME="${WIF_PROVIDER_NAME:-github-provider}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-NxNxmm/CPE334-Sec01-Team45}"

[[ "$GITHUB_REPOSITORY" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || {
  echo 'GITHUB_REPOSITORY must be in owner/repo format.' >&2
  exit 1
}

runtime_sa_email="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
deployer_sa_email="${DEPLOYER_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Enabling required IAM, STS, and deployment APIs on project ${PROJECT_ID}..."
gcloud services enable \
  iam.googleapis.com \
  iamcredentials.googleapis.com \
  sts.googleapis.com \
  cloudresourcemanager.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  --project="$PROJECT_ID" --quiet

if ! gcloud iam service-accounts describe "$deployer_sa_email" \
  --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo "Creating GitHub deployer service account ${deployer_sa_email}..."
  gcloud iam service-accounts create "$DEPLOYER_SA_NAME" \
    --project="$PROJECT_ID" \
    --display-name="EquipFlow GitHub Actions Deployer" \
    --quiet
fi

echo "Granting least-privilege IAM roles to ${deployer_sa_email}..."
gcloud artifacts repositories add-iam-policy-binding "$AR_REPOSITORY" \
  --location="$REGION" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${deployer_sa_email}" \
  --role="roles/artifactregistry.writer" \
  --quiet >/dev/null

for attempt in 1 2 3 4 5; do
  if gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${deployer_sa_email}" \
    --role="roles/run.developer" \
    --condition=None \
    --quiet >/dev/null 2>&1; then
    break
  fi
  if [[ "$attempt" -eq 5 ]]; then
    echo "Failed to bind roles/run.developer to ${deployer_sa_email} after 5 attempts." >&2
    exit 1
  fi
  sleep "${IAM_RETRY_SLEEP_SECONDS:-3}"
done

gcloud iam service-accounts add-iam-policy-binding "$runtime_sa_email" \
  --project="$PROJECT_ID" \
  --member="serviceAccount:${deployer_sa_email}" \
  --role="roles/iam.serviceAccountUser" \
  --quiet >/dev/null

if ! gcloud iam workload-identity-pools describe "$WIF_POOL_NAME" \
  --project="$PROJECT_ID" --location="global" >/dev/null 2>&1; then
  echo "Creating Workload Identity Pool ${WIF_POOL_NAME}..."
  gcloud iam workload-identity-pools create "$WIF_POOL_NAME" \
    --project="$PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    --quiet
fi

pool_id="$(gcloud iam workload-identity-pools describe "$WIF_POOL_NAME" \
  --project="$PROJECT_ID" --location="global" --format='value(name)')"
[[ "$pool_id" == projects/*/locations/global/workloadIdentityPools/* ]] || {
  echo "Failed to resolve Workload Identity Pool resource name for ${WIF_POOL_NAME}." >&2
  exit 1
}

if ! gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER_NAME" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$WIF_POOL_NAME" >/dev/null 2>&1; then
  echo "Creating OIDC Workload Identity Provider ${WIF_PROVIDER_NAME}..."
  gcloud iam workload-identity-pools providers create-oidc "$WIF_PROVIDER_NAME" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$WIF_POOL_NAME" \
    --display-name="GitHub Actions Provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository == '${GITHUB_REPOSITORY}'" \
    --quiet
fi

echo "Binding ${GITHUB_REPOSITORY} workload identity principal to ${deployer_sa_email}..."
gcloud iam service-accounts add-iam-policy-binding "$deployer_sa_email" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${pool_id}/attribute.repository/${GITHUB_REPOSITORY}" \
  --quiet >/dev/null

provider_name="$(gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER_NAME" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$WIF_POOL_NAME" --format='value(name)')"
[[ "$provider_name" == projects/*/locations/global/workloadIdentityPools/*/providers/* ]] || {
  echo "Failed to resolve Workload Identity Provider resource name for ${WIF_PROVIDER_NAME}." >&2
  exit 1
}

echo ""
echo "=== GitHub Environment 'demo' Variables (Settings -> Environments -> demo) ==="
echo "GCP_PROJECT_ID=${PROJECT_ID}"
echo "GCP_REGION=${REGION}"
echo "WIF_PROVIDER=${provider_name}"
echo "WIF_SERVICE_ACCOUNT=${deployer_sa_email}"
echo "AR_REPOSITORY=${AR_REPOSITORY}"
echo "AR_IMAGE=${AR_IMAGE}"
echo "CLOUD_RUN_SERVICE=${CLOUD_RUN_SERVICE}"
echo "CLOUD_RUN_MIGRATION_JOB=${CLOUD_RUN_MIGRATION_JOB}"
