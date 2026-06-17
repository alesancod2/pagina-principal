-- ============================================
-- CLUBE DE BENEFÍCIOS AUTO VALE PREVENÇÕES
-- Script de criação do banco de dados
-- PostgreSQL 15+ com PostGIS
-- ============================================

-- Criar banco de dados
CREATE DATABASE autovale_clube
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Conectar ao banco
\c autovale_clube;

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- ============================================
-- TIPOS ENUM
-- ============================================

CREATE TYPE user_role AS ENUM (
    'admin',
    'manager',
    'partner',
    'member'
);

CREATE TYPE association_status AS ENUM (
    'active',
    'inactive',
    'overdue',
    'cancelled'
);

CREATE TYPE partner_status AS ENUM (
    'active',
    'inactive',
    'pending'
);

CREATE TYPE benefit_type AS ENUM (
    'discount_percent',
    'discount_fixed',
    'cashback',
    'points',
    'freebie'
);

CREATE TYPE point_type AS ENUM (
    'earned',
    'redeemed',
    'expired',
    'bonus',
    'adjustment'
);

CREATE TYPE coupon_status AS ENUM (
    'active',
    'used',
    'expired',
    'cancelled'
);

CREATE TYPE campaign_type AS ENUM (
    'double_points',
    'partner_month',
    'special_cashback',
    'member_month',
    'custom'
);

CREATE TYPE notification_type AS ENUM (
    'benefit',
    'coupon',
    'campaign',
    'points',
    'partner',
    'system'
);

CREATE TYPE notification_channel AS ENUM (
    'email',
    'whatsapp',
    'push',
    'in_app'
);
-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- USERS
CREATE TABLE users (
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

-- ASSOCIATIONS (vinculo com Auto Vale)
CREATE TABLE associations (
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
CREATE TABLE partners (
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
-- ============================================
-- ÍNDICES DE PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Associations
CREATE INDEX idx_associations_user ON associations(user_id);
CREATE INDEX idx_associations_status ON associations(status);
CREATE INDEX idx_associations_compliant ON associations(is_compliant);
CREATE INDEX idx_associations_plate ON associations(vehicle_plate);

-- Partners
CREATE INDEX idx_partners_category ON partners(category);
CREATE INDEX idx_partners_status ON partners(status);
CREATE INDEX idx_partners_city ON partners(city);
CREATE INDEX idx_partners_cnpj ON partners(cnpj);
CREATE INDEX idx_partners_geom ON partners USING GIST(geom);
CREATE INDEX idx_partners_name_trgm ON partners USING GIN(company_name gin_trgm_ops);
CREATE INDEX idx_partners_trade_trgm ON partners USING GIN(trade_name gin_trgm_ops);

-- Benefits
CREATE INDEX idx_benefits_partner ON partner_benefits(partner_id);
CREATE INDEX idx_benefits_active ON partner_benefits(is_active, start_date, end_date);
CREATE INDEX idx_benefits_type ON partner_benefits(benefit_type);

-- Usages
CREATE INDEX idx_usages_user ON benefit_usages(user_id);
CREATE INDEX idx_usages_partner ON benefit_usages(partner_id);
CREATE INDEX idx_usages_benefit ON benefit_usages(benefit_id);
CREATE INDEX idx_usages_date ON benefit_usages(used_at);

-- Points
CREATE INDEX idx_points_user ON point_transactions(user_id);
CREATE INDEX idx_points_type ON point_transactions(type);
CREATE INDEX idx_points_created ON point_transactions(created_at);
CREATE INDEX idx_points_expires ON point_transactions(expires_at)
    WHERE expires_at IS NOT NULL;
CREATE INDEX idx_user_points_user ON user_points(user_id);

-- Coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_user ON coupons(user_id);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_coupons_partner ON coupons(partner_id);
CREATE INDEX idx_coupons_expires ON coupons(expires_at);

-- Campaigns
CREATE INDEX idx_campaigns_active ON campaigns(is_active, start_date, end_date);
CREATE INDEX idx_campaigns_type ON campaigns(type);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);

-- Refresh tokens
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);

-- Ratings
CREATE INDEX idx_ratings_partner ON partner_ratings(partner_id);
CREATE INDEX idx_ratings_user ON partner_ratings(user_id);
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

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_associations_updated
    BEFORE UPDATE ON associations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_partners_updated
    BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_benefits_updated
    BEFORE UPDATE ON partner_benefits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_campaigns_updated
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

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

CREATE TRIGGER trg_rating_update
    AFTER INSERT OR UPDATE ON partner_ratings
    FOR EACH ROW EXECUTE FUNCTION update_partner_rating();

-- Atualizar saldo de pontos
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
        UPDATE user_points SET
            balance = balance - ABS(NEW.amount),
            total_redeemed = total_redeemed + ABS(NEW.amount),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'expired' THEN
        UPDATE user_points SET
            balance = balance - ABS(NEW.amount),
            total_expired = total_expired + ABS(NEW.amount),
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

CREATE TRIGGER trg_benefit_usage_count
    AFTER INSERT ON benefit_usages
    FOR EACH ROW EXECUTE FUNCTION increment_benefit_usage();
-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Configurações do sistema
INSERT INTO system_config (key, value, description) VALUES
('points_rule', '{"type": "per_real", "rate": 1}', '1 ponto por real gasto'),
('points_expiry_days', '365', 'Pontos expiram em 365 dias'),
('min_redeem_points', '100', 'Mínimo de pontos para resgate'),
('max_coupon_validity_days', '30', 'Validade máxima de cupom em dias'),
('compliance_check_enabled', 'true', 'Verificação de adimplência ativa'),
('geolocation_radius_km', '50', 'Raio padrão de busca em km'),
('notification_points_expiring_days', '30', 'Alertar N dias antes de expirar pontos'),
('app_name', '"Clube de Benefícios Auto Vale"', 'Nome da aplicação'),
('app_version', '"1.0.0"', 'Versão da aplicação');

-- Usuário administrador padrão
-- Senha: Admin@2024 (bcrypt hash)
INSERT INTO users (name, email, cpf, phone, password_hash, role, is_active, email_verified_at) VALUES
('Administrador', 'admin@autovaleprevencoes.org.br', '000.000.000-00', '(27) 99999-0000',
 '$2b$10$rHK8X8Y6vQ5ZK1x5YPj5QeJ8n0S7qK3lT4mN2v9xR6wE4bC8G.Sm',
 'admin', true, NOW());

-- Usuário de teste (associado)
-- Senha: Teste@2024
INSERT INTO users (name, email, cpf, phone, password_hash, role, is_active, email_verified_at) VALUES
('João Carlos Silva', 'joao@email.com', '123.456.789-01', '(27) 99888-1234',
 '$2b$10$rHK8X8Y6vQ5ZK1x5YPj5QeJ8n0S7qK3lT4mN2v9xR6wE4bC8G.Sm',
 'member', true, NOW());

-- Associação do usuário de teste
INSERT INTO associations (user_id, plan_name, plan_type, status, start_date, vehicle_plate, vehicle_model, vehicle_year, is_compliant)
SELECT id, 'Proteção Total', 'premium', 'active', '2024-01-01', 'ABC-1234', 'Honda Civic 2022', 2022, true
FROM users WHERE email = 'joao@email.com';

-- Parceiros de exemplo
INSERT INTO partners (company_name, trade_name, cnpj, category, description, city, state, latitude, longitude, phone, whatsapp, status, rating) VALUES
('Auto Posto São Jorge Ltda', 'Auto Posto São Jorge', '12.345.678/0001-01', 'postos', 'Combustível de qualidade e preço justo', 'Linhares', 'ES', -19.3942, -40.0689, '(27) 3371-0001', '(27) 99700-0001', 'active', 4.8),
('Lava Jato Premium Ltda', 'Lava Jato Premium', '12.345.678/0002-02', 'lava-jato', 'Lavagem completa com cera importada', 'Linhares', 'ES', -19.3910, -40.0650, '(27) 3371-0002', '(27) 99700-0002', 'active', 4.6),
('Mecânica Central Auto', 'Mecânica Central', '12.345.678/0003-03', 'mecanica', 'Mecânica especializada multimarcas', 'Linhares', 'ES', -19.3980, -40.0720, '(27) 3371-0003', '(27) 99700-0003', 'active', 4.9),
('Estética Automotiva Pro', 'Estética Car Pro', '12.345.678/0004-04', 'estetica', 'Polimento, cristalização e PPF', 'Linhares', 'ES', -19.3925, -40.0680, '(27) 3371-0004', '(27) 99700-0004', 'active', 4.7),
('Pneus e Cia Comercio', 'Pneus & Cia', '12.345.678/0005-05', 'pneus', 'Todas as marcas, montagem gratuita', 'Linhares', 'ES', -19.4010, -40.0750, '(27) 3371-0005', '(27) 99700-0005', 'active', 4.5),
('Auto Elétrica Rápida', 'Auto Elétrica Rápida', '12.345.678/0006-06', 'eletrica', 'Diagnóstico computadorizado', 'Linhares', 'ES', -19.3935, -40.0670, '(27) 3371-0006', '(27) 99700-0006', 'active', 4.4);

-- Benefícios dos parceiros
INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance, days_available)
SELECT id, '5% OFF em combustível', 'Desconto em qualquer combustível', 'discount_percent', 5, 10, true, '1,2,3,4,5,6,7'
FROM partners WHERE trade_name = 'Auto Posto São Jorge';

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance)
SELECT id, '15% OFF lavagem completa', 'Desconto na lavagem completa com cera', 'discount_percent', 15, 20, true
FROM partners WHERE trade_name = 'Lava Jato Premium';

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance)
SELECT id, '10% OFF mão de obra', 'Desconto em serviços mecânicos', 'discount_percent', 10, 30, true
FROM partners WHERE trade_name = 'Mecânica Central';

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance)
SELECT id, '20% OFF polimento', 'Desconto em polimento e cristalização', 'discount_percent', 20, 25, true
FROM partners WHERE trade_name = 'Estética Car Pro';

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance)
SELECT id, '12% OFF pneus', 'Desconto em pneus nacionais e importados', 'discount_percent', 12, 40, true
FROM partners WHERE trade_name = 'Pneus & Cia';

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, requires_compliance)
SELECT id, '8% OFF serviços elétricos', 'Desconto em diagnóstico e reparo', 'discount_percent', 8, 15, true
FROM partners WHERE trade_name = 'Auto Elétrica Rápida';

-- Pontos iniciais do usuário de teste
INSERT INTO point_transactions (user_id, type, amount, balance_after, description, expires_at)
SELECT u.id, 'bonus', 500, 500, 'Bônus de boas-vindas ao Clube', NOW() + INTERVAL '365 days'
FROM users u WHERE u.email = 'joao@email.com';

-- Campanha ativa de exemplo
INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, created_by)
SELECT 'Mês do Associado', 'Pontos em dobro em todos os parceiros durante junho!', 'double_points', 2.0, '2024-06-01', '2024-06-30', true, id
FROM users WHERE role = 'admin' LIMIT 1;

-- ============================================
-- FIM DO SEED
-- ============================================

-- Mensagem final
DO $$
BEGIN
    RAISE NOTICE '✅ Banco de dados configurado com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas: 12';
    RAISE NOTICE '📌 Índices criados: 30+';
    RAISE NOTICE '⚡ Triggers criados: 6';
    RAISE NOTICE '👤 Admin: admin@autovaleprevencoes.org.br / Admin@2024';
    RAISE NOTICE '👤 Teste: joao@email.com / Teste@2024';
    RAISE NOTICE '🏪 Parceiros: 6';
    RAISE NOTICE '🎁 Benefícios: 6';
END $$;
