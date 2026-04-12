"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/lib/store";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAccessToken, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await authService.login(data);
      const { accessToken, refreshToken } = res.data.data;
      setAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const meRes = await authService.getMe();
      setUser(meRes.data.data);

      router.push("/dashboard");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Đăng nhập thất bại");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 440 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "primary.main",
            fontSize: "1.75rem",
            fontWeight: 700,
          }}
          aria-label="Logo công ty"
        >
          TT
        </Avatar>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          textAlign="center"
          color="primary"
          lineHeight={1.4}
        >
          CÔNG TY TNHH CẤP NƯỚC TÓC TIÊN
        </Typography>
      </Box>
      <Typography variant="h5" fontWeight={700} mb={1} textAlign="center">
        Đăng nhập
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        mb={3}
        textAlign="center"
      >
        Nhập thông tin tài khoản để tiếp tục
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 3, mb: 2 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Đăng nhập"
          )}
        </Button>

        <Typography variant="body2" textAlign="center">
          Chưa có tài khoản?{" "}
          <Link href="/register" style={{ color: "inherit", fontWeight: 600 }}>
            Đăng ký
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}
