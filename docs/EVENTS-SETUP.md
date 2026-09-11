# Events: connecting the admin panel

The events diary on `/events` and the admin panel at `/admin` both read from a
Supabase project. Until that project exists the site is unaffected: the events
page keeps its "ring the workshop" message and the admin panel shows a setup
notice instead of an error.

Everything below is done once, by the site owner. **Do not hand the keys to
anyone else, and never put the `service_role` key in this repository.**

## Before any of that: preview mode

While the keys are empty the panel runs in **preview mode**. There is no
sign-in and no database: the board works, but anything added is saved in that
browser alone. It is not public, and it does not reach anyone else.

That is there so the workflow can be tried and approved before paying for a
Supabase project. Add a few events, look at `/events` in the same browser, and
say what needs changing.

**The sign-in gate comes back on its own** the moment the keys below are filled
in. Nobody has to remember to re-enable it, and preview events do not migrate:
they stay in the browser and the real diary starts empty.

Way in: the full stop at the end of the footer's right-hand line is a link to
`/admin`. It is deliberately quiet rather than secret, and `/admin` is excluded
from search engines either way.

---

## 1. Create the project

In Supabase, create a new project.

**Choose the London (eu-west-2) region.** The region is permanent and cannot
be changed once any data is stored.

## 2. Create the tables

SQL Editor, paste the whole of `supabase/schema.sql`, run it.

It creates two tables (`events` and `admins`), an `is_admin()` helper, and the
row-level security policies. Read what it prints: a script that was saved but
never actually run is the classic way to think this step is done when it isn't.

## 3. Turn sign-ups off

Authentication → Sign In / Providers → Email.

- **Disable** "Allow new users to sign up". Nobody should be able to create an
  account against this project.
- Note the **OTP length** (6 to 10). It must match `OTP_LENGTH` in
  `assets/js/sb-config.js`, or the panel submits a truncated code that can
  never verify.

## 4. Create your own user

Authentication → Users → Add user.

Use the address you will sign in with, and **tick Auto Confirm**. A user made
by hand without it can never receive a sign-in code.

The email that carries the code is the **Magic Link** template, not Confirm
Signup or Invite. If the code is missing from the email, that is the template
to edit.

## 5. Make yourself an admin

Being able to sign in is not the same as being allowed to change events. Add
yourself to `public.admins`:

```sql
insert into public.admins (user_id, note)
select id, 'WulfTek owner' from auth.users where email = 'you@example.com';
```

## 6. Paste the keys in

Project Settings → Data API. Copy the **Project URL** and the **anon /
publishable** key into `assets/js/sb-config.js`.

Both are public and safe to commit: the anon key grants nothing on its own,
because row-level security only lets it read events you have published.

While you are in that file, add your address to `ALLOWED_EMAILS`. That is a
convenience so a typo does not send a pointless email; it is not a gate.

## 7. Prove the security actually works

SQL Editor, run `supabase/tests/rls.sql`, then:

```sql
select * from public.test_events_rls();
```

Every row must say `passed = true`. The harness tries to write as an anonymous
visitor and as a signed-in non-admin, and asserts that it is refused. A page
that looks right proves nothing here; a policy that lets a stranger edit the
diary would look exactly the same from the outside.

It cleans up after itself, including when an assertion fails, so no test row
is left on the public page.

---

## Using it

`/admin` → sign in with your email → a code arrives → you are in.

- **Add an event** fills the diary. Nothing appears publicly until you tick
  **Show this on the website**, so you can draft a listing before it is
  announced.
- Events disappear from the public page the day after they finish. They stay
  in the admin list, greyed out and marked Finished, so you have a record.
- **Last day** is only for something that runs over, like a two-day show.
- **Time** is free text on purpose: "from 6pm", "gates 9am".

## What is stored

Public listing information only: what the event is, when, where, and a link.

**Do not put personal data in these fields.** No attendee names, no phone
numbers, no email addresses. The database cannot enforce that on a free-text
field, so it is an operating rule rather than a technical guarantee.
