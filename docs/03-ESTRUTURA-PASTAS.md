# Estrutura de Pastas

## Frontend (Next.js)

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (portal)/
│   │   ├── dashboard/page.tsx
│   │   ├── marketplace/page.tsx
│   │   ├── marketplace/[partnerId]/page.tsx
│   │   ├── points/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── history/page.tsx
│   │   ├── profile/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── dashboard/page.tsx
│   │   ├── partners/page.tsx
│   │   ├── partners/[id]/page.tsx
│   │   ├── partners/new/page.tsx
│   │   ├── members/page.tsx
│   │   ├── campaigns/page.tsx
│   │   ├── campaigns/[id]/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/ (Shadcn components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   ├── marketplace/
│   │   ├── PartnerCard.tsx
│   │   ├── PartnerGrid.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── SearchBar.tsx
│   │   └── MapView.tsx
│   ├── dashboard/
│   │   ├── StatsCards.tsx
│   │   ├── PointsChart.tsx
│   │   ├── RecentActivity.tsx
│   │   └── NearbyPartners.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       └── Pagination.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePartners.ts
│   ├── usePoints.ts
│   ├── useCoupons.ts
│   ├── useGeolocation.ts
│   └── useTheme.ts
├── lib/
│   ├── api.ts (axios instance)
│   ├── auth.ts
│   ├── utils.ts
│   └── constants.ts
├── stores/
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── locationStore.ts
├── types/
│   ├── user.ts
│   ├── partner.ts
│   ├── benefit.ts
│   ├── coupon.ts
│   └── campaign.ts
├── public/
│   ├── logos/
│   └── icons/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Backend (NestJS)

```
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── compliance.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── google.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── entities/user.entity.ts
│   │   ├── partners/
│   │   │   ├── partners.module.ts
│   │   │   ├── partners.controller.ts
│   │   │   ├── partners.service.ts
│   │   │   ├── entities/partner.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-partner.dto.ts
│   │   │       └── update-partner.dto.ts
│   │   ├── benefits/
│   │   │   ├── benefits.module.ts
│   │   │   ├── benefits.controller.ts
│   │   │   ├── benefits.service.ts
│   │   │   └── entities/benefit.entity.ts
│   │   ├── points/
│   │   │   ├── points.module.ts
│   │   │   ├── points.controller.ts
│   │   │   ├── points.service.ts
│   │   │   └── entities/point-transaction.entity.ts
│   │   ├── coupons/
│   │   │   ├── coupons.module.ts
│   │   │   ├── coupons.controller.ts
│   │   │   ├── coupons.service.ts
│   │   │   └── entities/coupon.entity.ts
│   │   ├── campaigns/
│   │   │   ├── campaigns.module.ts
│   │   │   ├── campaigns.controller.ts
│   │   │   ├── campaigns.service.ts
│   │   │   └── entities/campaign.entity.ts
│   │   ├── geolocation/
│   │   │   ├── geolocation.module.ts
│   │   │   ├── geolocation.controller.ts
│   │   │   └── geolocation.service.ts
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── processors/
│   │   │   │   ├── email.processor.ts
│   │   │   │   ├── whatsapp.processor.ts
│   │   │   │   └── push.processor.ts
│   │   │   └── entities/notification.entity.ts
│   │   └── reports/
│   │       ├── reports.module.ts
│   │       ├── reports.controller.ts
│   │       └── reports.service.ts
│   └── config/
│       ├── database.config.ts
│       ├── jwt.config.ts
│       ├── redis.config.ts
│       └── storage.config.ts
├── test/
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── nest-cli.json
└── package.json
```
