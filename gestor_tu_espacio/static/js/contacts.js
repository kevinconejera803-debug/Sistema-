(function () {
  var grid = document.getElementById("contact-grid");
  var form = document.getElementById("contact-form");
  var cfId = document.getElementById("cf-id");
  var btnCancel = document.getElementById("cf-cancel");
  var submitBtn = document.getElementById("cf-submit");
  if (!grid || !form) return;

  function setEditMode(on) {
    if (submitBtn) submitBtn.textContent = on ? "ACTUALIZAR CONTACTO" : "GUARDAR CONTACTO";
    if (btnCancel) btnCancel.hidden = !on;
  }

  function clearEdit() {
    if (cfId) cfId.value = "";
    form.reset();
    setEditMode(false);
  }

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
          var h = document.createElement("h4");
          h.textContent = c.name || "";
          card.appendChild(h);
          if (c.company) {
            var p = document.createElement("p");
            p.textContent = "Empresa · " + c.company;
            card.appendChild(p);
          }
          if (c.email) {
            var pe = document.createElement("p");
            pe.textContent = c.email;
            card.appendChild(pe);
          }
          if (c.phone) {
            var pp = document.createElement("p");
            pp.textContent = c.phone;
            card.appendChild(pp);
          }
          if (c.notes) {
            var pn = document.createElement("p");
            pn.style.fontSize = "0.78rem";
            pn.textContent = c.notes;
            card.appendChild(pn);
          }
          var act = document.createElement("div");
          act.className = "contact-card__actions";
          var ed = document.createElement("button");
          ed.type = "button";
          ed.className = "mod-btn mod-btn--ghost";
          ed.textContent = "EDITAR";
          ed.addEventListener("click", function () {
            document.getElementById("cf-name").value = c.name || "";
            document.getElementById("cf-email").value = c.email || "";
            document.getElementById("cf-phone").value = c.phone || "";
            document.getElementById("cf-company").value = c.company || "";
            document.getElementById("cf-notes").value = c.notes || "";
            if (cfId) cfId.value = c.id;
            setEditMode(true);
            form.scrollIntoView({ behavior: "smooth", block: "nearest" });
          });
          var del = document.createElement("button");
          del.type = "button";
          del.className = "mod-btn mod-btn--ghost";
          del.textContent = "ELIMINAR";
          del.addEventListener("click", function () {
            fetch("/api/contacts/" + c.id, { method: "DELETE" }).then(load);
          });
          act.appendChild(ed);
          act.appendChild(del);
          card.appendChild(act);
          grid.appendChild(card);
        });
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("cf-name").value.trim();
    if (!name) return;
    var payload = {
      name: name,
      email: document.getElementById("cf-email").value.trim(),
      phone: document.getElementById("cf-phone").value.trim(),
      company: document.getElementById("cf-company").value.trim(),
      notes: document.getElementById("cf-notes").value.trim(),
    };
    var id = cfId && cfId.value;
    var url = id ? "/api/contacts/" + id : "/api/contacts";
    var method = id ? "PUT" : "POST";
    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function () {
      clearEdit();
      load();
    });
  });

  if (btnCancel) {
    btnCancel.addEventListener("click", function () {
      clearEdit();
    });
  }

  load();
})();
