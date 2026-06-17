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
