"use client";

import { useParams } from "next/navigation";
import ReceivableFormComponent from "../_component/receivable-form-component";

export default function NewReceivableTypePage() {
  const params = useParams();

  return (
    <ReceivableFormComponent
      editMode={params?.id === "new" ? "new" : "detail"}
    />
  );
}
