-- AlterEnum
-- PostgreSQL requires creating a new enum type, migrating data, then dropping the old one.
-- This migration adds the 'rented' value to the CarStatus enum between 'available' and 'maintenance'.

ALTER TYPE "CarStatus" ADD VALUE IF NOT EXISTS 'rented' AFTER 'available';
