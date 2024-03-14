'use client'
import { createItemOptionCategory } from "@/app/api/items/itemsAPI";
import { ItemOptionCategoryInsert } from "@/db/schema/items";
import { useForm } from "react-hook-form";

export default function ItemOptionCategoryCreateForm({shopId}: {shopId: number}) {
  
  const {handleSubmit, register, reset} = useForm<ItemOptionCategoryInsert>({
    defaultValues: {
      name: "",
      shopId: shopId,
    }
  });

  return (
    <form onSubmit={handleSubmit(async (formData) => {
      const result = await createItemOptionCategory(formData);
      if (result.status === 200) reset();
    })}>
      <input type="hidden" {...register("shopId")}/>
      <input type="text" {...register("name")}/>
      <button>+</button>
    </form>
  );

}
