# Reddit lead finder

Finds people on Reddit asking about buying / verifying land & property in Nigeria
(especially Abuja, especially diaspora) so we can answer helpfully and, where it
fits, link a Propersafe guide. Remembers what it has seen so scheduled runs only
report **new** questions.

## Why the official API

Reddit's logged-out RSS/JSON search does **not** filter by query and rate-limits
hard. The script uses the official Reddit API (OAuth), which has real search and a
~60 req/min limit. You need a free Reddit app (2 minutes).

## One-time setup

1. Go to <https://www.reddit.com/prefs/apps> → **create another app…**
2. Choose **script**. Name: `propersafe-leadfinder`. Redirect URI: `http://localhost`.
3. After creating, copy:
   - the string under the app name = **client id**
   - **secret**
4. Export env (locally, `.env.local`, or in your scheduler):

   ```sh
   export REDDIT_CLIENT_ID=xxxx
   export REDDIT_CLIENT_SECRET=xxxx
   export REDDIT_USER_AGENT="propersafe-leadfinder/1.0 by u/yourname"
   # optional — only if you want to authenticate as a user instead of app-only:
   # export REDDIT_USERNAME=...   export REDDIT_PASSWORD=...
   ```

## Run

```sh
node scripts/reddit-leads.mjs --all          # show everything relevant (first look)
node scripts/reddit-leads.mjs                # only NEW questions since last run
node scripts/reddit-leads.mjs --json         # machine-readable
node scripts/reddit-leads.mjs --email        # also email a digest (see below)
```

State is kept in `scripts/.reddit-leads-seen.json` (gitignored).

## Email digest (optional)

Reuses Resend (already used by the site):

```sh
export RESEND_API_KEY=...                     # already set for the app
export LEADS_TO="you@example.com,team@..."    # who gets the digest
export LEADS_FROM="Propersafe Leads <leads@propersafe.co>"   # optional
node scripts/reddit-leads.mjs --email
```

## Scheduling

Pick one:

- **Cron (any always-on box):** `0 8 * * * cd /path/to/propersafe && node scripts/reddit-leads.mjs --email`
- **Netlify Scheduled Function:** wrap `main()` in a scheduled function; set the env
  vars in Netlify. Note the seen-state file isn't persistent on Netlify — use a
  store (e.g. Netlify Blobs) or accept some repeats.
- **Claude Code scheduled agent** (`/schedule`): run the script on a cron and email.

## Tuning

- Subreddits and queries: `SUBREDDITS`, `SUB_QUERY`, `GLOBAL_QUERIES` at the top.
- Relevance: `score()` + the `DOMAIN/GEO/DIASPORA/ANXIETY/QUESTION` regexes.
- `--days N` ignores posts older than N days; the `s < 9` threshold sets strictness.
