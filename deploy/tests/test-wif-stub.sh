#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cat > "$tmp_dir/curl" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$CURL_LOG"
printf '{"id": 1098765432, "full_name": "NxNxmm/CPE334-Sec01-Team45"}\n'
STUB
chmod +x "$tmp_dir/curl"

cat > "$tmp_dir/gcloud" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GCLOUD_LOG"

if [[ "$*" == *"services enable"* || "$*" == *"add-iam-policy-binding"* || "$*" == *"remove-iam-policy-binding"* ]]; then
  exit 0
fi

if [[ "$*" == *"iam service-accounts describe"* ]]; then
  exit 1
fi

if [[ "$*" == *"iam workload-identity-pools providers create-oidc"* || "$*" == *"iam workload-identity-pools providers update-oidc"* ]]; then
  issuer=""
  mapping=""
  condition=""
  for arg in "$@"; do
    case "$arg" in
      --issuer-uri=*) issuer="${arg#--issuer-uri=}" ;;
      --attribute-mapping=*) mapping="${arg#--attribute-mapping=}" ;;
      --attribute-condition=*) condition="${arg#--attribute-condition=}" ;;
    esac
  done
  cat > "$PROVIDER_STATE_FILE" <<EOF
STATE_ISSUER=$(printf '%q' "$issuer")
STATE_MAPPING=$(printf '%q' "$mapping")
STATE_CONDITION=$(printf '%q' "$condition")
EOF
  exit 0
fi

if [[ "$*" == *"iam workload-identity-pools providers describe"* ]]; then
  if [[ "$*" == *"--format=value(name)"* ]]; then
    [[ -f "$PROVIDER_STATE_FILE" ]] || exit 1
    printf '%s\n' "projects/906022478800/locations/global/workloadIdentityPools/github-pool/providers/github-provider"
    exit 0
  fi
  if [[ "$*" == *"--format=json"* ]]; then
    [[ -f "$PROVIDER_STATE_FILE" ]] || exit 1
    source "$PROVIDER_STATE_FILE"
    STATE_ISSUER="$STATE_ISSUER" STATE_MAPPING="$STATE_MAPPING" STATE_CONDITION="$STATE_CONDITION" \
    "$PYTHON_BIN_TEST" - <<'PY'
import json
import os

mapping = dict(
    pair.split("=", 1)
    for pair in os.environ["STATE_MAPPING"].split(",")
    if "=" in pair
)
print(json.dumps({
    "oidc": {"issuerUri": os.environ["STATE_ISSUER"]},
    "attributeMapping": mapping,
    "attributeCondition": os.environ["STATE_CONDITION"],
}))
PY
    exit 0
  fi
  [[ -f "$PROVIDER_STATE_FILE" ]] && exit 0 || exit 1
fi

if [[ "$*" == *"iam workload-identity-pools describe"* ]]; then
  if [[ "$*" == *"--format=value(name)"* ]]; then
    printf '%s\n' "projects/906022478800/locations/global/workloadIdentityPools/github-pool"
    exit 0
  fi
  exit 1
fi

exit 0
STUB
chmod +x "$tmp_dir/gcloud"

PYTHON_BIN_TEST=""
for candidate in python3 python; do
  if "$candidate" -c 'import json, sys' >/dev/null 2>&1; then
    PYTHON_BIN_TEST="$candidate"
    break
  fi
done
[[ -n "$PYTHON_BIN_TEST" ]] || {
  echo 'A working python3 or python interpreter is required to run test-wif-stub.sh.' >&2
  exit 1
}

export PATH="$tmp_dir:$PATH"
export PYTHON_BIN_TEST
export GCLOUD_LOG="$tmp_dir/gcloud.log"
export CURL_LOG="$tmp_dir/curl.log"
export PROVIDER_STATE_FILE="$tmp_dir/provider_state.env"
export IAM_RETRY_SLEEP_SECONDS="0"

unset GITHUB_REPOSITORY GITHUB_REPOSITORY_ID \
  PROJECT_ID REGION AR_REPOSITORY AR_IMAGE \
  CLOUD_RUN_SERVICE CLOUD_RUN_MIGRATION_JOB \
  RUNTIME_SA_NAME DEPLOYER_SA_NAME \
  WIF_POOL_NAME WIF_PROVIDER_NAME \
  DEPLOY_REF DEPLOY_ENVIRONMENT DEPLOY_WORKFLOW_PATH \
  WIF_SKIP_PROVIDER_UPDATE

# 1. Reject invalid GITHUB_REPOSITORY format and non-numeric GITHUB_REPOSITORY_ID
if GITHUB_REPOSITORY="invalid-repo-format" bash "$repo_root/deploy/setup-wif.sh" > /dev/null 2>&1; then
  echo 'Expected invalid GITHUB_REPOSITORY format to be rejected.' >&2
  exit 1
fi
if GITHUB_REPOSITORY_ID="not-a-number" bash "$repo_root/deploy/setup-wif.sh" > /dev/null 2>&1; then
  echo 'Expected non-numeric GITHUB_REPOSITORY_ID to be rejected.' >&2
  exit 1
fi

# 2. Fresh keyless WIF provisioning resolves immutable repository_id and enforces strict policy
: > "$GCLOUD_LOG"
: > "$CURL_LOG"
rm -f "$PROVIDER_STATE_FILE"
output="$(bash "$repo_root/deploy/setup-wif.sh")"
grep -Fq -- "https://api.github.com/repos/NxNxmm/CPE334-Sec01-Team45" "$CURL_LOG"

# Never create downloaded service-account JSON keys
if grep -q 'keys create' "$GCLOUD_LOG"; then
  echo 'setup-wif.sh must never invoke service-account key creation.' >&2
  exit 1
fi

# Verify least-privilege IAM roles on deployer SA
grep -q -- "iam service-accounts create equipflow-deployer --project=cpe334-team45" "$GCLOUD_LOG"
grep -q -- "artifacts repositories add-iam-policy-binding equipflow --location=asia-southeast1 --project=cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/artifactregistry.writer" "$GCLOUD_LOG"
grep -q -- "projects add-iam-policy-binding cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/run.developer" "$GCLOUD_LOG"
grep -q -- "iam service-accounts add-iam-policy-binding equipflow-runner@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45 --member=serviceAccount:equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --role=roles/iam.serviceAccountUser" "$GCLOUD_LOG"

# Verify OIDC provider creation enforces immutable repository_id, main ref, demo environment, and deploy.yml
expected_mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref,attribute.environment=assertion.environment,attribute.job_workflow_ref=assertion.job_workflow_ref"
expected_condition="assertion.repository == 'NxNxmm/CPE334-Sec01-Team45' && assertion.repository_id == '1098765432' && assertion.ref == 'refs/heads/main' && assertion.environment == 'demo' && assertion.job_workflow_ref == 'NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main'"

grep -q -- "iam workload-identity-pools providers create-oidc github-provider" "$GCLOUD_LOG"
grep -Fq -- "--attribute-mapping=$expected_mapping" "$GCLOUD_LOG"
grep -Fq -- "--attribute-condition=$expected_condition" "$GCLOUD_LOG"

# Verify legacy attribute.repository binding cleanup and strict attribute.repository_id binding
grep -q -- "iam service-accounts remove-iam-policy-binding equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45 --role=roles/iam.workloadIdentityUser --member=principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository/NxNxmm/CPE334-Sec01-Team45" "$GCLOUD_LOG"
grep -q -- "iam service-accounts add-iam-policy-binding equipflow-deployer@cpe334-team45.iam.gserviceaccount.com --project=cpe334-team45 --role=roles/iam.workloadIdentityUser --member=principalSet://iam.googleapis.com/projects/906022478800/locations/global/workloadIdentityPools/github-pool/attribute.repository_id/1098765432" "$GCLOUD_LOG"

# Verify printed GitHub Environment variables
for expected_line in \
  "GITHUB_REPOSITORY_ID=1098765432" \
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

# 3. Existing broader/drifted provider fails closed if not updated, and converges when updated
cat > "$PROVIDER_STATE_FILE" <<'EOF'
STATE_ISSUER='https://token.actions.githubusercontent.com'
STATE_MAPPING='google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner'
STATE_CONDITION="assertion.repository == 'NxNxmm/CPE334-Sec01-Team45'"
EOF

if WIF_SKIP_PROVIDER_UPDATE=true GITHUB_REPOSITORY_ID="1098765432" bash "$repo_root/deploy/setup-wif.sh" > /dev/null 2>&1; then
  echo 'Expected existing broader WIF provider to fail closed when not updated.' >&2
  exit 1
fi

: > "$GCLOUD_LOG"
GITHUB_REPOSITORY_ID="1098765432" bash "$repo_root/deploy/setup-wif.sh" > /dev/null
grep -q -- "iam workload-identity-pools providers update-oidc github-provider" "$GCLOUD_LOG"
grep -Fq -- "--attribute-condition=$expected_condition" "$GCLOUD_LOG"

# 4. Verify claim evaluator accepts only main + demo + deploy.yml + matching repository_id
valid_claims='{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/heads/main","environment":"demo","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
GITHUB_REPOSITORY_ID="1098765432" bash "$repo_root/deploy/setup-wif.sh" --evaluate-claims "$valid_claims" > /dev/null

rejected_cases=(
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/heads/sprint-1-staging","environment":"demo","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/pull/35/merge","environment":"demo","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/heads/main","environment":"","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/heads/main","environment":"staging","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"999999999","ref":"refs/heads/main","environment":"demo","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/deploy.yml@refs/heads/main"}'
  '{"repository":"NxNxmm/CPE334-Sec01-Team45","repository_id":"1098765432","ref":"refs/heads/main","environment":"demo","job_workflow_ref":"NxNxmm/CPE334-Sec01-Team45/.github/workflows/ci-docker.yml@refs/heads/main"}'
)

for bad_claims in "${rejected_cases[@]}"; do
  if GITHUB_REPOSITORY_ID="1098765432" bash "$repo_root/deploy/setup-wif.sh" --evaluate-claims "$bad_claims" > /dev/null 2>&1; then
    echo "Expected WIF policy to reject claims: $bad_claims" >&2
    exit 1
  fi
done

echo 'PASS deploy/setup-wif.sh enforces repository_id/main/demo/deploy.yml, updates and verifies existing providers, rejects non-main and non-demo claims, and outputs all 8 demo environment variables.'
