-- Move pg_net extension out of public schema.
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
		IF EXISTS (
			SELECT 1
			FROM pg_extension ext
			JOIN pg_namespace nsp ON nsp.oid = ext.extnamespace
			WHERE ext.extname = 'pg_net'
				AND nsp.nspname <> 'extensions'
				AND ext.extrelocatable
		) THEN
			CREATE SCHEMA IF NOT EXISTS extensions;
			ALTER EXTENSION pg_net SET SCHEMA extensions;
		ELSIF EXISTS (
			SELECT 1
			FROM pg_extension ext
			JOIN pg_namespace nsp ON nsp.oid = ext.extnamespace
			WHERE ext.extname = 'pg_net'
				AND nsp.nspname <> 'extensions'
				AND NOT ext.extrelocatable
		) THEN
			RAISE NOTICE 'pg_net is not relocatable; skipping schema move.';
		END IF;
	END IF;
END $$;