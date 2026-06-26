# MailGuard 

Email deliverability diagnostic tool for non-technical African SME business owners.

## The Problem
Non-technical African SME owners can't fix email deliverability issues because existing tools (Mail-Tester, MXToolbox, GlockApps) are built for developers, not for them — leaving the actual problem unsolved.

## How It Works
1. User submits their email content or sending domain
2. MailGuard analyzes SPF, DKIM, DMARC, spam score and blacklist status
3. Results are explained in plain, simple English (AI-powered)
4. Step-by-step fix instructions are provided
5. User re-tests to confirm the issue is resolved

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Vite |
| Backend | FastAPI, Python |
| Database | PostgreSQL |
| Auth | JWT |
| AI Layer | Claude API |
| Spam Engine | Apache SpamAssassin |

## Project Structure
```
MailGuard/
├── client/                  # React frontend (Tofunmi)
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components (buttons, cards, navbar)
│   │   ├── pages/           # Full page views (Landing, Dashboard, Results, Login)
│   │   ├── services/        # API calls to the FastAPI backend
│   │   ├── hooks/           # Custom React hooks (useAuth, useScan)
│   │   ├── context/         # Auth state management (JWT, user state)
│   │   └── assets/          # Images, icons, logos
│   ├── index.html           # App entry HTML
│   ├── vite.config.js       # Vite + Tailwind configuration
│   └── package.json         # Frontend dependencies
├── server/                  # FastAPI backend (Samuel + Yusuf) — coming soon
└── README.md
```

## Team
- **Tofunmi Omololu** — Frontend + API Integration + Database
- **Samuel Oluwafikunayomi** — Backend (FastAPI, SpamAssassin, DNS validation) + Database Support
- **Sanni Yusuf Olamilekan** — AI/ML Engine + Backend Support

## Contributing
We follow a structured branching strategy to keep the codebase clean:

- `main` — stable, production-ready code only
- `dev` — active development branch
- `feature/your-feature-name` — individual feature branches

### Workflow
1. Clone the repo
2. Switch to `dev` branch — `git checkout dev`
3. Create your feature branch — `git checkout -b feature/your-feature-name`
4. Work on your feature and commit regularly
5. Push your branch — `git push origin feature/your-feature-name`
6. Open a Pull Request into `dev` and await review before merging

### Rule
❌ Never push directly to `main` or `dev`
✅ Always open a PR and wait for review

## Status
🚧 Currently in active development -- Phase 1 (Foundation Setup)
