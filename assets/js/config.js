/* ============================================================
   WULFTEK — SITE CONFIG
   Everything a non-developer needs to change lives in this file.
   ============================================================ */
var WT = (window.WT = window.WT || {});

/* ---- contact details -------------------------------------
   Fill these in and every "call the workshop" / "email us" link
   across the site becomes a real tel: / mailto: link.
   Leave empty and the links stay inert.                       */
WT.CONTACT = {
  phone: "",
  email: ""
};

/* ---- photography -----------------------------------------
   The hero photo on the home page is WulfTek's own and lives
   directly in the markup. The slots below are still stock
   placeholders from Wikimedia Commons: replace each `url` with
   a real photo (put the file in /assets/img/) before launch.
   `brief` is the art direction for the photo that belongs there.
   If a URL fails to load the slot falls back to a toned panel.
   ------------------------------------------------------------ */
WT.IMG = (function () {
var WM = "https://commons.wikimedia.org/wiki/Special:FilePath/";
function wm(file, w) { return WM + encodeURIComponent(file) + "?width=" + (w || 1600); }

return {
  road: {
    url: wm("VW Golf VII GTi CS Front.JPG", 1400), zone: "z-road",
    brief: "A customer's car on the move — three-quarter rear, motion, not a static car park shot."
  },
  van: {
    url: wm("2019 Ford Transit 350 Leader Ecoblue 2.0.jpg", 1400), zone: "z-van",
    brief: "A working van or estate. Ordinary, clean, plainly not a supercar."
  },
  field: {
    url: wm("John Deere 6220.jpg", 1400), zone: "z-field",
    brief: "Tractor working a field, low sun, implement on the back."
  },
  engine: {
    url: wm("Volvo 244 D24TD Engine Bay.jpg", 1400), zone: "z-engine",
    brief: "Close on an engine bay, or the laptop plugged into the OBD port mid-job."
  },
  shop: {
    url: wm("Car repair shop.jpg", 1400), zone: "z-shop",
    brief: "The workshop itself — real, tidy, in use. People beat empty rooms."
  },
  heritage: {
    url: wm("Car repair, workshop, mechanic, szervíz, military Fortepan 72519.jpg", 1400), zone: "z-heritage",
    brief: "An old photo of the grandfather in his workshop. Grain and imperfection are the point."
  }
};
})();
