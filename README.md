# Career Manager (Career-Job-Application)

A job application and management full-stack app (Node.js/Express backend + React frontend).

## Overview

This project provides basic features for managing job listings, submitting applications, and tracking candidates. The repository contains two main parts:

- `server/` — Node.js + Express API and data layer
- `client/` — React frontend

## Setup

Prerequisites: Node.js (16+), npm or yarn, Git, and optionally the GitHub CLI (`gh`) if you want automated repo creation.

1. Copy environment examples:

	 - Server: `cp server/.env.example server/.env` and edit values.
	 - Client: `cp client/.env.example client/.env` and edit values.

2. Install dependencies and run:

	 - Server:

		 ```bash
		 cd server
		 npm install
		 npm run dev
		 ```

	 - Client:

		 ```bash
		 cd client
		 npm install
		 npm start
		 ```

3. API base URL defaults to `http://localhost:3000` (see `client/.env.example`).

## API Endpoints (examples)

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Log in and receive token |
| GET | /api/jobs | List job postings |
| POST | /api/jobs | Create a job posting (auth) |
| GET | /api/jobs/:id | Get job details |
| POST | /api/jobs/:id/apply | Submit an application for a job |
| GET | /api/applications | List applications (auth) |

Adjust the endpoints as implemented in `server/`.

## GitHub

To create a repo and push from the command line using the GitHub CLI:

```bash
gh repo create career-job-application --public --source=. --remote=origin --push --confirm
```

If `gh` is not available, create the repository on github.com and add the remote:

```bash
git remote add origin git@github.com:YOUR_USERNAME/career-job-application.git
git push -u origin main
```

## Notes

- Do not commit `.env` files — use the `.env.example` files as templates.
- Database files under `db/*.db` are ignored by `.gitignore`.

