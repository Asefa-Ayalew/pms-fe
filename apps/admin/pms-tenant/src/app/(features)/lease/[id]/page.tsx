"use client";

import { Tabs } from "@mantine/core";
import { useParams } from "next/navigation";
import LeaseDocumentComponent from "../_component/lease/lease-document.component";
import LeaseFormComponent from "../_component/lease/lease-form-component";

export default function NewLeaseTypePage() {
  const params = useParams();

  return (
    <Tabs defaultValue="detail" className="w-full">
      <Tabs.List className="gap-8 my-2">
        <Tabs.Tab value="detail">Detail</Tabs.Tab>
        <Tabs.Tab value="document">Documents</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="detail">
        <LeaseFormComponent
          editMode={params?.id === "new" ? "new" : "detail"}
        />
      </Tabs.Panel>

      <Tabs.Panel value="document">
        <LeaseDocumentComponent mode="edit" />
      </Tabs.Panel>
    </Tabs>
  );
}
