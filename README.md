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

## Painel de administrador
- Acesso: faça login com o e-mail definido em `ADMIN_EMAIL` (padrão: leviangelo.celular@gmail.com). Você é levado para `/admin.html`.
- **Crie a conta de administrador primeiro** (botão "Criar conta") logo após o deploy, antes de divulgar o site.
- Variáveis: `ADMIN_EMAIL` (opcional) e `SEED_DEMO=true` (opcional, só para teste: cria vendas fictícias; remova depois).
- Para registrar uma venda real, rode no Postgres (Railway → Database → Data → Query):
  `INSERT INTO sales (model, price, sold_at) VALUES ('BMW X1 sDrive20i', 219900, '2026-09-10');`
- Para a venda aparecer em "Carros comprados" no perfil do cliente, informe o comprador:
  `INSERT INTO sales (model, price, sold_at, user_id) VALUES ('BMW X1 sDrive20i', 219900, '2026-09-10', (SELECT id FROM users WHERE email = 'cliente@email.com'));`

## Área do usuário
- Depois de fazer login ou criar a conta, o usuário volta para a tela inicial e vê o avatar no topo.
- Clicar no avatar abre `/perfil.html`: dados, foto, carros comprados, favoritos e carros que está vendendo.
- O botão "Sair" (no topo do site e no perfil) encerra a sessão.
- As tabelas novas (`favorites`, `listings`) e a coluna `users.avatar` são criadas sozinhas ao iniciar o servidor.
