"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import { App } from "antd";
import type {
  Permission,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from "@/types";

const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;

const schema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  apiPath: z.string().min(1, "API path không được để trống"),
  method: z.enum(HTTP_METHODS),
  module: z.string().min(1, "Module không được để trống"),
});

type FormData = z.infer<typeof schema>;

type PermissionFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreatePermissionRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Permission;
      onSubmit: (data: UpdatePermissionRequest) => Promise<void>;
    };

export default function PermissionForm(props: PermissionFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { method: "GET" },
  });

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        name: props.defaultValues.name,
        apiPath: props.defaultValues.apiPath,
        method: props.defaultValues.method,
        module: props.defaultValues.module,
      });
    }
  }, [isEdit, props, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (props.mode === "edit") {
        await props.onSubmit({ ...data, id: props.defaultValues.id });
      } else {
        await props.onSubmit(data);
      }
      notification.success({
        title: "Thành công",
        description: isEdit
          ? "Cập nhật quyền thành công"
          : "Tạo quyền thành công",
      });
      router.push("/dashboard/permissions");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      notification.error({
        title: "Thất bại",
        description: axiosErr.response?.data?.message ?? "Có lỗi xảy ra",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isEdit ? "Chỉnh sửa quyền" : "Tạo quyền mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 560 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            <TextField
              label="Tên quyền"
              size="small"
              fullWidth
              placeholder="VD: CREATE_USER"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="API Path"
              size="small"
              fullWidth
              placeholder="VD: /api/v1/users"
              error={!!errors.apiPath}
              helperText={errors.apiPath?.message}
              {...register("apiPath")}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Method"
                select
                size="small"
                fullWidth
                defaultValue="GET"
                error={!!errors.method}
                helperText={errors.method?.message}
                {...register("method")}
              >
                {HTTP_METHODS.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Module"
                size="small"
                fullWidth
                placeholder="VD: USER"
                error={!!errors.module}
                helperText={errors.module?.message}
                {...register("module")}
              />
            </Stack>
            <Divider />
            <Stack direction="row" spacing={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} color="inherit" />
                ) : isEdit ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/dashboard/permissions")}
              >
                Hủy
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
