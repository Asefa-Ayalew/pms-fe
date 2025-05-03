"use client";

import countryJson from "../../../constants/country-json.json";
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
import { notifications } from "@mantine/notifications";
import { IconView360 } from "@tabler/icons-react";
import { useLazyGetExpenseTypesQuery } from "../../expense-types/_store/expense-type.query";
import { useLazyGetPropertiesQuery } from "../../property/_store/property.query";
import { useLazyGetRoomsQuery } from "../../property/_store/room.query";
import {
  useArchiveExpenseMutation,
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useLazyGetExpenseQuery,
  useRestoreExpenseMutation,
  useUpdateExpenseMutation,
} from "../_store/expense.query";
import { CollectionQuery } from "@pms/entity";
import { getCurrentSession } from "@pms/auth";
import { Expense } from "../../../models/expense.model";
import { expenseDefaultValue, ExpenseFormSchema, ExpenseSchema } from "../../../schemas/expense-schema";

interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}

const countryCodes = countryJson
  .map((country) => ({
    value: country.dial_code,
    label: `${country.name} (${country.dial_code})`,
  }))
  .filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.value === value.value)
  );

export default function ExpenseFormComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense>();
  const [countryCode, setCountryCode] = useState<string>("+251");

  const [getExpense, expense] = useLazyGetExpenseQuery();
  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getExpenseTypes, { data: expectTypes }] =
    useLazyGetExpenseTypesQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();
  const [archiveExpense, archiveResponse] = useArchiveExpenseMutation();
  const [restoreExpense, restoreResponse] = useRestoreExpenseMutation();
  const [deleteExpense, deleteResponse] = useDeleteExpenseMutation();
  const [user, setUser] = useState<any>(undefined);
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
  } = useForm<ExpenseFormSchema>({
    resolver: zodResolver(ExpenseSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<Expense> = async (data) => {
    console.log(data, "data");
    if (editMode === "new") {
      try {
        const response = await createExpense({
          ...data,
          userId: user?.id,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Expense created successfully",
            color: "green",
          });
          navigate.push(`/expense/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Expense Not created successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updateExpense({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Expense Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Expense not updated successfully",
          color: "red",
        });
      }
    }
  };

  function handleDelete() {
    selectedExpense?.archivedAt
      ? restoreExpense({ id: `${selectedExpense?.id}` }).then(
          (response: any) => {
            if (response?.data) {
              setOpenDeleteModal(false);
            }
          }
        )
      : deleteExpense(`${selectedExpense?.id}`)
          .then((response: any) => {
            if (response?.data) {
              setOpenDeleteModal(false);
            }
          })
          .finally(() => {
            setOpenDeleteModal(false);
            navigate.push(`/expense`);
          });
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

    useEffect(() => {
      const fetchSession = async () => {
        const session = await getCurrentSession() || {};
        setUser(session);
      };
  
      fetchSession();
    }, []);

  useEffect(() => {
    getProperties(collection);
  }, [collection, getProperties]);

  useEffect(() => {
    getExpenseTypes(collection);
  }, [getExpenseTypes, collection]);

  useEffect(() => {
    if (editMode === "detail") {
      getExpense({
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
        ...expenseDefaultValue,
      });
    }
  }, [params?.id, editMode]);
  console.log("expenseTypes", expectTypes);

  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <div className="flex">
        <h3 className="font-semibold">
          {editMode === "new" ? "New Expense" : ""}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={expense?.isLoading || expense?.isFetching}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Box className="w-full flex-col space-y-2">
          <Box className="px-4">
            <Button
              leftSection={<IconView360 size={12} />}
              variant="filled"
              radius={"xl"}
              className="w-max ml-auto  flex items-center gap-0.5 bg-primary-500 text-white"
              onClick={() => {
                navigate.push(`detail/${expense?.data?.id}`);
              }}
            >
              View
            </Button>
          </Box>
          <form
            name="Expense form"
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
                        setValue("roomId", String(expense.data?.roomId));
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
                <Controller
                  name="expenseTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      withCheckIcon={false}
                      label="Expense Type"
                      placeholder="Select Expense Type"
                      value={watch("expenseTypeId")}
                      data={
                        expectTypes?.data?.map((p) => ({
                          label: p.description || "",
                          value: p.id || "",
                        })) || []
                      }
                      className="w-1/2"
                      withAsterisk
                      searchable
                      error={errors?.expenseTypeId?.message}
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
                      classNames={{
                        input:
                          "border border-gray-300 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xs p-3 text-base",
                        label: "text-gray-700 dark:text-gray-300 font-medium",
                      }}
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
                    />
                  )}
                />
              </Flex>
              <Flex justify="flex-end" gap={8}>
                <Button
                  variant="default"
                  onClick={() => reset(expenseDefaultValue)}
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
        title={"Delete Expense"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">
            {selectedExpense?.finalAmount}{" "}
          </span>
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
              selectedExpense?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedExpense?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
