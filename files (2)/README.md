# Auto Prime

Site em Node.js (Express) + PostgreSQL, pronto para o Railway.

## Rodar no seu computador
1. `npm install`
2. Copie `.env.example` para `.env` e preencha (use a `DATABASE_PUBLIC_URL` do Postgres do Railway).
3. `node --env-file=.env server.js`  (Node 20+)  →  http://localhost:3000

## Publicar no Railway
1. Suba a pasta para um repositório no GitHub.
2. Railway → New Project → Deploy from GitHub repo.
3. + New → Database → PostgreSQL.
4. No serviço do site → Variables:
   - Add Reference Variable → `DATABASE_URL` (do Postgres)
   - `JWT_SECRET` = string longa e aleatória
5. Settings → Networking → gere um domínio público.
