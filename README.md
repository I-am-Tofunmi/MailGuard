# MailGuard

**Privacy-First Email Auditing**

MailGuard is an email deliverability diagnostic tool designed to help African SMEs and business owners understand why their emails may be landing in spam and what they can do about it.

The goal is to make email diagnostics easier to understand by turning technical email-authentication results into clear explanations and practical recommendations.

## The Problem

Email deliverability tools can expose technical information without making it easy for non-technical business owners to understand what is wrong or how to fix it.

MailGuard aims to bridge that gap with a simple interface, understandable results, and actionable guidance.

## How It Works

The planned user journey is:

1. Enter an email address or sending domain.
2. Check relevant email-authentication records, including SPF, DKIM and DMARC.
3. Review domain and blacklist-related diagnostic results.
4. Understand potential issues through plain-English explanations.
5. Follow recommended steps to address those issues and run another check.

## Current Features

- Responsive landing page and navigation.
- User registration and login with Supabase Authentication.
- Email confirmation and password recovery flows.
- Protected dashboard and application routes.
- Scan interface and results views.
- Scan history interface with search and status filters.
- Account settings for profile details and password changes.
- Responsive layouts for mobile, tablet and desktop screens.

**Development note:** The frontend is still being developed. Some scan, dashboard and history content currently uses demonstration data. The complete email diagnostic engine and persistent scan-history integration are not yet implemented. Notification preferences are currently local interface controls and are not persisted.

## Tech Stack

| Area | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Icons | Lucide React, React Icons |
| Authentication | Supabase Auth |
| Database (planned) | PostgreSQL |
| Backend (planned) | Node.js, Express.js |

## Project Structure

```text
MailGuard/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # Authentication state and context
│   │   ├── data/          # Demonstration data
│   │   ├── lib/           # Supabase client configuration
│   │   └── pages/         # Application pages
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docs/                  # Project documentation
├── server/                # Backend development
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- A Supabase project for authentication

### 1. Clone the repository

```bash
git clone https://github.com/I-am-Tofunmi/MailGuard.git
cd MailGuard
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Configure environment variables

Create a `.env.local` file inside the `client/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Use your own Supabase project credentials. Do not commit `.env.local` or expose secret keys in frontend code.

### 4. Start the development server

```bash
npm run dev
```

Vite will display the local development URL in your terminal.

### 5. Build for production

```bash
npm run build
```

## Development Status

MailGuard is under active development.

### Completed

- Initial project structure and frontend setup.
- Landing page and reusable landing-page components.
- Responsive navigation.
- Login and registration interfaces.
- Supabase authentication integration.
- Protected application routes.
- Email confirmation and password recovery flows.
- Dashboard interface.
- Scan and results interfaces.
- History interface with search and filters.
- Account settings interface.
- Responsive layout improvements across the application.

### In Progress / Planned

- Backend API using Node.js and Express.js.
- PostgreSQL database integration for application data.
- Persistent business profiles and scan history.
- Email-authentication diagnostics for SPF, DKIM and DMARC.
- Domain and blacklist checks.
- Plain-English diagnostic explanations and actionable recommendations.
- Connecting the frontend scan workflow to the backend.

## Contributing

We use a branch-based workflow to keep development organized.

- `main` — stable code.
- `dev` — active integration and development branch.
- `feature/your-feature-name` — individual feature branches.

### Workflow

1. Clone the repository.
2. Switch to the `dev` branch.
3. Create a feature branch for your work.
4. Implement and test your changes.
5. Commit your work with a descriptive message.
6. Push your feature branch.
7. Open a pull request into `dev` and wait for review.

Avoid pushing directly to `main`. Use pull requests so changes can be reviewed before merging.

## Team

- **Tofunmi Omololu** — Frontend development, authentication integration and database planning.
- **Samuel Oluwafikunayomi** — Backend development and database support.
- **Sanni Yusuf Olamilekan** — AI/ML engine and backend support.

## Resources

- [UI/UX Design Document](https://drive.google.com/file/d/1sjKLIvg5Rc8ixGE2jlacgDhE8EPazQKR/view?usp=drive_link)
- [Project Action Plan](https://drive.google.com/file/d/1nz_vPu7bFRoBKqRILsL2vQHmqtwI5GG9/view?usp=drive_link)
