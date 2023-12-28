import { getServerSession } from "next-auth"

const DashboardPage = async () => {
  const session = await getServerSession();
  
  return <h1>Hello, {session?.user?.name}</h1>;
}

export default DashboardPage;
