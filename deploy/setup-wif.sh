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
DEPLOY_REF="${DEPLOY_REF:-refs/heads/main}"
DEPLOY_ENVIRONMENT="${DEPLOY_ENVIRONMENT:-demo}"
DEPLOY_WORKFLOW_PATH="${DEPLOY_WORKFLOW_PATH:-.github/workflows/deploy.yml}"

[[ "$GITHUB_REPOSITORY" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || {
  echo 'GITHUB_REPOSITORY must be in owner/repo format.' >&2
  exit 1
}

resolve_python() {
  for candidate in "${PYTHON_BIN:-}" python3 python; do
    if [[ -n "$candidate" ]] && "$candidate" -c 'import json, sys' >/dev/null 2>&1; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  echo 'A working python3 or python interpreter is required.' >&2
  return 1
}

PYTHON_EXE="$(resolve_python)"

DEPLOY_WORKFLOW_REF="${GITHUB_REPOSITORY}/${DEPLOY_WORKFLOW_PATH}@${DEPLOY_REF}"
EXPECTED_ISSUER_URI="https://token.actions.githubusercontent.com"
EXPECTED_ATTRIBUTE_MAPPING="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_id=assertion.repository_id,attribute.ref=assertion.ref,attribute.environment=assertion.environment,attribute.workflow_ref=assertion.workflow_ref"

build_attribute_condition() {
  local repo_id="$1"
  printf "assertion.repository == '%s' && assertion.repository_id == '%s' && assertion.ref == '%s' && assertion.environment == '%s' && assertion.workflow_ref == '%s'" \
    "$GITHUB_REPOSITORY" "$repo_id" "$DEPLOY_REF" "$DEPLOY_ENVIRONMENT" "$DEPLOY_WORKFLOW_REF"
}

if [[ "${1:-}" == "--evaluate-claims" ]]; then
  claims_json="${2:-}"
  [[ -n "$claims_json" ]] || {
    echo 'Usage: setup-wif.sh --evaluate-claims <json>' >&2
    exit 1
  }
  [[ "${GITHUB_REPOSITORY_ID:-}" =~ ^[0-9]+$ ]] || {
    echo 'GITHUB_REPOSITORY_ID must be a numeric GitHub repository ID.' >&2
    exit 1
  }
  expected_condition="$(build_attribute_condition "$GITHUB_REPOSITORY_ID")"
  CLAIMS_JSON="$claims_json" \
  EXPECTED_ATTRIBUTE_MAPPING="$EXPECTED_ATTRIBUTE_MAPPING" \
  EXPECTED_REPOSITORY="$GITHUB_REPOSITORY" \
  EXPECTED_REPOSITORY_ID="$GITHUB_REPOSITORY_ID" \
  EXPECTED_REF="$DEPLOY_REF" \
  EXPECTED_ENVIRONMENT="$DEPLOY_ENVIRONMENT" \
  EXPECTED_WORKFLOW_REF="$DEPLOY_WORKFLOW_REF" \
  EXPECTED_CONDITION="$expected_condition" \
  "$PYTHON_EXE" - <<'PY'
import json
import os
import sys

claims = json.loads(os.environ["CLAIMS_JSON"])
expected_mapping = dict(
    pair.split("=", 1)
    for pair in os.environ["EXPECTED_ATTRIBUTE_MAPPING"].split(",")
)

missing_mapped = []
for target, expr in expected_mapping.items():
    if expr.startswith("assertion."):
        claim_key = expr.split(".", 1)[1]
        if claim_key not in claims or claims[claim_key] is None:
            missing_mapped.append(f"{target}<-{claim_key}")

checks = [
    ("repository", claims.get("repository") == os.environ["EXPECTED_REPOSITORY"]),
    ("repository_id", claims.get("repository_id") == os.environ["EXPECTED_REPOSITORY_ID"]),
    ("ref", claims.get("ref") == os.environ["EXPECTED_REF"]),
    ("environment", claims.get("environment") == os.environ["EXPECTED_ENVIRONMENT"]),
    ("workflow_ref", claims.get("workflow_ref") == os.environ["EXPECTED_WORKFLOW_REF"]),
]
failed = missing_mapped + [name for name, ok in checks if not ok]
if failed:
    print(f"REJECTED: WIF claims failed policy check for: {', '.join(failed)}", file=sys.stderr)
    sys.exit(1)
print("ACCEPTED: WIF claims satisfy strict deployment policy.")
PY
  exit 0
fi

if [[ -z "${GITHUB_REPOSITORY_ID:-}" ]]; then
  repo_json="$(curl -fsSL "https://api.github.com/repos/${GITHUB_REPOSITORY}")"
  GITHUB_REPOSITORY_ID="$(printf '%s' "$repo_json" | "$PYTHON_EXE" -c 'import json,sys; data=json.load(sys.stdin); print(data["id"])')"
fi

[[ "${GITHUB_REPOSITORY_ID:-}" =~ ^[0-9]+$ ]] || {
  echo 'GITHUB_REPOSITORY_ID must be a numeric GitHub repository ID (set GITHUB_REPOSITORY_ID or allow GitHub API lookup).' >&2
  exit 1
}

EXPECTED_ATTRIBUTE_CONDITION="$(build_attribute_condition "$GITHUB_REPOSITORY_ID")"

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
    --issuer-uri="$EXPECTED_ISSUER_URI" \
    --attribute-mapping="$EXPECTED_ATTRIBUTE_MAPPING" \
    --attribute-condition="$EXPECTED_ATTRIBUTE_CONDITION" \
    --quiet
else
  echo "Updating existing OIDC Workload Identity Provider ${WIF_PROVIDER_NAME}..."
  if [[ "${WIF_SKIP_PROVIDER_UPDATE:-false}" != "true" ]]; then
    gcloud iam workload-identity-pools providers update-oidc "$WIF_PROVIDER_NAME" \
      --project="$PROJECT_ID" \
      --location="global" \
      --workload-identity-pool="$WIF_POOL_NAME" \
      --display-name="GitHub Actions Provider" \
      --issuer-uri="$EXPECTED_ISSUER_URI" \
      --attribute-mapping="$EXPECTED_ATTRIBUTE_MAPPING" \
      --attribute-condition="$EXPECTED_ATTRIBUTE_CONDITION" \
      --quiet
  fi
fi

provider_json="$(gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER_NAME" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$WIF_POOL_NAME" --format=json)"

PROVIDER_JSON="$provider_json" \
EXPECTED_ISSUER_URI="$EXPECTED_ISSUER_URI" \
EXPECTED_ATTRIBUTE_MAPPING="$EXPECTED_ATTRIBUTE_MAPPING" \
EXPECTED_ATTRIBUTE_CONDITION="$EXPECTED_ATTRIBUTE_CONDITION" \
"$PYTHON_EXE" - <<'PY'
import json
import os
import sys

provider = json.loads(os.environ["PROVIDER_JSON"])
expected_issuer = os.environ["EXPECTED_ISSUER_URI"]
expected_mapping = dict(pair.split("=", 1) for pair in os.environ["EXPECTED_ATTRIBUTE_MAPPING"].split(","))
expected_condition = os.environ["EXPECTED_ATTRIBUTE_CONDITION"]

actual_issuer = (provider.get("oidc") or {}).get("issuerUri")
actual_mapping = provider.get("attributeMapping") or {}
actual_condition = provider.get("attributeCondition") or ""

errors = []
if actual_issuer != expected_issuer:
    errors.append(f"issuerUri mismatch: expected {expected_issuer!r}, got {actual_issuer!r}")
if actual_mapping != expected_mapping:
    errors.append(f"attributeMapping mismatch: expected {expected_mapping!r}, got {actual_mapping!r}")
if actual_condition != expected_condition:
    errors.append(f"attributeCondition mismatch: expected {expected_condition!r}, got {actual_condition!r}")

if errors:
    for err in errors:
        print(f"ERROR: WIF provider verification failed: {err}", file=sys.stderr)
    sys.exit(1)
PY

echo "Removing legacy repository-name WIF binding if present..."
gcloud iam service-accounts remove-iam-policy-binding "$deployer_sa_email" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${pool_id}/attribute.repository/${GITHUB_REPOSITORY}" \
  --quiet >/dev/null 2>&1 || true

echo "Binding immutable repository_id ${GITHUB_REPOSITORY_ID} (${GITHUB_REPOSITORY}) to ${deployer_sa_email}..."
gcloud iam service-accounts add-iam-policy-binding "$deployer_sa_email" \
  --project="$PROJECT_ID" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${pool_id}/attribute.repository_id/${GITHUB_REPOSITORY_ID}" \
  --quiet >/dev/null

provider_name="$(gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER_NAME" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="$WIF_POOL_NAME" --format='value(name)')"
[[ "$provider_name" == projects/*/locations/global/workloadIdentityPools/*/providers/* ]] || {
  echo "Failed to resolve Workload Identity Provider resource name for ${WIF_PROVIDER_NAME}." >&2
  exit 1
}

echo ""
echo "=== GitHub Environment 'demo' Variables (Settings -> Environments -> demo) ==="
echo "GITHUB_REPOSITORY_ID=${GITHUB_REPOSITORY_ID}"
echo "GCP_PROJECT_ID=${PROJECT_ID}"
echo "GCP_REGION=${REGION}"
echo "WIF_PROVIDER=${provider_name}"
echo "WIF_SERVICE_ACCOUNT=${deployer_sa_email}"
echo "AR_REPOSITORY=${AR_REPOSITORY}"
echo "AR_IMAGE=${AR_IMAGE}"
echo "CLOUD_RUN_SERVICE=${CLOUD_RUN_SERVICE}"
echo "CLOUD_RUN_MIGRATION_JOB=${CLOUD_RUN_MIGRATION_JOB}"
