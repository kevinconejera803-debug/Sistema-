(function () {
  var grid = document.getElementById("news-grid");
  var btn = document.getElementById("news-refresh-btn");
  var statusEl = document.getElementById("news-status");
  var emptyEl = document.getElementById("news-empty");
  if (!grid || !btn) return;

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderItem(it) {
    var art = document.createElement("article");
    art.className = "news-card";
    var src = document.createElement("span");
    src.className = "news-card__src";
    src.textContent = it.source || "";
    art.appendChild(src);
    var h = document.createElement("h3");
    h.className = "news-card__title";
    var a = document.createElement("a");
    a.href = it.link || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = it.title || "";
    h.appendChild(a);
    art.appendChild(h);
    if (it.published) {
      var meta = document.createElement("div");
      meta.className = "news-card__meta";
      meta.textContent = it.published;
      art.appendChild(meta);
    }
    if (it.summary) {
      var p = document.createElement("p");
      p.className = "news-card__sum";
      p.textContent = it.summary;
      art.appendChild(p);
    }
    return art;
  }

  function setLoading(on) {
    if (statusEl) statusEl.textContent = on ? "Actualizando feeds…" : "";
    btn.disabled = !!on;
  }

  function refresh() {
    setLoading(true);
    fetch("/api/news?refresh=1")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var items = (data && data.items) || [];
        grid.innerHTML = "";
        items.forEach(function (it) {
          grid.appendChild(renderItem(it));
        });
        if (emptyEl) {
          emptyEl.hidden = items.length > 0;
          if (!items.length) emptyEl.textContent = "No hay titulares ahora. Revisa la conexión o inténtalo más tarde.";
        }
        if (statusEl) {
          var t = new Date();
          statusEl.textContent =
            items.length + " artículos · " + t.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
        }
      })
      .catch(function () {
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = "No se pudieron cargar los feeds. Comprueba la red e inténtalo de nuevo.";
        }
        if (statusEl) statusEl.textContent = "";
      })
      .finally(function () {
        setLoading(false);
      });
  }

  btn.addEventListener("click", refresh);
})();
