/* MugoByte Technologies — shared behaviour */
(function () {
  "use strict";

  /* Nav scroll state */
  var nav = document.getElementById("navbar");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.getElementById("navBurger");
  var menu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!menu || !burger) return;
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* Reveal on scroll */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
    revealEls.forEach(function (el) { obs.observe(el); });
  }

  /* Stat counters */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || "";
    var decimals = (String(el.dataset.count).split(".")[1] || "").length;
    function fmt(v) { return v.toFixed(decimals) + suffix; }
    if (reduced) { el.textContent = fmt(target); return; }
    var start = null;
    var dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window && !reduced) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          cObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var expanded = q.getAttribute("aria-expanded") === "true";
      var item = q.closest(".faq");
      item.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(function (other) {
        other.setAttribute("aria-expanded", "false");
        other.parentElement.querySelector(".faq-a").style.maxHeight = "0";
      });
      if (!expanded) {
        q.setAttribute("aria-expanded", "true");
        var a = q.parentElement.querySelector(".faq-a");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* Contact form — validates, then hands off to WhatsApp or email.
     MBT has no message backend, so we are explicit about the handoff. */
  var contactForm = document.getElementById("contactForm");
  if (contactForm) {
    var PHONE = "254112863252";
    var EMAIL = "admin@mugobyte.com";
    var sendRow = document.getElementById("sendRow");
    var waBtn = document.getElementById("sendWhatsApp");
    var mailBtn = document.getElementById("sendEmail");
    var status = document.getElementById("contactStatus");

    function payload() {
      var v = function (id) { return (contactForm.querySelector("#" + id) || {}).value || ""; };
      return {
        name: v("cfName").trim(),
        phone: v("cfPhone").trim(),
        email: v("cfEmail").trim(),
        service: v("cfService").trim(),
        message: v("cfMessage").trim()
      };
    }
    function composedText(d) {
      return "Hello MBT!\n\nName: " + d.name +
        "\nPhone: " + (d.phone || "Not provided") +
        "\nEmail: " + d.email +
        "\nService: " + (d.service || "General enquiry") +
        "\n\n" + d.message;
    }
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = payload();
      var valid = true;
      contactForm.querySelectorAll("[required]").forEach(function (input) {
        var bad = !input.value.trim() || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        input.classList.toggle("invalid", bad);
        if (bad) valid = false;
      });
      if (!valid) {
        status.className = "form-status err";
        status.textContent = "Please fill in the highlighted fields with valid details.";
        return;
      }
      status.className = "form-status ok";
      status.textContent = "Your message is ready, " + d.name.split(" ")[0] + ". Choose how you would like to send it to MBT:";
      var text = composedText(d);
      waBtn.href = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
      mailBtn.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent("MBT enquiry — " + (d.service || "General") + " — " + d.name) +
        "&body=" + encodeURIComponent(text);
      sendRow.classList.add("show");
      waBtn.focus();
    });
    contactForm.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("invalid");
    });
  }

  /* Newsletter */
  var newsForm = document.getElementById("newsletterForm");
  if (newsForm) {
    var newsStatus = document.getElementById("newsletterStatus");
    newsForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var input = newsForm.querySelector("input[type='email']");
      var btn = newsForm.querySelector("button");
      var email = input.value.trim();
      newsStatus.className = "newsletter-status";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newsStatus.className = "newsletter-status err";
        newsStatus.textContent = "Please enter a valid email address.";
        return;
      }
      btn.disabled = true;
      var original = btn.textContent;
      btn.textContent = "Subscribing…";
      try {
        var res = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email })
        });
        var data = await res.json().catch(function () { return {}; });
        if (!res.ok) throw new Error(data.error || "Subscription failed");
        newsStatus.className = "newsletter-status ok";
        newsStatus.textContent = "Subscribed. Check your inbox for a welcome email.";
        newsForm.reset();
      } catch (err) {
        newsStatus.className = "newsletter-status err";
        newsStatus.textContent = "Could not subscribe right now. Try again or email admin@mugobyte.com.";
      } finally {
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
