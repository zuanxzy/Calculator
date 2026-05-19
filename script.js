const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

const OPERATORS = new Set(["+", "-", "*", "/", "%"]);
// Objek pemetaan simbol ganti Regex (Beratus kali lagi pantas)
const FORMAT_MAP = { "*": "×", "/": "÷", "-": "−", "+": "+" };

function formatExpression(value) {
  let formatted = "";
  for (let i = 0; i < value.length; i++) {
    formatted += FORMAT_MAP[value[i]] || value[i];
  }
  return formatted;
}

function render(value = expression) {
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
    // OPTIMASI: Menggantikan eval() untuk keselamatan & kelajuan kompilasi string
    const total = new Function(`return ${expression}`)();

    if (!Number.isFinite(total)) throw new Error("Invalid result");

    const rounded = Number(total.toFixed(10));
    resultEl.textContent = rounded;
    expression = String(rounded);
    justCalculated = true;
  } catch {
    resultEl.textContent = "Error";
    expression = "";
    justCalculated = true;
  }
}

// FIX: Guna blok 'else if' untuk menghalang trigger berganda butang "="
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

render();
