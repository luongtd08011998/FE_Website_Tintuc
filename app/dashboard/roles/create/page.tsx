"use client";

import { roleService } from "@/services/role";
import RoleForm from "@/components/ui-antd/RoleForm";
import type { CreateRoleRequest } from "@/types";

export default function CreateRolePage() {
  const handleSubmit = async (data: CreateRoleRequest) => {
    await roleService.create(data);
  };

  return <RoleForm mode="create" onSubmit={handleSubmit} />;
}
