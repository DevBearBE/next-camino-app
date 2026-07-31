import NavListItem from "@/components/atoms/nav/nav-list-item";
import Logo from "@/components/modules/logos/logo";
import NavCategory from "@/components/modules/nav/nav-category";

export default function Sidebar() {
  return (
    <aside className="h-full w-72 flex flex-col gap-10">
      {/* LOGO */}
      <section>
        <Logo />
      </section>

      {/* NAVIGATION */}
      <section className="grow px-4">
        <nav className="flex flex-col gap-6">
          <NavCategory label="Praktijk">
            <NavListItem path="/waitlist" label="Wachtlijst" />
            <NavListItem path="/patients" label="Patiënten" />
          </NavCategory>
          <NavCategory label="Andere toepassingen">
            <NavListItem
              path="https://account.crossuite.app"
              label="Crossuite"
              isExternalLink
            />
          </NavCategory>
        </nav>
      </section>

      {/* LOGOUT */}
      <section>Kevin B.</section>
    </aside>
  );
}
