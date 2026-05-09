"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Paper, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Table, DatePicker, Select, Tag } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import dayjs from "dayjs";
import { invoiceService } from "@/services/invoice";
import type { AdminInvoice } from "@/types";

const STATUS_OPTIONS = [
  { label: "Chưa thanh toán", value: 1 },
  { label: "Đã thanh toán", value: 2 },
];

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [yearMonth, setYearMonth] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [digiCode, setDigiCode] = useState("");
  const [debounced, setDebounced] = useState({
    customerName: "",
    digiCode: "",
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({
        customerName: customerName.trim(),
        digiCode: digiCode.trim(),
      });
      setPagination((p) => ({ ...p, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [customerName, digiCode]);

  const fetcher = useCallback(() => {
    const params: Record<string, unknown> = {
      page: pagination.page - 1,
      size: pagination.size,
    };
    if (yearMonth) params.yearMonth = yearMonth;
    if (paymentStatus !== null) params.paymentStatus = paymentStatus;
    if (debounced.customerName) params.customerName = debounced.customerName;
    if (debounced.digiCode) params.digiCode = debounced.digiCode;
    
    return invoiceService.getAll(params);
  }, [pagination.page, pagination.size, yearMonth, paymentStatus, debounced.customerName, debounced.digiCode]);

  const { data, isLoading } = useSWR(
    yearMonth ? ["invoices", pagination.page, pagination.size, yearMonth, paymentStatus, debounced.customerName, debounced.digiCode] : null,
    fetcher
  );

  const meta = data?.data.data.meta;
  const invoices = data?.data.data.result ?? [];

  const handleTableChange = (config: TablePaginationConfig) => {
    setPagination({
      page: config.current ?? 1,
      size: config.pageSize ?? 10,
    });
  };

  const handleMonthChange = (date: any) => {
    setYearMonth(date ? date.format("YYYYMM") : null);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatYearMonth = (ym: string) => {
    if (!ym || ym.length !== 6) return ym;
    return `${ym.substring(4, 6)}/${ym.substring(0, 4)}`;
  };

  const columns = [
    {
      title: "Mã KH",
      dataIndex: "digiCode",
      key: "digiCode",
      width: 140,
      render: (v: string) => <Typography variant="body2" fontWeight={500}>{v}</Typography>,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 200,
    },
    {
      title: "Kỳ hóa đơn",
      dataIndex: "yearMonth",
      key: "yearMonth",
      width: 120,
      render: (v: string) => formatYearMonth(v),
    },
    {
      title: "Mã hóa đơn VNPT",
      dataIndex: "invoiceNo",
      key: "invoiceNo",
      width: 180,
      render: (v: string) => v || <Typography variant="caption" color="text.secondary">Chưa có / Đang lấy</Typography>,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 140,
      render: (v: number) => <Typography variant="body2" fontWeight={600} color="primary">{formatCurrency(v)}</Typography>,
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 140,
      render: (v: number) => {
        if (v === 1) return <Tag color="gold">Chưa thanh toán</Tag>;
        if (v === 2) return <Tag color="green">Đã thanh toán</Tag>;
        return <Tag>Không xác định</Tag>;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Quản lý Hóa đơn
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Tìm theo Mã KH..."
            value={digiCode}
            onChange={(e) => setDigiCode(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 180 }}
          />
          <TextField
            size="small"
            placeholder="Tìm theo Tên KH..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 220 }}
          />
          <DatePicker
            picker="month"
            placeholder="Chọn kỳ (Tháng/Năm)"
            format="MM/YYYY"
            onChange={handleMonthChange}
            allowClear
            style={{ width: 180 }}
          />
          
          <Select
            placeholder="Trạng thái thanh toán"
            allowClear
            style={{ width: 180 }}
            value={paymentStatus}
            onChange={(val) => {
              setPaymentStatus(val ?? null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={STATUS_OPTIONS}
          />
        </Box>

        {!yearMonth ? (
          <Box sx={{ py: 10, textAlign: "center", bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography color="text.secondary">
              Vui lòng chọn <strong>Kỳ hóa đơn (Tháng/Năm)</strong> để bắt đầu xem dữ liệu.
            </Typography>
          </Box>
        ) : (
          <Table
            rowKey="id"
            dataSource={invoices}
            columns={columns}
            loading={isLoading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.size,
              total: meta?.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              hideOnSinglePage: false,
              showTotal: (total) => `Tổng ${total} hóa đơn`,
            }}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
          />
        )}
      </Paper>
    </Box>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
