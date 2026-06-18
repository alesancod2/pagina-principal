# CHANGELOG - Clube de Benefícios Auto Vale Prevenções

Registro completo de todas as alterações realizadas no projeto.

---

## [1.0.0] - Junho 2024

### Etapa 1 - Autenticação (Backend Auth + Login)

**Arquivos criados:**
- `backend/src/modules/auth/auth.module.ts` - Módulo Auth (JWT + Passport)
- `backend/src/modules/auth/auth.controller.ts` - Endpoints: login, register, refresh, logout
- `backend/src/modules/auth/auth.service.ts` - Validação, bcrypt, geração de tokens
- `backend/src/modules/auth/dto/login.dto.ts` - Validação de login
- `backend/src/modules/auth/dto/register.dto.ts` - Validação de registro
- `backend/src/modules/auth/dto/refresh-token.dto.ts` - Validação de refresh
- `backend/src/modules/auth/strategies/jwt.strategy.ts` - JWT Strategy (Passport)
- `backend/src/modules/auth/entities/refresh-token.entity.ts` - Entity RefreshToken
- `backend/src/modules/users/entities/user.entity.ts` - Entity User
- `backend/src/modules/users/entities/association.entity.ts` - Entity Association
- `backend/src/modules/users/users.service.ts` - findById, findByEmail, create, getMe
- `backend/src/common/guards/jwt-auth.guard.ts` - Proteção de rotas
- `backend/src/common/guards/roles.guard.ts` - Proteção por perfil
- `backend/src/common/decorators/current-user.decorator.ts` - @CurrentUser()
- `backend/src/common/decorators/roles.decorator.ts` - @Roles()
- `frontend/src/services/api.ts` - Axios com interceptors
- `frontend/src/services/auth.service.ts` - Login, register, logout, getMe
- `frontend/src/hooks/useAuth.ts` - Hook React Query

**Endpoints:**
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout

---

### Etapa 2 - Integração API AEasy (Login por CPF)

**Arquivos criados:**
- `backend/src/modules/aeasy/aeasy.module.ts` - Módulo HTTP
- `backend/src/modules/aeasy/aeasy.service.ts` - Consulta AEasy, cache Redis 30min
- `backend/src/modules/aeasy/aeasy.dto.ts` - CpfLoginDto
- `backend/src/modules/aeasy/aeasy.guard.ts` - AssociationGuard (bloqueia inadimplentes)

**Arquivos alterados:**
- `backend/src/modules/auth/auth.controller.ts` - Novo endpoint POST /auth/cpf-login
- `backend/src/modules/auth/auth.service.ts` - Método cpfLogin()
- `backend/src/modules/users/users.service.ts` - syncWithAEasy(), getMe()
- `frontend/src/services/auth.service.ts` - Login via CPF

**Funcionalidades:**
- Login por CPF único (integração AEasy)
- Cache Redis 30 minutos
- Auto-cadastro se usuário não existir
- Sincronização de dados a cada login
- AssociationGuard para adimplência

---

### Etapa 3 - Área Administrativa + Marketplace Dinâmico

**Arquivos criados:**
- `backend/src/modules/partners/entities/partner.entity.ts` - Entity Partner
- `backend/src/modules/partners/dto/create-partner.dto.ts` - CreatePartnerDto
- `backend/src/modules/partners/dto/update-partner.dto.ts` - UpdatePartnerDto
- `backend/src/modules/partners/partners.service.ts` - CRUD + PostGIS
- `backend/src/modules/partners/partners.controller.ts` - 7 endpoints REST

**Endpoints:**
- GET /partners (listagem com filtros)
- GET /partners/nearby (geolocalização)
- GET /partners/:id (detalhe)
- POST /partners (criar - admin)
- PUT /partners/:id (atualizar - admin)
- PATCH /partners/:id/status (ativar/desativar)
- DELETE /partners/:id (soft delete)

---

### Etapa 4 - Benefícios

**Arquivos criados:**
- `backend/src/modules/benefits/entities/benefit.entity.ts`
- `backend/src/modules/benefits/entities/benefit-usage.entity.ts`
- `backend/src/modules/benefits/dto/create-benefit.dto.ts`
- `backend/src/modules/benefits/dto/use-benefit.dto.ts`
- `backend/src/modules/benefits/benefits.service.ts`
- `backend/src/modules/benefits/benefits.controller.ts`
- `backend/src/modules/benefits/benefits.module.ts`
- `frontend/src/services/partners.service.ts`
- `frontend/src/hooks/usePartners.ts`
- `frontend/src/hooks/useBenefits.ts`

**Endpoints:**
- GET /benefits
- GET /benefits/partner/:id
- GET /benefits/:id
- POST /benefits (admin)
- PUT /benefits/:id (admin)
- POST /benefits/:id/use (AssociationGuard)

---

### Etapa 5 - Geolocalização Frontend

**Arquivos criados:**
- `frontend/src/hooks/useGeolocation.ts` - navigator.geolocation
- `frontend/src/services/geolocation.service.ts` - Haversine, Google Maps URLs
- `frontend/src/components/marketplace/MapView.tsx` - Mapa interativo
- `frontend/src/components/marketplace/NearbyPartners.tsx` - Lista por distância
- `backend/src/modules/geolocation/geolocation.module.ts`
- `backend/src/modules/geolocation/geolocation.service.ts`
- `backend/src/modules/geolocation/geolocation.controller.ts`

---

### Etapa 6 - Sistema de Pontos

**Arquivos criados:**
- `backend/src/modules/points/entities/point-transaction.entity.ts`
- `backend/src/modules/points/entities/user-points.entity.ts`
- `backend/src/modules/points/dto/redeem-points.dto.ts`
- `backend/src/modules/points/points.service.ts`
- `backend/src/modules/points/points.controller.ts`
- `backend/src/modules/points/points.module.ts`
- `frontend/src/hooks/usePoints.ts`
- `frontend/src/services/points.service.ts`

**Endpoints:**
- GET /points/wallet
- GET /points/history
- GET /points/expiring
- POST /points/redeem

---

### Etapa 7 - Cupons

**Arquivos criados:**
- `backend/src/modules/coupons/entities/coupon.entity.ts`
- `backend/src/modules/coupons/dto/generate-coupon.dto.ts`
- `backend/src/modules/coupons/coupons.service.ts`
- `backend/src/modules/coupons/coupons.controller.ts`
- `backend/src/modules/coupons/coupons.module.ts`
- `frontend/src/hooks/useCoupons.ts`
- `frontend/src/services/coupons.service.ts`

**Endpoints:**
- GET /coupons
- GET /coupons/:code
- POST /coupons/generate
- POST /coupons/:id/use

---

### Etapa 8 - Utilização de Benefício (Fluxo Completo)

**Arquivos criados:**
- `backend/src/modules/benefits/use-benefit-flow.service.ts`
- `backend/src/modules/benefits/entities/usage-request.entity.ts`
- `frontend/src/components/marketplace/UseBenefitModal.tsx`

**Fluxo:**
1. Associado clica "Utilizar" → gera código AUTOVALE-XXXX
2. Status: PENDENTE
3. Parceiro confirma → pontos creditados
4. Status: CONFIRMADO

---

### Etapa 9 - Painel Administrativo (Backend)

**Arquivos criados:**
- `backend/src/modules/admin/admin.module.ts`
- `backend/src/modules/admin/admin.controller.ts`
- `backend/src/modules/admin/admin.service.ts`
- `backend/src/modules/campaigns/entities/campaign.entity.ts`
- `backend/src/modules/campaigns/campaigns.service.ts`
- `backend/src/modules/campaigns/campaigns.controller.ts`
- `backend/src/modules/campaigns/campaigns.module.ts`
- `backend/src/modules/campaigns/dto/create-campaign.dto.ts`

---

### Etapa 10 - Admin Frontend

**Arquivos criados:**
- `frontend/src/services/admin.service.ts`
- `frontend/src/hooks/useAdmin.ts`
- `frontend/src/components/admin/AdminSidebar.tsx`
- `frontend/src/components/admin/StatsCards.tsx`
- `frontend/src/components/admin/PartnersTable.tsx`
- `frontend/src/components/admin/PartnerForm.tsx`

---

### Deploy e Configuração

**Arquivos criados:**
- `vercel.json` (removido posteriormente - incompatível com static)
- `docker-compose.yml` - PostgreSQL + Redis local
- `Dockerfile.backend` - Multi-stage build
- `.github/workflows/deploy.yml` - CI/CD GitHub Actions
- `DEPLOY.md` - Guia de deploy em português
- `backend/.env.example` - Template variáveis backend
- `frontend/.env.example` - Template variáveis frontend
- `backend/src/app.module.ts` - Módulo raiz NestJS

---

### Banco de Dados (PostgreSQL + PostGIS)

**Arquivos SQL:**
- `database/00-FULL-DATABASE.sql` - Arquivo unificado
- `database/01-create-database.sql` - Extensões
- `database/02-create-types.sql` - 8 ENUMs
- `database/03-create-tables.sql` - Users, Associations, Partners
- `database/04-create-tables-benefits.sql` - Benefits, Points
- `database/05-create-tables-coupons.sql` - Coupons, Campaigns
- `database/06-create-indexes.sql` - 30+ índices
- `database/07-create-triggers.sql` - 6 triggers
- `database/08-seed-data.sql` - Dados iniciais
- `database/09-usage-requests.sql` - Solicitações de uso
- `database/10-vouchers.sql` - Vouchers por parceiro

---

### Frontend HTML (Self-contained)

**Arquivos:**
- `index.html` - Marketplace (versão modular)
- `marketplace-completo.html` - Marketplace (self-contained com base64)
- `admin-painel.html` - Painel Admin completo (10 seções)
- `styles.css` - Design System
- `scripts.js` - JavaScript marketplace

---

### Correções e Ajustes

**Correção de pontuação:**
- Pontos NÃO são exigidos para usar benefícios
- Pontos são APENAS creditados após uso
- Resgate de pontos é fluxo SEPARADO (escolha do associado)
- Texto: "Ganhe +X pontos" (não "Utilizar por X pontos")

**Sistema de utilização sem voucher único:**
- Código simples: AUTOVALE-XXXX
- Status: pendente → confirmado/cancelado
- Parceiro confirma → pontos creditados
- Pontos NÃO creditados imediatamente

**Vouchers por parceiro com limite configurável:**
- Voucher vinculado a parceiro_id
- Limite de uso por período (diário/semanal/mensal/trimestral/anual/ilimitado)
- Validação conta utilizações no período atual
- Bloqueio se exceder limite

---

### Modal de Detalhe do Parceiro

**Funcionalidade adicionada:**
- Clicar no card abre modal com detalhes completos
- Logo, nome, categoria, rating, localização
- Telefone, WhatsApp, endereço
- Descrição completa
- Lista de benefícios
- Botões: Utilizar + WhatsApp
- Dark mode, responsivo, animação

---

## Infraestrutura

### Serviços configurados:
- **Supabase**: PostgreSQL (db.dxvqawclzyjgwifbvbbr.supabase.co)
- **Upstash**: Redis (game-snail-150661.upstash.io)
- **Vercel**: Deploy (pagina-principal-eight.vercel.app)
- **AEasy API**: Token configurado

### Variáveis de ambiente:
```
DATABASE_URL=postgresql://postgres:[PASS]@db.dxvqawclzyjgwifbvbbr.supabase.co:5432/postgres
JWT_SECRET=autovale-clube-2024-prod-secret-key
AEASY_API_URL=https://api.autovaleprevencoes.org
AEASY_API_TOKEN=[configurado]
REDIS_URL=https://game-snail-150661.upstash.io
REDIS_TOKEN=[configurado]
```

---

## Repositórios

| Repositório | Conteúdo |
|-------------|----------|
| github.com/alesancod2/autovale-login | Página de Login |
| github.com/alesancod2/pagina-principal | Plataforma completa |

---

## Stack Tecnológica

- **Frontend**: Next.js + TypeScript + TailwindCSS + React Query
- **Backend**: NestJS + TypeORM + JWT + Passport
- **Banco**: PostgreSQL 15 + PostGIS
- **Cache**: Redis (Upstash)
- **Deploy**: Vercel
- **CI/CD**: GitHub Actions
- **Storage**: Cloudflare R2 (planejado)
- **Mapas**: Google Maps API
- **Integração**: API AEasy (Auto Vale Prevenções)
