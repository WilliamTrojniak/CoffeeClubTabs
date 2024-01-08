import ItemCreateForm from "@/components/ItemCreateForm";
import { notFound } from "next/navigation";

export default async function RegisterPage({params}: {params: {shopId: string}}) { 

  const shopId = parseInt(params.shopId);
  if(!shopId) return notFound();

  return (
    <>
      <h1>Register</h1>
      <ItemCreateForm shopId={shopId}/>
    </>
  )
}
