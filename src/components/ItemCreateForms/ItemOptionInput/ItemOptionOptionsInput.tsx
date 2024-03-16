'use client'

import { Item } from "@/db/schema/items"
import { Controller, useFormContext } from "react-hook-form"
import ReactSelect from "react-select";


type PropsType = {
  name: string,
  addonItems: Item[],
}

export default function ItemOptionOptionsInput({ name, addonItems } : PropsType) {

  const {control} = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => <ReactSelect<Item, true> // type, isMulti
        {...field}
        instanceId={name}
        isMulti
        placeholder={"Add options..."}
        options={addonItems}
        getOptionLabel={(option) => option.name }
        getOptionValue={(option) => option.name}
      />}
    />
  );

}