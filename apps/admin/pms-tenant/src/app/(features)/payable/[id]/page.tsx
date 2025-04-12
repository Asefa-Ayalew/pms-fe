"use client";

import { useParams } from "next/navigation";
import PayableFormComponent from "../_component/payable-form-component";

export default function NewPayableTypePage() {
  const params = useParams();

  return (
    <PayableFormComponent editMode={params?.id === "new" ? "new" : "detail"} />
  );
}
