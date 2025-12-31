-- Verification script to check if the users table and policies are set up correctly
-- Run this in Supabase SQL Editor to verify your setup

-- Check if users table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')
    THEN '✓ users table exists'
    ELSE '✗ users table does NOT exist'
  END AS table_check;

-- Check if INSERT policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can insert own data'
    )
    THEN '✓ INSERT policy exists'
    ELSE '✗ INSERT policy does NOT exist'
  END AS insert_policy_check;

-- Check if SELECT policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can view own data'
    )
    THEN '✓ SELECT policy exists'
    ELSE '✗ SELECT policy does NOT exist'
  END AS select_policy_check;

-- Check if UPDATE policy exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Users can update own data'
    )
    THEN '✓ UPDATE policy exists'
    ELSE '✗ UPDATE policy does NOT exist'
  END AS update_policy_check;

-- List all policies on users table
SELECT 
  policyname,
  cmd AS operation,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

