/* ============================================================
   WULFTEK — PUBLIC EVENTS LIST
   Reads published, upcoming events from Supabase and renders the
   diary on /events.

   Three states, all of them deliberate:
     not configured  the keys are still empty, so the page keeps its
                     "ring the workshop" message and nobody sees an error
     empty           configured, but nothing in the diary yet
     listed          the events, soonest first

   Read-only and anonymous. Row-level security only exposes rows the
   owner has published, so a draft listing cannot appear here even if
   somebody asks for it by id.
   ============================================================ */
import { SUPABASE_URL, SUPABASE_ANON_KEY, CONFIGURED } from "/assets/js/sb-config.js";

const mount = document.getElementById("evlist");
if (mount) {
  const KIND = {
    meet:    "Car meet",
    show:    "Show",
    charity: "Charity day",
    trade:   "Trade & farm day"
  };

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const setState = (s) => mount.setAttribute("data-state", s);

  /* "Sat 14 Jun", and a range when the show runs over a weekend */
  function when(ev) {
    const opts = { weekday: "short", day: "numeric", month: "short" };
    const a = new Date(ev.starts_on + "T00:00:00");
    let out = a.toLocaleDateString("en-GB", opts);
    if (ev.ends_on && ev.ends_on !== ev.starts_on) {
      const b = new Date(ev.ends_on + "T00:00:00");
      out += " to " + b.toLocaleDateString("en-GB", opts);
    }
    return out;
  }

  function card(ev) {
    const d = new Date(ev.starts_on + "T00:00:00");
    const place = [ev.venue, ev.town].filter(Boolean).join(", ");
    const title = ev.url
      ? `<a href="${esc(ev.url)}" rel="noopener">${esc(ev.title)}</a>`
      : esc(ev.title);

    return `<article class="evrow">
      <div class="evdate" aria-hidden="true">
        <b>${d.getDate()}</b>
        <span>${d.toLocaleDateString("en-GB", { month: "short" })}</span>
      </div>
      <div class="evbody">
        <span class="evkind">${esc(KIND[ev.kind] || "Event")}</span>
        <h3>${title}</h3>
        <p class="evmeta">${esc(when(ev))}${ev.time_note ? ", " + esc(ev.time_note) : ""}${place ? " &middot; " + esc(place) : ""}</p>
        ${ev.blurb ? `<p class="evblurb">${esc(ev.blurb)}</p>` : ""}
      </div>
    </article>`;
  }

  /* Preview events live in this browser only, written by /admin while
     there is no database. A real visitor has none, so they still get the
     "ring the workshop" message: nothing here leaks a draft to anybody. */
  function previewRows() {
    try {
      const rows = JSON.parse(localStorage.getItem("wt:events:preview") || "[]");
      const today = new Date().toISOString().slice(0, 10);
      return rows
        .filter((r) => r.published && (r.ends_on || r.starts_on) >= today)
        .sort((a, b) => a.starts_on.localeCompare(b.starts_on));
    } catch (e) { return []; }
  }

  (async function load() {
    if (!CONFIGURED) {
      const rows = previewRows();
      if (rows.length) {
        mount.querySelector(".evitems").innerHTML = rows.map(card).join("");
        setState("listed");
      } else {
        setState("unconfigured");
      }
      return;
    }
    setState("loading");
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.4");
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });

      /* today, not now: an all-day show should stay listed on the day */
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await sb
        .from("events")
        .select("id,title,kind,starts_on,ends_on,time_note,venue,town,blurb,url")
        .or(`ends_on.gte.${today},and(ends_on.is.null,starts_on.gte.${today})`)
        .order("starts_on", { ascending: true })
        .limit(40);

      if (error) throw error;
      if (!data || !data.length) { setState("empty"); return; }

      mount.querySelector(".evitems").innerHTML = data.map(card).join("");
      setState("listed");
    } catch (e) {
      /* A listing that will not load must not look like an empty diary,
         which would tell a visitor there is nothing on when there is. */
      setState("error");
    }
  })();
}
