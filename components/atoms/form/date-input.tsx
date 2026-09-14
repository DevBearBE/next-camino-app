"use client";

import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { cn } from "@/lib/utils/functions/styling";
import { Field } from "@base-ui/react";
import { useState } from "react";

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

  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <Field.Control
          type="date"
          className={cn(
            className,
            hasValue ? "text-primary-800" : "text-primary-400",
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
      )}
    </InputShell>
  );
}
