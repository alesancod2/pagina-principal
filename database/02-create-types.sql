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
