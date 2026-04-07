"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { categoryService } from "@/services/category";
import CategoryForm from "@/components/ui-antd/CategoryForm";
import type { UpdateCategoryRequest } from "@/types";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["category", id], () =>
    categoryService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateCategoryRequest) => {
    await categoryService.update(body);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data?.data.data) return null;

  return (
    <CategoryForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
