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
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthStore } from "@/lib/store";
import { authService } from "@/services/auth";
import { getFileUrl } from "@/services/file";

const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Người dùng", href: "/dashboard/users", icon: <PeopleIcon /> },
  { label: "Công ty", href: "/dashboard/companies", icon: <BusinessIcon /> },
  {
    label: "Vai trò",
    href: "/dashboard/roles",
    icon: <AdminPanelSettingsIcon />,
  },
  { label: "Quyền", href: "/dashboard/permissions", icon: <LockIcon /> },
  { label: "Tag", href: "/dashboard/tags", icon: <LocalOfferIcon /> },
  {
    label: "Tài liệu",
    href: "/dashboard/documents",
    icon: <DescriptionIcon />,
  },
  { label: "Danh mục", href: "/dashboard/categories", icon: <CategoryIcon /> },
  { label: "Bài viết", href: "/dashboard/articles", icon: <ArticleIcon /> },
];

export default function DashboardSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, sidebarOpen, setSidebarOpen, logout, setUser, accessToken } =
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
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: "primary.main",
            fontSize: "1.1rem",
            fontWeight: 700,
          }}
          aria-label="Logo công ty"
        >
          TT
        </Avatar>
        <Typography
          variant="body2"
          fontWeight={700}
          color="primary"
          textAlign="center"
          lineHeight={1.4}
          px={1.5}
        >
          CÔNG TY TNHH CẤP NƯỚC TÓC TIÊN
        </Typography>
      </Box>
      <List sx={{ flex: 1 }}>
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={active}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "& .MuiListItemIcon-root": { color: "white" },
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
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
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              fontSize: 14,
            }}
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
      {/* AppBar */}
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
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  fontSize: 14,
                }}
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

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
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

      {/* Main content */}
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
