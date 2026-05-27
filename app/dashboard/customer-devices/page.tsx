"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Table, Tag, Select, Button, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import dayjs from "dayjs";
import { customerDeviceService } from "@/services/customer-device";
import { roadService } from "@/services/road";
import type { CustomerDeviceItem, CustomerDeviceStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: CustomerDeviceStatus }[] = [
  { label: "Đã đăng ký", value: "REGISTERED" },
  { label: "Chưa đăng ký", value: "UNREGISTERED" },
];

const ACTIVE_OPTIONS: { label: string; value: number }[] = [
  { label: "Hoạt động", value: 1 },
  { label: "Ngưng", value: 0 },
];

const PLATFORM_COLOR: Record<string, string> = {
  ANDROID: "green",
  IOS: "blue",
};

function CustomerDevicesContent() {
  const { message } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 20 });
  const [statusFilter, setStatusFilter] = useState<CustomerDeviceStatus | null>(
    null,
  );
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [roadFilter, setRoadFilter] = useState<number | null>(null);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keywordSearch.trim());
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [keywordSearch]);

  const { data: roadsData } = useSWR("roads", () => roadService.getAll(), {
    revalidateOnFocus: false,
  });
  const roadOptions = (roadsData?.data?.data ?? []).map((r) => ({
    label: r.name,
    value: r.id,
  }));

  const fetcher = useCallback(() => {
    const params: Record<string, unknown> = {
      page: pagination.page - 1,
      size: pagination.size,
    };
    if (statusFilter) params.status = statusFilter;
    if (activeFilter !== null) params.isActive = activeFilter;
    if (roadFilter !== null) params.roadId = roadFilter;
    if (debouncedKeyword) params.keyword = debouncedKeyword;
    return customerDeviceService.getAll(
      params as Parameters<typeof customerDeviceService.getAll>[0],
    );
  }, [pagination.page, pagination.size, statusFilter, activeFilter, roadFilter, debouncedKeyword]);

  const { data, isLoading } = useSWR(
    [
      "customer-devices",
      pagination.page,
      pagination.size,
      statusFilter,
      activeFilter,
      roadFilter,
      debouncedKeyword,
    ],
    fetcher,
  );

  const meta = data?.data?.data?.meta;
  const devices = data?.data?.data?.result ?? [];

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({
      page: config.current ?? 1,
      size: config.pageSize ?? 20,
    });
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params: Record<string, unknown> = { page: 0, size: 999999 };
      if (statusFilter) params.status = statusFilter;
      if (activeFilter !== null) params.isActive = activeFilter;
      if (roadFilter !== null) params.roadId = roadFilter;
      if (debouncedKeyword) params.keyword = debouncedKeyword;

      const res = await customerDeviceService.getAll(
        params as Parameters<typeof customerDeviceService.getAll>[0],
      );
      const allItems = res.data.data.result;

      const rows = allItems.map((item, idx) => ({
        STT: idx + 1,
        "Mã KH": item.digiCode,
        "Họ và tên": item.name,
        "Số điện thoại": item.phone,
        "Trạng thái KH": item.isActive === 1 ? "Hoạt động" : "Ngưng",
        "Thiết bị": item.deviceRegistered ? "Đã đăng ký" : "Chưa đăng ký",
      }));

      const { exportToXlsx } = await import("@/lib/export-xlsx");
      exportToXlsx(
        rows,
        "Thiết bị KH",
        `thiet_bi_khach_hang_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
      );
      message.success(`Xuất ${rows.length} dòng thành công`);
    } catch {
      message.error("Xuất Excel thất bại");
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) =>
        (pagination.page - 1) * pagination.size + index + 1,
    },
    {
      title: "Mã KH",
      dataIndex: "digiCode",
      key: "digiCode",
      width: 120,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      width: 180,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 140,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Trạng thái KH",
      dataIndex: "isActive",
      key: "isActive",
      width: 140,
      align: "center" as const,
      render: (v: number) => (
        <Tag color={v === 1 ? "green" : "red"}>
          {v === 1 ? "Hoạt động" : "Ngưng"}
        </Tag>
      ),
    },
    {
      title: "Thiết bị",
      dataIndex: "deviceRegistered",
      key: "deviceRegistered",
      width: 140,
      align: "center" as const,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"}>
          {v ? "Đã đăng ký" : "Chưa đăng ký"}
        </Tag>
      ),
    },
    {
      title: "Số TB",
      dataIndex: "deviceCount",
      key: "deviceCount",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Nền tảng",
      dataIndex: "platforms",
      key: "platforms",
      width: 160,
      render: (platforms: string[]) =>
        platforms.length > 0
          ? platforms.map((p) => (
              <Tag key={p} color={PLATFORM_COLOR[p] ?? "default"}>
                {p === "ANDROID" ? "Android" : p === "IOS" ? "iOS" : p}
              </Tag>
            ))
          : "-",
    },
    {
      title: "Lần đăng ký cuối",
      dataIndex: "lastRegisteredAt",
      key: "lastRegisteredAt",
      width: 170,
      render: (v: string | null) =>
        v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-",
    },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Thiết bị khách hàng
      </Typography>

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
            placeholder="Tìm theo tên hoặc mã KH..."
            value={keywordSearch}
            onChange={(e) => setKeywordSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 260 }}
          />
          <Select
            placeholder="Trạng thái thiết bị"
            allowClear
            style={{ width: 180 }}
            value={statusFilter ?? undefined}
            onChange={(val) => {
              setStatusFilter(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="Trạng thái KH"
            allowClear
            style={{ width: 160 }}
            value={activeFilter ?? undefined}
            onChange={(val) => {
              setActiveFilter(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={ACTIVE_OPTIONS}
          />
          <Select
            placeholder="Tuyến đường"
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: 200 }}
            value={roadFilter ?? undefined}
            onChange={(val) => {
              setRoadFilter(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={roadOptions}
            loading={roadOptions.length === 0}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            type="primary"
            icon={<FileDownloadIcon />}
            loading={exporting}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
        </Box>

        <Table
          rowKey="customerId"
          dataSource={devices}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.size,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            hideOnSinglePage: false,
            showTotal: (total) => `Tổng ${total} khách hàng`,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
        />
      </Paper>
    </Box>
  );
}

export default function CustomerDevicesPage() {
  return (
    <Suspense>
      <CustomerDevicesContent />
    </Suspense>
  );
}
