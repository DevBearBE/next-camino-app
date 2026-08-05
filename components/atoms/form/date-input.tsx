"use client";

import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { cn } from "@/lib/utils/functions/styling";
import { Field } from "@base-ui/react";
import { useState } from "react";

type DateInputProps = InputProps & {
  readonly defaultValue?: string;
  readonly min?: string; // "YYYY-MM-DD"
  readonly max?: string; // "YYYY-MM-DD"
};

export default function DateInput({
  min,
  max,
  defaultValue,
  ...shellProps
}: DateInputProps) {
  const [hasValue, setHasValue] = useState(Boolean(defaultValue));

  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <Field.Control
          type="date"
          className={cn(
            className,
            hasValue ? "text-primary-800" : "text-primary-400",
          )}
          defaultValue={defaultValue}
          onChange={(event) => setHasValue(Boolean(event.target.value))}
          required={shellProps.required}
          min={min}
          max={max}
        />
      )}
    </InputShell>
  );
}
