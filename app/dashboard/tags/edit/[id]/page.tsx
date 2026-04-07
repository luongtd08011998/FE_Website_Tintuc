"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { tagService } from "@/services/tag";
import TagForm from "@/components/ui-antd/TagForm";
import type { UpdateTagRequest } from "@/types";

export default function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["tag", id], () =>
    tagService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateTagRequest) => {
    await tagService.update(body);
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
    <TagForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
