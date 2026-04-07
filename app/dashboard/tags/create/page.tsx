"use client";

import { tagService } from "@/services/tag";
import TagForm from "@/components/ui-antd/TagForm";
import type { CreateTagRequest } from "@/types";

export default function CreateTagPage() {
  const handleSubmit = async (data: CreateTagRequest) => {
    await tagService.create(data);
  };

  return <TagForm mode="create" onSubmit={handleSubmit} />;
}
