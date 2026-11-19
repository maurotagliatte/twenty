#!/usr/bin/env bash
set -euo pipefail

# Cold backup of a Twenty stack on the Coolify host.
# Usage: DB_CONTAINER=<db> SERVER_CONTAINER=<server> WORKER_CONTAINER=<worker> \
#        STORAGE_VOLUME=<volume> OUT_DIR=/root/twenty-backups ./backup.sh

: "${DB_CONTAINER:?}"
: "${SERVER_CONTAINER:?}"
: "${WORKER_CONTAINER:?}"
: "${STORAGE_VOLUME:?}"
OUT_DIR="${OUT_DIR:-/root/twenty-backups}"

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
target="${OUT_DIR}/${stamp}"
mkdir -p "${target}"

docker stop "${WORKER_CONTAINER}" "${SERVER_CONTAINER}"
trap 'docker start "${SERVER_CONTAINER}" "${WORKER_CONTAINER}"' EXIT

docker exec "${DB_CONTAINER}" psql -U postgres -d default -At \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'default' AND pid <> pg_backend_pid();" \
  > "${target}/active-connections.txt"

docker exec "${DB_CONTAINER}" psql -U postgres -At -c 'SHOW server_version;' > "${target}/server-version.txt"
docker exec "${DB_CONTAINER}" pg_dump -U postgres -d default -Fc > "${target}/default.dump"
docker exec "${DB_CONTAINER}" pg_dump -U postgres -d default -Fp > "${target}/default.sql"
docker exec "${DB_CONTAINER}" pg_dumpall -U postgres --roles-only > "${target}/roles.sql"

docker run --rm -v "${STORAGE_VOLUME}:/data:ro" -v "${target}:/backup" alpine \
  tar -czf /backup/local-storage.tar.gz -C /data .

docker exec -i "${DB_CONTAINER}" psql -U postgres -d default < "$(dirname "$0")/checks.sql" \
  > "${target}/checks.txt" 2>&1 || true

(cd "${target}" && sha256sum ./* > SHA256SUMS)

echo "Backup written to ${target}. Copy it off the host before going further."
