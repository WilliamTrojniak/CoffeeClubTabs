'use client'

import { useFieldArray, useFormContext } from "react-hook-form"
import ItemVariantOptionsInput from "./ItemVariantOptionsInput";
import { ItemUpdateData } from "@/app/api/items/itemsAPI";

type PropsType = {
}


export default function ItemVariantsInput({}: PropsType) {
  const {control, register, formState: {errors}} = useFormContext<ItemUpdateData>();
  const {fields, append, remove, swap } = useFieldArray({
    control,
    name: 'itemVariants',
    keyName: "key"
  });

  return (
    <>
      <ul>
        {fields.map((item, index) => {
          return (
            <li key={item.key}>
              <input {...register(`itemVariants.${index}.name`)}/>
              <button type="button" onClick={() => swap(index, index < fields.length - 1 ? index + 1 : index )}>V</button>
              {errors.itemVariants?.[index]?.name && <p>{errors.itemVariants[index]?.name?.message}</p>}
              <ItemVariantOptionsInput index={index}/>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: "", variantOptions: []})}>Append</button>
    </>
  );
}
