"use client";

import { Drawer } from "@base-ui/react/drawer";
import Button from "@/components/atoms/buttons/button";
import NewRegistrationCreateForm from "@/components/organisms/form/new-registration/new-registration-create-form";
import { useState } from "react";

export default function NewRegistrationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Trigger
        render={
          <Button leftIcon="plus" leftIconSize="xxs">
            Nieuwe aanmelding
          </Button>
        }
      />
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Viewport className="fixed inset-y-0 right-0 z-40 flex w-1/2">
          <Drawer.Popup className="flex w-full">
            <Drawer.Content className="bg-white grow h-screen flex flex-col">
              <section className="px-8 py-6 flex flex-col gap-y-1.5 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.15)]">
                <Drawer.Description className="text-primary-400 font-bold text-sm uppercase tracking-wider">
                  Wachtlijst
                </Drawer.Description>
                <Drawer.Title className="font-black text-xl">
                  Nieuwe aanmelding
                </Drawer.Title>
              </section>
              <section className="grow overflow-y-auto overflow-x-hidden min-h-0">
                <NewRegistrationCreateForm
                  onSuccessAction={() => setIsOpen(false)}
                  onPendingStateAction={setIsPendingSubmit}
                />
              </section>
              <section className="px-8 py-4 flex items-center gap-x-4 justify-end">
                <Drawer.Close
                  render={
                    <Button
                      variant="destructive"
                      leftIcon="x"
                      leftIconSize="xxs"
                      disabled={isPendingSubmit}
                    >
                      Annuleren
                    </Button>
                  }
                />
                <Button
                  leftIcon="check"
                  leftIconSize="xxs"
                  type="submit"
                  form="new-registration-form"
                  disabled={isPendingSubmit}
                >
                  {isPendingSubmit ? "Bezig.." : "Opslaan"}
                </Button>
              </section>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
