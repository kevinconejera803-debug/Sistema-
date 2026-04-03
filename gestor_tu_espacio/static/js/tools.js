(function () {
  var ta = document.getElementById("tool-text");
  var qrOut = document.getElementById("qr-canvas-wrap");
  var tabs = document.querySelectorAll(".tool-tab");
  var panels = document.querySelectorAll(".tool-panel");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var id = tab.getAttribute("data-panel");
      tabs.forEach(function (t) {
        t.classList.toggle("mod-btn--active", t === tab);
      });
      panels.forEach(function (p) {
        p.style.display = p.id === "panel-" + id ? "block" : "none";
      });
    });
  });

  document.getElementById("btn-qr") &&
    document.getElementById("btn-qr").addEventListener("click", function () {
      var text = (ta && ta.value) || "SYSTEM INTERFACE";
      var url =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=" +
        encodeURIComponent(text);
      qrOut.innerHTML = "";
      var img = document.createElement("img");
      img.src = url;
      img.alt = "QR";
      img.width = 200;
      img.height = 200;
      qrOut.appendChild(img);
    });

  document.getElementById("btn-copy") &&
    document.getElementById("btn-copy").addEventListener("click", function () {
      if (!ta) return;
      ta.select();
      document.execCommand("copy");
    });

  document.getElementById("btn-download-txt") &&
    document.getElementById("btn-download-txt").addEventListener("click", function () {
      var blob = new Blob([(ta && ta.value) || ""], { type: "text/plain;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "export-tu-espacio.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    });
})();
