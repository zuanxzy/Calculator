const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

const OPERATORS = new Set(["+", "-", "*", "/", "%"]);

// Guna object lookup terus, lagi laju daripada Regex replace setiap kali render
const FORMAT_MAP = { "*": "×", "/": "÷", "-": "−", "+": "+" };

// OPTIMASI: Guna string biasa, tak payah buat Regex matching berulang kali
function formatExpression(value) {
  let formatted = "";
  for (let i = 0; i < value.length; i++) {
    formatted += FORMAT_MAP[value[i]] || value[i];
  }
  return formatted;
}

function render(value = expression) {
  // Guna textContent dah betul, tapi kita pastikan formatExpression jalan laju
  expressionEl.textContent = formatExpression(expression);
  resultEl.textContent = value ? formatExpression(String(value)) : "0";
}

function appendValue(value) {
  if (justCalculated && !OPERATORS.has(value)) {
    expression = "";
  }
  justCalculated = false;

  const lastChar = expression.at(-1);

  if (value === ".") {
    const currentNumber = expression.split(/[*\/%+-]/).at(-1);
    if (currentNumber?.includes(".")) return;
  }

  if (OPERATORS.has(value)) {
    if (!expression && value !== "-") return;
    if (OPERATORS.has(lastChar)) {
      expression = expression.slice(0, -1);
    }
  }

  expression += value;
  render();
}

function clearAll() {
  expression = "";
  justCalculated = false;
  render();
}

function deleteLast() {
  if (expression.length > 0) {
    expression = expression.slice(0, -1);
    justCalculated = false;
    render();
  }
}

function calculate() {
  if (!expression || OPERATORS.has(expression.at(-1))) return;

  try {
    // OPTIMASI: Guna Function constructor, jauh lebih laju & selamat daripada eval()
    const total = new Function(`return ${expression}`)();

    if (!Number.isFinite(total)) throw new Error("Invalid result");

    // Selesaikan masalah floating point (contoh: 0.1 + 0.2)
    const rounded = Number(total.toFixed(10));
    
    // Tunjuk result, tapi jangan reset expression dulu supaya user boleh sambung kira
    resultEl.textContent = rounded;
    expression = String(rounded);
    justCalculated = true;
  } catch {
    resultEl.textContent = "Error";
    expression = "";
    justCalculated = true;
  }
}

// FIX: Guna 'else if' supaya butang tak trigger dua kali serentak
keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, action } = button.dataset;

  if (action === "clear") {
    clearAll();
  } else if (action === "delete") {
    deleteLast();
  } else if (action === "calculate") {
    calculate();
  } else if (value) {
    appendValue(value);
  }
});

// Keyboard handler dah ok, tak kacau performance
document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    event.preventDefault();
    appendValue(key);
  } else if (key === "." || OPERATORS.has(key)) {
    event.preventDefault();
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    event.preventDefault();
    deleteLast();
  } else if (key === "Escape") {
    event.preventDefault();
    clearAll();
  }
});

// Initial run
render();
