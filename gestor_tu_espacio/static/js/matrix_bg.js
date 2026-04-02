/**
 * Canvas transparente: solo katakana (el fondo RGB va en .matrix-rgb-layer en CSS).
 */
(function () {
  function boot() {
    var canvas = document.getElementById("matrix-bg");
    if (!canvas) return;
    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    var reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var glyphs =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

    var cellSize = 18;
    var cols, rows, dpr, cssW, cssH, cells;

    function randGlyph() {
      return glyphs[Math.floor(Math.random() * glyphs.length)];
    }

    function hsla(h, s, l, a) {
      h = ((h % 360) + 360) % 360;
      return "hsla(" + h + "," + s + "%," + l + "%," + a + ")";
    }

    function buildGrid() {
      cellSize = cssW > 1800 ? 20 : 18;
      cols = Math.ceil(cssW / cellSize);
      rows = Math.ceil(cssH / cellSize);
      while (cols * rows > 4000 && cellSize < 32) {
        cellSize += 2;
        cols = Math.ceil(cssW / cellSize);
        rows = Math.ceil(cssH / cellSize);
      }
      cells = [];
      for (var r = 0; r < rows; r++) {
        cells[r] = [];
        for (var c = 0; c < cols; c++) {
          cells[r][c] = {
            ch: randGlyph(),
            flashUntil: 0,
            nextGlyph: Math.random() * 1000,
          };
        }
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = window.innerWidth || 800;
      cssH = window.innerHeight || 600;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    }

    function drawFrame(t) {
      if (reduced) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* Transparente: deja ver la capa .matrix-rgb-layer debajo */
      ctx.clearRect(0, 0, cssW, cssH);

      ctx.textBaseline = "alphabetic";
      ctx.font =
        "600 " +
        cellSize +
        'px "Noto Sans JP","Yu Gothic","MS Gothic",Meiryo,sans-serif';

      var flow = t * 0.03;
      var ripple = t * 0.004;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var cell = cells[r][c];
          if (t > cell.nextGlyph) {
            cell.ch = randGlyph();
            cell.nextGlyph = t + 300 + Math.random() * 1500;
          }
          if (Math.random() < 0.003) {
            cell.flashUntil = t + 250 + Math.random() * 500;
          }

          var x = c * cellSize;
          var y = (r + 1) * cellSize - 2;

          var hue =
            (flow +
              c * 7 +
              r * 5 +
              Math.sin(ripple + c * 0.5) * 80 +
              Math.cos(ripple * 0.7 + r * 0.4) * 50) %
            360;
          var hue2 = (hue + 130) % 360;

          if (t < cell.flashUntil) {
            ctx.fillStyle = "#fff";
            ctx.shadowColor = hsla(hue2, 100, 60, 1);
            ctx.shadowBlur = 14;
          } else {
            ctx.shadowBlur = 0;
            var pulse =
              0.5 +
              0.5 * Math.sin(ripple * 1.2 + c * 0.5 + r * 0.45);
            ctx.fillStyle = hsla(hue, 95, 58 + pulse * 22, 0.75 + pulse * 0.22);
          }
          ctx.fillText(cell.ch, x, y);
          ctx.shadowBlur = 0;
        }
      }
    }

    function loop(t) {
      drawFrame(t || performance.now());
      requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener("resize", resize);
    if (reduced) {
      drawFrame(0);
    } else {
      requestAnimationFrame(loop);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
