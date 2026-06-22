-- ============================================
-- CLUBE DE BENEFÍCIOS AUTO VALE PREVENÇÕES
-- Script completo para Supabase SQL Editor
-- Compatível com PostgreSQL 15+ 
-- ============================================
-- INSTRUÇÕES:
-- 1. Acesse app.supabase.com > seu projeto
-- 2. Vá em SQL Editor > New query
-- 3. Cole este script inteiro
-- 4. Clique em Run
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TIPOS ENUM
-- ============================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'partner', 'member');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE association_status AS ENUM ('active', 'inactive', 'overdue', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE benefit_type AS ENUM ('discount_percent', 'discount_fixed', 'cashback', 'points', 'freebie');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE point_type AS ENUM ('earned', 'redeemed', 'expired', 'bonus', 'adjustment');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE coupon_status AS ENUM ('active', 'used', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_type AS ENUM ('double_points', 'partner_month', 'special_cashback', 'member_month', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('benefit', 'coupon', 'campaign', 'points', 'partner', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'push', 'in_app');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE usage_request_status AS ENUM ('pending', 'confirmed', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE voucher_status AS ENUM ('active', 'used', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'member',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ASSOCIATIONS (vínculo com Auto Vale)
CREATE TABLE IF NOT EXISTS associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status association_status DEFAULT 'active',
    start_date DATE NOT NULL,
    due_date DATE,
    vehicle_plate VARCHAR(10),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    is_compliant BOOLEAN DEFAULT true,
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTNERS
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
    geom GEOMETRY(Point, 4326),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    logo_url TEXT,
    cover_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    status partner_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTNER_BENEFITS
CREATE TABLE IF NOT EXISTS partner_benefits (
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
CREATE TABLE IF NOT EXISTS benefit_usages (
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
CREATE TABLE IF NOT EXISTS point_transactions (
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
CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id),
    balance INTEGER DEFAULT 0,
    total_earned INTEGER DEFAULT 0,
    total_redeemed INTEGER DEFAULT 0,
    total_expired INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
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
CREATE TABLE IF NOT EXISTS coupons (
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
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description VARCHAR(500),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REFRESH_TOKENS
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- PARTNER_RATINGS
CREATE TABLE IF NOT EXISTS partner_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, partner_id)
);

-- USAGE_REQUESTS (solicitações de uso de benefício)
CREATE TABLE IF NOT EXISTS usage_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    benefit_id UUID NOT NULL REFERENCES partner_benefits(id),
    status usage_request_status DEFAULT 'pending',
    qr_token VARCHAR(20),
    requested_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    confirmed_by UUID REFERENCES users(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '15 minutes'),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- VOUCHERS (comprovantes de uso)
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    benefit_id UUID REFERENCES partner_benefits(id),
    usage_request_id UUID REFERENCES usage_requests(id),
    status voucher_status DEFAULT 'active',
    amount DECIMAL(10,2),
    discount_applied DECIMAL(10,2),
    points_earned INTEGER DEFAULT 0,
    issued_at TIMESTAMP DEFAULT NOW(),
    used_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- QRCODE_SESSIONS (sessões de QR Code)
CREATE TABLE IF NOT EXISTS qrcode_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(20) UNIQUE NOT NULL,
    partner_id UUID REFERENCES partners(id),
    redirect_url TEXT,
    is_active BOOLEAN DEFAULT true,
    scanned_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ============================================
-- ÍNDICES DE PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_associations_user ON associations(user_id);
CREATE INDEX IF NOT EXISTS idx_associations_status ON associations(status);
CREATE INDEX IF NOT EXISTS idx_associations_compliant ON associations(is_compliant);

CREATE INDEX IF NOT EXISTS idx_partners_category ON partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_cnpj ON partners(cnpj);
CREATE INDEX IF NOT EXISTS idx_partners_geom ON partners USING GIST(geom);

CREATE INDEX IF NOT EXISTS idx_benefits_partner ON partner_benefits(partner_id);
CREATE INDEX IF NOT EXISTS idx_benefits_active ON partner_benefits(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_benefits_type ON partner_benefits(benefit_type);

CREATE INDEX IF NOT EXISTS idx_usages_user ON benefit_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_usages_partner ON benefit_usages(partner_id);
CREATE INDEX IF NOT EXISTS idx_usages_date ON benefit_usages(used_at);

CREATE INDEX IF NOT EXISTS idx_points_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_type ON point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_points_created ON point_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_user ON coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);

CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(is_active, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent ON notifications(sent_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

CREATE INDEX IF NOT EXISTS idx_usage_requests_user ON usage_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_requests_partner ON usage_requests(partner_id);
CREATE INDEX IF NOT EXISTS idx_usage_requests_status ON usage_requests(status);
CREATE INDEX IF NOT EXISTS idx_usage_requests_token ON usage_requests(qr_token);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(user_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);

CREATE INDEX IF NOT EXISTS idx_qrcode_sessions_token ON qrcode_sessions(token);
CREATE INDEX IF NOT EXISTS idx_qrcode_sessions_active ON qrcode_sessions(is_active);

-- ============================================
-- TRIGGERS E FUNÇÕES
-- ============================================

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_associations_updated ON associations;
CREATE TRIGGER trg_associations_updated
    BEFORE UPDATE ON associations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_partners_updated ON partners;
CREATE TRIGGER trg_partners_updated
    BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_benefits_updated ON partner_benefits;
CREATE TRIGGER trg_benefits_updated
    BEFORE UPDATE ON partner_benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_campaigns_updated ON campaigns;
CREATE TRIGGER trg_campaigns_updated
    BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_usage_requests_updated ON usage_requests;
CREATE TRIGGER trg_usage_requests_updated
    BEFORE UPDATE ON usage_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Atualizar geom quando lat/lng mudam
CREATE OR REPLACE FUNCTION update_partner_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.geom = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_geom ON partners;
CREATE TRIGGER trg_partner_geom
    BEFORE INSERT OR UPDATE OF latitude, longitude ON partners
    FOR EACH ROW EXECUTE FUNCTION update_partner_geom();

-- Atualizar rating do parceiro
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partners SET
        rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM partner_ratings WHERE partner_id = NEW.partner_id),
        total_ratings = (SELECT COUNT(*) FROM partner_ratings WHERE partner_id = NEW.partner_id)
    WHERE id = NEW.partner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rating_update ON partner_ratings;
CREATE TRIGGER trg_rating_update
    AFTER INSERT OR UPDATE ON partner_ratings
    FOR EACH ROW EXECUTE FUNCTION update_partner_rating();

-- Atualizar saldo de pontos (NUNCA permite saldo negativo)
CREATE OR REPLACE FUNCTION update_user_points_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_points (user_id, balance, total_earned, total_redeemed, total_expired)
    VALUES (NEW.user_id, 0, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    IF NEW.type = 'earned' OR NEW.type = 'bonus' THEN
        UPDATE user_points SET
            balance = balance + NEW.amount,
            total_earned = total_earned + NEW.amount,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'redeemed' THEN
        -- Garantir que saldo não fique negativo
        UPDATE user_points SET
            balance = GREATEST(0, balance - ABS(NEW.amount)),
            total_redeemed = total_redeemed + ABS(NEW.amount),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'expired' THEN
        UPDATE user_points SET
            balance = GREATEST(0, balance - ABS(NEW.amount)),
            total_expired = total_expired + ABS(NEW.amount),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_points_balance ON point_transactions;
CREATE TRIGGER trg_points_balance
    AFTER INSERT ON point_transactions
    FOR EACH ROW EXECUTE FUNCTION update_user_points_balance();

-- Incrementar uso do benefício
CREATE OR REPLACE FUNCTION increment_benefit_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE partner_benefits SET
        current_uses = current_uses + 1
    WHERE id = NEW.benefit_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_benefit_usage_count ON benefit_usages;
CREATE TRIGGER trg_benefit_usage_count
    AFTER INSERT ON benefit_usages
    FOR EACH ROW EXECUTE FUNCTION increment_benefit_usage();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Configurações do sistema
INSERT INTO system_config (key, value, description) VALUES
('points_per_usage', '50', 'Pontos ganhos por utilização de parceiro'),
('points_expiry_days', '365', 'Pontos expiram em 365 dias'),
('min_redeem_points', '100', 'Mínimo de pontos para resgate de cupom'),
('max_coupon_validity_days', '30', 'Validade máxima de cupom em dias'),
('compliance_check_enabled', 'true', 'Verificação de adimplência ativa'),
('geolocation_radius_km', '50', 'Raio padrão de busca em km'),
('qr_redirect_url', '"https://clube.autovaleprevencoes.org.br/auth"', 'URL de redirecionamento para QR Code (câmera nativa)'),
('app_name', '"Clube de Benefícios Auto Vale"', 'Nome da aplicação'),
('app_version', '"1.0.0"', 'Versão da aplicação')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- Usuário administrador padrão (Senha: Admin@2024)
INSERT INTO users (name, email, cpf, phone, password_hash, role, is_active, email_verified_at) VALUES
('Administrador', 'admin@autovaleprevencoes.org.br', '000.000.000-00', '(27) 99999-0000',
 '$2b$10$rHK8X8Y6vQ5ZK1x5YPj5QeJ8n0S7qK3lT4mN2v9xR6wE4bC8G.Sm',
 'admin', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '✓ Schema criado com sucesso! Total de tabelas: %', table_count;
END $$;
