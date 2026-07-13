(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const header = document.getElementById("siteHeader");
  const progress = document.getElementById("pageProgress");
  const menuButton = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const cursorAura = document.getElementById("cursorAura");

  document.getElementById("year").textContent = new Date().getFullYear();

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileNav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  };

  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setMenu(false); });

  let scrollQueued = false;
  const updateScroll = () => {
    const top = window.scrollY;
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? (top / available) * 100 : 0}%`;
    header.classList.toggle("scrolled", top > 18);
    scrollQueued = false;
  };
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.1 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  const navSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-32% 0px -60%", threshold: 0 });
    navSections.forEach((section) => navObserver.observe(section));
  }

  const roles = [
    "machine learning systems",
    "LLM agents and RAG pipelines",
    "full-stack AI products",
    "explainable predictive models"
  ];
  const roleNode = document.getElementById("rotatingRole");
  let roleIndex = 0;
  if (!reducedMotion) {
    window.setInterval(() => {
      roleNode.animate([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)", offset: .45 },
        { opacity: 0, transform: "translateY(6px)", offset: .55 },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 560, easing: "ease-out" });
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleNode.textContent = roles[roleIndex];
      }, 280);
    }, 3200);
  }

  const filterButtons = [...document.querySelectorAll(".project-filters button")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => item.classList.toggle("active", item === button));
      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category.split(" ").includes(filter);
        card.classList.toggle("is-hidden", !visible);
      });
    });
  });

  const tabButtons = [...document.querySelectorAll(".recognition-tabs button")];
  const panels = [...document.querySelectorAll(".recognition-panel")];
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.getAttribute("aria-controls"));
      tabButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-selected", String(selected));
      });
      panels.forEach((panel) => {
        const active = panel === target;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    });
  });

  document.querySelectorAll(".spotlight-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    });
  });

  if (finePointer && !reducedMotion) {
    window.addEventListener("pointermove", (event) => {
      cursorAura.style.left = `${event.clientX}px`;
      cursorAura.style.top = `${event.clientY}px`;
    }, { passive: true });

    const profile = document.querySelector("[data-tilt]");
    profile.addEventListener("pointermove", (event) => {
      const rect = profile.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      profile.style.transform = `perspective(1000px) rotateX(${-y * 3.5}deg) rotateY(${x * 4}deg)`;
    });
    profile.addEventListener("pointerleave", () => { profile.style.transform = ""; });
  }

  const canvas = document.getElementById("networkCanvas");
  const context = canvas.getContext("2d");
  const pointer = { x: -1000, y: -1000 };
  let width = 0;
  let height = 0;
  let particles = [];
  let animationFrame = 0;

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.vx = (Math.random() - .5) * .16;
      this.vy = (Math.random() - .5) * .14;
      this.radius = Math.random() * 1.4 + .65;
      this.phase = Math.random() * Math.PI * 2;
    }
    update() {
      this.phase += .012;
      this.x += this.vx;
      this.y += this.vy;
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 145 && distance > 0) {
        const force = (145 - distance) / 145;
        this.x += (dx / distance) * force * .42;
        this.y += (dy / distance) * force * .42;
      }
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }
    draw() {
      const alpha = .32 + Math.sin(this.phase) * .12;
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(92, 225, 230, ${alpha})`;
      context.fill();
    }
  }

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = width < 700 ? 24 : Math.min(58, Math.floor(width / 25));
    particles = Array.from({ length: count }, () => new Particle());
    if (reducedMotion) drawNetwork(false);
  };

  const drawNetwork = (animate = true) => {
    context.clearRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      if (animate) particle.update();
      particle.draw();
      for (let next = index + 1; next < particles.length; next += 1) {
        const other = particles[next];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance > 132) continue;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(103, 148, 255, ${(1 - distance / 132) * .1})`;
        context.lineWidth = .7;
        context.stroke();
      }
    });

    if (pointer.x > 0) {
      particles.forEach((particle) => {
        const distance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        if (distance > 165) return;
        context.beginPath();
        context.moveTo(pointer.x, pointer.y);
        context.lineTo(particle.x, particle.y);
        context.strokeStyle = `rgba(92, 225, 230, ${(1 - distance / 165) * .16})`;
        context.lineWidth = .8;
        context.stroke();
      });
    }

    if (animate) animationFrame = requestAnimationFrame(() => drawNetwork(true));
  };

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animationFrame);
    resizeCanvas();
    if (!reducedMotion) drawNetwork(true);
  });
  window.addEventListener("pointermove", (event) => { pointer.x = event.clientX; pointer.y = event.clientY; }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { pointer.x = -1000; pointer.y = -1000; });

  resizeCanvas();
  if (!reducedMotion) drawNetwork(true);
})();
