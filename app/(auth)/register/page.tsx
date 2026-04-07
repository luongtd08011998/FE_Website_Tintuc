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
  MenuItem,
} from "@mui/material";
import { authService } from "@/services/auth";

const schema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu ít nhất 8 ký tự"),
  age: z.coerce.number().min(1, "Tuổi không hợp lệ").max(120),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().min(1, "Địa chỉ không được để trống"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "MALE" },
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await authService.register(data);
      router.push("/login");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? "Đăng ký thất bại");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 480 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        Đăng ký tài khoản
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Điền thông tin để tạo tài khoản mới
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Họ và tên"
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Tuổi"
            type="number"
            fullWidth
            margin="normal"
            error={!!errors.age}
            helperText={errors.age?.message}
            {...register("age")}
          />
          <TextField
            label="Giới tính"
            select
            fullWidth
            margin="normal"
            defaultValue="MALE"
            error={!!errors.gender}
            helperText={errors.gender?.message}
            {...register("gender")}
          >
            <MenuItem value="MALE">Nam</MenuItem>
            <MenuItem value="FEMALE">Nữ</MenuItem>
            <MenuItem value="OTHER">Khác</MenuItem>
          </TextField>
        </Box>
        <TextField
          label="Địa chỉ"
          fullWidth
          margin="normal"
          error={!!errors.address}
          helperText={errors.address?.message}
          {...register("address")}
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
            "Đăng ký"
          )}
        </Button>

        <Typography variant="body2" textAlign="center">
          Đã có tài khoản?{" "}
          <Link href="/login" style={{ color: "inherit", fontWeight: 600 }}>
            Đăng nhập
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
}
