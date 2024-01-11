import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserShops } from "@/app/api/shops/shopsAPI";
import ShopsTable from "@/components/ShopsTable";
import ShopCreateForm from "@/components/shopCreateForm";
import { getServerSession } from "next-auth"

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) return;
  const shops = await getUserShops(session?.user.id)
  if (shops.status !== 200) return <></>;


  return (
    <div>
      <h1>Hello, {session?.user?.name}</h1>
      <ShopCreateForm/>
      <ShopsTable shops={shops.data}/>
    </div>
  );
}

export default DashboardPage;
