## Supabase REST Troubleshooting (Profiles endpoint)

If you receive a `404 Not Found` when hitting `https://<project>.supabase.co/rest/v1/users?...`, run through the following checklist:

1. **Ensure API headers are present**  
   The PostgREST endpoint requires both the project anon key and (for row-level security protected tables) a valid `Authorization` header. Example:
   ```bash
   curl "https://<project>.supabase.co/rest/v1/users?select=*" \
     -H "apikey: $SUPABASE_ANON_KEY" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_OR_USER_JWT"
   ```
   Missing headers cause Supabase to respond with a 404 to avoid leaking schema information.

2. **Confirm the `public.users` table exists**  
   Deploy the latest schema changes from `supabase/schema.sql` (via `supabase db push` or the SQL editor). Without this table, the REST route won’t resolve.

3. **Verify exposed schemas**  
   In Supabase Dashboard → Settings → API → *Exposed Schemas*, ensure `public` is listed. If it isn’t, add it so PostgREST can serve the table.

4. **Row Level Security policies**  
   The repo already defines select/insert/update/delete policies (`auth.uid() = id`). Make sure they have been applied (either by rerunning the SQL block or checking the Policies tab); otherwise authenticated calls will fail silently.

5. **Test via Supabase JS client**  
   Running `npm run test:profile` (todo: create script) or using the `supabase` client in-app ensures headers/tokens are automatically set. If the client succeeds but manual REST calls fail, the issue is almost certainly missing headers.

Following the steps above typically resolves `404` errors related to the users/profile endpoint.