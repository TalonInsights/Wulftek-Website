/* ============================================================
   WULFTEK — HOME PAGE BEHAVIOURS ("The Calibration")
   Counters, the headroom curve, the job-sheet ticks, the hero
   plate's cycling placeholder and the closing plate reprise.
   Everything fires once, and prefers-reduced-motion gets the
   finished state with no animation at all.
   ============================================================ */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = "IntersectionObserver" in window;

  function once(el, fn, threshold) {
    if (!el) return;
    if (!io || reduced) { fn(); return; }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { o.disconnect(); fn(); }
      });
    }, { threshold: threshold || 0.4 });
    o.observe(el);
  }

  /* ---------------- readout counters ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  Array.prototype.forEach.call(counters, function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var final = target.toFixed(decimals) + suffix;
    once(el, function () {
      if (reduced || target === 0) { el.textContent = final; return; }
      var t0 = null, DUR = 1100;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / DUR, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 0.6);
  });

  /* ---------------- the headroom curve ---------------- */
  /* same samples the SVG paths were generated from — the reticle
     interpolates between them */
  var RPMS_F = [1000, 1500, 1800, 2100, 2500, 3000, 3500, 4000, 4500, 5000];
  var TQ_F   = [148, 212, 262, 290, 295, 288, 270, 245, 214, 180];
  var RPMS_R = [1000, 1400, 1700, 2000, 2300, 2600, 3000, 3500, 4000, 4500, 5000];
  var TQ_R   = [168, 240, 308, 348, 364, 368, 360, 338, 306, 266, 222];
  var X0 = 60, X1 = 780, RPM0 = 1000, RPM1 = 5000, Y0 = 380, Y1 = 40, T0 = 100, T1 = 400;

  function interp(rpms, tqs, rpm) {
    if (rpm <= rpms[0]) return tqs[0];
    if (rpm >= rpms[rpms.length - 1]) return tqs[tqs.length - 1];
    for (var i = 1; i < rpms.length; i++) {
      if (rpm <= rpms[i]) {
        var f = (rpm - rpms[i - 1]) / (rpms[i] - rpms[i - 1]);
        return tqs[i - 1] + f * (tqs[i] - tqs[i - 1]);
      }
    }
    return tqs[tqs.length - 1];
  }
  var toY = function (t) { return Y0 + (t - T0) / (T1 - T0) * (Y1 - Y0); };

  var stage = document.getElementById("cvstage");
  if (stage) {
    var svg = document.getElementById("cvsvg");
    var lineF = document.getElementById("cvf"), lineR = document.getElementById("cvr");
    var gap = document.getElementById("cvgap"), gapLabel = document.getElementById("cvgaplabel");
    var annos = document.getElementById("annos");
    var reticle = document.getElementById("reticle");
    var rline = document.getElementById("rline");
    var rdotf = document.getElementById("rdotf"), rdotr = document.getElementById("rdotr");
    var read = document.getElementById("cvread");

    /* draw-on-scroll: factory first, then the remap, then the gap floods in */
    if (!reduced && lineF.getTotalLength) {
      [lineF, lineR].forEach(function (p) {
        var L = p.getTotalLength();
        p.style.strokeDasharray = L;
        p.style.strokeDashoffset = L;
      });
      gap.style.opacity = "0";
      annos.style.opacity = "0";
      gapLabel.style.opacity = "0";

      once(stage, function () {
        lineF.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)";
        lineF.style.strokeDashoffset = "0";
        setTimeout(function () {
          lineR.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.22,.61,.36,1)";
          lineR.style.strokeDashoffset = "0";
        }, 450);
        setTimeout(function () {
          [gap, gapLabel, annos].forEach(function (el) {
            el.style.transition = "opacity .8s ease";
            el.style.opacity = "1";
          });
        }, 1250);
      }, 0.35);
    }

    /* the reticle: run a fingertip (or cursor) along the rev range */
    function showAt(clientX) {
      var rect = stage.getBoundingClientRect();
      var x = (clientX - rect.left) / rect.width * 800;
      x = Math.max(X0, Math.min(X1, x));
      var rpm = RPM0 + (x - X0) / (X1 - X0) * (RPM1 - RPM0);
      var tf = interp(RPMS_F, TQ_F, rpm);
      var tr = interp(RPMS_R, TQ_R, rpm);
      rline.setAttribute("x1", x); rline.setAttribute("x2", x);
      rdotf.setAttribute("cx", x); rdotf.setAttribute("cy", toY(tf));
      rdotr.setAttribute("cx", x); rdotr.setAttribute("cy", toY(tr));
      reticle.style.opacity = "1";
      var gainTq = Math.round(tr - tf);
      var gainBhp = Math.round((tr * rpm - tf * rpm) / 5252);
      read.textContent = "+" + gainTq + " lb-ft · +" + gainBhp + " bhp at " +
        (Math.round(rpm / 50) * 50).toLocaleString("en-GB") + " rpm";
    }
    stage.addEventListener("pointermove", function (e) { showAt(e.clientX); });
    stage.addEventListener("pointerdown", function (e) { showAt(e.clientX); });
    stage.addEventListener("pointerleave", function () {
      reticle.style.opacity = "0";
      read.innerHTML = "move along the curve&nbsp;→";
    });
  }

  /* ---------------- job-sheet ticks ---------------- */
  var steps = document.querySelectorAll("#jobsheet .step");
  if (steps.length) {
    if (!io || reduced) {
      Array.prototype.forEach.call(steps, function (s) { s.classList.add("done"); });
    } else {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          so.unobserve(el);
          /* stagger so a fast scroll still ticks them in order */
          var idx = Array.prototype.indexOf.call(steps, el);
          setTimeout(function () { el.classList.add("done"); }, idx * 140);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(steps, function (s) { so.observe(s); });
    }
  }

  /* ---------------- hero plate: cycling placeholder ---------------- */
  var reg = document.getElementById("reg");
  if (reg && !reduced && window.WT && WT.DEMOS && WT.DEMOS.length) {
    var samples = WT.DEMOS.slice(0, 3);
    var i = 0, timer = setInterval(function () {
      if (document.activeElement === reg || reg.value) { stop(); return; }
      if (i < samples.length) { reg.placeholder = samples[i]; i++; }
      else { reg.placeholder = "YOUR REG"; stop(); }
    }, 1600);
    function stop() { clearInterval(timer); if (!reg.value) reg.placeholder = "YOUR REG"; }
    reg.addEventListener("focus", stop, { once: true });
  }

  /* ---------------- the plate reprise ---------------- */
  var form3 = document.getElementById("regform3");
  if (form3) {
    var input3 = document.getElementById("reg3");
    input3.addEventListener("input", function () {
      var raw = this.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      this.value = raw.length > 4 ? raw.slice(0, 4) + " " + raw.slice(4) : raw;
    });
    form3.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input3.value.trim()) { input3.focus(); return; }
      var main = document.getElementById("reg");
      var mainForm = document.getElementById("regform");
      if (main && mainForm) {
        main.value = input3.value;
        mainForm.dispatchEvent(new Event("submit", { cancelable: true }));
        document.querySelector(".hero").scrollIntoView({
          behavior: reduced ? "auto" : "smooth", block: "start"
        });
      }
    });
  }
})();
