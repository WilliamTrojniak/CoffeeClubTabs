'use client'

import { ItemUpdateData } from "@/app/api/items/itemsAPI";
import { ItemVariantInsert } from "@/db/schema/items";
import { useFieldArray, useFormContext } from "react-hook-form"

type PropsType = {
  index: number,
}


export default function ItemVariantOptionsInput({index }: PropsType) {
  const {control, register, formState: {errors}} = useFormContext<ItemUpdateData>();
  const {fields, append, remove, swap } = useFieldArray({
    control,
    name: `itemVariants.${index}.variantOptions`,
    keyName: "key"
  });

  return (
    <>
      <ul>
        {fields.map((item, subIndex) => {
          return (
            <li key={item.key}>
              <input {...register(`itemVariants.${index}.variantOptions.${subIndex}.name`)} placeholder="Variant Option..." defaultValue={item.name}/>
              {errors?.itemVariants?.[index]?.variantOptions?.[subIndex]?.name && <p>{errors.itemVariants[index]?.variantOptions?.[subIndex]?.name?.message}</p> }
              <input {...register(`itemVariants.${index}.variantOptions.${subIndex}.price`, {valueAsNumber: true})} placeholder="0.00" defaultValue={item.price}/>
              {errors?.itemVariants?.[index]?.variantOptions?.[subIndex]?.price && <p>{errors.itemVariants[index]?.variantOptions?.[subIndex]?.price?.message}</p> }
              <button type="button" onClick={() => swap(subIndex, subIndex + 1 )} disabled={subIndex + 1 === fields.length}>Move Down</button>
              <button type="button" onClick={() => swap(subIndex, subIndex - 1 )} disabled={subIndex === 0}>Move Up</button>
              <button type="button" onClick={() => remove(subIndex)}>Remove Option</button>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: "", price: "" as unknown as number} satisfies ItemVariantInsert)}>Add Option +</button>
    </>
  );
}
