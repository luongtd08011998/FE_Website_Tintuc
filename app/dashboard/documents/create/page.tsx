"use client";

import { documentService } from "@/services/document";
import DocumentForm from "@/components/ui-antd/DocumentForm";
import type { CreateDocumentRequest } from "@/types";

export default function CreateDocumentPage() {
  const handleSubmit = async (data: CreateDocumentRequest) => {
    await documentService.create(data);
  };

  return <DocumentForm mode="create" onSubmit={handleSubmit} />;
}
