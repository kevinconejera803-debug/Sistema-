(function () {
  var root = document.getElementById("cyber-root");
  var progressCircle = document.getElementById("progress-circle");
  var progressPct = document.getElementById("progress-pct");
  var statDone = document.getElementById("stat-done");
  var statTotal = document.getElementById("stat-total");
  var statAlta = document.getElementById("stat-alta");
  var filterButtons = document.querySelectorAll(".cyber-filter");
  if (!root) return;

  var KEY = "tu_espacio_cyber_v3";
  var state = { checks: {}, notes: {}, dates: {} };
  var currentFilter = "all";

  try {
    var saved = localStorage.getItem(KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      state = { checks: parsed.checks || {}, notes: parsed.notes || {}, dates: parsed.dates || {} };
    }
  } catch (e) {
    state = { checks: {}, notes: {}, dates: {} };
  }

  var groups = [
    {
      title: "IDENTIDAD Y ACCESO",
      priority: "alta",
      icon: "🔑",
      items: [
        { label: "Contraseñas únicas y gestor de secretos", desc: "Usar Bitwarden, 1Password. Ninguna contraseña reutilizada." },
        { label: "Segundo factor (2FA) en correo y cuentas críticas", desc: "Autenticador o hardware key (YubiKey). Evitar SMS." },
        { label: "Revisión de sesiones activa mensual", desc: "Verificar dispositivos en Google, GitHub, bancos." },
        { label: "Contraseña de sistema cifrada (FileVault/BitLocker)", desc: "Cifrado completo del disco duro." },
      ],
    },
    {
      title: "DISPOSITIVO Y RED",
      priority: "alta",
      icon: "💻",
      items: [
        { label: "Bloqueo automático (< 5 min)", desc: "Pantalla se bloquea tras inactividad." },
        { label: "Firewall activo en sistema", desc: "Windows Defender/Firewall habilitado." },
        { label: "WiFi público solo con VPN", desc: "Usar VPN (WireGuard, Mullvad, ProtonVPN)." },
        { label: "Copias de seguridad cifradas fuera del equipo", desc: "3-2-1: 3 copias, 2 medios, 1 offsite." },
        { label: "Actualizaciones automáticas del sistema", desc: "Mantener SO y apps actualizadas." },
      ],
    },
    {
      title: "DATOS Y CORREO",
      priority: "media",
      icon: "📧",
      items: [
        { label: "No abrir adjuntos inesperados", desc: "Verificar remitente. Escanear con VirusTotal." },
        { label: "Verificar remitente antes de enlaces", desc: "Hover sobre enlace. Chequear dominio." },
        { label: "Clasificar datos personales vs trabajo", desc: "Separar datos en carpetas cifradas." },
        { label: "Correo con SPF/DKIM/DMARC", desc: "Verificar seguridad del dominio." },
        { label: "Datos sensibles cifrados en reposo", desc: "Usar AES-256 para archivos importantes." },
      ],
    },
    {
      title: "RESPUESTA Y CONCIENCIA",
      priority: "media",
      icon: "🧠",
      items: [
        { label: "Plan de respuesta ante pérdida de dispositivo", desc: "Procedimiento de wipe remoto." },
        { label: "Formación periódica en phishing", desc: "Simulaciones cada 6 meses." },
        { label: "No pagar rescates sin asesoría", desc: "Contactar PDI/CERT antes de pago." },
        { label: "Contraseñas de recuperación actualizadas", desc: "Verificar cuentas de recuperación." },
      ],
    },
    {
      title: "CUENTA DE DESARROLLADOR",
      priority: "alta",
      icon: "👨‍💻",
      items: [
        { label: "Tokens de acceso con scope mínimo", desc: "GitHub tokens solo permisos necesarios." },
        { label: "Secrets en variables de entorno", desc: "Usar .env con .gitignore." },
        { label: "2FA en GitHub, npm, PyPI, Docker Hub", desc: "Tokens con expiración." },
        { label: "Revisar commits por datos sensibles", desc: "Usar git-secrets antes de push." },
      ],
    },
  ];

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    var d = new Date(timestamp);
    return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
  }

  function countProgress() {
    var total = 0, done = 0, altaDone = 0, altaTotal = 0;
    groups.forEach(function (g) {
      g.items.forEach(function (_, idx) {
        total++;
        var id = g.title + "::" + idx;
        if (state.checks[id]) {
          done++;
          if (g.priority === "alta") altaDone++;
        }
        if (g.priority === "alta") altaTotal++;
      });
    });
    return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : 0, altaDone: altaDone, altaTotal: altaTotal };
  }

  function updateStats() {
    var p = countProgress();
    progressPct.textContent = p.pct + "%";
    statDone.textContent = p.done;
    statTotal.textContent = p.total;
    statAlta.textContent = p.altaDone + "/" + p.altaTotal;
    var circumference = 2 * Math.PI * 52;
    var offset = circumference - (p.pct / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
  }

  function shouldShowItem(id, priority) {
    if (currentFilter === "all") return true;
    var isChecked = state.checks[id];
    if (currentFilter === "pendiente") return !isChecked;
    if (currentFilter === "completado") return isChecked;
    if (currentFilter === "alta") return priority === "alta";
    if (currentFilter === "media") return priority === "media";
    return true;
  }

  function render() {
    root.innerHTML = "";
    groups.forEach(function (g) {
      var groupHasVisibleItems = g.items.some(function (_, idx) {
        var id = g.title + "::" + idx;
        return shouldShowItem(id, g.priority);
      });

      if (!groupHasVisibleItems) return;

      var section = document.createElement("div");
      section.className = "cyber-section";

      var header = document.createElement("div");
      header.className = "cyber-section__header";

      var icon = document.createElement("span");
      icon.className = "cyber-section__icon";
      icon.textContent = g.icon;

      var title = document.createElement("h3");
      title.className = "cyber-section__title";
      title.textContent = g.title;

      var priority = document.createElement("span");
      priority.className = "cyber-priority-badge cyber-priority-badge--" + g.priority;
      priority.textContent = g.priority === "alta" ? "ALTA" : "MEDIA";

      header.appendChild(icon);
      header.appendChild(title);
      header.appendChild(priority);
      section.appendChild(header);

      var list = document.createElement("div");
      list.className = "cyber-section__items";

      g.items.forEach(function (item, idx) {
        var id = g.title + "::" + idx;
        if (!shouldShowItem(id, g.priority)) return;

        var itemEl = document.createElement("div");
        itemEl.className = "cyber-item";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "cyber-checkbox";
        checkbox.checked = !!state.checks[id];
        checkbox.addEventListener("change", function () {
          state.checks[id] = checkbox.checked;
          if (checkbox.checked) {
            state.dates[id] = Date.now();
          } else {
            delete state.dates[id];
          }
          save();
          updateStats();
          render();
        });

        var content = document.createElement("div");
        content.className = "cyber-item__content";

        var label = document.createElement("div");
        label.className = "cyber-item__label";
        label.textContent = item.label;

        var desc = document.createElement("div");
        desc.className = "cyber-item__desc";
        desc.textContent = item.desc;

        content.appendChild(label);
        content.appendChild(desc);

        var actions = document.createElement("div");
        actions.className = "cyber-item__actions";

        var noteBtn = document.createElement("button");
        noteBtn.className = "cyber-item__btn";
        noteBtn.textContent = state.notes[id] ? "📝" : "✏️";
        noteBtn.title = "Agregar nota";
        noteBtn.addEventListener("click", function () {
          var note = prompt("Nota para '" + item.label + "':", state.notes[id] || "");
          if (note !== null) {
            if (note.trim()) {
              state.notes[id] = note.trim();
            } else {
              delete state.notes[id];
            }
            save();
            render();
          }
        });

        actions.appendChild(noteBtn);
        itemEl.appendChild(checkbox);
        itemEl.appendChild(content);
        itemEl.appendChild(actions);

        if (state.notes[id]) {
          var noteDisplay = document.createElement("div");
          noteDisplay.className = "cyber-item__note";
          noteDisplay.textContent = "📝 " + state.notes[id];
          itemEl.appendChild(noteDisplay);
        }

        if (state.dates[id]) {
          var dateDisplay = document.createElement("div");
          dateDisplay.className = "cyber-item__date";
          dateDisplay.textContent = "✓ Completado el " + formatDate(state.dates[id]);
          itemEl.appendChild(dateDisplay);
        }

        list.appendChild(itemEl);
      });

      section.appendChild(list);
      root.appendChild(section);
    });
    updateStats();
  }

  // Filters
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) { b.classList.remove("cyber-filter--active"); });
      btn.classList.add("cyber-filter--active");
      currentFilter = btn.getAttribute("data-filter");
      render();
    });
  });

  // Export
  var exportBtn = document.getElementById("export-data");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var data = JSON.stringify(state, null, 2);
      var blob = new Blob([data], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "ciberseguridad-" + new Date().toISOString().split("T")[0] + ".json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Import
  var importBtn = document.getElementById("import-data");
  var importFile = document.getElementById("import-file");
  if (importBtn && importFile) {
    importBtn.addEventListener("click", function () { importFile.click(); });
    importFile.addEventListener("change", function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        try {
          var imported = JSON.parse(evt.target.result);
          if (imported.checks) state.checks = imported.checks;
          if (imported.notes) state.notes = imported.notes;
          if (imported.dates) state.dates = imported.dates;
          save();
          render();
          alert("✅ Importación exitosa!");
        } catch (err) {
          alert("❌ Error al importar: " + err.message);
        }
      };
      reader.readAsText(file);
      importFile.value = "";
    });
  }

  render();
})();