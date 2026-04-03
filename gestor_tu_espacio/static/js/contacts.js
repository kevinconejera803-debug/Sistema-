(function () {
  var grid = document.getElementById("contact-grid");
  var form = document.getElementById("contact-form");
  if (!grid || !form) return;

  function load() {
    fetch("/api/contacts")
      .then(function (r) {
        return r.json();
      })
      .then(function (rows) {
        grid.innerHTML = "";
        rows.forEach(function (c) {
          var card = document.createElement("article");
          card.className = "contact-card";
          card.innerHTML =
            "<h4>" +
            (c.name || "") +
            "</h4>" +
            (c.company ? "<p><strong>Empresa</strong> · " + c.company + "</p>" : "") +
            (c.email ? "<p>" + c.email + "</p>" : "") +
            (c.phone ? "<p>" + c.phone + "</p>" : "") +
            (c.notes ? "<p style=\"font-size:0.78rem;\">" + c.notes + "</p>" : "") +
            '<div class="contact-card__actions"><button type="button" class="mod-btn mod-btn--ghost contact-del" data-id="' +
            c.id +
            '">ELIMINAR</button></div>';
          grid.appendChild(card);
        });
        grid.querySelectorAll(".contact-del").forEach(function (btn) {
          btn.addEventListener("click", function () {
            fetch("/api/contacts/" + btn.getAttribute("data-id"), { method: "DELETE" }).then(load);
          });
        });
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cf-name").value.trim();
    if (!name) return;
    fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: document.getElementById("cf-email").value.trim(),
        phone: document.getElementById("cf-phone").value.trim(),
        company: document.getElementById("cf-company").value.trim(),
        notes: document.getElementById("cf-notes").value.trim(),
      }),
    }).then(function () {
      form.reset();
      load();
    });
  });

  load();
})();
