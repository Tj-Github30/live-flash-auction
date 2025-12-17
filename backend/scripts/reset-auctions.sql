-- Reset all auctions (and any auction-owned data).
-- Safe to run multiple times.
--
-- NOTE:
-- - This does NOT delete users (Cognito sync will repopulate as users log in).
-- - This does NOT clear Redis/DynamoDB. Use the optional steps in reset-auctions.sh for that.

BEGIN;

-- Remove all auctions
TRUNCATE TABLE auctions RESTART IDENTITY CASCADE;

COMMIT;


