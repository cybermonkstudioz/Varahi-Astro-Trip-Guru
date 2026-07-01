-- SQL DDL for Varahi Astro Trip Guru
-- Run this in your Supabase SQL Editor to set up the database tables.

-- Drop existing tables if needed (uncomment if you want to start fresh)
-- DROP TABLE IF EXISTS trips;
-- DROP TABLE IF EXISTS vehicles;
-- DROP TABLE IF EXISTS admins;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'Admin',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('Sedan', 'SUV', 'Innova', 'Tempo Traveller')),
  "costPerKm" NUMERIC NOT NULL,
  "driverAllowancePerDay" NUMERIC NOT NULL,
  "nightHaltCharge" NUMERIC NOT NULL,
  "customCharges" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tripId" TEXT UNIQUE NOT NULL,
  "tripType" TEXT NOT NULL CHECK ("tripType" IN ('One-way', 'Round', 'Multi-city')),
  source JSONB,
  destination JSONB,
  stops JSONB,
  "vehicleType" TEXT NOT NULL,
  dates JSONB,
  passengers INTEGER NOT NULL,
  metrics JSONB,
  costs JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Helper to automatically update "updatedAt" (optional but standard practice in Postgres)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_admins_updated_at BEFORE UPDATE
ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_vehicles_updated_at BEFORE UPDATE
ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_trips_updated_at BEFORE UPDATE
ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
