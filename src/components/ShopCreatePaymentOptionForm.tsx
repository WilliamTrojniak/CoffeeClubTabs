'use client'

import { createPaymentOption } from "@/app/api/shops/shopsAPI";
import { ShopPaymentOptionInsertData, shopPaymentOptionInsertSchema } from "@/db/schema/shops";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function ShopCreatePaymentOptionForm({shopId}: {shopId: number}) {

  const {register, handleSubmit, } = useForm<ShopPaymentOptionInsertData>({
    defaultValues: {
      name: "",
      shopId: shopId,
    },
    resolver: zodResolver(shopPaymentOptionInsertSchema),
  });

  return (
    <form onSubmit={handleSubmit(async (data) => console.log(await createPaymentOption(data)))}>  
      <input type="hidden" {...register("shopId")}/>
      <label>
        Payment Option Name
        <input type="text" {...register("name")}/>
      </label>
      <button>Submit</button>
    </form>
  );

}
