"use client";

import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import { App } from "antd";
import type { Media } from "@/types";
import { getFileUrl } from "@/services/file";
import { formatFileSize, copyToClipboard } from "@/lib/utils";

interface MediaCardProps {
  media: Media;
  onDelete: (id: number) => void;
  canDelete: boolean;
}

export default function MediaCard({ media, onDelete, canDelete }: MediaCardProps) {
  const { notification, modal } = App.useApp();
  const fullUrl = getFileUrl(media.fileUrl);

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(
    media.fileType.toLowerCase(),
  );
  const isPdf = media.fileType.toLowerCase() === "pdf";
  const isWord = ["doc", "docx"].includes(media.fileType.toLowerCase());

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(fullUrl);
    if (success) {
      notification.success({
        title: "Thành công",
        description: "Đã sao chép link liên kết",
      });
    }
  };

  const handleDelete = () => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: `Bạn có chắc chắn muốn xóa file "${media.title}"?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => onDelete(media.id),
    });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        "&:hover .media-actions": { opacity: 1 },
      }}
    >
      <Box sx={{ position: "relative", pt: "60%", bgcolor: "grey.100" }}>
        {isImage ? (
          <CardMedia
            component="img"
            image={fullUrl}
            alt={media.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isPdf ? (
              <PictureAsPdfIcon sx={{ fontSize: 48, color: "error.main" }} />
            ) : isWord ? (
              <DescriptionIcon sx={{ fontSize: 48, color: "primary.main" }} />
            ) : (
              <DescriptionIcon sx={{ fontSize: 48, color: "text.secondary" }} />
            )}
          </Box>
        )}

        <Stack
          className="media-actions"
          direction="row"
          spacing={1}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: 0,
            transition: "opacity 0.2s",
            bgcolor: "rgba(255, 255, 255, 0.8)",
            borderRadius: 1,
            p: 0.5,
          }}
        >
          <Tooltip title="Copy URL">
            <IconButton size="small" onClick={handleCopyUrl}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Xóa">
              <IconButton size="small" color="error" onClick={handleDelete}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="subtitle2"
          noWrap
          title={media.title}
          sx={{ fontWeight: 600 }}
        >
          {media.title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {media.fileType.toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(media.fileSize)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
