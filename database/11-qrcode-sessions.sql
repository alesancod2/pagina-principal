-- Tabela de sessões de utilização via QR Code
CREATE TABLE usage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    benefit_id UUID REFERENCES partner_benefits(id),
    qr_payload VARCHAR(50) NOT NULL,
    protocol VARCHAR(30) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'validated' CHECK (status IN ('validated', 'completed', 'cancelled', 'expired')),
    device_info VARCHAR(255),
    points_earned INTEGER DEFAULT 0,
    validated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_sessions_client ON usage_sessions(client_id);
CREATE INDEX idx_usage_sessions_partner ON usage_sessions(partner_id);
CREATE INDEX idx_usage_sessions_protocol ON usage_sessions(protocol);
CREATE INDEX idx_usage_sessions_status ON usage_sessions(status);
CREATE INDEX idx_usage_sessions_date ON usage_sessions(validated_at);

-- Configuração do QR Code universal
INSERT INTO system_config (key, value, description) VALUES
('qr_code_payload', '"AVP_AUTH_2024"', 'Payload fixo do QR Code universal Auto Vale'),
('qr_code_url', '"https://clube.autovaleprevencoes.org.br/auth/qr"', 'URL encoded no QR Code');
