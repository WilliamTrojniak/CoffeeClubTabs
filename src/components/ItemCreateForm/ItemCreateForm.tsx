'use client'

import { ItemCategoriesInsert, ItemCategory, ItemInsert } from "@/db/schema/items"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import ItemCreateItemForm from "./ItemCreateItemForm"
import ItemCreateVariantsForm from "./ItemCreateVariantsForm"
import ItemCreateCategoryForm from "./ItemCreateCategoryForm"

type ItemCreateFormContextType = {
  data: {
    itemCreateData?: ItemInsert,
    itemCategoryCreateData?: ItemCategoriesInsert[]
  },
  nextStage: () => void,
  prevStage: () => void,
  setItemCreateData: (data: ItemInsert) => void,
  itemCategories: ItemCategory[],
  setItemCategoryCreateData: (data: ItemCategoriesInsert[]) => void,
}

const ItemCreateFormContext = createContext<ItemCreateFormContextType | null>(null);
export const useItemCreateFormContext = () => useContext(ItemCreateFormContext);

export default function ItemCreateForm({shopId, itemCategories}: {shopId: number, itemCategories: ItemCategory[]}) {
  const [stage, setStage] = useState(0);
  const [itemCreateData, setItemCreateaData] = useState<ItemInsert>();
  const [categoryCreateData, setCategoryCreateData] = useState<ItemCategoriesInsert[]>();
  

  const state = useMemo(() =>  ({
    nextStage: () => setStage(prev => prev+1),
    prevStage: () => setStage(prev => prev-1),
    setItemCreateData: (data: ItemInsert) => setItemCreateaData(data),
    setItemCategoryCreateData: (data: ItemCategoriesInsert[]) => setCategoryCreateData(data),
    data: {
      itemCreateData: itemCreateData,
      itemCategoryCreateData: categoryCreateData,
    },
    itemCategories: itemCategories,
  } satisfies ItemCreateFormContextType), [itemCreateData, categoryCreateData, itemCategories]);

  useEffect(() => console.log(state), [state]);

  return (
    <ItemCreateFormContext.Provider value={state}>
      {stage === 0 && <ItemCreateItemForm shopId={shopId}/>}
      {stage === 1 && <ItemCreateCategoryForm shopId={shopId} categories={itemCategories}/>}
      {stage === 2 && <ItemCreateVariantsForm shopId={shopId}/>}
    </ItemCreateFormContext.Provider>
  );
}
