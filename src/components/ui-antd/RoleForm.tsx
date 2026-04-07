"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { Select, App } from "antd";
import useSWR from "swr";
import { permissionService } from "@/services/permission";
import type { Role, CreateRoleRequest, UpdateRoleRequest } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  description: z.string().min(1, "Mô tả không được để trống"),
  permissionIds: z.array(z.number()).min(1, "Chọn ít nhất 1 quyền"),
});

type FormData = z.infer<typeof schema>;

type RoleFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateRoleRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Role;
      onSubmit: (data: UpdateRoleRequest) => Promise<void>;
    };

export default function RoleForm(props: RoleFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { data: permissionsData } = useSWR("permissions-all", () =>
    permissionService.getAll({ page: 1, size: 500 }),
  );

  const permissions = permissionsData?.data.data.result ?? [];

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        name: props.defaultValues.name,
        description: props.defaultValues.description,
        permissionIds: props.defaultValues.permissions.map((p) => p.id),
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
          ? "Cập nhật vai trò thành công"
          : "Tạo vai trò thành công",
      });
      router.push("/dashboard/roles");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      notification.error({
        title: "Thất bại",
        description: axiosErr.response?.data?.message ?? "Có lỗi xảy ra",
      });
    }
  };

  const permissionOptions = permissions.map((p) => ({
    value: p.id,
    label: `[${p.method}] ${p.apiPath} — ${p.name}`,
  }));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isEdit ? "Chỉnh sửa vai trò" : "Tạo vai trò mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 640 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            <TextField
              label="Tên vai trò"
              size="small"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Mô tả"
              size="small"
              fullWidth
              multiline
              rows={2}
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Danh sách quyền
                {errors.permissionIds && (
                  <Typography
                    component="span"
                    color="error"
                    variant="caption"
                    ml={1}
                  >
                    {errors.permissionIds.message}
                  </Typography>
                )}
              </Typography>
              <Controller
                name="permissionIds"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Chọn quyền"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={permissionOptions}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    maxTagCount="responsive"
                  />
                )}
              />
            </Box>
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
                onClick={() => router.push("/dashboard/roles")}
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
