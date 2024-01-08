import { getShopDetails } from "@/app/api/shops/shopsAPI";
import ShopCreatePaymentOptionForm from "@/components/ShopCreatePaymentOptionForm";
import { notFound } from "next/navigation";

export default async function ShopPage({params}: {params: {shopId: string}}) {
  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();
  
  // Data is guarunteed to exist by layout 
  const result = await getShopDetails(shopId);
  if (result.status !== 200) return <>{result.status}</>;
  
  const paymentOptions = result.data.payment_options.map(o => {
    return <li key={o.id}>{o.name}</li>
  })

  return (
    <>
    <p>{result.data.shop_data.name}</p> 
    <ShopCreatePaymentOptionForm shopId={shopId}/>
    {paymentOptions}
    </>
  );
}
