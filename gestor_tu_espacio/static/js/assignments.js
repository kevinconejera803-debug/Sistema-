(function () {
  var tbody = document.getElementById("assign-tbody");
  var form = document.getElementById("assign-form");
  var emptyEl = document.getElementById("assign-empty");
  var tableScroll = document.querySelector(".mod-uni-table-scroll");
  var toastEl = document.getElementById("uni-toast");
  if (!tbody || !form) return;

  var filter = "all";
  var allRows = [];

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 2800);
  }

  function fmtDue(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return esc(iso.slice(0, 16));
    return d.toLocaleString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function filtered() {
    return allRows.filter(function (a) {
      var st = (a.status || "pendiente").toLowerCase();
      if (filter === "pending") return st !== "entregado";
      if (filter === "done") return st === "entregado";
      return true;
    });
  }

  function updateStats() {
    var pend = allRows.filter(function (a) {
      return (a.status || "pendiente").toLowerCase() !== "entregado";
    });
    var elP = document.getElementById("uni-stat-pending");
    var elN = document.getElementById("uni-stat-next");
    if (elP) elP.textContent = String(pend.length);

    var nextIso = null;
    pend.forEach(function (a) {
      var iso = a.due_iso || "";
      if (!iso) return;
      if (!nextIso || iso.localeCompare(nextIso) < 0) nextIso = iso;
    });
    if (elN) {
      if (!nextIso) elN.textContent = "—";
      else {
        var d = new Date(nextIso);
        elN.textContent = isNaN(d.getTime())
          ? "—"
          : d.toLocaleDateString("es", { day: "numeric", month: "short" }) +
            " · " +
            d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
      }
    }
  }

  function setFilter(next) {
    filter = next;
    document.querySelectorAll(".mod-uni-chip").forEach(function (btn) {
      var f = btn.getAttribute("data-filter");
      btn.classList.toggle("mod-uni-chip--active", f === filter);
    });
    render();
  }

  function render() {
    var rows = filtered();
    tbody.innerHTML = "";
    updateStats();

    if (emptyEl && tableScroll) {
      var showEmpty = rows.length === 0;
      emptyEl.hidden = !showEmpty;
      tableScroll.style.display = showEmpty ? "none" : "";
    }

    rows.forEach(function (a, idx) {
      var tr = document.createElement("tr");
      tr.className = "mod-uni-tr";
      tr.style.animationDelay = Math.min(idx * 0.04, 0.4) + "s";
      var st = (a.status || "pendiente").toLowerCase();
      var pill =
        st === "entregado"
          ? '<span class="mod-pill mod-pill--ok">Entregado</span>'
          : '<span class="mod-pill mod-pill--wait">Pendiente</span>';
      var toggleLabel = st === "entregado" ? "Marcar como pendiente" : "Marcar como entregado";
      var toggleText = st === "entregado" ? "Pendiente" : "Entregado";
      tr.innerHTML =
        "<td>" +
        esc(a.course) +
        "</td><td>" +
        esc(a.title) +
        "</td><td class=\"mod-uni-td-due\">" +
        fmtDue(a.due_iso) +
        "</td><td>" +
        (a.weight != null ? esc(String(a.weight)) + "%" : "—") +
        "</td><td>" +
        pill +
        '</td><td class="mod-uni-td-actions"><button type="button" class="mod-uni-btn mod-uni-btn--ghost assign-toggle" data-id="' +
        esc(String(a.id)) +
        '" title="' +
        esc(toggleLabel) +
        '">' +
        esc(toggleText) +
        '</button> <button type="button" class="mod-uni-btn mod-uni-btn--danger assign-del" data-id="' +
        esc(String(a.id)) +
        '" title="Eliminar">Borrar</button></td>';
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".assign-del").forEach(function (btn) {
      btn.addEventListener("click", function () {
        fetch("/api/assignments/" + btn.getAttribute("data-id"), { method: "DELETE" }).then(function (r) {
          if (r.ok) toast("Entrega eliminada.");
          load();
        });
      });
    });
    tbody.querySelectorAll(".assign-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        fetch("/api/assignments")
          .then(function (r) {
            return r.json();
          })
          .then(function (rows2) {
            var row = rows2.find(function (x) {
              return String(x.id) === String(id);
            });
            if (!row) return;
            var next = (row.status || "").toLowerCase() === "entregado" ? "pendiente" : "entregado";
            fetch("/api/assignments/" + id, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: next }),
            }).then(function (r) {
              if (r.ok) toast(next === "entregado" ? "Marcado como entregado." : "Marcado como pendiente.");
              load();
            });
          });
      });
    });
  }

  function load() {
    fetch("/api/assignments")
      .then(function (r) {
        return r.json();
      })
      .then(function (rows) {
        rows.sort(function (a, b) {
          return (a.due_iso || "").localeCompare(b.due_iso || "");
        });
        allRows = rows;
        render();
      })
      .catch(function () {
        allRows = [];
        render();
        toast("No se pudieron cargar las entregas.");
      });
  }

  document.querySelectorAll(".mod-uni-chip").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      if (f) setFilter(f);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var course = document.getElementById("af-course").value.trim();
    var title = document.getElementById("af-title").value.trim();
    var due = document.getElementById("af-due").value;
    var weight = parseInt(document.getElementById("af-weight").value, 10) || 0;
    if (!course || !title || !due) return;
    var iso = new Date(due).toISOString();
    fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course: course,
        title: title,
        due_iso: iso,
        status: "pendiente",
        weight: weight,
      }),
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        var w = document.getElementById("af-weight");
        if (w) w.value = "10";
        filter = "all";
        document.querySelectorAll(".mod-uni-chip").forEach(function (btn) {
          btn.classList.toggle("mod-uni-chip--active", btn.getAttribute("data-filter") === "all");
        });
        toast("Entrega registrada correctamente.");
        load();
      } else toast("No se pudo guardar la entrega.");
    });
  });

  load();
})();
