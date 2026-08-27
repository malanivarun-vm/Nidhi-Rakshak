ALTER TABLE claims ADD COLUMN IF NOT EXISTS member_ref varchar(80);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS pf_account_ref varchar(80);
UPDATE claims
SET member_ref = 'legacy-demo-member',
    pf_account_ref = 'PF-' || external_ref
WHERE member_ref IS NULL OR pf_account_ref IS NULL;
ALTER TABLE claims ALTER COLUMN member_ref SET NOT NULL;
ALTER TABLE claims ALTER COLUMN pf_account_ref SET NOT NULL;
