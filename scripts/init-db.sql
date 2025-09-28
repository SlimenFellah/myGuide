-- Database initialization script for MyGuide application
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases if needed
-- CREATE DATABASE myguide_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom functions or procedures if needed
-- (Add any custom database setup here)

-- Grant permissions
-- GRANT ALL PRIVILEGES ON DATABASE myguide TO postgres;