"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  MenuItem,
  Button,
  Pagination,
  Stack,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import useSWR from "swr";
import { mediaService } from "@/services/media";
import MediaCard from "@/components/media/MediaCard";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import { App } from "antd";
import { useAuthStore } from "@/lib/store";

const FILE_TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "jpg", label: "Hình ảnh (JPG)" },
  { value: "png", label: "Hình ảnh (PNG)" },
  { value: "pdf", label: "Tài liệu (PDF)" },
  { value: "docx", label: "Tài liệu (Word)" },
];

export default function MediaPage() {
  const { notification } = App.useApp();
  const user = useAuthStore((s) => s.user);
  
  // State cho filter và pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch dữ liệu với SWR
  const { data, error, isLoading, mutate } = useSWR(
    [`/media`, page, title, fileType],
    () => mediaService.getAll({ page, pageSize, title, fileType }),
  );

  const mediaList = data?.data.data.result ?? [];
  const meta = data?.data.data.meta;

  const handleDeleteMedia = async (id: number) => {
    try {
      await mediaService.delete(id);
      notification.success({
        title: "Thành công",
        description: "Đã xóa media thành công",
      });
      mutate();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      notification.error({
        title: "Thất bại",
        description: axiosErr.response?.data?.message ?? "Không thể xóa file này",
      });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleFileTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileType(e.target.value);
    setPage(1); // Reset về trang 1 khi lọc
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          Thư viện Media
        </Typography>
        {user && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadModalOpen(true)}
          >
            Tải lên
          </Button>
        )}
      </Stack>

      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          bgcolor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            fullWidth
            placeholder="Tìm kiếm theo tiêu đề media..."
            value={title}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 },
            }}
          />
          <TextField
            select
            label="Loại file"
            value={fileType}
            onChange={handleFileTypeChange}
            sx={{ minWidth: { xs: "100%", md: 220 } }}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
          >
            {FILE_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: "center", color: "error.main" }}>
          <Typography>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.</Typography>
        </Paper>
      ) : mediaList.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {mediaList.map((media) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={media.id}>
                <MediaCard
                  media={media}
                  onDelete={handleDeleteMedia}
                  canDelete={!!user}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={meta.pages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      ) : (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy media nào.
          </Typography>
        </Paper>
      )}

      {/* Upload Modal */}
      <UploadMediaModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </Box>
  );
}
