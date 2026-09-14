/* ==========================================================================
   Catpuccino Café — interactions
   Vanilla JS, no dependencies. Everything degrades gracefully without it.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "catpuccino-theme";
  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function storedTheme() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  /* ------------------------------------------------------------------
     Theme (light / dark)
     ------------------------------------------------------------------ */
  var toggle = document.getElementById("theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#150e0a" : "#fbf5ee");
    }

    if (toggle) {
      var isDark = theme === "dark";
      var label = isDark ? "Switch to light theme" : "Switch to dark theme";
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", label);
      toggle.setAttribute("title", label);
    }

    if (persist) {
      try {
        window.localStorage.setItem(STORAGE_KEY, theme);
      } catch (error) {
        /* storage unavailable (private mode) — the toggle still works */
      }
    }
  }

  function activeTheme() {
    return root.getAttribute("data-theme") || (systemDark.matches ? "dark" : "light");
  }

  applyTheme(activeTheme(), false);

  if (toggle) {
    toggle.addEventListener("click", function () {
      applyTheme(activeTheme() === "dark" ? "light" : "dark", true);
    });
  }

  /* keep following the OS only while the visitor has not picked a side */
  function onSystemChange() {
    if (!storedTheme()) {
      applyTheme(systemDark.matches ? "dark" : "light", false);
    }
  }

  if (typeof systemDark.addEventListener === "function") {
    systemDark.addEventListener("change", onSystemChange);
  } else if (typeof systemDark.addListener === "function") {
    systemDark.addListener(onSystemChange);
  }

  /* ------------------------------------------------------------------
     Sticky header shadow
     ------------------------------------------------------------------ */
  var header = document.querySelector(".site-header");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (navToggle && nav) {
    var setNav = function (open) {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      nav.classList.toggle("is-open", open);
    };

    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setNav(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setNav(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        setNav(false);
      }
    });
  }

  /* ------------------------------------------------------------------
     Reveal on scroll
     ------------------------------------------------------------------ */
  var reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  if (reveals.length) {
    if ("IntersectionObserver" in window && !prefersReduced.matches) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
      );

      reveals.forEach(function (element, index) {
        element.style.transitionDelay = Math.min(index % 4, 3) * 70 + "ms";
        observer.observe(element);
      });
    } else {
      reveals.forEach(function (element) {
        element.classList.add("is-visible");
      });
    }
  }

  /* ------------------------------------------------------------------
     Booking form (front-end only — there is no server in this demo)
     ------------------------------------------------------------------ */
  var form = document.getElementById("booking-form");
  var status = document.getElementById("form-status");
  var dateField = form ? form.elements.date : null;

  if (dateField) {
    dateField.min = new Date().toISOString().slice(0, 10);
  }

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var firstName = (form.elements.name.value || "").trim().split(" ")[0] || "friend";
      var guests = form.elements.guests.value;
      var when = form.elements.date.value;
      var time = form.elements.time.value;
      var cat = form.elements.cat.value;

      status.hidden = false;
      status.textContent =
        "Purrfect, " +
        firstName +
        "! We have pencilled in a table for " +
        guests +
        " on " +
        when +
        " at " +
        time +
        ". " +
        cat +
        " has been notified and will be warming the nearest cushion.";

      form.reset();

      if (dateField) {
        dateField.min = new Date().toISOString().slice(0, 10);
      }

      status.focus();
    });
  }

  /* ------------------------------------------------------------------
     Footer year
     ------------------------------------------------------------------ */
  var year = document.getElementById("year");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     Newsletter (front-end only — no server in this demo)
     ------------------------------------------------------------------ */
  var newsForm = document.getElementById("newsletter-form");
  var newsStatus = document.getElementById("newsletter-status");

  if (newsForm && newsStatus) {
    newsForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (typeof newsForm.checkValidity === "function" && !newsForm.checkValidity()) {
        newsForm.reportValidity();
        return;
      }

      newsStatus.textContent = "You are on the list — the first Cat mail lands next month.";
      newsForm.reset();
    });
  }
})();
