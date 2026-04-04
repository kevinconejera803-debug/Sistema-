(function () {
  /** Si el HTML vino de caché antiguo, quita enlaces al módulo retirado. */
  function stripRemovedCalcLinks() {
    document.querySelectorAll('a[href*="calculadora"]').forEach(function (el) {
      el.remove();
    });
  }

  /** Solo debe quedar TU ESPACIO en la barra izquierda; el resto de módulos va por las tarjetas. */
  function stripSidebarModuleLinks() {
    var nav = document.querySelector(".sidebar-left nav.nav-main");
    if (!nav) return;
    nav.querySelectorAll("a").forEach(function (a) {
      var t = (a.textContent || "").replace(/\s+/g, " ").trim();
      if (t !== "TU ESPACIO") {
        a.remove();
      }
    });
  }

  function runSidebarFixes() {
    stripRemovedCalcLinks();
    stripSidebarModuleLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runSidebarFixes);
  } else {
    runSidebarFixes();
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tick() {
    var elTime = document.getElementById("clock-time");
    var elDate = document.getElementById("clock-date");
    if (!elTime || !elDate) return;

    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();

    var days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    var months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    elTime.textContent = pad(h) + ":" + pad(m);
    elDate.textContent =
      days[now.getDay()] +
      ", " +
      now.getDate() +
      " de " +
      months[now.getMonth()] +
      " " +
      now.getFullYear();
  }

  tick();
  setInterval(tick, 1000);
})();
