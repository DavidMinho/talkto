import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  try {
    const session = await getSession();
    redirect(session ? "/chats" : "/login");
  } catch {
    redirect("/login");
  }
}
