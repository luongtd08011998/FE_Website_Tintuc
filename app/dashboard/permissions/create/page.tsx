"use client";

import { permissionService } from "@/services/permission";
import PermissionForm from "@/components/ui-antd/PermissionForm";
import type { CreatePermissionRequest } from "@/types";

export default function CreatePermissionPage() {
  const handleSubmit = async (data: CreatePermissionRequest) => {
    await permissionService.create(data);
  };

  return <PermissionForm mode="create" onSubmit={handleSubmit} />;
}
