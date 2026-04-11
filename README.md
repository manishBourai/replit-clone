# Replit Clode

A full-stack Replit-style code workspace with a TypeScript backend and React + Vite frontend.

## Project Structure

- `backend/` - Express + TypeScript backend, including sockets, Docker integration, and AWS S3 helper utilities.
- `frontend/` - React + Vite frontend with TypeScript, Tailwind-compatible tooling, and socket.io client support.

## Backend

### Stack

- Node.js + Express
- TypeScript
- Socket.io
- AWS SDK for S3
- Dockerode
- node-pty
- dotenv

### Run

1. Install dependencies:
   ```bash
   cd backend
   pnpm install
   ```

2. Create a `.env` file in `backend/` with the required AWS variables:
   ```env
   AWS_REGION=your-region
   AWS_ACCESS_KEY=your-access-key
   AWS_SECRET_KEY=your-secret-key
   ```

3. Start the backend:
   ```bash
   pnpm dev
   ```

4. The backend listens on:
   - `http://localhost:3000`

## Frontend

### Stack

- React
- Vite
- TypeScript
- Axios
- Socket.io client
- Tailwind-compatible configuration

### Run

1. Install dependencies:
   ```bash
   cd frontend
   pnpm install
   ```

2. Start the frontend:
   ```bash
   pnpm dev
   ```

3. The frontend runs on Vite's default port, usually:
   - `http://localhost:5173`

## Build

### Frontend

```bash
cd frontend
pnpm build
```

### Backend

The backend `dev` script compiles TypeScript and then starts the server:

```bash
cd backend
pnpm dev
```

## Notes

- The backend expects AWS credentials in environment variables and uses a hard-coded S3 bucket name: `bourai-bucket`.
- CORS is enabled in the backend, allowing the frontend to communicate with the API during development.

## Useful Commands

- `cd backend && pnpm dev` - compile and run backend
- `cd frontend && pnpm dev` - run frontend development server
- `cd frontend && pnpm build` - build frontend for production
- `cd frontend && pnpm lint` - run ESLint on frontend sources
