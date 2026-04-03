(function () {
  var root = document.getElementById("cyber-root");
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
  ];

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function render() {
    root.innerHTML = "";
    groups.forEach(function (g) {
      var sec = document.createElement("div");
      sec.className = "cyber-cat";
      sec.innerHTML = "<h4>" + g.title + "</h4>";
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
        });
        var span = document.createElement("span");
        span.textContent = label;
        row.appendChild(cb);
        row.appendChild(span);
        sec.appendChild(row);
      });
      root.appendChild(sec);
    });
  }

  render();
})();
