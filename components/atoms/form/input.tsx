import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { Field } from "@base-ui/react";

type InputTextProps = InputProps & {
  readonly placeholder?: string;
  readonly type?: "text" | "email";
};

export default function Input({
  placeholder,
  type = "text",
  ...shellProps
}: InputTextProps) {
  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <Field.Control
          type={type}
          className={className}
          placeholder={placeholder}
          required={shellProps.required}
        />
      )}
    </InputShell>
  );
}
