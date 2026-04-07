"use client";

import { userService } from "@/services/user";
import UserForm from "@/components/ui-antd/UserForm";
import type { CreateUserRequest } from "@/types";

export default function CreateUserPage() {
  const handleSubmit = async (data: CreateUserRequest) => {
    await userService.create(data);
  };

  return <UserForm mode="create" onSubmit={handleSubmit} />;
}
