import { getAddonItems, getItemById, getItemOptionCategoriesByShop } from "@/app/api/items/itemsAPI";
import { getItemCategoriesByShopId } from "@/app/api/shops/shopsAPI";
import ItemCreateCategoryForm from "@/components/ItemCreateForms/ItemCreateCategoryForm";
import ItemCreateForm from "@/components/ItemCreateForms/ItemCreateForm";
import ItemOptionCategoryCreateForm from "@/components/ItemCreateForms/ItemOptionCategoryCreateForm";
import ItemOptionCategoryModifyForm from "@/components/ItemCreateForms/ItemOptionCategoryModifyForm";
import ItemVariantCategoryCreateForm from "@/components/ItemCreateForms/ItemVariantCategoryCreateForm";
import ItemVariantForm from "@/components/ItemCreateForms/ItemVariantForm/ItemVariantForm";
import { itemCategories } from "@/db/schema/items";
import { notFound } from "next/navigation";

export default async function ItemPage({params}: {params: {itemId: string, shopId: string}}) {
  const shopId = parseInt(params.shopId); // Validated by shops layout
  const itemId = parseInt(params.itemId);

  if(!itemId || !shopId) return notFound();

  const itemDataResponse = await getItemById(itemId);
  const shopItemCategoriesResponse = await getItemCategoriesByShopId(shopId);
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
      <ItemCreateForm shopId={shopId} item={itemData} shopItemCategories={shopItemCategories}/>


    </>
  );

}

      // <ItemCreateCategoryForm 
      //   shopId={itemData.shop.id}
      //   itemId={itemId}
      //   selectedCategories={itemData.categories.map(c => c.category)}
      //   categories={shopItemCategories}/>
      // <ItemVariantCategoryCreateForm itemId={itemData.id}/>
      // {itemData.variants.map(v => (<ItemVariantForm key={v.id} itemId={itemData.id} variantCategory={v} variants={v.variantOptions}/>))}
      // <ItemOptionCategoryCreateForm shopId={itemData.shop.id}/>
      // {itemOptionCategories.map(i => (
      //   <ItemOptionCategoryModifyForm
      //     key={i.id} itemId={itemData.id}
      //     itemHasEnabled={itemData.options.find(optionCategory => optionCategory.optionCategory.id === i.id) ? true : false} 
      //     category={i}
      //     addonItems={addonItems}
      //     defaultItems={i.itemOptionCategoryOptions.map(i => i.optionItem)}/>
      // ))}
