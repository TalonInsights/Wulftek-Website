/* ============================================================
   WULFTEK — EVENTS ADMIN
   Passwordless sign-in, then add / edit / publish / delete events.

   Nothing here is a security boundary. The allow-list below only saves
   a pointless email, and hiding the board behind a sign-in only hides
   the UI. The real gate is in the database: sign-ups are disabled, and
   every write policy on public.events requires a row in public.admins.
   ============================================================ */
import { SUPABASE_URL, SUPABASE_ANON_KEY, ALLOWED_EMAILS, OTP_LENGTH, CONFIGURED }
  from "/assets/js/sb-config.js";

const $ = (id) => document.getElementById(id);
const show = (el, on) => { if (el) el.hidden = !on; };

/* Supabase allows 6 to 10. A mismatch with the project setting silently
   submits a truncated code that can never verify, so clamp it and use one
   number everywhere rather than trusting the config blindly. */
const CODE_LEN = (Number(OTP_LENGTH) >= 6 && Number(OTP_LENGTH) <= 10) ? Number(OTP_LENGTH) : 6;

if (!CONFIGURED) {
  show($("paneSetup"), true);
} else {
  boot();
}

async function boot() {
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.4");
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      /* handled by hand so a failure surfaces instead of bouncing
         silently back to the sign-in card */
      detectSessionInUrl: false,
      flowType: "pkce"
    }
  });

  const KIND = { meet: "Car meet", show: "Show", charity: "Charity day", trade: "Trade & farm day" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let stage = "email";
  let otpEmail = "";
  let editing = null;          // the row being edited, or null for a new one

  const gateForm = $("gateForm"), gateEmail = $("gateEmail"), gateCode = $("gateCode");
  const gateBtn = $("gateBtn"), gateBack = $("gateBack"), gateMsg = $("gateMsg");
  const board = $("evAdmin"), rows = board.querySelector(".arows");
  const dlg = $("evDialog");

  const msg = (el, text, kind) => {
    el.textContent = text;
    el.className = "amsg" + (kind ? " " + kind : "");
  };

  /* ---------------- sign in ---------------- */
  function emailStep() {
    stage = "email";
    show($("wrapEmail"), true); show($("wrapCode"), false); show(gateBack, false);
    gateBtn.innerHTML = 'Send me a code <span class="ar">&rarr;</span>';
    gateEmail.focus();
  }
  function codeStep(email) {
    stage = "code"; otpEmail = email;
    show($("wrapEmail"), false); show($("wrapCode"), true); show(gateBack, true);
    gateBtn.innerHTML = 'Sign in <span class="ar">&rarr;</span>';
    gateCode.value = ""; gateCode.placeholder = "0".repeat(CODE_LEN); gateCode.focus();
  }
  gateBack.addEventListener("click", () => { emailStep(); msg(gateMsg, "", ""); });

  /* typing the last digit submits, so nobody reaches for the mouse */
  gateCode.addEventListener("input", () => {
    gateCode.value = gateCode.value.replace(/\D/g, "").slice(0, CODE_LEN);
    if (gateCode.value.length === CODE_LEN) gateForm.requestSubmit();
  });

  gateForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (stage === "code") {
      const code = gateCode.value.trim();
      if (code.length !== CODE_LEN) {
        msg(gateMsg, "The code is " + CODE_LEN + " digits.", "err"); return;
      }
      gateBtn.disabled = true; msg(gateMsg, "Checking...", "");
      const { error } = await sb.auth.verifyOtp({ email: otpEmail, token: code, type: "email" });
      gateBtn.disabled = false;
      if (error) { msg(gateMsg, authError(error), "err"); gateCode.value = ""; gateCode.focus(); }
      return;                                 // onAuthStateChange takes it from here
    }

    const email = gateEmail.value.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      msg(gateMsg, "That doesn't look like an email address.", "err"); return;
    }
    const allowed = (ALLOWED_EMAILS || []).map((a) => a.trim().toLowerCase());
    if (allowed.length && !allowed.includes(email)) {
      msg(gateMsg, "That address doesn't have access to this panel.", "err"); return;
    }

    gateBtn.disabled = true; msg(gateMsg, "Sending...", "");
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false }    // no self-signup, ever
    });
    gateBtn.disabled = false;
    if (error) {
      msg(gateMsg, /not.*(allowed|found)|signups? not allowed/i.test(error.message)
        ? "That address doesn't have access to this panel."
        : "Couldn't send the code: " + error.message, "err");
      return;
    }
    codeStep(email);
    msg(gateMsg, "Code sent. Check your inbox.", "ok");
  });

  function authError(error) {
    const d = (error.message || "").toLowerCase();
    /* PKCE first: its message contains both "invalid" and "code", so a
       looser rule below would swallow it and name the wrong cause. */
    if (/verifier/.test(d))
      return "Open that link in the same browser you asked for it from, or ignore it and type the code from the same email.";
    if (/expired/.test(d)) return "That code has expired. Ask for a new one.";
    if (/invalid/.test(d)) return "That code wasn't right. Check the newest email and try again.";
    return "Couldn't sign you in: " + error.message;
  }

  $("btnSignOut").addEventListener("click", async () => {
    await sb.auth.signOut();
    setSignedIn(false);
    emailStep();
    msg(gateMsg, "You've been signed out.", "ok");
  });

  function setSignedIn(on) {
    show($("paneGate"), !on);
    show($("paneBoard"), on);
    show($("btnSignOut"), on);
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (session) { setSignedIn(true); load(); }
    else if (event === "SIGNED_OUT") setSignedIn(false);
  });

  /* ---------------- the board ---------------- */
  function when(ev) {
    const opts = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
    const a = new Date(ev.starts_on + "T00:00:00");
    let out = a.toLocaleDateString("en-GB", opts);
    if (ev.ends_on && ev.ends_on !== ev.starts_on)
      out += " to " + new Date(ev.ends_on + "T00:00:00").toLocaleDateString("en-GB", opts);
    return out;
  }

  async function load() {
    board.setAttribute("data-state", "loading");
    const { data, error } = await sb.from("events")
      .select("*").order("starts_on", { ascending: false }).limit(200);

    if (error) { board.setAttribute("data-state", "error"); return; }
    if (!data.length) { board.setAttribute("data-state", "empty"); rows.innerHTML = ""; return; }

    const today = new Date().toISOString().slice(0, 10);
    rows.innerHTML = data.map((ev) => {
      const past = (ev.ends_on || ev.starts_on) < today;
      const place = [ev.venue, ev.town].filter(Boolean).join(", ");
      return '<div class="arow' + (past ? " past" : "") + '" data-id="' + ev.id + '">' +
        '<div class="arow-main">' +
          '<span class="evkind">' + esc(KIND[ev.kind] || "Event") + '</span>' +
          "<h3>" + esc(ev.title) + "</h3>" +
          '<p class="evmeta">' + esc(when(ev)) +
            (ev.time_note ? ", " + esc(ev.time_note) : "") +
            (place ? " &middot; " + esc(place) : "") + "</p>" +
        "</div>" +
        '<div class="arow-side">' +
          '<span class="pill ' + (ev.published ? "live" : "draft") + '">' +
            (ev.published ? "On the site" : "Draft") + "</span>" +
          (past ? '<span class="pill past">Finished</span>' : "") +
          '<button type="button" class="btn solidpad o edit">Edit</button>' +
        "</div></div>";
    }).join("");
    board.setAttribute("data-state", "listed");
  }

  rows.addEventListener("click", async (e) => {
    const btn = e.target.closest(".edit");
    if (!btn) return;
    const id = btn.closest(".arow").getAttribute("data-id");
    const { data, error } = await sb.from("events").select("*").eq("id", id).single();
    if (error) { msg($("boardMsg"), "Couldn't open that one: " + error.message, "err"); return; }
    openDialog(data);
  });

  $("btnNew").addEventListener("click", () => openDialog(null));

  /* ---------------- add / edit ---------------- */
  function openDialog(ev) {
    editing = ev;
    $("evDialogTitle").textContent = ev ? "Edit event" : "Add an event";
    $("f-title").value       = (ev && ev.title)     || "";
    $("f-kind").value        = (ev && ev.kind)      || "meet";
    $("f-time").value        = (ev && ev.time_note) || "";
    $("f-starts").value      = (ev && ev.starts_on) || "";
    $("f-ends").value        = (ev && ev.ends_on)   || "";
    $("f-venue").value       = (ev && ev.venue)     || "";
    $("f-town").value        = (ev && ev.town)      || "";
    $("f-blurb").value       = (ev && ev.blurb)     || "";
    $("f-url").value         = (ev && ev.url)       || "";
    $("f-published").checked = Boolean(ev && ev.published);
    show($("btnDelete"), Boolean(ev));
    msg($("formMsg"), "", "");
    dlg.showModal();
    $("f-title").focus();
  }

  $("btnCancel").addEventListener("click", () => dlg.close());

  $("btnSave").addEventListener("click", async () => {
    const title  = $("f-title").value.trim();
    const starts = $("f-starts").value;
    const ends   = $("f-ends").value || null;
    const url    = $("f-url").value.trim();

    if (!title)  { msg($("formMsg"), "Give it a name.", "err"); return; }
    if (!starts) { msg($("formMsg"), "Give it a date.", "err"); return; }
    if (ends && ends < starts) { msg($("formMsg"), "The last day can't be before the first.", "err"); return; }
    if (url && !/^https?:\/\//i.test(url)) {
      msg($("formMsg"), "A link needs to start with http:// or https://", "err"); return;
    }

    const row = {
      title: title,
      kind:      $("f-kind").value,
      starts_on: starts,
      ends_on:   ends,
      time_note: $("f-time").value.trim()  || null,
      venue:     $("f-venue").value.trim() || null,
      town:      $("f-town").value.trim()  || null,
      blurb:     $("f-blurb").value.trim() || null,
      url:       url || null,
      published: $("f-published").checked
    };

    $("btnSave").disabled = true;
    msg($("formMsg"), "Saving...", "");
    const { error } = editing
      ? await sb.from("events").update(row).eq("id", editing.id)
      : await sb.from("events").insert(row);
    $("btnSave").disabled = false;

    if (error) { msg($("formMsg"), saveError(error), "err"); return; }
    dlg.close();
    msg($("boardMsg"), editing ? "Saved." : "Added.", "ok");
    load();
  });

  $("btnDelete").addEventListener("click", async () => {
    if (!editing) return;
    if (!confirm('Delete "' + editing.title + '"? This cannot be undone.')) return;
    const { error } = await sb.from("events").delete().eq("id", editing.id);
    if (error) { msg($("formMsg"), saveError(error), "err"); return; }
    dlg.close();
    msg($("boardMsg"), "Deleted.", "ok");
    load();
  });

  /* A policy refusal comes back as an ordinary error. Name the likely
     cause rather than echoing Postgres at somebody adding a car meet. */
  function saveError(error) {
    if (/row-level security|permission denied|violates/i.test(error.message || ""))
      return "That account isn't allowed to change events. It needs a row in public.admins.";
    return "Couldn't save: " + error.message;
  }

  /* ---------------- start ---------------- */
  const { data: { session } } = await sb.auth.getSession();
  if (session) { setSignedIn(true); load(); }
  else { setSignedIn(false); emailStep(); }
}
