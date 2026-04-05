(function () {
  var root = document.getElementById("cyber-root");
  var header = document.getElementById("cyber-header");
  if (!root) return;

  var KEY = "tu_espacio_cyber_v1";
  var state = {};
  try {
    state = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch (e) {
    state = {};
  }

  var groups = [
    {
      title: "IDENTIDAD Y ACCESO",
      items: [
        "Contraseñas únicas y gestor de secretos",
        "Segundo factor (2FA) en correo y cuentas críticas",
        "Revisión de sesiones activas mensual",
      ],
    },
    {
      title: "DISPOSITIVO Y RED",
      items: [
        "Disco cifrado y bloqueo automático",
        "Firewall activo; WiFi público solo con VPN",
        "Copias de seguridad cifradas fuera del equipo",
      ],
    },
    {
      title: "DATOS Y CORREO",
      items: [
        "No abrir adjuntos inesperados",
        "Verificar remitente antes de enlaces sensibles",
        "Clasificar datos personales vs trabajo",
      ],
    },
    {
      title: "RESPUESTA Y CONCIENCIA",
      items: [
        "Plan de respuesta ante pérdida de dispositivo",
        "Formación periódica en phishing y ingeniería social",
        "Registrar incidencias y no pagar rescates sin asesoría",
      ],
    },
  ];

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function countProgress() {
    var total = 0;
    var done = 0;
    groups.forEach(function (g) {
      g.items.forEach(function (_, idx) {
        total++;
        var id = g.title + "::" + idx;
        if (state[id]) done++;
      });
    });
    return { total: total, done: done, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function renderHeader() {
    if (!header) return;
    var p = countProgress();
    header.innerHTML =
      '<div class="cyber-header__inner">' +
      '<div class="cyber-donut" style="--p:' +
      p.pct +
      '" aria-hidden="true"><span class="cyber-donut__hole">' +
      p.pct +
      "%</span></div>" +
      '<div class="cyber-header__text"><strong class="cyber-header__title">Postura de seguridad</strong>' +
      "<span class=\"cyber-header__sub\">" +
      p.done +
      " de " +
      p.total +
      " controles revisados</span></div></div>";
  }

  function render() {
    root.innerHTML = "";
    groups.forEach(function (g) {
      var sec = document.createElement("div");
      sec.className = "cyber-cat";
      var h = document.createElement("h4");
      h.textContent = g.title;
      sec.appendChild(h);
      g.items.forEach(function (label, idx) {
        var id = g.title + "::" + idx;
        var row = document.createElement("label");
        row.className = "cyber-row";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!state[id];
        cb.addEventListener("change", function () {
          state[id] = cb.checked;
          save();
          renderHeader();
        });
        var span = document.createElement("span");
        span.textContent = label;
        row.appendChild(cb);
        row.appendChild(span);
        sec.appendChild(row);
      });
      root.appendChild(sec);
    });
    renderHeader();
  }

  render();
})();
