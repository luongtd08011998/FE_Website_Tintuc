"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockIcon from "@mui/icons-material/Lock";
import { dashboardService } from "@/services/dashboard";
import { userService } from "@/services/user";
import { companyService } from "@/services/company";
import { roleService } from "@/services/role";
import { permissionService } from "@/services/permission";

interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Paper sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          "& svg": { fontSize: 28 },
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value === null ? <CircularProgress size={24} /> : value}
        </Typography>
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: null as number | null,
    companies: null as number | null,
    roles: null as number | null,
    permissions: null as number | null,
  });

  useEffect(() => {
    const loadFromListEndpoints = () =>
      Promise.allSettled([
        userService.getAll({ page: 1, size: 1 }),
        companyService.getAll({ page: 1, size: 1 }),
        roleService.getAll({ page: 1, size: 1 }),
        permissionService.getAll({ page: 1, size: 1 }),
      ]).then(([users, companies, roles, permissions]) => {
        setStats({
          users:
            users.status === "fulfilled"
              ? users.value.data.data.meta.total
              : 0,
          companies:
            companies.status === "fulfilled"
              ? companies.value.data.data.meta.total
              : 0,
          roles:
            roles.status === "fulfilled"
              ? roles.value.data.data.meta.total
              : 0,
          permissions:
            permissions.status === "fulfilled"
              ? permissions.value.data.data.meta.total
              : 0,
        });
      });

    dashboardService
      .getSummary()
      .then((res) => {
        const d = res.data.data;
        setStats({
          users: d.totalUsers,
          companies: d.totalCompanies,
          roles: d.totalRoles,
          permissions: d.totalPermissions,
        });
      })
      .catch(() => {
        void loadFromListEndpoints();
      });
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Tổng quan hệ thống quản trị
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Người dùng"
            value={stats.users}
            icon={<PeopleIcon />}
            color="#1677ff"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Công ty"
            value={stats.companies}
            icon={<BusinessIcon />}
            color="#52c41a"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Vai trò"
            value={stats.roles}
            icon={<AdminPanelSettingsIcon />}
            color="#fa8c16"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Quyền"
            value={stats.permissions}
            icon={<LockIcon />}
            color="#eb2f96"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
