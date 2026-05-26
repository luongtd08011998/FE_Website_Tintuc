"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Table, Tag, Select, DatePicker, App, Button, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR, { mutate as globalMutate } from "swr";
import dayjs from "dayjs";
import { notificationService } from "@/services/notification";
import type {
  NotificationItem,
  NotificationType,
  NotificationDeliveryStatus,
} from "@/types";

const TYPE_OPTIONS: { label: string; value: NotificationType }[] = [
  { label: "Hóa đơn", value: "INVOICE" },
  { label: "Thanh toán", value: "PAYMENT" },
  { label: "Nhắc nợ", value: "DEBT_REMINDER" },
  { label: "Quá hạn", value: "OVERDUE" },
  { label: "Cắt nước", value: "WATER_CUTOFF" },
  { label: "Phản hồi", value: "FEEDBACK" },
];

const TYPE_LABEL: Record<NotificationType, string> = {
  INVOICE: "Hóa đơn",
  PAYMENT: "Thanh toán",
  DEBT_REMINDER: "Nhắc nợ",
  OVERDUE: "Quá hạn",
  WATER_CUTOFF: "Cắt nước",
  FEEDBACK: "Phản hồi",
};

const DELIVERY_STATUS_OPTIONS: {
  label: string;
  value: NotificationDeliveryStatus;
}[] = [
  { label: "Chờ gửi", value: "PENDING" },
  { label: "Đã gửi", value: "DELIVERED" },
  { label: "Thất bại", value: "FAILED" },
  { label: "Một phần", value: "PARTIAL" },
  { label: "Không có thiết bị", value: "NO_DEVICE" },
];

const DELIVERY_STATUS_COLOR: Record<NotificationDeliveryStatus, string> = {
  DELIVERED: "green",
  PARTIAL: "orange",
  PENDING: "blue",
  FAILED: "red",
  NO_DEVICE: "default",
};

const DELIVERY_STATUS_LABEL: Record<NotificationDeliveryStatus, string> = {
  DELIVERED: "Đã gửi",
  PARTIAL: "Một phần",
  PENDING: "Chờ gửi",
  FAILED: "Thất bại",
  NO_DEVICE: "Không có thiết bị",
};

function NotificationsContent() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 20 });
  const [typeFilter, setTypeFilter] = useState<NotificationType | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<NotificationDeliveryStatus | null>(null);
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [customerIdSearch, setCustomerIdSearch] = useState("");
  const [debouncedCustomerId, setDebouncedCustomerId] = useState("");
  const [resendingIds, setResendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCustomerId(customerIdSearch.trim());
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [customerIdSearch]);

  const fromStr = dateRange?.[0]?.startOf("day").toISOString() ?? "";
  const toStr = dateRange?.[1]?.endOf("day").toISOString() ?? "";

  const { data: statsData } = useSWR(
    "notification-statistics",
    () => notificationService.getStatistics(),
    { revalidateOnFocus: false },
  );

  const fetcher = useCallback(() => {
    const params: Record<string, unknown> = {
      page: pagination.page - 1,
      size: pagination.size,
    };
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.deliveryStatus = statusFilter;
    if (fromStr) params.createdFrom = fromStr;
    if (toStr) params.createdTo = toStr;
    const cid = Number(debouncedCustomerId);
    if (debouncedCustomerId && !isNaN(cid) && cid > 0)
      params.customerId = cid;
    return notificationService.getAll(
      params as Parameters<typeof notificationService.getAll>[0],
    );
  }, [
    pagination.page,
    pagination.size,
    typeFilter,
    statusFilter,
    fromStr,
    toStr,
    debouncedCustomerId,
  ]);

  const { data, isLoading, mutate } = useSWR(
    [
      "notifications",
      pagination.page,
      pagination.size,
      typeFilter,
      statusFilter,
      fromStr,
      toStr,
      debouncedCustomerId,
    ],
    fetcher,
  );

  const stats = statsData?.data.data;
  const meta = data?.data.data.meta;
  const notifications = data?.data.data.result ?? [];

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({
      page: config.current ?? 1,
      size: config.pageSize ?? 20,
    });
  };

  const handleResend = async (id: number) => {
    setResendingIds((prev) => new Set(prev).add(id));
    try {
      await notificationService.resend(id);
      message.success("Đã gửi lại thông báo");
      mutate();
      globalMutate("notification-statistics");
    } catch {
      message.error("Gửi lại thất bại");
    } finally {
      setResendingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Khách hàng",
      key: "customer",
      width: 180,
      render: (_: unknown, record: NotificationItem) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {record.customerName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {record.customerDigiCode}
          </Typography>
        </Box>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: { showTitle: false },
      width: 250,
      render: (v: string) => (
        <Tooltip placement="topLeft" title={v}>
          {v}
        </Tooltip>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (v: NotificationType) => <Tag>{TYPE_LABEL[v] ?? v}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "deliveryStatus",
      key: "deliveryStatus",
      width: 130,
      render: (v: NotificationDeliveryStatus) => (
        <Tag color={DELIVERY_STATUS_COLOR[v]}>
          {DELIVERY_STATUS_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "Mã tham chiếu",
      dataIndex: "referenceId",
      key: "referenceId",
      width: 120,
    },
    {
      title: "Lý do thất bại",
      dataIndex: "failureReason",
      key: "failureReason",
      width: 150,
      ellipsis: true,
      render: (v: string | null) => v ?? "-",
    },
    {
      title: "Thời gian gửi",
      dataIndex: "deliveredAt",
      key: "deliveredAt",
      width: 150,
      render: (v: string | null) =>
        v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-",
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
      width: 100,
      render: (_: unknown, record: NotificationItem) =>
        record.deliveryStatus === "FAILED" ? (
          <Button
            type="link"
            size="small"
            loading={resendingIds.has(record.id)}
            onClick={(e) => {
              e.stopPropagation();
              handleResend(record.id);
            }}
          >
            Gửi lại
          </Button>
        ) : null,
    },
  ];

  const statCards = [
    { label: "Tổng đã gửi", value: stats?.totalSent ?? 0, color: undefined },
    {
      label: "Đã giao",
      value: stats?.totalDelivered ?? 0,
      color: "success.main",
    },
    { label: "Thất bại", value: stats?.totalFailed ?? 0, color: "error.main" },
    { label: "Chờ gửi", value: stats?.totalPending ?? 0, color: "info.main" },
    {
      label: "Không có thiết bị",
      value: stats?.totalNoDevice ?? 0,
      color: "text.secondary",
    },
    {
      label: "Một phần",
      value: stats?.totalPartial ?? 0,
      color: "warning.main",
    },
    { label: "7 ngày qua", value: stats?.last7Days ?? 0, color: undefined },
    { label: "30 ngày qua", value: stats?.last30Days ?? 0, color: undefined },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Theo dõi Thông báo
      </Typography>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {statCards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {card.label}
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={card.color ? { color: card.color } : undefined}
              >
                {card.value.toLocaleString("vi-VN")}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filter bar */}
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Mã khách hàng..."
            value={customerIdSearch}
            onChange={(e) => setCustomerIdSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 180 }}
          />
          <Select
            placeholder="Loại thông báo"
            allowClear
            style={{ width: 160 }}
            value={typeFilter ?? undefined}
            onChange={(val) => {
              setTypeFilter(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={TYPE_OPTIONS}
          />
          <Select
            placeholder="Trạng thái gửi"
            allowClear
            style={{ width: 180 }}
            value={statusFilter ?? undefined}
            onChange={(val) => {
              setStatusFilter(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={DELIVERY_STATUS_OPTIONS}
          />
          <DatePicker.RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
          />
        </Box>

        <Table
          rowKey="id"
          dataSource={notifications}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} thông báo`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense>
      <NotificationsContent />
    </Suspense>
  );
}
