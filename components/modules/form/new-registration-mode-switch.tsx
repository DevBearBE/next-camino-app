import { cn } from "@/lib/utils/functions/styling";

export type NewRegistrationMode = "new" | "existing";

type NewRegistrationModeSwitchProps = {
  readonly mode: NewRegistrationMode;
  readonly onModeChangeAction: (mode: NewRegistrationMode) => void;
  readonly disabled?: boolean;
};

const modes: readonly { value: NewRegistrationMode; label: string }[] = [
  { value: "new", label: "Nieuw kind" },
  { value: "existing", label: "Bestaand kind" },
];

export default function NewRegistrationModeSwitch({
  mode,
  onModeChangeAction,
  disabled = false,
}: NewRegistrationModeSwitchProps) {
  return (
    <fieldset className="flex w-fit gap-x-1 rounded-full bg-primary-100 p-1">
      <legend className="sr-only">Soort aanmelding</legend>
      {modes.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={mode === option.value}
          disabled={disabled}
          onClick={() => onModeChangeAction(option.value)}
          className={cn(
            "cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-ink-500 transition-colors disabled:cursor-not-allowed disabled:opacity-60",
            mode === option.value && "bg-white text-ink-900 shadow-soft",
          )}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
