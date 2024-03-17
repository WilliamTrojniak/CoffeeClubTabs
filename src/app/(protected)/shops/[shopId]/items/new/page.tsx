import { getAddonItems, getItemOptionCategoriesByShop } from "@/app/api/items/itemsAPI";
import { getItemCategoriesByShopId } from "@/app/api/shops/shopsAPI";
import ItemCreateForm from "@/components/ItemCreateForms/ItemCreateForm";
import { notFound } from "next/navigation";

export default async function ItemNewPage({params}: {params: {shopId: string}}) {

  const shopId = parseInt(params.shopId); // Validated by shops layout

  if(!shopId) return notFound();

  const shopItemCategoriesResponse = await getItemCategoriesByShopId(shopId);
  const shopItemOptionCategoriesReponse = await getItemOptionCategoriesByShop(shopId);
  const addonItemsResponse = await getAddonItems(shopId);

  if(shopItemCategoriesResponse.status === 404 ||
    shopItemOptionCategoriesReponse.status === 404 ||
    addonItemsResponse.status === 404) return notFound();
  if(shopItemCategoriesResponse.status !== 200 ||
    shopItemOptionCategoriesReponse.status !== 200 ||
    addonItemsResponse.status !== 200 ) throw new Error(shopItemCategoriesResponse.message);

  const shopItemCategories = shopItemCategoriesResponse.data;
  const shopItemOptionCategories = shopItemOptionCategoriesReponse.data.map(category => ({...category, options: category.options.map(option => option.optionItem)}));
  const addonItems = addonItemsResponse.data;

  return (
    <>
      <h1>Create a new item</h1>
      <ItemCreateForm shopId={shopId} shopItemCategories={shopItemCategories} shopItemOptionCategories={shopItemOptionCategories} addonItems={addonItems}/>


    </>
  );
}
