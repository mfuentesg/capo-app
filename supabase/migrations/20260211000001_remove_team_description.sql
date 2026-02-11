-- Migration: Remove teams.description column
-- Removes the unused description field from the teams table

ALTER TABLE teams DROP COLUMN description;
