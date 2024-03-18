'use client'

import { useFieldArray, useFormContext } from "react-hook-form"
import { Item } from "@/db/schema/items";
import ItemSelect from "@/components/ItemSelect/ItemSelect";
import { ItemUpdateData } from "@/app/api/items/itemsAPI";

type PropsType = {
  addonItems: Item[],
}


export default function ItemOptionsInput({addonItems}: PropsType) {
  const {control, register, formState: {errors}} = useFormContext<ItemUpdateData>();
  const {fields, append, swap, remove } = useFieldArray({
    control,
    name: "itemOptions",
    keyName: "key"
  });

  return (
    <>
      <button type="button" onClick={() => append({name: "", options: [], enabled: true})}>New Option Group +</button>
      <ul>
        {fields.map((item, index) => {
          return (
            <li key={item.key}>
              <input {...register(`itemOptions.${index}.name`)} placeholder="Item Option Name..." defaultValue={item.name}/>
              <button type="button" onClick={() => swap(index, index + 1 )} disabled={index + 1 === fields.length}>Move Down</button>
              <button type="button" onClick={() => swap(index, index - 1 )} disabled={index === 0}>Move Up</button>
              <button type="button" onClick={() => remove(index)}>Remove Option</button>
              {errors.itemOptions?.[index]?.name && <p>{errors.itemOptions[index]?.name?.message}</p>}
              <ItemSelect name={`itemOptions.${index}.optionss`} addonItems={addonItems}/>
              <label>
                Enabled: <input type="checkbox" {...register(`itemOptions.${index}.enabled`)}/>
              </label>
            </li>
          )
        })}
      </ul>
    </>
  );
}
