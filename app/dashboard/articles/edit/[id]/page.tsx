"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { articleService } from "@/services/article";
import ArticleForm from "@/components/ui-antd/ArticleForm";
import type { UpdateArticleRequest } from "@/types";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["article", id], () =>
    articleService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateArticleRequest) => {
    await articleService.update(body);
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
    <ArticleForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
