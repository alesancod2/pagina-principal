-- TABELA DE VOUCHERS
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER DEFAULT 1,
    period_control VARCHAR(20) DEFAULT 'mensal' CHECK (period_control IN ('diario', 'semanal', 'mensal', 'trimestral', 'anual', 'ilimitado')),
    points_generated INTEGER DEFAULT 0,
    discount_percent DECIMAL(5,2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(partner_id, code)
);

-- TABELA DE UTILIZAÇÕES DE VOUCHER
CREATE TABLE voucher_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES partners(id),
    user_id UUID NOT NULL REFERENCES users(id),
    used_at TIMESTAMP DEFAULT NOW(),
    confirmed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ÍNDICES
CREATE INDEX idx_vouchers_partner ON vouchers(partner_id);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active, start_date, end_date);
CREATE INDEX idx_voucher_usages_voucher ON voucher_usages(voucher_id);
CREATE INDEX idx_voucher_usages_user ON voucher_usages(user_id);
CREATE INDEX idx_voucher_usages_partner ON voucher_usages(partner_id);
CREATE INDEX idx_voucher_usages_date ON voucher_usages(used_at);

-- TRIGGER updated_at
CREATE TRIGGER trg_vouchers_updated
    BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- SEED: Vouchers de exemplo
INSERT INTO vouchers (partner_id, code, title, description, usage_limit, period_control, points_generated, discount_percent, start_date, end_date)
SELECT id, 'DESCONTO10', 'Desconto 10% Lavagem', 'Desconto de 10% na lavagem completa', 3, 'mensal', 20, 10.00, '2024-01-01', '2025-12-31'
FROM partners WHERE trade_name = 'Lava Jato Premium'
UNION ALL
SELECT id, 'OLEO20', 'Desconto Troca de Óleo', '20% de desconto na troca de óleo', 2, 'mensal', 30, 20.00, '2024-01-01', '2025-12-31'
FROM partners WHERE trade_name = 'Mecânica Central'
UNION ALL
SELECT id, 'COMBUSTIVEL5', 'Desconto Combustível', '5% OFF em qualquer combustível', 10, 'mensal', 10, 5.00, '2024-01-01', '2025-12-31'
FROM partners WHERE trade_name = 'Auto Posto São Jorge';
