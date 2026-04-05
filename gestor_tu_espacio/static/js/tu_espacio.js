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

  function stripLegacyInvestigationPanel() {
    var sidebar = document.querySelector(".sidebar-right");
    if (!sidebar) return;

    sidebar.querySelectorAll(".mod-research, .mod-research-panel, .mod-research-summary, .mod-research-search, .research-widget, .research-box, form").forEach(function (el) {
      el.remove();
    });

    sidebar.querySelectorAll("h3, h2, p, label").forEach(function (el) {
      var text = (el.textContent || "").trim().toLowerCase();
      if (text.includes("asistente de investigación") || text.includes("buscar en google") || text.includes("buscar fuentes académicas") || text.includes("investigación profesional") || text.includes("ingresa un término de investigación")) {
        var parent = el.closest("section, article, div, form");
        if (parent) {
          parent.remove();
        }
      }
    });
  }

  function isValidSidebarPanel(panel) {
    if (!panel || !panel.classList.contains("panel")) {
      return false;
    }
    if (panel.classList.contains("quotes")) {
      return true;
    }
    var heading = panel.querySelector("h3") || panel.querySelector("h2");
    if (!heading) {
      return false;
    }
    var title = (heading.textContent || "").trim().toLowerCase();
    return title === "agenda";
  }

  function trimSidebarChildren() {
    var sidebar = document.querySelector(".sidebar-right");
    if (!sidebar) return;

    Array.from(sidebar.children).forEach(function (child) {
      if (child.matches(".status-icons") || child.matches(".clock-box")) {
        return;
      }
      if (child.matches(".panel") && isValidSidebarPanel(child)) {
        return;
      }
      child.remove();
    });
  }

  function runSidebarFixes() {
    stripRemovedCalcLinks();
    stripSidebarModuleLinks();
    stripLegacyInvestigationPanel();
    trimSidebarChildren();
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

  var quotes = [
    {
      text: "La mente que entiende su sombra no teme al vacío.",
      author: "Carl Jung",
      year: "1933",
      theme: "red",
    },
    {
      text: "El ingenio no se demuestra en contestar rápido, sino en formular mejor la pregunta.",
      author: "Blaise Pascal",
      year: "1670",
      theme: "blue",
    },
    {
      text: "El pensamiento oscuro enseña que la verdad no siempre es amable, pero siempre es elegante.",
      author: "Friedrich Nietzsche",
      year: "1886",
      theme: "purple",
    },
    {
      text: "La inspiración llega cuando se crea espacio entre el ruido y la intención.",
      author: "Rainer Maria Rilke",
      year: "1903",
      theme: "gold",
    },
    {
      text: "La filosofía es el arte de vivir con preguntas en lugar de respuestas fáciles.",
      author: "Simone de Beauvoir",
      year: "1949",
      theme: "green",
    },
    {
      text: "La disciplina transforma la intención en hábito y el hábito en legado.",
      author: "James Clear",
      year: "2018",
      theme: "white",
    },
    {
      text: "Donde la mente no se pregunta, la vida se hace automática.",
      author: "Søren Kierkegaard",
      year: "1843",
      theme: "red",
    },
    {
      text: "El cambio empieza cuando la mirada se atreve a salir de su zona conocida.",
      author: "Anaïs Nin",
      year: "1976",
      theme: "gold",
    },
    {
      text: "La claridad no se encuentra en la prisa, sino en la pausa que acepta la complejidad.",
      author: "Virginia Woolf",
      year: "1928",
      theme: "blue",
    },
    {
      text: "La mejor estrategia comienza cuando aprende a perder sin perder la mente.",
      author: "Peter Drucker",
      year: "1954",
      theme: "green",
    },
    {
      text: "Una verdad bien elegida puede ser más poderosa que mil respuestas apresuradas.",
      author: "Carl Sagan",
      year: "1980",
      theme: "purple",
    },
  ];

  var currentQuoteIndex = 0;
  var cards = [];
  for (var i = 0; i < 4; i += 1) {
    cards.push({
      element: document.getElementById("quote-card-" + i),
      text: document.querySelector("#quote-card-" + i + " blockquote"),
      credit: document.querySelector("#quote-card-" + i + " .quote-credit"),
    });
  }

  function updateCards() {
    cards.forEach(function (card, index) {
      if (!card.element || !card.text || !card.credit) return;
      var quote = quotes[(currentQuoteIndex + index) % quotes.length];
      card.element.className = "quote-block quote-theme--" + quote.theme;
      card.text.textContent = quote.text;
      card.credit.textContent = "— " + quote.author + " · " + quote.year;
    });
  }

  function animateCards() {
    cards.forEach(function (card) {
      if (!card.element) return;
      card.element.classList.add("fade-out");
      card.element.classList.remove("fade-in");
    });

    setTimeout(function () {
      currentQuoteIndex = (currentQuoteIndex + 4) % quotes.length;
      updateCards();
      cards.forEach(function (card) {
        if (!card.element) return;
        card.element.classList.remove("fade-out");
        card.element.classList.add("fade-in");
      });
      setTimeout(function () {
        cards.forEach(function (card) {
          if (!card.element) return;
          card.element.classList.remove("fade-in");
        });
      }, 450);
    }, 450);
  }

  function startQuoteRotation() {
    updateCards();
    setInterval(animateCards, 9000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      runSidebarFixes();
      startQuoteRotation();
    });
  } else {
    runSidebarFixes();
    startQuoteRotation();
  }
})();
