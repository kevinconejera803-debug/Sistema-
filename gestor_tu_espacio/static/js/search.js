(function () {
  var inp = document.getElementById("search-q");
  var out = document.getElementById("search-results");
  var meta = document.getElementById("search-meta");
  if (!inp || !out) return;

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function highlight(text, q) {
    if (!q || !text) return esc(text);
    var low = String(text).toLowerCase();
    var qi = low.indexOf(q.toLowerCase());
    if (qi < 0) return esc(text);
    var a = esc(text.slice(0, qi));
    var b = esc(text.slice(qi, qi + q.length));
    var c = esc(text.slice(qi + q.length));
    return a + "<mark>" + b + "</mark>" + c;
  }

  var tmo = null;
  function run() {
    var q = inp.value.trim();
    if (q.length < 2) {
      out.innerHTML = '<p class="search-hint">Escribe al menos 2 caracteres.</p>';
      if (meta) meta.textContent = "";
      return;
    }
    fetch("/api/search?q=" + encodeURIComponent(q))
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        out.innerHTML = "";
        var total = 0;
        function block(title, icon, arr, fn) {
          if (!arr || !arr.length) return;
          total += arr.length;
          var h = document.createElement("div");
          h.className = "search-section";
          var ht = document.createElement("h4");
          ht.className = "search-section__title";
          ht.innerHTML = '<span class="search-section__icon" aria-hidden="true">' + icon + "</span> " + esc(title);
          h.appendChild(ht);
          arr.forEach(function (item) {
            var d = document.createElement("div");
            d.className = "search-hit";
            d.innerHTML = fn(item, q);
            h.appendChild(d);
          });
          out.appendChild(h);
        }
        block(
          "Eventos",
          "🕐",
          data.events,
          function (e, qq) {
            var line = (e.title || "") + " · " + (e.start_iso || "").replace("T", " ").slice(0, 16);
            return highlight(line, qq);
          }
        );
        block(
          "Contactos",
          "✉",
          data.contacts,
          function (c, qq) {
            var line = (c.name || "") + " · " + (c.email || "") + " " + (c.company || "");
            return highlight(line, qq);
          }
        );
        block(
          "Entregas",
          "🎓",
          data.assignments,
          function (a, qq) {
            var line =
              (a.title || "") + " · " + (a.course || "") + " · " + (a.due_iso || "").slice(0, 10);
            return highlight(line, qq);
          }
        );
        if (meta) meta.textContent = total ? total + " resultado" + (total === 1 ? "" : "s") : "";
        if (!out.children.length)
          out.innerHTML = '<p class="search-hint">Sin resultados para «' + esc(q) + "».</p>";
        if (meta && !total) meta.textContent = "Sin resultados";
      })
      .catch(function () {
        out.innerHTML = '<p class="search-hint">Error al buscar. Intenta de nuevo.</p>';
        if (meta) meta.textContent = "";
      });
  }

  inp.addEventListener("input", function () {
    clearTimeout(tmo);
    tmo = setTimeout(run, 280);
  });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "Enter") run();
  });
})();
