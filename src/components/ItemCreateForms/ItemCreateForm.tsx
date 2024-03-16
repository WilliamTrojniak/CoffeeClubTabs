'use client'

import { ItemUpdateData, updateItem } from "@/app/api/items/itemsAPI";
import { ItemCategory } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import ItemCreateCategoryForm from "./ItemCreateCategoryForm";
import { queryItemById } from "@/db/api/items";

type PropsType = {
  shopId: number,
  item?: Awaited<ReturnType<typeof queryItemById>>,
  shopItemCategories: ItemCategory[],
}


export default function ItemCreateForm({shopId, item, shopItemCategories}: PropsType) {

  const methods = useForm<ItemUpdateData>({
    defaultValues: {
      item: {
        name: item?.name ?? "",
        basePrice: item?.basePrice ?? "" as unknown as number, 
        shopId: shopId,
        id: item?.id,
      },
      itemCategories: item?.categories.map(category => category.category) ?? [],
    },
    // TODO Add a resolver
  });
  const {register, handleSubmit} = methods;

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={handleSubmit(async (formData) => await updateItem(formData))}>  
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
        <button>Submit</button>
      </form>
    </FormProvider>
  );

}
