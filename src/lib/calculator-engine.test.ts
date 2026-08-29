import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CALC_ERROR,
  DIV_ZERO,
  createInitialState,
  formatDisplay,
  formatGrouped,
  reduce,
  type CalcAction,
  type CalcState,
} from "./calculator-engine.ts";

function press(state: CalcState, ...actions: CalcAction[]): CalcState {
  return actions.reduce((next, action) => reduce(next, action), state);
}

function digits(value: string): CalcAction[] {
  return value.split("").map((digit) =>
    digit === "." ? { type: "decimal" as const } : { type: "digit" as const, digit },
  );
}

describe("calculator engine", () => {
  it("adds two numbers", () => {
    const state = press(
      createInitialState(),
      ...digits("12"),
      { type: "operator", operator: "+" },
      ...digits("3"),
      { type: "equals" },
    );
    assert.equal(state.display, "15");
    assert.equal(state.history[0]?.expression, "12 + 3");
    assert.equal(state.history[0]?.result, "15");
  });

  it("chains operators without pressing equals", () => {
    const state = press(
      createInitialState(),
      ...digits("12"),
      { type: "operator", operator: "+" },
      ...digits("3"),
      { type: "operator", operator: "×" },
      ...digits("2"),
      { type: "equals" },
    );
    assert.equal(state.display, "30");
  });

  it("repeats the last operation when equals is pressed again", () => {
    const first = press(
      createInitialState(),
      ...digits("5"),
      { type: "operator", operator: "+" },
      ...digits("3"),
      { type: "equals" },
    );
    const second = reduce(first, { type: "equals" });
    assert.equal(first.display, "8");
    assert.equal(second.display, "11");
  });

  it("avoids floating point noise", () => {
    const state = press(
      createInitialState(),
      ...digits("0.1"),
      { type: "operator", operator: "+" },
      ...digits("0.2"),
      { type: "equals" },
    );
    assert.equal(state.display, "0.3");
  });

  it("reports division by zero", () => {
    const state = press(
      createInitialState(),
      ...digits("8"),
      { type: "operator", operator: "÷" },
      ...digits("0"),
      { type: "equals" },
    );
    assert.equal(state.error, DIV_ZERO);
  });

  it("uses percent of the accumulator for plus and minus", () => {
    const state = press(
      createInitialState(),
      ...digits("200"),
      { type: "operator", operator: "+" },
      ...digits("10"),
      { type: "percent" },
      { type: "equals" },
    );
    assert.equal(state.display, "220");
  });

  it("divides by 100 for standalone percent", () => {
    const state = press(createInitialState(), ...digits("50"), { type: "percent" });
    assert.equal(state.display, "0.5");
  });

  it("clears the current entry then the whole equation", () => {
    const typing = press(
      createInitialState(),
      ...digits("9"),
      { type: "operator", operator: "+" },
      ...digits("12"),
    );
    const cleared = reduce(typing, { type: "clear" });
    assert.equal(cleared.display, "0");
    assert.equal(cleared.operator, "+");
    const reset = reduce(cleared, { type: "clear" });
    assert.equal(reset.operator, null);
    assert.equal(reset.accumulator, null);
  });

  it("backspaces digits", () => {
    const state = press(
      createInitialState(),
      ...digits("123"),
      { type: "backspace" },
    );
    assert.equal(state.display, "12");
  });

  it("stores and recalls memory", () => {
    const added = press(
      createInitialState(),
      ...digits("7"),
      { type: "memoryAdd" },
      { type: "allClear" },
      { type: "memoryRecall" },
    );
    assert.equal(added.display, "7");
    const subtracted = press(added, { type: "memorySubtract" });
    assert.equal(subtracted.memory, 0);
  });

  it("formats grouped thousands", () => {
    assert.equal(formatGrouped("1234567.89"), "1,234,567.89");
    assert.equal(formatDisplay(0), "0");
    assert.equal(CALC_ERROR.length > 0, true);
  });
});
