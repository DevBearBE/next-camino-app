"use client";

import { Field } from "@base-ui/react";
import { useRef, useState } from "react";
import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import LucideIcon from "@/components/atoms/icons/lucide-icon";
import { cn } from "@/lib/utils/functions/styling";

type DateInputProps = InputProps & {
  readonly defaultValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly min?: string;
  readonly max?: string;
};

export default function DateInput({
  min,
  max,
  defaultValue,
  value,
  onValueChange,
  ...shellProps
}: DateInputProps) {
  const [touchedValue, setTouchedValue] = useState(Boolean(defaultValue));
  const isControlled = value !== undefined;
  const hasValue = isControlled ? Boolean(value) : touchedValue;
  const inputRef = useRef<HTMLInputElement>(null);

  const clear = () => {
    const input = inputRef.current;
    if (!input) return;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setValue?.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <div className="relative">
          <Field.Control
            ref={inputRef}
            type="date"
            className={cn(
              className,
              hasValue ? "pr-12 text-primary-800" : "text-primary-400",
            )}
            defaultValue={isControlled ? undefined : defaultValue}
            value={isControlled ? value : undefined}
            onChange={(event) => {
              if (!isControlled) setTouchedValue(Boolean(event.target.value));
              onValueChange?.(event.target.value);
            }}
            min={min}
            max={max}
          />
          {hasValue && (
            <button
              type="button"
              aria-label="Wis datum"
              onClick={clear}
              className="absolute right-10 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-primary-400 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-accent-500"
            >
              <LucideIcon name="x" size="xxs" />
            </button>
          )}
        </div>
      )}
    </InputShell>
  );
}
