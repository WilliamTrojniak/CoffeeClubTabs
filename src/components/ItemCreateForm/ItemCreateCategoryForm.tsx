'use client'

import { ItemCategoriesInsert, ItemCategory, itemCategoriesInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import { useItemCreateFormContext } from "./ItemCreateForm";
import { createFilter } from "react-select";
import ReactSelectCreatable from "react-select/creatable";
import { useCallback } from "react";


export default function ItemCreateCategoryForm({shopId, categories}: {shopId: number, categories: ItemCategory[]}) {
  
  const formContext = useItemCreateFormContext();

  const {handleSubmit, control, register} = useForm<{categories: ItemCategoriesInsert[]}>({
    defaultValues: {
      categories: [],
    },

    resolver: zodResolver(z.object({categories: itemCategoriesInsertSchema.array()})),
  });

  const createOption = useCallback((label: string) => {
    return {shopId, name: label} satisfies ItemCategoriesInsert;
  }, [shopId])

  if (!formContext) return <h1>Could not load form: No context provided</h1>;

  return (
    <form onSubmit={handleSubmit((data) => {
      formContext.setItemCategoryCreateData(data.categories);
      formContext.nextStage();
    })}>
      <Controller
        name="categories"
        control={control}
        defaultValue={[]}
        render={({field}) => <ReactSelectCreatable<ItemCategoriesInsert, true>
          {...field}
          isMulti
          options={categories}
          getOptionLabel={(option: ItemCategoriesInsert) => option.name }
          getOptionValue={(option: ItemCategoriesInsert) => option.name}
          getNewOptionData={createOption}
        />}
      />
    </form>
  );

}

/*


*/
