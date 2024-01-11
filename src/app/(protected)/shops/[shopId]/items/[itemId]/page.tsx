import { getItemById } from "@/app/api/items/itemsAPI";
import ItemCreateCategoryForm from "@/components/ItemCreateForms/ItemCreateCategoryForm";
import { notFound } from "next/navigation";

export default async function ItemPage({params}: {params: {itemId: string, shopId: string}}) {
  const shopId = parseInt(params.shopId); // Validated by shops layout
  const itemId = parseInt(params.itemId);

  if(!itemId) return notFound();

  const itemDataResponse = await getItemById(itemId);
  if(itemDataResponse.status === 404) return notFound();
  if(itemDataResponse.status !== 200) throw new Error(itemDataResponse.message);

  const itemData = itemDataResponse.data;

  return (
    <>
      <h1>Item Page for {itemDataResponse.data.name}</h1>
      <pre>{JSON.stringify(itemDataResponse.data)}</pre>
      <ItemCreateCategoryForm shopId={itemData.shopId}/>
    </>
  );

}
