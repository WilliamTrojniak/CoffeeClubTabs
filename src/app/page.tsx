import { authOptions } from "./api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth";

export default async function Home() {
  const session = await getServerSession();
  console.log(session);
  return <pre>{JSON.stringify(session, null, 2)}</pre> 
}
