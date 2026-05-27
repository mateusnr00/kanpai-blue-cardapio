"use client";

import { useEffect, useId, useRef, useState } from "react";
import { fs } from "@/lib/scale";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  id?: string;
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
};

function CaretIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="site-select-caret"
      style={{
        flexShrink: 0,
        color: "var(--ink-soft)",
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 150ms ease",
      }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteSelect({
  id,
  name,
  options,
  defaultValue,
  value,
  onChange,
  placeholder = "Selecione…",
  required,
  disabled,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const enabledOptions = options.filter((o) => !o.disabled);
  const firstEnabled = enabledOptions[0];
  const initial = defaultValue ?? firstEnabled?.value ?? "";

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(initial);
  const selectedValue = isControlled ? value : internalValue;

  const selectedOption = enabledOptions.find((o) => o.value === selectedValue);
  const displayLabel = selectedOption?.label ?? placeholder;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) setHighlightIndex(-1);
    else {
      const idx = enabledOptions.findIndex((o) => o.value === selectedValue);
      setHighlightIndex(idx >= 0 ? idx : 0);
    }
  }, [open, enabledOptions, selectedValue]);

  function commit(next: string) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => (i < enabledOptions.length - 1 ? i + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => (i > 0 ? i - 1 : enabledOptions.length - 1));
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = enabledOptions[highlightIndex];
      if (opt) commit(opt.value);
    }
  }

  const triggerId = id ?? (name ? `${name}-select` : `${listId}-trigger`);

  return (
    <div ref={rootRef} style={{ position: "relative", width: "100%" }}>
      {name ? (
        <input type="hidden" name={name} value={selectedValue} required={required} disabled={disabled} />
      ) : null}

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={"site-select-trigger " + (open ? "site-select-trigger--open " : "")}
        style={{
          fontSize: fs(14),
          borderRadius: open ? undefined : 12,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <span style={{ color: selectedOption ? "var(--ink)" : "var(--ink-soft)" }}>{displayLabel}</span>
        <CaretIcon open={open} />
      </button>

      {open ? (
        <ul id={listId} role="listbox" aria-labelledby={triggerId} className="site-select-menu">
          {enabledOptions.map((opt, idx) => {
            const isSelected = opt.value === selectedValue;
            const isHighlighted = idx === highlightIndex;
            const active = isSelected || isHighlighted;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightIndex(idx)}
                onClick={() => commit(opt.value)}
                className={"site-select-option " + (active ? "site-select-option--active " : "")}
                style={{ fontSize: fs(14) }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
