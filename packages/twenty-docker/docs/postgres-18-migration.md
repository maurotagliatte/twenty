# Migrating a Coolify Postgres 16 database to Postgres 18 + pgvector

Runbook for moving an existing `docker-compose.coolify.yml` deployment from `postgres:16` to `pgvector/pgvector:0.8.7-pg18`.

PG16 data files cannot be opened by PG18, so this is a logical dump and restore, not an in-place swap. The old volume is never modified, which makes rollback a redeploy of the previous compose.

## Why the volume name changes

The official image changed its layout in 18: data now lives in `/var/lib/postgresql/18/docker` and the volume is mounted at `/var/lib/postgresql`. If the old PG16 volume were mounted at the new path, PG18 would find no cluster under `18/docker` and silently `initdb` an empty one next to the old files. Twenty's entrypoint would then see no `core` schema and initialize a blank instance. The compose therefore uses a new volume, `twenty-pgdata-pg18`, and the old `twenty-pgdata` volume stays untouched.

## 0. Before you start

- Plan a maintenance window: server and worker are stopped from step 2 until step 6.
- Note the current Twenty image tag. Deploy the PG18 compose with the **same** Twenty version first, upgrade Twenty separately afterwards.
- Find the real names on the host (Coolify prefixes them with the resource UUID):

```bash
docker ps --format '{{.Names}}\t{{.Image}}' | grep -E 'postgres|twenty'
docker volume ls | grep pgdata
```

Below, `<db16>` is the PG16 container, `<db18>` the new one, `<server>` / `<worker>` the app containers. Read the DB password from Coolify's `SERVICE_PASSWORD_POSTGRES`; do not paste it into shell history, `docker exec` uses the local socket and does not need it.

## 1. Check free disk

```bash
docker exec <db16> psql -U postgres -d default -Atc "SELECT pg_size_pretty(pg_database_size('default'))"
df -h /var/lib/docker
```

Keep at least 3x the database size free (dump + new cluster + old volume).

## 2. Stop writers

Stop `server` and `worker` from Coolify (or `docker stop <server> <worker>`). Leave `db` and `redis` running.

```bash
docker exec <db16> psql -U postgres -d default -Atc \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'default' AND pid <> pg_backend_pid()"
```

Expect `0`.

## 3. Dump from 16

```bash
mkdir -p /root/twenty-pg-migration && cd /root/twenty-pg-migration
docker exec <db16> pg_dump -U postgres -d default -Fc -Z 6 -f /tmp/default.dump
docker cp <db16>:/tmp/default.dump ./default.dump
docker exec <db16> pg_dumpall -U postgres --roles-only > roles.sql
docker exec <db16> psql -U postgres -d default -Atc \
  "SELECT nspname, count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE relkind = 'r' AND nspname NOT IN ('pg_catalog', 'information_schema') GROUP BY 1 ORDER BY 1" > counts-16.txt
docker exec <db16> pg_restore -l /tmp/default.dump > /dev/null && echo "dump readable"
```

`counts-16.txt` (tables per schema, including every `workspace_*` schema) is the baseline for step 6. Copy `default.dump` off the host before going further.

## 4. Deploy the PG18 compose

Push the updated `docker-compose.coolify.yml` (new image, `twenty-pgdata-pg18` mounted at `/var/lib/postgresql`) and deploy only once server and worker are stopped. In Coolify, start just the `db` service if possible; if Coolify starts everything, stop `server` and `worker` again immediately, before they finish booting, then drop the fresh `default` database they may have initialized:

```bash
docker exec <db18> psql -U postgres -d postgres -c 'DROP DATABASE IF EXISTS "default" WITH (FORCE)'
docker exec <db18> psql -U postgres -d postgres -c 'CREATE DATABASE "default"'
docker exec <db18> psql -U postgres -Atc 'SHOW server_version' -c 'SHOW data_directory'
```

Expect `18.x` and `/var/lib/postgresql/18/docker`.

## 5. Restore into 18

```bash
docker cp ./default.dump <db18>:/tmp/default.dump
docker exec <db18> psql -U postgres -d default -c 'CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public'
docker exec <db18> pg_restore -U postgres -d default --no-owner --role=postgres -j 4 --exit-on-error /tmp/default.dump
```

Only `roles.sql` matters if the old cluster had roles besides `postgres` (it does not in the stock Coolify compose). Apply it before `pg_restore` and drop `--no-owner` in that case.

## 6. Verify

```bash
docker exec <db18> psql -U postgres -d default -Atc \
  "SELECT nspname, count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE relkind = 'r' AND nspname NOT IN ('pg_catalog', 'information_schema') GROUP BY 1 ORDER BY 1" > counts-18.txt
diff counts-16.txt counts-18.txt && echo "table counts match"
docker exec <db18> psql -U postgres -d default -Atc "SELECT extname, extversion FROM pg_extension ORDER BY 1"
docker exec <db18> psql -U postgres -d default -Atc 'SELECT count(*) FROM core.workspace' -c 'SELECT count(*) FROM core."user"'
docker exec <db18> psql -U postgres -d default -Atc "SELECT '[1,2,3]'::public.vector OPERATOR(public.<->) '[1,2,4]'::public.vector"
docker exec <db18> vacuumdb -U postgres -d default --analyze-only
```

Expect matching counts, `citext`, `plpgsql`, `unaccent`, `uuid-ossp` and `vector` listed, the same workspace/user counts as on 16, and `1` from the distance query. Spot-check row counts on a few large workspace tables against the old container. This exact dump/restore sequence was rehearsed locally from `postgres:16` into `pgvector/pgvector:0.8.7-pg18`, including `STORED` `searchVector` columns.

Then start `server` and `worker`. The entrypoint runs `upgrade`, and the 2.56 instance command `EnableVectorExtension` becomes a no-op because the extension already exists. Check the server log for `Successfully migrated DB!`, log in, open a few records and run a search.

## 7. Rollback

Before any new writes are worth keeping: stop the stack, redeploy the previous compose (`postgres:16`, `twenty-pgdata` at `/var/lib/postgresql/data`). The old volume was never touched.

## 8. Cleanup (days later)

Once the new stack has been healthy for a while, keep `default.dump` in off-host backups, then remove the old `twenty-pgdata` volume. Update backup jobs: dumps must be taken with a PG18 `pg_dump` (the Twenty image ships `postgresql18-client`).
