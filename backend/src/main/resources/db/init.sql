-- Initialize CareerLog database schema
-- This file runs automatically when PostgreSQL container starts

-- Create database if it doesn't exist (PostgreSQL handles this)
-- The database is created via environment variables

-- Create extensions for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions (PostgreSQL handles this via environment variables)
-- User permissions are set automatically during container init