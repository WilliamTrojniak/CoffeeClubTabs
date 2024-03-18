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
      <button type="button" onClick={() => append({name: "", variantOptions: [{name:"", price: "" as unknown as number}, {name:"", price: "" as unknown as number}]})}>New Variant +</button>
      <ul>
        {fields.map((item, index) => {
          return (
            <li key={item.key}>
              <input {...register(`itemVariants.${index}.name`)} placeholder="Variant Name..." defaultValue={item.name}/>
              <button type="button" onClick={() => swap(index, index + 1 )} disabled={index + 1 === fields.length}>Move Down</button>
              <button type="button" onClick={() => swap(index, index - 1 )} disabled={index === 0}>Move Up</button>
              <button type="button" onClick={() => remove(index)}>Delete Variant</button>
              {errors.itemVariants?.[index]?.name && <p>{errors.itemVariants[index]?.name?.message}</p>}
              <ItemVariantOptionsInput index={index}/>
            </li>
          )
        })}
      </ul>
    </>
  );
}
