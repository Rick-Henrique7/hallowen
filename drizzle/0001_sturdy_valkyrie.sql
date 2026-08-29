-- 0001_invite_pk_to_serial
-- Change invites.id from text (6-char nanoid) to serial (auto-increment integer).
-- The 2 existing rows will get fresh ids (1, 2) from the new sequence.
-- Old nanoid URLs (e.g. /?id=ABC123) will no longer resolve; the organizer
-- will need to re-share the new numeric links.

-- 1. drop the existing primary key constraint
ALTER TABLE "invites" DROP CONSTRAINT "invites_pkey";

-- 2. add a new serial column (creates the sequence + nextval default)
--    existing rows get values 1, 2, ... from the sequence
ALTER TABLE "invites" ADD COLUMN "new_id" serial NOT NULL;

-- 3. drop the old text id column
ALTER TABLE "invites" DROP COLUMN "id";

-- 4. rename new_id → id
ALTER TABLE "invites" RENAME COLUMN "new_id" TO "id";

-- 5. re-add the primary key on the new id
ALTER TABLE "invites" ADD CONSTRAINT "invites_pkey" PRIMARY KEY ("id");
