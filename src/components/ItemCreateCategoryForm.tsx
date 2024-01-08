'use client'

import { createItemCategory } from "@/app/api/items/itemsAPI";
import { ItemCategoriesInsert, itemCategoriesInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ItemCreateCategoryForm({shopId}: {shopId: number}) {

  const {register, handleSubmit, } = useForm<ItemCategoriesInsert>({
    defaultValues: {
      name: "",
      shopId: shopId,
    },
    resolver: zodResolver(itemCategoriesInsertSchema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => console.log(await createItemCategory(data)))}>  
      <input type="hidden" {...register("shopId")}/>
      <label>
        Item Category Name
        <input type="text" {...register("name")}/>
      </label>
      <button>Submit</button>
    </form>
  );

}
