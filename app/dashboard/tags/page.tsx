"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Table, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { tagService } from "@/services/tag";
import type { Tag } from "@/types";

export default function TagsPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const { data, isLoading, mutate } = useSWR(
    ["tags", pagination.page, pagination.size],
    () => tagService.getAll({ page: pagination.page, size: pagination.size }),
  );

  const meta = data?.data.data.meta;
  const tags = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await tagService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa tag thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa tag thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên tag", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      render: (v: string) => new Date(v).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: Tag) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/dashboard/tags/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa tag?"
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
          Quản lý Tag
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/tags/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table
          rowKey="id"
          dataSource={tags}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} tag`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
