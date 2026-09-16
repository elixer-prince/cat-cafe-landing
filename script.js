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
     Booking form. The request really travels, and the guest hears the truth.
     ------------------------------------------------------------------ */
  var form = document.getElementById("booking-form");
  var status = document.getElementById("form-status");
  var dateField = form ? form.elements.date : null;

  /* the endpoint lives in the form's action, and the access key and subject in its
     own hidden fields, so the markup and this script post the same request */
  var BOOKING_TIMEOUT_MS = 15000;
  var PHONE_NUMBER = "020 7123 4567";
  var PHONE_HREF = "tel:+442071234567";
  var EMAIL = "hello@catpuccino.cafe";

  var pad = function (value) {
    return value < 10 ? "0" + value : String(value);
  };

  /* today as the guest's own device counts days, never as UTC */
  var localToday = function () {
    var now = new Date();
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  };

  var syncDateFloor = function () {
    if (dateField) {
      dateField.min = localToday();
    }
  };

  /* "2026-09-20" reads back as "Sunday 20 September", built from local date parts
     so a guest west of us is never shown yesterday */
  var readableDate = function (iso) {
    var parts = String(iso).split("-");

    if (parts.length !== 3) {
      return String(iso);
    }

    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));

    if (isNaN(date.getTime())) {
      return String(iso);
    }

    try {
      return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    } catch (error) {
      return String(iso);
    }
  };

  /* the café's number is written into the wording, so link it for a phone */
  var fillPhone = function (text) {
    var fragment = document.createDocumentFragment();
    var parts = text.split(PHONE_NUMBER);
    var link;

    fragment.appendChild(document.createTextNode(parts[0]));

    if (parts.length > 1) {
      link = document.createElement("a");
      link.href = PHONE_HREF;
      link.textContent = PHONE_NUMBER;
      fragment.appendChild(link);
      fragment.appendChild(document.createTextNode(parts.slice(1).join(PHONE_NUMBER)));
    }

    return fragment;
  };

  /* the wording of each failure, claiming only what the page can know */
  var failureCopy = {
    busy:
      "We are taking a lot of requests this minute, so yours did not get through. " +
      "Give it a moment and press Request booking again, or call us on " +
      PHONE_NUMBER +
      ".",
    rejected:
      "That request did not reach us. Check the details, press Request booking once more, " +
      "or call us on " +
      PHONE_NUMBER +
      ".",
    unconfirmed:
      "We could not confirm whether that reached us. Press Request booking once more, or call us on " +
      PHONE_NUMBER +
      " so we can check the book."
  };

  var sentCopy = function (details) {
    return (
      "Purrfect, " +
      details.firstName +
      ". Your booking request is in: " +
      details.guests +
      ", " +
      details.readableDate +
      " at " +
      details.time +
      ", with " +
      details.cat +
      ". We confirm by email within the hour. Need us sooner? Call " +
      PHONE_NUMBER +
      "."
    );
  };

  syncDateFloor();

  /* every value the request carries comes from the form itself */
  var readPayload = function () {
    var payload = {};
    var fields = form.elements;
    var field;
    var index;

    for (index = 0; index < fields.length; index++) {
      field = fields[index];

      if (!field.name || field.disabled) {
        continue;
      }

      if (field.type === "checkbox" || field.type === "radio") {
        /* an unchecked trap is left out, exactly as a native form post would */
        if (field.checked) {
          payload[field.name] = field.value || "on";
        }
        continue;
      }

      if (field.type !== "submit" && field.type !== "button" && field.type !== "file") {
        payload[field.name] = field.value;
      }
    }

    return payload;
  };

  /* the reply mapped onto the three honest states */
  var outcomeOf = function (code, body) {
    if (code === 200 && body && body.success === true) {
      return "sent";
    }

    if (code === 429) {
      return "busy";
    }

    if (code >= 400 && code < 500) {
      return "rejected";
    }

    if (code === 200) {
      /* a 200 that reports no success has delivered nothing */
      return body ? "rejected" : "unconfirmed";
    }

    return "unconfirmed";
  };

  /* one request, fifteen seconds to answer, and a state either way */
  var sendBooking = function (payload) {
    var controller = typeof window.AbortController === "function" ? new window.AbortController() : null;
    var timer = window.setTimeout(function () {
      if (controller) {
        controller.abort();
      }
    }, BOOKING_TIMEOUT_MS);

    var finish = function (outcome) {
      window.clearTimeout(timer);
      return outcome;
    };

    return window
      .fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      })
      .then(function (response) {
        var code = response.status;

        return response.json().then(
          function (body) {
            return { code: code, body: body };
          },
          function () {
            /* a reply the page cannot read proves nothing either way */
            return { code: code, body: null };
          }
        );
      })
      .then(
        function (result) {
          return finish(outcomeOf(result.code, result.body));
        },
        function () {
          /* the network failed, or the fifteen seconds ran out */
          return finish("unconfirmed");
        }
      );
  };

  if (form && status) {
    var canSend = typeof window.fetch === "function";
    var submit = form.querySelector('button[type="submit"]');
    var submitLabel = submit ? submit.textContent : "Request booking";
    var sending = false;

    /* the control says it is working. It never disables, so it stays focusable. */
    var setSending = function (busy) {
      if (!submit) {
        return;
      }

      submit.textContent = busy ? "Sending…" : submitLabel;

      if (busy) {
        submit.setAttribute("aria-busy", "true");
      } else {
        submit.removeAttribute("aria-busy");
      }
    };

    /* one state rendered, then focus handed to the message so it is announced */
    var showStatus = function (state, content, offerEmail) {
      var message = document.createElement("p");
      var ways;
      var link;

      status.textContent = "";
      status.className = "form-status is-" + state;

      message.className = "form-status-text";

      if (typeof content === "string") {
        message.textContent = content;
      } else {
        message.appendChild(content);
      }

      status.appendChild(message);

      if (offerEmail) {
        ways = document.createElement("p");
        ways.className = "form-status-contact";
        ways.appendChild(document.createTextNode("Prefer to write? Email "));

        link = document.createElement("a");
        link.href = "mailto:" + EMAIL;
        link.textContent = EMAIL;
        ways.appendChild(link);
        ways.appendChild(document.createTextNode("."));

        status.appendChild(ways);
      }
    };

    var report = function (outcome, details) {
      sending = false;
      setSending(false);

      if (outcome === "sent") {
        showStatus("sent", fillPhone(sentCopy(details)), false);
        form.reset();
        syncDateFloor();
      } else {
        showStatus(outcome === "busy" ? "busy" : "error", fillPhone(failureCopy[outcome]), true);
      }

      status.focus();
    };

    form.addEventListener("submit", function (event) {
      /* no fetch here, so let the browser post the form to the same endpoint */
      if (!canSend) {
        return;
      }

      event.preventDefault();

      if (typeof form.checkValidity === "function" && !form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* a filled trap is a bot. The page sends nothing and claims nothing. */
      var trap = form.elements.botcheck;
      if (trap && trap.checked) {
        return;
      }

      /* one request at a time: a second press sends nothing and touches nothing */
      if (sending) {
        return;
      }

      var details = {
        firstName: (form.elements.name.value || "").trim().split(" ")[0] || "friend",
        guests: form.elements.guests.value,
        time: form.elements.time.value,
        cat: form.elements.cat.value,
        readableDate: readableDate(form.elements.date.value)
      };

      sending = true;
      setSending(true);
      showStatus("sending", "Sending…", false);

      sendBooking(readPayload()).then(function (outcome) {
        report(outcome, details);
      });
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
