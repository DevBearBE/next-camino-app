import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { Field } from "@base-ui/react";

type InputTextProps = InputProps & {
  readonly placeholder?: string;
  readonly type?: "text" | "email";
  readonly defaultValue?: string;
};

export default function Input({
  placeholder,
  type = "text",
  defaultValue,
  ...shellProps
}: InputTextProps) {
  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <Field.Control
          type={type}
          className={className}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      )}
    </InputShell>
  );
}
