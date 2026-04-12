"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper, TextField, InputAdornment } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
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
  const [nameInput, setNameInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(nameInput.trim());
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [nameInput]);

  const { data, isLoading, mutate } = useSWR(
    ["permissions", pagination.page, pagination.size, search],
    () =>
      permissionService.getAll({
        page: pagination.page,
        size: pagination.size,
        name: search || undefined,
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
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Tìm theo tên quyền..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 300 }}
          />
        </Box>
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
