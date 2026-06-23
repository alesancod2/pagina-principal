-- ============================================
-- SEED DATA - Clube de Beneficios Auto Vale
-- 100% IDEMPOTENTE - pode executar quantas vezes quiser
-- Execute APÓS o supabase-full-schema.sql
-- ============================================

-- ============================================
-- 1. LIMPAR CONFLITOS DE EXECUÇÕES ANTERIORES
-- ============================================
DELETE FROM system_config WHERE key NOT IN (
    'points_per_usage','points_expiry_days','min_redeem_points',
    'max_coupon_validity_days','compliance_check_enabled','geolocation_radius_km',
    'qr_redirect_url','app_name','app_version'
);

-- ============================================
-- 2. SYSTEM_CONFIG (atualiza se já existir)
-- ============================================
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

-- ============================================
-- 3. PARCEIROS (ignora se CNPJ já existir)
-- ============================================
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

-- ============================================
-- 4. BENEFÍCIOS DOS PARCEIROS
-- (verifica se já existe antes de inserir)
-- ============================================
DO $$
DECLARE
    v_partner_id UUID;
BEGIN
    -- Auto Posto São Jorge
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Auto Posto São Jorge' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto no abastecimento') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto no abastecimento', 'Desconto exclusivo para associados Auto Vale', 'discount_percent', 5, 50, true);
    END IF;

    -- Lava Jato Premium
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Lava Jato Premium' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto na lavagem completa') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto na lavagem completa', 'Lavagem completa com preço especial', 'discount_percent', 15, 50, true);
    END IF;

    -- Mecânica Central
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Mecânica Central' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em revisão') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em revisão', 'Revisão completa com desconto exclusivo', 'discount_percent', 10, 50, true);
    END IF;

    -- Estética Car Pro
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Estética Car Pro' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em polimento') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em polimento', 'Polimento técnico com preço especial', 'discount_percent', 20, 50, true);
    END IF;

    -- Pneus & Cia
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Pneus & Cia' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em pneus') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em pneus', 'Compra de pneus com desconto para associados', 'discount_percent', 12, 50, true);
    END IF;

    -- Auto Elétrica Rápida
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Auto Elétrica Rápida' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em serviços elétricos') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em serviços elétricos', 'Diagnóstico e reparo com desconto', 'discount_percent', 8, 50, true);
    END IF;

    -- Borracharia 24h
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Borracharia 24h' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em borracharia') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em borracharia', 'Serviços de borracharia com preço especial', 'discount_percent', 10, 50, true);
    END IF;

    -- Guincho Express
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Guincho Express' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em guincho') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em guincho', 'Serviço de guincho com desconto para associados', 'discount_percent', 15, 50, true);
    END IF;

    -- Restaurante Sabor Mineiro
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Restaurante Sabor Mineiro' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto no almoço') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto no almoço', 'Self-service com desconto exclusivo', 'discount_percent', 10, 50, true);
    END IF;

    -- Farmácia Saúde+
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Farmácia Saúde+' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto em medicamentos') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto em medicamentos', 'Produtos selecionados com desconto', 'discount_percent', 8, 50, true);
    END IF;

    -- Auto Escola Dirigir Bem
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Auto Escola Dirigir Bem' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto no curso') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto no curso', 'Cursos com preço especial para associados', 'discount_percent', 25, 50, true);
    END IF;

    -- Posto Shell Av. Brasil
    SELECT id INTO v_partner_id FROM partners WHERE trade_name = 'Posto Shell Av. Brasil' LIMIT 1;
    IF v_partner_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM partner_benefits WHERE partner_id = v_partner_id AND title = 'Desconto V-Power') THEN
        INSERT INTO partner_benefits (partner_id, title, description, benefit_type, discount_percent, points_generated, is_active)
        VALUES (v_partner_id, 'Desconto V-Power', 'Combustível aditivado com desconto', 'discount_percent', 3, 50, true);
    END IF;

    RAISE NOTICE 'Beneficios inseridos com sucesso!';
END $$;

-- ============================================
-- 5. CUPONS DE EXEMPLO
-- (idempotente - ignora se código já existir)
-- ============================================
DO $$
DECLARE
    v_partner_id UUID;
    v_benefit_id UUID;
    v_admin_id UUID;
BEGIN
    -- Buscar admin
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@autovaleprevencoes.org.br' LIMIT 1;

    -- Cupom 1: Desconto Combustível (percentual)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Auto Posto São Jorge' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, expires_at)
        VALUES ('AV-7X2K-9M4P', 'Desconto Combustível', v_partner_id, v_benefit_id, v_admin_id, 'desconto', 'percentual', 5, NOW() + INTERVAL '30 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Cupom 2: Lavagem Premium (percentual)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Lava Jato Premium' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, expires_at)
        VALUES ('AV-3F8N-1L5Q', 'Lavagem Premium', v_partner_id, v_benefit_id, v_admin_id, 'desconto', 'percentual', 15, NOW() + INTERVAL '30 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Cupom 3: Desconto Mecânica (usado)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Mecânica Central' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, status, used_at, expires_at)
        VALUES ('AV-9D4R-6H2W', 'Desconto Mecânica', v_partner_id, v_benefit_id, v_admin_id, 'desconto', 'percentual', 10, 'used', NOW() - INTERVAL '5 days', NOW() + INTERVAL '30 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Cupom 4: Pontos em Dobro (expirado)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Pneus & Cia' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, status, expires_at)
        VALUES ('AV-2B7T-8K3J', 'Pontos Dobrados', v_partner_id, v_benefit_id, v_admin_id, 'pontos_dobro', 'percentual', 0, 'expired', NOW() - INTERVAL '10 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Cupom 5: Desconto Polimento (percentual)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Estética Car Pro' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, expires_at)
        VALUES ('AV-5G1M-4N8V', 'Desconto Polimento', v_partner_id, v_benefit_id, v_admin_id, 'desconto', 'percentual', 15, NOW() + INTERVAL '60 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Cupom 6: Revisão com Desconto (valor fixo R$50)
    SELECT p.id, pb.id INTO v_partner_id, v_benefit_id
    FROM partners p LEFT JOIN partner_benefits pb ON pb.partner_id = p.id
    WHERE p.trade_name = 'Auto Elétrica Rápida' LIMIT 1;
    IF v_partner_id IS NOT NULL THEN
        INSERT INTO coupons (code, name, partner_id, benefit_id, created_by, benefit_type, discount_type, discount_value, expires_at)
        VALUES ('AV-6C9P-2R7X', 'Revisão com Desconto', v_partner_id, v_benefit_id, v_admin_id, 'desconto', 'valor_fixo', 50, NOW() + INTERVAL '90 days')
        ON CONFLICT (code) DO NOTHING;
    END IF;

    RAISE NOTICE 'Cupons de exemplo inseridos com sucesso!';
END $$;

-- ============================================
-- 5b. CAMPANHAS DE EXEMPLO
-- ============================================
DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@autovaleprevencoes.org.br' LIMIT 1;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Verão Premiado 2025') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, target_categories, created_by)
        VALUES ('Verão Premiado 2025', 'Pontos em dobro em todos os postos parceiros durante o verão.', 'double_points', 2.0, '2025-01-01', '2025-02-28', true, ARRAY['postos'], v_admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Semana do Carro Limpo') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, target_categories, created_by)
        VALUES ('Semana do Carro Limpo', 'Lavagem completa com 50% de desconto usando pontos.', 'partner_month', 1.0, '2025-01-15', '2025-01-22', true, ARRAY['lava-jato'], v_admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Maratona de Pontos') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, target_categories, created_by)
        VALUES ('Maratona de Pontos', 'Acumule 1000 pontos e ganhe uma troca de óleo grátis.', 'double_points', 2.0, '2025-03-01', '2025-03-31', true, ARRAY['mecanica'], v_admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Natal Premiado 2024') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, created_by)
        VALUES ('Natal Premiado 2024', 'Sorteio de prêmios para quem acumulou mais de 500 pontos.', 'custom', 1.0, '2024-12-01', '2024-12-25', false, v_admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Desconto de Aniversário') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, created_by)
        VALUES ('Desconto de Aniversário', '10% de desconto em todos os serviços durante o mês de aniversário do associado.', 'custom', 1.0, '2025-04-01', '2025-04-30', true, v_admin_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM campaigns WHERE title = 'Indique e Ganhe') THEN
        INSERT INTO campaigns (title, description, type, points_multiplier, start_date, end_date, is_active, created_by)
        VALUES ('Indique e Ganhe', 'Indique um amigo e ambos ganham 200 pontos bônus na primeira utilização.', 'member_month', 1.0, '2025-02-01', '2025-06-30', true, v_admin_id);
    END IF;

    RAISE NOTICE 'Campanhas de exemplo inseridas com sucesso!';
END $$;

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
    v_partners INTEGER;
    v_benefits INTEGER;
    v_configs INTEGER;
    v_users INTEGER;
    v_coupons INTEGER;
    v_campaigns INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_partners FROM partners;
    SELECT COUNT(*) INTO v_benefits FROM partner_benefits;
    SELECT COUNT(*) INTO v_configs FROM system_config;
    SELECT COUNT(*) INTO v_users FROM users;
    SELECT COUNT(*) INTO v_coupons FROM coupons;
    SELECT COUNT(*) INTO v_campaigns FROM campaigns;
    
    RAISE NOTICE '=== SEED CONCLUIDO COM SUCESSO ===';
    RAISE NOTICE 'Parceiros: %', v_partners;
    RAISE NOTICE 'Beneficios: %', v_benefits;
    RAISE NOTICE 'Cupons: %', v_coupons;
    RAISE NOTICE 'Campanhas: %', v_campaigns;
    RAISE NOTICE 'Configs: %', v_configs;
    RAISE NOTICE 'Usuarios: %', v_users;
END $$;
