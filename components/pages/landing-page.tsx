import { SignInButton } from "@clerk/nextjs";
import Button from "@/components/atoms/buttons/button";
import Logo from "@/components/modules/logos/logo";

export default function LandingPage() {
  return (
    <main className="grow flex flex-col items-center justify-center gap-y-12">
      <section className="flex flex-col items-center justify-center gap-y-4">
        <p className="text-gray-400/75 text-sm tracking-widest font-black uppercase">
          PraktijkPortaal
        </p>
        <Logo className="text-7xl" />
      </section>
      <section className="flex flex-col items-center justify-center gap-y-4">
        <SignInButton>
          <Button>Sign in</Button>
        </SignInButton>

        <div className="px-4 py-1.5 bg-primary-50 rounded-full flex items-center justify-center gap-x-3 border border-primary-300/50">
          <p className="px-2 bg-primary-300/40 text-primary-600 rounded-full">
            ?
          </p>
          <p className="grow text-gray-400 text-sm">
            Geen account? Vraag de coördinator om je toe te voegen
          </p>
        </div>
      </section>
    </main>
  );
}
