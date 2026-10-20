# Capstone Group 2 School

A minimal school events website built with Vite, Vanilla JavaScript, Tailwind CSS, DaisyUI, and Supabase.

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project

## Run locally

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   The application also supports the older variable name `VITE_SUPABASE_ANON_KEY`.

   Get these values from **Supabase Dashboard → Project Settings → API**. Use only a publishable/anon key in this frontend application. Never add a Supabase `service_role` key to `.env` or commit it to source control.

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal, usually:

   ```text
   http://localhost:5173
   ```

   Restart the development server after changing `.env` values.

## Supabase setup

The app reads upcoming rows from a table named `events` with these columns:

| Column | Type |
| --- | --- |
| `id` | `uuid` |
| `name` | `text` |
| `photoUrl` | `text` |
| `description` | `text` |
| `when` | `timestamp` or `timestamptz` |

The query returns events where `when` is in the future and sorts them chronologically.

If Row Level Security is enabled, allow public read access for the frontend:

```sql
create policy "Allow public reads for school events"
on public.events
for select
to anon, authenticated
using (true);
```

If RLS has not been enabled, enable it before creating the policy:

```sql
alter table public.events enable row level security;
```

## Production build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated files are written to `dist/`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the site for production |
| `npm run preview` | Preview the production build locally |

## Project structure

```text
.
├── index.html             # Page layout and DaisyUI markup
├── src/
│   ├── main.js            # Supabase client, fetching, and event rendering
│   └── style.css          # Tailwind directives and small custom styles
├── tailwind.config.js     # Tailwind and Nord DaisyUI configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Scripts and dependencies
```

## Troubleshooting

- **No events scheduled yet:** Confirm that event rows have a future `when` value and that the Supabase read policy exists.
- **Supabase request errors:** Check the variable names and values in `.env`, then restart Vite.
- **Images do not load:** Confirm that each `photoUrl` is publicly accessible. Cards automatically use a themed placeholder when `photoUrl` is empty.
- **Do not expose credentials:** Only use the public publishable/anon key in client-side code. Keep service-role credentials server-side.
