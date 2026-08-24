/* ============================================================
   WULFTEK — BOOKING ENQUIRY FORM
   Three steps, a live summary panel, and prefill from whatever
   registration was looked up on the home page.

   NOTE: there is no backend yet. Submitting shows the confirmation
   but sends nothing anywhere — wiring this to an email service is
   a launch task, see README.
   ============================================================ */
(function () {
  "use strict";
  var form = document.getElementById("bookform");
  if (!form) return;

  var panes = form.querySelectorAll(".pane");
  var tabs = document.querySelectorAll(".bkbar button");
  var reached = 1;

  /* ---------------- step navigation ---------------- */
  function show(n) {
    Array.prototype.forEach.call(panes, function (p) {
      p.classList.toggle("on", p.getAttribute("data-pane") === String(n));
    });
    Array.prototype.forEach.call(tabs, function (t) {
      var sn = Number(t.getAttribute("data-step"));
      t.classList.toggle("on", sn === n);
      t.classList.toggle("done", sn < reached && sn !== n);
      t.setAttribute("aria-selected", sn === n ? "true" : "false");
    });
    if (n > reached) reached = n;
  }

  form.addEventListener("click", function (e) {
    var b = e.target.closest("[data-go]");
    if (!b) return;
    var n = Number(b.getAttribute("data-go"));
    reached = Math.max(reached, n);
    show(n);
    var card = document.querySelector(".bkcard");
    if (card) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });

  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener("click", function () { show(Number(this.getAttribute("data-step"))); });
  });

  /* ---------------- live summary ---------------- */
  function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }
  function put(id, v) {
    var e = document.getElementById(id);
    if (!e) return;
    e.textContent = v || "—";
    e.classList.toggle("e", !v);
  }
  function clip(s, n) { return s.length > n ? s.slice(0, n) + "…" : s; }

  function sync() {
    put("s-reg", val("b-reg"));
    put("s-veh", (val("b-make") + " " + val("b-model")).trim());
    var y = val("b-year"), m = val("b-miles");
    put("s-ym", (y || m) ? ((y || "?") + " / " + (m ? m + " mi" : "?")) : "");
    var mods = val("b-mods");
    put("s-mods", mods ? clip(mods, 46) : "");
    var job = form.querySelector("input[name=job]:checked");
    put("s-job", job ? job.value : "");
    put("s-war", val("b-war"));
    put("s-con", [val("b-name"), val("b-phone") || val("b-email")].filter(Boolean).join(" · "));
  }
  form.addEventListener("input", sync);
  form.addEventListener("change", sync);

  /* ---------------- prefill from the home-page lookup ---------------- */
  (function prefill() {
    var reg, car;
    try {
      reg = sessionStorage.getItem("wt:reg") || "";
      var raw = sessionStorage.getItem("wt:car");
      car = raw ? JSON.parse(raw) : null;
    } catch (e) { return; }

    var breg = document.getElementById("b-reg");
    if (reg && breg && !breg.value) breg.value = reg;

    if (car) {
      var map = { "b-make": car.make, "b-model": car.model, "b-year": car.year };
      Object.keys(map).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.value) el.value = map[id];
      });
      if (car.kind === "agri") {
        var r = document.getElementById("jb3");
        if (r && !form.querySelector("input[name=job]:checked")) r.checked = true;
      }
    }
    sync();
  })();

  /* format the plate field as it is typed */
  var breg = document.getElementById("b-reg");
  if (breg) {
    breg.addEventListener("input", function () {
      var raw = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      this.value = raw.length > 4 ? raw.slice(0, 4) + " " + raw.slice(4) : raw;
    });
  }

  /* ---------------- submit ---------------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sync();
    var done = document.getElementById("bkdone");
    if (!done) return;
    done.classList.add("on");
    done.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
