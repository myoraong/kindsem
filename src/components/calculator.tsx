"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Copy, Delete, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  createInitialState,
  formatGrouped,
  isAllClear,
  reduce,
  type CalcAction,
  type Operator,
} from "@/lib/calculator-engine";

import { loadPersisted, savePersisted } from "@/lib/storage";

function mapKey(event: KeyboardEvent): CalcAction | null {
  if (event.key >= "0" && event.key <= "9") {
    return { type: "digit", digit: event.key };
  }
  if (event.key === ".") return { type: "decimal" };
  if (event.key === "+") return { type: "operator", operator: "+" };
  if (event.key === "-") return { type: "operator", operator: "-" };
  if (event.key === "*" || event.key === "x" || event.key === "X") {
    return { type: "operator", operator: "×" };
  }
  if (event.key === "/") return { type: "operator", operator: "÷" };
  if (event.key === "Enter" || event.key === "=") return { type: "equals" };
  if (event.key === "%") return { type: "percent" };
  if (event.key === "Backspace") return { type: "backspace" };
  if (event.key === "Escape") return { type: "allClear" };
  if (event.key === "Delete") return { type: "clear" };
  return null;
}

type KeyDef = {
  label: string;
  action: CalcAction;
  className?: string;
  span?: number;
  aria?: string;
};

export function Calculator() {
  const [state, dispatch] = useReducer(reduce, undefined, createInitialState);
  const [copied, setCopied] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    const persisted = loadPersisted();
    dispatch({
      type: "loadHistory",
      history: persisted.history,
      memory: persisted.memory,
    });
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    savePersisted(state.history, state.memory);
  }, [state.history, state.memory]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "c") {
        void copyResult();
        return;
      }

      const action = mapKey(event);
      if (!action) return;
      event.preventDefault();
      dispatch(action);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  async function copyResult() {
    const text = state.error ?? state.display;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  const clearAction: CalcAction = isAllClear(state)
    ? { type: "allClear" }
    : { type: "clear" };

  const memoryKeys: KeyDef[] = [
    { label: "MC", action: { type: "memoryClear" }, aria: "메모리 지우기" },
    { label: "MR", action: { type: "memoryRecall" }, aria: "메모리 불러오기" },
    { label: "M+", action: { type: "memoryAdd" }, aria: "메모리에 더하기" },
    { label: "M−", action: { type: "memorySubtract" }, aria: "메모리에서 빼기" },
  ];

  const keys: KeyDef[] = [
    {
      label: isAllClear(state) ? "AC" : "C",
      action: clearAction,
      className: "bg-stone-200 text-stone-800 hover:bg-stone-300",
      aria: "지우기",
    },
    {
      label: "±",
      action: { type: "sign" },
      className: "bg-stone-200 text-stone-800 hover:bg-stone-300",
      aria: "부호 바꾸기",
    },
    {
      label: "%",
      action: { type: "percent" },
      className: "bg-stone-200 text-stone-800 hover:bg-stone-300",
    },
    {
      label: "÷",
      action: { type: "operator", operator: "÷" },
      className: operatorClass(state.operator, "÷"),
    },
    { label: "7", action: { type: "digit", digit: "7" } },
    { label: "8", action: { type: "digit", digit: "8" } },
    { label: "9", action: { type: "digit", digit: "9" } },
    {
      label: "×",
      action: { type: "operator", operator: "×" },
      className: operatorClass(state.operator, "×"),
    },
    { label: "4", action: { type: "digit", digit: "4" } },
    { label: "5", action: { type: "digit", digit: "5" } },
    { label: "6", action: { type: "digit", digit: "6" } },
    {
      label: "−",
      action: { type: "operator", operator: "-" },
      className: operatorClass(state.operator, "-"),
    },
    { label: "1", action: { type: "digit", digit: "1" } },
    { label: "2", action: { type: "digit", digit: "2" } },
    { label: "3", action: { type: "digit", digit: "3" } },
    {
      label: "+",
      action: { type: "operator", operator: "+" },
      className: operatorClass(state.operator, "+"),
    },
    {
      label: "0",
      action: { type: "digit", digit: "0" },
      span: 2,
    },
    { label: ".", action: { type: "decimal" } },
    {
      label: "=",
      action: { type: "equals" },
      className:
        "bg-amber-400 text-stone-950 hover:bg-amber-300 focus-visible:border-amber-200",
    },
  ];

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(16rem,1fr)]">
      <section
        className="rounded-[2rem] bg-stone-950 p-4 shadow-[0_24px_80px_-24px_rgba(28,25,23,0.65)] ring-1 ring-stone-800 sm:p-5"
        aria-label="계산기"
      >
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-[11px] font-medium tracking-[0.22em] text-stone-500 uppercase">
            DeskCalc
          </p>
          <div className="flex items-center gap-2">
            {state.memory !== 0 ? (
              <span className="rounded-full bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-amber-300">
                M
              </span>
            ) : (
              <span className="px-2 py-0.5 font-mono text-[10px] tracking-wider text-stone-600">
                M
              </span>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-stone-400 hover:bg-stone-800 hover:text-stone-100"
                    onClick={() => dispatch({ type: "backspace" })}
                    aria-label="한 자리 지우기"
                  />
                }
              >
                <Delete />
              </TooltipTrigger>
              <TooltipContent>한 자리 지우기</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-stone-400 hover:bg-stone-800 hover:text-stone-100"
                    onClick={() => void copyResult()}
                    aria-label="결과 복사"
                  />
                }
              >
                {copied ? <Check /> : <Copy />}
              </TooltipTrigger>
              <TooltipContent>결과 복사</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mb-4 rounded-2xl bg-[#10150f] px-4 py-4 ring-1 ring-emerald-950">
          <p className="min-h-5 truncate text-right font-mono text-xs text-emerald-500/70">
            {state.error ? "오류" : state.expression || "\u00a0"}
          </p>
          <p
            className={cn(
              "mt-1 break-all text-right font-mono text-4xl leading-none font-semibold tracking-tight sm:text-5xl",
              state.error ? "text-red-400" : "text-amber-200",
            )}
            aria-live="polite"
          >
            {state.error ?? formatGrouped(state.display)}
          </p>
        </div>

        <div className="mb-2 grid grid-cols-4 gap-2">
          {memoryKeys.map((key) => (
            <Button
              key={key.label}
              variant="ghost"
              className="h-9 rounded-xl bg-stone-900 text-xs font-semibold tracking-wide text-stone-400 hover:bg-stone-800 hover:text-stone-100"
              onClick={() => dispatch(key.action)}
              aria-label={key.aria}
            >
              {key.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {keys.map((key) => (
            <Button
              key={key.label}
              className={cn(
                "h-14 rounded-2xl text-xl font-semibold sm:h-16",
                key.span === 2 && "col-span-2",
                key.className ??
                  "bg-stone-800 text-stone-50 hover:bg-stone-700",
              )}
              onClick={() => dispatch(key.action)}
              aria-label={key.aria ?? key.label}
            >
                {key.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="flex min-h-80 flex-col overflow-hidden rounded-[2rem] bg-[#f4efe4] shadow-[0_24px_80px_-32px_rgba(68,48,24,0.35)] ring-1 ring-stone-300/70">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="font-heading text-sm font-semibold text-stone-800">
              계산 기록
            </h2>
            <p className="text-xs text-stone-500">
              등호를 누르면 종이 테이프처럼 쌓입니다.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:bg-stone-200 hover:text-stone-800"
            onClick={() => dispatch({ type: "clearHistory" })}
            disabled={state.history.length === 0}
          >
            비우기
          </Button>
        </div>
        <Separator className="bg-stone-300/80" />
        <ScrollArea className="h-72 lg:h-auto lg:min-h-0 lg:flex-1">
          {state.history.length === 0 ? (
            <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-stone-600">
                아직 기록이 없습니다
              </p>
              <p className="mt-1 max-w-xs text-sm text-stone-500">
                숫자를 입력하고 = 를 누르면 식과 결과가 여기에 남습니다. 이
                브라우저에만 저장됩니다.
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-dashed divide-stone-300/90 font-mono">
              {state.history.map((entry) => (
                <li key={entry.id} className="px-5 py-3">
                  <p className="text-xs text-stone-500">{entry.expression}</p>
                  <p className="text-lg font-semibold text-stone-800">
                    = {formatGrouped(entry.result)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </ScrollArea>
      </section>
    </div>
  );
}

function operatorClass(current: Operator | null, operator: Operator): string {
  return cn(
    "bg-amber-500/90 text-stone-950 hover:bg-amber-400",
    current === operator && "ring-2 ring-amber-200",
  );
}
