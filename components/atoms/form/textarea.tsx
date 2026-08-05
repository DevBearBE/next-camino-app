import InputShell, {
  type InputProps,
} from "@/components/atoms/form/input-shell";
import { Field } from "@base-ui/react";

type TextAreaProps = InputProps & {
  readonly rows: number;
};

export default function Textarea({ rows, ...shellProps }: TextAreaProps) {
  return (
    <InputShell {...shellProps}>
      {(className: string) => (
        <Field.Control
          render={<textarea className={className} rows={rows} />}
        />
      )}
    </InputShell>
  );
}
