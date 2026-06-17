-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'member',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ASSOCIATIONS (vinculo com Auto Vale)
CREATE TABLE associations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status association_status DEFAULT 'active',
    start_date DATE NOT NULL,
    due_date DATE,
    vehicle_plate VARCHAR(10),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    is_compliant BOOLEAN DEFAULT true,
    last_payment_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTNERS
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    address VARCHAR(500),
    city VARCHAR(100),
    state VARCHAR(2),
    zipcode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    geom GEOMETRY(Point, 4326),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    logo_url TEXT,
    cover_url TEXT,
    rating DECIMAL(2,1) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    status partner_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
