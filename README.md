# MailGuard 🛡️

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
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page views (Landing, Dashboard, Results)
│   │   ├── services/        # API calls to the backend
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # Auth state management
│   │   └── assets/          # Images and icons
├── server/                  # FastAPI backend (Samuel + Yusuf)
└── README.md
```

## Team
- **Tofunmi Omololu** — Frontend + API Integration + Database
- **Samuel Oluwafikunayomi** — Backend (FastAPI, SpamAssassin, DNS validation)
- **Sanni Yusuf Olamilekan** — AI/ML Engine + Backend Support

## Status
🚧 Currently in active development — Phase 1 (Foundation Setup)