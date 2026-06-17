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
