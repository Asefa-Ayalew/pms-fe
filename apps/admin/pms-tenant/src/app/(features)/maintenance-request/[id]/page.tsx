"use client";

import { useParams } from "next/navigation";
import MaintenanceRequestFormComponent from "../_component/maintenance-request-form-component";

export default function NewMaintenanceRequestTypePage() {
  const params = useParams();

  return (
    <MaintenanceRequestFormComponent
      editMode={params?.id === "new" ? "new" : "detail"}
    />
  );
}
