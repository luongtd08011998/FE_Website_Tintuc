"use client";

import { useEffect, useRef, useState } from "react";
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
  MenuItem,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import { Select, App } from "antd";
import useSWR from "swr";
import { companyService } from "@/services/company";
import { roleService } from "@/services/role";
import { fileService, getFileUrl } from "@/services/file";
import type { User, CreateUserRequest, UpdateUserRequest } from "@/types";

// Unified schema – email/password are optional strings validated only in create mode via superRefine
const formSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().optional(),
  password: z.string().optional(),
  age: z.coerce.number().min(1, "Tuổi không hợp lệ").max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"] as const),
  address: z.string().min(1, "Địa chỉ không được để trống"),
  avatar: z.string().optional(),
  companyId: z.coerce.number().optional(),
  roleIds: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof formSchema>;

type UserFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateUserRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: User;
      onSubmit: (data: UpdateUserRequest) => Promise<void>;
    };

export default function UserForm(props: UserFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();
  const [avatarPreview, setAvatarPreview] = useState<string>(
    isEdit ? getFileUrl(props.defaultValues.avatar ?? "") : "",
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // validation for create mode
  const schema = isEdit
    ? formSchema
    : formSchema.superRefine((data, ctx) => {
        if (!data.email || !z.string().email().safeParse(data.email).success) {
          ctx.addIssue({
            code: "custom",
            path: ["email"],
            message: "Email không hợp lệ",
          });
        }
        if (!data.password || data.password.length < 8) {
          ctx.addIssue({
            code: "custom",
            path: ["password"],
            message: "Mật khẩu ít nhất 8 ký tự",
          });
        }
      });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "MALE" },
  });

  const { data: companiesData } = useSWR("companies-all", () =>
    companyService.getAll({ page: 1, size: 100 }),
  );
  const { data: rolesData } = useSWR("roles-all", () =>
    roleService.getAll({ page: 1, size: 100 }),
  );

  const companies = companiesData?.data.data.result ?? [];
  const roles = rolesData?.data.data.result ?? [];

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        name: props.defaultValues.name,
        email: props.defaultValues.email,
        age: props.defaultValues.age,
        gender: props.defaultValues.gender,
        address: props.defaultValues.address,
        avatar: props.defaultValues.avatar ?? "",
        companyId: props.defaultValues.company?.id,
        roleIds: props.defaultValues.roles.map((r) => r.id),
      });
      if (props.defaultValues.avatar) {
        setAvatarPreview(getFileUrl(props.defaultValues.avatar));
      }
    }
  }, [isEdit, props, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (props.mode === "edit") {
        await props.onSubmit({
          id: props.defaultValues.id,
          name: data.name,
          email: data.email!,
          age: data.age as number,
          gender: data.gender,
          address: data.address,
          avatar: data.avatar || undefined,
          companyId: data.companyId,
          roleIds: data.roleIds,
        });
      } else {
        await props.onSubmit({
          name: data.name,
          email: data.email!,
          password: data.password!,
          age: data.age as number,
          gender: data.gender,
          address: data.address,
          avatar: data.avatar || undefined,
          companyId: data.companyId,
          roleIds: data.roleIds,
        });
      }
      notification.success({
        title: "Thành công",
        description: isEdit
          ? "Cập nhật người dùng thành công"
          : "Tạo người dùng thành công",
      });
      router.push("/dashboard/users");
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
        {isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 640 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            {/* Thông tin cơ bản */}
            <TextField
              label="Họ và tên"
              fullWidth
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={isEdit ? { readOnly: true } : undefined}
              sx={
                isEdit
                  ? { "& .MuiInputBase-input": { bgcolor: "action.hover" } }
                  : undefined
              }
              {...register("email")}
            />

            {!isEdit && (
              <TextField
                label="Mật khẩu"
                type="password"
                fullWidth
                size="small"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password")}
              />
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Tuổi"
                type="number"
                fullWidth
                size="small"
                error={!!errors.age}
                helperText={errors.age?.message}
                {...register("age")}
              />
              <TextField
                label="Giới tính"
                select
                fullWidth
                size="small"
                defaultValue="MALE"
                error={!!errors.gender}
                helperText={errors.gender?.message}
                {...register("gender")}
              >
                <MenuItem value="MALE">Nam</MenuItem>
                <MenuItem value="FEMALE">Nữ</MenuItem>
                <MenuItem value="OTHER">Khác</MenuItem>
              </TextField>
            </Stack>

            <TextField
              label="Địa chỉ"
              fullWidth
              size="small"
              error={!!errors.address}
              helperText={errors.address?.message}
              {...register("address")}
            />

            {/* Avatar */}
            <Controller
              name="avatar"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    Avatar
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={avatarPreview || undefined}
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: "grey.200",
                        fontSize: 36,
                      }}
                    />
                    <Box>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(true);
                          try {
                            const res = await fileService.upload(
                              file,
                              "avatars",
                            );
                            const url = res.data.data.fileUrl;
                            setAvatarPreview(getFileUrl(url));
                            field.onChange(url);
                          } catch {
                            notification.error({
                              title: "Thất bại",
                              description: "Upload ảnh thất bại",
                            });
                          } finally {
                            setUploading(false);
                            if (fileInputRef.current)
                              fileInputRef.current.value = "";
                          }
                        }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={uploading}
                          onClick={() => fileInputRef.current?.click()}
                          startIcon={
                            uploading ? (
                              <CircularProgress size={14} />
                            ) : undefined
                          }
                        >
                          Chọn ảnh
                        </Button>
                        {avatarPreview && (
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => {
                              setAvatarPreview("");
                              field.onChange("");
                            }}
                          >
                            Xóa
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              )}
            />

            <Divider />

            {/* Công ty */}
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Công ty
              </Typography>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn công ty"
                    allowClear
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    options={companies.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                )}
              />
            </Box>

            {/* Vai trò */}
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Vai trò
              </Typography>
              <Controller
                name="roleIds"
                control={control}
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Chọn vai trò"
                    value={(field.value as number[]) ?? []}
                    onChange={field.onChange}
                    options={roles.map((r) => ({ value: r.id, label: r.name }))}
                  />
                )}
              />
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={2} pt={1}>
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
                onClick={() => router.push("/dashboard/users")}
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
