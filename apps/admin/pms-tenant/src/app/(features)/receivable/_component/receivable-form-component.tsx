"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Select,
  Textarea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetBankAccountsQuery } from "../../bank-accounts/_store/bank-account.query";
import { useLazyGetPropertiesQuery } from "../../property/_store/property.query";
import {
  useLazyGetRoomQuery,
  useLazyGetRoomsQuery,
} from "../../property/_store/room.query";
import { useLazyGetUsersQuery } from "../../user/_store/user.query";
import {
  useArchiveReceivableMutation,
  useCreateReceivableMutation,
  useDeleteReceivableMutation,
  useLazyGetReceivableQuery,
  useUpdateReceivableMutation,
} from "../_store/receivable.query";
import ReasonForm from "./reason-form-component";
import { BankAccount } from "@/app/models/bank-account.model";
import { CollectionQuery } from "@pms/entity";
import { receivableDefaultValues, ReceivableFormSchema, ReceivableSchema } from "@/app/schemas/receivable-schema";
import { Receivable } from "@/app/models/receivable.model";

interface Props {
  editMode: "new" | "detail";
}

export default function ReceivableForm(props: Props) {
  const params = useParams();
  const navigate = useRouter();
  const [getUsers, { data: users }] = useLazyGetUsersQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getRoom, { data: room }] = useLazyGetRoomQuery();
  const [getBankAccounts, { data: bankAccounts }] =
    useLazyGetBankAccountsQuery();
  const [createReceivable, { isLoading: creating }] =
    useCreateReceivableMutation();
  const [updateReceivable, { isLoading: updating }] =
    useUpdateReceivableMutation();
  const [deleteReceivable, { isLoading: deleting }] =
    useDeleteReceivableMutation();
  const [archiveReceivable, { isLoading: archiving }] =
    useArchiveReceivableMutation();
  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getReceivable, { data: selectedReceivable }] =
    useLazyGetReceivableQuery();

  const [selectedUser, setSelectedUser] = useState<any>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<
    BankAccount | undefined
  >(undefined);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const collection: CollectionQuery = useMemo(
    () => ({
      skip: 0,
      top: 20,
      orderBy: [{ field: "createdAt", direction: "desc" }],
    }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    register,
  } = useForm<ReceivableFormSchema>({
    resolver: zodResolver(ReceivableSchema),
    mode: "all",
    defaultValues: receivableDefaultValues,
  });
  useEffect(() => {
    getProperties(collection);
  }, [collection, getProperties]);

  useEffect(() => {
    getBankAccounts(collection);
  }, [collection, getBankAccounts]);

  useEffect(() => {
    getUsers(collection);
  }, [collection, getUsers]);

  useEffect(() => {
    if (props.editMode === "detail") {
      getReceivable({
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
        ...receivableDefaultValues,
      });
    }
  }, [params?.id, props.editMode]);
  const onSubmit: SubmitHandler<Receivable> = async (data) => {
    console.log("room", room);
    if (props.editMode === "new") {
      try {
        const response = await createReceivable({
          ...data,
          creditorId: room?.tenantId,
          creditorName: selectedUser?.firstName,
          bankName: selectedAccount?.bankName,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Receivable created successfully",
            color: "green",
          });
          navigate.push(`/receivable/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Receivable Not created successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updateReceivable({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Receivable Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Receivable not updated successfully",
          color: "red",
        });
      }
    }
  };
  const handleDelete = async () => {
    try {
      const id = params.id ?? ''
      const response = await deleteReceivable(id.toString()).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Receivable Deleted successfully",
          color: "green",
        });
        navigate.push("/receivable");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Not deleted successfully",
        color: "red",
      });
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
                      label: p?.description || "",
                      value: p?.id || "",
                    })) || []
                  }
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.propertyId?.message}
                  onChange={(value) => {
                    field.onChange(value);
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
                      getRoom({
                        ...collection,
                        id: value,
                      });
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
            <Controller
              name="creditorId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receiver"
                  placeholder="Select Receiver"
                  value={watch("creditorId")}
                  data={
                    users?.data?.map((user) => ({
                      label: user?.firstName || "",
                      value: user?.id || "",
                    })) || []
                  }
                  onChange={(value) => {
                    field.onChange(value);
                    const user = users?.data?.find((u) => u.id === value);
                    setSelectedUser(user);
                  }}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.creditorId?.message}
                />
              )}
            />
            <Controller
              name="creditorAccount"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receiver Account"
                  placeholder="Select Receiver Account"
                  value={watch("creditorAccount")}
                  data={
                    bankAccounts?.data?.map((p) => ({
                      label: p.accountNumber || "",
                      value: p.id || "",
                    })) || []
                  }
                  onChange={(value) => {
                    field.onChange(value);
                    const bankAccount = bankAccounts?.data?.find(
                      (u) => u.id === value
                    );
                    setSelectedAccount(bankAccount);
                  }}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.creditorAccount?.message}
                />
              )}
            />
          </Flex>
          <Flex gap={8}>
            <Controller
              name="creditorType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receiver Type"
                  placeholder="Select Receiver Type"
                  data={["User", "Vendor", "Other"]}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.creditorType?.message}
                />
              )}
            />
            <Controller
              name="invoiceType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receivable Type"
                  placeholder="Select Receivable Type"
                  data={["User", "Vendor", "Other"]}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.invoiceType?.message}
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
            <Textarea
              required
              minRows={8}
              placeholder="Remark"
              {...register("remark")}
              error={errors?.remark?.message}
              className="w-1/2"
            />{" "}
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
          </Flex>
          <Flex justify="flex-end" gap={8}>
            <Button
              variant="default"
              onClick={() => reset(receivableDefaultValues)}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="filled"
              bg="primary.4"
              loading={props.editMode === "new" ? creating : updating}
              leftSection={<IconDeviceFloppy />}
            >
              {props.editMode === "new" ? "Save" : "Update"}
            </Button>
            {props.editMode === "detail" && (
              <>
                <Modal
                  opened={opened}
                  onClose={close}
                  title="Reason"
                  centered
                  size={"50%"}
                >
                  <ReasonForm id={String(params.id)} onClose={close} />{" "}
                </Modal>
                <Button
                  type="button"
                  variant="filled"
                  color="red"
                  className={`shadow-none bg-red-500 rounded flex items-center`}
                  onClick={() => {
                    setOpenDeleteModal(true);
                  }}
                  loading={deleting}
                  leftSection={<IconTrash size={16} />}
                >
                  {"Delete"}
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </form>
      <Modal
        opened={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        size={"40%"}
        title={"Delete Receivable"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">
            {selectedReceivable?.finalAmount}{" "}
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
            loading={archiving || deleting}
            leftSection={
              selectedReceivable?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedReceivable?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </Box>
  );
}
