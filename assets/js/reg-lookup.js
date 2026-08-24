/* ============================================================
   WULFTEK — REGISTRATION LOOKUP
   The centrepiece of the home page. Looks a registration up in
   WT.VEH and shows what the vehicle could gain. Anything not in
   the list falls back to a make/model picker, then to a capture
   form, so nobody hits a dead end.

   NOTE: WT.VEH is a small demonstration dataset. Wiring this to a
   real vehicle-data API is a launch task — see README.
   ============================================================ */
(function () {
  "use strict";
  var WT = window.WT || {};
  var VEH = WT.VEH || {}, MARQUE = WT.MARQUE || {}, DEMOS = WT.DEMOS || [];

  function tidy(v) { return (v || "").toUpperCase().replace(/[^A-Z0-9]/g, ""); }
  function pretty(k) { return k.length > 4 ? k.slice(0, 4) + " " + k.slice(4) : k; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* format the plate as it is typed */
  function fmtInput(el) {
    if (!el) return;
    el.addEventListener("input", function () {
      var raw = tidy(this.value);
      this.value = raw.length > 4 ? raw.slice(0, 4) + " " + raw.slice(4) : raw;
    });
  }

  /* remember the last lookup so /book can prefill itself */
  function remember(reg, car) {
    try {
      sessionStorage.setItem("wt:reg", reg || "");
      sessionStorage.setItem("wt:car", car ? JSON.stringify(car) : "");
    } catch (e) { /* private mode — prefill is a nicety, not a requirement */ }
  }

  function optRow(cls, href, kick, title, copy, gain, unit) {
    return '<a class="vopt ' + cls + '" href="' + href + '"><div><small>' + esc(kick) +
      '</small><strong>' + esc(title) + '</strong><p>' + esc(copy) + '</p></div>' +
      (gain ? '<div class="vg"><b>' + esc(gain) + '</b><span>' + esc(unit) + '</span></div>' : '') + '</a>';
  }

  function vehicleCard(key, car) {
    var opts = "";
    if (car.g.perf) opts += optRow("o1", "/performance", "Performance", "More power and response",
      "Stronger pull for overtaking, towing and hills.", car.g.perf[0], car.g.perf[1]);
    if (car.g.eco) opts += optRow("o2", "/economy", "Economy", "Better fuel economy",
      "Same driving, fewer stops at the pump.", car.g.eco[0], car.g.eco[1]);
    if (car.g.agri) opts += optRow("o3", "/agricultural", "Agricultural", "Torque under load",
      "Pulling power that holds through a long day.", car.g.agri[0], car.g.agri[1]);

    var note = (!car.g.eco && car.kind === "car")
      ? '<p class="tiny sub" style="margin-top:12px;">Economy work isn\'t usually worth it on a petrol like this one. We\'d rather say so than sell you something that won\'t pay for itself.</p>'
      : "";

    return '<div class="vcard"><div class="vhead"><span class="mplate">' + esc(pretty(key)) +
      '</span><div><h3>' + esc(car.make + " " + car.model) + '</h3><div class="vs">' +
      esc(car.year + " · " + car.fuel) + '</div></div></div>' +
      '<div class="vspec"><div><span>Standard power</span><b>' + esc(car.bhp) + ' bhp</b></div>' +
      '<div><span>Standard torque</span><b>' + esc(car.tq) + ' lb-ft</b></div>' +
      '<div><span>Fuel</span><b>' + esc(car.fuel) + '</b></div>' +
      '<div><span>Original file</span><b>Archived</b></div></div>' +
      '<h4 style="margin-bottom:12px;">What we could do with it</h4><div class="vopts">' + opts + '</div>' + note +
      '<p class="tiny sub" style="margin-top:16px;">Typical figures for this engine. Yours is confirmed on the vehicle before any work is agreed.</p>' +
      '<div class="btns" style="margin-top:18px;"><a class="btn p" href="/book">Book this vehicle in <span class="ar">&rarr;</span></a>' +
      '<a class="btn solidpad o" href="/what-is-remapping">What\'s involved?</a></div></div>';
  }

  /* fallback: pick the make and model by hand, then leave details */
  function manualHTML(reg) {
    var makes = Object.keys(MARQUE).map(function (k) {
      return '<option value="' + esc(k) + '">' + esc(MARQUE[k].name) + "</option>";
    }).join("");
    return '<h3 style="margin-bottom:6px;">Let\'s find it another way</h3>' +
      '<p class="sub" style="font-size:.94rem;margin-bottom:18px;">Pick your make and model instead, or leave your details and we\'ll come back with exactly what\'s available for it.</p>' +
      '<div class="fields f2" style="margin-bottom:16px;">' +
      '<label class="fld"><span>Make</span><select id="mk-make"><option value="">Select a make</option>' + makes + '</select></label>' +
      '<label class="fld"><span>Model</span><select id="mk-model" disabled><option value="">Select a make first</option></select></label></div>' +
      '<div class="btns" style="margin-bottom:22px;"><button type="button" class="btn d" id="mk-go">Show figures <span class="ar">&rarr;</span></button></div>' +
      '<div style="border-top:1px solid var(--line);padding-top:22px;">' +
      '<h4 style="margin-bottom:6px;">Still not there?</h4>' +
      '<p class="sub tiny" style="margin-bottom:16px;">Leave a number and the reg, and you\'ll get a straight answer on whether we can do it.</p>' +
      '<div class="fields f2" style="margin-bottom:14px;">' +
      '<label class="fld"><span>Registration</span><input id="cap-reg" type="text" value="' + esc(reg || "") + '"></label>' +
      '<label class="fld"><span>Phone or email</span><input id="cap-con" type="text" placeholder="How to reach you"></label></div>' +
      '<div class="btns"><button type="button" class="btn p" id="cap-go">Ask us about it <span class="ar">&rarr;</span></button></div>' +
      '<p class="tiny sub" id="cap-msg" style="margin-top:14px;display:none;"></p></div>';
  }

  function wireManual(box) {
    var mk = box.querySelector("#mk-make"), mo = box.querySelector("#mk-model");
    mk.addEventListener("change", function () {
      var m = MARQUE[this.value];
      if (!m) {
        mo.disabled = true;
        mo.innerHTML = '<option value="">Select a make first</option>';
        return;
      }
      mo.disabled = false;
      mo.innerHTML = '<option value="">Select a model</option>' + m.models.map(function (r, i) {
        return '<option value="' + i + '">' + esc(r[0]) + "</option>";
      }).join("");
    });
    box.querySelector("#mk-go").addEventListener("click", function () {
      if (!mk.value) return;
      window.location.href = "/remap/" + mk.value;
    });
    box.querySelector("#cap-go").addEventListener("click", function () {
      var msg = box.querySelector("#cap-msg");
      msg.style.display = "block";
      msg.textContent = box.querySelector("#cap-con").value.trim()
        ? "Thanks — that is with the workshop now. You will hear back shortly."
        : "Add a phone number or email so we can get back to you.";
    });
  }

  function lookup(value, outEl, manEl, errEl, scroll) {
    var key = tidy(value);
    if (key.length < 4) {
      if (errEl) {
        errEl.textContent = "That doesn't look like a full registration — have another go.";
        errEl.classList.add("on");
      }
      return;
    }
    if (errEl) errEl.classList.remove("on");

    var car = VEH[key] || null;
    remember(pretty(key), car);

    if (car) {
      outEl.innerHTML = vehicleCard(key, car);
      outEl.classList.add("on");
      if (manEl) manEl.classList.remove("on");
    } else {
      outEl.innerHTML = '<div class="vcard"><div class="vhead"><span class="mplate">' + esc(pretty(key)) +
        '</span><div><h3>Let\'s check that one manually</h3><div class="vs">We\'ll confirm the details with you</div></div></div>' +
        '<p class="sub" style="font-size:.95rem;margin:0;">Pick your make and model below and we\'ll show you typical figures, or leave your details and we\'ll come back with exactly what\'s available for it.</p></div>';
      outEl.classList.add("on");
      if (manEl) {
        manEl.innerHTML = manualHTML(pretty(key));
        manEl.classList.add("on");
        wireManual(manEl);
      }
    }
    if (scroll !== false) outEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ---------------- home page ---------------- */
  var form = document.getElementById("regform");
  if (form) {
    var input = document.getElementById("reg");
    var out = document.getElementById("vres");
    var man = document.getElementById("manual");
    var err = document.getElementById("regerr");
    var pick = 0;

    fmtInput(input);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      lookup(input.value, out, man, err);
    });
    input.addEventListener("input", function () { if (err) err.classList.remove("on"); });

    var demo = document.getElementById("demo");
    if (demo) {
      demo.addEventListener("click", function () {
        var r = DEMOS[pick % DEMOS.length];
        pick++;
        input.value = r;
        lookup(r, out, man, err);
      });
    }

    /* arriving from /vehicles?reg=… runs the lookup straight away */
    var q = new URLSearchParams(window.location.search).get("reg");
    if (q) {
      input.value = pretty(tidy(q));
      lookup(q, out, man, err, false);
    }
  }

  /* ---------------- vehicles page ---------------- */
  var form2 = document.getElementById("regform2");
  if (form2) {
    var input2 = document.getElementById("reg2");
    fmtInput(input2);
    form2.addEventListener("submit", function (e) {
      e.preventDefault();
      var k = tidy(input2.value);
      if (!k) return;
      window.location.href = "/?reg=" + encodeURIComponent(k);
    });
  }
})();
