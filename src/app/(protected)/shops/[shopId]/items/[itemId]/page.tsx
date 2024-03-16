import { getAddonItems, getItemById, getItemOptionCategoriesByShop } from "@/app/api/items/itemsAPI";
import { getItemCategoriesByShopId } from "@/app/api/shops/shopsAPI";
import ItemCreateForm from "@/components/ItemCreateForms/ItemCreateForm";
import { notFound } from "next/navigation";

export default async function ItemPage({params}: {params: {itemId: string, shopId: string}}) {
  const shopId = parseInt(params.shopId); // Validated by shops layout
  const itemId = parseInt(params.itemId);

  if(!itemId || !shopId) return notFound();

  const itemDataResponse = await getItemById(itemId);
  const shopItemCategoriesResponse = await getItemCategoriesByShopId(shopId);
  const shopItemOptionCategoriesReponse = await getItemOptionCategoriesByShop(shopId);
  const addonItemsResponse = await getAddonItems(shopId);

  if(itemDataResponse.status === 404 ||
    shopItemCategoriesResponse.status === 404 || 
    shopItemOptionCategoriesReponse.status === 404 ||
    addonItemsResponse.status === 404) return notFound();
  if(itemDataResponse.status !== 200 ||
    shopItemCategoriesResponse.status !== 200 ||
    shopItemOptionCategoriesReponse.status !== 200 ||
    addonItemsResponse.status !== 200 ) throw new Error(itemDataResponse.message);

  const itemData = itemDataResponse.data;
  const shopItemCategories = shopItemCategoriesResponse.data;
  const shopItemOptionCategories = shopItemOptionCategoriesReponse.data.map(category => ({...category, options: category.options.map(option => option.optionItem)}));
  const addonItems = addonItemsResponse.data;

  return (
    <>
      <h1>Item Page for {itemDataResponse.data.name}</h1>
      <pre>{JSON.stringify(itemData)}</pre>
      <ItemCreateForm shopId={shopId} item={itemData} shopItemCategories={shopItemCategories} shopItemOptionCategories={shopItemOptionCategories} addonItems={addonItems}/>


    </>
  );
}

