export type Operator = "+" | "-" | "×" | "÷";

export type HistoryEntry = {
  id: string;
  expression: string;
  result: string;
};

export type CalcState = {
  display: string;
  expression: string;
  accumulator: number | null;
  operator: Operator | null;
  lastOperator: Operator | null;
  lastOperand: number | null;
  overwrite: boolean;
  error: string | null;
  history: HistoryEntry[];
  memory: number;
};

export type CalcAction =
  | { type: "digit"; digit: string }
  | { type: "decimal" }
  | { type: "operator"; operator: Operator }
  | { type: "equals" }
  | { type: "percent" }
  | { type: "sign" }
  | { type: "clear" }
  | { type: "allClear" }
  | { type: "backspace" }
  | { type: "memoryClear" }
  | { type: "memoryRecall" }
  | { type: "memoryAdd" }
  | { type: "memorySubtract" }
  | { type: "clearHistory" }
  | { type: "loadHistory"; history: HistoryEntry[]; memory: number };

export const DIV_ZERO = "0으로 나눌 수 없습니다";
export const CALC_ERROR = "계산할 수 없습니다";
export const MAX_DIGITS = 12;
export const MAX_HISTORY = 50;

export function createInitialState(
  extras?: Partial<Pick<CalcState, "history" | "memory">>,
): CalcState {
  return {
    display: "0",
    expression: "",
    accumulator: null,
    operator: null,
    lastOperator: null,
    lastOperand: null,
    overwrite: true,
    error: null,
    history: extras?.history ?? [],
    memory: extras?.memory ?? 0,
  };
}

export function parseDisplay(value: string): number {
  return Number(value);
}

export function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) return "Error";
  if (Object.is(value, -0) || value === 0) return "0";

  const abs = Math.abs(value);
  if (abs >= 1e12 || abs < 1e-8) {
    return value.toExponential(6).replace("e+", "e");
  }

  const rounded = Number(value.toPrecision(12));
  return String(rounded);
}

export function formatGrouped(value: string): string {
  if (value === "Error" || value.includes("e")) return value;
  const negative = value.startsWith("-");
  const raw = negative ? value.slice(1) : value;
  const [intPart, fracPart] = raw.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const body = fracPart !== undefined ? `${grouped}.${fracPart}` : grouped;
  return negative ? `-${body}` : body;
}

function digitCount(value: string): number {
  return value.replace("-", "").replace(".", "").length;
}

function compute(
  left: number,
  operator: Operator,
  right: number,
): { value: number; error: string | null } {
  if (operator === "÷" && right === 0) {
    return { value: left, error: DIV_ZERO };
  }

  let raw: number;
  switch (operator) {
    case "+":
      raw = left + right;
      break;
    case "-":
      raw = left - right;
      break;
    case "×":
      raw = left * right;
      break;
    case "÷":
      raw = left / right;
      break;
  }

  if (!Number.isFinite(raw)) {
    return { value: left, error: CALC_ERROR };
  }

  return { value: Number(raw.toPrecision(12)), error: null };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function pushHistory(
  history: HistoryEntry[],
  expression: string,
  result: string,
): HistoryEntry[] {
  const next = [{ id: newId(), expression, result }, ...history];
  return next.slice(0, MAX_HISTORY);
}

function withError(state: CalcState, error: string): CalcState {
  return {
    ...state,
    error,
    overwrite: true,
  };
}

export function reduce(state: CalcState, action: CalcAction): CalcState {
  if (action.type === "loadHistory") {
    return {
      ...state,
      history: action.history.slice(0, MAX_HISTORY),
      memory: action.memory,
    };
  }

  if (action.type === "clearHistory") {
    return { ...state, history: [] };
  }

  if (action.type === "allClear") {
    return createInitialState({ history: state.history, memory: state.memory });
  }

  if (state.error) {
    if (action.type === "clear") {
      return createInitialState({ history: state.history, memory: state.memory });
    }
    if (
      action.type === "digit" ||
      action.type === "decimal" ||
      action.type === "sign"
    ) {
      return reduce(
        createInitialState({ history: state.history, memory: state.memory }),
        action,
      );
    }
    return state;
  }

  switch (action.type) {
    case "digit": {
      if (state.overwrite) {
        return {
          ...state,
          display: action.digit,
          overwrite: false,
          lastOperator: null,
          lastOperand: null,
        };
      }
      if (state.display === "0") {
        return { ...state, display: action.digit };
      }
      if (state.display === "-0") {
        return { ...state, display: `-${action.digit}` };
      }
      if (digitCount(state.display) >= MAX_DIGITS) return state;
      return { ...state, display: `${state.display}${action.digit}` };
    }

    case "decimal": {
      if (state.overwrite) {
        return {
          ...state,
          display: "0.",
          overwrite: false,
          lastOperator: null,
          lastOperand: null,
        };
      }
      if (state.display.includes(".")) return state;
      return { ...state, display: `${state.display}.` };
    }

    case "operator": {
      const current = parseDisplay(state.display);

      if (state.operator && !state.overwrite && state.accumulator !== null) {
        const result = compute(state.accumulator, state.operator, current);
        if (result.error) return withError(state, result.error);
        return {
          ...state,
          display: formatDisplay(result.value),
          accumulator: result.value,
          operator: action.operator,
          expression: `${formatDisplay(result.value)} ${action.operator}`,
          overwrite: true,
          lastOperator: null,
          lastOperand: null,
        };
      }

      return {
        ...state,
        accumulator: current,
        operator: action.operator,
        expression: `${formatDisplay(current)} ${action.operator}`,
        overwrite: true,
        lastOperator: null,
        lastOperand: null,
      };
    }

    case "equals": {
      const current = parseDisplay(state.display);

      if (state.operator && state.accumulator !== null) {
        const result = compute(state.accumulator, state.operator, current);
        if (result.error) return withError(state, result.error);
        const expression = `${formatDisplay(state.accumulator)} ${state.operator} ${formatDisplay(current)}`;
        const formatted = formatDisplay(result.value);
        return {
          ...state,
          display: formatted,
          expression,
          accumulator: result.value,
          operator: null,
          lastOperator: state.operator,
          lastOperand: current,
          overwrite: true,
          history: pushHistory(state.history, expression, formatted),
        };
      }

      if (state.lastOperator !== null && state.lastOperand !== null) {
        const result = compute(current, state.lastOperator, state.lastOperand);
        if (result.error) return withError(state, result.error);
        const expression = `${formatDisplay(current)} ${state.lastOperator} ${formatDisplay(state.lastOperand)}`;
        const formatted = formatDisplay(result.value);
        return {
          ...state,
          display: formatted,
          expression,
          accumulator: result.value,
          overwrite: true,
          history: pushHistory(state.history, expression, formatted),
        };
      }

      return { ...state, overwrite: true };
    }

    case "percent": {
      const current = parseDisplay(state.display);
      let next: number;
      if (
        state.operator &&
        state.accumulator !== null &&
        (state.operator === "+" || state.operator === "-")
      ) {
        next = (state.accumulator * current) / 100;
      } else {
        next = current / 100;
      }
      if (!Number.isFinite(next)) return withError(state, CALC_ERROR);
      return {
        ...state,
        display: formatDisplay(next),
        overwrite: true,
      };
    }

    case "sign": {
      if (state.display === "0" || state.display === "0.") {
        return { ...state, display: state.display.replace("0", "-0") };
      }
      if (state.display.startsWith("-")) {
        return { ...state, display: state.display.slice(1), overwrite: false };
      }
      return { ...state, display: `-${state.display}`, overwrite: false };
    }

    case "clear": {
      if (state.overwrite || state.display === "0") {
        return createInitialState({
          history: state.history,
          memory: state.memory,
        });
      }
      return { ...state, display: "0", overwrite: true };
    }

    case "backspace": {
      if (state.overwrite) return state;
      const next = state.display.slice(0, -1);
      if (next === "" || next === "-" || next === "-0") {
        return { ...state, display: "0", overwrite: true };
      }
      return { ...state, display: next };
    }

    case "memoryClear": {
      return { ...state, memory: 0 };
    }

    case "memoryRecall": {
      return {
        ...state,
        display: formatDisplay(state.memory),
        overwrite: true,
        lastOperator: null,
        lastOperand: null,
      };
    }

    case "memoryAdd": {
      const next = Number(
        (state.memory + parseDisplay(state.display)).toPrecision(12),
      );
      return { ...state, memory: next };
    }

    case "memorySubtract": {
      const next = Number(
        (state.memory - parseDisplay(state.display)).toPrecision(12),
      );
      return { ...state, memory: next };
    }
  }
}

export function isAllClear(state: CalcState): boolean {
  return (
    state.overwrite ||
    state.display === "0" ||
    state.error !== null
  );
}
