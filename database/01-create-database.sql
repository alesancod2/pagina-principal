-- ============================================
-- CLUBE DE BENEFÍCIOS AUTO VALE PREVENÇÕES
-- Script de criação do banco de dados
-- PostgreSQL 15+ com PostGIS
-- ============================================

-- Criar banco de dados
CREATE DATABASE autovale_clube
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

-- Conectar ao banco
\c autovale_clube;

-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
