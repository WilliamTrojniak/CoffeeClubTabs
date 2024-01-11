'use client'

import { ItemCategoriesInsert, ItemCategory, itemCategoriesInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import ReactSelectCreatable from "react-select/creatable";
import { useCallback } from "react";


export default function ItemCreateCategoryForm({shopId, categories}: {shopId: number, categories: ItemCategory[]}) {
  
  const {handleSubmit, control} = useForm<{categories: ItemCategoriesInsert[]}>({
    defaultValues: {
      categories: [],
    },

    resolver: zodResolver(z.object({categories: itemCategoriesInsertSchema.array()})),
  });

  const createOption = useCallback((label: string) => {
    return {shopId, name: label} satisfies ItemCategoriesInsert;
  }, [shopId])


  return (
    <form onSubmit={handleSubmit((data) => {
    })}>
      <Controller
        name="categories"
        control={control}
        defaultValue={[]}
        render={({field}) => <ReactSelectCreatable<ItemCategoriesInsert, true>
          {...field}
          isMulti
          placeholder={"Add categories..."}
          options={categories}
          noOptionsMessage={({inputValue}) => !inputValue ? "Add a category..." : `${inputValue} is already added!`}
          getOptionLabel={(option: ItemCategoriesInsert) => option.name }
          getOptionValue={(option: ItemCategoriesInsert) => option.name}
          getNewOptionData={createOption}
        />}
      />
      <button>Save</button>
    </form>
  );
}
