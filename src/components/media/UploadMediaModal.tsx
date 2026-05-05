"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  LinearProgress,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { App } from "antd";
import { mediaService } from "@/services/media";

interface UploadMediaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "pdf",
  "doc",
  "docx",
];
const MAX_SIZE_MB = 10;

export default function UploadMediaModal({
  open,
  onClose,
  onSuccess,
}: UploadMediaModalProps) {
  const { notification } = App.useApp();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      notification.error({
        title: "Lỗi định dạng",
        description: `Chỉ hỗ trợ các định dạng: ${ALLOWED_EXTENSIONS.join(", ")}`,
      });
      return;
    }

    if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
      notification.error({
        title: "Lỗi kích thước",
        description: `Kích thước file không được vượt quá ${MAX_SIZE_MB}MB`,
      });
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Tự động điền title từ tên file (bỏ extension)
      const nameWithoutExt = selectedFile.name.substring(
        0,
        selectedFile.name.lastIndexOf("."),
      );
      setTitle(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      await mediaService.upload(file, title);
      notification.success({
        title: "Thành công",
        description: "Upload media thành công",
      });
      onSuccess();
      handleClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      notification.error({
        title: "Thất bại",
        description: axiosErr.response?.data?.message ?? "Có lỗi khi upload file",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Upload Media</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box
            onClick={() => !uploading && fileInputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: file ? "primary.main" : "grey.300",
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: uploading ? "not-allowed" : "pointer",
              bgcolor: file ? "primary.50" : "transparent",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "grey.50",
              },
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept={ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            />
            <CloudUploadIcon
              sx={{ fontSize: 48, color: file ? "primary.main" : "grey.400" }}
            />
            <Typography variant="body1" sx={{ mt: 1, fontWeight: 500 }}>
              {file ? file.name : "Nhấp để chọn hoặc kéo thả file vào đây"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG, GIF, WEBP, PDF, DOCX (Max 10MB)
            </Typography>
          </Box>

          <TextField
            label="Tiêu đề"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề cho file (tùy chọn)"
            disabled={uploading}
          />

          {uploading && (
            <Box sx={{ width: "100%" }}>
              <Typography variant="caption" color="text.secondary">
                Đang upload...
              </Typography>
              <LinearProgress sx={{ mt: 0.5, borderRadius: 1 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={<CloudUploadIcon />}
        >
          Tải lên
        </Button>
      </DialogActions>
    </Dialog>
  );
}
