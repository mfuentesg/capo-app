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
		) THEN
			CREATE SCHEMA IF NOT EXISTS extensions;
			ALTER EXTENSION pg_net SET SCHEMA extensions;
		END IF;
	END IF;
END $$;