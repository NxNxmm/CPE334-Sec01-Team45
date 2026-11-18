#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cat > "$tmp_dir/gcloud" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GCLOUD_LOG"
if [[ "${FAKE_GCLOUD_FAIL:-}" == jobs_execute && "$*" == *"run jobs execute"* ]]; then
  exit 9
fi
if [[ "$*" == *"artifacts docker images describe"* ]]; then
  if [[ "$*" == *"-db-tools"* ]]; then
    printf '%s\n' "$EXPECTED_MIGRATION_DIGEST"
  else
    printf '%s\n' "$EXPECTED_DIGEST"
  fi
elif [[ "$*" == *"run services describe"* ]]; then
  printf '%s\n' "https://equipflow-abc-uc.a.run.app"
fi
STUB
chmod +x "$tmp_dir/gcloud"

export PATH="$tmp_dir:$PATH"
export GCLOUD_LOG="$tmp_dir/gcloud.log"
export EXPECTED_DIGEST="us-central1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:0123456789abcdef"
export EXPECTED_MIGRATION_DIGEST="us-central1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:fedcba9876543210"
export PROJECT_ID="cpe334-team45"
export REGION="us-central1"
export AR_REPOSITORY="equipflow"
export AR_IMAGE="app"
export CLOUD_RUN_SERVICE="equipflow"
export CLOUD_RUN_MIGRATION_JOB="equipflow-migrate"
export IMAGE_TAG="0123456789abcdef0123456789abcdef01234567"
export ROLLBACK="false"
export GITHUB_ENV="$tmp_dir/github-env"

bash "$repo_root/deploy/release.sh" > "$tmp_dir/success.log"
grep -q -- "--image=$EXPECTED_MIGRATION_DIGEST" "$GCLOUD_LOG"
grep -q -- "--image=$EXPECTED_DIGEST" "$GCLOUD_LOG"
migration_line="$(grep -n 'run jobs execute' "$GCLOUD_LOG" | cut -d: -f1)"
service_update_line="$(grep -n 'run services update equipflow' "$GCLOUD_LOG" | cut -d: -f1)"
[[ "$migration_line" -lt "$service_update_line" ]]
grep -q '^SERVICE_URL=https://equipflow-abc-uc.a.run.app$' "$GITHUB_ENV"
grep -q "^DEPLOYED_IMAGE=$EXPECTED_DIGEST$" "$GITHUB_ENV"

if FAKE_GCLOUD_FAIL=jobs_execute bash "$repo_root/deploy/release.sh" > /dev/null 2>&1; then
  echo 'Expected migration failure to stop deployment.' >&2
  exit 1
fi
if tail -n 3 "$GCLOUD_LOG" | grep -q 'run services update'; then
  echo 'Service rollout ran after the simulated migration failure.' >&2
  exit 1
fi

echo 'PASS release script resolves both digests, migrates with db-tools before runtime rollout, and stops rollout on migration failure.'
