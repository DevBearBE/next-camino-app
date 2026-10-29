"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import Button from "@/components/atoms/buttons/button";
import { deleteWaitlistItemAction } from "@/lib/actions/waitlist-items";
import { toastManager } from "@/lib/utils/toasts/toast-manager";

type DeleteWaitlistItemButtonProps = {
  readonly patientId: string;
  readonly name: string;
  readonly disabled?: boolean;
  readonly onDeletedAction: () => void;
};

export default function DeleteWaitlistItemButton({
  patientId,
  name,
  disabled = false,
  onDeletedAction,
}: DeleteWaitlistItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { executeAsync, isPending } = useAction(deleteWaitlistItemAction);

  const handleConfirm = async (): Promise<void> => {
    setIsOpen(false);

    const result = await executeAsync({ patientId }).catch(() => undefined);

    if (!result || result.serverError || result.validationErrors) {
      toastManager.add({
        title: "Er ging iets mis..",
        description:
          result?.serverError ?? "Het dossier kon niet verwijderd worden.",
        type: "error",
      });
      return;
    }

    toastManager.add({ title: "Dossier verwijderd", type: "success" });
    onDeletedAction();
  };

  return (
    <AlertDialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialog.Trigger
        render={
          <Button
            variant="destructive"
            leftIcon="trash"
            leftIconSize="xxs"
            disabled={disabled || isPending}
            className="[&>svg]:-translate-y-px"
          >
            Fiche verwijderen
          </Button>
        }
      />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-40 bg-black/40" />
        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <AlertDialog.Title className="font-black text-xl">
            Dossier van {name} verwijderen
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-primary-400">
            Het dossier en de gegevens van de voogden die nergens anders
            gekoppeld zijn, worden definitief verwijderd. Dit kan niet ongedaan
            gemaakt worden.
          </AlertDialog.Description>
          <div className="mt-6 flex items-center justify-end gap-x-4">
            <AlertDialog.Close
              render={
                <Button variant="ghost" leftIcon="x" leftIconSize="xxs">
                  Annuleren
                </Button>
              }
            />
            <Button
              variant="destructive"
              leftIcon="trash"
              leftIconSize="xxs"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleConfirm}
            >
              Verwijderen
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
