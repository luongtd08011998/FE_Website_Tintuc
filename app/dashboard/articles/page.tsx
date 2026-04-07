"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Table, Tag, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { articleService } from "@/services/article";
import type { Article } from "@/types";

const TYPE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Thường", color: "default" },
  1: { label: "Nổi bật", color: "gold" },
  2: { label: "Tin tức", color: "blue" },
};

export default function ArticlesPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const { data, isLoading, mutate } = useSWR(
    ["articles", pagination.page, pagination.size],
    () =>
      articleService.getAll({
        page: pagination.page,
        size: pagination.size,
      }),
  );

  const meta = data?.data.data.meta;
  const articles = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await articleService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa bài viết thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa bài viết thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    { title: "Slug", dataIndex: "slug", key: "slug", ellipsis: true },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 110,
      render: (v: number) => {
        const t = TYPE_LABELS[v] ?? { label: `${v}`, color: "default" };
        return <Tag color={t.color}>{t.label}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 110,
      render: (v: number) =>
        v === 1 ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="default">Ẩn</Tag>
        ),
    },
    {
      title: "Tác giả",
      key: "author",
      render: (_: unknown, record: Article) => record.author.name,
    },
    {
      title: "Danh mục",
      key: "category",
      render: (_: unknown, record: Article) =>
        record.category ? record.category.name : "—",
    },
    {
      title: "Lượt xem",
      dataIndex: "views",
      key: "views",
      width: 90,
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
      render: (_: unknown, record: Article) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/dashboard/articles/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa bài viết?"
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
          Quản lý Bài viết
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/articles/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table
          rowKey="id"
          dataSource={articles}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} bài viết`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
