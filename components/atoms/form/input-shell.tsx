import { cn } from "@/lib/utils/functions/styling";
import { Field } from "@base-ui/react";
import { ReactNode } from "react";

export type InputProps = {
  readonly name: string;
  readonly label: string;
  readonly required?: boolean;
  readonly hasError?: boolean;
};

type InputShellProps = InputProps & {
  readonly children: (controlClasses: string) => ReactNode;
};

export default function InputShell({
  name,
  label,
  required = false,
  hasError = false,
  children,
}: InputShellProps) {
  const controlClasses = cn(
    "w-full px-4 py-2.5 bg-surface-input/50 inset-ring inset-ring-primary-300 rounded-lg",
    "placeholder:text-primary-400",
    "hover:inset-ring-2 hover:inset-ring-primary-500 focus:outline-none focus:bg-surface focus:inset-ring-2 focus:inset-ring-accent-500 transition-all ease-in-out duration-150",
    {
      "border-red-600 hover:border-red-600 focus:border-red-600": hasError,
    },
  );

  return (
    <Field.Root name={name} className="min-w-0">
      <Field.Label className="font-extrabold flex items-center gap-x-1 tracking-wide">
        {label}
        {required && <span className="text-accent-500">*</span>}
      </Field.Label>
      {children(controlClasses)}
      <Field.Error className="mt-0.5 text-accent-600/80 text-sm" />
    </Field.Root>
  );
}
