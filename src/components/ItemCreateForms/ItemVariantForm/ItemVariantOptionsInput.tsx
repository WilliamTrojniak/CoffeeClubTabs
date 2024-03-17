'use client'

import { ItemUpdateData } from "@/app/api/items/itemsAPI";
import { useFieldArray, useFormContext } from "react-hook-form"

type PropsType = {
  index: number,
}


export default function ItemVariantOptionsInput({index }: PropsType) {
  const {control, register, formState: {errors}} = useFormContext<ItemUpdateData>();
  const {fields, append, remove } = useFieldArray({
    control,
    name: `itemVariants.${index}.variantOptions`,
    keyName: "key"
  });


  console.log(errors);
  return (
    <>
      <ul>
        {fields.map((item, subIndex) => {
          return (
            <li key={item.key}>
              <input {...register(`itemVariants.${index}.variantOptions.${subIndex}.name`)} placeholder="Name..."/>
              {errors?.itemVariants?.[index]?.variantOptions?.[subIndex]?.name && <p>{errors.itemVariants[index]?.variantOptions?.[subIndex]?.name?.message}</p> }
              <input {...register(`itemVariants.${index}.variantOptions.${subIndex}.price`, {valueAsNumber: true})} placeholder="0.00"/>
              {errors?.itemVariants?.[index]?.variantOptions?.[subIndex]?.price && <p>{errors.itemVariants[index]?.variantOptions?.[subIndex]?.price?.message}</p> }
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: ""})}>Append</button>
    </>
  );
}
