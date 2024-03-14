import { getAddonItems, getItemById, getItemOptionCategoriesByShop } from "@/app/api/items/itemsAPI";
import { getShopItemCategoriesById } from "@/app/api/shops/shopsAPI";
import ItemCreateCategoryForm from "@/components/ItemCreateForms/ItemCreateCategoryForm";
import ItemOptionCategoryCreateForm from "@/components/ItemCreateForms/ItemOptionCategoryCreateForm";
import ItemOptionCategoryModifyForm from "@/components/ItemCreateForms/ItemOptionCategoryModifyForm";
import ItemVariantCategoryCreateForm from "@/components/ItemCreateForms/ItemVariantCategoryCreateForm";
import { notFound } from "next/navigation";

export default async function ItemPage({params}: {params: {itemId: string, shopId: string}}) {
  const shopId = parseInt(params.shopId); // Validated by shops layout
  const itemId = parseInt(params.itemId);

  if(!itemId || !shopId) return notFound();

  const itemDataResponse = await getItemById(itemId);
  const shopItemCategoriesResponse = await getShopItemCategoriesById(shopId);
  const itemOptionCategoriesReponse = await getItemOptionCategoriesByShop(shopId);
  const addonItemsResponse = await getAddonItems(shopId);

  if(itemDataResponse.status === 404 ||
    shopItemCategoriesResponse.status === 404 || 
    itemOptionCategoriesReponse.status === 404 ||
    addonItemsResponse.status === 404) return notFound();
  if(itemDataResponse.status !== 200 ||
    shopItemCategoriesResponse.status !== 200 ||
    itemOptionCategoriesReponse.status !== 200 ||
    addonItemsResponse.status !== 200 ) throw new Error(itemDataResponse.message);

  const itemData = itemDataResponse.data;
  const shopItemCategories = shopItemCategoriesResponse.data;
  const itemOptionCategories = itemOptionCategoriesReponse.data;
  const addonItems = addonItemsResponse.data;

  return (
    <>
      <h1>Item Page for {itemDataResponse.data.name}</h1>
      <pre>{JSON.stringify(itemDataResponse.data)}</pre>
      <ItemCreateCategoryForm 
        shopId={itemData.shop.id}
        itemId={itemId}
        selectedCategories={itemData.categories.map(c => c.category)}
        categories={shopItemCategories}/>
      <ItemVariantCategoryCreateForm itemId={itemData.id}/>
      {itemData.variants.map(v => (<h4 key={v.id}>{v.name}</h4>))}
      <ItemOptionCategoryCreateForm shopId={itemData.shop.id}/>
      {itemOptionCategories.map(i => (
        <ItemOptionCategoryModifyForm
          key={i.id} itemId={itemData.id}
          itemHasEnabled={itemData.options.find(optionCategory => optionCategory.optionCategory.id === i.id) ? true : false} 
          category={i}
          addonItems={addonItems}
          defaultItems={i.itemOptionCategoryOptions.map(i => i.optionItem)}/>
      ))}
    </>
  );

}
