-- Migration: Add community_points column to users table
-- Database: levareapp_dev

ALTER TABLE users 
ADD COLUMN community_points DECIMAL(8,2) NOT NULL DEFAULT 0.00 AFTER accent_color;
