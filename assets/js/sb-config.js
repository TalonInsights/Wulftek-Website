/* ---------------------------------------------------------------------
   WulfTek — Supabase connection details.

   ONE file, imported by both the public events page and the admin panel,
   so the keys are only ever filled in once.

   Both values below are PUBLIC and safe to commit. The anon key is
   designed to be shipped in a browser: it grants no access on its own,
   because every table has row-level security enabled and writing is
   restricted to rows in public.admins (see supabase/schema.sql).

   NEVER put the `service_role` key in this file, or anywhere in this
   repository. It bypasses row-level security entirely.

   Fill these in from: Supabase dashboard -> Project Settings -> Data API.
   Until they are filled in, the admin panel shows a setup notice and the
   public events page falls back to its "ring the workshop" message, so
   nothing on the live site breaks while this is still empty.
--------------------------------------------------------------------- */

export const SUPABASE_URL      = "";   // https://YOUR-PROJECT-REF.supabase.co
export const SUPABASE_ANON_KEY = "";   // the publishable / anon key

/* Addresses allowed to reach the sign-in step.

   Courtesy check only: it stops a typo turning into a pointless email.
   The real enforcement is in Supabase, where sign-ups are disabled and
   write access needs a row in public.admins. Leave empty to allow any
   address to attempt sign-in. */
export const ALLOWED_EMAILS = [
  // "wulftektuning@gmail.com",
];

/* How many digits the sign-in code has.

   Supabase allows 6 to 10 (Authentication -> Sign In / Providers ->
   Email -> OTP length). This MUST match that setting: the field caps
   input at this many digits and submits on the last one, so a mismatch
   silently sends a truncated code that can never verify. */
export const OTP_LENGTH = 6;

/* True once both values above are filled in. */
export const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
