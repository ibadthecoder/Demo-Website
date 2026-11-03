/* ==========================================================
   NOIR Modern Dining  |  script.js
   Vanilla JS, no dependencies.
   ========================================================== */
(function () {
  "use strict";

  /* ---------- CONFIG (edit these) ---------- */
  var CONFIG = {
    whatsappNumber: "923233986573", // Demo number, international format, no "+"
    phoneDisplay: "+92 323 3986573",
    waGreeting: "Hello NOIR, I'd like to make an enquiry.",
    openHour: 19,                    // earliest reservation slot handled by the <select>
    maxAdvanceDays: 90
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var waLink = function (msg) { return "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(msg); };

  /* ---------- Contact links ---------- */
  var tel = "tel:+" + CONFIG.whatsappNumber;
  ["waBtn", "footWa"].forEach(function (id) { var el = $("#" + id); if (el) el.href = waLink(CONFIG.waGreeting); });
  ["callBtn", "footCall"].forEach(function (id) { var el = $("#" + id); if (el) el.href = tel; });
  var callBtn = $("#callBtn"); if (callBtn) callBtn.textContent = "Call " + CONFIG.phoneDisplay;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header: solid on scroll ---------- */
  var header = $("#header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 40); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  var toggle = $("#menuToggle"), nav = $("#nav");
  function setNav(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); toggle.focus(); } });
  window.addEventListener("resize", function () { if (window.innerWidth >= 960) setNav(false); });

  /* ---------- Menu category filters ---------- */
  var filters = $$(".filter"), dishes = $$(".dish");
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filters.forEach(function (b) { var on = b === btn; b.classList.toggle("active", on); b.setAttribute("aria-pressed", String(on)); });
      dishes.forEach(function (d) {
        var show = f === "all" || d.getAttribute("data-cat") === f;
        d.classList.toggle("hide", !show);
        if (show) d.classList.add("in"); // ensure visible even if not yet revealed
      });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("in"); }); }

  /* ---------- Image fallback (avoid broken-image icons) ---------- */
  $$("img").forEach(function (img) {
    img.addEventListener("error", function () { img.style.visibility = "hidden"; });
  });

  /* ---------- Gallery lightbox ---------- */
  var items = $$(".g-item"), lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  var cur = 0, lastFocus = null;
  function show(i) {
    cur = (i + items.length) % items.length;
    var img = $("img", items[cur]);
    lbImg.src = img.src.replace(/w=\d+/, "w=1400");
    lbImg.alt = img.alt;
    lbCap.textContent = $("span", items[cur]).textContent;
  }
  function openLb(i) { lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = "hidden"; show(i); $(".lb-close").focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; lbImg.src = ""; if (lastFocus) lastFocus.focus(); }
  items.forEach(function (it, i) { it.addEventListener("click", function () { openLb(i); }); });
  $(".lb-close").addEventListener("click", closeLb);
  $(".lb-prev").addEventListener("click", function () { show(cur - 1); });
  $(".lb-next").addEventListener("click", function () { show(cur + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
    else if (e.key === "Tab") { // simple focus trap
      var f = $$("button", lb), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Reservation form (client-side validation, demo only) ---------- */
  var form = $("#reserveForm"), success = $("#formSuccess"), dateInput = $("#date");

  // Date limits: today → +90 days (local time)
  function iso(d) { var m = ("0" + (d.getMonth() + 1)).slice(-2), day = ("0" + d.getDate()).slice(-2); return d.getFullYear() + "-" + m + "-" + day; }
  var today = new Date(), max = new Date(); max.setDate(max.getDate() + CONFIG.maxAdvanceDays);
  dateInput.min = iso(today); dateInput.max = iso(max);

  var rules = {
    name: function (v) {
      v = v.trim();
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Name must be at least 2 characters.";
      if (!/^[A-Za-z\u0600-\u06FF][A-Za-z\u0600-\u06FF\s.'-]*$/.test(v)) return "Name can only contain letters and spaces.";
      return "";
    },
    phone: function (v) {
      var d = v.replace(/[\s-]/g, "");
      if (!d) return "Please enter your phone number.";
      // Pakistani mobile: 03XXXXXXXXX, +923XXXXXXXXX or 00923XXXXXXXXX
      if (!/^(?:\+92|0092|0)3\d{9}$/.test(d)) return "Enter a valid Pakistani mobile, e.g. 0300 1234567.";
      return "";
    },
    date: function (v) {
      if (!v) return "Please choose a date.";
      if (v < iso(today)) return "Please choose today or a future date.";
      if (v > iso(max)) return "We take bookings up to " + CONFIG.maxAdvanceDays + " days ahead.";
      return "";
    },
    time: function (v) { return v ? "" : "Please select a time."; },
    guests: function (v) { return v ? "" : "Please select number of guests."; }
  };

  function validateField(name) {
    var el = form.elements[name], msg = rules[name](el.value);
    var field = el.closest(".field");
    $("#" + name + "-err").textContent = msg;
    field.classList.toggle("invalid", !!msg);
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  Object.keys(rules).forEach(function (n) {
    var el = form.elements[n];
    el.addEventListener("blur", function () { validateField(n); });
    el.addEventListener("input", function () { if (el.closest(".field").classList.contains("invalid")) validateField(n); });
    el.addEventListener("change", function () { validateField(n); });
  });

  // Block "past time today" once both date and time are chosen
  function timeToday() {
    if (form.elements.date.value !== iso(today) || !form.elements.time.value) return true;
    var m = form.elements.time.value.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return true;
    var h = +m[1] % 12 + (m[3].toUpperCase() === "PM" ? 12 : 0), mins = +m[2];
    var now = new Date();
    return h * 60 + mins > now.getHours() * 60 + now.getMinutes();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.hidden = true;
    var firstBad = null;
    Object.keys(rules).forEach(function (n) { if (!validateField(n) && !firstBad) firstBad = form.elements[n]; });
    if (!firstBad && !timeToday()) {
      $("#time-err").textContent = "That time has already passed today. Please pick a later slot.";
      form.elements.time.closest(".field").classList.add("invalid");
      firstBad = form.elements.time;
    }
    if (firstBad) { firstBad.focus(); return; }

    var f = form.elements;
    var prettyDate = new Date(f.date.value + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var msg = "Hello NOIR, I'd like to reserve a table.\nName: " + f.name.value.trim() + "\nPhone: " + f.phone.value.trim() +
      "\nDate: " + prettyDate + "\nTime: " + f.time.value + "\nGuests: " + f.guests.value;

    success.innerHTML = "<strong>Thank you, " + escapeHtml(f.name.value.trim().split(" ")[0]) + ".</strong> " +
      "This is a demo, so your request was <em>not</em> sent or saved. A live site would confirm " + escapeHtml(f.guests.value) + " guest(s) on " +
      escapeHtml(prettyDate) + " at " + escapeHtml(f.time.value) + ". " +
      "<br><br><a href=\"" + waLink(msg) + "\" target=\"_blank\" rel=\"noopener\">Preview this as a WhatsApp message →</a>";
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.reset();
    $$(".field", form).forEach(function (fl) { fl.classList.remove("invalid"); });
    $$(".err", form).forEach(function (er) { er.textContent = ""; });
  });

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
})();
