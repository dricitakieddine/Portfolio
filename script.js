/* ==========================================================================
   Takieddine Drici — Portfolio (Multi-page)
   Vanilla JS + GSAP / ScrollTrigger (CDN)
   Safely does nothing when an element is not on the current page.
   ========================================================================== */

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isFineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const isTouch = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window;

/* ---------- Page transition (red wipe) ---------- */
const transition = $(".page-transition");
function startTransition(href) {
  if (!transition || prefersReduced) {
    window.location.href = href;
    return;
  }
  transition.classList.add("is-active");
  setTimeout(() => {
    window.location.href = href;
  }, 450);
}

/* ---------- Scroll progress bar ---------- */
const progressBar = $("#progressBar");
const progressWrap = $(".progress-wrap");
if (progressBar) {
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.transform = `scaleX(${pct / 100})`;
  });
}

/* ---------- Custom cursor (hover + fine pointer only) ---------- */
const cursor = $("#cursor");
const follower = $("#cursorFollower");

if (isFineHover && !isTouch && !prefersReduced && cursor && follower) {
  document.body.style.cursor = "none";
  window.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
    follower.style.left = `${x}px`;
    follower.style.top = `${y}px`;
  });

  const hoverables = $$(
    "a, button, input, textarea, .chip, .project-card, .contact__btn, .btn, label"
  );
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => follower.classList.add("is-hovered"));
    el.addEventListener("mouseleave", () => follower.classList.remove("is-hovered"));
  });
} else {
  document.documentElement.classList.add("no-cursor");
  if (cursor) cursor.remove();
  if (follower) follower.remove();
}

/* ---------- Navbar (shared) ---------- */
const navbar = $("#navbar");
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
const navClose = $("#navClose");
const navLinks = $$(".nav-link");

function closeMenu() {
  if (!navMenu) return;
  navMenu.classList.remove("is-open");
  if (navToggle) navToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-locked");
  if (progressWrap) progressWrap.classList.remove("menu-hidden");
}

if (navbar) {
  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset > 60;
    if (scrolled) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

// Mobile toggle
if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open);
    document.body.classList.toggle("menu-locked", open);
    if (progressWrap) progressWrap.classList.toggle("menu-hidden", open);
  });
}

// Close button
if (navClose) {
  navClose.addEventListener("click", closeMenu);
}

// Close menu on nav link click
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

// Smooth transition for all internal page links
document.addEventListener("click", (e) => {
  const link = e.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href");
  if (!href) return;
  // External, mailto, tel, javascript: default
  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
    return;
  }
  // Download or new-tab links: default
  if (link.hasAttribute("download") || link.target === "_blank") {
    return;
  }
  // Same-page anchor: close menu only, default scroll
  if (href.startsWith("#")) {
    closeMenu();
    return;
  }
  // Internal page link: close menu + red wipe transition
  closeMenu();
  e.preventDefault();
  startTransition(href);
});

// Close on Escape
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu && navMenu.classList.contains("is-open")) {
    closeMenu();
  }
});

// Highlight active link by current page path
const currentPath = window.location.pathname.split("/").pop() || "index.html";
navLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && !href.startsWith("http") && !href.startsWith("#")) {
    const linkPath = href.split("/").pop();
    if (linkPath === currentPath) {
      link.classList.add("is-active");
    }
  } else if (href === "#" && currentPath === "index.html") {
    link.classList.add("is-active");
  }
});

/* ---------- Magnetic buttons (desktop only) ---------- */
if (isFineHover && !isTouch && !prefersReduced) {
  const magnetic = $$(".btn, .contact__btn");
  magnetic.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

/* ---------- Intro animation (first visit of session only) ---------- */
function initIntro() {
  const intro = $("#intro");
  if (!intro) return;

  let shown = false;
  try {
    shown = sessionStorage.getItem("portfolio_intro_shown") === "1";
  } catch (e) {
    // sessionStorage unavailable; treat as not shown
  }

  const introLogo = $("#introLogo");
  const introDrawRing = $("#introDrawRing");
  const introCircle = introDrawRing ? introDrawRing.querySelector("circle") : null;
  const introText = $(".intro__text");
  const typewriter = $("#typewriter");

  if (shown || prefersReduced) {
    if (intro) intro.style.display = "none";
    if (typewriter) {
      typewriter.style.borderRight = "none";
      typewriter.textContent = "AI Automation Engineer";
    }
    return;
  }

  try {
    sessionStorage.setItem("portfolio_intro_shown", "1");
  } catch (e) {
    // ignore
  }

  if (!introLogo || !introCircle) {
    if (intro) intro.style.display = "none";
    return;
  }

  if (window.gsap) {
    const tl = window.gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(introLogo, { scale: 1, opacity: 1, duration: 0.9, delay: 0.3 })
      .to(
        introCircle,
        { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" },
        "-=0.5"
      )
      .to(introText, { opacity: 1, duration: 0.6 }, "-=0.4")
      .to(intro, { opacity: 0, visibility: "hidden", duration: 0.8, delay: 0.6 })
      .set(intro, { display: "none" })
      .call(startTypewriter);
  } else {
    intro.style.display = "none";
    startTypewriter();
  }
}

function startTypewriter() {
  const typewriter = $("#typewriter");
  if (!typewriter) return;
  const words = ["AI Automation Engineer", "Workflow Builder", "AI Assistant Developer"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeTimeout;

  function type() {
    if (prefersReduced) {
      typewriter.textContent = words[words.length - 1];
      return;
    }
    const current = words[wordIndex];
    const display = isDeleting
      ? current.slice(0, charIndex - 1)
      : current.slice(0, charIndex + 1);
    typewriter.textContent = display;

    if (!isDeleting && charIndex === current.length) {
      isDeleting = true;
      typeTimeout = setTimeout(type, 1400);
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeTimeout = setTimeout(type, 500);
    } else {
      const speed = isDeleting ? 40 : 70;
      charIndex += isDeleting ? -1 : 1;
      typeTimeout = setTimeout(type, speed);
    }
  }

  typewriter.style.borderRight = prefersReduced ? "none" : "2px solid #E10600";
  type();
}

/* ---------- GSAP ScrollTrigger setup ---------- */
function initScrollReveal() {
  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  $$(".section").forEach((section) => {
    const children = section.querySelectorAll(
      ".skills__group, .timeline__item, .project-card, .cred-item, .build-card, .process__step, .contact__btn, .form__row"
    );

    window.ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      once: true,
      toggleClass: { targets: section, className: "is-visible" },
    });

    window.gsap.fromTo(
      children,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      }
    );
  });

  // Experience line draws itself
  const timelineLine = $(".timeline__line");
  if (timelineLine) {
    window.ScrollTrigger.create({
      trigger: "#experience",
      start: "top 70%",
      once: true,
      onEnter: () => {
        window.gsap.to(timelineLine, { scaleY: 1, duration: 1, ease: "power2.out" });
      },
    });
  }

  // Workflow diagram draw (project detail pages)
  const diagram = $(".workflow-diagram__svg");
  if (diagram) {
    const paths = diagram.querySelectorAll("path, line, circle, rect");
    paths.forEach((p) => {
      const len = p.getTotalLength ? p.getTotalLength() : 0;
      if (len > 0) {
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      }
    });
    window.ScrollTrigger.create({
      trigger: ".workflow-diagram",
      start: "top 82%",
      once: true,
      onEnter: () => {
        paths.forEach((p) => {
          const len = p.getTotalLength ? p.getTotalLength() : 0;
          if (len > 0) {
            window.gsap.to(p, {
              strokeDashoffset: 0,
              duration: 1,
              ease: "power2.out",
            });
          }
        });
      },
    });
  }

  // Hero parallax portrait (index only)
  const portrait = $(".hero__portrait");
  if (portrait && !prefersReduced) {
    window.ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        portrait.style.transform = `translateY(${progress * -20}px)`;
      },
    });
  }
}

/* ---------- Project card tilt (desktop only) ---------- */
function initTilt() {
  if (isTouch || !isFineHover) return;
  $$("[data-tilt]").forEach((card) => {
    const thumb = card.querySelector(".project__thumb");
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotX = ((y - centerY) / centerY) * -5;
      const rotY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      if (thumb) {
        thumb.style.transform = `scale(1.04) rotateX(${-rotX * 0.5}deg) rotateY(${rotY * 0.5}deg)`;
      }
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)";
      if (thumb) thumb.style.transform = "scale(1)";
    });
  });
}

/* ---------- Experiments toggle (projects page) ---------- */
const experimentsToggle = $("#experimentsToggle");
const experimentsList = $("#experimentsList");

if (experimentsToggle && experimentsList) {
  experimentsToggle.addEventListener("click", () => {
    const expanded = experimentsToggle.getAttribute("aria-expanded") === "true";
    experimentsToggle.setAttribute("aria-expanded", !expanded);
    if (expanded) {
      experimentsList.setAttribute("hidden", "");
      experimentsToggle.querySelector(".experiments__arrow").style.transform = "rotate(0deg)";
    } else {
      experimentsList.removeAttribute("hidden");
      experimentsToggle.querySelector(".experiments__arrow").style.transform = "rotate(180deg)";
    }
  });
}

/* ---------- Contact form (mailto) ---------- */
const contactForm = $("#contactForm");
const copyEmailBtn = $("#copyEmail");
const toast = $("#toast");

function showToast() {
  if (!toast) return;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", () => {
    const email = "dricitakieddine75@gmail.com";
    navigator.clipboard
      .writeText(email)
      .then(showToast)
      .catch(showToast);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = contactForm.elements["name"].value.trim();
    const email = contactForm.elements["email"].value.trim();
    const message = contactForm.elements["message"].value.trim();

    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href = `mailto:dricitakieddine75@gmail.com?subject=${subject}&body=${body}`;
  });
}

/* ---------- Init ---------- */
function init() {
  initIntro();
  initScrollReveal();
  initTilt();
}

document.addEventListener("DOMContentLoaded", init);
