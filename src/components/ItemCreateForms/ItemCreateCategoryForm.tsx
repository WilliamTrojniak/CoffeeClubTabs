'use client'

import { ItemCategoriesInsert } from "@/db/schema/items";
import { Controller, useFormContext } from "react-hook-form"
import ReactSelectCreatable from "react-select/creatable";
import { useCallback } from "react";

type PropsType = {
  name: string,
  shopId: number,
  categoryOptions: ItemCategoriesInsert[]
}

export default function ItemCreateCategoryForm({name, shopId, categoryOptions}: PropsType) {
  
  const {control} = useFormContext();

  const createOption = useCallback((label: string) => {
    return {shopId, name: label} satisfies ItemCategoriesInsert;
  }, [shopId])

  return (
      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({field}) => <ReactSelectCreatable<ItemCategoriesInsert, true>
          {...field}
          instanceId={name}
          isMulti
          placeholder={"Add categories..."}
          options={categoryOptions}
          noOptionsMessage={({inputValue}) => 
            !inputValue ? "Add a category..." : `${inputValue} is already added!`}
          getOptionLabel={(option) => option.name }
          getOptionValue={(option) => option.name}
          getNewOptionData={createOption}
        />}
      />
  );
}
