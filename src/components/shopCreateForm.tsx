'use client'

import { createShop } from "@/app/api/shops/shopsAPI";
import { ShopInsert, shopInsertSchema } from "@/db/schema/shops";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

export default function ShopCreateForm() {
  const {data: session} = useSession();

  const {register, handleSubmit, } = useForm<ShopInsert>({
    defaultValues: {
      ownerId: session?.user.id,
      name: "",
    },
    resolver: zodResolver(shopInsertSchema),
  });

  async function onSubmit(data: ShopInsert) {
    createShop(data); 
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>  
      <input type="hidden" {...register("ownerId")}/>
      <label>
        Shop Name
        <input type="text" {...register("name")}/>
      </label>
      <button>Submit</button>
    </form>
  );

}
