(function () {
  var monthLabel = document.getElementById("cal-month-label");
  var grid = document.getElementById("cal-cells");
  var eventList = document.getElementById("cal-event-list");
  var form = document.getElementById("cal-event-form");
  var titleInput = document.getElementById("cal-title");
  var startInput = document.getElementById("cal-start");
  var notesInput = document.getElementById("cal-notes");
  var colorSel = document.getElementById("cal-color");
  var monthBlock = document.getElementById("cal-month-block");
  var weekBlock = document.getElementById("cal-week-block");
  var weekStrip = document.getElementById("cal-week-strip");
  var btnMonth = document.getElementById("cal-view-month");
  var btnWeek = document.getElementById("cal-view-week");
  var toastEl = document.getElementById("cal-toast");

  if (!grid || !monthLabel) return;

  var viewDate = new Date();
  viewDate.setDate(1);
  var selectedDay = new Date();
  var events = [];
  var viewMode = "month";
  var weekMonday = mondayOf(new Date());

  function mondayOf(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function isoDay(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 3400);
  }

  function loadEvents() {
    fetch("/api/calendar/events")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        events = data;
        render();
      })
      .catch(function () {
        events = [];
        toast("No se pudieron cargar los eventos.");
        render();
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

  function setViewButtons() {
    if (btnMonth) {
      btnMonth.classList.toggle("mod-btn--active", viewMode === "month");
      btnMonth.setAttribute("aria-pressed", viewMode === "month" ? "true" : "false");
    }
    if (btnWeek) {
      btnWeek.classList.toggle("mod-btn--active", viewMode === "week");
      btnWeek.setAttribute("aria-pressed", viewMode === "week" ? "true" : "false");
    }
    if (monthBlock) monthBlock.hidden = viewMode !== "month";
    if (weekBlock) weekBlock.hidden = viewMode !== "week";
  }

  function render() {
    setViewButtons();
    if (viewMode === "week") {
      renderWeek();
    } else {
      renderMonth();
    }
    renderDayList();
    updateRangeLabel();
  }

  function updateRangeLabel() {
    if (viewMode === "week") {
      var end = new Date(weekMonday);
      end.setDate(end.getDate() + 6);
      var mo = [
        "ENE",
        "FEB",
        "MAR",
        "ABR",
        "MAY",
        "JUN",
        "JUL",
        "AGO",
        "SEP",
        "OCT",
        "NOV",
        "DIC",
      ];
      monthLabel.textContent =
        "SEM · " +
        weekMonday.getDate() +
        "–" +
        end.getDate() +
        " " +
        mo[weekMonday.getMonth()] +
        " " +
        weekMonday.getFullYear();
    }
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
        cell.setAttribute("role", "button");
        cell.tabIndex = 0;
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
        function selectDay() {
          selectedDay = cellDate;
          weekMonday = mondayOf(selectedDay);
          Array.prototype.forEach.call(grid.querySelectorAll(".mod-cal__cell--selected"), function (el) {
            el.classList.remove("mod-cal__cell--selected");
          });
          cell.classList.add("mod-cal__cell--selected");
          if (startInput) startInput.value = diso + "T09:00";
          renderDayList();
          if (viewMode === "week") renderWeek();
        }
        cell.addEventListener("click", selectDay);
        cell.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectDay();
          }
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

  function renderWeek() {
    if (!weekStrip) return;
    weekStrip.innerHTML = "";
    var todayIso = isoDay(new Date());
    var wd = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    for (var i = 0; i < 7; i++) {
      (function (ii) {
        var d = new Date(weekMonday.getFullYear(), weekMonday.getMonth(), weekMonday.getDate() + ii);
        var diso = isoDay(d);
        var cell = document.createElement("div");
        cell.className = "mod-cal-week__cell";
        if (diso === todayIso) cell.classList.add("mod-cal__cell--today");
        if (diso === isoDay(selectedDay)) cell.classList.add("mod-cal__cell--selected");
        cell.setAttribute("role", "button");
        cell.tabIndex = 0;
        var evs = eventsForDay(diso);
        var dots = document.createElement("div");
        dots.className = "mod-cal__dots";
        evs.slice(0, 4).forEach(function (ev) {
          var dot = document.createElement("span");
          dot.className = "mod-cal__dot " + dotClass(ev.color);
          dots.appendChild(dot);
        });
        cell.innerHTML =
          '<span class="mod-cal-week__wd">' +
          wd[ii] +
          '</span><span class="mod-cal-week__num">' +
          d.getDate() +
          "</span>";
        cell.appendChild(dots);
        function sel() {
          selectedDay = d;
          weekMonday = mondayOf(selectedDay);
          if (startInput) startInput.value = diso + "T09:00";
          Array.prototype.forEach.call(weekStrip.querySelectorAll(".mod-cal-week__cell"), function (el) {
            el.classList.remove("mod-cal__cell--selected");
          });
          cell.classList.add("mod-cal__cell--selected");
          renderDayList();
        }
        cell.addEventListener("click", sel);
        cell.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sel();
          }
        });
        weekStrip.appendChild(cell);
      })(i);
    }
    updateRangeLabel();
  }

  function renderDayList() {
    if (!eventList) return;
    var diso = isoDay(selectedDay);
    var evs = eventsForDay(diso);
    eventList.innerHTML = "";
    if (evs.length === 0) {
      eventList.innerHTML =
        '<li class="mod-cal__empty">Sin eventos este día.</li>';
      return;
    }
    evs.forEach(function (ev) {
      var li = document.createElement("li");
      li.className = "mod-cal__event-row";
      var t = (ev.start_iso || "").split("T")[1] || "";
      if (t) t = t.slice(0, 5);
      var main = document.createElement("div");
      var st = document.createElement("strong");
      st.textContent = ev.title || "";
      main.appendChild(st);
      main.appendChild(document.createElement("br"));
      var sp = document.createElement("span");
      sp.className = "mod-cal__event-time";
      sp.textContent = t || "Todo el día";
      main.appendChild(sp);
      var del = document.createElement("button");
      del.type = "button";
      del.className = "mod-btn mod-btn--ghost mod-cal__del";
      del.textContent = "Borrar";
      del.addEventListener("click", function () {
        fetch("/api/calendar/events/" + ev.id, { method: "DELETE" })
          .then(function (r) {
            if (!r.ok) throw new Error();
            loadEvents();
          })
          .catch(function () {
            toast("No se pudo borrar el evento.");
          });
      });
      li.appendChild(main);
      li.appendChild(del);
      eventList.appendChild(li);
    });
  }

  document.getElementById("cal-prev") &&
    document.getElementById("cal-prev").addEventListener("click", function () {
      if (viewMode === "week") weekMonday.setDate(weekMonday.getDate() - 7);
      else viewDate.setMonth(viewDate.getMonth() - 1);
      render();
    });
  document.getElementById("cal-next") &&
    document.getElementById("cal-next").addEventListener("click", function () {
      if (viewMode === "week") weekMonday.setDate(weekMonday.getDate() + 7);
      else viewDate.setMonth(viewDate.getMonth() + 1);
      render();
    });
  document.getElementById("cal-today") &&
    document.getElementById("cal-today").addEventListener("click", function () {
      selectedDay = new Date();
      weekMonday = mondayOf(selectedDay);
      viewDate = new Date();
      viewDate.setDate(1);
      render();
      if (startInput) startInput.value = isoDay(selectedDay) + "T09:00";
    });

  if (btnMonth) {
    btnMonth.addEventListener("click", function () {
      viewMode = "month";
      viewDate = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1);
      render();
    });
  }
  if (btnWeek) {
    btnWeek.addEventListener("click", function () {
      viewMode = "week";
      weekMonday = mondayOf(selectedDay);
      render();
    });
  }

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
          if (!r.ok) return r.json().then(function (j) {
            throw new Error(j.error || "error");
          });
          return r.json();
        })
        .then(function () {
          titleInput.value = "";
          if (notesInput) notesInput.value = "";
          toast("Evento guardado.");
          loadEvents();
        })
        .catch(function () {
          toast("No se pudo guardar. Revisa los datos.");
        });
    });
  }

  if (startInput && !startInput.value) {
    startInput.value = isoDay(selectedDay) + "T09:00";
  }

  setViewButtons();
  render();
  loadEvents();
})();
