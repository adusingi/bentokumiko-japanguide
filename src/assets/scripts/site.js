(function () {
  "use strict";
  var header = document.getElementById("siteHeader");
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 8);
  }
  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    toggle.textContent = "☰";
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    toggle.textContent = open ? "✕" : "☰";
  });
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });
    document.querySelectorAll(".reveal").forEach(function (element) { observer.observe(element); });
    window.setTimeout(function () {
      document.querySelectorAll(".reveal").forEach(function (element) { element.classList.add("in"); });
    }, 2500);
  } else {
    document.querySelectorAll(".reveal").forEach(function (element) { element.classList.add("in"); });
  }
}());
