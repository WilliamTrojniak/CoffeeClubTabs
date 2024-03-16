'use client'

import { ItemVariant } from "@/db/schema/items"

type PropsType = {

  variant: ItemVariant
}

export default function ItemVariantEditForm({variant} : PropsType) {

  return (
    <form noValidate>
      <input type="text" value={variant.name}/>
      <input type="text" value={variant.price}/>
    </form>
  );

}
