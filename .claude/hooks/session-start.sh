#!/bin/bash
# Cloud sessions only: install dependencies, start a local Postgres with the
# schema migrated, and point guide captures at the preinstalled Chromium.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# npm ci, not npm install: install rewrites package-lock.json under some npm
# versions, which would leave every session with a dirty tree.
npm ci --no-audit --no-fund

# The Playwright version in package.json may not match the browser the
# container ships with; guides/capture/lib.mts reads CHROMIUM_PATH.
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export CHROMIUM_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
fi

# Local dev database, if the container has Postgres installed.
if command -v pg_ctlcluster >/dev/null 2>&1; then
  service postgresql start >/dev/null
  for _ in $(seq 1 20); do
    su postgres -c "pg_isready -q" && break
    sleep 1
  done
  su postgres -c "psql -q -c \"ALTER USER postgres PASSWORD 'postgres';\""
  su postgres -c "psql -lqt" | cut -d'|' -f1 | grep -qw retailer_onboarding_dev \
    || su postgres -c "createdb retailer_onboarding_dev"

  if [ ! -f .env.local ]; then
    cat > .env.local <<'ENV'
DATABASE_URL=postgres://postgres:postgres@localhost:5432/retailer_onboarding_dev
APP_URL=http://localhost:3000
ADMIN_EMAIL=you@example.com
ENV
  fi

  npm run db:migrate
fi
