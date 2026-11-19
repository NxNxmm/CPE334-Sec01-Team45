#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cat > "$tmp_dir/gcloud" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GCLOUD_LOG"

if [[ "$*" == *"services enable"* || "$*" == *"add-iam-policy-binding"* ]]; then
  exit 0
fi

if [[ "$*" == *"iam service-accounts describe"* ]]; then
  exit 1
elif [[ "$*" == *"iam workload-identity-pools providers describe"* ]]; then
  if [[ "$*" == *"--format=value(name)"* ]]; then
    printf '%s\n' "projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
    exit 0
  fi
  exit 1
elif [[ "$*" == *"iam workload-identity-pools describe"* ]]; then
  if [[ "$*" == *"--format=value(name)"* ]]; then
    printf '%s\n' "projects/906022478800/locations/global/workloadIdentityPools/github-pool"
    exit 0
  fi
  exit 1
fi
STUB
chmod +x "$tmp_dir/gcloud"

export PATH="$tmp_dir:$PATH"
export GCLOUD_LOG="$tmp_dir/gcloud.log"

# 1. Reject invalid GITHUB_REPOSITORY format
if GITHUB_REPOSITORY="invalid-repo-format" bash "$repo_root/deploy/setup-wif.sh" > /dev/null 2>&1; then
  echo 'Expected invalid GITHUB_REPOSITORY format to be rejected.' >&2
  exit 1
fi

# 2. Keyless WIF & least-privilege deployer provisioning succeeds
: > "$GCLOUD_LOG"
output="$(bash "$repo_root/deploy/setup-wif.sh")"

# Never create downloaded service-account JSON keys
if grep -q 'keys create' "$GCLOUD_LOG"; then
  echo 'setup-wif.sh must never invoke service-account key creation.' >&2
  exit 1
fi

# Verify deployer SA creation and least-privilege IAM roles
grep -q -- "iam service-accounts create equipflow-deployer --project=cpe334-team45" "$GCLOUD_LOG"
grep -q -- "artifacts repositories add-iam-policy-binding equipflow --location=asia-southeast1 --project=cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/artifactregistry.writer" "$GCLOUD_LOG"
grep -q -- "projects add-iam-policy-binding cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/run.developer" "$GCLOUD_LOG"
grep -q -- "iam service-accounts add-iam-policy-binding equipflow-runner@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/iam.serviceAccountUser" "$GCLOUD_LOG"

# Verify WIF pool, OIDC provider repo restriction, and workloadIdentityUser binding
grep -q -- "iam workload-identity-pools create github-pool --project=cpe334-team45 --location=global" "$GCLOUD_LOG"
grep -q -- "iam workload-identity-pools providers create-oidc github-provider" "$GCLOUD_LOG"
grep -q -- "--issuer-uri=https://token.actions.githubusercontent.com" "$GCLOUD_LOG"
grep -q -- "--attribute-condition=assertion.repository == 'NxNxmm/CPE334-Sec01-Team45'" "$GCLOUD_LOG"
grep -q -- "iam service-accounts add-iam-policy-binding equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45 --role=roles/iam.workloadIdentityUser --member=principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository/NxNxmm/CPE334-Sec01-Team45" "$GCLOUD_LOG"

# Verify all 8 demo GitHub Environment variables are printed
for expected_line in \
  "GCP_PROJECT_ID=cpe334-team45" \
  "GCP_REGION=asia-southeast1" \
  "WIF_PROVIDER=projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider" \
  "WIF_SERVICE_ACCOUNT=equipflow-deployer@cpe334-team45.iam.gserviceaccount.com" \
  "AR_REPOSITORY=equipflow" \
  "AR_IMAGE=app" \
  "CLOUD_RUN_SERVICE=equipflow" \
  "CLOUD_RUN_MIGRATION_JOB=equipflow-migrate"; do
  printf '%s\n' "$output" | grep -Fxq -- "$expected_line"
done

echo 'PASS deploy/setup-wif.sh configures keyless GitHub OIDC WIF, least-privilege IAM roles, and outputs all 8 demo environment variables.'
