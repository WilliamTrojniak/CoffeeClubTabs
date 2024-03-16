'use client'

import { ItemUpdateData, updateItem } from "@/app/api/items/itemsAPI";
import { Item, ItemCategory, ItemOptionCategory, itemCategories } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import ItemCreateCategoryForm from "./ItemCreateCategoryForm";
import { queryItemById } from "@/db/api/items";
import ItemVariantsInput from "./ItemVariantForm/ItemVariantsInput";
import ItemOptionsInput from "./ItemOptionInput/ItemOptionsInput";
import ItemSelect from "../ItemSelect/ItemSelect";

type PropsType = {
  shopId: number,
  item?: Awaited<ReturnType<typeof queryItemById>>,
  shopItemCategories: ItemCategory[],
  shopItemOptionCategories: (ItemOptionCategory & {options: Item[]})[],
  addonItems: Item[],
}


export default function ItemCreateForm({shopId, item, shopItemCategories, shopItemOptionCategories, addonItems}: PropsType) {

  const methods = useForm<ItemUpdateData>({
    defaultValues: {
      item: {
        name: item?.name ?? "",
        basePrice: item?.basePrice ?? "" as unknown as number, 
        shopId: shopId,
        id: item?.id,
      },
      itemCategories: item?.categories.map(category => category.category) ?? [],
      itemVariants: item?.variants ?? [],
      itemOptions: shopItemOptionCategories.map(category => ({...category, enabled: item?.options.find(itemCategory => itemCategory.optionCategory.id === category.id) ? true : false})) ?? [],
      itemAddons: item?.addons.map(entry => entry.addonItem) ?? [], // TODO Fill in
    },
    // TODO Add a resolver
  });
  const {register, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(async (formData) => {
        console.log(formData);
        console.log(await updateItem(formData));
      })}>  
        <input type="hidden" {...register("item.id")} defaultValue={item?.id}/>
        <input type="hidden" {...register("item.shopId")} defaultValue={shopId}/>
        <label>
          Item Name
          <input type="text" {...register("item.name")} defaultValue={item?.name}/>
        </label>
        <label>
          Item Base Price
          <input type="text" {...register("item.basePrice", {
            valueAsNumber: true,
          })} defaultValue={item?.basePrice} />
        </label>
        <ItemCreateCategoryForm name="itemCategories" shopId={shopId} categoryOptions={shopItemCategories}/>
        <ItemVariantsInput name="itemVariants" itemId={item?.id}/>
        <ItemOptionsInput name="itemOptions" itemId={item?.id} addonItems={addonItems}/>
        <ItemSelect name="itemAddons" addonItems={addonItems}/>
        <button>Submit</button>
      </form>
    </FormProvider>
  );

}
