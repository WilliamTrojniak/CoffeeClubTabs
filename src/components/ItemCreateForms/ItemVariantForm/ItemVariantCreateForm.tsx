'use client'

import { ItemVariantInsert } from "@/db/schema/items";
import { useForm } from "react-hook-form";

type PropsType = {
  categoryId: number
}


export default function ItemVariantCreateForm({categoryId}: PropsType) {

  const {register, handleSubmit} = useForm<ItemVariantInsert>({
    defaultValues: {
      name: "",
      categoryId: categoryId,
      price: 0.00,
    }
  });

  return (
    <form noValidate onSubmit={handleSubmit(async (formData) => createItemVariantOption(formData))}>
      <input type="hidden" {...register("categoryId")}/>  
      <input type="text" {...register("name")}/>  
      <input type="text" {...register("price", {valueAsNumber: true})}/>  
      <button>Add</button>
    </form>
  );

}
