(function () {
  var ta = document.getElementById("tool-text");
  var qrOut = document.getElementById("qr-canvas-wrap");
  var tabs = document.querySelectorAll(".tool-tab");
  var panels = document.querySelectorAll(".tool-panel");
  var toastEl = document.getElementById("tool-toast");

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 2600);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-panel");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("mod-btn--active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach(function (p) {
        var show = p.id === "panel-" + id;
        p.hidden = !show;
        p.classList.toggle("tool-panel--active", show);
      });
    });
  });

  document.getElementById("btn-qr") &&
    document.getElementById("btn-qr").addEventListener("click", function () {
      var text = (ta && ta.value) || "Tu espacio";
      var url =
        "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=" +
        encodeURIComponent(text);
      qrOut.innerHTML = "";
      var img = document.createElement("img");
      img.src = url;
      img.alt = "Código QR";
      img.width = 220;
      img.height = 220;
      img.onload = function () {
        toast("QR generado.");
      };
      img.onerror = function () {
        toast("No se pudo cargar la imagen del QR. Revisa la red.");
      };
      qrOut.appendChild(img);
    });

  document.getElementById("btn-copy") &&
    document.getElementById("btn-copy").addEventListener("click", function () {
      if (!ta) return;
      var text = ta.value || "";
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            toast("Copiado al portapapeles.");
          },
          function () {
            fallbackCopy();
          }
        );
      } else {
        fallbackCopy();
      }
      function fallbackCopy() {
        ta.select();
        try {
          document.execCommand("copy");
          toast("Copiado al portapapeles.");
        } catch (e) {
          toast("No se pudo copiar. Selecciona el texto manualmente.");
        }
      }
    });

  document.getElementById("btn-download-txt") &&
    document.getElementById("btn-download-txt").addEventListener("click", function () {
      var blob = new Blob([(ta && ta.value) || ""], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tu-espacio-export.txt";
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Archivo descargado.");
    });
})();
