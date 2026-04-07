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
import { App, Select } from "antd";
import useSWR from "swr";
import { articleService } from "@/services/article";
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from "@/types";

const schema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  documentUrl: z.string().min(1, "URL tài liệu không được để trống"),
  articleId: z
    .number({ invalid_type_error: "Bài viết không được để trống" })
    .int()
    .positive("ID bài viết phải là số dương"),
});

type FormData = z.infer<typeof schema>;

type DocumentFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateDocumentRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Document;
      onSubmit: (data: UpdateDocumentRequest) => Promise<void>;
    };

export default function DocumentForm(props: DocumentFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();

  const { data: articlesData } = useSWR("articles-all", () =>
    articleService.getAll({ page: 1, size: 500 }),
  );
  const articles = articlesData?.data.data.result ?? [];

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        title: props.defaultValues.title ?? "",
        description: props.defaultValues.description ?? "",
        documentUrl: props.defaultValues.documentUrl,
        articleId:
          props.defaultValues.articleId ?? props.defaultValues.article?.id,
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
          ? "Cập nhật tài liệu thành công"
          : "Tạo tài liệu thành công",
      });
      router.push("/dashboard/documents");
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
        {isEdit ? "Chỉnh sửa tài liệu" : "Tạo tài liệu mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 560 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            <TextField
              label="Tiêu đề"
              size="small"
              fullWidth
              placeholder="VD: Báo cáo tháng 1"
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register("title")}
            />
            <TextField
              label="Mô tả"
              size="small"
              fullWidth
              multiline
              rows={3}
              placeholder="Mô tả ngắn về tài liệu..."
              error={!!errors.description}
              helperText={errors.description?.message}
              {...register("description")}
            />
            <TextField
              label="URL tài liệu"
              size="small"
              fullWidth
              placeholder="VD: https://example.com/doc.pdf"
              error={!!errors.documentUrl}
              helperText={errors.documentUrl?.message}
              {...register("documentUrl")}
            />
            <Controller
              name="articleId"
              control={control}
              render={({ field }) => (
                <Box>
                  <Box
                    component="label"
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Bài viết
                  </Box>
                  <Select
                    {...field}
                    showSearch
                    placeholder="Chọn bài viết"
                    style={{ width: "100%" }}
                    status={errors.articleId ? "error" : ""}
                    options={articles.map((a) => ({
                      value: a.id,
                      label: `#${a.id} – ${a.title}`,
                    }))}
                    filterOption={(input, option) =>
                      String(option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    onChange={(val) => field.onChange(val)}
                  />
                  {errors.articleId && (
                    <Box
                      component="span"
                      sx={{
                        fontSize: 12,
                        color: "error.main",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {errors.articleId.message}
                    </Box>
                  )}
                </Box>
              )}
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
                onClick={() => router.push("/dashboard/documents")}
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
