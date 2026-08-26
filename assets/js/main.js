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

  /* Reveal on scroll (defensive: if anything fails, content must stay visible) */
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  var lineEls = document.querySelectorAll(".line-mask");
  function showAll() {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
    lineEls.forEach(function (el) { el.classList.add("visible"); });
  }
  if (reduced || !("IntersectionObserver" in window)) {
    showAll();
  } else {
    try {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
      revealEls.forEach(function (el) { obs.observe(el); });

      /* Line-mask reveals for key headings */
      if (lineEls.length) {
        var lObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              lObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.4 });
        lineEls.forEach(function (el) { lObs.observe(el); });
      }
      /* Safety net: never leave content hidden */
      setTimeout(function () {
        document.querySelectorAll(".reveal:not(.visible), .line-mask:not(.visible)").forEach(function (el) {
          el.classList.add("visible");
        });
      }, 4000);
    } catch (e) {
      showAll();
    }
  }

  /* Scroll story: POS screenshot settles into place as it enters view.
     GSAP is loaded from CDN only when the element exists and motion is allowed. */
  var storyShot = document.querySelector("[data-story-shot]");
  if (storyShot && !reduced) {
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js";
    s.async = true;
    s.onload = function () {
      var t = document.createElement("script");
      t.src = "https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js";
      t.async = true;
      t.onload = function () {
        if (!window.gsap || !window.ScrollTrigger) return;
        gsap.registerPlugin(ScrollTrigger);
        gsap.fromTo(storyShot,
          { scale: 0.96, y: 40 },
          {
            scale: 1, y: 0, ease: "none",
            scrollTrigger: {
              trigger: storyShot.closest("[data-story]") || storyShot,
              start: "top 90%",
              end: "center 60%",
              scrub: 0.6
            }
          });
      };
      document.head.appendChild(t);
    };
    document.head.appendChild(s);
  }

  /* Subtle hero depth on pointer (desktop only) */
  var heroMain = document.querySelector("[data-hero-main]");
  var heroFloat = document.querySelector("[data-hero-float]");
  if (heroMain && !reduced && window.matchMedia("(pointer: fine)").matches) {
    var heroVisual = heroMain.closest(".hero-visual");
    if (heroVisual) {
      heroVisual.addEventListener("mousemove", function (e) {
        var r = heroVisual.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        heroMain.style.transform = "perspective(1200px) rotateY(" + (x * 3) + "deg) rotateX(" + (-y * 2) + "deg)";
        if (heroFloat) heroFloat.style.transform = "translate(" + (x * 8) + "px, " + (y * 6) + "px)";
      });
      heroVisual.addEventListener("mouseleave", function () {
        heroMain.style.transform = "";
        if (heroFloat) heroFloat.style.transform = "";
      });
    }
  }

  /* Stat counters — only when present */
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
  /* Keep open answers sized correctly when the viewport changes */
  window.addEventListener("resize", function () {
    document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach(function (q) {
      var a = q.parentElement.querySelector(".faq-a");
      if (a) a.style.maxHeight = a.scrollHeight + "px";
    });
  }, { passive: true });

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
