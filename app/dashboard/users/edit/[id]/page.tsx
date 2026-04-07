"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { userService } from "@/services/user";
import UserForm from "@/components/ui-antd/UserForm";
import type { UpdateUserRequest } from "@/types";

export default function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["user", id], () =>
    userService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateUserRequest) => {
    await userService.update(body);
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
    <UserForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
