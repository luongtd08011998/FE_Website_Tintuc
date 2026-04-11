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
  Stack,
  Divider,
  MenuItem,
} from "@mui/material";
import { Select, App } from "antd";
import RichTextEditor from "@/components/RichTextEditor";
import useSWR from "swr";
import { useAuthStore } from "@/lib/store";
import { userService } from "@/services/user";
import { categoryService } from "@/services/category";
import { tagService } from "@/services/tag";
import { fileService, getFileUrl } from "@/services/file";
import type {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
} from "@/types";

const ARTICLE_TYPES = [
  { value: 0, label: "Bài viết thường" },
  { value: 1, label: "Bài viết nổi bật" },
  { value: 2, label: "Tin tức" },
];

const schema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  content: z.string().optional(),
  thumbnail: z.string().optional(),
  type: z.number({ invalid_type_error: "Loại bài viết không được để trống" }),
  active: z.number().optional(),
  authorId: z.number({ invalid_type_error: "Tác giả không được để trống" }),
  categoryId: z.number().optional(),
  tagIds: z.array(z.number()),
});

type FormData = z.infer<typeof schema>;

function coalesceNumber(v: unknown): number {
  if (typeof v === "string") return Number.parseInt(v, 10);
  return Number(v);
}

/** Ant Design Select may emit strings; align with CreateArticleRequest / UpdateArticleRequest. */
function formDataToCreatePayload(data: FormData): CreateArticleRequest {
  const categoryRaw = data.categoryId;
  const categoryId =
    categoryRaw === undefined || categoryRaw === null
      ? undefined
      : coalesceNumber(categoryRaw);

  const tagIds = (data.tagIds ?? [])
    .map((id) => (typeof id === "string" ? Number.parseInt(id, 10) : Number(id)))
    .filter((n) => Number.isInteger(n));

  return {
    title: data.title,
    slug: data.slug,
    content: data.content?.trim() ? data.content : undefined,
    thumbnail: data.thumbnail?.trim() ? data.thumbnail : undefined,
    type: coalesceNumber(data.type),
    active:
      data.active !== undefined && data.active !== null
        ? coalesceNumber(data.active)
        : undefined,
    authorId: coalesceNumber(data.authorId),
    categoryId,
    tagIds,
  };
}

type ArticleFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateArticleRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Article;
      onSubmit: (data: UpdateArticleRequest) => Promise<void>;
    };

export default function ArticleForm(props: ArticleFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const currentUser = useAuthStore((s) => s.user);
  const { notification } = App.useApp();
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    isEdit ? getFileUrl(props.defaultValues.thumbnail ?? "") : "",
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 0, active: 1, tagIds: [] },
  });

  const { data: usersData } = useSWR("users-all", () =>
    userService.getAll({ page: 1, size: 500 }),
  );
  const { data: categoriesData } = useSWR("categories-all", () =>
    categoryService.getAll({ page: 1, size: 500 }),
  );
  const { data: tagsData } = useSWR("tags-all", () =>
    tagService.getAll({ page: 1, size: 500 }),
  );

  const users = usersData?.data.data.result ?? [];
  const categories = categoriesData?.data.data.result ?? [];
  const tags = tagsData?.data.data.result ?? [];

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      setThumbnailPreview(getFileUrl(props.defaultValues.thumbnail ?? ""));
      reset({
        title: props.defaultValues.title,
        slug: props.defaultValues.slug,
        content: props.defaultValues.content ?? "",
        thumbnail: props.defaultValues.thumbnail ?? "",
        type: props.defaultValues.type,
        active: props.defaultValues.active,
        authorId: props.defaultValues.author.id,
        categoryId: props.defaultValues.category?.id ?? undefined,
        tagIds: props.defaultValues.tags.map((t) => t.id),
      });
    }
  }, [isEdit, props, reset]);

  /** HR (and similar) often cannot list all users; default author = signed-in user. */
  useEffect(() => {
    if (isEdit || !currentUser?.id) return;
    setValue("authorId", currentUser.id, { shouldValidate: true });
  }, [isEdit, currentUser?.id, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (props.mode === "edit") {
        await props.onSubmit({
          ...formDataToCreatePayload(data),
          id: props.defaultValues.id,
        });
      } else {
        await props.onSubmit(formDataToCreatePayload(data));
      }
      notification.success({
        title: "Thành công",
        description: isEdit
          ? "Cập nhật bài viết thành công"
          : "Tạo bài viết thành công",
      });
      router.push("/dashboard/articles");
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
        {isEdit ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 720 }}>
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
              placeholder="VD: Thông báo lịch cúp nước tháng 4"
              error={!!errors.title}
              helperText={errors.title?.message}
              {...register("title")}
            />
            <TextField
              label="Slug"
              size="small"
              fullWidth
              placeholder="VD: thong-bao-lich-cup-nuoc-thang-4"
              error={!!errors.slug}
              helperText={errors.slug?.message}
              {...register("slug")}
            />
            <Controller
              name="thumbnail"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Thumbnail
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {thumbnailPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumbnailPreview}
                        alt="thumbnail"
                        style={{
                          width: 120,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #e0e0e0",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 120,
                          height: 80,
                          bgcolor: "grey.200",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="caption" color="text.disabled">
                          Chưa có ảnh
                        </Typography>
                      </Box>
                    )}
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
                          const res = await fileService.upload(file, "avatars");
                          const url = res.data.data.fileUrl;
                          setThumbnailPreview(getFileUrl(url));
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
                    <Stack spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploading ? (
                          <CircularProgress size={16} sx={{ mr: 1 }} />
                        ) : null}
                        Chọn ảnh
                      </Button>
                      {thumbnailPreview && (
                        <Button
                          color="error"
                          size="small"
                          onClick={() => {
                            setThumbnailPreview("");
                            field.onChange("");
                          }}
                        >
                          Xóa ảnh
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              )}
            />
            <Stack direction="row" spacing={2}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Loại bài viết"
                    select
                    size="small"
                    fullWidth
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    error={!!errors.type}
                    helperText={errors.type?.message}
                  >
                    {ARTICLE_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Trạng thái"
                    select
                    size="small"
                    fullWidth
                    value={field.value ?? 1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  >
                    <MenuItem value={1}>Hiển thị</MenuItem>
                    <MenuItem value={0}>Ẩn</MenuItem>
                  </TextField>
                )}
              />
            </Stack>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Tác giả <span style={{ color: "red" }}>*</span>
                {errors.authorId && (
                  <Typography
                    component="span"
                    color="error"
                    variant="caption"
                    ml={1}
                  >
                    {errors.authorId.message}
                  </Typography>
                )}
              </Typography>
              <Controller
                name="authorId"
                control={control}
                render={({ field }) => (
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn tác giả"
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    options={users.map((u) => ({ value: u.id, label: u.name }))}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Danh mục (tùy chọn)
              </Typography>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn danh mục"
                    allowClear
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label as string)
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  />
                )}
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Tags
              </Typography>
              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <Select
                    mode="multiple"
                    style={{ width: "100%" }}
                    placeholder="Chọn tag"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    options={tags.map((t) => ({ value: t.id, label: t.name }))}
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

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    Nội dung
                  </Typography>
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                  {errors.content && (
                    <Typography variant="caption" color="error" mt={0.5}>
                      {errors.content.message}
                    </Typography>
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
                onClick={() => router.push("/dashboard/articles")}
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
