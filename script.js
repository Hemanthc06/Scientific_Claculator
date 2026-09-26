/* =========================================
   Scientific Calculator - Full Script
   ========================================= */

const expressionEl  = document.getElementById('expression');
const resultEl      = document.getElementById('result');
const buttons       = document.getElementById('buttons');
const modeBadge     = document.getElementById('modeBadge');
const modeToggle    = document.getElementById('modeToggle');
const historyPanel  = document.getElementById('historyPanel');
const historyList   = document.getElementById('historyList');
const historyToggle = document.getElementById('historyToggle');
const historyClear  = document.getElementById('historyClear');
const themeToggle   = document.getElementById('themeToggle');

let currentInput = '';
let lastResult   = '0';
let angleMode    = 'DEG';
let history      = [];

/* =========================================
   THEME
   ========================================= */
function initTheme() {
  const saved = localStorage.getItem('calc-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    return;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
}

function toggleTheme(e) {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';

  const overlay = document.createElement('div');
  overlay.className = 'theme-transition-overlay';
  const x = e ? e.clientX : window.innerWidth / 2;
  const y = e ? e.clientY : window.innerHeight / 2;
  overlay.style.background = next === 'dark'
    ? `radial-gradient(circle at ${x}px ${y}px, #0b0b16 0%, transparent 70%)`
    : `radial-gradient(circle at ${x}px ${y}px, #eef1f8 0%, transparent 70%)`;
  overlay.style.opacity = '0.6';
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('calc-theme', next);
  }, 100);

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 400);
  }, 200);
}

themeToggle.addEventListener('click', toggleTheme);

/* =========================================
   DISPLAY
   ========================================= */
function updateDisplay() {
  expressionEl.textContent = currentInput || '';

  if (currentInput.trim() === '') {
    resultEl.textContent = lastResult;
    resultEl.classList.remove('error');
    return;
  }

  try {
    const preview = evaluate(currentInput);
    if (preview === undefined || Number.isNaN(preview)) {
      resultEl.textContent = lastResult;
    } else {
      resultEl.textContent = formatNumber(preview);
      resultEl.classList.remove('error');
    }
  } catch {
    resultEl.textContent = lastResult;
  }
}

function formatNumber(n) {
  if (!isFinite(n)) return n > 0 ? '∞' : '-∞';
  if (Number.isNaN(n)) return 'Error';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-9 || abs >= 1e12)) {
    return n.toExponential(6).replace(/\.?0+e/, 'e');
  }
  const rounded = parseFloat(n.toPrecision(12));
  return rounded.toString();
}

/* =========================================
   INPUT
   ========================================= */
function insert(text) {
  currentInput += text;
  updateDisplay();
}

function clearAll() {
  currentInput = '';
  lastResult = '0';
  resultEl.classList.remove('error');
  updateDisplay();
}

function deleteLast() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function negate() {
  if (!currentInput) {
    currentInput = '-';
  } else {
    try {
      const val = evaluate(currentInput);
      currentInput = formatNumber(-val);
    } catch {
      currentInput = '-' + currentInput;
    }
  }
  updateDisplay();
}

/* =========================================
   MATH HELPERS
   ========================================= */
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function sin(x) { return Math.sin(angleMode === 'DEG' ? x * Math.PI / 180 : x); }
function cos(x) { return Math.cos(angleMode === 'DEG' ? x * Math.PI / 180 : x); }
function tan(x) { return Math.tan(angleMode === 'DEG' ? x * Math.PI / 180 : x); }

function replaceFactorial(s) {
  let result = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === '!') {
      let depth = 0;
      let j = result.length - 1;
      while (j >= 0) {
        const ch = result[j];
        if (ch === ')') depth++;
        else if (ch === '(') {
          depth--;
          if (depth < 0) break;
        } else if (depth === 0 && !/[\d.a-zA-Z]/.test(ch)) {
          break;
        }
        j--;
      }
      const operand = result.slice(j + 1);
      result = result.slice(0, j + 1) + 'fact(' + operand + ')';
      i++;
    } else {
      result += s[i];
      i++;
    }
  }
  return result;
}

/* =========================================
   EVALUATOR
   ========================================= */
function evaluate(expr) {
  let s = expr;
  s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  s = s.replace(/π/g, 'PI').replace(/√/g, 'sqrt');

  const openCount  = (s.match(/\(/g) || []).length;
  const closeCount = (s.match(/\)/g) || []).length;
  if (openCount > closeCount) {
    s += ')'.repeat(openCount - closeCount);
  }

  s = replaceFactorial(s);

  const context = {
    sin, cos, tan,
    ln: Math.log,
    log: Math.log10,
    sqrt: Math.sqrt,
    exp: Math.exp,
    pow: Math.pow,
    pow10: x => Math.pow(10, x),
    inv: x => 1 / x,
    fact: factorial,
    PI: Math.PI,
    E: Math.E
  };

  const fn = new Function(
    ...Object.keys(context),
    `"use strict"; return (${s});`
  );
  return fn(...Object.values(context));
}

/* =========================================
   COMPUTE
   ========================================= */
function computeResult() {
  if (!currentInput.trim()) return;

  try {
    const value = evaluate(currentInput);

    if (value === undefined || Number.isNaN(value)) {
      resultEl.textContent = 'Error';
      resultEl.classList.add('error');
      return;
    }

    const formatted    = formatNumber(value);
    const exprSnapshot = currentInput;

    addToHistory(exprSnapshot, formatted);

    lastResult = formatted;
    expressionEl.textContent = exprSnapshot + ' =';
    currentInput = formatted;
    resultEl.textContent = formatted;
    resultEl.classList.remove('error');

    // Pop animation
    resultEl.classList.remove('pop');
    void resultEl.offsetWidth; // reflow to restart animation
    resultEl.classList.add('pop');
  } catch {
    resultEl.textContent = 'Error';
    resultEl.classList.add('error');
  }
}

/* =========================================
   HISTORY
   ========================================= */
function addToHistory(expr, res) {
  history.unshift({ expr, res });
  if (history.length > 50) history.pop();
  renderHistory();
}

function renderHistory() {
  if (history.length === 0) {
    historyList.innerHTML = '<p class="history-empty">No calculations yet</p>';
    return;
  }
  historyList.innerHTML = history.map((item, idx) => `
    <div class="history-item" data-index="${idx}">
      <div class="h-expr">${escapeHtml(item.expr)}</div>
      <div class="h-result">${escapeHtml(item.res)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

historyList.addEventListener('click', (e) => {
  const item = e.target.closest('.history-item');
  if (!item) return;
  const idx = Number(item.dataset.index);
  const entry = history[idx];
  if (!entry) return;
  currentInput = entry.res;
  updateDisplay();
});

historyClear.addEventListener('click', () => {
  history = [];
  renderHistory();
});

historyToggle.addEventListener('click', () => {
  historyPanel.classList.toggle('collapsed');
});

/* =========================================
   RIPPLE
   ========================================= */
function createRipple(e, btn) {
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left - size / 2;
  const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top - size / 2;

  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top  = y + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/* =========================================
   BUTTON CLICKS
   ========================================= */
buttons.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  createRipple(e, btn);

  const num       = btn.dataset.num;
  const op        = btn.dataset.op;
  const fn        = btn.dataset.fn;
  const action    = btn.dataset.action;
  const constName = btn.dataset.const;

  if (num !== undefined) { insert(num); return; }

  if (op !== undefined) {
    const lastChar = currentInput.slice(-1);
    if ('+-*/'.includes(lastChar) && '+-*/'.includes(op)) {
      currentInput = currentInput.slice(0, -1) + op;
      updateDisplay();
      return;
    }
    insert(op);
    return;
  }

  if (constName) {
    insert(constName === 'PI' ? 'π' : 'e');
    return;
  }

  if (fn) {
    if (fn === 'pow')         insert('^');
    else if (fn === 'fact')   insert('!');
    else if (fn === 'inv')    insert('inv(');
    else if (fn === 'exp')    insert('exp(');
    else if (fn === '10pow')  insert('pow10(');
    else                      insert(fn + '(');
    return;
  }

  switch (action) {
    case 'clear':  clearAll();  break;
    case 'delete': deleteLast(); break;
    case 'equals': computeResult(); break;
    case 'dot':    insert('.'); break;
    case 'negate': negate();    break;
    case 'open':   insert('('); break;
    case 'close':  insert(')'); break;
    case 'toggle':
      angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
      modeBadge.textContent  = angleMode;
      modeToggle.textContent = angleMode;
      updateDisplay();
      break;
  }
});

/* =========================================
   KEYBOARD
   ========================================= */
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key))                    { insert(key); e.preventDefault(); }
  else if (key === '.')                       { insert('.'); e.preventDefault(); }
  else if (key === '+')                       { insert('+'); e.preventDefault(); }
  else if (key === '-')                       { insert('-'); e.preventDefault(); }
  else if (key === '*')                       { insert('*'); e.preventDefault(); }
  else if (key === '/')                       { insert('/'); e.preventDefault(); }
  else if (key === '(')                       { insert('('); e.preventDefault(); }
  else if (key === ')')                       { insert(')'); e.preventDefault(); }
  else if (key === '^')                       { insert('^'); e.preventDefault(); }
  else if (key === '!')                       { insert('!'); e.preventDefault(); }
  else if (key === 'Enter' || key === '=')    { computeResult(); e.preventDefault(); }
  else if (key === 'Backspace')               { deleteLast(); e.preventDefault(); }
  else if (key === 'Escape')                  { clearAll(); e.preventDefault(); }
  else if (key.toLowerCase() === 'p')         { insert('π'); e.preventDefault(); }
});

/* =========================================
   INIT
   ========================================= */
initTheme();
renderHistory();
updateDisplay();