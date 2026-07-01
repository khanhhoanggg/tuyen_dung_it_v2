# DevJobs Vietnam

Website tuyen dung IT gom backend Express/TypeScript va frontend Next.js.

## Cong nghe

- Backend: Node.js, Express, TypeScript, MongoDB, JWT
- Frontend: Next.js, React, TypeScript

## Cau truc

```txt
tuyen_dung_it_v2/
├─ backend/
└─ frontend/
```

## Chay local

1. Cai dependencies:

```bash
npm install
```

2. Tao file `backend/.env`:

```env
PORT=4000
DATABASE_URL=mongodb://127.0.0.1:27017/devjobs
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

3. Chay backend va frontend:

```bash
npm run dev
```

Frontend mac dinh chay o `http://localhost:3000`, backend o `http://localhost:4000`.
