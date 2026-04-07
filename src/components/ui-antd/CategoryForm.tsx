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
  MenuItem,
} from "@mui/material";
import { Select, App } from "antd";
import useSWR from "swr";
import { categoryService } from "@/services/category";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/types";

const schema = z.object({
  name: z.string().min(1, "Tên danh mục không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  active: z.number().optional(),
  parentId: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

type CategoryFormProps =
  | {
      mode: "create";
      defaultValues?: never;
      onSubmit: (data: CreateCategoryRequest) => Promise<void>;
    }
  | {
      mode: "edit";
      defaultValues: Category;
      onSubmit: (data: UpdateCategoryRequest) => Promise<void>;
    };

export default function CategoryForm(props: CategoryFormProps) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const { notification } = App.useApp();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: 1 },
  });

  const { data: categoriesData } = useSWR("categories-all", () =>
    categoryService.getAll({ page: 1, size: 500 }),
  );
  const allCategories = categoriesData?.data.data.result ?? [];
  const parentOptions = allCategories
    .filter((c) => (isEdit ? c.id !== props.defaultValues?.id : true))
    .map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (isEdit && props.defaultValues) {
      reset({
        name: props.defaultValues.name,
        slug: props.defaultValues.slug,
        active: props.defaultValues.active,
        parentId: props.defaultValues.parent?.id ?? undefined,
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
          ? "Cập nhật danh mục thành công"
          : "Tạo danh mục thành công",
      });
      router.push("/dashboard/categories");
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
        {isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
      </Typography>

      <Paper sx={{ p: 4, maxWidth: 560 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
        >
          <Stack spacing={3}>
            <TextField
              label="Tên danh mục"
              size="small"
              fullWidth
              placeholder="VD: Tin tức"
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Slug"
              size="small"
              fullWidth
              placeholder="VD: tin-tuc"
              error={!!errors.slug}
              helperText={errors.slug?.message}
              {...register("slug")}
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
                  error={!!errors.active}
                >
                  <MenuItem value={1}>Hoạt động</MenuItem>
                  <MenuItem value={0}>Ẩn</MenuItem>
                </TextField>
              )}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                Danh mục cha (tùy chọn)
              </Typography>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn danh mục cha"
                    allowClear
                    value={field.value ?? undefined}
                    onChange={field.onChange}
                    options={parentOptions}
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
                onClick={() => router.push("/dashboard/categories")}
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
