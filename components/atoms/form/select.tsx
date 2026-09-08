"use client";

import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { cn } from "@/lib/utils/functions/styling";
import { Select as BaseSelect } from "@base-ui/react/select";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string = string> = InputProps & {
  readonly options: readonly SelectOption<T>[];
  readonly placeholder?: string;
  readonly defaultValue?: T;
  readonly value?: T | null;
  readonly onValueChange?: (value: T | null) => void;
};

export default function Select<T extends string = string>({
  name,
  label,
  required = false,
  hasError = false,
  options,
  placeholder = "Selecteer...",
  defaultValue,
  value,
  onValueChange,
}: SelectProps<T>) {
  const isControlled = value !== undefined;
  return (
    <InputShell
      name={name}
      label={label}
      required={required}
      hasError={hasError}
    >
      {(controlClasses) => (
        <BaseSelect.Root
          name={name}
          items={[...options]}
          defaultValue={isControlled ? undefined : defaultValue}
          value={isControlled ? value : undefined}
          onValueChange={onValueChange}
        >
          <BaseSelect.Trigger
            className={cn(
              controlClasses,
              "flex min-w-0 items-center justify-between",
            )}
          >
            <BaseSelect.Value placeholder={placeholder} />
            <BaseSelect.Icon className="text-primary-400">▾</BaseSelect.Icon>
          </BaseSelect.Trigger>

          <BaseSelect.Portal>
            <BaseSelect.Positioner sideOffset={4} className="z-50">
              <BaseSelect.Popup className="min-w-[var(--anchor-width)] rounded-lg inset-ring inset-ring-primary-100 bg-white py-1 shadow-md">
                <BaseSelect.List>
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 px-4 py-2 text-sm data-highlighted:bg-primary-100 whitespace-nowrap truncate"
                    >
                      <BaseSelect.ItemIndicator>✓</BaseSelect.ItemIndicator>
                      <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      )}
    </InputShell>
  );
}
