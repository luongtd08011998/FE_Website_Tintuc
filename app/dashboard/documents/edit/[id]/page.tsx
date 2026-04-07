"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { documentService } from "@/services/document";
import DocumentForm from "@/components/ui-antd/DocumentForm";
import type { UpdateDocumentRequest } from "@/types";

export default function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["document", id], () =>
    documentService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateDocumentRequest) => {
    await documentService.update(body);
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
    <DocumentForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
