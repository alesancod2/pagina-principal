# Arquitetura do Sistema - Clube de Benefícios Auto Vale

## Visao Geral

```
+------------------+     +------------------+     +------------------+
|   FRONTEND       |     |    BACKEND       |     |   BANCO DE       |
|   (Next.js)      |<--->|    (NestJS)      |<--->|   DADOS          |
|   React + TS     |     |    Node.js       |     |   PostgreSQL     |
|   TailwindCSS    |     |    TypeORM       |     |                  |
+------------------+     +------------------+     +------------------+
        |                         |
        |                         |
+-------v--------+       +-------v--------+
| CDN/Storage    |       | Servicos       |
| Cloudflare R2  |       | Externos       |
| (logos, imgs)  |       | - Google Maps  |
+----------------+       | - WhatsApp API |
                          | - Email (SMTP) |
                          | - Push (FCM)   |
                          +----------------+
```

## Stack Tecnologica

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **UI**: TailwindCSS + Shadcn/UI
- **Estado**: Zustand
- **Requisicoes**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Mapas**: @react-google-maps/api
- **Graficos**: Recharts

### Backend
- **Framework**: NestJS 10+
- **Linguagem**: TypeScript
- **ORM**: TypeORM
- **Validacao**: class-validator + class-transformer
- **Auth**: JWT + Passport.js
- **Docs**: Swagger/OpenAPI
- **Cache**: Redis
- **Fila**: BullMQ (para notificacoes)

### Banco de Dados
- **Principal**: PostgreSQL 15+
- **Cache**: Redis
- **Busca**: PostgreSQL Full Text Search

### Infraestrutura
- **Deploy Frontend**: Vercel
- **Deploy Backend**: Railway / AWS ECS
- **Storage**: Cloudflare R2
- **CI/CD**: GitHub Actions

## Modulos do Sistema

### Portal do Associado
1. Dashboard (resumo, pontos, beneficios)
2. Marketplace (parceiros, categorias, busca)
3. Geolocalizacao (mapa, distancia, rotas)
4. Pontos (saldo, historico, resgate)
5. Cupons (ativos, utilizados, expirados)
6. Perfil (dados pessoais, configuracoes)

### Painel Administrativo
1. Dashboard (indicadores, graficos)
2. Parceiros (CRUD, status, beneficios)
3. Associados (gestao, adimplencia)
4. Campanhas (criacao, edicao, relatorios)
5. Relatorios (utilizacao, pontos, ranking)
6. Configuracoes (regras, notificacoes)

## Fluxo de Autenticacao

```
1. Login (email/CPF + senha)
2. Backend valida credenciais
3. Verifica adimplencia
4. Gera access_token (15min) + refresh_token (7d)
5. Frontend armazena tokens
6. Requisicoes incluem Authorization: Bearer <token>
7. Refresh automatico quando access_token expira
```

## Perfis de Acesso

| Perfil        | Portal Associado | Painel Admin | Gestao Parceiros | Config Sistema |
|---------------|:----------------:|:------------:|:----------------:|:--------------:|
| Administrador | Sim              | Sim          | Sim              | Sim            |
| Gestor        | Sim              | Sim          | Sim              | Nao            |
| Parceiro      | Nao              | Parcial      | So seus dados    | Nao            |
| Associado     | Sim              | Nao          | Nao              | Nao            |
