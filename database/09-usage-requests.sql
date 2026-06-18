-- =============================================
-- 09 - TABELA DE SOLICITAÇÕES DE UTILIZAÇÃO
-- Sistema sem voucher único - confirmação pelo parceiro
-- =============================================

CREATE TABLE usage_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    benefit_id UUID NOT NULL REFERENCES partner_benefits(id),
    usage_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
    points_to_credit INTEGER DEFAULT 0,
    confirmed_at TIMESTAMP,
    confirmed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_requests_user ON usage_requests(user_id);
CREATE INDEX idx_usage_requests_partner ON usage_requests(partner_id);
CREATE INDEX idx_usage_requests_code ON usage_requests(usage_code);
CREATE INDEX idx_usage_requests_status ON usage_requests(status);
