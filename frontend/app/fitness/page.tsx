// app/fitness/page.tsx
import { redirect } from "next/navigation";

export default function FitnessHome() {
  redirect("/fitness/dashboard");
}
