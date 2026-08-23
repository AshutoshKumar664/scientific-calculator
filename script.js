(function () {
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const keys = document.getElementById('keys');
  const angleMode = document.getElementById('angleMode');
  const modeLabel = document.getElementById('mode');
  const historyEl = document.getElementById('history');
  const historyBtn = document.getElementById('historyBtn');
  const copyBtn = document.getElementById('copyBtn');

  let memory = 0;
  let lastAns = 0;
  let expression = '';
  let hist = [];

  function updateDisplay() {
    exprEl.textContent = expression || '0';
    resultEl.textContent = lastAns === null ? '0' : String(lastAns);
    modeLabel.textContent = angleMode.value === 'deg' ? 'Deg' : 'Rad';
  }

  function factorial(n) {
    n = Number(n);
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function safeEval(exp) {
    if (!exp) return 0;

    let e = exp
      .replace(/π|pi/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/\^/g, '**');

    e = e.replace(/(\([^()]*\)|\d+)!/g, (_, inner) => `factorial(${inner})`);

    const isDeg = angleMode.value === 'deg';
    const map = {
      sin: x => Math.sin(isDeg ? x * Math.PI / 180 : x),
      cos: x => Math.cos(isDeg ? x * Math.PI / 180 : x),
      tan: x => Math.tan(isDeg ? x * Math.PI / 180 : x),
      ln: Math.log,
      log: x => Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10,
      sqrt: Math.sqrt,
      abs: Math.abs,
      pow: Math.pow
    };

    const argNames = ['Math', 'ans', 'factorial', ...Object.keys(map)];
    const argVals = [Math, lastAns, factorial, ...Object.values(map)];

    const body = `'use strict'; return (${e});`;
    const fn = new Function(...argNames, body);
    return fn(...argVals);
  }

  keys.addEventListener('click', (ev) => {
    const t = ev.target.closest('button');
    if (!t) return;
    const val = t.getAttribute('data-val');
    const action = t.getAttribute('data-action');

    if (action === 'clear') {
      expression = '';
      lastAns = 0;
      updateDisplay();
      return;
    }

    if (action === 'back') {
      expression = expression.slice(0, -1);
      updateDisplay();
      return;
    }

    if (action === 'equals') {
      try {
        const res = safeEval(expression || '0');
        lastAns = Number.isFinite(res) ? res : 'Error';
        hist.unshift(expression + ' = ' + lastAns);
        if (hist.length > 50) hist.pop();
        historyEl.innerHTML = hist.map(h => `<div>${h}</div>`).join('\n');
      } catch (e) {
        lastAns = 'Error';
      }
      updateDisplay();
      return;
    }

    if (action === 'ans') {
      expression += String(lastAns);
      updateDisplay();
      return;
    }

    // memory
    if (t.id === 'mc') { memory = 0; return; }
    if (t.id === 'mPlus') { memory += Number(lastAns) || 0; return; }
    if (t.id === 'mMinus') { memory -= Number(lastAns) || 0; return; }
    if (t.id === 'mr') { expression += String(memory); updateDisplay(); return; }

    // normal input
    if (val) {
      if (['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'pow', 'abs'].includes(val)) {
        expression += val + '(';
      } else if (val === 'pi') expression += 'π';
      else expression += val;
      updateDisplay();
    }
  });

  historyBtn.addEventListener('click', () => {
    const shown = historyEl.style.display !== 'none';
    historyEl.style.display = shown ? 'none' : 'block';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard?.writeText(String(lastAns)).then(() => {
      copyBtn.textContent = 'Copied';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 900);
    });
  });

  updateDisplay();
})();
