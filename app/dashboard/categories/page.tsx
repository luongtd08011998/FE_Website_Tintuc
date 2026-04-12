"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { Table, Tag, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { categoryService } from "@/services/category";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [keywordInput, setKeywordInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(keywordInput.trim());
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [keywordInput]);

  const { data, isLoading, mutate } = useSWR(
    ["categories", pagination.page, pagination.size, search],
    () =>
      categoryService.getAll({
        page: pagination.page,
        size: pagination.size,
        keyword: search || undefined,
      }),
  );

  const meta = data?.data.data.meta;
  const categories = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await categoryService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa danh mục thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa danh mục thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên danh mục", dataIndex: "name", key: "name" },
    { title: "Slug", dataIndex: "slug", key: "slug" },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 110,
      render: (v: number) =>
        v === 1 ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="default">Ẩn</Tag>
        ),
    },
    {
      title: "Danh mục cha",
      key: "parent",
      render: (_: unknown, record: Category) =>
        record.parent ? record.parent.name : "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (v: string) => new Date(v).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/dashboard/categories/edit/${record.id}`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa danh mục?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" variant="outlined" color="error">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Quản lý Danh mục
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/categories/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Tìm theo tên hoặc slug..."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2, width: 320 }}
        />

        <Table
          rowKey="id"
          dataSource={categories}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} danh mục`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
