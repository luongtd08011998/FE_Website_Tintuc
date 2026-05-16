"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, Typography, Paper, TextField, InputAdornment, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DownloadIcon from "@mui/icons-material/Download";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Table, DatePicker, Select, Tag, Modal, message, App } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import useSWR from "swr";
import dayjs from "dayjs";
import { invoiceService } from "@/services/invoice";
import type { AdminInvoice } from "@/types";

const STATUS_OPTIONS = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chưa thanh toán", value: 1 },
  { label: "Đã thanh toán", value: 2 },
];

function InvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { modal, message: appMessage } = App.useApp();
  const [pagination, setPagination] = useState({ page: 1, size: 10 });
  const [yearMonth, setYearMonth] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<number | null>(null);
  const [remindStatus, setRemindStatus] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [digiCode, setDigiCode] = useState("");
  const [debounced, setDebounced] = useState({
    customerName: "",
    digiCode: "",
  });

  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isSendingOverdue, setIsSendingOverdue] = useState(false);
  const [waterCutoffModal, setWaterCutoffModal] = useState<{ open: boolean; record: AdminInvoice | null }>({
    open: false,
    record: null,
  });
  const [cutoffEmployeeName, setCutoffEmployeeName] = useState("");
  const [cutoffEmployeePhone, setCutoffEmployeePhone] = useState("");
  const [isSendingCutoff, setIsSendingCutoff] = useState(false);

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

  // Reset selection khi đổi trang hoặc filter
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [pagination.page, yearMonth, paymentStatus, remindStatus, debounced.customerName, debounced.digiCode]);

  const fetcher = useCallback(() => {
    const params: Record<string, unknown> = {
      page: pagination.page,  // Spring đã cấu hình one-indexed-parameters: true
      size: pagination.size,
    };
    if (yearMonth) params.yearMonth = yearMonth;
    if (paymentStatus !== null) params.paymentStatus = paymentStatus;
    if (remindStatus !== null) params.remindStatus = remindStatus;
    if (debounced.customerName) params.customerName = debounced.customerName;
    if (debounced.digiCode) params.digiCode = debounced.digiCode;
    
    return invoiceService.getAll(params);
  }, [pagination.page, pagination.size, yearMonth, paymentStatus, remindStatus, debounced.customerName, debounced.digiCode]);

  const { data, isLoading } = useSWR(
    yearMonth ? ["invoices", pagination.page, pagination.size, yearMonth, paymentStatus, remindStatus, debounced.customerName, debounced.digiCode] : null,
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

  const handleSendReminder = () => {
    if (!yearMonth) return;
    modal.confirm({
      title: "Gửi nhắc nợ toàn bộ",
      content: `Bạn có chắc chắn muốn gửi thông báo nhắc nợ cho TẤT CẢ khách hàng chưa thanh toán trong kỳ ${formatYearMonth(yearMonth)}?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingReminder(true);
          const res = await invoiceService.sendDebtReminder(yearMonth);
          if (res.data.data) {
             appMessage.success(`Gửi thành công: Đã gửi ${res.data.data.sentCount} thông báo.`);
          } else {
             appMessage.success("Đã hoàn tất gửi nhắc nợ.");
          }
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra khi gửi thông báo: " + error.message);
        } finally {
          setIsSendingReminder(false);
        }
      },
    });
  };

  const handleSelectedReminder = () => {
    if (selectedRowKeys.length === 0) return;
    modal.confirm({
      title: "Gửi nhắc nợ mục đã chọn",
      content: `Bạn có chắc chắn muốn gửi thông báo nhắc nợ cho ${selectedRowKeys.length} khách hàng đã chọn?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingReminder(true);
          let successCount = 0;
          
          // Vì BE chỉ nhận 1 ID mỗi lần gọi, ta thực hiện gọi lần lượt
          for (const id of selectedRowKeys) {
            const invoice = invoices.find((inv: AdminInvoice) => inv.id === id);
            if (invoice) {
              try {
                const res = await invoiceService.sendDebtReminder(invoice.yearMonth, invoice.id);
                if (res.data.data && res.data.data.sentCount > 0) {
                  successCount++;
                }
              } catch (e) {
                console.error(`Lỗi gửi cho ID ${String(id)}`, e);
              }
            }
          }
          
          appMessage.success(`Đã gửi thành công ${successCount}/${selectedRowKeys.length} thông báo.`);
          setSelectedRowKeys([]);
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra khi gửi thông báo.");
        } finally {
          setIsSendingReminder(false);
        }
      },
    });
  };

  const handleExport = async () => {
    if (!yearMonth) {
      appMessage.warning("Vui lòng chọn kỳ hóa đơn trước khi xuất file.");
      return;
    }
    try {
      setIsExporting(true);
      // Gọi API lấy toàn bộ dữ liệu theo bộ lọc hiện tại
      const params: Record<string, unknown> = {
        page: 1,
        size: 99999,
        yearMonth,
      };
      if (paymentStatus !== null) params.paymentStatus = paymentStatus;
      if (remindStatus !== null) params.remindStatus = remindStatus;
      if (debounced.customerName) params.customerName = debounced.customerName;
      if (debounced.digiCode) params.digiCode = debounced.digiCode;

      const res = await invoiceService.getAll(params);
      const rows: AdminInvoice[] = res.data.data.result ?? [];

      if (rows.length === 0) {
        appMessage.info("Không có dữ liệu để xuất.");
        return;
      }

      // Tạo nội dung CSV
      const PAYMENT_LABEL: Record<number, string> = { 1: "Chưa thanh toán", 2: "Đã thanh toán" };
      const headers = ["STT", "Mã KH", "Tên khách hàng", "Kỳ hóa đơn", "Mã hóa đơn", "Tổng tiền (VNĐ)", "Trạng thái", "Nhắc nợ"];
      const csvData = rows.map((row, idx) => [
        idx + 1,
        row.digiCode,
        row.customerName,
        `${String(row.yearMonth).substring(4, 6)}/${String(row.yearMonth).substring(0, 4)}`,
        row.invoiceNo ?? "",
        row.totalAmount,
        PAYMENT_LABEL[row.paymentStatus] ?? "",
        row.isReminded ? "Đã nhắc" : "Chưa nhắc",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      // Thêm BOM để Excel mở đúng tiếng Việt
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const ym = `${String(yearMonth).substring(4, 6)}-${String(yearMonth).substring(0, 4)}`;
      link.href = url;
      link.download = `hoa-don-${ym}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      appMessage.success(`Xuất thành công ${rows.length} hóa đơn.`);
    } catch (error: any) {
      appMessage.error("Xuất file thất bại: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendSingleReminder = (record: AdminInvoice) => {
    modal.confirm({
      title: "Gửi nhắc nợ",
      content: `Bạn có chắc chắn muốn gửi thông báo nhắc nợ cho khách hàng ${record.customerName}?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingReminder(true);
          const res = await invoiceService.sendDebtReminder(record.yearMonth, record.id);
          if (res.data.data && res.data.data.sentCount > 0) {
             appMessage.success(`Đã gửi thông báo nhắc nợ cho ${record.customerName}.`);
          } else {
             appMessage.info("Không gửi được thông báo hoặc khách hàng này đã đóng tiền/không có thiết bị.");
          }
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra khi gửi thông báo: " + error.message);
        } finally {
          setIsSendingReminder(false);
        }
      },
    });
  };

  // ── Quá hạn thanh toán ──
  const handleSendOverdueAll = () => {
    if (!yearMonth) return;
    modal.confirm({
      title: "Gửi thông báo quá hạn toàn bộ",
      content: `Gửi thông báo quá hạn thanh toán cho TẤT CẢ khách hàng chưa thanh toán trong kỳ ${formatYearMonth(yearMonth)}?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingOverdue(true);
          const res = await invoiceService.sendOverdueReminder(yearMonth);
          if (res.data.data) {
            appMessage.success(`Gửi thành công: ${res.data.data.sentCount} thông báo, bỏ qua ${res.data.data.skipCount}.`);
          } else {
            appMessage.success("Đã hoàn tất gửi thông báo quá hạn.");
          }
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra: " + error.message);
        } finally {
          setIsSendingOverdue(false);
        }
      },
    });
  };

  const handleSendOverdueSelected = () => {
    if (selectedRowKeys.length === 0) return;
    modal.confirm({
      title: "Gửi thông báo quá hạn mục đã chọn",
      content: `Gửi thông báo quá hạn cho ${selectedRowKeys.length} khách hàng đã chọn?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingOverdue(true);
          let successCount = 0;
          for (const id of selectedRowKeys) {
            const invoice = invoices.find((inv: AdminInvoice) => inv.id === id);
            if (invoice) {
              try {
                const res = await invoiceService.sendOverdueReminder(invoice.yearMonth, invoice.id);
                if (res.data.data && res.data.data.sentCount > 0) successCount++;
              } catch (e) {
                console.error(`Lỗi gửi quá hạn cho ID ${String(id)}`, e);
              }
            }
          }
          appMessage.success(`Đã gửi thành công ${successCount}/${selectedRowKeys.length} thông báo quá hạn.`);
          setSelectedRowKeys([]);
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra khi gửi thông báo.");
        } finally {
          setIsSendingOverdue(false);
        }
      },
    });
  };

  const handleSendOverdueSingle = (record: AdminInvoice) => {
    modal.confirm({
      title: "Gửi thông báo quá hạn",
      content: `Gửi thông báo quá hạn thanh toán cho khách hàng ${record.customerName}?`,
      okText: "Gửi ngay",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSendingOverdue(true);
          const res = await invoiceService.sendOverdueReminder(record.yearMonth, record.id);
          if (res.data.data && res.data.data.sentCount > 0) {
            appMessage.success(`Đã gửi thông báo quá hạn cho ${record.customerName}.`);
          } else {
            appMessage.info("Không gửi được hoặc khách hàng đã thanh toán.");
          }
        } catch (error: any) {
          appMessage.error("Có lỗi xảy ra: " + error.message);
        } finally {
          setIsSendingOverdue(false);
        }
      },
    });
  };

  // ── Cúp nước ──
  const handleOpenWaterCutoff = (record: AdminInvoice) => {
    setCutoffEmployeeName("");
    setCutoffEmployeePhone("");
    setWaterCutoffModal({ open: true, record });
  };

  const handleSendWaterCutoff = async () => {
    const record = waterCutoffModal.record;
    if (!record) return;
    try {
      setIsSendingCutoff(true);
      const res = await invoiceService.sendWaterCutoff(
        record.id,
        cutoffEmployeeName.trim() || undefined,
        cutoffEmployeePhone.trim() || undefined,
      );
      if (res.data.data) {
        appMessage.success(`Đã gửi thông báo cúp nước cho ${record.customerName}.`);
      } else {
        appMessage.info("Không gửi được thông báo cúp nước.");
      }
    } catch (error: any) {
      appMessage.error("Có lỗi xảy ra: " + error.message);
    } finally {
      setIsSendingCutoff(false);
      setWaterCutoffModal({ open: false, record: null });
    }
  };


  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: AdminInvoice) => ({
      // Vô hiệu hóa checkbox cho hóa đơn đã thanh toán hoặc hóa đơn thay thế
      disabled: record.paymentStatus === 2 || record.hasReplacement,
    }),
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      render: (_: any, __: any, index: number) =>
        (pagination.page - 1) * pagination.size + index + 1,
    },
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
      title: "Mã hóa đơn",
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
    {
      title: "Hành động",
      key: "action",
      width: 300,
      render: (_: any, record: AdminInvoice) => {
        const hasReplacement = record.hasReplacement;
        const unpaid = record.paymentStatus === 1 && !hasReplacement;

        if (unpaid) {
          return (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                color={record.isReminded ? "success" : "warning"}
                size="small"
                startIcon={<NotificationsActiveIcon />}
                onClick={() => handleSendSingleReminder(record)}
                disabled={isSendingReminder}
              >
                {record.isReminded ? "Nhắc lại" : "Nhắc nợ"}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<WarningAmberIcon />}
                onClick={() => handleSendOverdueSingle(record)}
                disabled={isSendingOverdue}
              >
                Quá hạn
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<WaterDropIcon />}
                onClick={() => handleOpenWaterCutoff(record)}
                disabled={isSendingCutoff}
              >
                Cúp nước
              </Button>
            </Box>
          );
        }

        if (hasReplacement) {
           return <Tag color="default">Hóa đơn thay thế</Tag>;
        }

        return null;
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Quản lý Hóa đơn
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {selectedRowKeys.length > 0 && (
            <>
              <Button
                variant="contained"
                color="info"
                startIcon={<NotificationsActiveIcon />}
                onClick={handleSelectedReminder}
                disabled={isSendingReminder}
              >
                Nhắc nợ ({selectedRowKeys.length})
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<WarningAmberIcon />}
                onClick={handleSendOverdueSelected}
                disabled={isSendingOverdue}
              >
                Quá hạn ({selectedRowKeys.length})
              </Button>
            </>
          )}
          {yearMonth && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? "Đang xuất..." : "Xuất Excel"}
            </Button>
          )}
          {paymentStatus === 1 && yearMonth && (
             <>
               <Button
                 variant="contained"
                 color="warning"
                 startIcon={<NotificationsActiveIcon />}
                 onClick={handleSendReminder}
                 disabled={isSendingReminder}
               >
                 Nhắc nợ toàn bộ
               </Button>
               <Button
                 variant="contained"
                 color="error"
                 startIcon={<WarningAmberIcon />}
                 onClick={handleSendOverdueAll}
                 disabled={isSendingOverdue}
               >
                 Quá hạn toàn bộ
               </Button>
             </>
          )}
        </Box>
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
            value={paymentStatus ?? ""}
            onChange={(val) => {
              setPaymentStatus(val !== "" && val !== null && val !== undefined ? Number(val) : null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={STATUS_OPTIONS}
          />

          <Select
            placeholder="Trạng thái nhắc nợ"
            allowClear
            style={{ width: 180 }}
            value={remindStatus ?? ""}
            onChange={(val) => {
              setRemindStatus(val !== "" ? val : null);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            options={[
              { label: "Tất cả nhắc nợ", value: "" },
              { label: "Đã nhắc nợ", value: 1 },
              { label: "Chưa nhắc nợ", value: 0 },
            ]}
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
            rowSelection={rowSelection}
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

      {/* Modal cúp nước */}
      <Modal
        open={waterCutoffModal.open}
        title={`Gửi thông báo cúp nước - ${waterCutoffModal.record?.customerName ?? ""}`}
        okText="Gửi ngay"
        cancelText="Hủy"
        onOk={handleSendWaterCutoff}
        onCancel={() => setWaterCutoffModal({ open: false, record: null })}
        confirmLoading={isSendingCutoff}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Thông báo sẽ được gửi cho khách hàng <strong>{waterCutoffModal.record?.customerName}</strong> (Mã KH: {waterCutoffModal.record?.digiCode}).
          </Typography>
          <TextField
            label="Tên nhân viên thực hiện"
            size="small"
            value={cutoffEmployeeName}
            onChange={(e) => setCutoffEmployeeName(e.target.value)}
            placeholder="Bỏ qua để dùng mặc định"
            fullWidth
          />
          <TextField
            label="SĐT nhân viên"
            size="small"
            value={cutoffEmployeePhone}
            onChange={(e) => setCutoffEmployeePhone(e.target.value)}
            placeholder="Bỏ qua để dùng mặc định"
            fullWidth
          />
          <Typography variant="caption" color="text.secondary">
            Tên và SĐT nhân viên sẽ tự động được ẩn khi gửi cho khách hàng (VD: Nguyễn Thị Thu → N*** T*** T***).
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}

export default function InvoicesPage() {
  return (
    <App>
      <Suspense>
        <InvoicesContent />
      </Suspense>
    </App>
  );
}
