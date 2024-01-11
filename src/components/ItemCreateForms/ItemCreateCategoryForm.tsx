'use client'

import { ItemCategoriesInsert, ItemCategory, itemCategoriesInsertSchema } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import ReactSelectAsyncCreatable from "react-select/async-creatable";
import { useCallback, useState } from "react";

type CategoryType = Omit<ItemCategoriesInsert, "shopId">;

export default function ItemCreateCategoryForm({shopId, selectedCategories, categories}: {shopId: number, selectedCategories: CategoryType[], categories: CategoryType[]}) {
  
  const {handleSubmit, control} = useForm<{categories: ItemCategoriesInsert[]}>({
    defaultValues: {
      categories: selectedCategories,
    },

    resolver: zodResolver(z.object({categories: itemCategoriesInsertSchema.array()})),
  });

  const [createdCategories, setCreatedCategories] = useState<string[]>([]);
  const [removedCategories, setRemovedCategories] = useState<string[]>([]);


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
        render={({field}) => <ReactSelectAsyncCreatable<CategoryType, true>
          {...field}
          onChange={(value, action) => {
            field.onChange(value, action);
            if(action.action === 'create-option') {
              setCreatedCategories(prev => ([...prev, action.option.name]));
            } else if (action.action === 'select-option') {
              setRemovedCategories(prev => prev.filter(i => i !== action.option?.name));
            } else if (action.action === 'remove-value' || action.action === 'pop-value') {
              if(createdCategories.includes(action.removedValue.name))
                setCreatedCategories(prev => prev.filter(i => i !== action.removedValue.name));
              else setRemovedCategories(prev => [...prev, action.removedValue.name]);
            } else if(action.action === 'clear') {
              setCreatedCategories([]);
              setRemovedCategories(selectedCategories.map(c => c.name));
            }
            console.log(createdCategories, removedCategories);
          }}
          isMulti
          placeholder={"Add categories..."}
          options={categories}
          noOptionsMessage={({inputValue}) => !inputValue ? "Add a category..." : `${inputValue} is already added!`}
          getOptionLabel={(option) => option.name }
          getOptionValue={(option) => option.name}
          getNewOptionData={createOption}
        />}
      />
      <button>Save</button>
    </form>
  );
}
