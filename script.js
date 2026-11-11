/* ==========================================================================
   Takieddine Drici — Portfolio
   Vanilla JS + GSAP / ScrollTrigger (CDN)
   ========================================================================== */

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isTouch = window.matchMedia("(any-pointer: coarse)").matches || "ontouchstart" in window;

/* ---------- Scroll progress bar ---------- */
const progressBar = $("#progressBar");
window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const pct = scrollHeight ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.transform = `scaleX(${pct / 100})`;
});

/* ---------- Custom cursor ---------- */
const cursor = $("#cursor");
const follower = $("#cursorFollower");

if (!isTouch && !prefersReduced) {
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

/* ---------- Navbar ---------- */
const navbar = $("#navbar");
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");
const navLinks = $$(".nav-link");

let lastScrollY = window.pageYOffset;
window.addEventListener("scroll", () => {
  const scrolled = window.pageYOffset > 60;
  if (scrolled) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
  lastScrollY = window.pageYOffset;
});

// Mobile toggle
navToggle.addEventListener("click", () => {
  const open = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open);
});

// Close menu on link click + highlight active section
const sections = $$("section[id]");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

function setActiveNav() {
  const scrollPos = window.pageYOffset + 120;
  let current = sections[0];
  sections.forEach((sec) => {
    if (sec.offsetTop <= scrollPos) current = sec;
  });
  const id = current.getAttribute("id");
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
  });
}
window.addEventListener("scroll", setActiveNav);
setActiveNav();

/* ---------- Magnetic buttons ---------- */
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

/* ---------- Typewriter (hero) ---------- */
const typewriter = $("#typewriter");
const words = ["Social Media Manager", "Content Creator", "Automation Builder"];
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
  const display = isDeleting ? current.slice(0, charIndex - 1) : current.slice(0, charIndex + 1);
  typewriter.textContent = display;

  if (!isDeleting && charIndex === current.length) {
    // pause at end, then delete
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

// start after intro finishes (kicked off in initIntro)

/* ---------- Intro animation ---------- */
function initIntro() {
  const intro = $("#intro");
  const introLogo = $("#introLogo");
  const introDrawRing = $("#introDrawRing");
  const introCircle = introDrawRing ? introDrawRing.querySelector("circle") : null;
  const introText = $(".intro__text");

  if (!intro || !introLogo) {
    startTypewriter();
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

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
}

function startTypewriter() {
  typewriter.style.borderRight = prefersReduced ? "none" : "2px solid #E10600";
  type();
}

/* ---------- GSAP ScrollTrigger setup ---------- */
function initScrollReveal() {
  if (!window.gsap || !window.ScrollTrigger) {
    // Fallback: reveal via IntersectionObserver
    initIntersectionObserverFallback();
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);

  // Reveal every section + staggered children
  $$(".section").forEach((section) => {
    const children = section.querySelectorAll(
      ".fact, .skills__group, .timeline__item, .project-card, .cred-card, .cv__col, .contact__btn, .form__row, .about__meta-item"
    );

    window.ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      end: "bottom 20%",
      toggleClass: { targets: section, className: "is-visible" },
      once: true,
    });

    gsap.fromTo(
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
        gsap.to(timelineLine, { scaleY: 1, duration: 1, ease: "power2.out" });
      },
    });
  }

  // Hero parallax portrait + float glow already via CSS; subtle scroll shift
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

function initIntersectionObserverFallback() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  $$(".section").forEach((s) => observer.observe(s));
}

/* ---------- Project card tilt ---------- */
function initTilt() {
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

/* ---------- Animated counters (About facts) ---------- */
function initCounters() {
  $$("[data-fact]").forEach((fact) => {
    const numberEl = fact.querySelector("[data-count]");
    const suffixEl = fact.querySelector(".fact__suffix");
    if (!numberEl) return;
    const target = parseInt(numberEl.getAttribute("data-count") || numberEl.textContent, 10) || 0;
    const suffix = suffixEl ? suffixEl.textContent : "";

    if (prefersReduced || !window.ScrollTrigger || !window.gsap) {
      numberEl.textContent = target + suffix;
      return;
    }

    window.ScrollTrigger.create({
      trigger: fact,
      start: "top 82%",
      once: true,
      onEnter: () => {
        const tweenObj = { val: 0 };
        gsap.to(tweenObj, {
          val: target,
          duration: 1.4,
          ease: "power2.out",
          snap: { val: 1 },
          onUpdate: () => {
            numberEl.textContent = Math.round(tweenObj.val) + suffix;
          },
        });
      },
    });
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

/* ---------- Project detail modal ---------- */
const modal = $("#projectModal");
const modalOverlay = $("#modalOverlay");
const modalClose = $("#modalClose");
const detailBtns = $$(".project__details");
const fields = {
  title: $("#modalTitle"),
  problem: $("#modalProblem"),
  solution: $("#modalSolution"),
  tools: $("#modalTools"),
  result: $("#modalResult"),
};

function openModal(btn) {
  if (!modal) return;
  const d = btn.dataset;
  if (fields.title) fields.title.textContent = d.title || "";
  if (fields.problem) fields.problem.textContent = d.problem || "";
  if (fields.solution) fields.solution.textContent = d.solution || "";
  if (fields.tools) fields.tools.textContent = d.tools || "";
  if (fields.result) fields.result.textContent = d.result || "";
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (window.gsap && !prefersReduced) {
    gsap.fromTo(modalOverlay, { opacity: 0 }, { opacity: 0.6, duration: 0.3 });
    gsap.fromTo(".modal__content", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });
  }
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (window.gsap && !prefersReduced) {
    gsap.to([modalOverlay, ".modal__content"], { opacity: 0, y: 0, duration: 0.2 });
  }
}

detailBtns.forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn));
});
if (modalClose) modalClose.addEventListener("click", closeModal);
if (modalOverlay) modalOverlay.addEventListener("click", closeModal);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.getAttribute("aria-hidden") === "false") closeModal();
});

/* ---------- Project links / images ---------- */
/*
  To add real project links/images later:
  1. Replace each <svg class="project__thumb project__thumb--workflow"> with an
     <img src="assets/project-NAME.jpg" loading="lazy"> inside .project__thumb-wrap.
  2. Wrap .project__thumb-wrap (or the whole .project-card) in an <a href="project-url">
     to link to live projects/case studies. Add target="_blank" rel="noopener" as needed.
  3. Keep the modal data-* attributes on the .project__details buttons for case-study copy.
*/

/* ---------- Init ---------- */
function init() {
  initIntro();
  initScrollReveal();
  initCounters();
  initTilt();
}

document.addEventListener("DOMContentLoaded", init);
