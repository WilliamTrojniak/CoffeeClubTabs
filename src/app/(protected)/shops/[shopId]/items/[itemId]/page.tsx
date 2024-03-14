import { getItemById, getItemOptionCategoriesByShop } from "@/app/api/items/itemsAPI";
import { getShopItemCategoriesById } from "@/app/api/shops/shopsAPI";
import ItemCreateCategoryForm from "@/components/ItemCreateForms/ItemCreateCategoryForm";
import ItemOptionsForm from "@/components/ItemCreateForms/ItemOptionsForm";
import { notFound } from "next/navigation";

export default async function ItemPage({params}: {params: {itemId: string, shopId: string}}) {
  const shopId = parseInt(params.shopId); // Validated by shops layout
  const itemId = parseInt(params.itemId);

  if(!itemId || !shopId) return notFound();

  const itemDataResponse = await getItemById(itemId);
  const shopItemCategoriesResponse = await getShopItemCategoriesById(shopId);
  const itemOptionCategoriesReponse = await getItemOptionCategoriesByShop(shopId);
  if(itemDataResponse.status === 404 ||
    shopItemCategoriesResponse.status === 404 || 
    itemOptionCategoriesReponse.status === 404) return notFound();
  if(itemDataResponse.status !== 200 ||
    shopItemCategoriesResponse.status !== 200 ||
    itemOptionCategoriesReponse.status !== 200) throw new Error(itemDataResponse.message);

  const itemData = itemDataResponse.data;
  const shopItemCategories = shopItemCategoriesResponse.data;
  const itemOptionCategories = itemOptionCategoriesReponse.data;

  return (
    <>
      <h1>Item Page for {itemDataResponse.data.name}</h1>
      <pre>{JSON.stringify(itemDataResponse.data)}</pre>
      <ItemCreateCategoryForm 
        shopId={itemData.shop.id}
        itemId={itemId}
        selectedCategories={itemData.categories.map(c => c.category)}
        categories={shopItemCategories}/>
      <ItemOptionsForm shopId={itemData.shop.id}/>
      {itemOptionCategories.map(i => (<div key={i.id}>{i.name}</div>))}
    </>
  );

}
