"use client";
import { Tabs } from "@mantine/core";
import LeaseDetailComponent from "../../_component/lease/lease-detail-component";
import LeaseDocumentsComponent from "../../_component/lease/lease-document.component";

export default function LeaseDetailPage() {
  return (
    <Tabs defaultValue="detail" className="w-full">
      <Tabs.List className="gap-8 my-2">
        <Tabs.Tab value="detail">Detail</Tabs.Tab>
        <Tabs.Tab value="document">Documents</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="detail">
        <LeaseDetailComponent />
      </Tabs.Panel>
      <Tabs.Panel value="document">
        <LeaseDocumentsComponent mode={"view"} />
      </Tabs.Panel>
    </Tabs>
  );
}
