# Guia de Deploy - Clube de Beneficios Auto Vale Prevencoes

Este guia explica passo a passo como fazer o deploy da aplicacao completa.

---

## Arquitetura do Deploy

| Componente | Servico | Descricao |
|-----------|---------|-----------|
| Frontend | Vercel | Next.js com SSR |
| Backend | Vercel Serverless | NestJS com @vendia/serverless-express |
| Banco de Dados | Supabase | PostgreSQL com PostGIS |
| Cache | Upstash | Redis serverless |
| Storage | Cloudflare R2 | Armazenamento de imagens |

---

## Pre-requisitos

- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Conta no [Upstash](https://upstash.com)
- Conta no [Cloudflare](https://cloudflare.com) (para R2)
- Node.js 20+ instalado localmente

---

## 1. Configurar o Banco de Dados (Supabase)

### 1.1 Criar projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **New Project**
3. Escolha um nome (ex: `autovale-production`)
4. Defina a senha do banco de dados
5. Selecione a regiao mais proxima (ex: `South America - Sao Paulo`)
6. Clique em **Create new project**

### 1.2 Obter a URL de conexao

1. No painel do Supabase, va em **Settings > Database**
2. Copie a **Connection string (URI)**
3. Substitua `[YOUR-PASSWORD]` pela senha definida na criacao
4. O formato sera: `postgresql://postgres:[SENHA]@db.[REF].supabase.co:5432/postgres`

### 1.3 Habilitar PostGIS

1. No Supabase, va em **Database > Extensions**
2. Busque por `postgis`
3. Clique em **Enable**

### 1.4 Executar as migrations

Execute o SQL do arquivo `database/schema.sql` no **SQL Editor** do Supabase:

1. Va em **SQL Editor**
2. Clique em **New query**
3. Cole o conteudo do `database/schema.sql`
4. Clique em **Run**

---

## 2. Configurar o Redis (Upstash)

### 2.1 Criar banco Redis

1. Acesse [console.upstash.com](https://console.upstash.com)
2. Clique em **Create Database**
3. Nome: `autovale-cache`
4. Regiao: `South America (Sao Paulo)` - escolha a mais proxima
5. Clique em **Create**

### 2.2 Obter a URL de conexao

1. Na pagina do banco criado, copie a **Redis URL**
2. O formato sera: `redis://default:[TOKEN]@[HOST].upstash.io:6379`

---

## 3. Configurar o Cloudflare R2

### 3.1 Criar bucket

1. Acesse o painel do [Cloudflare](https://dash.cloudflare.com)
2. Va em **R2 > Create bucket**
3. Nome: `autovale-assets`
4. Clique em **Create bucket**

### 3.2 Criar API Token

1. Va em **R2 > Manage R2 API Tokens**
2. Clique em **Create API Token**
3. Permissoes: **Object Read & Write**
4. Selecione o bucket `autovale-assets`
5. Copie o **Access Key ID** e **Secret Access Key**

### 3.3 Habilitar acesso publico (opcional)

1. No bucket, va em **Settings > Public Access**
2. Habilite **Allow Access** para servir imagens publicamente
3. Anote a URL publica gerada

---

## 4. Criar Projetos no Vercel

### 4.1 Projeto Frontend

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Importe o repositorio do GitHub
3. Na configuracao:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Clique em **Deploy**

### 4.2 Projeto Backend

1. Acesse [vercel.com/new](https://vercel.com/new) novamente
2. Importe o mesmo repositorio
3. Na configuracao:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Clique em **Deploy**

---

## 5. Configurar Variaveis de Ambiente

### 5.1 Variaveis do Frontend (Vercel)

No painel do projeto frontend no Vercel, va em **Settings > Environment Variables** e adicione:

| Variavel | Valor |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | URL do backend (ex: `https://api-autovale.vercel.app`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Sua chave do Google Maps |
| `NEXT_PUBLIC_APP_NAME` | `Auto Vale Prevencoes` |
| `NEXT_PUBLIC_STORAGE_URL` | URL publica do R2 |

### 5.2 Variaveis do Backend (Vercel)

No painel do projeto backend no Vercel, va em **Settings > Environment Variables** e adicione:

| Variavel | Valor |
|----------|-------|
| `DATABASE_URL` | URL do Supabase PostgreSQL |
| `JWT_SECRET` | Chave secreta forte (use `openssl rand -base64 32`) |
| `JWT_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `AEASY_API_TOKEN` | Token da API AEasy |
| `AEASY_API_URL` | `https://api.aeasy.io/v2` |
| `REDIS_URL` | URL do Upstash Redis |
| `GOOGLE_MAPS_API_KEY` | Chave do Google Maps |
| `CLOUDFLARE_R2_ACCESS_KEY_ID` | Access Key do R2 |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY` | Secret Key do R2 |
| `CLOUDFLARE_R2_BUCKET_NAME` | `autovale-assets` |
| `CLOUDFLARE_R2_ENDPOINT` | Endpoint do R2 |
| `CLOUDFLARE_R2_PUBLIC_URL` | URL publica do R2 |
| `FRONTEND_URL` | URL do frontend (para CORS) |
| `NODE_ENV` | `production` |

---

## 6. Configurar GitHub Actions (CI/CD)

### 6.1 Adicionar Secrets no GitHub

1. No repositorio GitHub, va em **Settings > Secrets and variables > Actions**
2. Adicione os seguintes secrets:

| Secret | Onde encontrar |
|--------|---------------|
| `VERCEL_TOKEN` | Vercel > Settings > Tokens > Create |
| `VERCEL_ORG_ID` | Vercel > Settings > General > Vercel ID |
| `VERCEL_PROJECT_ID_FRONTEND` | Vercel > Projeto Frontend > Settings > General > Project ID |
| `VERCEL_PROJECT_ID_BACKEND` | Vercel > Projeto Backend > Settings > General > Project ID |

### 6.2 Workflow automatico

O arquivo `.github/workflows/deploy.yml` ja esta configurado para:

1. **Lint** - Verificar codigo em cada push/PR
2. **Testes** - Rodar testes com PostgreSQL e Redis de teste
3. **Deploy** - Fazer deploy automatico ao mergear na `main`

---

## 7. Conectar GitHub para Auto-Deploy

### 7.1 Frontend

1. No Vercel, va no projeto frontend
2. **Settings > Git**
3. Conecte o repositorio GitHub
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: `frontend`
   - **Auto-deploy**: Enabled

### 7.2 Backend

1. No Vercel, va no projeto backend
2. **Settings > Git**
3. Conecte o repositorio GitHub
4. Configure:
   - **Production Branch**: `main`
   - **Root Directory**: `backend`
   - **Auto-deploy**: Enabled

---

## 8. Configurar Dominio Customizado

### 8.1 No Vercel (Frontend)

1. Va no projeto frontend > **Settings > Domains**
2. Adicione seu dominio (ex: `autovale.com.br`)
3. Configure o DNS no seu provedor:
   - **Tipo**: CNAME
   - **Nome**: @ ou www
   - **Valor**: `cname.vercel-dns.com`

### 8.2 No Vercel (Backend / API)

1. Va no projeto backend > **Settings > Domains**
2. Adicione o subdominio da API (ex: `api.autovale.com.br`)
3. Configure o DNS:
   - **Tipo**: CNAME
   - **Nome**: api
   - **Valor**: `cname.vercel-dns.com`

### 8.3 Atualizar variaveis de ambiente

Apos configurar os dominios, atualize:
- No frontend: `NEXT_PUBLIC_API_URL` com `https://api.autovale.com.br`
- No backend: `FRONTEND_URL` com `https://autovale.com.br`

---

## 9. Desenvolvimento Local

### 9.1 Iniciar servicos com Docker

```bash
# Subir PostgreSQL + Redis
docker-compose up -d

# Verificar se estao rodando
docker-compose ps
```

### 9.2 Configurar backend

```bash
cd backend
cp .env.example .env
# Editar .env com os valores locais:
# DATABASE_URL=postgresql://autovale_user:autovale_pass@localhost:5432/autovale_db
# REDIS_URL=redis://localhost:6379

npm install
npm run migration:run
npm run start:dev
```

### 9.3 Configurar frontend

```bash
cd frontend
cp .env.example .env.local
# Editar .env.local com:
# NEXT_PUBLIC_API_URL=http://localhost:3001

npm install
npm run dev
```

---

## 10. Checklist de Deploy

- [ ] Banco PostgreSQL criado no Supabase
- [ ] PostGIS habilitado
- [ ] Migrations executadas
- [ ] Redis criado no Upstash
- [ ] Bucket R2 criado no Cloudflare
- [ ] Projeto frontend criado no Vercel
- [ ] Projeto backend criado no Vercel
- [ ] Variaveis de ambiente configuradas (frontend)
- [ ] Variaveis de ambiente configuradas (backend)
- [ ] GitHub Actions secrets configurados
- [ ] Dominio customizado configurado
- [ ] DNS propagado e SSL ativo
- [ ] Testes passando no CI/CD
- [ ] App funcionando em producao

---

## Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL` no backend esta correto
- Verifique os headers no `vercel.json`

### Erro de conexao com banco
- Confirme que a `DATABASE_URL` esta correta
- No Supabase, verifique se o IP nao esta bloqueado (Settings > Database > Network)

### Serverless timeout
- Funcoes no Vercel tem limite de 10s (free) ou 60s (pro)
- Otimize queries pesadas ou use cache Redis

### Build falhou no Vercel
- Verifique os logs em **Deployments > [deploy] > Build Logs**
- Confirme que o `Root Directory` esta correto
- Verifique se todas as variaveis de ambiente estao definidas

---

## Contato e Suporte

Para duvidas sobre o deploy, consulte:
- [Documentacao Vercel](https://vercel.com/docs)
- [Documentacao Supabase](https://supabase.com/docs)
- [Documentacao Upstash](https://docs.upstash.com)
- [Documentacao Cloudflare R2](https://developers.cloudflare.com/r2)
