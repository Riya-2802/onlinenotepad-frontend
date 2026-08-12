# Online Notepad - Frontend

This guide helps another user set up and run the **frontend** on their own laptop.

## What this project is
- React + Vite
- **Tailwind CSS** (UI styling)
- Connects to the existing Express backend using **cookie-based authentication**
- Frontend calls the backend through the dev proxy (`/api` → `http://localhost:3000`)


## Requirements
- Node.js **18+**
- Backend running on **http://localhost:3000** (default)

## Setup
```bash
cd frontend
npm install
```

## Environment variables
Create an env file:
```bash
copy .env.example .env
```

If needed, you can set `VITE_API_BASE_URL` in `.env`.

## Run
```bash
npm run dev
```

Frontend will start at:
- http://localhost:5173

## Important notes (cookies)
- Authentication relies on HTTP-only cookies set by the backend.
- The frontend requests use `credentials: 'include'` so the cookies are sent automatically.

## Common issues
1) **Backend not running**
   - Start the backend first (default: `http://localhost:3000`).

2) **CORS / cookies not working**
   - Ensure backend cookie and CORS settings are enabled for your frontend origin.

## Project scripts
- `npm run dev` - start dev server
- `npm run build` - build for production
- `npm run preview` - preview production build
- `npm run lint` - lint code

