import Button from "@/components/atoms/buttons/button";
import Input from "@/components/atoms/form/input";

type GuardianFieldsProps = {
  readonly id: string;
  readonly index: number;
  readonly onRemoveAction: () => void;
  readonly defaultValues?: {
    readonly firstName?: string;
    readonly lastName?: string;
    readonly tel?: string | null;
    readonly email?: string | null;
  };
};

export default function GuardianInput({
  id,
  index,
  onRemoveAction,
  defaultValues,
}: GuardianFieldsProps) {
  return (
    <section className="pt-2 flex flex-col gap-y-2 border-t border-primary-100">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold tracking-wide text-primary-400">
          Ouder {index + 1}
        </p>
        <Button
          type="button"
          variant="destructive"
          leftIcon="trash"
          leftIconSize="xxs"
          onClick={onRemoveAction}
        >
          Verwijderen
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <Input
          name={`guardians.${id}.firstName`}
          label="Voornaam"
          defaultValue={defaultValues?.firstName}
          required
        />
        <Input
          name={`guardians.${id}.lastName`}
          label="Achternaam"
          defaultValue={defaultValues?.lastName}
          required
        />
        <Input
          name={`guardians.${id}.tel`}
          label="Telefoonnummer"
          defaultValue={defaultValues?.tel ?? undefined}
        />
        <Input
          name={`guardians.${id}.email`}
          label="E-mail"
          defaultValue={defaultValues?.email ?? undefined}
        />
      </div>
    </section>
  );
}
