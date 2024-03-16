'use client'

import { ItemUpdateData, updateItem } from "@/app/api/items/itemsAPI";
import { itemInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type PropsType = {
  shopId: number,
  itemId?: number,
}


export default function ItemCreateForm({shopId, itemId}: PropsType) {

  const {register, handleSubmit, } = useForm<ItemUpdateData>({
    defaultValues: {
      item: {
        name: "",
        basePrice: "" as unknown as number, 
        shopId: shopId,
        id: itemId,
      },
      itemCategories: [],
    },
    // TODO Add a resolver
  });

  return (
    <form noValidate onSubmit={handleSubmit(async (formData) => console.log(await updateItem(formData)))}>  
      <input type="hidden" {...register("item.id")}/>
      <input type="hidden" {...register("item.shopId")}/>
      <label>
        Item Name
        <input type="text" {...register("item.name")}/>
        <input type="hidden" {...register("itemCategories")}/>
      </label>
      <label>
        Item Base Price
        <input type="text" {...register("item.basePrice", {
          valueAsNumber: true,
        })}/>
      </label>
      <button>Submit</button>
    </form>
  );

}
