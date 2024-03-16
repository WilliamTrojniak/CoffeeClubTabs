'use client'
import { ItemVariant, ItemVariantInsert } from "@/db/schema/items"
// import ItemVariantCreateForm from "./ItemVariantCreateForm"
// import ItemVariantCategoryDeleteForm from "./ItemVariantCategoryDeleteFrom"
// import ItemVariantEditForm from "./ItemVariantEditForm"
import { useFieldArray, useForm } from "react-hook-form"

type PropsType = {
  itemId: number,
  variantCategory: {id: number, name: string},
  variants: ItemVariant[] 
}

export default function ItemVariantForm({itemId, variantCategory, variants}: PropsType) {

  const {control, register, handleSubmit} = useForm<{variants: ItemVariantInsert[]}>({
    defaultValues: {
      variants: variants
    }
  });

  const {fields, append, swap, move, remove} = useFieldArray({control, name:"variants", keyName: "key"});


  return <>
    <h4>{variantCategory.name}</h4>
    <form onSubmit={handleSubmit(async (formData) => console.log(formData))}>
      <ul>
        {fields.map((item, index) => (
          <li key={item.key}>
            <input type="text" {...register(`variants.${index}.name`)}/>
            <input type="text" {...register(`variants.${index}.price`)}/>
            <button type="button" onClick={() => move(index, index - 1)}>Move Up</button>
            <button type="button" onClick={() => move(index, index + 1)}>Move Down</button>
            <button type="button" onClick={() => remove(index)}>Remove</button>
          </li>
        ))}
      </ul>
      <button>Submit</button>
    </form>
  </>

}
    // <ItemVariantCreateForm categoryId={variantCategory.id}/> 
    // <ItemVariantCategoryDeleteForm categoryId={variantCategory.id} parentItemId={itemId}/>
    //
    // {variants.map(variant => <ItemVariantEditForm key={variant.id} variant={variant}/>)}
