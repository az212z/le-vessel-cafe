/* ===== LE VESSEL CAFE — interactions ===== */
(function () {
  "use strict";

  /* Preloader: guaranteed removal */
  var preloader = document.getElementById("preloader");
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("hidden");
    setTimeout(function () { preloader.style.display = "none"; }, 550);
  }
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 1200); // fallback

  /* ---- Full-screen mobile menu ---- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");
  var menuClose = document.getElementById("menu-close");

  function openMenu() {
    if (!menu) return;
    menu.hidden = false;
    requestAnimationFrame(function () { menu.classList.add("open"); });
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(function () { menu.hidden = true; }, 300);
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll(".menu-links a, .menu-wa").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }

  /* ---- Scroll reveal with safety fallback ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // safety: ensure everything visible after 2.5s
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
    }, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---- Lightbox ---- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxClose = document.getElementById("lightbox-close");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (alt) lightboxImg.alt = alt;
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add("open"); });
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { lightbox.hidden = true; if (lightboxImg) lightboxImg.src = ""; }, 250);
  }
  document.querySelectorAll(".gallery-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var full = btn.getAttribute("data-full");
      var img = btn.querySelector("img");
      openLightbox(full, img ? img.alt : "");
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  /* ---- Esc closes overlays ---- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menu && !menu.hidden) closeMenu();
      if (lightbox && !lightbox.hidden) closeLightbox();
    }
  });

  /* ---- Toast ---- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4000);
  }

  /* ---- Order form -> WhatsApp + localStorage + toast ---- */
  var form = document.getElementById("order-form");
  var WA_NUMBER = "966567603326";

  function setError(field, msg) {
    var input = document.getElementById(field);
    var errEl = document.querySelector('.field-error[data-for="' + field + '"]');
    if (input) input.classList.toggle("invalid", !!msg);
    if (errEl) errEl.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var phone = form.phone.value.trim();
      var drink = form.drink.value;
      var notes = form.notes.value.trim();
      var ok = true;

      setError("name", ""); setError("phone", ""); setError("drink", "");

      if (!name) { setError("name", "فضلاً اكتب الاسم"); ok = false; }
      if (!/^0?5\d{8}$/.test(phone.replace(/\s/g, ""))) { setError("phone", "أدخل رقم جوال سعودي صحيح"); ok = false; }
      if (!drink) { setError("drink", "اختر طلبك"); ok = false; }
      if (!ok) {
        var firstInvalid = form.querySelector(".invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // localStorage demo
      try {
        var orders = JSON.parse(localStorage.getItem("lv_orders") || "[]");
        orders.push({ name: name, phone: phone, drink: drink, notes: notes, at: new Date().toISOString() });
        localStorage.setItem("lv_orders", JSON.stringify(orders));
      } catch (err) { /* ignore storage errors */ }

      var msg =
        "مرحبًا لي فيسل، أرغب بطلب:%0A" +
        "الاسم: " + encodeURIComponent(name) + "%0A" +
        "الجوال: " + encodeURIComponent(phone) + "%0A" +
        "الطلب: " + encodeURIComponent(drink) +
        (notes ? "%0Aملاحظات: " + encodeURIComponent(notes) : "");

      showToast("تم تجهيز طلبك، يفتح واتساب الآن…");
      form.reset();

      setTimeout(function () {
        window.open("https://wa.me/" + WA_NUMBER + "?text=" + msg, "_blank", "noopener");
      }, 600);
    });
  }
})();
