(function () {
  var disp = document.getElementById("calc-main");
  var sub = document.getElementById("calc-sub");
  var hist = document.getElementById("calc-hist");
  if (!disp) return;

  var current = "0";
  var stored = null;
  var op = null;
  var fresh = true;

  function update() {
    disp.textContent = current;
  }

  function pushHist(line) {
    if (!hist) return;
    var d = document.createElement("div");
    d.textContent = line;
    hist.insertBefore(d, hist.firstChild);
    while (hist.children.length > 12) hist.removeChild(hist.lastChild);
  }

  function num(n) {
    if (fresh) {
      current = n;
      fresh = false;
    } else {
      if (current === "0" && n !== ".") current = n;
      else current += n;
    }
    update();
  }

  function setOp(which) {
    var v = parseFloat(current);
    if (stored === null) {
      stored = v;
    } else if (op && !fresh) {
      var b = v;
      if (op === "+") stored = stored + b;
      else if (op === "−") stored = stored - b;
      else if (op === "×") stored = stored * b;
      else if (op === "÷") stored = b === 0 ? stored : stored / b;
      current = String(stored);
      update();
    }
    op = which;
    fresh = true;
    if (sub) sub.textContent = stored + " " + (op || "");
  }

  function eq() {
    if (op === null || stored === null) return;
    var v = parseFloat(current);
    var line = stored + " " + op + " " + v + " =";
    if (op === "+") stored = stored + v;
    else if (op === "−") stored = stored - v;
    else if (op === "×") stored = stored * v;
    else if (op === "÷") stored = v === 0 ? stored : stored / v;
    current = String(Math.round(stored * 1e12) / 1e12);
    pushHist(line + " " + current);
    op = null;
    stored = null;
    fresh = true;
    if (sub) sub.textContent = "";
    update();
  }

  function clr() {
    current = "0";
    stored = null;
    op = null;
    fresh = true;
    if (sub) sub.textContent = "";
    update();
  }

  function applyKey(k) {
    if (k >= "0" && k <= "9") num(k);
    else if (k === ".") {
      if (fresh) {
        current = "0.";
        fresh = false;
      } else if (current.indexOf(".") < 0) current += ".";
      update();
    } else if (k === "C") clr();
    else if (k === "=") eq();
    else if (["+", "−", "×", "÷"].indexOf(k) >= 0) setOp(k);
  }

  document.querySelectorAll(".calc-keys [data-key]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyKey(btn.getAttribute("data-key"));
    });
  });

  document.addEventListener("keydown", function (e) {
    var t = e.target && e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
    var k = e.key;
    if (k === "Escape") {
      e.preventDefault();
      clr();
      return;
    }
    if (k === "Enter" || k === "=") {
      e.preventDefault();
      eq();
      return;
    }
    if (k >= "0" && k <= "9") {
      e.preventDefault();
      num(k);
      return;
    }
    if (k === "." || k === ",") {
      e.preventDefault();
      applyKey(".");
      return;
    }
    if (k === "+") {
      e.preventDefault();
      setOp("+");
      return;
    }
    if (k === "-") {
      e.preventDefault();
      setOp("−");
      return;
    }
    if (k === "*" || k === "x" || k === "X") {
      e.preventDefault();
      setOp("×");
      return;
    }
    if (k === "/") {
      e.preventDefault();
      setOp("÷");
      return;
    }
  });

  update();
})();
