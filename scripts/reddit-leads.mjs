#!/usr/bin/env node
/**
 * Propersafe Reddit lead finder.
 *
 * Finds people on Reddit asking about buying / verifying land & property in
 * Nigeria (especially Abuja, especially from the diaspora) so we can answer
 * genuinely and, where it fits, point them at a Propersafe guide. Scores each
 * post for fit and remembers what it has seen, so scheduled runs only surface
 * NEW questions ("get notified").
 *
 * Two data sources:
 *   - DEFAULT (no setup): public subreddit RSS feeds (/r/<sub>/new + top-week).
 *     Reddit's *global* logged-out search is broken (returns unfiltered junk) and
 *     rate-limits hard, so we read per-subreddit feeds gently and filter locally.
 *     Each feed only carries the latest ~25 posts, so run it regularly to catch
 *     new questions as they appear.
 *   - UPGRADE (optional): the official Reddit API. If REDDIT_CLIENT_ID /
 *     REDDIT_CLIENT_SECRET are set, it uses OAuth search instead (wider, deeper).
 *     See scripts/reddit-leads.README.md.
 *
 * Usage:
 *   node scripts/reddit-leads.mjs            # new questions since last run
 *   node scripts/reddit-leads.mjs --all      # ignore seen-state, show all found
 *   node scripts/reddit-leads.mjs --limit 30
 *   node scripts/reddit-leads.mjs --json
 *   node scripts/reddit-leads.mjs --email    # also email a digest via Resend
 *
 * Email needs: RESEND_API_KEY, LEADS_TO (comma-separated), optional LEADS_FROM.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const SEEN_PATH = join(__dir, ".reddit-leads-seen.json");
const UA = process.env.REDDIT_USER_AGENT ||
  "Mozilla/5.0 (compatible; propersafe-leadfinder/1.0; +https://propersafe.co)";

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
const ALL = flag("--all");
const AS_JSON = flag("--json");
const DO_EMAIL = flag("--email");
const LIMIT = parseInt(opt("--limit", "40"), 10);
const WINDOW_DAYS = parseInt(opt("--days", "60"), 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Where to look -------------------------------------------------------
// Nigerian subreddits where buyers ask about land/property. Geo is implied here.
const NG_SUBS = ["Nigeria", "AskNigeria", "LagosNigeria", "Lagos", "NaijaMarketplace", "phnigeria"];
const TOP_SUBS = ["Nigeria", "AskNigeria"]; // also pull this week's popular posts
// OAuth-only (needs creds): broader keyword search across these + global.
const SUB_QUERY = 'land OR property OR plot OR "c of o" OR omonile OR agis OR survey OR estate';
const GLOBAL_QUERIES = [
  'Abuja land (verify OR scam OR title OR "c of o")',
  'Nigeria buy land diaspora',
  'Nigeria property scam',
  'Certificate of Occupancy Nigeria',
  'Omonile land',
];

// ---- Relevance model -----------------------------------------------------
const DOMAIN = /\b(land|property|plot|house|estate|acre|hectare|c\s?of\s?o|r\s?of\s?o|certificate of occupancy|right of occupancy|agis|omonile|survey|deed|title|allocation|gazette|excision|realtor|developer)\b/i;
const GEO = /\b(abuja|fct|nigeria|naija|lagos|nigerian|enugu|ibadan|port\s?harcourt|kaduna|ph\b)\b/i;
const DIASPORA = /\b(diaspora|abroad|overseas|uk\b|u\.k|united kingdom|usa|u\.s\b|america|canada|germany|japa|back home|from here|my (cousin|relative|sister|brother|uncle|aunt|family))\b/i;
const ANXIETY = /\b(scam|scammed|fraud|fake|419|duped|cheated|wahala|dispute|gone wrong|verify|verification|legit|genuine|safe|trust|due diligence|before (i|you) pay|red flag|how (do|to|can)|should i|is it (safe|legit)|is this (safe|legit|real)|advice|help|worried|risk|avoid)\b/i;
const QUESTION = /\?|^(how|what|should|is|are|can|where|who|which|do |does |has anyone|anyone|advice|help)/i;

const GUIDES = [
  [/agis/i, "AGIS search", "/guides/agis-search"],
  [/c\s?of\s?o|certificate of occupancy|r\s?of\s?o|right of occupancy/i, "C of O vs R of O", "/guides/c-of-o-vs-r-of-o"],
  [/deed|consent|assignment/i, "Deed of assignment & consent", "/guides/deed-of-assignment-consent"],
  [/scam|fraud|fake|omonile/i, "Abuja land scams", "/guides/abuja-land-scams"],
  [/diaspora|abroad|uk|usa|overseas|canada|japa/i, "Buying from the UK/abroad", "/guides/buying-nigerian-property-from-uk"],
  [/estate|developer|off.?plan/i, "Estate land in Abuja", "/guides/estate-land-abuja"],
  [/where|location|area|district/i, "Where to buy land in Abuja", "/guides/where-to-buy-land-abuja"],
  [/verify|title|search|genuine|authentic/i, "Verify a land title in Abuja", "/guides/verify-land-title-abuja"],
];

/**
 * Score a post (0 = drop). Requires: about property, about Nigeria, AND an
 * actual question/help signal — so we get questions to answer, not listings or
 * chatter. Title matches weigh more than body matches (the first version matched
 * horror stories on the word "house" buried in the body). `geoImplied` is true
 * for Nigerian-subreddit posts.
 */
function score(title, body, geoImplied, ageDays) {
  const t = title || "", b = body || "", text = `${t} ${b}`;
  const inTitle = (re) => re.test(t);
  const inAny = (re) => re.test(text);

  // Property word must be in the TITLE — matching it anywhere in long bodies
  // pulls in essays/news that merely mention "land"/"house"/"title" in passing.
  if (!inTitle(DOMAIN)) return 0;
  if (!(geoImplied || inAny(GEO))) return 0;             // not about Nigeria
  const isQuestion = QUESTION.test(t) || ANXIETY.test(text);
  if (!isQuestion) return 0;                             // not a question / help-seeking

  let s = 6;                                             // property subject in title
  if (inAny(GEO)) s += inTitle(GEO) ? 4 : 2;
  if (inAny(DIASPORA)) s += 4;                           // diaspora buyer = ICP
  if (inAny(ANXIETY)) s += inTitle(ANXIETY) ? 4 : 2;     // pre-purchase intent
  if (QUESTION.test(t)) s += 4;                          // explicit question
  s += Math.max(0, 6 - Math.floor(ageDays / 7));        // recency
  return s;
}
function suggestGuide(text) {
  for (const [re, label, path] of GUIDES) if (re.test(text)) return { label, path };
  return { label: "Verify a land title in Abuja", path: "/guides/verify-land-title-abuja" };
}

// ---- Source A: subreddit RSS (no credentials) ----------------------------
function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#?\w+;/g, (m) =>
      ({ "&amp;": "&", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&#x200B;": "" }[m] || " "))
    .replace(/\s+/g, " ").trim();
}
function field(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decode(m[1]) : "";
}
function parseAtom(xml, sub) {
  const out = [];
  for (const e of xml.match(/<entry>[\s\S]*?<\/entry>/g) || []) {
    const link = (e.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || "";
    const id = (e.match(/<id>([^<]+)<\/id>/i) || [])[1] || link;
    out.push({
      id, sub,
      title: field(e, "title"),
      body: field(e, "content"),
      author: field(e, "name").replace(/^\/u\//, ""),
      url: link,
      created: Date.parse(field(e, "published") || field(e, "updated")) || 0,
      geoImplied: true,
    });
  }
  return out;
}
async function fetchText(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/atom+xml" } });
      if (r.status === 200) return await r.text();
      if (r.status === 429) { await sleep(6000 * (i + 1)); continue; }
    } catch { /* retry */ }
    await sleep(1500);
  }
  console.error("warn: feed failed:", url);
  return null;
}
async function collectViaRSS() {
  const byId = new Map();
  const feeds = [
    ...NG_SUBS.map((s) => [s, `https://www.reddit.com/r/${s}/new.rss?limit=25`]),
    ...TOP_SUBS.map((s) => [s, `https://www.reddit.com/r/${s}/top.rss?t=week&limit=25`]),
  ];
  for (const [sub, url] of feeds) {
    const xml = await fetchText(url);
    if (xml) for (const p of parseAtom(xml, sub)) if (p.id && !byId.has(p.id)) byId.set(p.id, p);
    await sleep(5000); // be gentle — anonymous Reddit rate-limits aggressively
  }
  return [...byId.values()];
}

// ---- Source B: official Reddit API (optional upgrade) --------------------
async function getToken() {
  const id = process.env.REDDIT_CLIENT_ID, secret = process.env.REDDIT_CLIENT_SECRET;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const user = process.env.REDDIT_USERNAME, pass = process.env.REDDIT_PASSWORD;
  const body = user && pass
    ? `grant_type=password&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`
    : "grant_type=client_credentials";
  const r = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body,
  });
  if (!r.ok) throw new Error(`Reddit auth failed: ${r.status} ${await r.text()}`);
  return (await r.json()).access_token;
}
async function apiGet(token, path, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(`https://oauth.reddit.com${path}`, { headers: { Authorization: `bearer ${token}`, "User-Agent": UA } });
    if (r.ok) return r.json();
    if (r.status === 429) { await sleep(2000 * (i + 1)); continue; }
    await sleep(600);
  }
  console.error("warn: api failed:", path);
  return null;
}
const mapApi = (c, geoImplied) => ({
  id: c.data.name, sub: c.data.subreddit, title: c.data.title || "", body: c.data.selftext || "",
  author: c.data.author || "", url: `https://www.reddit.com${c.data.permalink}`,
  created: c.data.created_utc * 1000, geoImplied,
});
async function collectViaAPI() {
  const token = await getToken();
  const byId = new Map();
  for (const sub of NG_SUBS) {
    const j = await apiGet(token, `/r/${sub}/search?q=${encodeURIComponent(SUB_QUERY)}&restrict_sr=1&sort=new&t=year&limit=100`);
    for (const c of j?.data?.children || []) { const p = mapApi(c, true); byId.set(p.id, p); }
    await sleep(400);
  }
  for (const q of GLOBAL_QUERIES) {
    const j = await apiGet(token, `/search?q=${encodeURIComponent(q)}&sort=new&t=year&limit=100`);
    for (const c of j?.data?.children || []) { const p = mapApi(c, false); if (!byId.has(p.id)) byId.set(p.id, p); }
    await sleep(400);
  }
  return [...byId.values()];
}

// ---- Seen-state ----------------------------------------------------------
function loadSeen() {
  if (ALL || !existsSync(SEEN_PATH)) return new Set();
  try { return new Set(JSON.parse(readFileSync(SEEN_PATH, "utf8")).ids || []); } catch { return new Set(); }
}
function saveSeen(ids) {
  try { writeFileSync(SEEN_PATH, JSON.stringify({ updated: new Date().toISOString(), ids: [...ids].slice(-5000) })); }
  catch (e) { console.error("warn: could not write seen state:", e.message); }
}

async function main() {
  const seen = loadSeen();
  const useApi = !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET);
  if (!AS_JSON) console.error(`source: ${useApi ? "Reddit API (OAuth)" : "subreddit RSS feeds"}`);
  const posts = useApi ? await collectViaAPI() : await collectViaRSS();

  const now = Date.now();
  const leads = [];
  for (const p of posts) {
    const ageDays = p.created ? (now - p.created) / 86400000 : 999;
    if (ageDays > WINDOW_DAYS) continue;
    const s = score(p.title, p.body, p.geoImplied, ageDays);
    if (s < 9) continue;
    leads.push({ ...p, ageDays: Math.round(ageDays), scoreVal: s, guide: suggestGuide(`${p.title} ${p.body}`) });
  }
  leads.sort((a, b) => b.scoreVal - a.scoreVal || a.ageDays - b.ageDays);

  const fresh = leads.filter((l) => !seen.has(l.id));
  const show = (ALL ? leads : fresh).slice(0, LIMIT);
  if (!AS_JSON) { const ns = new Set(seen); for (const l of leads) ns.add(l.id); saveSeen(ns); }

  if (AS_JSON) { console.log(JSON.stringify({ totalRelevant: leads.length, new: fresh.length, leads: show }, null, 2)); return; }
  printDigest(show, { total: leads.length, fresh: fresh.length });
  if (DO_EMAIL) await emailDigest(show, { total: leads.length, fresh: fresh.length });
}

function printDigest(show, meta) {
  const header = ALL
    ? `Propersafe — ${show.length} relevant Reddit questions`
    : `Propersafe — ${show.length} NEW Reddit questions (${meta.total} relevant total)`;
  console.log("\n" + header + "\n" + "=".repeat(header.length) + "\n");
  if (!show.length) { console.log("Nothing matched this run."); return; }
  console.log(show.map((l, i) => [
    `${i + 1}. [score ${l.scoreVal}] r/${l.sub} · ${l.ageDays}d ago · u/${l.author}`,
    `   ${l.title}`,
    `   ${l.url}`,
    `   → suggest: ${l.guide.label} (https://propersafe.co${l.guide.path})`,
  ].join("\n")).join("\n\n"));
  console.log("\nReply genuinely first; link a guide only where it truly answers the question.");
}

async function emailDigest(show, meta) {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.LEADS_TO || "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = process.env.LEADS_FROM || "Propersafe Leads <leads@propersafe.co>";
  if (!key || !to.length) { console.error("skip email: set RESEND_API_KEY and LEADS_TO"); return; }
  if (!show.length) { console.error("skip email: nothing new"); return; }
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rows = show.map((l) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee">
      <div style="font:600 12px system-ui;color:#2f6fed">[${l.scoreVal}] r/${l.sub} · ${l.ageDays}d ago</div>
      <div style="font:600 15px system-ui;color:#111;margin:2px 0"><a href="${l.url}" style="color:#111;text-decoration:none">${esc(l.title)}</a></div>
      <div style="font:13px system-ui;color:#555">Suggest: <a href="https://propersafe.co${l.guide.path}">${l.guide.label}</a> · <a href="${l.url}">open thread →</a></div>
    </td></tr>`).join("");
  const html = `<div style="max-width:640px;margin:0 auto;font-family:system-ui">
    <h2 style="font:700 18px system-ui">${meta.fresh} new Reddit questions to answer</h2>
    <p style="color:#555;font:14px system-ui">Reply helpfully; link a guide only where it fits.</p>
    <table style="width:100%;border-collapse:collapse">${rows}</table></div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject: `Reddit: ${meta.fresh} new questions to answer`, html }),
  });
  console.error(r.ok ? `emailed digest to ${to.join(", ")}` : `email failed: ${r.status} ${await r.text()}`);
}

main().catch((e) => { console.error("\n" + e.message + "\n"); process.exit(1); });
