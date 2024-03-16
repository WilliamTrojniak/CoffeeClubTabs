'use client'

import { useFieldArray, useFormContext } from "react-hook-form"
import ItemVariantOptionsInput from "./ItemVariantOptionsInput";

type PropsType = {
  name: string,
  itemId?: number,
}


export default function ItemVariantsInput({name, itemId}: PropsType) {
  const {control, register} = useFormContext();
  const {fields, append, remove, swap } = useFieldArray({
    control,
    name,
    keyName: "key"
  });

  return (
    <>
      <ul>
        {fields.map((item, index) => {
          return (
            <li key={item.key}>
              <input {...register(`${name}[${index}].name`)}/>
              <button type="button" onClick={() => swap(index, index < fields.length - 1 ? index + 1 : index )}>V</button>
              <ItemVariantOptionsInput name={`${name}[${index}].variantOptions`} itemId={itemId}/>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: "", parentItemId: itemId, variants: []})}>Append</button>
    </>
  );
}
