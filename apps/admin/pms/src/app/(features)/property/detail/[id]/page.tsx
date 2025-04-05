"use client";
import { Tabs } from "@mantine/core";
import PropertyTypeDetailComponent from "../../_component/property-detail-component";
import RoomsComponent from "../../_component/rooms-component";

export default function PropertyDetailPage() {
  return (
    <Tabs defaultValue="detail" className="w-full">
      <Tabs.List className="gap-8 my-2">
        <Tabs.Tab value="detail">Detail</Tabs.Tab>
        <Tabs.Tab value="rooms">Rooms</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="detail">
        <PropertyTypeDetailComponent />
      </Tabs.Panel>

      <Tabs.Panel value="rooms">
        <RoomsComponent editMode={"view"} />
      </Tabs.Panel>
    </Tabs>
  );
}
