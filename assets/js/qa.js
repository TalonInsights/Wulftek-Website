/* ============================================================
   WULFTEK — Q&A DISCLOSURE
   Built from the vault's accordion cluster: the accessibility and
   keyboard model is 23530's (roving arrow keys, Home/End), the
   height mechanism is 11311's translated route (a) — no measuring,
   no ResizeObserver, no library. The panel is always rendered and
   collapsed in CSS, so nothing here touches height at all.

   Everything this script does is toggle one attribute; the CSS
   does the rest, which keeps it CSP-safe (no inline styles).
   ============================================================ */
(function () {
  "use strict";
  var root = document.getElementById("qa");
  if (!root) return;

  var items = Array.prototype.slice.call(root.querySelectorAll(".qai"));
  var triggers = items.map(function (i) { return i.querySelector(".qab"); });

  function setOpen(item, open) {
    var btn = item.querySelector(".qab");
    if (open) item.setAttribute("data-open", "");
    else item.removeAttribute("data-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  items.forEach(function (item) {
    var btn = item.querySelector(".qab");

    btn.addEventListener("click", function () {
      /* independent panels: opening one does not close the others,
         because these are reference answers people compare */
      setOpen(item, !item.hasAttribute("data-open"));
    });

    btn.addEventListener("keydown", function (e) {
      var i = triggers.indexOf(document.activeElement);
      if (i < 0) return;
      var next = null;
      if (e.key === "ArrowDown") next = (i + 1) % triggers.length;
      else if (e.key === "ArrowUp") next = (i - 1 + triggers.length) % triggers.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = triggers.length - 1;
      if (next === null) return;
      e.preventDefault();
      triggers[next].focus();
    });
  });

  /* A link to #qa3 (or a find-in-page landing) should not leave the
     answer shut. Opening on focus-within covers keyboard arrival too. */
  function openFromHash() {
    var id = (location.hash || "").slice(1);
    if (!id) return;
    var panel = document.getElementById(id);
    if (!panel) return;
    var item = panel.closest(".qai");
    if (item) setOpen(item, true);
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
