import WaitlistPage from "@/components/pages/waitlist-page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wachtlijst",
};

export default function Waitlist() {
  return <WaitlistPage />;
}
