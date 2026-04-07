"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Table, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { documentService } from "@/services/document";
import type { Document } from "@/types";

export default function DocumentsPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const { data, isLoading, mutate } = useSWR(
    ["documents", pagination.page, pagination.size],
    () =>
      documentService.getAll({
        page: pagination.page,
        size: pagination.size,
      }),
  );

  const meta = data?.data.data.meta;
  const documents = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await documentService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa tài liệu thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa tài liệu thất bại",
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
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "URL tài liệu",
      dataIndex: "documentUrl",
      key: "documentUrl",
      ellipsis: true,
      render: (v: string) => (
        <a href={v} target="_blank" rel="noreferrer">
          {v}
        </a>
      ),
    },
    {
      title: "ID Bài viết",
      key: "articleId",
      width: 110,
      render: (_: unknown, record: Document) =>
        record.articleId ?? record.article?.id ?? "—",
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
      render: (_: unknown, record: Document) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/dashboard/documents/edit/${record.id}`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tài liệu?"
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
          Quản lý Tài liệu
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/documents/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table
          rowKey="id"
          dataSource={documents}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} tài liệu`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
