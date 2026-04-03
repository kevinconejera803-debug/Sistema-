(function () {
  var sk = document.getElementById("trading-skeleton");
  var live = document.getElementById("trading-live");
  var err = document.getElementById("trading-error");
  var strip = document.getElementById("trading-strip");
  var tbody = document.getElementById("trading-tbody");
  var status = document.getElementById("trading-status");
  var btn = document.getElementById("trading-refresh");
  var toastEl = document.getElementById("trade-toast");
  if (!strip || !tbody) return;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 3400);
  }

  function render(rows) {
    strip.innerHTML = "";
    tbody.innerHTML = "";
    rows.forEach(function (r) {
      var chip = document.createElement("span");
      chip.className = "trade-chip";
      var up = !r.error && r.chg_pct !== undefined && r.chg_pct >= 0;
      var chgCls = r.error ? "trade-neutral" : up ? "up" : "down";
      chip.innerHTML =
        r.symbol +
        " <strong>" +
        (r.price_fmt || "—") +
        '</strong> <span class="' +
        chgCls +
        '">' +
        (r.chg_fmt || "") +
        "</span>";
      strip.appendChild(chip);

      var tr = document.createElement("tr");
      var tdCls = r.error ? "trade-neutral" : up ? "up" : "down";
      tr.innerHTML =
        "<td><strong>" +
        r.symbol +
        "</strong></td><td>" +
        (r.price_fmt || "—") +
        '</td><td><span class="' +
        tdCls +
        '">' +
        (r.chg_fmt || "—") +
        "</span></td>";
      tbody.appendChild(tr);
    });
  }

  function load(refresh) {
    if (status) status.textContent = "Obteniendo cotizaciones…";
    if (sk) sk.hidden = false;
    if (live) live.hidden = true;
    if (err) err.hidden = true;
    var url = "/api/trading" + (refresh ? "?refresh=1" : "");
    fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var rows = (data && data.rows) || [];
        if (sk) sk.hidden = true;
        if (live) live.hidden = false;
        render(rows);
        if (status) {
          var t = new Date();
          status.textContent =
            "Actualizado " + t.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
        }
        var ok = rows.some(function (r) {
          return !r.error;
        });
        if (refresh && ok) toast("Datos de mercado actualizados.");
      })
      .catch(function () {
        if (sk) sk.hidden = true;
        if (live) live.hidden = true;
        if (err) {
          err.hidden = false;
          err.textContent =
            "No se pudieron cargar los datos. Revisa la conexión y pulsa Actualizar.";
        }
        if (status) status.textContent = "";
        toast("Error de red al obtener cotizaciones.");
      });
  }

  if (btn) btn.addEventListener("click", function () {
    load(true);
  });
  load(false);
})();
