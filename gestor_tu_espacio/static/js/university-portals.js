(function () {
  var LS_KEY = "tuEspacioUniLinks";

  var box = document.getElementById("uni-defaults");
  if (!box) return;

  var defIntranet = box.getAttribute("data-intranet") || "";
  var defAula = box.getAttribute("data-aula") || "";

  var linkIn = document.getElementById("uni-link-intranet");
  var linkAu = document.getElementById("uni-link-aula");
  var inpIn = document.getElementById("uni-input-intranet");
  var inpAu = document.getElementById("uni-input-aula");
  var btnSave = document.getElementById("uni-save-links");
  var toastEl = document.getElementById("uni-toast");

  function uniToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(uniToast._t);
    uniToast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 3200);
  }

  function readStored() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function merged(which) {
    var s = readStored();
    if (which === "intranet") return (s.intranet || "").trim() || defIntranet;
    return (s.aula || "").trim() || defAula;
  }

  function apply() {
    var iu = merged("intranet");
    var au = merged("aula");
    if (linkIn) {
      if (iu) {
        linkIn.href = iu;
        linkIn.classList.remove("mod-uni-portal--disabled");
        linkIn.removeAttribute("aria-disabled");
      } else {
        linkIn.href = "#";
        linkIn.classList.add("mod-uni-portal--disabled");
        linkIn.setAttribute("aria-disabled", "true");
      }
    }
    if (linkAu) {
      if (au) {
        linkAu.href = au;
        linkAu.classList.remove("mod-uni-portal--disabled");
        linkAu.removeAttribute("aria-disabled");
      } else {
        linkAu.href = "#";
        linkAu.classList.add("mod-uni-portal--disabled");
        linkAu.setAttribute("aria-disabled", "true");
      }
    }
    if (inpIn && !inpIn.dataset.touched) inpIn.value = iu;
    if (inpAu && !inpAu.dataset.touched) inpAu.value = au;
    if (linkIn) linkIn.classList.toggle("mod-uni-portal--ready", !!iu);
    if (linkAu) linkAu.classList.toggle("mod-uni-portal--ready", !!au);
  }

  function save() {
    var ni = (inpIn && inpIn.value.trim()) || "";
    var na = (inpAu && inpAu.value.trim()) || "";
    localStorage.setItem(LS_KEY, JSON.stringify({ intranet: ni, aula: na }));
    if (inpIn) delete inpIn.dataset.touched;
    if (inpAu) delete inpAu.dataset.touched;
    apply();
    uniToast("Enlaces guardados en este navegador.");
  }

  if (linkIn) {
    linkIn.addEventListener("click", function (e) {
      if (!merged("intranet")) {
        e.preventDefault();
        uniToast("Añade la URL de intranet en «Configurar enlaces».");
        var det = document.getElementById("uni-settings");
        if (det && !det.open) det.open = true;
      }
    });
  }
  if (linkAu) {
    linkAu.addEventListener("click", function (e) {
      if (!merged("aula")) {
        e.preventDefault();
        uniToast("Añade la URL del aula virtual en «Configurar enlaces».");
        var det = document.getElementById("uni-settings");
        if (det && !det.open) det.open = true;
      }
    });
  }

  if (inpIn) {
    inpIn.addEventListener("input", function () {
      inpIn.dataset.touched = "1";
    });
  }
  if (inpAu) {
    inpAu.addEventListener("input", function () {
      inpAu.dataset.touched = "1";
    });
  }

  if (btnSave) {
    btnSave.addEventListener("click", save);
  }

  apply();
})();
