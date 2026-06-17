-- ============================================
-- TABELAS DE BENEFÍCIOS E PONTOS
-- ============================================

-- PARTNER_BENEFITS
CREATE TABLE partner_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    benefit_type benefit_type NOT NULL,
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
    days_available VARCHAR(50) DEFAULT '1,2,3,4,5,6,7',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- BENEFIT_USAGES
CREATE TABLE benefit_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    benefit_id UUID NOT NULL REFERENCES partner_benefits(id),
    coupon_id UUID,
    amount DECIMAL(10,2),
    discount_applied DECIMAL(10,2),
    points_earned INTEGER DEFAULT 0,
    validated_by UUID REFERENCES users(id),
    notes TEXT,
    used_at TIMESTAMP DEFAULT NOW()
);

-- POINT_TRANSACTIONS
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID REFERENCES partners(id),
    type point_type NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description VARCHAR(500),
    reference_id UUID,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- USER_POINTS (saldo consolidado)
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    total_expired INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
