'use client'

import { useFieldArray, useFormContext } from "react-hook-form"

type PropsType = {
  name: string,
  itemId?: number,
}


export default function ItemVariantOptionsInput({name, itemId}: PropsType) {
  const {control, register} = useFormContext();
  const {fields, append, remove } = useFieldArray({
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
              <input {...register(`${name}[${index}].name`)} placeholder="Name..."/>
              <input {...register(`${name}[${index}].price`, {valueAsNumber: true})} placeholder="0.00"/>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: "", parentItemId: itemId, variants: []})}>Append</button>
    </>
  );
}
