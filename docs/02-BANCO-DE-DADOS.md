# Modelos de Banco de Dados - PostgreSQL

## Diagrama ER (Resumido)

```
users ──────────── user_points ──────── point_transactions
  |                                            |
  |── associations                             |
  |                                            |
  |── user_coupons ──── coupons ──── partners ─┘
                                      |
                          partner_benefits
                                      |
                          benefit_usages
                                      |
                            campaigns
```

## Tabelas

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'partner', 'member') DEFAULT 'member',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### associations (vinculo com Auto Vale)
```sql
CREATE TABLE associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status ENUM('active', 'inactive', 'overdue', 'cancelled') DEFAULT 'active',
    start_date DATE NOT NULL,
    due_date DATE,
    vehicle_plate VARCHAR(10),
    vehicle_model VARCHAR(100),
    is_compliant BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### partners
```sql
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    zipcode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    logo_url TEXT,
    cover_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### partner_benefits
```sql
CREATE TABLE partner_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    benefit_type ENUM('discount_percent', 'discount_fixed', 'cashback', 'points', 'freebie') NOT NULL,
    discount_percent DECIMAL(5,2),
    discount_fixed DECIMAL(10,2),
    cashback_percent DECIMAL(5,2),
    points_generated INTEGER DEFAULT 0,
    points_required INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    max_uses INTEGER,
    max_uses_per_user INTEGER,
    current_uses INTEGER DEFAULT 0,
    requires_compliance BOOLEAN DEFAULT true,
    days_available VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### benefit_usages
```sql
CREATE TABLE benefit_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    partner_id UUID REFERENCES partners(id),
    benefit_id UUID REFERENCES partner_benefits(id),
    coupon_id UUID REFERENCES coupons(id),
    amount DECIMAL(10,2),
    discount_applied DECIMAL(10,2),
    points_earned INTEGER DEFAULT 0,
    validated_by UUID REFERENCES users(id),
    used_at TIMESTAMP DEFAULT NOW()
);
```

### point_transactions
```sql
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    partner_id UUID REFERENCES partners(id),
    type ENUM('earned', 'redeemed', 'expired', 'bonus', 'adjustment') NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description VARCHAR(500),
    reference_id UUID,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### coupons
```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    partner_id UUID REFERENCES partners(id),
    benefit_id UUID REFERENCES partner_benefits(id),
    campaign_id UUID REFERENCES campaigns(id),
    user_id UUID REFERENCES users(id),
    status ENUM('active', 'used', 'expired', 'cancelled') DEFAULT 'active',
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
);
```

### campaigns
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('double_points', 'partner_month', 'special_cashback', 'member_month', 'custom') NOT NULL,
    rules JSONB,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type ENUM('benefit', 'coupon', 'campaign', 'points', 'partner', 'system') NOT NULL,
    channel ENUM('email', 'whatsapp', 'push', 'in_app') NOT NULL,
    reference_id UUID,
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP DEFAULT NOW()
);
```

### system_config
```sql
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description VARCHAR(500),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Configuracoes iniciais
INSERT INTO system_config (key, value, description) VALUES
('points_rule', '{"type": "per_real", "rate": 1}', 'Regra de pontos: 1 ponto por real gasto'),
('points_expiry_days', '365', 'Dias para expirar pontos'),
('min_redeem_points', '100', 'Minimo de pontos para resgate');
```

## Indices Importantes

```sql
CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_location ON partners USING GIST(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_benefits_partner ON partner_benefits(partner_id);
CREATE INDEX idx_benefits_active ON partner_benefits(is_active, start_date, end_date);
CREATE INDEX idx_points_user ON point_transactions(user_id);
CREATE INDEX idx_coupons_user ON coupons(user_id, status);
CREATE INDEX idx_usages_user ON benefit_usages(user_id);
CREATE INDEX idx_usages_partner ON benefit_usages(partner_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```
