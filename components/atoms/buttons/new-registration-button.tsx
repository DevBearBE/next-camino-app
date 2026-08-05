"use client";

import { Drawer } from "@base-ui/react/drawer";
import Button from "@/components/atoms/buttons/button";
import NewRegistrationCreateForm from "@/components/organisms/form/new-registration/new-registration-create-form";
import { useState } from "react";

export default function NewRegistrationButton() {
  const [isOpen, setIsOpen] = useState(false);

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
        <Drawer.Backdrop className="fixed inset-0 bg-black/40" />
        <Drawer.Viewport className="fixed inset-y-0 right-0 flex w-1/2">
          <Drawer.Popup className="flex w-full">
            <Drawer.Content className="bg-white grow h-screen flex flex-col gap-y-4">
              <section className="px-8 py-6 flex flex-col gap-y-1.5 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.15)]">
                <Drawer.Description className="text-primary-400 font-bold text-sm uppercase tracking-wider">
                  Wachtlijst
                </Drawer.Description>
                <Drawer.Title className="font-black text-xl">
                  Nieuwe aanmelding
                </Drawer.Title>
              </section>
              <section className="grow">
                <NewRegistrationCreateForm
                  onSuccessAction={() => setIsOpen(false)}
                />
              </section>
              <section className="px-8 py-6 flex items-center gap-x-4 justify-end">
                <Drawer.Close
                  render={
                    <Button variant="ghost" leftIcon="x" leftIconSize="xxs">
                      Annuleren
                    </Button>
                  }
                />
                <Button
                  leftIcon="check"
                  leftIconSize="xxs"
                  type="submit"
                  form="new-registration-form"
                >
                  Opslaan
                </Button>
              </section>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
