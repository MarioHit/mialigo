import { redirect } from "next/navigation";

// /dashboard reste l'URL d'arrivée du magic link (?next=/dashboard) :
// elle renvoie vers la première sous-page.
export default function DashboardPage() {
  redirect("/dashboard/profil");
}
