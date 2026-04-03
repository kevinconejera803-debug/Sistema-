(function () {
  var inp = document.getElementById("search-q");
  var out = document.getElementById("search-results");
  if (!inp || !out) return;

  var tmo = null;
  function run() {
    var q = inp.value.trim();
    if (q.length < 2) {
      out.innerHTML = '<p style="color:var(--muted);">Escribe al menos 2 caracteres.</p>';
      return;
    }
    fetch("/api/search?q=" + encodeURIComponent(q))
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        out.innerHTML = "";
        function block(title, arr, fn) {
          if (!arr || !arr.length) return;
          var h = document.createElement("div");
          h.className = "search-section";
          h.innerHTML = "<h4>" + title + "</h4>";
          arr.forEach(function (item) {
            var d = document.createElement("div");
            d.className = "search-hit";
            d.innerHTML = fn(item);
            h.appendChild(d);
          });
          out.appendChild(h);
        }
        block("EVENTOS", data.events, function (e) {
          return "<strong>" + (e.title || "") + "</strong> · " + (e.start_iso || "").replace("T", " ").slice(0, 16);
        });
        block("CONTACTOS", data.contacts, function (c) {
          return "<strong>" + (c.name || "") + "</strong> · " + (c.email || "") + " " + (c.company || "");
        });
        block("ENTREGAS", data.assignments, function (a) {
          return "<strong>" + (a.title || "") + "</strong> · " + (a.course || "") + " · " + (a.due_iso || "").slice(0, 10);
        });
        if (!out.children.length)
          out.innerHTML = '<p style="color:var(--muted);">Sin resultados.</p>';
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
