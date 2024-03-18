'use client'

import { ItemUpdateData, updateItem } from "@/app/api/items/itemsAPI";
import { Item, ItemCategory, ItemOptionCategory } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { queryItemById } from "@/db/api/items";
import ItemOptionsInput from "./ItemOptionInput/ItemOptionsInput";
import ItemSelect from "../ItemSelect/ItemSelect";
import { ItemUpdateSchema } from "@/app/api/items/schema";
import ItemCategoriesInput from "./ItemCategoriesInput";
import ItemVariantsInput from "./ItemVariantsInput/ItemVariantsInput";

type PropsType = {
  shopId: number,
  item?: Awaited<ReturnType<typeof queryItemById>>,
  shopItemCategories: ItemCategory[],
  shopItemOptionCategories: (ItemOptionCategory & {options: Item[]})[],
  addonItems: Item[],
}


export default function ItemForm({shopId, item, shopItemCategories, shopItemOptionCategories, addonItems}: PropsType) {

  const methods = useForm<ItemUpdateData>({
    defaultValues: {
      shopId: shopId,
      item: {
        name: item?.name ?? "",
        basePrice: item?.basePrice ?? "" as unknown as number, 
        id: item?.id,
      },
      itemCategories: item?.categories.map(category => category.category) ?? [],
      itemVariants: item?.variants ?? [],
      itemOptions: shopItemOptionCategories.map(category => ({...category, enabled: item?.options.find(itemCategory => itemCategory.optionCategory.id === category.id) ? true : false})) ?? [],
      itemAddons: item?.addons.map(entry => entry.addonItem) ?? [], 
    },
    resolver: zodResolver(ItemUpdateSchema),
  });
  const {register, handleSubmit, reset, formState: {errors} } = methods;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(async (formData) => {
        console.log(formData);
        console.log(await updateItem(formData));
      })}>  
        <label>
          Item Name
          <input type="text" {...register("item.name")} defaultValue={item?.name}/>
          {errors.item?.name && <p>{ errors.item.name.message }</p> }
        </label>
        <label>
          Item Base Price
          <input type="text" {...register("item.basePrice", {
            valueAsNumber: true,
          })} defaultValue={item?.basePrice} />
          {errors.item?.basePrice && <p>{ errors.item.basePrice.message }</p> }
        </label>
        <ItemCategoriesInput name="itemCategories" categoryOptions={shopItemCategories}/>
        <ItemVariantsInput />
        <ItemOptionsInput addonItems={addonItems}/>
        <ItemSelect name="itemAddons" addonItems={addonItems}/>
        <button type="button" onClick={() => reset()}>Reset</button>
        <button>Submit</button>
      </form>
    </FormProvider>
  );

}
