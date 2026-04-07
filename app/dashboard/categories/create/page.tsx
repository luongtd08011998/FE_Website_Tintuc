"use client";

import { categoryService } from "@/services/category";
import CategoryForm from "@/components/ui-antd/CategoryForm";
import type { CreateCategoryRequest } from "@/types";

export default function CreateCategoryPage() {
  const handleSubmit = async (data: CreateCategoryRequest) => {
    await categoryService.create(data);
  };

  return <CategoryForm mode="create" onSubmit={handleSubmit} />;
}
