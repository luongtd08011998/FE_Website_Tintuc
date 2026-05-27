"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Typography, Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Table, Tag, Select, DatePicker, Space, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import dayjs from "dayjs";
import { feedbackService } from "@/services/feedback";
import type { FeedbackItem, FeedbackStatus, IssueType } from "@/types";

const STATUS_OPTIONS: { label: string; value: FeedbackStatus }[] = [
  { label: "Chờ xử lý", value: "PENDING" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Đã giải quyết", value: "RESOLVED" },
  { label: "Đã từ chối", value: "REJECTED" },
];

const STATUS_COLOR: Record<FeedbackStatus, string> = {
  PENDING: "gold",
  PROCESSING: "blue",
  RESOLVED: "green",
  REJECTED: "red",
};

const ISSUE_TYPE_OPTIONS: { label: string; value: IssueType }[] = [
  { label: "Rò rỉ", value: "LEAK" },
  { label: "Chất lượng nước", value: "QUALITY" },
  { label: "Áp lực nước", value: "PRESSURE" },
  { label: "Cắt nước", value: "OUTAGE" },
  { label: "Thanh toán", value: "BILLING" },
  { label: "Đồng hồ", value: "METER" },
  { label: "Khác", value: "OTHER" },
];

const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  LEAK: "Rò rỉ",
  QUALITY: "Chất lượng",
  PRESSURE: "Áp lực",
  OUTAGE: "Cắt nước",
  BILLING: "Thanh toán",
  METER: "Đồng hồ",
  OTHER: "Khác",
};

function FeedbacksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notification } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [keyword, setKeyword] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [debounced, setDebounced] = useState({
    keyword: "",
    customerSearch: "",
  });

  const statusFilter = searchParams.get("status") as FeedbackStatus | null;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({
        keyword: keyword.trim(),
        customerSearch: customerSearch.trim(),
      });
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [keyword, customerSearch]);

  const fetcher = useCallback(() => {
    const params: Record<string, unknown> = {
      page: pagination.page - 1,
      size: pagination.size,
    };
    if (debounced.keyword) params.keyword = debounced.keyword;
    if (debounced.customerSearch) params.customerSearch = debounced.customerSearch;
    if (statusFilter) params.status = statusFilter;
    return feedbackService.getAll(params as Parameters<typeof feedbackService.getAll>[0]);
  }, [pagination.page, pagination.size, debounced.keyword, debounced.customerSearch, statusFilter]);

  const { data, isLoading, mutate } = useSWR(
    ["feedbacks", pagination.page, pagination.size, debounced.keyword, debounced.customerSearch, statusFilter],
    fetcher,
  );

  const meta = data?.data?.data?.meta;
  const feedbacks = data?.data?.data?.result ?? [];

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({
      page: config.current ?? 1,
      size: config.pageSize ?? 10,
    });
  };

  const handleDateRangeChange = (_: unknown, dateStrings: [string, string]) => {
    setPagination((p) => ({ ...p, page: 1 }));
    // Re-fetch with date params
    mutate();
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "trackingCode",
      key: "trackingCode",
      width: 160,
      render: (v: string, record: FeedbackItem) => (
        <Typography
          variant="body2"
          sx={{ cursor: "pointer", fontWeight: 500, color: "primary.main" }}
          onClick={() => router.push(`/dashboard/feedbacks/${record.id}`)}
        >
          {v}
        </Typography>
      ),
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 160,
      render: (_: unknown, record: FeedbackItem) => (
        <Box>
          <Typography variant="body2">{record.customer.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {record.customer.phone}
          </Typography>
        </Box>
      ),
    },
    {
      title: "Loại",
      dataIndex: "issueType",
      key: "issueType",
      width: 120,
      render: (v: IssueType) => (
        <Tag>{ISSUE_TYPE_LABEL[v] ?? v}</Tag>
      ),
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (v: FeedbackStatus) => (
        <Tag color={STATUS_COLOR[v]}>
          {STATUS_OPTIONS.find((s) => s.value === v)?.label ?? v}
        </Tag>
      ),
    },
    {
      title: "Phản hồi",
      dataIndex: "replyCount",
      key: "replyCount",
      width: 90,
      align: "center" as const,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_: unknown, record: FeedbackItem) => (
        <Typography
          variant="body2"
          sx={{ cursor: "pointer", color: "primary.main", textDecoration: "none" }}
          onClick={() => router.push(`/dashboard/feedbacks/${record.id}`)}
        >
          Chi tiết
        </Typography>
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
          Quản lý Phản hồi
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Tìm theo nội dung..."
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
            sx={{ width: 220 }}
          />
          <TextField
            size="small"
            placeholder="Tìm khách hàng (tên/SĐT)..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 240 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 160 }}
            value={statusFilter ?? undefined}
            onChange={(val) => {
              const params = new URLSearchParams(searchParams.toString());
              if (val) {
                params.set("status", val);
              } else {
                params.delete("status");
              }
              router.push(`/dashboard/feedbacks?${params.toString()}`);
            }}
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="Loại vấn đề"
            allowClear
            style={{ width: 160 }}
            onChange={() => {}}
            options={ISSUE_TYPE_OPTIONS}
          />
          <DatePicker.RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            onChange={handleDateRangeChange}
          />
        </Box>

        <Table
          rowKey="id"
          dataSource={feedbacks}
          columns={columns}
          loading={isLoading}
          onRow={(record) => ({
            onClick: () => router.push(`/dashboard/feedbacks/${record.id}`),
            style: { cursor: "pointer" },
          })}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} phản hồi`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}

export default function FeedbacksPage() {
  return (
    <Suspense>
      <FeedbacksContent />
    </Suspense>
  );
}
