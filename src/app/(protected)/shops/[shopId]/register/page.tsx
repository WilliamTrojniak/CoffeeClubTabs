import { getItemsByShopId } from "@/app/api/items/itemsAPI";
import { getShopDetails } from "@/app/api/shops/shopsAPI";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function RegisterPage({params}: {params: {shopId: string}}) { 

  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();
  
  const itemsData = await getItemsByShopId(shopId);
  if (itemsData.status === 404 || itemsData.status === 400) return notFound(); 
  if (itemsData.status !== 200) throw new Error(itemsData.message);
  
  const shopDetails = await getShopDetails(shopId);
  if (shopDetails.status === 404 || shopDetails.status === 400) return notFound();
  if (shopDetails.status !== 200) throw new Error(shopDetails.message);

  const items = itemsData.data.map(item => {
    return <li key={item.id}><Link href={`/shops/${shopId}/items/${item.id}`}>{item.name} </Link></li>
  });

  
  return (
    <>
      <h1>Register</h1>
      <br/>
      {items}
    </>
  )
}
