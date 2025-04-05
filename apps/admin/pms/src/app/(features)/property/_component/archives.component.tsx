"use client";

import {
  Box,
  Button,
  Card,
  ComboboxItem,
  Divider,
  Flex,
  Group,
  Pagination,
  Popover,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconDotsVertical,
  IconMoodEmpty,
  IconRestore,
  IconTrash,
} from "@tabler/icons-react";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDeleteLeaseMutation,
  useLazyGetArchivedLeasesQuery,
  useRestoreLeaseMutation,
} from "../_store/lease.query";
import {
  useDeletePropertyMutation,
  useLazyGetArchivedPropertiesQuery,
  useRestorePropertyMutation,
} from "../_store/property.query";
import {
  useDeleteRoomMutation,
  useLazyGetArchivedRoomsQuery,
  useRestoreRoomMutation,
} from "../_store/room.query";
import { CollectionQuery, PaginationOptions } from "@pms/entity";

export default function ArchivesComponent() {
  const searchParams = useSearchParams();
  const [modals, setModals] = useState({ restore: false });
  const [type, setType] = useState<"property" | "room" | "lease">("property");
  const [popoverOpened, setPopoverOpened] = useState<string | undefined>(
    undefined
  );
  const [selectedItem, setSelectedItem] = useState<any>({});
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [
    getArchivedProperties,
    { data: archivedProperties, isLoading: archivedPropertiesLoading },
  ] = useLazyGetArchivedPropertiesQuery();

  const [
    getArchivedRooms,
    { data: archivedRooms, isLoading: archivedRoomsLoading },
  ] = useLazyGetArchivedRoomsQuery();

  const [
    getArchivedLeases,
    { data: archivedLeases, isLoading: archivedLeasesLoading },
  ] = useLazyGetArchivedLeasesQuery();

  const [deleteProperty, { isLoading: deletingProperty }] =
    useDeletePropertyMutation();
  const [deleteRoom, { isLoading: deletingRoom }] = useDeleteRoomMutation();
  const [deleteLease, { isLoading: deletingLease }] = useDeleteLeaseMutation();
  const [restoreProperty, { isLoading: restoringProperty }] =
    useRestorePropertyMutation();
  const [restoreRoom, { isLoading: restoringRoom }] = useRestoreRoomMutation();
  const [restoreLease, { isLoading: restoringLease }] =
    useRestoreLeaseMutation();

  const [collection, setCollection] = useState<CollectionQuery>({
    skip: 0,
    top: 20,
    orderBy: [{ field: "createdAt", direction: "desc" }],
    search: "",
  });
  const onSearch = (data: string) => {
    setCollection((prev) => ({
      ...prev,
      search: data || "",
    }));
  };
  useEffect(() => {
    if (type === "property") getArchivedProperties(collection);
    if (type === "room") getArchivedRooms(collection);
    if (type === "lease") getArchivedLeases(collection);
  }, [
    type,
    getArchivedProperties,
    getArchivedRooms,
    getArchivedLeases,
    collection,
  ]);

  const columnConfig: Record<
    "property" | "room" | "lease",
    { key: string; label: string }[]
  > = {
    property: [
      { key: "description", label: "Description" },
      { key: "numberOfRooms", label: "Rooms" },
      { key: "size", label: "Size (sqm)" },
      { key: "isFurnished", label: "Furnished" },
    ],
    room: [
      { key: "roomNumber", label: "Room Number" },
      { key: "floorNumber", label: "Floor" },
      { key: "size", label: "Size (sqm)" },
      { key: "type", label: "Type" },
    ],
    lease: [
      { key: "monthlyRent", label: "Monthly Rent" },
      { key: "startDate", label: "Start Date" },
      { key: "endDate", label: "End Date" },
      { key: "lastPaidAmount", label: "Last Paid" },
    ],
  };

  const columns = columnConfig[type];

  const onRestore = async (id: string) => {
    try {
      (await type) === "property"
        ? restoreProperty(id.toString()).unwrap()
        : type === "room"
          ? restoreRoom(id.toString()).unwrap()
          : restoreLease(id.toString()).unwrap();
      notifications.show({
        title: "Success",
        message: "Successfully Restored",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Not Successfully Restored",
        color: "red",
      });
    }
  };

  const onDelete = async (id: string) => {
    try {
      (await type) === "property"
        ? deleteProperty(id).unwrap()
        : type === "room"
          ? deleteRoom(id).unwrap()
          : deleteLease(id).unwrap();
      notifications.show({
        title: "Success",
        message: "Successfully Deleted",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Not Successfully Deleted",
        color: "red",
      });
    }
  };
  const openModal = (type: keyof typeof modals, item?: any) => {
    selectedItem(item);
    setModals((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const data =
    type === "property"
      ? archivedProperties
      : type === "room"
        ? archivedRooms
        : archivedLeases;

  const onPaginationChange = (skip: number, top: number) => {
    const after = (skip - 1) * top;
    setCollection({ ...collection, skip: after, top: top });
  };

  return (
    <Card shadow="sm" padding="sm">
      <Select
        className="w-1/3 mb-3"
        label="Select Archives"
        placeholder="Choose Archives"
        data={[
          { value: "property", label: "Property" },
          { value: "room", label: "Room" },
          { value: "lease", label: "Lease" },
        ]}
        value={type}
        onChange={(val) => setType(val as "property" | "room" | "lease")}
      />
      <Divider />
      <Text fw={500} className="my-3">
        Archived {type.charAt(0).toUpperCase() + type.slice(1)}
      </Text>
      <Box className="mt-4 ">
        <div className="flex justify-end mr-2">
          <TextInput
            placeholder="Search here"
            className="w-1/3"
            onKeyUp={debounce((event: any) => {
              onSearch?.(event.target.value);
            }, 1000)}
          />
        </div>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              {columns.map(({ key, label }) => (
                <Table.Th key={key}>{label}</Table.Th>
              ))}
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {archivedPropertiesLoading ||
            archivedRoomsLoading ||
            archivedLeasesLoading ? (
              <Table.Tr>
                <Table.Td colSpan={4} className="text-center">
                  <Text c="gray" size="sm">
                    Loading leases...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : Array.isArray(data?.data) && data?.data.length > 0 ? (
              data?.data?.map((item: any, index: number) => {
                const type = item.propertyId
                  ? "property"
                  : item.roomId
                    ? "room"
                    : "lease";
                return (
                  <Table.Tr key={index}>
                    {columns.map(({ key }) => (
                      <Table.Td key={key}>
                        {key.includes("Date")
                          ? new Date(item[key]).toLocaleDateString()
                          : (item[key] ?? "-")}
                      </Table.Td>
                    ))}
                    <Table.Td className="w-20">
                      <Popover
                        width={142}
                        position="bottom-end"
                        withArrow
                        shadow="md"
                        opened={popoverOpened === item?.id}
                        onChange={(opened) =>
                          setPopoverOpened(opened ? item?.id : undefined)
                        }
                      >
                        <Popover.Target>
                          <Button variant="subtle" size="xs" px={6}>
                            <IconDotsVertical
                              size={16}
                              onClick={() =>
                                setPopoverOpened(
                                  popoverOpened === item?.id
                                    ? undefined
                                    : item?.id
                                )
                              }
                            />
                          </Button>
                        </Popover.Target>
                        <Popover.Dropdown className="p-2 rounded-sm">
                          <Stack gap={8}>
                            <Button
                              variant="subtle"
                              color="primary"
                              radius="xs"
                              loading={
                                type === "property"
                                  ? restoringProperty
                                  : type === "room"
                                    ? restoringRoom
                                    : restoringLease
                              }
                              onClick={() => onRestore(item?.id)}
                              leftSection={<IconRestore size={16} />}
                            >
                              Restore
                            </Button>
                            <Button
                              variant="subtle"
                              radius="xs"
                              color="red"
                              leftSection={<IconTrash size={16} color="red" />}
                              loading={
                                type === "property"
                                  ? deletingProperty
                                  : type === "room"
                                    ? deletingRoom
                                    : deletingLease
                              }
                              onClick={() => onDelete(String(item.id))}
                            >
                              <Text size="sm" className="text-red-600">
                                Delete
                              </Text>
                            </Button>
                          </Stack>
                        </Popover.Dropdown>
                      </Popover>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4} className="text-center">
                  <Box className="flex flex-col items-center py-6">
                    <IconMoodEmpty size={48} color="gray" />
                    <Text c="gray" size="sm" mt="sm">
                      No {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                      available
                    </Text>
                    <Button variant="light" mt="md">
                      Refresh List
                    </Button>
                  </Box>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
        {Array.isArray(data?.data) && data?.data.length > 0 && (
          <Flex m={"lg"} justify={"space-between"}>
            {
              <Group>
                <Select
                  size="xs"
                  defaultValue={"10"}
                  value={pageSize.toString()}
                  data={PaginationOptions}
                  onChange={(value: string | null, option: ComboboxItem) => {
                    const newSize = parseInt(value ?? "10");
                    setPageSize(newSize);
                    setPageIndex(1); // Reset to first page when changing page size
                    onPaginationChange(1, newSize);
                  }}
                />
              </Group>
            }
            <Pagination
              size={"xs"}
              total={Math.ceil(data.count / pageSize)}
              value={pageIndex}
              onChange={(value: number) => {
                setPageIndex(value);
                onPaginationChange(value, pageSize);
              }}
            />
          </Flex>
        )}
      </Box>
    </Card>
  );
}
