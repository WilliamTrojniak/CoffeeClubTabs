'use client'

import { useFieldArray, useFormContext } from "react-hook-form"
import ItemOptionOptionsInput from "./ItemOptionOptionsInput";
import { Item } from "@/db/schema/items";

type PropsType = {
  name: string,
  itemId?: number,
  addonItems: Item[],
}


export default function ItemOptionsInput({name, itemId, addonItems}: PropsType) {
  const {control, register} = useFormContext();
  const {fields, append, swap } = useFieldArray({
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
              <ItemOptionOptionsInput name={`${name}[${index}].options`} addonItems={addonItems}/>
              <label>
                Enabled: <input type="checkbox" {...register(`${name}[${index}].enabled`)}/>
              </label>
            </li>
          )
        })}
      </ul>
      <button type="button" onClick={() => append({name: "", parentItemId: itemId, variants: []})}>Append</button>
    </>
  );
}
