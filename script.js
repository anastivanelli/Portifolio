(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // Só liga os efeitos de mouse em computador
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mqDark = matchMedia("(prefers-color-scheme: dark)");
  const mqMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const STORAGE_KEY = "ana-theme-v1";
  const MODES = ["dark", "light", "system"];
  const VISIONS = ["default", "deutan", "protan", "tritan", "contrast"];

  const MODE_LABEL = { dark: "Escuro", light: "Claro" };
  const VISION_LABEL = {
    deutan: "Deuteranopia",
    protan: "Protanopia",
    tritan: "Tritanopia",
    contrast: "Alto contraste",
  };

  const themeBtn = $("#themeBtn");
  const themePanel = $("#themePanel");
  const themeLabel = $(".label", themeBtn);
  const motionToggle = $("#motionToggle");
  const modeBtns = $$("[data-mode]", themePanel);
  const visionBtns = $$("[data-vision]", themePanel);
  const metaTheme = $('meta[name="theme-color"]');

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && typeof saved === "object") {
        return {
          mode: MODES.includes(saved.mode) ? saved.mode : "dark",
          vision: VISIONS.includes(saved.vision) ? saved.vision : "default",
          reduced: typeof saved.reduced === "boolean" ? saved.reduced : mqMotion.matches,
        };
      }
    } catch (e) {}
    return { mode: "dark", vision: "default", reduced: mqMotion.matches };
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  const state = loadState();
  let transitionTimer;

 
  function applyTheme(animate) {
    const mode = state.mode === "system" ? (mqDark.matches ? "dark" : "light") : state.mode;

  
    if (animate) {
      root.classList.add("theme-transition");
      clearTimeout(transitionTimer);
      transitionTimer = setTimeout(() => root.classList.remove("theme-transition"), 500);
    }

    root.dataset.theme = mode;
    root.dataset.vision = state.vision;
    if (state.reduced) root.dataset.motion = "reduced";
    else delete root.dataset.motion;


    themeLabel.textContent = state.vision === "default" ? MODE_LABEL[mode] : VISION_LABEL[state.vision];


    modeBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === state.mode)));
    visionBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.vision === state.vision)));
    motionToggle.checked = state.reduced;


    if (metaTheme) {
      metaTheme.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
    }
  }

  modeBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      saveState();
      applyTheme(true);
    })
  );

  visionBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      state.vision = btn.dataset.vision;
      saveState();
      applyTheme(true);
    })
  );

  motionToggle.addEventListener("change", () => {
    state.reduced = motionToggle.checked;
    saveState();
    applyTheme(false);
  });


  mqDark.addEventListener?.("change", () => {
    if (state.mode === "system") applyTheme(true);
  });


  function setPanel(open) {
    themePanel.classList.toggle("open", open);
    themeBtn.setAttribute("aria-expanded", String(open));
  }

  themeBtn.addEventListener("click", () => setPanel(!themePanel.classList.contains("open")));


  document.addEventListener("click", (e) => {
    if (!e.target.closest(".theme-toggle")) setPanel(false);
  });

  applyTheme(false);

  /* =====================================================
     MENU MOBILE
     ===================================================== */

 
  const menuToggle = $("#menuToggle");
  const mobileMenu = $("#mobileMenu");

  function setMenu(open) {
    mobileMenu.classList.toggle("open", open);
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  }


  menuToggle?.addEventListener("click", () => {
    setMenu(!mobileMenu.classList.contains("open"));
    setPanel(false);
  });

  mobileMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (themePanel.classList.contains("open")) {
      setPanel(false);
      themeBtn.focus();
    }
    setMenu(false);
  });


  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (targetId === "#") return;

      const target = document.querySelector(targetId);

      if (target) {
        e.preventDefault(); 
)
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;


        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });

  /* =====================================================
     NAVBAR E BARRA DE PROGRESSO
     ===================================================== */

  const navbar = $("#navbar");
  const progress = $("#scrollProgress");
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;

      navbar.classList.toggle("scrolled", y > 50);

      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      ticking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();


  const navLinks = $$(".nav-links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => {
          const active = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((s) => spy.observe(s));

  const observerOptions = {
    threshold: 0.12,                    
    rootMargin: "0px 0px -40px 0px",   
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in"); 
        observer.unobserve(entry.target);  
      }
    });
  }, observerOptions);

  $$(".reveal").forEach((el) => {
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty("--i", Math.min(index, 6));
    observer.observe(el);
  });

  const subtitle = $(".subtitle");

  if (subtitle && !state.reduced && !mqMotion.matches) {
    const full = subtitle.textContent.trim();
    subtitle.textContent = "";

  
    const sr = document.createElement("span");
    sr.className = "sr-only";
    sr.textContent = full;

    const typed = document.createElement("span");
    typed.setAttribute("aria-hidden", "true");
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.setAttribute("aria-hidden", "true");

    subtitle.append(sr, typed, caret);

    let i = 0;
    const type = () => {
      typed.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(type, 55 + Math.random() * 60);
    };
    setTimeout(type, 900);
  }

  /* =====================================================
     EFEITOS DE MOUSE 
     ===================================================== */

  if (finePointer) {

    const glow = $("#cursorGlow");
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.classList.add("on");
        glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      },
      { passive: true }
    );
    document.addEventListener("pointerleave", () => glow.classList.remove("on"));

    $$(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", `${(e.clientX - r.left - r.width / 2) * 0.12}px`);
        btn.style.setProperty("--ty", `${(e.clientY - r.top - r.height / 2) * 0.2}px`);
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      });
    });
  }

  $$(".skill-card, .project-item, .social-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  /* =====================================================
     FORMULÁRIO DE CONTATO 
     ===================================================== */

  const EMAILJS_PUBLIC_KEY = "-zGfQP1HrketJayBx";
  const EMAILJS_SERVICE_ID = "service_kkd8s7b";
  const EMAILJS_TEMPLATE_ID = "template_97defgd";

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const contactForm = $("#contactForm");

  contactForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const agora = new Date().toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    });
    document.getElementById("formTime").value = agora;

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = "ENVIANDO...";
    btn.disabled = true;

    emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm)
      .then(() => {
        btn.textContent = "ENVIADO ✓";
        btn.classList.add("is-sent");

        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove("is-sent");
          btn.disabled = false;
          contactForm.reset();
        }, 2500);
      })
      .catch(() => {
        btn.textContent = "ERRO AO ENVIAR";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 2500);
      });
  });
})();
