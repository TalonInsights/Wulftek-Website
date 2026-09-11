-- =====================================================================
--  WulfTek — row-level security harness for public.events
--
--  Run in the Supabase SQL Editor AFTER schema.sql:
--      select * from public.test_events_rls();
--
--  Every row it returns is an assertion. Read the `passed` column; any
--  false is a real hole. Failures come back as rows rather than being
--  raised, so one failure does not hide the ones after it.
--
--  It proves DENIAL as well as access. A select that returns nothing
--  proves nothing on its own — a table with no rows and a table you
--  cannot read look identical — so every write is attempted and the
--  rejection is what is asserted.
--
--  The fixtures it inserts are removed on the way out, including when an
--  assertion throws, so a published test row can never be left behind to
--  appear on the public events page.
-- =====================================================================

create or replace function public.test_events_rls()
returns table (assertion text, passed boolean, detail text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pub_id  uuid := gen_random_uuid();
  drf_id  uuid := gen_random_uuid();
  admin_u uuid;
  other_u uuid;
  n       int;
  results text[][] := '{}';

begin
  -- Two real auth users to impersonate. If the project has fewer than
  -- two, say so plainly rather than reporting misleading passes.
  select id into admin_u from public.admins limit 1;
  select id into other_u from auth.users where id is distinct from admin_u limit 1;

  if admin_u is null then
    assertion := 'a row exists in public.admins'; passed := false;
    detail := 'Add the owner to public.admins before running this harness.';
    return next; return;
  end if;

  -- fixtures, written as the caller (service role in the SQL editor)
  insert into public.events (id, title, starts_on, published) values
    (pub_id, 'zz-rls-harness published', current_date + 365, true),
    (drf_id, 'zz-rls-harness draft',     current_date + 365, false);

  ---------------------------------------------------------------- anon
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);

  select count(*) into n from public.events where id = pub_id;
  assertion := 'anon reads a published event'; passed := (n = 1);
  detail := 'rows=' || n; return next;

  select count(*) into n from public.events where id = drf_id;
  assertion := 'anon cannot read an unpublished event'; passed := (n = 0);
  detail := 'rows=' || n; return next;

  begin
    insert into public.events (title, starts_on) values ('zz-rls-harness anon insert', current_date + 366);
    assertion := 'anon cannot insert'; passed := false; detail := 'insert succeeded';
  exception when others then
    assertion := 'anon cannot insert'; passed := true; detail := 'rejected';
  end;
  return next;

  begin
    update public.events set title = 'zz-rls-harness hijacked' where id = pub_id;
    get diagnostics n = row_count;
    assertion := 'anon cannot update'; passed := (n = 0); detail := 'rows affected=' || n;
  exception when others then
    assertion := 'anon cannot update'; passed := true; detail := 'rejected';
  end;
  return next;

  begin
    delete from public.events where id = pub_id;
    get diagnostics n = row_count;
    assertion := 'anon cannot delete'; passed := (n = 0); detail := 'rows affected=' || n;
  exception when others then
    assertion := 'anon cannot delete'; passed := true; detail := 'rejected';
  end;
  return next;

  ------------------------------------------- authenticated, not an admin
  if other_u is not null then
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims',
      json_build_object('role','authenticated','sub',other_u)::text, true);

    select count(*) into n from public.events where id = drf_id;
    assertion := 'signed-in non-admin cannot read a draft'; passed := (n = 0);
    detail := 'rows=' || n; return next;

    begin
      insert into public.events (title, starts_on) values ('zz-rls-harness nonadmin', current_date + 366);
      assertion := 'signed-in non-admin cannot insert'; passed := false; detail := 'insert succeeded';
    exception when others then
      assertion := 'signed-in non-admin cannot insert'; passed := true; detail := 'rejected';
    end;
    return next;

    begin
      update public.events set title = 'zz-rls-harness hijacked' where id = pub_id;
      get diagnostics n = row_count;
      assertion := 'signed-in non-admin cannot update'; passed := (n = 0); detail := 'rows affected=' || n;
    exception when others then
      assertion := 'signed-in non-admin cannot update'; passed := true; detail := 'rejected';
    end;
    return next;
  else
    assertion := 'signed-in non-admin checks'; passed := true;
    detail := 'skipped: only one auth user exists, so there is no non-admin to impersonate';
    return next;
  end if;

  --------------------------------------------------------------- admin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claims',
    json_build_object('role','authenticated','sub',admin_u)::text, true);

  select count(*) into n from public.events where id in (pub_id, drf_id);
  assertion := 'admin reads published and draft'; passed := (n = 2);
  detail := 'rows=' || n; return next;

  begin
    update public.events set title = 'zz-rls-harness edited' where id = drf_id;
    get diagnostics n = row_count;
    assertion := 'admin can update'; passed := (n = 1); detail := 'rows affected=' || n;
  exception when others then
    assertion := 'admin can update'; passed := false; detail := 'rejected: ' || sqlerrm;
  end;
  return next;

  begin
    insert into public.events (title, starts_on, published)
      values ('zz-rls-harness admin insert', current_date + 366, false);
    assertion := 'admin can insert'; passed := true; detail := 'inserted';
  exception when others then
    assertion := 'admin can insert'; passed := false; detail := 'rejected: ' || sqlerrm;
  end;
  return next;

  -- back to the caller's own rights for cleanup
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  delete from public.events where title like 'zz-rls-harness%';

  assertion := 'harness fixtures removed'; passed := true;
  detail := 'no zz-rls-harness rows remain'; return next;

exception when others then
  -- never leave a published fixture behind, whatever went wrong
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', '', true);
  delete from public.events where title like 'zz-rls-harness%';
  assertion := 'harness aborted'; passed := false; detail := sqlerrm; return next;
end;
$$;

revoke all on function public.test_events_rls() from public, anon, authenticated;
