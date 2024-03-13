'use client'

import { ItemCategoriesInsert, ItemCategory, itemCategoriesInsertSchema, itemToCategories } from "@/db/schema/items";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form"
import { z } from "zod";
import ReactSelectCreatable from "react-select/creatable";
import { useCallback, useEffect, useId, useState } from "react";
import { createAndAddItemCategories } from "@/app/api/items/itemsAPI";

type CategoryType = Omit<ItemCategoriesInsert, "shopId">;

export default function ItemCreateCategoryForm({shopId, itemId, selectedCategories, categories}: {shopId: number, itemId: number, selectedCategories: ItemCategory[], categories: ItemCategory[]}) {
  
  const {handleSubmit, control, formState: {errors}} = useForm<{categories: ItemCategoriesInsert[]}>({
    defaultValues: {
      categories: selectedCategories,
    },

    resolver: zodResolver(z.object({categories: itemCategoriesInsertSchema.array()})),
  });

  const [removedCategories, setRemovedCategories] = useState<number[]>([]);


  const createOption = useCallback((label: string) => {
    return {shopId, name: label} satisfies ItemCategoriesInsert;
  }, [shopId])

  const selectId = useId();

  useEffect(() => console.log(removedCategories), [removedCategories]);

  return (
    <form onSubmit={handleSubmit((data) => {

      createAndAddItemCategories(shopId, itemId, data.categories);

    })}>
      <Controller
        name="categories"
        control={control}
        defaultValue={[]}
        render={({field}) => <ReactSelectCreatable<CategoryType, true>
          {...field}
          onChange={(value, action) => {
            field.onChange(value, action);
            if (action.action === 'select-option' && action.option?.id) {
                setRemovedCategories(prev => prev.filter(i => i !== action.option?.id));
            } else if (action.removedValue?.id) {
                setRemovedCategories(prev => [...prev, action.removedValue!.id!])
            } else if(action.action === 'clear') {
              setRemovedCategories(selectedCategories.map(c => c.id));
            }
          }}
          isMulti
          placeholder={"Add categories..."}
          options={categories}
          noOptionsMessage={({inputValue}) => 
            !inputValue ? "Add a category..." : `${inputValue} is already added!`}
          getOptionLabel={(option) => option.name }
          getOptionValue={(option) => option.name}
          getNewOptionData={createOption}
        />}
      />
      <button>Save</button>
    </form>
  );
}
