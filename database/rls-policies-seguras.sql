-- ============================================
-- RLS POLICIES RESTRITIVAS - TABELAS SENSÍVEIS
-- Clube de Benefícios Auto Vale Prevenções
-- ============================================
-- INSTRUÇÕES:
-- 1. Execute APÓS o supabase-full-schema.sql
-- 2. Supabase SQL Editor > New Query > Cole e Run
-- 3. Requer que usuários estejam criados via Supabase Auth
-- 4. admin = users com role='admin' na tabela users
-- ============================================
-- IMPORTANTE: Estas policies substituem as permissivas (USING true).
-- Após executar, apenas usuários autenticados via Supabase Auth terão acesso.
-- O painel admin usa anon key + sessão localStorage.
-- Para funcionar com Supabase Auth, os usuários devem ser criados em:
-- Authentication > Users > Add user (email + senha)
-- ============================================

-- ============================================
-- FUNÇÃO AUXILIAR: Verificar se é admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verifica se o usuário autenticado tem role=admin na tabela users
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 1. USERS (dados pessoais - altamente sensível)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover policy permissiva
DROP POLICY IF EXISTS "allow_public_read_users" ON users;

-- Usuário vê apenas seus próprios dados
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (
        id = auth.uid() OR is_admin()
    );

-- Apenas admin pode inserir usuários
DROP POLICY IF EXISTS "users_insert_admin" ON users;
CREATE POLICY "users_insert_admin" ON users
    FOR INSERT WITH CHECK (is_admin());

-- Usuário pode atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (
        id = auth.uid() OR is_admin()
    );

-- Apenas admin pode deletar
DROP POLICY IF EXISTS "users_delete_admin" ON users;
CREATE POLICY "users_delete_admin" ON users
    FOR DELETE USING (is_admin());

-- ============================================
-- 2. USER_POINTS (saldo de pontos - sensível)
-- ============================================
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_user_points" ON user_points;

-- Usuário vê apenas seus pontos, admin vê todos
DROP POLICY IF EXISTS "user_points_select" ON user_points;
CREATE POLICY "user_points_select" ON user_points
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas o sistema (triggers) ou admin insere/atualiza
DROP POLICY IF EXISTS "user_points_insert" ON user_points;
CREATE POLICY "user_points_insert" ON user_points
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "user_points_update" ON user_points;
CREATE POLICY "user_points_update" ON user_points
    FOR UPDATE USING (is_admin());

-- ============================================
-- 3. POINT_TRANSACTIONS (histórico de pontos)
-- ============================================
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_point_transactions" ON point_transactions;

-- Usuário vê apenas suas transações, admin vê todas
DROP POLICY IF EXISTS "point_transactions_select" ON point_transactions;
CREATE POLICY "point_transactions_select" ON point_transactions
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas triggers/admin inserem transações
DROP POLICY IF EXISTS "point_transactions_insert" ON point_transactions;
CREATE POLICY "point_transactions_insert" ON point_transactions
    FOR INSERT WITH CHECK (is_admin());

-- ============================================
-- 4. COUPONS (cupons vinculados a usuários)
-- ============================================
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_coupons" ON coupons;
DROP POLICY IF EXISTS "allow_admin_insert_coupons" ON coupons;
DROP POLICY IF EXISTS "allow_admin_update_coupons" ON coupons;
DROP POLICY IF EXISTS "allow_admin_delete_coupons" ON coupons;

-- Usuário vê seus próprios cupons + cupons sem dono (disponíveis), admin vê todos
DROP POLICY IF EXISTS "coupons_select" ON coupons;
CREATE POLICY "coupons_select" ON coupons
    FOR SELECT USING (
        user_id = auth.uid() OR user_id IS NULL OR is_admin()
    );

-- Apenas admin pode criar cupons
DROP POLICY IF EXISTS "coupons_insert_admin" ON coupons;
CREATE POLICY "coupons_insert_admin" ON coupons
    FOR INSERT WITH CHECK (is_admin());

-- Admin pode atualizar qualquer cupom; usuário pode "usar" o próprio
DROP POLICY IF EXISTS "coupons_update" ON coupons;
CREATE POLICY "coupons_update" ON coupons
    FOR UPDATE USING (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas admin pode deletar cupons
DROP POLICY IF EXISTS "coupons_delete_admin" ON coupons;
CREATE POLICY "coupons_delete_admin" ON coupons
    FOR DELETE USING (is_admin());

-- ============================================
-- 5. BENEFIT_USAGES (histórico de uso - sensível)
-- ============================================
ALTER TABLE benefit_usages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_benefit_usages" ON benefit_usages;

-- Usuário vê apenas seus usos, admin vê todos
DROP POLICY IF EXISTS "benefit_usages_select" ON benefit_usages;
CREATE POLICY "benefit_usages_select" ON benefit_usages
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Inserção feita pelo sistema ao confirmar uso
DROP POLICY IF EXISTS "benefit_usages_insert" ON benefit_usages;
CREATE POLICY "benefit_usages_insert" ON benefit_usages
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR is_admin()
    );

-- ============================================
-- 6. USAGE_REQUESTS (solicitações de uso)
-- ============================================
ALTER TABLE usage_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_usage_requests" ON usage_requests;
DROP POLICY IF EXISTS "allow_insert_usage_requests" ON usage_requests;
DROP POLICY IF EXISTS "allow_update_usage_requests" ON usage_requests;

-- Usuário vê suas solicitações, admin/parceiro vê as relacionadas
DROP POLICY IF EXISTS "usage_requests_select" ON usage_requests;
CREATE POLICY "usage_requests_select" ON usage_requests
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Usuário pode criar solicitação para si mesmo
DROP POLICY IF EXISTS "usage_requests_insert" ON usage_requests;
CREATE POLICY "usage_requests_insert" ON usage_requests
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas admin/parceiro pode confirmar/rejeitar
DROP POLICY IF EXISTS "usage_requests_update" ON usage_requests;
CREATE POLICY "usage_requests_update" ON usage_requests
    FOR UPDATE USING (is_admin());

-- ============================================
-- 7. PARTNER_RATINGS (avaliações)
-- ============================================
ALTER TABLE partner_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_public_read_ratings" ON partner_ratings;
DROP POLICY IF EXISTS "allow_insert_ratings" ON partner_ratings;
DROP POLICY IF EXISTS "allow_update_ratings" ON partner_ratings;

-- Qualquer pessoa pode ler avaliações (públicas)
DROP POLICY IF EXISTS "partner_ratings_select" ON partner_ratings;
CREATE POLICY "partner_ratings_select" ON partner_ratings
    FOR SELECT USING (true);

-- Usuário pode avaliar (inserir sua própria)
DROP POLICY IF EXISTS "partner_ratings_insert" ON partner_ratings;
CREATE POLICY "partner_ratings_insert" ON partner_ratings
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Usuário pode atualizar apenas sua própria avaliação
DROP POLICY IF EXISTS "partner_ratings_update" ON partner_ratings;
CREATE POLICY "partner_ratings_update" ON partner_ratings
    FOR UPDATE USING (
        user_id = auth.uid()
    );

-- ============================================
-- 8. NOTIFICATIONS (dados pessoais)
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas suas notificações
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Sistema/admin insere notificações
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications
    FOR INSERT WITH CHECK (is_admin());

-- Usuário pode marcar como lida (update is_read)
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
    FOR UPDATE USING (
        user_id = auth.uid() OR is_admin()
    );

-- ============================================
-- 9. ASSOCIATIONS (vínculo pessoal - sensível)
-- ============================================
ALTER TABLE associations ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seu vínculo
DROP POLICY IF EXISTS "associations_select" ON associations;
CREATE POLICY "associations_select" ON associations
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas admin gerencia associações
DROP POLICY IF EXISTS "associations_insert" ON associations;
CREATE POLICY "associations_insert" ON associations
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "associations_update" ON associations;
CREATE POLICY "associations_update" ON associations
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "associations_delete" ON associations;
CREATE POLICY "associations_delete" ON associations
    FOR DELETE USING (is_admin());

-- ============================================
-- 10. REFRESH_TOKENS (tokens de sessão - crítico)
-- ============================================
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Usuário vê apenas seus tokens
DROP POLICY IF EXISTS "refresh_tokens_select" ON refresh_tokens;
CREATE POLICY "refresh_tokens_select" ON refresh_tokens
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

-- Apenas o sistema insere tokens
DROP POLICY IF EXISTS "refresh_tokens_insert" ON refresh_tokens;
CREATE POLICY "refresh_tokens_insert" ON refresh_tokens
    FOR INSERT WITH CHECK (is_admin());

-- Apenas o próprio usuário ou admin pode revogar
DROP POLICY IF EXISTS "refresh_tokens_update" ON refresh_tokens;
CREATE POLICY "refresh_tokens_update" ON refresh_tokens
    FOR UPDATE USING (
        user_id = auth.uid() OR is_admin()
    );

-- ============================================
-- 11. PARTNERS - Restringir escrita (leitura pública mantida)
-- ============================================
-- SELECT já é público (allow_public_read_partners) - parceiros são dados públicos
-- Restringir INSERT/UPDATE/DELETE apenas para admin

DROP POLICY IF EXISTS "allow_insert_partners" ON partners;
CREATE POLICY "partners_insert_admin" ON partners
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "allow_update_partners" ON partners;
CREATE POLICY "partners_update_admin" ON partners
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "allow_delete_partners" ON partners;
CREATE POLICY "partners_delete_admin" ON partners
    FOR DELETE USING (is_admin());

-- ============================================
-- 12. PARTNER_BENEFITS - Restringir escrita
-- ============================================
-- SELECT é público (benefícios são visíveis no marketplace)

DROP POLICY IF EXISTS "allow_insert_benefits" ON partner_benefits;
CREATE POLICY "benefits_insert_admin" ON partner_benefits
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "allow_update_benefits" ON partner_benefits;
CREATE POLICY "benefits_update_admin" ON partner_benefits
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "allow_delete_benefits" ON partner_benefits;
CREATE POLICY "benefits_delete_admin" ON partner_benefits
    FOR DELETE USING (is_admin());

-- ============================================
-- 13. CAMPAIGNS - Restringir escrita
-- ============================================
-- SELECT é público (campanhas são visíveis)

DROP POLICY IF EXISTS "allow_insert_campaigns" ON campaigns;
CREATE POLICY "campaigns_insert_admin" ON campaigns
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "allow_update_campaigns" ON campaigns;
CREATE POLICY "campaigns_update_admin" ON campaigns
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "allow_delete_campaigns" ON campaigns;
CREATE POLICY "campaigns_delete_admin" ON campaigns
    FOR DELETE USING (is_admin());

-- ============================================
-- 14. SYSTEM_CONFIG - Restringir tudo
-- ============================================

DROP POLICY IF EXISTS "allow_insert_config" ON system_config;
CREATE POLICY "config_insert_admin" ON system_config
    FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "allow_update_config" ON system_config;
CREATE POLICY "config_update_admin" ON system_config
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "allow_delete_config" ON system_config;
CREATE POLICY "config_delete_admin" ON system_config
    FOR DELETE USING (is_admin());

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '=== POLICIES RESTRITIVAS APLICADAS ===';
    RAISE NOTICE 'Total de policies ativas: %', policy_count;
    RAISE NOTICE 'Tabelas protegidas: users, user_points, point_transactions, coupons, benefit_usages, usage_requests, partner_ratings, notifications, associations, refresh_tokens, partners (escrita), partner_benefits (escrita), campaigns (escrita), system_config (escrita)';
    RAISE NOTICE '=== IMPORTANTE: Requer Supabase Auth para funcionar ===';
END $$;
