
import { getShopById } from "@/app/api/shops/shopsAPI";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReactNode } from "react";


const ShopPageLayout = async ({params, children}: {params: {shopId: string}, children: ReactNode}) => {
  const shopId = parseInt(params.shopId);
  if (!shopId) return notFound(); 

  const result = await getShopById(shopId);
  if (result.status === 404) return notFound();
  if (result.status !== 200) throw new Error(result.message);
  
  return (
    <>
    <div>
        <Link href={`/shops/${shopId}/register`}>Register</Link>
        <Link href={`/shops/${shopId}/tabs`}>Tabs</Link>
    </div>
    {children}
    </>
  );
}

export default ShopPageLayout;
