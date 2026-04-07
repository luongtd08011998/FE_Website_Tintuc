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
  Stack,
  Divider,
} from "@mui/material";
import { App } from "antd";
import type { Tag, CreateTagRequest, UpdateTagRequest } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Tên tag không được để trống"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type TagFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateTagRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Tag;
      onSubmit: (data: UpdateTagRequest) => Promise<void>;
    };

export default function TagForm(props: TagFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        name: props.defaultValues.name,
        description: props.defaultValues.description ?? "",
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
        description: isEdit ? "Cập nhật tag thành công" : "Tạo tag thành công",
      });
      router.push("/dashboard/tags");
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
        {isEdit ? "Chỉnh sửa tag" : "Tạo tag mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 560 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            <TextField
              label="Tên tag"
              size="small"
              fullWidth
              placeholder="VD: Công nghệ"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Mô tả"
              size="small"
              fullWidth
              multiline
              rows={3}
              placeholder="Mô tả ngắn về tag..."
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />
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
                onClick={() => router.push("/dashboard/tags")}
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
