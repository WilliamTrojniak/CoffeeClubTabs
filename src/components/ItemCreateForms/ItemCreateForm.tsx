'use client'

import { createItem, createItemCategory } from "@/app/api/items/itemsAPI";
import { ItemInsert, itemInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ItemCreateForm({shopId}: {shopId: number}) {

  const {register, handleSubmit, } = useForm<ItemInsert>({
    defaultValues: {
      name: "",
      basePrice: "" as unknown as number, 
      shopId: shopId,
    },
    resolver: zodResolver(itemInsertSchema),
  });

  return (
    <form noValidate onSubmit={handleSubmit(async (data) => console.log(await createItem(data)))}>  
      <input type="hidden" {...register("shopId")}/>
      <label>
        Item Name
        <input type="text" {...register("name")}/>
      </label>
      <label>
        Item Base Price
        <input type="text" {...register("basePrice", {
          valueAsNumber: true,
        })}/>
      </label>
      <button>Submit</button>
    </form>
  );

}
