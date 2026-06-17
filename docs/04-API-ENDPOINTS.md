# Endpoints da API

Base URL: `https://api.clube.autovaleprevencoes.org.br/v1`

## Autenticacao

| Metodo | Rota                  | Descricao              | Auth |
|--------|----------------------|------------------------|------|
| POST   | /auth/login          | Login email/CPF        | Nao  |
| POST   | /auth/register       | Cadastro               | Nao  |
| POST   | /auth/refresh        | Renovar token          | Sim  |
| POST   | /auth/forgot-password| Solicitar reset        | Nao  |
| POST   | /auth/reset-password | Resetar senha          | Nao  |
| POST   | /auth/google         | Login Google OAuth     | Nao  |
| GET    | /auth/me             | Dados do usuario logado| Sim  |

## Parceiros

| Metodo | Rota                       | Descricao                    | Auth  |
|--------|---------------------------|------------------------------|-------|
| GET    | /partners                 | Listar parceiros             | Sim   |
| GET    | /partners/:id             | Detalhe do parceiro          | Sim   |
| GET    | /partners/nearby          | Parceiros proximos (GPS)     | Sim   |
| GET    | /partners/category/:cat   | Filtrar por categoria        | Sim   |
| POST   | /partners                 | Criar parceiro               | Admin |
| PUT    | /partners/:id             | Atualizar parceiro           | Admin |
| PATCH  | /partners/:id/status      | Ativar/desativar             | Admin |
| DELETE | /partners/:id             | Remover parceiro             | Admin |

### Query params para GET /partners
```
?page=1
&limit=20
&category=postos
&city=Linhares
&lat=-19.391
&lng=-40.072
&radius=10 (km)
&sort=distance|discount|rating|points
&search=nome do parceiro
```

## Beneficios

| Metodo | Rota                          | Descricao                | Auth  |
|--------|------------------------------|--------------------------|-------|
| GET    | /benefits                    | Listar beneficios        | Sim   |
| GET    | /benefits/:id                | Detalhe do beneficio     | Sim   |
| GET    | /benefits/partner/:id        | Beneficios de um parceiro| Sim   |
| POST   | /benefits                    | Criar beneficio          | Admin |
| PUT    | /benefits/:id                | Atualizar beneficio      | Admin |
| POST   | /benefits/:id/use            | Utilizar beneficio       | Sim   |

## Pontos

| Metodo | Rota                    | Descricao                | Auth |
|--------|------------------------|--------------------------|------|
| GET    | /points/balance        | Saldo atual              | Sim  |
| GET    | /points/history        | Historico de movimentacoes| Sim  |
| POST   | /points/redeem         | Resgatar pontos          | Sim  |
| GET    | /points/expiring       | Pontos a expirar         | Sim  |

## Cupons

| Metodo | Rota                    | Descricao                | Auth  |
|--------|------------------------|--------------------------|-------|
| GET    | /coupons               | Meus cupons              | Sim   |
| GET    | /coupons/:code         | Validar cupom            | Sim   |
| POST   | /coupons/generate      | Gerar cupom              | Sim   |
| POST   | /coupons/:id/use       | Utilizar cupom           | Sim   |
| POST   | /coupons/batch         | Gerar cupons em lote     | Admin |

## Campanhas

| Metodo | Rota                    | Descricao                | Auth  |
|--------|------------------------|--------------------------|-------|
| GET    | /campaigns             | Campanhas ativas         | Sim   |
| GET    | /campaigns/:id         | Detalhe da campanha      | Sim   |
| POST   | /campaigns             | Criar campanha           | Admin |
| PUT    | /campaigns/:id         | Atualizar campanha       | Admin |
| DELETE | /campaigns/:id         | Remover campanha         | Admin |

## Relatorios (Admin)

| Metodo | Rota                        | Descricao                | Auth  |
|--------|----------------------------|--------------------------|-------|
| GET    | /reports/usage             | Relatorio de utilizacao  | Admin |
| GET    | /reports/points            | Relatorio de pontos      | Admin |
| GET    | /reports/partners/ranking  | Ranking de parceiros     | Admin |
| GET    | /reports/members           | Relatorio de associados  | Admin |
| GET    | /reports/export/:type      | Exportar (excel/pdf/csv) | Admin |

## Notificacoes

| Metodo | Rota                       | Descricao                | Auth |
|--------|---------------------------|--------------------------|------|
| GET    | /notifications            | Minhas notificacoes      | Sim  |
| PATCH  | /notifications/:id/read   | Marcar como lida         | Sim  |
| PATCH  | /notifications/read-all   | Marcar todas como lidas  | Sim  |

## Admin - Dashboard

| Metodo | Rota                    | Descricao                | Auth  |
|--------|------------------------|--------------------------|-------|
| GET    | /admin/stats           | Indicadores gerais       | Admin |
| GET    | /admin/stats/monthly   | Indicadores mensais      | Admin |

## Formato de Resposta Padrao

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 127,
    "totalPages": 7
  }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token invalido ou expirado",
    "statusCode": 401
  }
}
```
