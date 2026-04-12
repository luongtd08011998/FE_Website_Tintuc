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
import { roleService } from "@/services/role";
import type { Role } from "@/types";

export default function RolesPage() {
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
    ["roles", pagination.page, pagination.size, search],
    () =>
      roleService.getAll({
        page: pagination.page,
        size: pagination.size,
        name: search || undefined,
      }),
  );

  const meta = data?.data.data.meta;
  const roles = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await roleService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa vai trò thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa vai trò thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên vai trò", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Số quyền",
      key: "permissions",
      width: 100,
      render: (_: unknown, record: Role) => (
        <Tag color="orange">{record.permissions.length} quyền</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: Role) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/dashboard/roles/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa vai trò?"
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
          Quản lý Vai trò
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/roles/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <TextField
          size="small"
          placeholder="Tìm theo tên vai trò..."
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
          sx={{ mb: 2, width: 280 }}
        />

        <Table
          rowKey="id"
          dataSource={roles}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} vai trò`,
          }}
          onChange={handleTableChange}
        />
      </Paper>
    </Box>
  );
}
