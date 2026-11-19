#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" != "--confirm-teardown" ]]; then
  echo 'Refusing to delete GCP resources without explicit confirmation.' >&2
  echo 'WARNING: Keep the deployed Cloud Run service and Cloud SQL database running until Lab 5 grading concludes (R-12).' >&2
  echo "Usage: $0 --confirm-teardown" >&2
  exit 1
fi

PROJECT_ID="${PROJECT_ID:-cpe334-team45}"
REGION="${REGION:-asia-southeast1}"
AR_REPOSITORY="${AR_REPOSITORY:-equipflow}"
SQL_INSTANCE="${SQL_INSTANCE:-equipflow-pg}"
CLOUD_RUN_SERVICE="${CLOUD_RUN_SERVICE:-equipflow}"
CLOUD_RUN_MIGRATION_JOB="${CLOUD_RUN_MIGRATION_JOB:-equipflow-migrate}"
RUNTIME_SA_NAME="${RUNTIME_SA_NAME:-equipflow-runner}"
runtime_sa_email="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Deleting Cloud Run service ${CLOUD_RUN_SERVICE}..."
gcloud run services delete "$CLOUD_RUN_SERVICE" --project="$PROJECT_ID" --region="$REGION" --quiet || true

echo "Deleting Cloud Run migration job ${CLOUD_RUN_MIGRATION_JOB}..."
gcloud run jobs delete "$CLOUD_RUN_MIGRATION_JOB" --project="$PROJECT_ID" --region="$REGION" --quiet || true

echo "Deleting Cloud SQL instance ${SQL_INSTANCE}..."
gcloud sql instances delete "$SQL_INSTANCE" --project="$PROJECT_ID" --quiet || true

echo "Deleting Artifact Registry repository ${AR_REPOSITORY}..."
gcloud artifacts repositories delete "$AR_REPOSITORY" --project="$PROJECT_ID" --location="$REGION" --quiet || true

for secret_name in DATABASE_URL JWT_SECRET DEMO_USER_PASSWORD; do
  echo "Deleting secret ${secret_name}..."
  gcloud secrets delete "$secret_name" --project="$PROJECT_ID" --quiet || true
done

echo "Deleting runtime service account ${runtime_sa_email}..."
gcloud iam service-accounts delete "$runtime_sa_email" --project="$PROJECT_ID" --quiet || true

echo "Teardown completed for project ${PROJECT_ID}."
