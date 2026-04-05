(function () {
  var grid = document.getElementById("news-grid");
  var btn = document.getElementById("news-refresh-btn");
  var statusEl = document.getElementById("news-status");
  var emptyEl = document.getElementById("news-empty");
  var initialEl = document.getElementById("news-initial");
  var chips = document.querySelectorAll(".news-chip");
  if (!grid || !btn) return;

  var AUTO_MS = 4 * 60 * 1000;
  var autoTimer = null;
  var currentFilter = "all";
  var allItems = [];

  try {
    if (initialEl && initialEl.textContent) {
      allItems = JSON.parse(initialEl.textContent);
    }
  } catch (e) {
    allItems = [];
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function formatPublished(it) {
    if (it.published_iso) {
      try {
        var d = new Date(it.published_iso);
        if (!isNaN(d.getTime())) {
          return (
            d.toLocaleString("es-CL", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "America/Santiago",
            }) + " · hora Chile"
          );
        }
      } catch (e) {}
    }
    if (it.published_label) return it.published_label;
    if (it.published) return it.published;
    return "";
  }

  function renderItem(it, featured) {
    var art = document.createElement("article");
    art.className = "news-card news-card--" + esc(it.region || "internacional");
    if (featured) art.classList.add("news-card--featured");
    art.setAttribute("data-region", it.region || "internacional");
    var top = document.createElement("div");
    top.className = "news-card__top";
    var badge = document.createElement("span");
    badge.className = "news-card__badge";
    badge.textContent = it.region_label || it.region || "";
    var src = document.createElement("span");
    src.className = "news-card__src";
    src.textContent = it.source || "";
    top.appendChild(badge);
    top.appendChild(src);
    art.appendChild(top);
    var h = document.createElement("h3");
    h.className = "news-card__title";
    var a = document.createElement("a");
    a.href = it.link || "#";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = it.title || "";
    h.appendChild(a);
    art.appendChild(h);
    var pubLine = formatPublished(it);
    if (pubLine) {
      var timeWrap = document.createElement("div");
      timeWrap.className = "news-card__time";
      timeWrap.setAttribute("aria-label", "Fecha y hora de publicación");
      var icon = document.createElement("span");
      icon.className = "news-card__time-icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = "🕐";
      var tm = document.createElement("time");
      tm.className = "news-card__time-text";
      if (it.published_iso) tm.setAttribute("datetime", it.published_iso);
      tm.textContent = pubLine;
      timeWrap.appendChild(icon);
      timeWrap.appendChild(tm);
      art.appendChild(timeWrap);
    }
    if (it.summary) {
      var p = document.createElement("p");
      p.className = "news-card__sum";
      p.textContent = it.summary;
      art.appendChild(p);
    }
    return art;
  }

  function filtered() {
    if (currentFilter === "all") return allItems;
    return allItems.filter(function (it) {
      return (it.region || "") === currentFilter;
    });
  }

  function paint() {
    var list = filtered();
    grid.innerHTML = "";
    grid.setAttribute("data-filter", currentFilter);
    grid.classList.toggle("news-grid--featured", currentFilter === "all");
    list.forEach(function (it, idx) {
      grid.appendChild(renderItem(it, currentFilter === "all" && idx === 0));
    });
    if (emptyEl) {
      emptyEl.hidden = list.length > 0;
      if (!list.length) {
        emptyEl.textContent =
          allItems.length === 0
            ? "No hay titulares. Pulsa «Ahora» o revisa la conexión."
            : "Nada en esta categoría. Prueba otro filtro.";
      }
    }
  }

  function setFilter(region) {
    currentFilter = region;
    chips.forEach(function (c) {
      c.classList.toggle("news-chip--active", c.getAttribute("data-region") === region);
    });
    paint();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var r = chip.getAttribute("data-region");
      if (r) setFilter(r);
    });
  });

  function setLoading(on) {
    if (statusEl) statusEl.textContent = on ? "Actualizando…" : "";
    btn.disabled = !!on;
  }

  function fmtFetched(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString("es-CL", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santiago",
      });
    } catch (e) {
      return iso;
    }
  }

  function applyPayload(data) {
    allItems = (data && data.items) || [];
    if (initialEl) initialEl.textContent = JSON.stringify(allItems);
    setFilter("all");
    paint();
    if (statusEl) {
      var extra = "";
      if (data && data.fetched_at) extra = " · Servidor " + fmtFetched(data.fetched_at);
      if (data && data.ttl_seconds) extra += " · caché ~" + data.ttl_seconds + "s";
      statusEl.textContent = allItems.length + " artículos" + extra;
    }
  }

  function refresh() {
    setLoading(true);
    fetch("/api/news?refresh=1")
      .then(function (r) {
        return r.json();
      })
      .then(applyPayload)
      .catch(function () {
        if (emptyEl) {
          emptyEl.hidden = false;
          emptyEl.textContent = "Error de red al actualizar.";
        }
        if (statusEl) statusEl.textContent = "";
      })
      .finally(function () {
        setLoading(false);
      });
  }

  btn.addEventListener("click", refresh);

  function scheduleAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(refresh, AUTO_MS);
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearInterval(autoTimer);
    } else {
      scheduleAuto();
    }
  });

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    scheduleAuto();
  }

  paint();
})();
