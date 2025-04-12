"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Select, Textarea, TextInput } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import { useLazyGetPropertiesQuery } from "../../property/_store/property.query";
import { useLazyGetRoomsQuery } from "../../property/_store/room.query";
import {
  useArchiveMaintenanceRequestMutation,
  useCreateMaintenanceRequestMutation,
  useDeleteMaintenanceRequestMutation,
  useLazyGetMaintenanceRequestQuery,
  useRestoreMaintenanceRequestMutation,
  useUpdateMaintenanceRequestMutation,
} from "../_store/maintenance-request.query";
import { MaintenanceRequest } from "@/app/models/maintenance-request.model";
import { CollectionQuery } from "@pms/entity";
import { MaintenanceRequestDefaultValues, MaintenanceRequestFormSchema, MaintenanceRequestSchema } from "@/app/schemas/maintenance-request-schema";
import { notifications } from "@mantine/notifications";
interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}

export default function MaintenanceRequestFormComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();

  const [getMaintenanceRequest, { data: maintenanceRequest, isLoading }] =
    useLazyGetMaintenanceRequestQuery();
  const [createMaintenanceRequest, { isLoading: creating }] =
    useCreateMaintenanceRequestMutation();
  const [updateMaintenanceRequest, { isLoading: updating }] =
    useUpdateMaintenanceRequestMutation();
  const [archiveMaintenanceRequest, { isLoading: archiving }] =
    useArchiveMaintenanceRequestMutation();
  const [restoreMaintenanceRequest, { isLoading: restoring }] =
    useRestoreMaintenanceRequestMutation();
  const [deleteMaintenanceRequest, { isLoading: deleting }] =
    useDeleteMaintenanceRequestMutation();

  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [tenantId, setTenantId] = useState<string | undefined>("");

  const collection: CollectionQuery = useMemo(
    () => ({
      skip: 0,
      top: 20,
      orderBy: [{ field: "createdAt", direction: "desc" }],
    }),
    []
  );

  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<MaintenanceRequestFormSchema>({
    resolver: zodResolver(MaintenanceRequestSchema),
    mode: "all",
  });

  useEffect(() => {
    if (editMode === "detail") {
      getMaintenanceRequest({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response?.data,
          });
        }
      });
    } else {
      reset({
        ...MaintenanceRequestDefaultValues,
      });
    }
  }, [params?.id, editMode]);

  useEffect(() => {
    getProperties({ id: `${params?.id}` });
    if (params.id) {
      getRooms({
        ...collection,
        filter: [[{ field: "propertyId", value: params.id, operator: "=" }]],
      });
    }
  }, [params.id, collection]);
  const onSubmit: SubmitHandler<MaintenanceRequest> = async (data) => {
    if (editMode === "new") {
      try {
        const response = await createMaintenanceRequest({
          ...data,
          tenantId: tenantId,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Maintenance requested successfully",
            color: "green",
          });
          navigate.push(`/maintenance-request/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Maintenance not requested successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updateMaintenanceRequest({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Maintenance Request Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Maintenance Request not updated successfully",
          color: "red",
        });
      }
    }
  };
  return (
    <Box className="w-full p-4 flex-col space-y-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="w-full"
      >
        <Flex direction="column" gap={16}>
          <Flex gap={8}>
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Property"
                  placeholder="Select Property"
                  data={
                    properties?.data?.map((p) => ({
                      label: p.description || "",
                      value: p.id || "",
                    })) || []
                  }
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.propertyId?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue("roomId", String(maintenanceRequest?.roomId));
                    if (value) {
                      getRooms({
                        ...collection,
                        filter: [
                          [{ field: "propertyId", value, operator: "=" }],
                        ],
                      });
                    }
                  }}
                />
              )}
            />
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Room"
                  placeholder="Select Room"
                  value={watch("roomId")}
                  data={
                    rooms?.data?.map((p) => ({
                      label: p.description || "",
                      value: p.id || "",
                    })) || []
                  }
                  onChange={(value) => {
                    field.onChange(value);
                    if (value) {
                      const selectedRoom = rooms?.data?.find(
                        (room) => room.id === value
                      );
                      setTenantId(selectedRoom?.tenantId);
                    }
                  }}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  disabled={!watch("propertyId")}
                  error={errors?.roomId?.message}
                />
              )}
            />
          </Flex>
          <Flex gap={8}>
            <TextInput
              label="Title"
              className="w-1/2"
              required
              placeholder="Title"
              {...register("title")}
              error={errors?.title?.message}
            />
            <Textarea
              label="Description"
              className="w-1/2"
              required
              minRows={8}
              placeholder="Description"
              {...register("description")}
              error={errors?.description?.message}
            />
          </Flex>
          <Flex justify="flex-end" gap={8}>
            <Button
              variant="default"
              onClick={() => reset(MaintenanceRequestDefaultValues)}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="filled"
              bg="primary.4"
              loading={editMode === "new" ? creating : updating}
              leftSection={<IconDeviceFloppy />}
            >
              {editMode === "new" ? "Save" : "Update"}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
