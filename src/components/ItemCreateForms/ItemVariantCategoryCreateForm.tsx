'use client'

import { createItemVariantCategory } from "@/app/api/items/itemsAPI";
import { ItemVariantCategoryInsert } from "@/db/schema/items";
import { useForm } from "react-hook-form"

type PropsType = {
  itemId: number
}


export default function ItemVariantCategoryCreateForm({itemId}: PropsType) {
  

  const {register, handleSubmit} = useForm<ItemVariantCategoryInsert>({
    defaultValues: {
      name: "",
      parentItemId: itemId,
    }
  });

  return (
    <form onSubmit={handleSubmit(async (formData) => createItemVariantCategory(formData))}>
      <input type="text" {...register("name")}/>
      <button>+</button>
    </form>
  )
}
