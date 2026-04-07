"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Table, Space, Popconfirm, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import { companyService } from "@/services/company";
import type { Company } from "@/types";

export default function CompaniesPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });

  const { data, isLoading, mutate } = useSWR(
    ["companies", pagination.page, pagination.size],
    () =>
      companyService.getAll({ page: pagination.page, size: pagination.size }),
  );

  const meta = data?.data.data.meta;
  const companies = data?.data.data.result ?? [];

  const handleDelete = async (id: number) => {
    try {
      await companyService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Xóa công ty thành công",
      });
      mutate();
    } catch {
      notification.error({
        title: "Thất bại",
        description: "Xóa công ty thất bại",
      });
    }
  };

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({ page: config.current ?? 1, size: config.pageSize ?? 10 });
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 60 },
    { title: "Tên công ty", dataIndex: "name", key: "name" },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: "Thao tác",
      key: "action",
      width: 140,
      render: (_: unknown, record: Company) => (
        <Space>
          <Button
            size="small"
            variant="outlined"
            onClick={() =>
              router.push(`/dashboard/companies/edit/${record.id}`)
            }
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa công ty?"
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
          Quản lý Công ty
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/companies/create")}
        >
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table
          rowKey="id"
          dataSource={companies}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} công ty`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}
