import { getShopById } from "@/app/api/shops/shopsAPI";
import { notFound } from "next/navigation";

export default async function ShopPage({params}: {params: {shopId: string}}) {
  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();
  
  const result = await getShopById(shopId);
  if (result.status === 404) return notFound();
  if (result.status !== 200) throw new Error(result.message);


  return <p>{result.data.name}</p> 

}
