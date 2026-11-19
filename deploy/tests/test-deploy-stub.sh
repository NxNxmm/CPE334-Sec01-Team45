#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cat > "$tmp_dir/gcloud" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GCLOUD_LOG"

if [[ "$*" == *"services enable"* || "$*" == *"auth configure-docker"* || "$*" == *"add-iam-policy-binding"* ]]; then
  exit 0
fi

if [[ "$*" == *"artifacts repositories describe"* ]]; then
  exit 1
elif [[ "$*" == *"sql instances describe"* ]]; then
  if [[ "$*" == *"connectionName"* ]]; then
    printf '%s\n' "cpe334-team45:asia-southeast1:equipflow-pg"
    exit 0
  fi
  exit 1
elif [[ "$*" == *"sql databases describe"* ]]; then
  exit 1
elif [[ "$*" == *"sql users list"* ]]; then
  exit 0
elif [[ "$*" == *"secrets describe"* ]]; then
  if [[ "${STUB_DEMO_SECRET_EXISTS:-}" == "true" && "$*" == *"secrets describe DEMO_USER_PASSWORD"* ]]; then
    exit 0
  fi
  exit 1
elif [[ "$*" == *"secrets create DATABASE_URL"* ]]; then
  cat > "$SECRET_DB_URL_FILE"
  exit 0
elif [[ "$*" == *"secrets create"* ]]; then
  cat > /dev/null
  exit 0
elif [[ "$*" == *"iam service-accounts describe"* ]]; then
  exit 1
elif [[ "$*" == *"artifacts docker images describe"* ]]; then
  if [[ "$*" == *"-db-tools"* ]]; then
    printf '%s\n' "$EXPECTED_MIGRATION_DIGEST"
  else
    printf '%s\n' "$EXPECTED_RUNTIME_DIGEST"
  fi
  exit 0
elif [[ "$*" == *"run jobs describe"* ]]; then
  exit 1
elif [[ "${FAKE_GCLOUD_FAIL:-}" == "jobs_execute" && "$*" == *"run jobs execute"* ]]; then
  exit 9
elif [[ "$*" == *"run services describe"* ]]; then
  if [[ "$*" == *"status.url"* ]]; then
    printf '%s\n' "https://equipflow-stub-as.a.run.app"
  elif [[ "$*" == *"latestReadyRevisionName"* ]]; then
    printf '%s\n' "equipflow-00001-abc"
  fi
  exit 0
fi
STUB
chmod +x "$tmp_dir/gcloud"

cat > "$tmp_dir/docker" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$DOCKER_LOG"
STUB
chmod +x "$tmp_dir/docker"

cat > "$tmp_dir/openssl" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "rand" ]]; then
  printf '%s\n' "0123456789abcdef0123456789abcdef0123456789abcdef"
fi
STUB
chmod +x "$tmp_dir/openssl"

cat > "$tmp_dir/python3" <<'STUB'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$PYTHON_LOG"
STUB
chmod +x "$tmp_dir/python3"

export PATH="$tmp_dir:$PATH"
export GCLOUD_LOG="$tmp_dir/gcloud.log"
export DOCKER_LOG="$tmp_dir/docker.log"
export PYTHON_LOG="$tmp_dir/python.log"
export SECRET_DB_URL_FILE="$tmp_dir/database_url_secret.txt"
export EXPECTED_RUNTIME_DIGEST="asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
export EXPECTED_MIGRATION_DIGEST="asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
export IMAGE_TAG="0123456789abcdef0123456789abcdef01234567"

# 1. Reject missing or placeholder DEMO_USER_PASSWORD when creating secret for the first time
if DEMO_USER_PASSWORD="" bash "$repo_root/deploy/deploy.sh" > /dev/null 2>&1; then
  echo 'Expected empty DEMO_USER_PASSWORD to be rejected.' >&2
  exit 1
fi
if DEMO_USER_PASSWORD="replace-with-a-seed-password" bash "$repo_root/deploy/deploy.sh" > /dev/null 2>&1; then
  echo 'Expected placeholder DEMO_USER_PASSWORD to be rejected.' >&2
  exit 1
fi

# 2. Clean first-deploy simulation succeeds end-to-end
: > "$GCLOUD_LOG"
: > "$DOCKER_LOG"
: > "$PYTHON_LOG"
DEMO_USER_PASSWORD="StubStrongPassword!2026" bash "$repo_root/deploy/deploy.sh" > "$tmp_dir/deploy.log"

# Ensure no secret material was printed to stdout
if grep -qE "0123456789abcdef0123456789abcdef0123456789abcdef|StubStrongPassword!2026" "$tmp_dir/deploy.log"; then
  echo 'Secret value leaked into deploy.sh stdout.' >&2
  exit 1
fi

# Verify DATABASE_URL secret uses Cloud SQL Unix socket path
db_secret_val="$(cat "$SECRET_DB_URL_FILE")"
[[ "$db_secret_val" == *"?host=/cloudsql/cpe334-team45:asia-southeast1:equipflow-pg" ]]

# Verify linux/amd64 builds and pushes for both runtime and db-tools targets
grep -q -- "build --platform linux/amd64 --tag asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app:${IMAGE_TAG}" "$DOCKER_LOG"
grep -q -- "build --platform linux/amd64 --target db-tools --tag asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app:${IMAGE_TAG}-db-tools" "$DOCKER_LOG"
grep -q -- "push asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app:${IMAGE_TAG}" "$DOCKER_LOG"
grep -q -- "push asia-southeast1-docker.pkg.dev/cpe334-team45/equipflow/app:${IMAGE_TAG}-db-tools" "$DOCKER_LOG"

# Verify migration job configuration uses db-tools digest and npm run db:migrate
grep -q -- "run jobs create equipflow-migrate --image=${EXPECTED_MIGRATION_DIGEST}" "$GCLOUD_LOG"
grep -q -- "--command=npm --args=run,db:migrate" "$GCLOUD_LOG"

# Verify migration + initial seed execute before Cloud Run service rollout
migrate_line="$(grep -n 'run jobs execute equipflow-migrate --wait' "$GCLOUD_LOG" | head -1 | cut -d: -f1)"
seed_line="$(grep -n 'run jobs execute equipflow-migrate --args=run,db:seed' "$GCLOUD_LOG" | head -1 | cut -d: -f1)"
deploy_line="$(grep -n "run deploy equipflow --image=${EXPECTED_RUNTIME_DIGEST}" "$GCLOUD_LOG" | head -1 | cut -d: -f1)"
[[ "$migrate_line" -lt "$seed_line" ]]
[[ "$seed_line" -lt "$deploy_line" ]]

# Verify smoke test ran against HTTPS Cloud Run service URL
grep -q -- "deploy/smoke_test.py https://equipflow-stub-as.a.run.app" "$PYTHON_LOG"

# 3. Migration failure aborts before Cloud Run service deploy
: > "$GCLOUD_LOG"
if FAKE_GCLOUD_FAIL=jobs_execute STUB_DEMO_SECRET_EXISTS=true DEMO_USER_PASSWORD="" bash "$repo_root/deploy/deploy.sh" > /dev/null 2>&1; then
  echo 'Expected migration failure to abort deploy.sh.' >&2
  exit 1
fi
if grep -q 'run deploy equipflow' "$GCLOUD_LOG"; then
  echo 'Cloud Run deploy executed after migration failure.' >&2
  exit 1
fi

# 4. teardown.sh refuses to run without --confirm-teardown
if bash "$repo_root/deploy/teardown.sh" > /dev/null 2>&1; then
  echo 'Expected teardown.sh without --confirm-teardown to fail.' >&2
  exit 1
fi

echo 'PASS deploy/deploy.sh provisions Cloud SQL/AR/Secrets/SA, migrates & seeds before immutable-digest rollout, aborts on migration failure, and guards teardown.'
