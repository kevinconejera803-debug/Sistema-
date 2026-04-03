(function () {
  var tbody = document.getElementById("assign-tbody");
  var form = document.getElementById("assign-form");
  if (!tbody || !form) return;

  function load() {
    fetch("/api/assignments")
      .then(function (r) {
        return r.json();
      })
      .then(function (rows) {
        tbody.innerHTML = "";
        rows.forEach(function (a) {
          var tr = document.createElement("tr");
          var due = (a.due_iso || "").replace("T", " ").slice(0, 16);
          var st = (a.status || "pendiente").toLowerCase();
          var pill =
            st === "entregado"
              ? '<span class="mod-pill mod-pill--ok">ENTREGADO</span>'
              : '<span class="mod-pill mod-pill--wait">PENDIENTE</span>';
          tr.innerHTML =
            "<td>" +
            (a.course || "") +
            "</td><td>" +
            (a.title || "") +
            "</td><td>" +
            due +
            "</td><td>" +
            (a.weight != null ? a.weight + "%" : "—") +
            "</td><td>" +
            pill +
            '</td><td><button type="button" class="mod-btn mod-btn--ghost assign-del" data-id="' +
            a.id +
            '">ELIMINAR</button> <button type="button" class="mod-btn assign-toggle" data-id="' +
            a.id +
            '">CAMBIAR ESTADO</button></td>';
          tbody.appendChild(tr);
        });
        tbody.querySelectorAll(".assign-del").forEach(function (btn) {
          btn.addEventListener("click", function () {
            fetch("/api/assignments/" + btn.getAttribute("data-id"), { method: "DELETE" }).then(load);
          });
        });
        tbody.querySelectorAll(".assign-toggle").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var id = btn.getAttribute("data-id");
            fetch("/api/assignments")
              .then(function (r) {
                return r.json();
              })
              .then(function (rows) {
                var row = rows.find(function (x) {
                  return String(x.id) === String(id);
                });
                if (!row) return;
                var next = (row.status || "").toLowerCase() === "entregado" ? "pendiente" : "entregado";
                fetch("/api/assignments/" + id, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: next }),
                }).then(load);
              });
          });
        });
      });
  }

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
    }).then(function () {
      form.reset();
      load();
    });
  });

  load();
})();
