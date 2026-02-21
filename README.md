# ProtoCompare

**Side-by-side prototype comparison for product managers who iterate with AI.**

Load two HTML prototypes, compare them live in your browser, and share a link with stakeholders so they can interact with both themselves — before or during a meeting.

---

## What It Does

- **Upload or paste** two self-contained HTML files
- **Renders both** in sandboxed iframes — forms, clicks, scripts all work
- **Share a link** — saved to Supabase, expires in 5 days
- **Fullscreen mode** — expand either side without losing prototype state
- **Dark mode** with jade/aquamarine accent theme

Built for PMs who A/B test AI-generated prototypes.

---

## How to Use

1. Open [protocompare.netlify.app](https://protocompare.netlify.app) (or run locally)
2. Click **Load Left** or **Load Right** — upload an `.html` file or paste code
3. Interact with both prototypes directly in the browser
4. Click **Share** — link copied to clipboard automatically
5. Send the link to stakeholders — they open it and interact with both prototypes themselves

---

## Known Limitations

- **HTML only** — JSX/React files not supported. Ask Claude: *"Export as a single self-contained HTML file"*
- **No external npm packages** — CDN links work, bare `import` statements don't
- **No user accounts** — links are anonymous and public to anyone with the URL
- **Links expire in 5 days** — shown at share time; expired links show a friendly page
- **Desktop-optimized** — layout is designed for 1200px+ screens; a banner is shown on smaller screens
- **iframe sandbox limits** — `localStorage`, external CORS-restricted APIs, and geolocation won't work inside rendered prototypes

---

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/protocompare
cd protocompare
npm install
cp .env.example .env.local
# Add your Supabase URL and anon key to .env.local
npm run dev
```

---

## Supabase Setup

Run this SQL in the Supabase SQL editor:

```sql
create table comparisons (
  id uuid primary key default gen_random_uuid(),
  left_html text,
  right_html text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone default (now() + interval '5 days')
);

-- Allow anonymous reads and writes (no login required)
alter table comparisons enable row level security;
create policy "Allow anonymous insert" on comparisons for insert with check (true);
create policy "Allow anonymous select" on comparisons for select using (expires_at > now());
```

Copy your **Project URL** and **anon key** from Project Settings → API into `.env.local`.

---

## Deployment (Netlify)

1. Push to GitHub
2. Netlify → Add new site → Import from GitHub
3. Build command: `npm run build` · Publish directory: `dist`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy — the `public/_redirects` file handles SPA routing automatically

---

## Tech Stack

- **React + Vite + TypeScript**
- **Tailwind CSS** — dark mode, jade/aquamarine theme
- **Supabase** — stores comparison HTML, auto-expires via RLS
- **React Router** — `/` editor view, `/compare/:id` shared view
- **Netlify** — static hosting, no cold starts

---

## V2 Ideas

- HTML validator tool (checks if your prototype will work in ProtoCompare)
- Sync scroll between sides
- Code editor view (code + preview side by side)
- Comments/annotations on shared comparisons
- Password protection for shared links
- User accounts + saved comparison history
