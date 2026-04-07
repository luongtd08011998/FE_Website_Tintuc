"use client";

import { companyService } from "@/services/company";
import CompanyForm from "@/components/ui-antd/CompanyForm";
import type { CreateCompanyRequest } from "@/types";

export default function CreateCompanyPage() {
  const handleSubmit = async (data: CreateCompanyRequest) => {
    await companyService.create(data);
  };

  return <CompanyForm mode="create" onSubmit={handleSubmit} />;
}
