'use client'

import { ItemInsert, itemInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useItemCreateFormContext } from "./ItemCreateForm";

export default function ItemCreateItemForm({shopId}: {shopId: number}) {

  const formContext = useItemCreateFormContext();

  const {register, handleSubmit, } = useForm<ItemInsert>({
    defaultValues: formContext?.data.itemCreateData ?? {
      name: "",
      basePrice: "" as unknown as number, 
      shopId: shopId,
    },
    resolver: zodResolver(itemInsertSchema),
  });

  if (!formContext) return <h1>Could not load form: No context provided</h1>;

  return (
    <form noValidate onSubmit={handleSubmit((data) => { 
      formContext.setItemCreateData(data);
      formContext.nextStage();
    })}>  
      <input type="hidden" {...register("shopId")}/>
      <label>
        Item Category Name
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
