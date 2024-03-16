'use client'

import { useForm } from "react-hook-form";

type PropsType = {
  categoryId: number,
  parentItemId: number,
}

export default function ItemVariantCategoryDeleteForm({categoryId, parentItemId}: PropsType) {

  const {handleSubmit} = useForm();

  return (
    <form onSubmit={handleSubmit(async () => await deleteItemVariantCategory(categoryId, parentItemId))}>
      <button>Delete</button>
    </form>
  );

}
