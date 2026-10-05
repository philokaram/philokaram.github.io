/* ============================================================
   Philo Portfolio — interactive script
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- THEME ---------- */
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  function toggleTheme() {
    const cur = document.documentElement.getAttribute("data-theme");
    const next = cur === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = next === "dark" ? "☾" : "☀";
  }

  /* ---------- PROGRESS BAR ---------- */
  const progress = document.getElementById("progress");
  if (progress) {
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      progress.style.width = pct + "%";
    }, { passive: true });
  }

  /* ---------- LIVE CLOCK ---------- */
  function tickClock() {
    const el = document.querySelector(".clock");
    if (!el) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
  setInterval(tickClock, 1000);
  tickClock();

  /* ---------- NAV ACTIVE ---------- */
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });

  /* ---------- SCROLL REVEAL ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("on");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- ANIMATED COUNTERS ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io2.unobserve(el);
        if (reduce) { el.textContent = target.toFixed(decimals); return; }
        const start = performance.now();
        const dur = 1400;
        function step(now) {
          const t = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = (target * eased).toFixed(decimals);
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    io2.observe(el);
  });

  /* ---------- SKILL BARS ---------- */
  document.querySelectorAll(".track > div[data-w]").forEach((el) => {
    const w = el.dataset.w;
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          io3.unobserve(el);
          setTimeout(() => { el.style.width = w + "%"; }, 80);
        }
      });
    }, { threshold: 0.4 });
    io3.observe(el);
  });

  /* ---------- ROLE TYPING (home) ---------- */
  const roleEl = document.querySelector(".name .role");
  if (roleEl && !reduce) {
    const roles = [
      "Junior HPC SysAdmin",
      "Linux Enthusiast",
      "SLURM Operator",
      "MPI / OpenMP Dev",
      "Cluster Builder"
    ];
    let ri = 0, ci = 0, deleting = false;
    function typeRole() {
      const cur = roles[ri];
      if (!deleting) {
        roleEl.textContent = cur.slice(0, ++ci);
        if (ci === cur.length) {
          deleting = true;
          setTimeout(typeRole, 1600);
          return;
        }
      } else {
        roleEl.textContent = cur.slice(0, --ci);
        if (ci === 0) {
          deleting = false;
          ri = (ri + 1) % roles.length;
        }
      }
      setTimeout(typeRole, deleting ? 40 : 80);
    }
    typeRole();
  }

  /* ---------- INTERACTIVE TERMINAL ---------- */
  const term = document.getElementById("term");
  if (term) {
    const log = document.getElementById("termLog");
    const input = document.getElementById("termInput");
    const history = [];
    let hIndex = -1;

    const COMMANDS = {
      help: () =>
        `Available commands:\n` +
        `  help            show this list\n` +
        `  whoami          who is this\n` +
        `  ls              list site sections\n` +
        `  cat about.md    read about\n` +
        `  contact         contact info\n` +
        `  theme           toggle dark/light\n` +
        `  goto <page>     open a page (home, experience, skills, projects, certs, contact)\n` +
        `  clear           clear the terminal\n` +
        `  sudo <x>        nice try 😏`,
      whoami: () => "Philopateer Karam — Junior HPC System Administrator, Cairo, Egypt.",
      ls: () => "index.html  experience.html  skills.html  projects.html  certs.html  contact.html",
      "cat about.md": () =>
        "CS graduate (Cairo University, 2022–2026, GPA 3.91). Linux clusters, xCAT, FreeIPA, SLURM, MPI, OpenMP. Learning Ansible + Kubernetes.",
      contact: () => "email: philokrm@gmail.com\ngithub: github.com/philokaram\nbased: Cairo, Egypt",
      theme: () => { toggleTheme(); return "Theme toggled."; },
      clear: () => { log.innerHTML = ""; return null; }
    };

    const PAGES = {
      home: "index.html",
      experience: "experience.html",
      skills: "skills.html",
      projects: "projects.html",
      certs: "certs.html",
      contact: "contact.html"
    };

    function write(html, cls) {
      const div = document.createElement("div");
      div.className = "cmd-log " + (cls || "");
      div.innerHTML = html;
      log.appendChild(div);
      log.scrollTop = log.scrollHeight;
    }

    function run(raw) {
      const cmd = raw.trim();
      if (!cmd) return;
      write(`<span class="echo">$ ${escapeHtml(cmd)}</span>`);
      history.push(cmd);
      hIndex = history.length;

      if (cmd.startsWith("goto ")) {
        const page = cmd.slice(5).trim();
        if (PAGES[page]) {
          write(`Opening ${page}...`, "ok");
          setTimeout(() => { location.href = PAGES[page]; }, 350);
        } else {
          write(`goto: unknown page "${page}"`, "err");
        }
        return;
      }

      if (cmd.startsWith("sudo")) {
        write("Nice try. This incident will be reported. 🚨", "err");
        return;
      }

      const fn = COMMANDS[cmd];
      if (fn) {
        const out = fn();
        if (out !== null && out !== undefined) write(out, "ok");
      } else {
        write(`command not found: ${cmd}  (type "help")`, "err");
      }
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      }[c]));
    }

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        run(input.value);
        input.value = "";
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (hIndex > 0) input.value = history[--hIndex] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (hIndex < history.length - 1) input.value = history[++hIndex] || "";
        else { hIndex = history.length; input.value = ""; }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const v = input.value;
        const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(v) && v);
        if (matches.length === 1) input.value = matches[0];
        else if (matches.length > 1) write(matches.join("  "), "info");
      }
    });

    write('Type <span class="ok">help</span> and press Enter. Try <span class="ok">whoami</span>, <span class="ok">ls</span>, <span class="ok">theme</span>, <span class="ok">goto projects</span>.', "info");
    if (!reduce) setTimeout(() => input.focus(), 900);
  }

  /* ---------- COMMAND PALETTE ---------- */
  const palette = document.getElementById("palette");
  if (palette) {
    const pInput = palette.querySelector("input");
    const pList = palette.querySelector("ul");
    const items = [
      { label: "Home", href: "index.html", key: "g h" },
      { label: "Experience", href: "experience.html", key: "g e" },
      { label: "Skills", href: "skills.html", key: "g s" },
      { label: "Projects", href: "projects.html", key: "g p" },
      { label: "Certificates", href: "certs.html", key: "g c" },
      { label: "Contact", href: "contact.html", key: "g t" },
      { label: "Download CV", href: "Philopateer-Karam-CV.pdf", key: "", download: true },
      { label: "Toggle Theme", action: toggleTheme, key: "t" },
      { label: "GitHub Profile", href: "https://github.com/philokaram", key: "ext" },
    ];
    let filter = "";
    let sel = 0;

    function render() {
      const f = filter.toLowerCase();
      const shown = items.filter((it) => it.label.toLowerCase().includes(f));
      pList.innerHTML = shown.map((it, i) =>
        `<li data-i="${i}" class="${i === sel ? "on" : ""}">${it.label}<span class="k">${it.key || ""}</span></li>`
      ).join("");
      pList.querySelectorAll("li").forEach((li) => {
        li.addEventListener("click", () => activate(shown[+li.dataset.i]));
      });
      return shown;
    }

    function activate(it) {
      if (!it) return;
      if (it.action) { it.action(); closePalette(); return; }
      if (it.download) {
        const a = document.createElement("a");
        a.href = it.href; a.download = ""; a.click();
      } else {
        location.href = it.href;
      }
      closePalette();
    }

    function openPalette() {
      palette.classList.add("on");
      pInput.value = ""; filter = ""; sel = 0;
      render();
      setTimeout(() => pInput.focus(), 30);
    }
    function closePalette() { palette.classList.remove("on"); }

    pInput.addEventListener("input", () => { filter = pInput.value; sel = 0; render(); });
    pInput.addEventListener("keydown", (e) => {
      const shown = render();
      if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % shown.length; render(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % shown.length; render(); }
      else if (e.key === "Enter") { e.preventDefault(); activate(shown[sel]); }
      else if (e.key === "Escape") closePalette();
    });
    palette.addEventListener("click", (e) => { if (e.target === palette) closePalette(); });

    /* ---------- KEYBOARD SHORTCUTS ---------- */
    let gPressed = false;
    document.addEventListener("keydown", (e) => {
      const typing = /input|textarea/i.test((document.activeElement || {}).tagName);

      // Cmd/Ctrl + K → palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); openPalette(); return;
      }
      if (typing) return;

      if (e.key === "?") { e.preventDefault(); openPalette(); return; }

      if (e.key === "g") { gPressed = true; setTimeout(() => gPressed = false, 800); return; }
      if (gPressed) {
        const map = { h: "index.html", e: "experience.html", s: "skills.html", p: "projects.html", c: "certs.html", t: "contact.html" };
        const dest = map[e.key];
        if (dest) { location.href = dest; }
        gPressed = false;
      }
    });
  }

  /* ---------- COPY TO CLIPBOARD + TOAST ---------- */
  const toast = document.getElementById("toast");
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("on"), 1800);
  }

  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.style.cursor = "pointer";
    el.title = "Click to copy";
    el.addEventListener("click", () => {
      navigator.clipboard.writeText(el.dataset.copy).then(
        () => showToast("Copied: " + el.dataset.copy),
        () => showToast("Copy failed")
      );
    });
  });

  /* ---------- EXPOSE THEME TOGGLE ---------- */
  const tt = document.getElementById("themeToggle");
  if (tt) {
    tt.textContent = savedTheme === "dark" ? "☾" : "☀";
    tt.addEventListener("click", toggleTheme);
  }
})();
