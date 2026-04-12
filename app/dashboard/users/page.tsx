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
import { userService } from "@/services/user";
import type { User } from "@/types";

export default function UsersPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [keyword, setKeyword] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [search, setSearch] = useState({ keyword: "", roleName: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch({ keyword: keyword.trim(), roleName: roleInput.trim() });
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, roleInput]);

  const { data, isLoading, mutate } = useSWR(
    [
      "users",
      pagination.page,
      pagination.size,
      search.keyword,
      search.roleName,
    ],
    () =>
      userService.getAll({
        page: pagination.page,
        size: pagination.size,
        keyword: search.keyword || undefined,
        roleName: search.roleName || undefined,
      }),
  );

  const meta = data?.data.data.meta;
  const users = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await userService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa người dùng thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa người dùng thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({
      page: config.current ?? 1,
      size: config.pageSize ?? 10,
    });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Tuổi", dataIndex: "age", key: "age", width: 70 },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 90,
      render: (v: string) =>
        ({ MALE: "Nam", FEMALE: "Nữ", OTHER: "Khác" })[v] ?? v,
    },
    {
      title: "Công ty",
      key: "company",
      render: (_: unknown, record: User) => record.company?.name ?? "—",
    },
    {
      title: "Vai trò",
      key: "roles",
      render: (_: unknown, record: User) =>
        record.roles.map((r) => (
          <Tag color="blue" key={r.id}>
            {r.name}
          </Tag>
        )),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: User) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`/dashboard/users/edit/${record.id}`)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa người dùng?"
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
          Quản lý Người dùng
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/users/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Tìm theo tên hoặc email..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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
          dataSource={users}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
