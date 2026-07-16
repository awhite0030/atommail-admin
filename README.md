# AtomMail Admin

Admin dashboard for [AtomMail](https://github.com/awhite0030/atommail): manage inboxes, emails, abuse reports, bans, cleanup jobs, and settings.

Demo: [atommail-admin.vercel.app](https://atommail-admin.vercel.app)

## Features

- Auth-gated dashboard
- Inbox and email browsing
- Abuse / ban tooling
- Stats and operational settings
- Cleanup and export endpoints

## Stack

- Next.js (App Router)
- TypeScript
- Supabase (server + admin clients)
- Tailwind CSS

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Configure Supabase URL and service/anon keys for the admin client (see `lib/supabase-admin.ts` and `lib/supabase-server.ts`).

## Related

- Public product: https://github.com/awhite0030/atommail
- Demo: https://atommail.vercel.app

## License

MIT