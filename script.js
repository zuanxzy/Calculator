const expressionEl = document.getElementById("expression");
const resultEl = document.getElementById("result");
const keysEl = document.querySelector(".keys");

let expression = "";
let justCalculated = false;

const OPERATORS = new Set(["+", "-", "*", "/", "%"]);
const FORMAT_MAP = { "*": "×", "/": "÷", "-": "−" };

function render(value = expression) {
  expressionEl.textContent = formatExpression(expression);
  resultEl.textContent = value ? formatExpression(String(value)) : "0";
}

function formatExpression(value) {
  return value.replace(/[*\/-]/g, (char) => FORMAT_MAP[char] || char);
}

function appendValue(value) {
  if (justCalculated && !OPERATORS.has(value)) {
    expression = "";
    justCalculated = false;
  }

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

  justCalculated = false;
  expression += value;
  render();
}

function clearAll() {
  expression = "";
  justCalculated = false;
  render();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  render();
}

function calculate() {
  if (!expression || OPERATORS.has(expression.at(-1))) return;

  try {
    const total = (0, eval)(expression);

    if (!Number.isFinite(total)) throw new Error("Invalid result");

    const rounded = Number(total.toFixed(10));
    expression = String(rounded);
    expressionEl.textContent = formatExpression(expression);
    resultEl.textContent = rounded;
    justCalculated = true;
  } catch {
    resultEl.textContent = "Error";
    justCalculated = true;
  }
}

keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const { value, action } = button.dataset;

  if (action === "clear") clearAll();
  if (action === "delete") deleteLast();
  if (action === "calculate") calculate();
  if (value) appendValue(value);
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/\d/.test(key)) {
    event.preventDefault();
    appendValue(key);
    return;
  }

  if (key === "." || OPERATORS.has(key)) {
    event.preventDefault();
    appendValue(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    event.preventDefault();
    deleteLast();
    return;
  }

  if (key === "Escape") {
    event.preventDefault();
    clearAll();
  }
});

render();