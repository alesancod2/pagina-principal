-- ============================================
-- TABELAS DE CUPONS E CAMPANHAS
-- ============================================

-- CAMPAIGNS
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type campaign_type NOT NULL,
    rules JSONB DEFAULT '{}',
    points_multiplier DECIMAL(3,1) DEFAULT 1.0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    target_categories VARCHAR(255)[],
    target_plans VARCHAR(100)[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- COUPONS
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    partner_id UUID REFERENCES partners(id),
    benefit_id UUID REFERENCES partner_benefits(id),
    campaign_id UUID REFERENCES campaigns(id),
    user_id UUID REFERENCES users(id),
    status coupon_status DEFAULT 'active',
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    discount_value DECIMAL(10,2),
    discount_type VARCHAR(20) DEFAULT 'percent',
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type notification_type NOT NULL,
    channel notification_channel DEFAULT 'in_app',
    reference_id UUID,
    reference_type VARCHAR(50),
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- SYSTEM_CONFIG
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description VARCHAR(500),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REFRESH_TOKENS
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PARTNER_RATINGS
CREATE TABLE partner_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, partner_id)
);
