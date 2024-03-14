'use client'

import { createOptionCategoryOptions, deleteOptionCategoryOptions } from "@/app/api/items/itemsAPI";
import { Item, ItemCategory } from "@/db/schema/items"
import { useState } from "react";
import { Controller, useForm } from "react-hook-form"
import ReactSelect from "react-select";

type ItemType = Omit<Item, 'basePrice'>;

type PropsType = {
  category: ItemCategory,
  addonItems: ItemType[],
  defaultItems: ItemType[],
}

export default function ItemOptionCategoryModifyForm({category, addonItems, defaultItems} : PropsType) {

  const {handleSubmit, control} = useForm<{optionItems: ItemType[]}>({
    defaultValues: {
      optionItems: defaultItems,
    }
  });


  return (
    <form>
      <h4>{category.name}</h4>
      <Controller
        name="optionItems"
        control={control}
        defaultValue={[]}
        render={({field}) => <ReactSelect<ItemType, true> // type, isMulti
          {...field}
          onChange={(value, action) => {
            field.onChange(value, action);
            if (action.action === 'select-option' && action.option) {
              createOptionCategoryOptions(category.id, [action.option.id], category.shopId);
            } else if (action.action === 'pop-value' || action.action === 'remove-value') {
              deleteOptionCategoryOptions(category.id, [action.removedValue.id], category.shopId);
            } else if(action.action === 'clear') {
              deleteOptionCategoryOptions(category.id, action.removedValues.map(v => v.id), category.shopId);
            }
          }}
          isMulti
          placeholder={"Add options..."}
          options={addonItems}
          getOptionLabel={(option) => option.name }
          getOptionValue={(option) => option.name}
        />}
      />
    </form>
  );

}
