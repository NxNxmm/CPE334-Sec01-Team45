#!/usr/bin/env bash
set -euo pipefail

: "${PROJECT_ID:?Set PROJECT_ID from the demo GitHub Environment}"
: "${REGION:?Set REGION from the demo GitHub Environment}"
: "${AR_REPOSITORY:?Set AR_REPOSITORY from the demo GitHub Environment}"
: "${AR_IMAGE:?Set AR_IMAGE from the demo GitHub Environment}"
: "${CLOUD_RUN_SERVICE:?Set CLOUD_RUN_SERVICE from the demo GitHub Environment}"
: "${CLOUD_RUN_MIGRATION_JOB:?Set CLOUD_RUN_MIGRATION_JOB from the demo GitHub Environment}"
: "${IMAGE_TAG:?Set IMAGE_TAG to the full source commit SHA}"

ROLLBACK="${ROLLBACK:-false}"
[[ "$IMAGE_TAG" =~ ^[0-9a-f]{40}$ ]] || { echo 'IMAGE_TAG must be a full 40-character commit SHA.' >&2; exit 1; }
[[ "$ROLLBACK" == true || "$ROLLBACK" == false ]] || { echo 'ROLLBACK must be true or false.' >&2; exit 1; }

image_base="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPOSITORY}/${AR_IMAGE}"
resolve_digest() {
  local image_tag="$1"
  local digest
  digest="$(gcloud artifacts docker images describe "$image_tag" \
    --project="$PROJECT_ID" \
    --format='value(image_summary.fully_qualified_digest)')"
  [[ "$digest" == "$image_base@sha256:"* ]] || {
    echo 'Could not resolve the requested image tag to an Artifact Registry SHA-256 digest.' >&2
    return 1
  }
  printf '%s' "$digest"
}

deployed_image="$(resolve_digest "${image_base}:${IMAGE_TAG}")"
migration_image=""
if [[ "$ROLLBACK" == false ]]; then
  # Prisma CLI is a development dependency, so migrations use the dedicated
  # db-tools image target instead of the pruned production runtime image.
  migration_image="$(resolve_digest "${image_base}:${IMAGE_TAG}-db-tools")"
fi

if [[ -z "$deployed_image" ]]; then
  echo 'Runtime image digest is empty.' >&2
  exit 1
fi

if [[ "$ROLLBACK" == false ]]; then
  # The migration job is preconfigured by the first-deploy task to use the
  # Cloud SQL connection and DATABASE_URL secret. Failures stop before rollout.
  gcloud run jobs update "$CLOUD_RUN_MIGRATION_JOB" \
    --image="$migration_image" --project="$PROJECT_ID" --region="$REGION" --quiet
  gcloud run jobs execute "$CLOUD_RUN_MIGRATION_JOB" \
    --wait --project="$PROJECT_ID" --region="$REGION" --quiet
else
  echo 'Rollback requested: migration is skipped; the existing image is reused.'
fi

gcloud run services update "$CLOUD_RUN_SERVICE" \
  --image="$deployed_image" --project="$PROJECT_ID" --region="$REGION" --quiet
gcloud run services update-traffic "$CLOUD_RUN_SERVICE" \
  --to-latest --project="$PROJECT_ID" --region="$REGION" --quiet

service_url="$(gcloud run services describe "$CLOUD_RUN_SERVICE" \
  --project="$PROJECT_ID" --region="$REGION" --format='value(status.url)')"
[[ "$service_url" == https://* ]] || { echo 'Cloud Run did not return an HTTPS service URL.' >&2; exit 1; }

echo "Service URL: $service_url"
echo "Runtime image digest: $deployed_image"
if [[ -n "${GITHUB_ENV:-}" ]]; then
  printf 'SERVICE_URL=%s\nDEPLOYED_IMAGE=%s\n' "$service_url" "$deployed_image" >> "$GITHUB_ENV"
  if [[ -n "$migration_image" ]]; then
    printf 'MIGRATION_IMAGE=%s\n' "$migration_image" >> "$GITHUB_ENV"
  fi
fi
