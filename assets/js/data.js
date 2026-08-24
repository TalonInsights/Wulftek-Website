/* ============================================================
   WULFTEK — VEHICLE DATA
   VEH     demo registrations for the home-page lookup.
   MARQUE  the makes listed on /vehicles, one page each under
           /remap/<key>. Add a make here, re-run `node tools/build.mjs`
           and its page is generated with the rest.
   ============================================================ */
/* bound to a local as well as the global so tools/build.mjs can read this
   file outside a browser, where `window` is only a plain object */
var WT = (window.WT = window.WT || {});

WT.VEH = {
  "WT19ABC": { make: "Volkswagen", model: "Golf GTD 2.0 TDI", year: "2019", fuel: "Diesel", bhp: 181, tq: 280, kind: "car",
    g: { perf: ["+38 bhp", "+64 lb-ft"], eco: ["+6 mpg", "approx."] } },
  "AB68TDI": { make: "Audi", model: "A4 2.0 TDI 190 S line", year: "2018", fuel: "Diesel", bhp: 187, tq: 295, kind: "car",
    g: { perf: ["+42 bhp", "+77 lb-ft"], eco: ["+7 mpg", "approx."] } },
  "BM17XYZ": { make: "BMW", model: "320d xDrive", year: "2017", fuel: "Diesel", bhp: 188, tq: 295, kind: "car",
    g: { perf: ["+40 bhp", "+70 lb-ft"], eco: ["+6 mpg", "approx."] } },
  "VW20GTI": { make: "Volkswagen", model: "Golf GTI 2.0 TSI", year: "2020", fuel: "Petrol", bhp: 242, tq: 273, kind: "car",
    g: { perf: ["+56 bhp", "+59 lb-ft"], eco: null } },
  "MK21VAN": { make: "Ford", model: "Transit Custom 2.0 EcoBlue 130", year: "2021", fuel: "Diesel", bhp: 129, tq: 284, kind: "van",
    g: { perf: ["+28 bhp", "+52 lb-ft"], eco: ["+8 mpg", "approx."] } },
  "SK18OCT": { make: "Skoda", model: "Octavia 1.6 TDI 115", year: "2018", fuel: "Diesel", bhp: 114, tq: 184, kind: "car",
    g: { perf: ["+26 bhp", "+55 lb-ft"], eco: ["+7 mpg", "approx."] } },
  "VX19VIV": { make: "Vauxhall", model: "Vivaro 1.5 Turbo D 120", year: "2019", fuel: "Diesel", bhp: 118, tq: 221, kind: "van",
    g: { perf: ["+24 bhp", "+48 lb-ft"], eco: ["+8 mpg", "approx."] } },
  "JD70TRC": { make: "John Deere", model: "6155R", year: "2020", fuel: "Diesel", bhp: 155, tq: 479, kind: "agri",
    g: { agri: ["+22 hp", "+88 lb-ft"] } },
  "NH19HOL": { make: "New Holland", model: "T7.210", year: "2019", fuel: "Diesel", bhp: 210, tq: 627, kind: "agri",
    g: { agri: ["+28 hp", "+110 lb-ft"] } },
  "T6LON": { make: "BMW", model: "i8 Coupe", year: "2018", fuel: "Petrol hybrid", bhp: 228, tq: 236, kind: "car",
    g: { perf: ["+24 bhp", "+31 lb-ft"], eco: null } }
};

WT.DEMOS = ["WT19 ABC", "AB68 TDI", "BM17 XYZ", "VW20 GTI", "MK21 VAN", "JD70 TRC", "T6 LON"];

WT.MARQUE = {
  audi: { name: "Audi", kind: "road", blurb: "Most of the VAG diesel and TSI range responds strongly, and the platform is one we see week in, week out.",
    models: [["A1 1.6 TDI 115", "115 bhp", "Diesel", "141 bhp", "+26"], ["A3 2.0 TDI 150", "150 bhp", "Diesel", "190 bhp", "+40"], ["A4 2.0 TDI 190", "190 bhp", "Diesel", "232 bhp", "+42"], ["A5 2.0 TFSI 252", "252 bhp", "Petrol", "310 bhp", "+58"], ["Q5 2.0 TDI 190", "190 bhp", "Diesel", "231 bhp", "+41"]] },
  bmw: { name: "BMW", kind: "road", blurb: "The N47, B47 and B57 diesels and the B48/B58 petrols all have genuine headroom when the file is written properly.",
    models: [["118d 2.0", "150 bhp", "Diesel", "188 bhp", "+38"], ["320d xDrive", "190 bhp", "Diesel", "230 bhp", "+40"], ["330i B48", "258 bhp", "Petrol", "320 bhp", "+62"], ["530d 3.0", "265 bhp", "Diesel", "325 bhp", "+60"], ["X5 30d", "286 bhp", "Diesel", "350 bhp", "+64"]] },
  volkswagen: { name: "Volkswagen", kind: "road", blurb: "Golf, Passat, Transporter and Caddy make up a large share of what comes through the workshop.",
    models: [["Golf 1.6 TDI 115", "115 bhp", "Diesel", "140 bhp", "+25"], ["Golf GTD 2.0", "184 bhp", "Diesel", "222 bhp", "+38"], ["Golf GTI 2.0 TSI", "245 bhp", "Petrol", "300 bhp", "+55"], ["Passat 2.0 TDI 150", "150 bhp", "Diesel", "190 bhp", "+40"], ["Transporter 2.0 TDI 150", "150 bhp", "Diesel", "188 bhp", "+38"]] },
  "mercedes-benz": { name: "Mercedes-Benz", kind: "road", blurb: "The OM651 and OM654 diesels and the Sprinter range are regular work.",
    models: [["A200d", "150 bhp", "Diesel", "185 bhp", "+35"], ["C220d", "194 bhp", "Diesel", "235 bhp", "+41"], ["E350d", "286 bhp", "Diesel", "345 bhp", "+59"], ["Sprinter 314 CDI", "143 bhp", "Diesel", "178 bhp", "+35"], ["Vito 119 CDI", "190 bhp", "Diesel", "228 bhp", "+38"]] },
  ford: { name: "Ford", kind: "road", blurb: "Transit and Ranger are the bulk of it, with EcoBoost petrols close behind.",
    models: [["Fiesta ST 1.5", "200 bhp", "Petrol", "240 bhp", "+40"], ["Focus 1.5 TDCi 120", "120 bhp", "Diesel", "148 bhp", "+28"], ["Transit Custom 2.0 130", "130 bhp", "Diesel", "158 bhp", "+28"], ["Ranger 2.0 Bi-Turbo", "213 bhp", "Diesel", "250 bhp", "+37"], ["Transit 2.0 EcoBlue 170", "170 bhp", "Diesel", "200 bhp", "+30"]] },
  skoda: { name: "Škoda", kind: "road", blurb: "Shares its engines with the wider VAG range, so gains track closely with the equivalent Volkswagen.",
    models: [["Fabia 1.0 TSI 95", "95 bhp", "Petrol", "120 bhp", "+25"], ["Octavia 1.6 TDI 115", "115 bhp", "Diesel", "141 bhp", "+26"], ["Octavia vRS 2.0 TDI", "184 bhp", "Diesel", "222 bhp", "+38"], ["Superb 2.0 TDI 190", "190 bhp", "Diesel", "231 bhp", "+41"], ["Kodiaq 2.0 TDI 150", "150 bhp", "Diesel", "190 bhp", "+40"]] },
  seat: { name: "SEAT / Cupra", kind: "road", blurb: "Same engine families as Volkswagen and Škoda, often in a lower state of factory tune.",
    models: [["Ibiza 1.0 TSI 95", "95 bhp", "Petrol", "120 bhp", "+25"], ["Leon 2.0 TDI 150", "150 bhp", "Diesel", "190 bhp", "+40"], ["Leon Cupra 2.0 TSI", "290 bhp", "Petrol", "345 bhp", "+55"], ["Ateca 1.5 TSI 150", "150 bhp", "Petrol", "180 bhp", "+30"]] },
  vauxhall: { name: "Vauxhall", kind: "road", blurb: "Vivaro and Movano vans in particular, where economy work usually pays for itself quickest.",
    models: [["Corsa 1.5 Turbo D 100", "100 bhp", "Diesel", "125 bhp", "+25"], ["Astra 1.6 CDTi 136", "136 bhp", "Diesel", "165 bhp", "+29"], ["Vivaro 1.5 Turbo D 120", "120 bhp", "Diesel", "144 bhp", "+24"], ["Movano 2.3 CDTi 145", "145 bhp", "Diesel", "180 bhp", "+35"]] },
  "john-deere": { name: "John Deere", kind: "agri", blurb: "The 6R and 7R series respond particularly well where the transmission is rated for it.",
    models: [["6120M", "120 hp", "Diesel", "142 hp", "+22"], ["6155R", "155 hp", "Diesel", "181 hp", "+26"], ["6215R", "215 hp", "Diesel", "247 hp", "+32"], ["7250R", "250 hp", "Diesel", "288 hp", "+38"]] },
  "new-holland": { name: "New Holland", kind: "agri", blurb: "T6 and T7 series are common work across Shropshire farms.",
    models: [["T6.145", "145 hp", "Diesel", "170 hp", "+25"], ["T7.210", "210 hp", "Diesel", "242 hp", "+32"], ["T7.270", "270 hp", "Diesel", "310 hp", "+40"]] },
  "massey-ferguson": { name: "Massey Ferguson", kind: "agri", blurb: "The 6700 and 7700 ranges, with the usual caveat about driveline limits.",
    models: [["5713 S", "130 hp", "Diesel", "153 hp", "+23"], ["6713 S", "130 hp", "Diesel", "153 hp", "+23"], ["7719 S", "190 hp", "Diesel", "220 hp", "+30"]] },
  "case-ih": { name: "Case IH", kind: "agri", blurb: "Maxxum and Puma series.",
    models: [["Maxxum 145", "145 hp", "Diesel", "170 hp", "+25"], ["Puma 185", "185 hp", "Diesel", "215 hp", "+30"], ["Puma 240", "240 hp", "Diesel", "277 hp", "+37"]] },
  fendt: { name: "Fendt", kind: "agri", blurb: "Vario transmissions can show additional economy gains alongside the torque increase.",
    models: [["516 Vario", "165 hp", "Diesel", "192 hp", "+27"], ["724 Vario", "240 hp", "Diesel", "277 hp", "+37"], ["828 Vario", "280 hp", "Diesel", "322 hp", "+42"]] },
  jcb: { name: "JCB", kind: "agri", blurb: "Loadall telehandlers and site plant, where duty cycle matters more than peak figures.",
    models: [["531-70 Loadall", "109 hp", "Diesel", "129 hp", "+20"], ["541-70 Loadall", "145 hp", "Diesel", "170 hp", "+25"], ["Fastrac 4220", "235 hp", "Diesel", "270 hp", "+35"]] },
  claas: { name: "Claas", kind: "agri", blurb: "Arion and Axion tractors plus harvesting machinery.",
    models: [["Arion 550", "165 hp", "Diesel", "192 hp", "+27"], ["Axion 850", "264 hp", "Diesel", "304 hp", "+40"]] }
};
