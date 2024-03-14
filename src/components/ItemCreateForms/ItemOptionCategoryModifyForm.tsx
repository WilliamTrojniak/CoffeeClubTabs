'use client'

import { createItemOption, createOptionCategoryOptions, deleteItemOption, deleteItemOptionCategory, deleteOptionCategoryOptions } from "@/app/api/items/itemsAPI";
import { Item, ItemCategory } from "@/db/schema/items"
import { Controller, useForm } from "react-hook-form"
import ReactSelect from "react-select";

type ItemType = Omit<Item, 'basePrice'>;

type PropsType = {
  itemId: number,
  itemHasEnabled: boolean,
  category: ItemCategory,
  addonItems: ItemType[],
  defaultItems: ItemType[],
}

export default function ItemOptionCategoryModifyForm({itemId, itemHasEnabled, category, addonItems, defaultItems} : PropsType) {

  const {control} = useForm<{optionItems: ItemType[]}>({
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
      <button type="button" onClick={async () => {
        if (itemHasEnabled) await deleteItemOption(category.id, itemId, category.shopId);
        else await createItemOption(category.id, itemId, category.shopId);
      }}>{itemHasEnabled ? "Toggle Disabled" : "Toggle Enabled"}</button>
      <button type="button" onClick={async () => {
        await deleteItemOptionCategory(category.id, category.shopId);
      }}>Delete</button>
    </form>
  );

}
