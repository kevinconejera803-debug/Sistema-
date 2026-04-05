(function () {
  var grid = document.getElementById("contact-grid");
  var form = document.getElementById("contact-form");
  var cfId = document.getElementById("cf-id");
  var btnCancel = document.getElementById("cf-cancel");
  var submitBtn = document.getElementById("cf-submit");
  var filterInp = document.getElementById("cf-filter");
  var countEl = document.getElementById("contact-count");
  var emptyEl = document.getElementById("contact-empty");
  var toastEl = document.getElementById("contact-toast");
  if (!grid || !form) return;

  var allRows = [];

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 2600);
  }

  function setEditMode(on) {
    if (submitBtn) submitBtn.textContent = on ? "Actualizar contacto" : "Guardar contacto";
    if (btnCancel) btnCancel.hidden = !on;
  }

  function clearEdit() {
    if (cfId) cfId.value = "";
    form.reset();
    setEditMode(false);
  }

  function matchFilter(c, q) {
    if (!q) return true;
    var s = (q || "").toLowerCase();
    return (
      (c.name && c.name.toLowerCase().indexOf(s) >= 0) ||
      (c.email && c.email.toLowerCase().indexOf(s) >= 0) ||
      (c.company && c.company.toLowerCase().indexOf(s) >= 0) ||
      (c.phone && c.phone.toLowerCase().indexOf(s) >= 0)
    );
  }

  function render() {
    var q = (filterInp && filterInp.value.trim()) || "";
    var rows = allRows.filter(function (c) {
      return matchFilter(c, q);
    });
    grid.innerHTML = "";
    if (countEl) countEl.textContent = rows.length ? rows.length + " visibles" : "";
    if (emptyEl) emptyEl.hidden = rows.length > 0 || allRows.length === 0;
    if (allRows.length === 0 && emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Aún no hay contactos. Usa el formulario de arriba.";
    } else if (rows.length === 0 && allRows.length > 0 && emptyEl) {
      emptyEl.hidden = false;
      emptyEl.textContent = "Ningún contacto coincide con el filtro.";
    }

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
      ed.textContent = "Editar";
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
      del.textContent = "Eliminar";
      del.addEventListener("click", function () {
        fetch("/api/contacts/" + c.id, { method: "DELETE" }).then(function (r) {
          if (r.ok) toast("Contacto eliminado.");
          load();
        });
      });
      act.appendChild(ed);
      act.appendChild(del);
      card.appendChild(act);
      grid.appendChild(card);
    });
  }

  function load() {
    fetch("/api/contacts")
      .then(function (r) {
        return r.json();
      })
      .then(function (rows) {
        allRows = rows;
        render();
      })
      .catch(function () {
        toast("No se pudieron cargar los contactos.");
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
    }).then(function (r) {
      if (r.ok) {
        toast(id ? "Contacto actualizado." : "Contacto guardado.");
        clearEdit();
        load();
      } else toast("No se pudo guardar.");
    });
  });

  if (btnCancel) {
    btnCancel.addEventListener("click", function () {
      clearEdit();
    });
  }

  if (filterInp) {
    filterInp.addEventListener("input", function () {
      render();
    });
  }

  load();
})();
