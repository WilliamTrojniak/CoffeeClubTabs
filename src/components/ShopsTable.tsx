'use client'


import { deleteShop } from "@/app/api/shops/shopsAPI";
import { Shop } from "@/db/schema/shops";
import Link from "next/link";
import { useForm } from "react-hook-form";

const ShopsTable = ({shops}: {shops: Shop[]}) => {

  const {handleSubmit} = useForm();

  const entries = shops.map(shop => {
    return (
      <form key={shop.id} onSubmit={handleSubmit(async () => console.log(await deleteShop(shop.id)))}> 
        <Link href={`/shops/${shop.id}`}>{shop.name}</Link>
        <button>Delete</button>
      </form>
    )
  });

  return <>{entries}</>;

}

export default ShopsTable;
