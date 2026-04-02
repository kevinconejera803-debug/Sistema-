(function () {
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
