-- ============================================
-- MIGRAÇÃO: Ajuste tabela coupons
-- Adiciona campos 'name' e 'benefit_type'
-- Execute no Supabase SQL Editor (idempotente)
-- ============================================

-- Adicionar coluna 'name' (nome do cupom)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'coupons' AND column_name = 'name'
    ) THEN
        ALTER TABLE coupons ADD COLUMN name VARCHAR(255);
        RAISE NOTICE 'Coluna "name" adicionada à tabela coupons';
    ELSE
        RAISE NOTICE 'Coluna "name" já existe';
    END IF;
END $$;

-- Adicionar coluna 'benefit_type' (desconto, cashback, pontos_dobro)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'coupons' AND column_name = 'benefit_type'
    ) THEN
        ALTER TABLE coupons ADD COLUMN benefit_type VARCHAR(30) DEFAULT 'desconto';
        RAISE NOTICE 'Coluna "benefit_type" adicionada à tabela coupons';
    ELSE
        RAISE NOTICE 'Coluna "benefit_type" já existe';
    END IF;
END $$;

-- Verificação
DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns
    WHERE table_name = 'coupons';
    
    RAISE NOTICE 'Migração concluída! Tabela coupons agora tem % colunas', col_count;
END $$;
