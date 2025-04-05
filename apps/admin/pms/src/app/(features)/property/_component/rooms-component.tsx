"use client";
import { CollectionQuery, Order, EntityConfig, EntityList } from "@pms/entity";
import { Card, Divider, Modal } from "@mantine/core";
import { useParams } from "next/navigation";
import { JSX, useEffect, useState } from "react";
import { useLazyGetRoomsQuery } from "../_store/room.query";
import ReasonForm from "./reason-form-component";
import RoomForm from "./room-form-component";
import { Room } from "@/app/models/room.model";

export default function RoomsComponent(props: { editMode: "view" | "edit" }) {
  const [modals, setModals] = useState({
    new: false,
    edit: false,
    view: false,
    archive: false,
  });

  const defaultRoomValue: Room = {
    id: "",
    description: "",
    floorNumber: "",
    roomNumber: "",
    type: "",
    size: 1,
    amenities: [],
  };
  const params = useParams();
  const [selectedRoom, setSelectedRoom] = useState<Room>(defaultRoomValue);

  const [getRooms, { data: rooms, isLoading }] = useLazyGetRoomsQuery();

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    filter: [[{ field: "propertyId", value: params.id, operator: "=" }]],
    orderBy: [{ field: "createdAt", direction: "desc" }],
  });

  const config: EntityConfig<Room> = {
    primaryColumn: {
      key: "Description",
      name: "Description",
      render: (data: Room) => `${data?.description ?? ""}`,
    },
    rootUrl: "/room",
    identity: "id",
    showDetail: false,
    visibleColumn: [
      { name: "Description", key: "description" },
      { name: "Floor Number", key: "floorNumber" },
      { name: "Room Number", key: "roomNumber" },
      { name: "Size", key: "size" },
      { name: "Type", key: "type" },
      { name: "Registration Date", key: "createdAt", isDate: true },
    ],
    filter: [
      [
        {
          name: "With Archived",
          field: "withArchived",
          value: true,
        },
      ],
    ],
    newAction: () => openModal("new"),
    actions:
      props.editMode === "view"
        ? [
            {
              label: "Show More",
              icon: "IconEye",
              key: "showMore",
              type: "primary",
            },
          ]
        : [
            {
              label: "Show More",
              icon: "IconEye",
              key: "showMore",
              type: "primary",
            },
            {
              label: "Edit",
              icon: "IconEdit",
              key: "edit",
              type: "primary",
              divider: true,
            },
            {
              label: "Delete",
              icon: "IconTrash",
              key: "delete",
              type: "danger",
            },
          ],
  };

  useEffect(() => {
    getRooms(collection);
  }, [collection, getRooms]);

  const openModal = (type: keyof typeof modals, room?: Room) => {
    setSelectedRoom(room ?? defaultRoomValue);
    setModals((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const closeModal = (type: string) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    setSelectedRoom(defaultRoomValue);
  };

  const handleAction = (action: { key: string }, data?: Room) => {
    switch (action.key) {
      case "showMore":
        openModal("view", data);
        break;
      case "edit":
        openModal("edit", data);
        break;
      case "delete":
        openModal("archive", data);
        break;
      default:
        console.warn("Unknown action:", action);
    }
  };
  const handleNewModal = () => {
    openModal("new");
  };
  const renderModal = (
    type: keyof typeof modals,
    title: string,
    size: string,
    content: JSX.Element
  ) => (
    <Modal
      opened={modals[type]}
      onClose={() => closeModal(type)}
      title={title}
      centered
      size={size}
    >
      <Divider />
      {content}
    </Modal>
  );

  return (
    <Card shadow="sm" padding="sm">
      <EntityList
        viewMode="list"
        parentStyle="w-full"
        showArchived={false}
        showSelector={true}
        tableKey="rooms"
        title="Rooms"
        newButtonText="New"
        total={rooms?.count}
        collectionQuery={collection}
        itemsLoading={isLoading}
        config={config}
        items={rooms?.data}
        showNewButton={false}
        showNewModal={props.editMode === "edit"}
        initialPage={1}
        defaultPageSize={collection.top}
        pageSize={[20, 30, 50, 100]}
        onPaginationChange={(skip: number, top: number) => {
          const after = (skip - 1) * top;
          setCollection({ ...collection, skip: after, top: top });
        }}
        onSearch={(data: any) => {
          setCollection({
            ...collection,
            search: data || "",
            searchFrom: data ? ["name"] : [],
          });
        }}
        onFilterChange={(data: any) => {
          if (data.length > 0) {
            setCollection({ ...collection, withArchived: true });
          } else {
            setCollection({ ...collection, withArchived: false });
          }
        }}
        onOrder={(data: Order) =>
          setCollection({ ...collection, orderBy: [data] })
        }
        handleAction={handleAction}
        handleNewModal={handleNewModal}
      />

      {renderModal(
        "new",
        "Create Room",
        "60%",
        <RoomForm editMode="new" onClose={() => closeModal("new")} />
      )}
      {renderModal(
        "edit",
        "Edit Room",
        "60%",
        <RoomForm
          editMode="detail"
          onClose={() => closeModal("edit")}
          data={selectedRoom}
        />
      )}
      {renderModal(
        "view",
        "View Room",
        "60%",
        <RoomForm
          editMode="view"
          onClose={() => closeModal("view")}
          data={selectedRoom}
        />
      )}
      {renderModal(
        "archive",
        "Reason",
        "50%",
        <ReasonForm
          id={selectedRoom?.id ?? ""}
          onClose={() => closeModal("archive")}
        />
      )}
    </Card>
  );
}
