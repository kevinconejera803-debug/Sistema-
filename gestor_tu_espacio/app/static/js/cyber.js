(function () {
  var root = document.getElementById("cyber-root");
  var header = document.getElementById("cyber-header");
  if (!root) return;

  var KEY = "tu_espacio_cyber_v2";
  var state = { checks: {}, notes: {}, dates: {} };
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
      items: [
        { label: "Contraseñas únicas y gestor de secretos", desc: "Usar Bitwarden, 1Password o similar. Ninguna contraseña reutilizada." },
        { label: "Segundo factor (2FA) en correo y cuentas críticas", desc: "优先 Authenticator o hardware key (YubiKey). Evitar SMS." },
        { label: "Revisión de sesiones activa mensual", desc: "Verificar dispositivos autorizados en Google, GitHub, banks." },
        { label: "Contraseña de sistema cifrada con FileVault/BitLocker", desc: "Cifrado completo del disco duro." },
      ],
    },
    {
      title: "DISPOSITIVO Y RED",
      priority: "alta",
      items: [
        { label: "Bloqueo automático (< 5 min)", desc: "Pantalla se bloquea automáticamente tras inactividad." },
        { label: "Firewall activo en sistema", desc: "Cortafuegos de sistema habilitado (Windows Defender/Firewall)."},
        { label: "WiFi público solo con VPN", desc: "Usar VPN (WireGuard, Mullvad, ProtonVPN) en redes públicas." },
        { label: "Copias de seguridad cifradas fuera del equipo", desc: "3-2-1: 3 copias, 2 medios diferentes, 1 offsite (Cloud encrypted)."},
        { label: "Actualizaciones automáticas del sistema", desc: "Mantener SO y aplicaciones actualizadas." },
      ],
    },
    {
      title: "DATOS Y CORREO",
      priority: "media",
      items: [
        { label: "No abrir adjuntos inesperados", desc: "Verificar remitente. Adjuntos sospechosos: escanear con VirusTotal." },
        { label: "Verificar remitente antes de enlaces sensibles", desc: "Hover sobre enlace. Chequear dominio exacto." },
        { label: "Clasificar datos personales vs trabajo", desc: "Separar datos sensibles en carpetas cifradas." },
        { label: "Correo electrónico con SPF/DKIM/DMARC", desc: "Verificar configuración de seguridad del dominio." },
        { label: "Datos sensibles cifrados en reposo", desc: "Usar AES-256 para archivos importantes." },
      ],
    },
    {
      title: "RESPUESTA Y CONCIENCIA",
      priority: "media",
      items: [
        { label: "Plan de respuesta ante pérdida de dispositivo", desc: "Procedimiento de wipe remoto (Find My Device, etc)."},
        { label: "Formación periódica en phishing", desc: "Realizar simulaciones cada 6 meses. Reportar correos sospechosos." },
        { label: "No pagar rescates sin asesoría", desc: "Contactar a autoridades (PDI, CERT) antes de cualquier pago." },
        { label: "Contraseñas de recuperación configuradas", desc: "Verificar que las cuentas de recuperación estén actualizadas." },
      ],
    },
    {
      title: "CUENTA DE DESARROLLADOR",
      priority: "alta",
      items: [
        { label: "Tokens de acceso con scope mínimo", desc: "GitHub tokens solo con permisos necesarios." },
        { label: "Secrets en variables de entorno, no en código", desc: "Usar .env con .gitignore." },
        { label: "2FA en GitHub, npm, PyPI, Docker Hub", desc: "Tokens de acceso con expiración." },
        { label: "Revisar commits por datos sensibles", desc: "Usar git-secrets o similares antes de push." },
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
    var total = 0;
    var done = 0;
    groups.forEach(function (g) {
      g.items.forEach(function (_, idx) {
        total++;
        var id = g.title + "::" + idx;
        if (state.checks[id]) done++;
      });
    });
    return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function renderHeader() {
    if (!header) return;
    var p = countProgress();
    header.innerHTML =
      '<div class="cyber-header__inner">' +
      '<div class="cyber-donut" style="--p:' + p.pct + '" aria-hidden="true"><span class="cyber-donut__hole">' + p.pct + "%</span></div>" +
      '<div class="cyber-header__text"><strong class="cyber-header__title">Postura de seguridad</strong>' +
      "<span class=\"cyber-header__sub\">" + p.done + " de " + p.total + " controles revisados</span></div>" +
      '<div class="cyber-header__actions">' +
      '<button class="cyber-btn" id="export-btn" title="Exportar">📤</button>' +
      '<button class="cyber-btn" id="import-btn" title="Importar">📥</button>' +
      '<input type="file" id="import-file" accept=".json" style="display:none">';
  }

  function render() {
    root.innerHTML = "";
    groups.forEach(function (g) {
      var sec = document.createElement("div");
      sec.className = "cyber-cat";
      var priorityBadge = '<span class="cyber-priority cyber-priority--' + g.priority + '">' + g.priority + '</span>';
      var h = document.createElement("h4");
      h.innerHTML = g.title + " " + priorityBadge;
      sec.appendChild(h);
      g.items.forEach(function (item, idx) {
        var id = g.title + "::" + idx;
        var row = document.createElement("div");
        row.className = "cyber-row";

        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!state.checks[id];
        cb.addEventListener("change", function () {
          state.checks[id] = cb.checked;
          if (cb.checked) {
            state.dates[id] = Date.now();
          } else {
            delete state.dates[id];
          }
          save();
          renderHeader();
          render();
        });

        var content = document.createElement("div");
        content.className = "cyber-row__content";

        var titleRow = document.createElement("div");
        titleRow.className = "cyber-row__title";
        var titleSpan = document.createElement("span");
        titleSpan.className = "cyber-row__label";
        titleSpan.textContent = item.label;
        titleRow.appendChild(titleSpan);

        var descSpan = document.createElement("span");
        descSpan.className = "cyber-row__desc";
        descSpan.textContent = item.desc;
        content.appendChild(titleRow);
        content.appendChild(descSpan);

        var noteBtn = document.createElement("button");
        noteBtn.className = "cyber-note-btn";
        noteBtn.textContent = state.notes[id] ? "✏️" : "📝";
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

        var noteDisplay = document.createElement("div");
        noteDisplay.className = "cyber-row__note-display";
        if (state.notes[id]) {
          noteDisplay.textContent = "📝 " + state.notes[id];
        }

        var dateDisplay = document.createElement("div");
        dateDisplay.className = "cyber-row__date";
        if (state.dates[id]) {
          dateDisplay.textContent = "✓ Completado: " + formatDate(state.dates[id]);
        }

        row.appendChild(cb);
        row.appendChild(content);
        row.appendChild(noteBtn);
        sec.appendChild(row);
        if (state.notes[id]) {
          var noteRow = document.createElement("div");
          noteRow.className = "cyber-row-note";
          noteRow.appendChild(noteDisplay);
          sec.appendChild(noteRow);
        }
        if (state.dates[id]) {
          var dateRow = document.createElement("div");
          dateRow.className = "cyber-row-date";
          dateRow.appendChild(dateDisplay);
          sec.appendChild(dateRow);
        }
      });
      root.appendChild(sec);
    });
    renderHeader();
    setupImportExport();
  }

  function setupImportExport() {
    var exportBtn = document.getElementById("export-btn");
    var importBtn = document.getElementById("import-btn");
    var importFile = document.getElementById("import-file");

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

    if (importBtn && importFile) {
      importBtn.addEventListener("click", function () {
        importFile.click();
      });
      importFile.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var imported = JSON.parse(evt.target.result);
            if (imported.checks) {
              state.checks = imported.checks;
            }
            if (imported.notes) {
              state.notes = imported.notes;
            }
            if (imported.dates) {
              state.dates = imported.dates;
            }
            save();
            render();
            alert("Importación exitosa!");
          } catch (err) {
            alert("Error al importar: " + err.message);
          }
        };
        reader.readAsText(file);
        importFile.value = "";
      });
    }
  }

  render();
})();
