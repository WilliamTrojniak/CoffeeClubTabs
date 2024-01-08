import { getItemsByShop } from "@/app/api/items/itemsAPI";
import ItemCreateForm from "@/components/ItemCreateForm/ItemCreateForm";
import { notFound } from "next/navigation";

export default async function RegisterPage({params}: {params: {shopId: string}}) { 

  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();
  const itemsData = await getItemsByShop(shopId);
  if (itemsData.status === 404 || itemsData.status === 400) return notFound(); 
  if (itemsData.status !== 200) throw new Error(itemsData.message);
  const items = itemsData.data.map(item => {
    return <li key={item.id}>{item.name} {item.basePrice}</li>
  });

  return (
    <>
      <h1>Register</h1>
      <ItemCreateForm stage={0} shopId={shopId} itemCategories={[{id: 1, name: "test", shopId: shopId}]}/>
      {items}
    </>
  )
}
