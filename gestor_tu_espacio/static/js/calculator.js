/**
 * Calculadora científica — math.js (evaluación, der, integral numérica, lim, sumfrom).
 */
(function () {
  "use strict";

  var exprEl = document.getElementById("sci-expr");
  var resultEl = document.getElementById("sci-result");
  var degLabel = document.getElementById("sci-deg-label");
  var degToggle = document.getElementById("sci-deg-toggle");
  var abcBtn = document.getElementById("sci-abc");
  var katexExprEl = document.getElementById("sci-katex-expr");
  var katexResultEl = document.getElementById("sci-katex-result");
  var stepsBodyEl = document.getElementById("sci-steps-body");

  if (!exprEl || typeof math === "undefined") {
    if (resultEl) resultEl.textContent = "math.js no cargó. Revisa la red.";
    return;
  }

  var PREVIEW_DEBOUNCE_MS = 120;
  var INTEGRAL_MIN_STEPS = 200;
  var INTEGRAL_MAX_STEPS = 8000;

  var ans = 0;
  var useDegrees = false;

  function normalizeExpr(raw) {
    var s = String(raw).trim();
    if (!s) return "";
    s = s.replace(/\r\n/g, "\n");
    s = s.replace(/\u00b7/g, "*");
    s = s.replace(/(\d),(\d)/g, "$1.$2");
    s = s.replace(/(\d+(?:\.\d+)?)\s*%/g, "($1/100)");
    s = s.replace(/\u221b\s*\(/g, "cbrt(");
    s = s.replace(/\u221a\s*\(/g, "sqrt(");
    return s;
  }

  function numericalIntegral(exprStr, varName, a, b) {
    var code = math.compile(exprStr);
    var va = math.number(a);
    var vb = math.number(b);
    if (va === vb) return 0;
    var n = Math.min(INTEGRAL_MAX_STEPS, Math.max(INTEGRAL_MIN_STEPS, Math.ceil(Math.abs(vb - va) * 200)));
    var h = (vb - va) / n;
    var sum = 0;
    var scope = {};
    for (var i = 0; i < n; i++) {
      var t = va + (i + 0.5) * h;
      scope[varName] = t;
      sum += math.number(code.evaluate(scope));
    }
    return sum * h;
  }

  function extractVarName(variable) {
    if (variable == null) return "x";
    if (typeof variable === "string") return variable.replace(/^"|"$/g, "");
    if (variable.name) return variable.name;
    return String(variable);
  }

  function registerCustom() {
    math.import(
      {
        cot: function (x) {
          return 1 / math.tan(x);
        },
        sec: function (x) {
          return 1 / math.cos(x);
        },
        csc: function (x) {
          return 1 / math.sin(x);
        },
        sind: function (x) {
          return math.sin(math.multiply(math.divide(x, 180), math.pi));
        },
        cosd: function (x) {
          return math.cos(math.multiply(math.divide(x, 180), math.pi));
        },
        tand: function (x) {
          return math.tan(math.multiply(math.divide(x, 180), math.pi));
        },
        der: function (expr, variable) {
          var v = extractVarName(variable);
          var node = expr && expr.isNode ? expr : math.parse(String(expr));
          var d = math.derivative(node, v);
          try {
            return math.simplify(d).toString();
          } catch (e1) {
            return d.toString();
          }
        },
        integral: function (exprStr, variable, a, b) {
          var vs = extractVarName(variable);
          var inner = exprStr;
          if (typeof inner === "string") {
            inner = inner.replace(/^["']|["']$/g, "");
          } else {
            inner = String(inner);
          }
          return numericalIntegral(inner, vs, a, b);
        },
        lim: function (expr, variable, point) {
          var vn = extractVarName(variable);
          var code = expr && expr.compile ? expr.compile() : math.compile(String(expr));
          var p = math.number(point);
          var scope = {};
          scope[vn] = p;
          var val;
          try {
            val = code.evaluate(scope);
          } catch (e0) {
            val = NaN;
          }
          var num =
            val != null && typeof val === "object" && val.toNumber
              ? val.toNumber()
              : Number(val);
          if (isFinite(num) && !isNaN(num)) return val;
          var eps = 1e-7;
          scope[vn] = p - eps;
          var left = math.number(code.evaluate(scope));
          scope[vn] = p + eps;
          var right = math.number(code.evaluate(scope));
          return (left + right) / 2;
        },
        sumfrom: function (expr, variable, a, b) {
          var vn = extractVarName(variable);
          var code = expr && expr.compile ? expr.compile() : math.compile(String(expr));
          var ia = math.number(a);
          var ib = math.number(b);
          var sum = 0;
          var scope = {};
          for (var i = ia; i <= ib; i++) {
            scope[vn] = i;
            sum += math.number(code.evaluate(scope));
          }
          return sum;
        },
        diff: function (a, b) {
          return math.subtract(a, b);
        },
      },
      { override: true }
    );
  }

  registerCustom();

  /** Ámbito para evaluate: respeta ans y, si está activo, sin/cos/tan en grados. */
  function buildEvaluateScope() {
    var scope = { ans: ans, pi: math.pi, e: math.e, Infinity: Infinity };
    if (useDegrees) {
      scope.sin = function (x) {
        return math.sin(math.multiply(math.divide(x, 180), math.pi));
      };
      scope.cos = function (x) {
        return math.cos(math.multiply(math.divide(x, 180), math.pi));
      };
      scope.tan = function (x) {
        return math.tan(math.multiply(math.divide(x, 180), math.pi));
      };
    }
    return scope;
  }

  function formatResult(val) {
    if (val === undefined || val === null) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number") {
      if (!isFinite(val)) return String(val);
      var rounded = Math.round(val * 1e12) / 1e12;
      return String(rounded);
    }
    try {
      return math.format(val, { precision: 14 });
    } catch (e) {
      return String(val);
    }
  }

  function escapeHtml(str) {
    var d = document.createElement("div");
    d.textContent = str == null ? "" : String(str);
    return d.innerHTML;
  }

  function katexOk() {
    return typeof katex !== "undefined" && katex && typeof katex.renderToString === "function";
  }

  function renderKatexInto(el, tex, useDisplay) {
    if (!el) return;
    if (!katexOk()) {
      el.textContent = tex || "";
      return;
    }
    try {
      el.innerHTML = katex.renderToString(tex || "", {
        throwOnError: false,
        displayMode: useDisplay !== false,
        strict: false,
      });
    } catch (e0) {
      el.textContent = tex || "";
    }
  }

  function exprToTex(s) {
    if (!s) return null;
    try {
      return math.parse(s).toTex({ parenthesis: "auto" });
    } catch (e) {
      return null;
    }
  }

  function resultToTex(out) {
    var str = String(out);
    if (str === "Error") return "\\text{Error}";
    try {
      return math.parse(str).toTex({ parenthesis: "auto" });
    } catch (e1) {
      var safe = str.replace(/\\/g, "\\\\").replace(/"/g, "'").replace(/\n/g, " ");
      return "\\text{" + safe + "}";
    }
  }

  var previewTimer;
  function updateExprPreview() {
    if (!katexExprEl) return;
    var s = normalizeExpr(exprEl.value);
    if (!s) {
      renderKatexInto(katexExprEl, "\\text{…}", true);
      return;
    }
    var tex = exprToTex(s);
    if (tex) renderKatexInto(katexExprEl, tex, true);
    else renderKatexInto(katexExprEl, "\\text{Revisa la sintaxis}", true);
  }

  function scheduleExprPreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updateExprPreview, PREVIEW_DEBOUNCE_MS);
  }

  function defaultStepsHtml() {
    return '<p class="sci-calc__steps-intro">Cuando pulses <strong>Calcular</strong>, aquí verás qué tipo de operación se aplicó (derivada, integral numérica, límite, etc.).</p>';
  }

  function buildStepsHtml(normalized, err) {
    if (err) {
      return '<p class="sci-calc__steps-err">' + escapeHtml(err.message || String(err)) + "</p>";
    }
    var items = [
      "La entrada se normaliza (por ejemplo símbolos √ y ∛ se convierten para el motor math.js).",
    ];
    if (/der\s*\(/i.test(normalized)) items.push("Se obtuvo una derivada simbólica; el resultado se simplifica cuando es posible.");
    if (/integral\s*\(/i.test(normalized)) items.push("Integral definida: valor aproximado por suma de trapecios (cuadratura).");
    if (/lim\s*\(/i.test(normalized)) items.push("Límite: se evalúa en el punto o por aproximación en el entorno.");
    if (/sumfrom\s*\(/i.test(normalized)) items.push("Suma de la expresión sobre enteros desde el índice inicial al final.");
    if (items.length === 1) items.push("Evaluación con math.js (numérica o simbólica según la expresión).");
    var html = "<ol>";
    for (var i = 0; i < items.length; i++) html += "<li>" + escapeHtml(items[i]) + "</li>";
    html += "</ol>";
    return html;
  }

  function updateStepsPanel(normalized, err) {
    if (!stepsBodyEl) return;
    stepsBodyEl.innerHTML = err ? buildStepsHtml(normalized, err) : buildStepsHtml(normalized, null);
  }

  function updateResultKatex(out, errObj) {
    if (!katexResultEl || !resultEl) return;
    if (errObj) {
      resultEl.textContent = "Error";
      resultEl.title = errObj.message || String(errObj);
      katexResultEl.innerHTML =
        '<span class="sci-calc__katex-err">' + escapeHtml(errObj.message || "Error") + "</span>";
      return;
    }
    resultEl.textContent = out;
    resultEl.title = "";
    renderKatexInto(katexResultEl, resultToTex(out), true);
  }

  function evaluateNow() {
    var raw = String(exprEl.value).trim();
    var s = normalizeExpr(exprEl.value);
    if (!s) {
      resultEl.textContent = "0";
      renderKatexInto(katexExprEl, "\\text{…}", true);
      renderKatexInto(katexResultEl, "0", true);
      if (stepsBodyEl) stepsBodyEl.innerHTML = defaultStepsHtml();
      return;
    }
    try {
      var val = math.evaluate(s, buildEvaluateScope());
      var out = formatResult(val);
      updateResultKatex(out, null);
      if (typeof val === "number") ans = val;
      updateExprPreview();
      updateStepsPanel(s, null);
    } catch (err) {
      updateResultKatex("Error", err);
      updateExprPreview();
      updateStepsPanel(s, err);
    }
  }

  function insertAtCursor(text) {
    var start = exprEl.selectionStart;
    var end = exprEl.selectionEnd;
    var v = exprEl.value;
    exprEl.value = v.slice(0, start) + text + v.slice(end);
    var pos = start + text.length;
    exprEl.setSelectionRange(pos, pos);
    exprEl.focus();
  }

  function moveCursor(delta) {
    var start = exprEl.selectionStart;
    var end = exprEl.selectionEnd;
    var p = Math.max(0, Math.min(exprEl.value.length, (start === end ? start : end) + delta));
    exprEl.setSelectionRange(p, p);
    exprEl.focus();
  }

  function insertFraction() {
    insertAtCursor("()/()");
    var p = exprEl.selectionStart - 3;
    if (p >= 0) exprEl.setSelectionRange(p + 1, p + 1);
  }

  /** Inserta ^( ) y deja el cursor dentro del paréntesis para escribir el exponente. */
  function insertPowerWithCursor() {
    var start = exprEl.selectionStart;
    insertAtCursor("^()");
    exprEl.setSelectionRange(start + 2, start + 2);
  }

  /**
   * Si el cursor está dentro de ^(...) o sobre ^n, selecciona solo el exponente para reemplazarlo.
   * También cubre exponentes simples tipo ^2 o ^3.
   */
  function trySelectExponent() {
    var v = exprEl.value;
    var pos = exprEl.selectionStart;
    var end = exprEl.selectionEnd;
    if (pos !== end) return false;
    var caret = pos;
    for (var i = caret - 1; i >= 0; i--) {
      if (v[i] !== "^") continue;
      if (v[i + 1] === "(") {
        var depth = 1;
        var j = i + 2;
        var innerStart = i + 2;
        while (j < v.length && depth > 0) {
          if (v[j] === "(") depth++;
          else if (v[j] === ")") {
            depth--;
            if (depth === 0) {
              var innerEnd = j;
              if (caret >= innerStart && caret <= innerEnd) {
                exprEl.setSelectionRange(innerStart, innerEnd);
                exprEl.focus();
                return true;
              }
              break;
            }
          }
          j++;
        }
      } else {
        var st = i + 1;
        var k = st;
        while (k < v.length && /[0-9.]/.test(v[k])) k++;
        if (k > st && caret >= st && caret <= k) {
          exprEl.setSelectionRange(st, k);
          exprEl.focus();
          return true;
        }
      }
    }
    return false;
  }

  function onExpButton() {
    if (!trySelectExponent()) {
      insertPowerWithCursor();
    }
  }

  function insertDerTemplate() {
    insertAtCursor("der(, x)");
    var v = exprEl.value;
    var ins = v.lastIndexOf("der(, x)");
    if (ins >= 0) exprEl.setSelectionRange(ins + 4, ins + 4);
  }

  function insertIntegralTemplate() {
    insertAtCursor('integral("x^2", "x", 0, 1)');
    var v = exprEl.value;
    var prefix = 'integral("';
    var start = v.lastIndexOf(prefix);
    if (start >= 0) {
      var innerStart = start + prefix.length;
      var innerEnd = v.indexOf('"', innerStart);
      if (innerEnd > innerStart) exprEl.setSelectionRange(innerStart, innerEnd);
    }
  }

  function insertLimTemplate() {
    insertAtCursor("lim(, x, 0)");
    var v = exprEl.value;
    var ins = v.lastIndexOf("lim(, x, 0)");
    if (ins >= 0) exprEl.setSelectionRange(ins + 4, ins + 4);
  }

  function clearAll() {
    exprEl.value = "";
    resultEl.textContent = "0";
    resultEl.title = "";
    renderKatexInto(katexExprEl, "\\text{…}", true);
    renderKatexInto(katexResultEl, "0", true);
    if (stepsBodyEl) stepsBodyEl.innerHTML = defaultStepsHtml();
  }

  function clearEntry() {
    exprEl.value = "";
    exprEl.focus();
    scheduleExprPreview();
    renderKatexInto(katexResultEl, "0", true);
    resultEl.textContent = "0";
  }

  document.querySelectorAll(".sci-key[data-insert]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var ins = btn.getAttribute("data-insert");
      if (ins === ")/(") insertFraction();
      else insertAtCursor(ins);
    });
  });

  document.querySelectorAll(".sci-key[data-action='power-insert']").forEach(function (btn) {
    btn.addEventListener("click", function () {
      insertPowerWithCursor();
    });
  });

  var expBtn = document.getElementById("sci-exp-btn");
  if (expBtn) expBtn.addEventListener("click", onExpButton);

  document.querySelectorAll(".sci-key[data-action='eval']").forEach(function (btn) {
    btn.addEventListener("click", evaluateNow);
  });

  document.querySelectorAll(".sci-key[data-action='template-der']").forEach(function (btn) {
    btn.addEventListener("click", insertDerTemplate);
  });
  document.querySelectorAll(".sci-key[data-action='template-int']").forEach(function (btn) {
    btn.addEventListener("click", insertIntegralTemplate);
  });
  document.querySelectorAll(".sci-key[data-action='template-lim']").forEach(function (btn) {
    btn.addEventListener("click", insertLimTemplate);
  });

  document.querySelectorAll("[data-action='clear']").forEach(function (btn) {
    btn.addEventListener("click", clearAll);
  });
  document.querySelectorAll("[data-action='clear-entry']").forEach(function (btn) {
    btn.addEventListener("click", clearEntry);
  });
  document.querySelectorAll("[data-action='ans']").forEach(function (btn) {
    btn.addEventListener("click", function () {
      insertAtCursor("ans");
    });
  });

  var enterBtn = document.getElementById("sci-enter");
  if (enterBtn) enterBtn.addEventListener("click", evaluateNow);
  var bsBtn = document.getElementById("sci-backspace");
  if (bsBtn)
    bsBtn.addEventListener("click", function () {
      var start = exprEl.selectionStart;
      var end = exprEl.selectionEnd;
      var v = exprEl.value;
      if (start === end && start > 0) {
        exprEl.value = v.slice(0, start - 1) + v.slice(end);
        exprEl.setSelectionRange(start - 1, start - 1);
      } else if (start !== end) {
        exprEl.value = v.slice(0, start) + v.slice(end);
        exprEl.setSelectionRange(start, start);
      }
      exprEl.focus();
    });

  var leftBtn = document.getElementById("sci-cur-left");
  var rightBtn = document.getElementById("sci-cur-right");
  if (leftBtn) leftBtn.addEventListener("click", function () {
    moveCursor(-1);
  });
  if (rightBtn) rightBtn.addEventListener("click", function () {
    moveCursor(1);
  });

  if (degToggle && degLabel) {
    degToggle.addEventListener("click", function () {
      useDegrees = !useDegrees;
      degLabel.textContent = useDegrees ? "Grados (sin/cos/tan con °)" : "Radianes";
      if (String(exprEl.value).trim()) evaluateNow();
    });
  }

  if (abcBtn) {
    abcBtn.addEventListener("click", function () {
      var on = abcBtn.getAttribute("aria-pressed") === "true";
      abcBtn.setAttribute("aria-pressed", on ? "false" : "true");
      document.getElementById("calc-root").classList.toggle("sci-calc--abc", !on);
    });
  }

  document.querySelectorAll(".sci-calc__tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      var panelId = tab.getAttribute("data-panel");
      document.querySelectorAll(".sci-calc__tab").forEach(function (t) {
        t.classList.remove("sci-calc__tab--active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("sci-calc__tab--active");
      tab.setAttribute("aria-selected", "true");
      document.querySelectorAll(".sci-calc__panel").forEach(function (p) {
        var active = p.id === panelId;
        p.classList.toggle("sci-calc__panel--active", active);
        p.hidden = !active;
      });
    });
  });

  exprEl.addEventListener("input", scheduleExprPreview);

  exprEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      evaluateNow();
      return;
    }
    if (e.key === "^" && !e.altKey) {
      e.preventDefault();
      insertPowerWithCursor();
    }
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    if (e.key === "Escape") {
      return;
    }
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      evaluateNow();
    }
  });

  evaluateNow();
  scheduleExprPreview();
})();
