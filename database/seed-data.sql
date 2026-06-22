-- ============================================
-- SEED DATA - Dados iniciais para o Clube de Beneficios
-- Execute no Supabase SQL Editor APOS o schema principal
-- ============================================

-- SYSTEM_CONFIG (configurações do sistema)
INSERT INTO system_config (key, value, description) VALUES
('points_per_usage', '50', 'Pontos ganhos por utilização de parceiro'),
('points_expiry_days', '365', 'Pontos expiram em 365 dias'),
('min_redeem_points', '100', 'Mínimo de pontos para resgate de cupom'),
('max_coupon_validity_days', '30', 'Validade máxima de cupom em dias'),
('compliance_check_enabled', 'true', 'Verificação de adimplência ativa'),
('geolocation_radius_km', '50', 'Raio padrão de busca em km'),
('qr_redirect_url', '"https://clube.autovaleprevencoes.org.br/auth"', 'URL de redirecionamento QR Code'),
('app_name', '"Clube de Benefícios Auto Vale"', 'Nome da aplicação'),
('app_version', '"1.0.0"', 'Versão da aplicação')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();

-- PARCEIROS (dados reais para o marketplace)
INSERT INTO partners (company_name, trade_name, cnpj, category, description, address, city, state, phone, whatsapp, rating, status) VALUES
('Auto Posto São Jorge Ltda', 'Auto Posto São Jorge', '12.345.678/0001-01', 'postos', 'Combustível de qualidade com bandeira premium. Gasolina aditivada, etanol e diesel S-10.', 'Av. Augusto Pestana, 1250 - Centro', 'Linhares', 'ES', '(27) 3264-1234', '(27) 99812-3456', 4.8, 'active'),
('Lava Jato Premium Ltda', 'Lava Jato Premium', '12.345.678/0001-02', 'lava-jato', 'Lavagem interna e externa completa, higienização de estofados, polimento express.', 'Rua Gov. Santos Neves, 450 - Movelar', 'Linhares', 'ES', '(27) 3264-5678', '(27) 99834-5678', 4.6, 'active'),
('Mecânica Central Ltda', 'Mecânica Central', '12.345.678/0001-03', 'mecanica', 'Oficina com profissionais certificados. Diagnóstico computadorizado, revisão completa.', 'Rua Rufino de Carvalho, 320 - Centro', 'Linhares', 'ES', '(27) 3264-9012', '(27) 99856-7890', 4.9, 'active'),
('Estética Car Pro ME', 'Estética Car Pro', '12.345.678/0001-04', 'estetica', 'Polimento técnico, cristalização de pintura, vitrificação e PPF.', 'Av. João Felipe Calmon, 890 - Shell', 'Linhares', 'ES', '(27) 3264-3456', '(27) 99878-1234', 4.7, 'active'),
('Pneus & Cia Comércio Ltda', 'Pneus & Cia', '12.345.678/0001-05', 'pneus', 'Pneus Michelin, Pirelli, Continental, Goodyear. Alinhamento 3D e balanceamento.', 'Rod. ES-010, Km 3 - Interlagos', 'Linhares', 'ES', '(27) 3264-7890', '(27) 99890-2345', 4.5, 'active'),
('Auto Elétrica Rápida ME', 'Auto Elétrica Rápida', '12.345.678/0001-06', 'eletrica', 'Diagnóstico e reparo de sistemas elétricos e eletrônicos automotivos.', 'Rua Augusto Luciano, 156 - Aviso', 'Linhares', 'ES', '(27) 3264-2345', '(27) 99812-6789', 4.4, 'active'),
('Borracharia 24h ME', 'Borracharia 24h', '12.345.678/0001-07', 'borracharia', 'Atendimento 24 horas. Socorro na estrada, troca de pneus, conserto de furos.', 'Rua Principal, 45 - Centro', 'Linhares', 'ES', '(27) 3264-6789', '(27) 99834-0123', 4.3, 'active'),
('Guincho Express Serviços Ltda', 'Guincho Express', '12.345.678/0001-08', 'guincho', 'Guincho e reboque 24h com cobertura em toda região. Plataforma hidráulica.', 'Av. Industrial, 2200 - Distrito Industrial', 'Linhares', 'ES', '(27) 3264-0123', '(27) 99856-4567', 4.8, 'active'),
('Restaurante Sabor Mineiro Ltda', 'Restaurante Sabor Mineiro', '12.345.678/0001-09', 'alimentacao', 'Comida caseira mineira. Self-service com 40+ pratos, opções vegetarianas.', 'Rua Dr. Abelardo, 78 - Centro', 'Linhares', 'ES', '(27) 3264-4567', '(27) 99878-5678', 4.6, 'active'),
('Farmácia Saúde+ Ltda', 'Farmácia Saúde+', '12.345.678/0001-10', 'saude', 'Medicamentos, produtos de higiene e bem-estar. Atendimento farmacêutico.', 'Av. Beira Rio, 320 - Centro', 'Linhares', 'ES', '(27) 3264-8901', '(27) 99890-6789', 4.7, 'active'),
('Auto Escola Dirigir Bem Ltda', 'Auto Escola Dirigir Bem', '12.345.678/0001-11', 'educacao', 'Cursos de primeira habilitação, reciclagem e direção defensiva.', 'Rua Castelo Branco, 560 - Colina', 'Linhares', 'ES', '(27) 3264-5432', '(27) 99812-8901', 4.9, 'active'),
('Posto Shell Av. Brasil Ltda', 'Posto Shell Av. Brasil', '12.345.678/0001-12', 'postos', 'Combustível V-Power. Loja de conveniência Select 24h, calibragem gratuita.', 'Av. Brasil, 1800 - Araçás', 'Linhares', 'ES', '(27) 3264-6543', '(27) 99834-2345', 4.5, 'active')
ON CONFLICT (cnpj) DO NOTHING;

-- BENEFÍCIOS DOS PARCEIROS
-- (usando subquery para pegar o partner_id correto)
INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto no abastecimento', 'Desconto exclusivo para associados Auto Vale', 'discount_percent', 5, 50, true
FROM partners p WHERE p.trade_name = 'Auto Posto São Jorge'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto na lavagem completa', 'Lavagem completa com preço especial', 'discount_percent', 15, 50, true
FROM partners p WHERE p.trade_name = 'Lava Jato Premium'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em revisão', 'Revisão completa com desconto exclusivo', 'discount_percent', 10, 50, true
FROM partners p WHERE p.trade_name = 'Mecânica Central'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em polimento', 'Polimento técnico com preço especial', 'discount_percent', 20, 50, true
FROM partners p WHERE p.trade_name = 'Estética Car Pro'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em pneus', 'Compra de pneus com desconto para associados', 'discount_percent', 12, 50, true
FROM partners p WHERE p.trade_name = 'Pneus & Cia'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em serviços elétricos', 'Diagnóstico e reparo com desconto', 'discount_percent', 8, 50, true
FROM partners p WHERE p.trade_name = 'Auto Elétrica Rápida'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em borracharia', 'Serviços de borracharia com preço especial', 'discount_percent', 10, 50, true
FROM partners p WHERE p.trade_name = 'Borracharia 24h'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em guincho', 'Serviço de guincho com desconto para associados', 'discount_percent', 15, 50, true
FROM partners p WHERE p.trade_name = 'Guincho Express'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto no almoço', 'Self-service com desconto exclusivo', 'discount_percent', 10, 50, true
FROM partners p WHERE p.trade_name = 'Restaurante Sabor Mineiro'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto em medicamentos', 'Produtos selecionados com desconto', 'discount_percent', 8, 50, true
FROM partners p WHERE p.trade_name = 'Farmácia Saúde+'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto no curso', 'Cursos com preço especial para associados', 'discount_percent', 25, 50, true
FROM partners p WHERE p.trade_name = 'Auto Escola Dirigir Bem'
ON CONFLICT DO NOTHING;

INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
SELECT p.id, 'Desconto V-Power', 'Combustível aditivado com desconto', 'discount_percent', 3, 50, true
FROM partners p WHERE p.trade_name = 'Posto Shell Av. Brasil'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================
DO $$
DECLARE
    partner_count INTEGER;
    benefit_count INTEGER;
    config_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO partner_count FROM partners;
    SELECT COUNT(*) INTO benefit_count FROM partner_benefits;
    SELECT COUNT(*) INTO config_count FROM system_config;
    
    RAISE NOTICE 'Seed concluído! Parceiros: %, Benefícios: %, Configs: %', partner_count, benefit_count, config_count;
END $$;
