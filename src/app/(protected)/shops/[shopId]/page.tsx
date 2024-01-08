import { getShopById } from "@/app/api/shops/shopsAPI";
import ShopCreatePaymentOptionForm from "@/components/ShopCreatePaymentOptionForm";
import { queryShopDetails } from "@/db/api/shops";
import { notFound } from "next/navigation";

export default async function ShopPage({params}: {params: {shopId: string}}) {
  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();
  
  // Data is guarunteed to exist by layout 
  const result = await getShopById(shopId);
  if (result.status !== 200) return <></>;
  console.log(await queryShopDetails(shopId))
  return (
    <>
    <p>{result.data.name}</p> 
    <ShopCreatePaymentOptionForm shopId={shopId}/>
    </>
  );
}
