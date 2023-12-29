import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth"

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <h1>Hello, {session?.user.id}</h1>
  </div>
  );
}

export default DashboardPage;
