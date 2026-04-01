import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const minTrustScore = Number(process.env.RSS_MIN_TRUST_SCORE ?? 40);
const explicitSourceId = process.env.RSS_UPSERT_VERIFIED_SOURCE_ID?.trim() || null;
const outPath = resolve(process.cwd(), "artifacts/rss-upsert-smoke.json");

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

async function pickVerifiedSourceId() {
  if (explicitSourceId) {
    const { data, error } = await supabase
      .from("verified_sources")
      .select("id, trust_score, is_active")
      .eq("id", explicitSourceId)
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`RSS_UPSERT_VERIFIED_SOURCE_ID non trovato: ${explicitSourceId}`);
    }
    return data.id;
  }

  const { data, error } = await supabase
    .from("verified_sources")
    .select("id")
    .eq("is_active", true)
    .gte("trust_score", Math.max(0, Math.min(100, minTrustScore)))
    .order("trust_score", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data?.id) {
    throw new Error(
      "Nessuna verified_sources attiva con trust sufficiente: inserire una fonte o impostare RSS_UPSERT_VERIFIED_SOURCE_ID",
    );
  }
  return data.id;
}

async function ingest(sourceId, externalId, title) {
  const { data, error } = await supabase.rpc("ingest_verified_feed_item", {
    p_verified_source_id: sourceId,
    p_external_id: externalId,
    p_title: title,
    p_link: null,
    p_summary: null,
    p_published_at: null,
    p_min_trust_score: minTrustScore,
  });
  if (error) {
    throw error;
  }
  return data;
}

async function run() {
  const sourceId = await pickVerifiedSourceId();
  const externalId = `upsert-smoke-${Date.now()}`;

  const idFirst = await ingest(sourceId, externalId, "Upsert smoke (insert)");
  const idSecond = await ingest(sourceId, externalId, "Upsert smoke (update)");

  const sameRow = idFirst != null && idFirst === idSecond;
  const result = {
    status: sameRow ? "pass" : "fail",
    generatedAt: new Date().toISOString(),
    policy: { minTrustScore, explicitSourceId },
    calls: {
      sourceId,
      externalId,
      firstItemId: idFirst,
      secondItemId: idSecond,
      sameRow,
    },
  };

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);

  if (result.status !== "pass") {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  fail(`rss ingest upsert smoke failed: ${error instanceof Error ? error.message : String(error)}`);
});
