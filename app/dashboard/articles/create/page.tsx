"use client";

import { articleService } from "@/services/article";
import ArticleForm from "@/components/ui-antd/ArticleForm";
import type { CreateArticleRequest } from "@/types";

export default function CreateArticlePage() {
  const handleSubmit = async (data: CreateArticleRequest) => {
    await articleService.create(data);
  };

  return <ArticleForm mode="create" onSubmit={handleSubmit} />;
}
