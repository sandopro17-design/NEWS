import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const minTrustScore = Number(process.env.RSS_MIN_TRUST_SCORE ?? 40);
const outPath = resolve(process.cwd(), "artifacts/rss-runtime-metrics.json");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

if (!supabaseUrl) {
  fail("SUPABASE_URL non impostata");
}
if (!supabaseServiceRoleKey) {
  fail("SUPABASE_SERVICE_ROLE_KEY non impostata");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function countRows(table, filter) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (typeof filter === "function") {
    query = filter(query);
  }
  const { count, error } = await query;
  if (error) {
    throw error;
  }
  return count ?? 0;
}

async function run() {
  const [sourcesTotal, sourcesRejectedByPolicy, feedItemsCount] = await Promise.all([
    countRows("verified_sources"),
    countRows("verified_sources", (q) =>
      q.or(`is_active.eq.false,trust_score.lt.${Math.max(0, Math.min(100, minTrustScore))}`),
    ),
    countRows("feed_items"),
  ]);

  const rejectionRate = sourcesTotal === 0 ? 0 : Number((sourcesRejectedByPolicy / sourcesTotal).toFixed(3));

  const report = {
    generatedAt: new Date().toISOString(),
    policy: {
      minTrustScore,
    },
    metrics: {
      sourcesCount: sourcesTotal,
      feedItemsCount,
      rejectionRate,
    },
    details: {
      sourcesRejectedByPolicy,
      sourcesAcceptedByPolicy: Math.max(0, sourcesTotal - sourcesRejectedByPolicy),
    },
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

run().catch((error) => {
  fail(`rss runtime report failed: ${error instanceof Error ? error.message : String(error)}`);
});
