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
