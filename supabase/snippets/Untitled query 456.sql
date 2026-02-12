SELECT invite_team_member(
  'f82b7d5c-442b-4fb5-b700-df089ef4e26e'::uuid,
  'me@mfuentesg.dev',
  'member'::team_role_enum
);

SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;