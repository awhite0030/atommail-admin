<div align="center">

<pre>
     _   _                  __  __       _ _       _       _           _
    / \ | |_ ___  _ __ ___ |  \/  | __ _(_) |     / \   __| |_ __ ___ (_)_ __
   / _ \| __/ _ \| '_ ` _ \| |\/| |/ _` | | |    / _ \ / _` | '_ ` _ \| | '_ \
  / ___ \ || (_) | | | | | | |  | | (_| | | |   / ___ \ (_| | | | | | | | | | |
 /_/   \_\__\___/|_| |_| |_|_|  |_|\__,_|_|_|  /_/   \_\__,_|_| |_| |_|_|_| |_|

   inboxes  ·  abuse  ·  bans  ·  stats
</pre>

<br/>

<p>
  <strong>AtomMail Admin</strong> is the operations dashboard for
  <a href="https://github.com/awhite0030/atommail">AtomMail</a> —
  manage inboxes, emails, abuse reports, bans, cleanup, and settings.
</p>

<p>
  <a href="#-why-atommail-admin">Why</a> ·&nbsp;
  <a href="#-features">Features</a> ·&nbsp;
  <a href="#-quick-start">Quick start</a> ·&nbsp;
  <a href="#-architecture">Architecture</a> ·&nbsp;
  <a href="#-related">Related</a>
</p>

<p>
  <a href="https://atommail-admin.vercel.app"><img src="https://img.shields.io/badge/demo-live-00C853?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo"/></a>
  &nbsp;<a href="LICENSE"><img src="https://img.shields.io/github/license/awhite0030/atommail-admin?style=for-the-badge&color=blue" alt="License"/></a>
  &nbsp;<img src="https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  &nbsp;<img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  &nbsp;<img src="https://img.shields.io/badge/Supabase-admin-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
  &nbsp;<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge" alt="PRs welcome"/>
</p>

<p>
  <img src="https://img.shields.io/github/stars/awhite0030/atommail-admin?style=social" alt="Stars"/>
  &nbsp;<img src="https://img.shields.io/github/last-commit/awhite0030/atommail-admin?style=social" alt="Last commit"/>
</p>

</div>

---

## ✨ Why AtomMail Admin?

> *The public product receives mail. The admin product keeps the system healthy.*

| Pain | What the dashboard does |
| --- | --- |
| No visibility into inboxes | Browse inboxes and messages in one place |
| Abuse / spam addresses | Bans and abuse tooling for operators |
| Manual DB cleanup | Cleanup + export endpoints for ops |
| Scattered settings | Central settings page for the service |

**Demo:** [atommail-admin.vercel.app](https://atommail-admin.vercel.app)

---

## 🧩 Features

<table>
  <thead>
    <tr>
      <th align="left">Area</th>
      <th align="left">What you get</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Auth</strong></td>
      <td>Login-gated dashboard with logout flow</td>
    </tr>
    <tr>
      <td><strong>Inboxes</strong></td>
      <td>List and inspect temporary addresses</td>
    </tr>
    <tr>
      <td><strong>Emails</strong></td>
      <td>Browse stored messages and metadata</td>
    </tr>
    <tr>
      <td><strong>Abuse</strong></td>
      <td>Abuse reports workflow for operators</td>
    </tr>
    <tr>
      <td><strong>Bans</strong></td>
      <td>Ban management for abusive senders / patterns</td>
    </tr>
    <tr>
      <td><strong>Stats</strong></td>
      <td>Operational counters and service health signals</td>
    </tr>
    <tr>
      <td><strong>Cleanup / export</strong></td>
      <td>Maintenance and data export API routes</td>
    </tr>
    <tr>
      <td><strong>Settings</strong></td>
      <td>Runtime configuration surface for the product</td>
    </tr>
  </tbody>
</table>

---

## ⚡ Quick start

```bash
git clone https://github.com/awhite0030/atommail-admin.git
cd atommail-admin
npm install
# configure Supabase admin env (see lib/supabase-*.ts)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Architecture

```text
Operator browser
       │
       ▼
Next.js App Router (dashboard + API routes)
       │
       ▼
Supabase (service / server clients)
       │
       ▼
Shared AtomMail data (inboxes, emails, bans)
```

### Layout

```text
app/
  dashboard/     # UI: inboxes, emails, abuse, bans, stats, settings
  api/           # admin REST routes
  login/         # auth
lib/             # supabase-admin, supabase-server, utils
middleware.ts    # route protection
```

---

## 🔗 Related

| Repo | Role |
| --- | --- |
| [atommail](https://github.com/awhite0030/atommail) | Public product + email Worker |
| [atommail-admin](https://github.com/awhite0030/atommail-admin) | This ops dashboard |
| [Public demo](https://atommail.vercel.app) | End-user UI |

---

## 📊 Stats

<p>
  <img src="https://img.shields.io/github/languages/top/awhite0030/atommail-admin?style=flat-square" alt="Top language"/>
  &nbsp;<img src="https://img.shields.io/github/repo-size/awhite0030/atommail-admin?style=flat-square" alt="Repo size"/>
  &nbsp;<img src="https://img.shields.io/github/last-commit/awhite0030/atommail-admin?style=flat-square" alt="Last commit"/>
</p>

---

## 📄 License

[MIT](LICENSE) © 2026 A. White.

<sub>Keep the inbox clean. Keep the ops calm.</sub>
