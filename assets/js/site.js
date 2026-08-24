/* ============================================================
   WULFTEK — SITE CHROME
   Navigation, scroll reveals, placeholder photography and the
   contact links. Runs on every page.
   ============================================================ */
(function () {
  "use strict";
  var WT = window.WT || {};

  /* ---------------- mobile nav + services dropdown ---------------- */
  var body = document.body;
  var burger = document.getElementById("bg");
  var dd = document.getElementById("dd");
  var ddb = document.getElementById("ddb");

  if (burger) {
    burger.addEventListener("click", function () {
      var open = body.classList.toggle("nav");
      this.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  if (dd && ddb) {
    ddb.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle("open");
      ddb.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!dd.contains(e.target)) {
        dd.classList.remove("open");
        ddb.setAttribute("aria-expanded", "false");
      }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (dd) { dd.classList.remove("open"); }
    if (ddb) { ddb.setAttribute("aria-expanded", "false"); }
    body.classList.remove("nav");
    if (burger) burger.setAttribute("aria-expanded", "false");
  });

  /* header gets a border once you scroll off the top */
  var hdr = document.getElementById("hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("stuck", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- placeholder photography ----------------
     Each <div class="img" data-img="key"> is filled from WT.IMG.
     A missing or failed URL falls back to a toned panel rather
     than anything that reads as broken.                        */
  function placeholder(el, cfg) {
    el.classList.add("pz", cfg.zone);
    el.innerHTML = "";
  }
  function paintImages() {
    var els = document.querySelectorAll("[data-img]");
    Array.prototype.forEach.call(els, function (el) {
      var cfg = (WT.IMG || {})[el.getAttribute("data-img")];
      if (!cfg || el.dataset.done) return;
      el.dataset.done = "1";
      if (!cfg.url) { placeholder(el, cfg); return; }
      var im = document.createElement("img");
      im.alt = cfg.brief;
      im.loading = "lazy";
      im.decoding = "async";
      im.onerror = function () { el.innerHTML = ""; placeholder(el, cfg); };
      im.src = cfg.url;
      el.appendChild(im);
    });
  }
  paintImages();

  /* ---------------- scroll reveals ----------------
     Reveals REPLAY: the class comes off once an element has fully
     left the viewport, so scrolling back re-runs its animation.
     The reveal fires early (top edge near the viewport) but the
     reset only once truly gone, so nothing flickers at the edge. */
  var io = ("IntersectionObserver" in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          en.target.classList.toggle("in", en.isIntersecting);
        });
      }, { threshold: 0, rootMargin: "0px 0px -6% 0px" })
    : null;

  var items = document.querySelectorAll(".rv");
  Array.prototype.forEach.call(items, function (el) {
    if (io) io.observe(el); else el.classList.add("in");
  });
  /* anything already on screen at load reveals immediately */
  setTimeout(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".rv"), function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  }, 50);

  /* ---------------- contact links ---------------- */
  var C = WT.CONTACT || {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-contact]"), function (el) {
    var kind = el.getAttribute("data-contact");
    if (kind === "tel" && C.phone) {
      el.href = "tel:" + C.phone.replace(/\s/g, "");
      el.textContent = C.phone;
    }
    if (kind === "email" && C.email) {
      el.href = "mailto:" + C.email;
      el.textContent = C.email;
    }
  });

  /* ---------------- footer year ---------------- */
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
