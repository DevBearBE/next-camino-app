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
    "w-full px-4 py-2.5 bg-primary-100 inset-ring inset-ring-primary-100 rounded-lg",
    "placeholder:text-primary-400",
    "hover:inset-ring-primary-400 focus:outline-none focus:bg-transparent focus:inset-ring-primary-400/40 transition-all ease-in-out duration-150",
    {
      "border-red-600 hover:border-red-600 focus:border-red-600": hasError,
    },
  );

  return (
    <Field.Root name={name} className="min-w-0">
      <Field.Label className="font-extrabold flex items-center gap-x-1 uppercase tracking-wider">
        {label}
        {required && <span className="text-accent-500">*</span>}
      </Field.Label>
      {children(controlClasses)}
      <Field.Error className="mt-0.5 text-accent-600/80 text-sm" />
    </Field.Root>
  );
}
