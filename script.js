/* ==========================================================================
   Takieddine Drici — Portfolio (Simplified)
   Vanilla JS only. No heavy libraries.
   ========================================================================== */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Intro overlay (first session visit, under 1.2s) ---------- */
function initIntro() {
  const intro = $("#intro");
  if (!intro) return;

  let shown = false;
  try {
    shown = sessionStorage.getItem("portfolio_intro_shown") === "1";
  } catch (e) {
    shown = false;
  }

  const introLogo = $("#introLogo");
  const introDrawRing = $("#introDrawRing");
  const introCircle = introDrawRing ? introDrawRing.querySelector("circle") : null;
  const introText = $(".intro__text");

  if (shown || prefersReduced) {
    intro.classList.add("is-hidden");
    return;
  }

  try {
    sessionStorage.setItem("portfolio_intro_shown", "1");
  } catch (e) {
    // ignore
  }

  if (!introLogo || !introCircle) {
    intro.classList.add("is-hidden");
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.to(introLogo, { scale: 1, opacity: 1, duration: 0.5, delay: 0.2 })
    .to(introCircle, { strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.3")
    .to(introText, { opacity: 1, duration: 0.4 }, "-=0.2")
    .to(intro, { opacity: 0, visibility: "hidden", duration: 0.5, delay: 0.3 })
    .set(intro, { display: "none" });
}

/* ---------- Reveal on scroll (fade up) ---------- */
function initReveal() {
  if (!window.gsap || !window.ScrollTrigger) {
    // fallback: reveal all via IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    $$(".reveal").forEach((el) => observer.observe(el));
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  $$(".reveal").forEach((el) => {
    window.ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        window.gsap.to(el, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" });
      },
    });
  });

  // Experience timeline line draw
  const timelineLine = $(".timeline__line");
  if (timelineLine) {
    window.ScrollTrigger.create({
      trigger: "#experience",
      start: "top 75%",
      once: true,
      onEnter: () => {
        timelineLine.classList.add("draw");
        window.gsap.to(timelineLine, { "--draw": 1, duration: 0.8, ease: "power2.out" });
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
      start: "top 85%",
      once: true,
      onEnter: () => {
        paths.forEach((p) => {
          const len = p.getTotalLength ? p.getTotalLength() : 0;
          if (len > 0) {
            window.gsap.to(p, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" });
          }
        });
      },
    });
  }
}

/* ---------- Navbar + mobile menu ---------- */
const navbar = $("#navbar");
const navToggle = $("#navToggle");
const navMenu = $(".mobile-menu");
const navClose = $(".mobile-menu__close");
const navLinks = $$(".mobile-menu__nav-link");
const topLinks = $$(".navbar__list .nav-link");

let ticking = false;

function updateScroll() {
  if (navbar && !ticking) {
    window.requestAnimationFrame(() => {
      if (window.pageYOffset > 10) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
      ticking = false;
    });
    ticking = true;
  }
}

if (navbar) {
  window.addEventListener("scroll", updateScroll);
}

function closeMenu() {
  if (navMenu) {
    navMenu.classList.remove("is-open");
  }
  if (navToggle) {
    navToggle.classList.remove("navbar__toggle--open");
    navToggle.setAttribute("aria-expanded", "false");
  }
  document.body.classList.remove("menu-locked");
}

function openMenu() {
  if (navMenu) {
    navMenu.classList.add("is-open");
  }
  if (navToggle) {
    navToggle.classList.add("navbar__toggle--open");
    navToggle.setAttribute("aria-expanded", "true");
  }
  document.body.classList.add("menu-locked");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const open = !navMenu.classList.contains("is-open");
    if (open) openMenu(); else closeMenu();
  });
}

if (navClose && navMenu) {
  navClose.addEventListener("click", closeMenu);
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

// Close on Escape
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu && navMenu.classList.contains("is-open")) {
    closeMenu();
  }
});

// Close when resizing above 900px
window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && navMenu && navMenu.classList.contains("is-open")) {
    closeMenu();
  }
});

// Highlight active link by path
const currentPath = window.location.pathname.split("/").pop() || "index.html";
const allNavLinks = $$(".nav-link, .mobile-menu__nav-link");
allNavLinks.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && !href.startsWith("http") && !href.startsWith("#")) {
    if (href.split("/").pop() === currentPath) {
      link.classList.add("is-active");
    }
  } else if (href === "#" && currentPath === "index.html") {
    link.classList.add("is-active");
  }
});

/* ---------- Contact form (mailto) ---------- */
const contactForm = $("#contactForm");
const copyEmailBtn = $("#copyEmail");
const toast = $("#toast");

function showToast() {
  if (!toast) return;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2000);
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
  initReveal();
}

document.addEventListener("DOMContentLoaded", init);
