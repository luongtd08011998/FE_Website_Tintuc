"use client";

import { use } from "react";
import { Box, CircularProgress } from "@mui/material";
import useSWR from "swr";
import { companyService } from "@/services/company";
import CompanyForm from "@/components/ui-antd/CompanyForm";
import type { UpdateCompanyRequest } from "@/types";

export default function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading } = useSWR(["company", id], () =>
    companyService.getById(Number(id)),
  );

  const handleSubmit = async (body: UpdateCompanyRequest) => {
    await companyService.update(body);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data?.data.data) return null;

  return (
    <CompanyForm
      mode="edit"
      defaultValues={data.data.data}
      onSubmit={handleSubmit}
    />
  );
}
