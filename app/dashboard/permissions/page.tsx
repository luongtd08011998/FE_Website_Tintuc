"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Table, Tag, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { permissionService } from "@/services/permission";
import type { Permission } from "@/types";

const METHOD_COLORS: Record<string, string> = {
  GET: "green",
  POST: "blue",
  PUT: "orange",
  PATCH: "purple",
  DELETE: "red",
};

export default function PermissionsPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const { data, isLoading, mutate } = useSWR(
    ["permissions", pagination.page, pagination.size],
    () =>
      permissionService.getAll({
        page: pagination.page,
        size: pagination.size,
      }),
  );

  const meta = data?.data.data.meta;
  const permissions = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await permissionService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa quyền thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa quyền thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên quyền", dataIndex: "name", key: "name" },
    { title: "API Path", dataIndex: "apiPath", key: "apiPath" },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
      width: 90,
      render: (method: string) => (
        <Tag color={METHOD_COLORS[method] ?? "default"}>{method}</Tag>
      ),
    },
    { title: "Module", dataIndex: "module", key: "module" },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: Permission) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/dashboard/permissions/edit/${record.id}`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa quyền?"
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
          Quản lý Quyền
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/permissions/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table
          rowKey="id"
          dataSource={permissions}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} quyền`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
