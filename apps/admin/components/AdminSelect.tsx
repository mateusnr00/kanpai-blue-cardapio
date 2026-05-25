"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type Props = {
  id?: string;
  /** Omitir em selects só de navegação (sem formulário). */
  name?: string;
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AdminSelect({
  id,
  name,
  options,
  defaultValue,
  value,
  onChange,
  placeholder = "Selecione…",
  required,
  disabled,
  className,
}: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const firstEnabled = options.find((o) => !o.disabled);
  const initial = defaultValue ?? firstEnabled?.value ?? "";

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(initial);
  const selectedValue = isControlled ? value : internalValue;

  const enabledOptions = options.filter((o) => !o.disabled);
  const selectedOption = options.find((o) => o.value === selectedValue);
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

  function toggleOpen() {
    if (disabled) return;
    setOpen((o) => !o);
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
      return;
    }

    if (e.key === "Home") {
      e.preventDefault();
      setHighlightIndex(0);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      setHighlightIndex(enabledOptions.length - 1);
    }
  }

  const triggerId = id ?? (name ? `${name}-select` : listId + "-trigger");

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {name ? (
        <input type="hidden" name={name} value={selectedValue} required={required} disabled={disabled} />
      ) : null}

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggleOpen}
        onKeyDown={onKeyDown}
        className={
          "admin-select-trigger w-full " +
          (open ? "admin-select-trigger-open " : "") +
          (disabled ? "cursor-not-allowed opacity-50 " : "")
        }
      >
        <span className={selectedOption ? "text-ink" : "text-ink-faint"}>{displayLabel}</span>
        <CaretDown
          size={16}
          weight="bold"
          className={"shrink-0 text-ink-muted transition-transform " + (open ? "rotate-180" : "")}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={triggerId}
          className="admin-select-menu absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto py-1"
        >
          {options.map((opt) => {
            const enabledIdx = enabledOptions.findIndex((o) => o.value === opt.value);
            const isSelected = opt.value === selectedValue;
            const isHighlighted = !opt.disabled && enabledIdx === highlightIndex;

            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                onMouseEnter={() => {
                  if (!opt.disabled && enabledIdx >= 0) setHighlightIndex(enabledIdx);
                }}
                onClick={() => {
                  if (!opt.disabled) commit(opt.value);
                }}
                className={
                  "admin-select-option " +
                  (opt.disabled
                    ? "cursor-not-allowed text-ink-faint"
                    : isSelected || isHighlighted
                      ? "admin-select-option-active"
                      : "")
                }
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
