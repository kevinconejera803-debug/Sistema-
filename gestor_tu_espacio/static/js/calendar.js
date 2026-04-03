(function () {
  var monthLabel = document.getElementById("cal-month-label");
  var grid = document.getElementById("cal-cells");
  var eventList = document.getElementById("cal-event-list");
  var form = document.getElementById("cal-event-form");
  var titleInput = document.getElementById("cal-title");
  var startInput = document.getElementById("cal-start");
  var notesInput = document.getElementById("cal-notes");
  var colorSel = document.getElementById("cal-color");

  if (!grid || !monthLabel) return;

  var viewDate = new Date();
  viewDate.setDate(1);
  var selectedDay = new Date();
  var events = [];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function isoDay(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseIsoDate(s) {
    var p = s.split("T")[0].split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function loadEvents() {
    fetch("/api/calendar/events")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        events = data;
        renderMonth();
        renderDayList();
      })
      .catch(function () {
        events = [];
        renderMonth();
      });
  }

  function eventsForDay(dayIso) {
    return events.filter(function (ev) {
      return (ev.start_iso || "").split("T")[0] === dayIso;
    });
  }

  function dotClass(color) {
    var c = (color || "teal").toLowerCase();
    if (c === "yellow") return "mod-cal__dot--yellow";
    if (c === "purple") return "mod-cal__dot--purple";
    if (c === "red") return "mod-cal__dot--red";
    return "mod-cal__dot--teal";
  }

  function renderMonth() {
    var y = viewDate.getFullYear();
    var m = viewDate.getMonth();
    var names = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ];
    monthLabel.textContent = names[m] + " · " + y;

    var first = new Date(y, m, 1);
    var startPad = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();

    grid.innerHTML = "";
    var todayIso = isoDay(new Date());

    var i;
    for (i = 0; i < startPad; i++) {
      var dnum = prevDays - startPad + i + 1;
      var cell = document.createElement("div");
      cell.className = "mod-cal__cell mod-cal__cell--muted";
      cell.innerHTML = '<span class="mod-cal__day-num">' + dnum + "</span>";
      grid.appendChild(cell);
    }

    for (var day = 1; day <= daysInMonth; day++) {
      (function (dd) {
        var cellDate = new Date(y, m, dd);
        var diso = isoDay(cellDate);
        var cell = document.createElement("div");
        cell.className = "mod-cal__cell";
        if (diso === todayIso) cell.classList.add("mod-cal__cell--today");
        if (diso === isoDay(selectedDay)) cell.classList.add("mod-cal__cell--selected");

        var evs = eventsForDay(diso);
        var dots = document.createElement("div");
        dots.className = "mod-cal__dots";
        evs.slice(0, 5).forEach(function (ev) {
          var dot = document.createElement("span");
          dot.className = "mod-cal__dot " + dotClass(ev.color);
          dots.appendChild(dot);
        });

        cell.innerHTML = '<span class="mod-cal__day-num">' + dd + "</span>";
        cell.appendChild(dots);
        cell.addEventListener("click", function () {
          selectedDay = cellDate;
          Array.prototype.forEach.call(grid.querySelectorAll(".mod-cal__cell--selected"), function (el) {
            el.classList.remove("mod-cal__cell--selected");
          });
          cell.classList.add("mod-cal__cell--selected");
          if (startInput) startInput.value = diso + "T09:00";
          renderDayList();
        });
        grid.appendChild(cell);
      })(day);
    }

    var totalCells = startPad + daysInMonth;
    var tail = (7 - (totalCells % 7)) % 7;
    var nextM = 1;
    for (i = 0; i < tail; i++) {
      var cellT = document.createElement("div");
      cellT.className = "mod-cal__cell mod-cal__cell--muted";
      cellT.innerHTML = '<span class="mod-cal__day-num">' + nextM + "</span>";
      nextM++;
      grid.appendChild(cellT);
    }
  }

  function renderDayList() {
    if (!eventList) return;
    var diso = isoDay(selectedDay);
    var evs = eventsForDay(diso);
    eventList.innerHTML = "";
    if (evs.length === 0) {
      eventList.innerHTML = '<li style="color:var(--muted);font-size:0.85rem;">Sin eventos este día.</li>';
      return;
    }
    evs.forEach(function (ev) {
      var li = document.createElement("li");
      var t = (ev.start_iso || "").split("T")[1] || "";
      if (t) t = t.slice(0, 5);
      li.innerHTML =
        "<div><strong>" +
        (ev.title || "") +
        "</strong><br><span style=\"color:var(--muted);font-size:0.78rem;\">" +
        (t || "Todo el día") +
        "</span></div>";
      var del = document.createElement("button");
      del.type = "button";
      del.textContent = "BORRAR";
      del.addEventListener("click", function () {
        fetch("/api/calendar/events/" + ev.id, { method: "DELETE" })
          .then(function () {
            loadEvents();
          });
      });
      li.appendChild(del);
      eventList.appendChild(li);
    });
  }

  document.getElementById("cal-prev") &&
    document.getElementById("cal-prev").addEventListener("click", function () {
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderMonth();
    });
  document.getElementById("cal-next") &&
    document.getElementById("cal-next").addEventListener("click", function () {
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderMonth();
    });
  document.getElementById("cal-today") &&
    document.getElementById("cal-today").addEventListener("click", function () {
      viewDate = new Date();
      viewDate.setDate(1);
      selectedDay = new Date();
      renderMonth();
      if (startInput) startInput.value = isoDay(selectedDay) + "T09:00";
      renderDayList();
    });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var title = (titleInput && titleInput.value.trim()) || "";
      var start = (startInput && startInput.value) || "";
      if (!title || !start) return;
      var iso = new Date(start).toISOString();
      fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          start_iso: iso,
          all_day: false,
          color: (colorSel && colorSel.value) || "teal",
          notes: (notesInput && notesInput.value.trim()) || "",
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function () {
          titleInput.value = "";
          if (notesInput) notesInput.value = "";
          loadEvents();
        });
    });
  }

  if (startInput && !startInput.value) {
    startInput.value = isoDay(selectedDay) + "T09:00";
  }

  loadEvents();
})();
