(() => {
  // main.ts
  var I18N = { "en": { "algo": "Algorithm", "controls": "Controls", "run": "\u25B6 Visualize", "shuffle": "\u{1F3B2} Shuffle", "reset": "\u21BA Reset", "params": "Parameters", "size": "Array size", "speed": "Speed", "ops": "Comparisons", "swaps": "Swaps" }, "de": { "algo": "Algorithmus", "controls": "Steuerung", "run": "\u25B6 Visualisieren", "shuffle": "\u{1F3B2} Mischen", "reset": "\u21BA Reset", "params": "Parameter", "size": "Arraygr\xF6\xDFe", "speed": "Tempo", "ops": "Vergleiche", "swaps": "Vertauschungen" } };
  var lang = localStorage.getItem("lang") || "en";
  var t = (k) => I18N[lang][k] || k;
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i]").forEach((el) => el.textContent = t(el.dataset.i));
    document.querySelectorAll(".lang button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
  }
  document.querySelectorAll(".lang button").forEach((b) => b.onclick = () => {
    lang = b.dataset.lang;
    localStorage.setItem("lang", lang);
    applyLang();
  });
  var cv = document.getElementById("cv");
  var ctx = cv.getContext("2d");
  var $ = (id) => document.getElementById(id);
  var ALGOS = ["bubble", "quick", "merge", "selection", "insertion", "radix"];
  var NAMES = { bubble: "Bubble Sort", quick: "Quick Sort", merge: "Merge Sort", selection: "Selection Sort", insertion: "Insertion Sort", radix: "Radix Sort" };
  var algo = "insertion";
  var arr = [];
  var steps = [];
  var running = false;
  var ops = 0;
  var swaps = 0;
  var initial = [];
  function resize() {
    const r = cv.parentElement.getBoundingClientRect();
    cv.width = r.width * devicePixelRatio;
    cv.height = r.height * devicePixelRatio;
    draw();
  }
  addEventListener("resize", resize);
  resize();
  function shuffle() {
    const n = +$("size").value;
    arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    steps = [];
    ops = 0;
    swaps = 0;
    draw();
  }
  function gen(work) {
    steps = [];
    const n = work.length;
    if (algo === "bubble") {
      for (let i = 0; i < n; i++) for (let j = 0; j < n - i - 1; j++) {
        steps.push({ t: "cmp", a: j, b: j + 1 });
        if (work[j] > work[j + 1]) {
          steps.push({ t: "swap", a: j, b: j + 1 });
          [work[j], work[j + 1]] = [work[j + 1], work[j]];
        }
      }
    } else if (algo === "selection") {
      for (let i = 0; i < n; i++) {
        let m = i;
        for (let j = i + 1; j < n; j++) {
          steps.push({ t: "cmp", a: m, b: j });
          if (work[j] < work[m]) m = j;
        }
        if (m !== i) {
          steps.push({ t: "swap", a: i, b: m });
          [work[i], work[m]] = [work[m], work[i]];
        }
      }
    } else if (algo === "insertion") {
      for (let i = 1; i < n; i++) {
        let j = i;
        while (j > 0) {
          steps.push({ t: "cmp", a: j - 1, b: j });
          if (work[j - 1] <= work[j]) break;
          steps.push({ t: "swap", a: j - 1, b: j });
          [work[j - 1], work[j]] = [work[j], work[j - 1]];
          j--;
        }
      }
    } else if (algo === "quick") {
      const qs = (lo, hi) => {
        if (lo >= hi) return;
        const p = work[hi];
        let i = lo;
        for (let j = lo; j < hi; j++) {
          steps.push({ t: "cmp", a: j, b: hi });
          if (work[j] < p) {
            steps.push({ t: "swap", a: i, b: j });
            [work[i], work[j]] = [work[j], work[i]];
            i++;
          }
        }
        steps.push({ t: "swap", a: i, b: hi });
        [work[i], work[hi]] = [work[hi], work[i]];
        qs(lo, i - 1);
        qs(i + 1, hi);
      };
      qs(0, n - 1);
    } else if (algo === "merge") {
      const mg = (lo, hi) => {
        if (hi - lo < 2) return;
        const mid = lo + hi >> 1;
        mg(lo, mid);
        mg(mid, hi);
        const tmp = work.slice(lo, hi);
        let i = 0, j = mid - lo, k = lo;
        while (i < mid - lo && j < hi - lo) {
          steps.push({ t: "cmp", a: k, b: k + 1 });
          if (tmp[i] <= tmp[j]) work[k++] = tmp[i++];
          else work[k++] = tmp[j++];
        }
        while (i < mid - lo) work[k++] = tmp[i++];
        while (j < hi - lo) work[k++] = tmp[j++];
        steps.push({ t: "snap", arr: work.slice() });
      };
      mg(0, n);
    } else if (algo === "radix") {
      const max = Math.max(...work), buf = new Array(n);
      for (let p = 1; p <= max; p *= 10) {
        const cnt = Array(10).fill(0);
        for (let i = 0; i < n; i++) cnt[Math.floor(work[i] / p) % 10]++;
        for (let i = 1; i < 10; i++) cnt[i] += cnt[i - 1];
        for (let i = n - 1; i >= 0; i--) {
          const d = Math.floor(work[i] / p) % 10;
          buf[--cnt[d]] = work[i];
        }
        for (let i = 0; i < n; i++) work[i] = buf[i];
        steps.push({ t: "snap", arr: work.slice() });
      }
    }
  }
  function draw(hl) {
    const w = cv.width, h = cv.height;
    ctx.fillStyle = "#07090f";
    ctx.fillRect(0, 0, w, h);
    const bw = w / arr.length;
    arr.forEach((v, i) => {
      const bh = v / 100 * h * 0.9;
      const hot = hl && (hl.a === i || hl.b === i);
      ctx.fillStyle = hot ? "#ff6ec7" : i === arr.length - 1 ? "#8be28b" : "rgba(77,216,255,.75)";
      ctx.fillRect(i * bw + 1, h - bh, bw - 2, bh);
    });
    $("ops").textContent = ops;
    $("swaps").textContent = swaps;
  }
  var aw = $("algos");
  ALGOS.forEach((k) => {
    const b = document.createElement("button");
    b.textContent = NAMES[k];
    if (k === algo) b.style.borderColor = "var(--acc)";
    b.onclick = () => {
      algo = k;
      [...aw.children].forEach((x) => x.style.borderColor = "");
      b.style.borderColor = "var(--acc)";
      shuffle();
    };
    aw.appendChild(b);
  });
  $("run").onclick = () => {
    if (running) return;
    running = true;
    ops = 0;
    swaps = 0;
    initial = arr.slice();
    const work = initial.slice();
    gen(work);
    arr = initial.slice();
    const spd = 11 - +$("speed").value;
    let i = 0;
    const iv = setInterval(() => {
      const st = steps[i++];
      if (!st) {
        clearInterval(iv);
        running = false;
        draw();
        return;
      }
      if (st.t === "cmp") {
        ops++;
        draw({ a: st.a, b: st.b });
      } else if (st.t === "swap") {
        ops++;
        swaps++;
        [arr[st.a], arr[st.b]] = [arr[st.b], arr[st.a]];
        draw({ a: st.a, b: st.b });
      } else if (st.t === "snap") {
        arr = st.arr.slice();
        draw();
      }
    }, spd);
  };
  $("shuffle").onclick = shuffle;
  $("reset").onclick = () => {
    arr = Array.from({ length: +$("size").value }, (_, i) => i + 1);
    steps = [];
    ops = 0;
    swaps = 0;
    draw();
  };
  $("size").onchange = shuffle;
  arr = Array.from({ length: 120 }, (_, i) => i + 1);
  draw();
  applyLang();
})();
