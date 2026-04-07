"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { permissionService } from "@/services/permission";
import PermissionForm from "@/components/ui-antd/PermissionForm";
import type { UpdatePermissionRequest } from "@/types";

export default function EditPermissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["permission", id], () =>
    permissionService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdatePermissionRequest) => {
    await permissionService.update(body);
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
    <PermissionForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
