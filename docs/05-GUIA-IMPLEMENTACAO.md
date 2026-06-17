# Guia de Implementacao

## Fase 1 - Fundacao (2 semanas)

### Backend
1. Setup NestJS + TypeORM + PostgreSQL
2. Modulo Auth (JWT + refresh token)
3. CRUD Users
4. CRUD Partners
5. Swagger/OpenAPI docs

### Frontend
1. Setup Next.js 14 + TailwindCSS
2. Layout base (Navbar, Sidebar, Theme)
3. Paginas de auth (login, registro)
4. Pagina marketplace (grid + filtros)

## Fase 2 - Core (3 semanas)

### Backend
1. Modulo Benefits (CRUD + regras)
2. Modulo Points (transacoes + saldo)
3. Modulo Coupons (gerar + validar)
4. Verificacao de adimplencia
5. Geolocalizacao (PostGIS)

### Frontend
1. Dashboard do associado
2. Detalhe do parceiro
3. Utilizar beneficio (fluxo completo)
4. Meus pontos + historico
5. Meus cupons

## Fase 3 - Admin (2 semanas)

### Backend
1. Modulo Campaigns
2. Modulo Reports
3. Dashboard admin (indicadores)
4. Exportacao (Excel/PDF/CSV)

### Frontend
1. Painel admin - Dashboard
2. Gestao de parceiros
3. Gestao de campanhas
4. Relatorios com graficos

## Fase 4 - Avancado (2 semanas)

1. Google Maps interativo
2. Notificacoes (email + push)
3. WhatsApp API integration
4. Upload de logos (Cloudflare R2)
5. Testes automatizados
6. Deploy producao

## Comandos de Setup

### Frontend
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir
cd frontend
npm install zustand @tanstack/react-query axios zod react-hook-form
npm install @react-google-maps/api recharts
npx shadcn-ui@latest init
```

### Backend
```bash
npm i -g @nestjs/cli
nest new backend
cd backend
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install @nestjs/bull bull ioredis
npm install bcrypt uuid
```

### Docker (PostgreSQL + Redis)
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgis/postgis:15-3.3
    environment:
      POSTGRES_DB: autovale_clube
      POSTGRES_USER: autovale
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

## Variaveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://autovale:senha@localhost:5432/autovale_clube
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
GOOGLE_MAPS_API_KEY=sua_chave
REDIS_URL=redis://localhost:6379
AWS_S3_BUCKET=autovale-clube
AWS_REGION=us-east-1
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@autovaleprevencoes.org.br
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_GOOGLE_MAPS_KEY=sua_chave
NEXT_PUBLIC_APP_NAME=Clube Auto Vale
```
