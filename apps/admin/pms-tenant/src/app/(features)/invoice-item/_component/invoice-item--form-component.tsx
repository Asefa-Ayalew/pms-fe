"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  LoadingOverlay,
  Modal,
  NumberInput,
  Select,
  Switch,
  TextInput,
} from "@mantine/core";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
// import { useLazyGetRolesQuery } from "../../role/_store/role.query";
import {
  InvoiceItemDefaultValue,
  InvoiceItemFormSchema,
  InvoiceItemSchema,
} from "../../../schemas/invoice-item-schema";
import { notifications } from "@mantine/notifications";
import { IconView360 } from "@tabler/icons-react";
import { useLazyGetPropertiesQuery } from "../../property/_store/property.query";
import { useLazyGetRoomsQuery } from "../../property/_store/room.query";
import { useLazyGetRevenueTypesQuery } from "../../revenue-types/_store/revenue-type.query";
import {
  useArchiveInvoiceItemMutation,
  useCreateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useLazyGetInvoiceItemQuery,
  useRestoreInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
} from "../_store/invoice-item.query";
import { CollectionQuery } from "@pms/entity";
import { InvoiceItem } from "../../../models/invoice-item.model";

interface Props {
  editMode: "new" | "detail";
}

export default function InvoiceItemFormComponent(props: Props) {
  const { editMode } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [
    getInvoiceItem,
    {
      data: invoiceItem,
      isLoading: invoiceItemLoading,
      isFetching: invoiceItemFetching,
    },
  ] = useLazyGetInvoiceItemQuery();
  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getRevenueTypes, { data: revenueTypes }] =
    useLazyGetRevenueTypesQuery();
  const [createInvoiceItem, { isLoading: creating }] =
    useCreateInvoiceItemMutation();
  const [updateInvoiceItem, { isLoading: updating }] =
    useUpdateInvoiceItemMutation();
  const [archiveInvoiceItem, archiveResponse] = useArchiveInvoiceItemMutation();
  const [restoreInvoiceItem, restoreResponse] = useRestoreInvoiceItemMutation();
  const [deleteInvoiceItem, deleteResponse] = useDeleteInvoiceItemMutation();

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
  } = useForm<InvoiceItemFormSchema>({
    resolver: zodResolver(InvoiceItemSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<InvoiceItem> = async (data) => {
    if (editMode === "new") {
      try {
        const response = await createInvoiceItem({
          ...data,
          // userId: currentUser?.id,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Invoice Item created successfully",
            color: "green",
          });
          navigate.push(`/invoice-item/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Invoice Item Not created successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updateInvoiceItem({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Invoice Item Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Invoice Item not updated successfully",
          color: "red",
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const id = params.id ?? ''
      const response = await deleteInvoiceItem(id.toString()).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Invoice Item Deleted successfully",
          color: "green",
        });
        navigate.push("/invoice items");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Not deleted successfully",
        color: "red",
      });
    }
  };

  const onError = (error: any) => {};

  useEffect(() => {
    if (editMode === "detail") {
      getInvoiceItem({
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
        ...InvoiceItemDefaultValue,
      });
    }
  }, [params?.id, editMode]);
  useEffect(() => {
    getProperties(collection);
  }, [collection, getProperties]);

  useEffect(() => {
    getRevenueTypes(collection);
  }, [getRevenueTypes, collection]);
  const commonClassNames = {
    input:
      "border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-300 rounded-md px-4 py-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 transition-all duration-200 ease-in-out",
    label: "text-gray-900 dark:text-gray-300 font-semibold text-sm",
    error: "text-red-500 text-xs mt-1",
  };

  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <h3 className="font-semibold">
        {editMode === "new" ? "New Invoice Item" : ""}
      </h3>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={invoiceItemLoading || invoiceItemFetching}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Box className="w-full flex-col space-y-2">
          <Box className="px-4">
            <Button
              leftSection={<IconView360 size={12} />}
              variant="filled"
              radius={"xl"}
              className="w-max ml-auto flex items-center gap-0.5 bg-primary-500 text-white"
              onClick={() => {
                navigate.push(`detail/${invoiceItem?.id ?? ""}`);
              }}
            >
              View
            </Button>
          </Box>
          <form
            name="InvoiceItem form"
            onSubmit={handleSubmit(onSubmit, onError)}
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
                        setValue("roomId", String(invoiceItem?.roomId));
                        if (value) {
                          getRooms({
                            ...collection,
                            filter: [
                              [{ field: "propertyId", value, operator: "=" }],
                            ],
                          });
                        }
                      }}
                      // classNames={commonClassNames}
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
                      value={watch("propertyId")}
                      data={
                        rooms?.data?.map((p) => ({
                          label: p.description || "",
                          value: p.id || "",
                        })) || []
                      }
                      className="w-1/2"
                      withAsterisk
                      searchable
                      disabled={!watch("propertyId")}
                      error={errors?.roomId?.message}
                      // classNames={commonClassNames}
                    />
                  )}
                />
              </Flex>
              <Flex gap={8}>
                <Controller
                  name="revenueTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      withCheckIcon={false}
                      label="Expense Type"
                      placeholder="Select Expense Type"
                      value={watch("revenueTypeId")}
                      data={
                        revenueTypes?.data?.map((p) => ({
                          label: p.description || "",
                          value: p.id || "",
                        })) || []
                      }
                      className="w-1/2"
                      withAsterisk
                      searchable
                      error={errors?.revenueTypeId?.message}
                      // classNames={commonClassNames}
                    />
                  )}
                />
                <Controller
                  name="unitPrice"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Unit Price"
                      placeholder="Enter Unit Price"
                      error={errors?.unitPrice?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
              </Flex>
              <Flex gap={8}>
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Total Amount"
                      placeholder="Enter Total Amount"
                      error={errors?.totalAmount?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
                <Controller
                  name="finalAmount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Final Amount"
                      placeholder="Enter Final Amount"
                      error={errors?.finalAmount?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
              </Flex>
              <Flex gap={8}>
                <Controller
                  name="totalDiscount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Total Discount"
                      placeholder="Enter Total Discount"
                      error={errors?.totalDiscount?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
                <Controller
                  name="discountPercent"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Discount Percent"
                      placeholder="Enter Discount Percent"
                      error={errors?.discountPercent?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
              </Flex>
              <Flex gap={8}>
                <Controller
                  name="numUnits"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      className="w-1/2"
                      label="Number of Units"
                      placeholder="Enter Number of Units"
                      error={errors?.numUnits?.message}
                      withAsterisk
                      // classNames={commonClassNames}
                    />
                  )}
                />
                <TextInput
                  label="Charge Code"
                  className="w-1/2"
                  required
                  placeholder="charge code"
                  {...register("chargeCode")}
                  error={errors?.chargeCode?.message}
                  // classNames={commonClassNames}
                />
              </Flex>
              <Flex>
                {/* <CustomRichTextEditor /> */}
                <Controller
                  name="taxable"
                  control={control}
                  render={({ field: { name, value } }) => (
                    <Switch
                      name={name}
                      label="Taxable"
                      checked={value}
                      onChange={(event) =>
                        setValue("taxable", event.currentTarget.checked)
                      }
                      // classNames={commonClassNames}
                    />
                  )}
                />
              </Flex>
              <Flex justify="flex-end" gap={8}>
                <Button
                  variant="default"
                  onClick={() => reset(InvoiceItemDefaultValue)}
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
      </div>
      <Modal
        opened={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        size={"40%"}
        title={"Delete InvoiceItem"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{invoiceItem?.chargeCode} </span>
        </h2>
        <div className="flex my-4">
          <Button
            variant="default"
            className="bg-none mx-2"
            onClick={() => {
              setOpenDeleteModal(false);
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="filled"
            color="red"
            className={`bg-red-500 text-white shadow-none rounded flex items-center  mx-2`}
            onClick={() => {
              handleDelete();
            }}
            loading={archiveResponse?.isLoading || deleteResponse?.isLoading}
            leftSection={
              invoiceItem?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {invoiceItem?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
