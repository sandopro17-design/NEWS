import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";

const root = resolve(process.cwd());
const migrationV1Path = resolve(root, "supabase/migrations/20260401000005_rss_pipeline_v1.sql");
const migrationHardeningPath = resolve(root, "supabase/migrations/20260401000006_rss_pipeline_hardening.sql");
const outPath = resolve(root, "artifacts/rss-smoke-result.json");

function has(content, token) {
  return content.toLowerCase().includes(token.toLowerCase());
}

function boolToScore(ok) {
  return ok ? 1 : 0;
}

async function run() {
  const [v1, hardening] = await Promise.all([
    readFile(migrationV1Path, "utf8"),
    readFile(migrationHardeningPath, "utf8"),
  ]);

  const checks = {
    hasIngestFunction: has(v1, "create or replace function public.ingest_verified_feed_item"),
    hasTrustGate: has(v1, "p_min_trust_score"),
    hasSourceTrustScoreColumn: has(v1, "source_trust_score"),
    hasDedupeUniqueIndex: has(hardening, "create unique index if not exists feed_items_source_ingest_hash_unique"),
    hasConflictUpsert: has(hardening, "on conflict (verified_source_id, ingest_hash)"),
    hasVerifiedSourceHeartbeat: has(hardening, "last_checked_at = now()"),
  };

  const metrics = {
    checksTotal: Object.keys(checks).length,
    checksPassed: Object.values(checks).reduce((acc, ok) => acc + boolToScore(ok), 0),
  };
  metrics.passRate = Number((metrics.checksPassed / metrics.checksTotal).toFixed(3));
  metrics.minPassRateTarget = 1;

  const result = {
    status: metrics.passRate >= metrics.minPassRateTarget ? "pass" : "fail",
    generatedAt: new Date().toISOString(),
    inputs: {
      migrationV1Path,
      migrationHardeningPath,
    },
    checks,
    metrics,
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (result.status !== "pass") {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  process.stderr.write(`rss smoke failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
