"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { roleService } from "@/services/role";
import RoleForm from "@/components/ui-antd/RoleForm";
import type { UpdateRoleRequest } from "@/types";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["role", id], () =>
    roleService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateRoleRequest) => {
    await roleService.update(body);
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
    <RoleForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
