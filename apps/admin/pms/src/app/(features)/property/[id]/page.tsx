"use client";

import { Tabs } from "@mantine/core";
import { useParams } from "next/navigation";
import PropertyFormComponent from "../_component/property-form-component";
import RoomsComponent from "../_component/rooms-component";

export default function NewPropertyTypePage() {
  const params = useParams();
  return (
    <Tabs defaultValue="detail" className="w-full">
      <Tabs.List className="gap-8 my-2">
        <Tabs.Tab value="detail">Detail</Tabs.Tab>
        <Tabs.Tab value="rooms">Rooms</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="detail">
        <PropertyFormComponent
          editMode={params?.id === "new" ? "new" : "detail"}
        />
      </Tabs.Panel>

      <Tabs.Panel value="rooms">
        <RoomsComponent editMode="edit" />
      </Tabs.Panel>
    </Tabs>
  );
}
