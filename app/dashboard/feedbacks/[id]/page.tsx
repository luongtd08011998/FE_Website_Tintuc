"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider, IconButton, ImageList, ImageListItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import { Tag, Select, App, Spin } from "antd";
import dayjs from "dayjs";
import { feedbackService } from "@/services/feedback";
import { getFileUrl } from "@/services/file";
import type { FeedbackStatus, FeedbackDetail, IssueType } from "@/types";

const STATUS_OPTIONS = [
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

const ISSUE_TYPE_LABEL: Record<IssueType, string> = {
  LEAK: "Rò rỉ",
  QUALITY: "Chất lượng",
  PRESSURE: "Áp lực",
  OUTAGE: "Cắt nước",
  BILLING: "Thanh toán",
  METER: "Đồng hồ",
  OTHER: "Khác",
};

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const id = Number(params.id);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    id ? `feedback-detail-${id}` : null,
    () => feedbackService.getById(id),
  );

  const feedback: FeedbackDetail | undefined = data?.data?.data;

  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    try {
      await feedbackService.updateStatus(id, { status: newStatus });
      notification.success({ title: "Cập nhật trạng thái thành công" });
      mutate();
    } catch {
      notification.error({ title: "Cập nhật trạng thái thất bại" });
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await feedbackService.addReply(id, { content: replyContent.trim() });
      notification.success({ title: "Gửi phản hồi thành công" });
      setReplyContent("");
      mutate();
    } catch {
      notification.error({ title: "Gửi phản hồi thất bại" });
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <Spin size="large" />
      </Box>
    );
  }

  if (!feedback) {
    return (
      <Box sx={{ textAlign: "center", py: 10 }}>
        <Typography>Không tìm thấy phản hồi</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={() => router.push("/dashboard/feedbacks")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Chi tiết phản hồi
        </Typography>
        <Tag color={STATUS_COLOR[feedback.status]} style={{ fontSize: 13 }}>
          {STATUS_OPTIONS.find((s) => s.value === feedback.status)?.label}
        </Tag>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Info */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {feedback.trackingCode}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
                <Select
                  value={feedback.status}
                  onChange={handleStatusChange}
                  options={STATUS_OPTIONS}
                  style={{ width: "100%", marginTop: 4 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Loại vấn đề
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  <Tag>{ISSUE_TYPE_LABEL[feedback.issueType]}</Tag>
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Vị trí
                </Typography>
                <Typography variant="body1">{feedback.location}</Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Mô tả
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: "grey.50" }}>
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {feedback.description}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {feedback.images.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Hình ảnh đính kèm
                </Typography>
                <ImageList cols={3} gap={8}>
                  {feedback.images.map((img, idx) => (
                    <ImageListItem key={idx}>
                      <Box
                        component="img"
                        src={getFileUrl(img)}
                        alt={`img-${idx}`}
                        sx={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 1,
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Paper>

          {/* Replies section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Phản hồi ({feedback.replies.length})
            </Typography>

            {feedback.replies.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Chưa có phản hồi nào.
              </Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {feedback.replies.map((reply) => (
                <Box
                  key={reply.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "grey.50",
                  }}
                >
                  <Avatar
                    src={reply.staff.avatar ? getFileUrl(reply.staff.avatar) : undefined}
                    sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}
                  >
                    {reply.staff.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {reply.staff.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(reply.createdAt).format("DD/MM/YYYY HH:mm")}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {reply.content}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                placeholder="Nhập phản hồi cho khách hàng..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleReply();
                  }
                }}
              />
              <Button
                variant="contained"
                onClick={handleReply}
                disabled={!replyContent.trim() || submitting}
                sx={{ minWidth: 48 }}
              >
                <SendIcon />
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Right: Customer info */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Thông tin khách hàng
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Mã KH</Typography>
                <Typography variant="body1">{feedback.customer.digiCode}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Tên</Typography>
                <Typography variant="body1">{feedback.customer.name}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                <Typography variant="body1">{feedback.customer.phone}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{feedback.customer.email}</Typography>
              </Box>
              {feedback.customer.address && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Địa chỉ</Typography>
                  <Typography variant="body1">{feedback.customer.address}</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Thời gian
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Ngày tạo</Typography>
                <Typography variant="body1">
                  {dayjs(feedback.createdAt).format("DD/MM/YYYY HH:mm")}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Cập nhật gần nhất</Typography>
                <Typography variant="body1">
                  {dayjs(feedback.updatedAt).format("DD/MM/YYYY HH:mm")}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
