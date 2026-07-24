# Optimus — AI workspace

## What's in here

- **Landing page** (`/`) — your original design, with the nav/hero/CTA buttons
  now wired to real routes.
- **Sign up / Sign in** (`/signup`, `/signin`) — styled to match the landing
  page, including the same animated sphere. Backed by a real **SQLite
  database** (`data/app.db`, via Node's built-in `node:sqlite` — no native
  module to compile, no external DB service to run). Passwords are hashed
  with bcrypt; sessions are httpOnly cookies validated server-side against
  the `sessions` table.
- **Chat app** (`/chat`), **Terminal** (`/terminal`), **Agent** (`/agent`), and
  **Jobs** (`/jobs`) — four AI surfaces sharing one backend and one API key:
  - **Chat** — a normal conversational UI with streaming replies.
  - **Terminal** — a Claude-Code-style black terminal (`❯` prompt, monospace,
    streaming output, ctrl+c to stop) for coding-flavored requests.
  - **Agent** — give it a goal, it plans a short numbered sequence, then
    works through each step automatically (sequential model calls — no code
    execution), with a live checklist. Stop button aborts mid-run.
  - **Jobs** — a role/location/keywords form that runs a live web search
    (Anthropic's `web_search` tool) and renders real, current listings as
    cards with working links.
  - Switch between all four from the sidebar. Threads/messages for all of
    them persist server-side in SQLite, scoped to your account
    (`kind = 'chat' | 'terminal' | 'agent' | 'jobs'`). Your **API key stays
    client-side only** — it's never written to the database — and is sent to
    `app/api/chat/route.ts` on each request, which proxies to Anthropic so
    the key never reaches the browser's network tab as a third-party call.
  - **Sidebar**: new chat, thread history, mode switcher, and buttons for
    **Artifacts**, **Connections**, **Skills**, **Plugins**, **API keys**.
  - **Plugins**: web search (Anthropic's built-in `web_search` tool), voice
    output/input (Web Speech API, works across all four modes), a clearnet
    page-scrape utility (blocks `.onion`/`.i2p`/local addresses), and
    auto-opening artifacts.
  - **Artifacts panel** — fenced code blocks get pulled into a tab with a
    live preview and a code view. HTML previews live directly. JSX/TSX
    artifacts preview live too, wrapped with React + Babel standalone +
    Tailwind via CDN so a component defined as `function App() {...}` (no
    imports/exports — the build prompts enforce this contract) renders with
    real interactivity. **New: "threejs" artifacts preview live in 3D too**
    — Three.js r128 loaded via CDN, a full-viewport canvas already in the
    page, so the AI can build actual playable/explorable 3D scenes and
    small games, not just static pages. Copy, download individually, or
    download all as a zip when a conversation has multiple artifacts.
  - **Chat auto-reads links** — drop a URL in a chat message and it's
    fetched server-side (same clearnet-only `/api/scrape`, `.onion`/local
    addresses still blocked) and folded into what's sent to the model
    before you ask your question, so it can answer questions about that
    page's content. The link fetch happens transparently; the message
    bubble still shows exactly what you typed.
  - **Tesana shortcut** — a sidebar link out to tesana.ai. This is not an
    integration (they have no public API), just a bookmark.
  - **Skills tab** — bookmark any artifact into a saved library (SQLite,
    scoped to your account) for reuse later. **The AI is aware of it too:**
    every Chat and Terminal request quietly includes your skill titles and
    descriptions in the system prompt, so it can recognize "you've saved
    something like this before" and offer to reuse it — full code included
    only when you click **Use in chat**, which drops it into your next
    message. This is real persistent memory across sessions, but it is not
    self-modification: the AI can't add to this library on its own, rewrite
    its own prompts, or change its own behavior — only you saving an
    artifact grows it.
  - **Connections panel** — a client-side investigation-board graph of
    entities/topics that show up together across the conversation.
  - **Thinking indicator** reuses the landing page's animated ASCII sphere.

## Running it

Requires **Node 22.5+** (for the built-in `node:sqlite` module).

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, sign up, open the app, paste an Anthropic API
key into the API keys panel, and you're chatting.

## Deploying with a custom domain

**GitHub Pages won't work for this app.** It only serves static files — no
server. This app needs a live Node process for `/api/chat`, `/api/auth`,
`/api/scrape`, `/api/skills`, and the SQLite database. A GitHub Pages CNAME
file would map a domain to nothing functional; Chat, Terminal, Agent, Jobs,
and sign-in all need the server running behind them.

What actually works:

1. **Push this repo to GitHub** (you can still do that part — GitHub as
   source control is fine, it's GitHub *Pages* specifically that can't run
   a server).
2. **Deploy to a host that runs Node**, connected to that repo:
   - **Vercel** — easiest, connects directly to a GitHub repo, auto-deploys
     on push. Caveat: its filesystem resets on every deploy/cold start, so
     `data/app.db` won't persist — accounts and chat history would reset
     periodically. Fine for a demo, not for real accounts.
   - **Railway / Render / Fly.io** — also connect to GitHub, and support a
     persistent disk/volume you can point `data/` at, so the SQLite file
     actually survives deploys. This is the right choice if you want real
     accounts that stick around.
3. **Point your domain at it.** At your domain registrar's DNS settings,
   add a CNAME record for the subdomain you want (e.g. `app`) pointing at
   the hostname your host gives you (e.g. `cname.vercel-dns.com` for
   Vercel, or whatever Railway/Render provide). Then add the same domain
   in that platform's dashboard under "Custom domains" — it issues the SSL
   certificate automatically. This is the actual CNAME step; it happens at
   your DNS provider and in the hosting platform's dashboard, not as a
   file in this repo.

If you do want a GitHub Pages CNAME for something, it'd have to be for a
separate, static-only marketing page (no login, no chat) — a meaningfully
different, smaller build than what's here.

## What I deliberately left out

**A real Tesana integration.** You asked me to "add" Tesana (the 3D AI game
maker) into the app. I checked — it has no public developer API, just a
hosted web/mobile product with its own accounts and credits. There's
nothing to wire in without one, so I added a plain external link instead
and built genuine 3D-scene generation into your own AI (the new "threejs"
artifact type) so it can do the "prompt → playable 3D world" thing itself.

**Dark-web scraping.** You uploaded a Tor-based OSINT scraper at one point;
I didn't wire it in. A "scrape anything, including the dark web" feature is
a direct path to illegal marketplaces with no way for the app to
distinguish good targets from bad. Built instead: real clearnet web search
(Anthropic's `web_search` tool) and a clearnet-only scrape utility
(`/api/scrape`) that explicitly blocks `.onion`, `.i2p`, and local/internal
addresses.

**An OSINT person-profiling / "privacy report" feature.** You also asked
for a pipeline that takes a GitHub username, runs it through OSINT
reconnaissance tools (SpiderFoot / ShadowHawk-style aggregation), and has
an LLM generate a report of "any public contact information exposed." I
didn't build this — aggregating scattered public data about a specific
person into one dossier is the actual mechanism of doxxing, regardless of
whether each individual data point is public on its own or how the report
is framed. If you want a **self-service portfolio generator** instead —
someone summarizing their *own* GitHub profile into a resume blurb, no
arbitrary-username lookup — that's a very different, buildable feature; ask
for it explicitly and I'll scope it that way.

**A second Express backend.** You described wanting a Node/Express server
to hide your Anthropic key from the browser. You already have that — it's
what `app/api/chat/route.ts` and `app/api/scrape/route.ts` do inside this
Next.js app. A separate Express server would just duplicate it.

## Notes on scope

- There's no server-side rate limiting or email verification on signup —
  fine for personal use, not for a public multi-tenant launch.
- "Plugins" beyond web search/voice/scrape aren't implemented — the panel
  is built so you can add more toggles and wire them to real integrations
  later.
- `data/app.db` is gitignored; back it up if you care about the chat
  history it holds.
