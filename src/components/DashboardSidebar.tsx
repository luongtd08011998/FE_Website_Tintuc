"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockIcon from "@mui/icons-material/Lock";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import ArticleIcon from "@mui/icons-material/Article";
import ForumIcon from "@mui/icons-material/Forum";
import LogoutIcon from "@mui/icons-material/Logout";
import PermMediaIcon from "@mui/icons-material/PermMedia";
import ReceiptIcon from "@mui/icons-material/Receipt";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DevicesIcon from "@mui/icons-material/Devices";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/services/auth";
import { getFileUrl } from "@/services/file";

const DRAWER_WIDTH = 260;

const navSections = [
  {
    label: "Quản lý người dùng",
    items: [
      { label: "Người dùng", href: "/dashboard/users", icon: <PeopleIcon /> },
      { label: "Công ty", href: "/dashboard/companies", icon: <BusinessIcon /> },
      { label: "Vai trò", href: "/dashboard/roles", icon: <AdminPanelSettingsIcon /> },
      { label: "Quyền", href: "/dashboard/permissions", icon: <LockIcon /> },
    ],
  },
  {
    label: "Bài viết",
    items: [
      { label: "Danh mục", href: "/dashboard/categories", icon: <CategoryIcon /> },
      { label: "Bài viết", href: "/dashboard/articles", icon: <ArticleIcon /> },
      { label: "Tag", href: "/dashboard/tags", icon: <LocalOfferIcon /> },
      { label: "Tài liệu", href: "/dashboard/documents", icon: <DescriptionIcon /> },
      { label: "Thư viện Media", href: "/dashboard/media", icon: <PermMediaIcon /> },
    ],
  },
  {
    label: "Chăm sóc khách hàng",
    items: [
      { label: "Phản hồi", href: "/dashboard/feedbacks", icon: <ForumIcon /> },
      { label: "Hóa đơn", href: "/dashboard/invoices", icon: <ReceiptIcon /> },
      { label: "Thông báo", href: "/dashboard/notifications", icon: <NotificationsIcon /> },
      { label: "Thiết bị KH", href: "/dashboard/customer-devices", icon: <DevicesIcon /> },
    ],
  },
];

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, sidebarOpen, setSidebarOpen, logout, accessToken } =
    useAuthStore();

  useEffect(() => {
    const token =
      accessToken ??
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);
    if (!token) {
      router.push("/login");
    }
  }, [accessToken, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      logout();
      router.push("/login");
    }
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          pt: 2.5,
          pb: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box
          component="img"
          src="/logocty1.jpg"
          alt="Logo công ty"
          sx={{ width: 48, height: 48, objectFit: "contain", display: "block" }}
        />
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary"
          textAlign="center"
          lineHeight={1.3}
          px={1.5}
          fontSize={11}
        >
          CÔNG TY TNHH CẤP NƯỚC TÓC TIÊN
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {/* Dashboard */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={Link}
            href="/dashboard"
            selected={isActive("/dashboard")}
            onClick={() => setSidebarOpen(false)}
            sx={{
              borderRadius: 1.5,
              py: 1,
              "&.Mui-selected": {
                bgcolor: "primary.main",
                color: "white",
                "& .MuiListItemIcon-root": { color: "white" },
                "&:hover": { bgcolor: "primary.dark" },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DashboardIcon sx={{ fontSize: 20 }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>

        {/* Grouped sections */}
        {navSections.map((section) => (
          <Box key={section.label}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ px: 2, py: 1, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 11 }}
            >
              {section.label}
            </Typography>
            {section.items.map((item) => {
              const active = isActive(item.href);
              return (
                <ListItem key={item.href} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={active}
                    onClick={() => setSidebarOpen(false)}
                    sx={{
                      borderRadius: 1.5,
                      py: 0.6,
                      "&.Mui-selected": {
                        bgcolor: "primary.main",
                        color: "white",
                        "& .MuiListItemIcon-root": { color: "white" },
                        "&:hover": { bgcolor: "primary.dark" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            <Divider sx={{ my: 0.5 }} />
          </Box>
        ))}
      </List>

      {user && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={user.avatar ? getFileUrl(user.avatar) : undefined}
            sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: 14 }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: "hidden" }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.roles?.[0]?.name ?? "Super Admin"}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={user.avatar ? getFileUrl(user.avatar) : undefined}
                sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 14 }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={500}>
                {user.name}
              </Typography>
            </Box>
          )}
          <Tooltip title="Đăng xuất">
            <IconButton onClick={handleLogout} sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: "background.default",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
