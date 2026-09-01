import Button from "@/components/atoms/buttons/button";
import Input from "@/components/atoms/form/input";

type GuardianFieldsProps = {
  readonly id: string;
  readonly index: number;
  readonly onRemoveAction: () => void;
};

export default function GuardianInput({
  id,
  index,
  onRemoveAction,
}: GuardianFieldsProps) {
  return (
    <section className="flex flex-col gap-y-4 border-t border-primary-100 pt-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-extrabold uppercase tracking-wider text-primary-500">
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
        <Input name={`guardians.${id}.firstName`} label="Voornaam" required />
        <Input name={`guardians.${id}.lastName`} label="Achternaam" required />
        <Input name={`guardians.${id}.tel`} label="Telefoonnummer" />
        <Input name={`guardians.${id}.email`} label="E-mail" />
      </div>
    </section>
  );
}
