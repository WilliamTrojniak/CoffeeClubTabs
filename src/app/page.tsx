import { getServerSession } from "next-auth";
import DashboardPage from "./(protected)/dashboard/page";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession();
  if(!session || !session.user) {
    return (
      <div>
        <h1 className="text-3xl">Coffee Club Tab App</h1>
        <p>Sign in to Request a Tab</p>
        <Link href={"/api/auth/signin"}>Sign In</Link>
      </div>
    );
  }

  return <DashboardPage/>

}

