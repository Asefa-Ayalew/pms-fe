"use client";

import BankListJson from "../../../constants/bank-list.json";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
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
  IconBan,
  IconDeviceFloppy,
  IconReceipt2,
  IconTrash,
  IconView360,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetBankAccountsQuery } from "../../bank-accounts/_store/bank-account.query";
import { useLazyGetPropertiesQuery } from "../../property/_store/property.query";
import { useLazyGetRoomsQuery } from "../../property/_store/room.query";
import { useLazyGetUsersQuery } from "../../user/_store/user.query";
import {
  useArchivePayableMutation,
  useCreatePayableMutation,
  useDeletePayableMutation,
  useLazyGetPayableQuery,
  useUpdatePayableMutation,
} from "../_store/payable.query";
import MarkAsPaidFrom from "./mark-as-paid-form-component";
import ReasonForm from "./reason-form-component";
import { CollectionQuery } from "@pms/entity";
import { payableDefaultValues, PayableFormSchema, PayableSchema } from "../../../schemas/payable-schema";
import { Payable } from "../../../models/payable.model";
interface Props {
  editMode: "new" | "detail";
}

export default function PayableForm(props: Props) {
  const params = useParams();
  const navigate = useRouter();
  const [getUsers, { data: users }] = useLazyGetUsersQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getBankAccounts, { data: bankAccounts }] =
    useLazyGetBankAccountsQuery();
  const [createPayable, { isLoading: creating }] = useCreatePayableMutation();
  const [updatePayable, { isLoading: updating }] = useUpdatePayableMutation();
  const [deletePayable, { isLoading: deleting }] = useDeletePayableMutation();
  const [archivePayable, { isLoading: archiving }] =
    useArchivePayableMutation();
  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getPayable, { data: selectedPayable }] = useLazyGetPayableQuery();

  const [selectedUser, setSelectedUser] = useState<any>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<any>(undefined);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [markAsPaidOpened, { open: openMarkAsPaid, close: closeMarkAsPaid }] =
    useDisclosure(false);
  const [voidModalOpened] = useDisclosure(false);
  const [reasonOpened, { open: openReason, close: closeReason }] =
    useDisclosure(false);

  const bankCodes = BankListJson.map((bank) => ({
    value: bank.bankCode,
    label: `${bank.name}`,
  })).filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.value === value.value)
  );

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
    watch,
    register,
  } = useForm<PayableFormSchema>({
    resolver: zodResolver(PayableSchema),
    mode: "all",
    defaultValues: payableDefaultValues,
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
      getPayable({
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
        ...payableDefaultValues,
      });
    }
  }, [params?.id, props.editMode]);
  const onSubmit: SubmitHandler<Payable> = async (data) => {
    console.log("datad", data);
    console.log();
    if (props.editMode === "new") {
      try {
        const response = await createPayable({
          ...data,
          receiverName: selectedUser?.firstName,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Payable created successfully",
            color: "green",
          });
          navigate.push(`/payable/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Payable Not created successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updatePayable({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Payable Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Payable not updated successfully",
          color: "red",
        });
      }
    }
  };
  const handleDelete = async () => {
    try {
      const id = params.id ?? ''
      const response = await deletePayable(id.toString()).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Payable Deleted successfully",
          color: "green",
        });
        navigate.push("/payable");
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
    <Box className="w-full p-4 flex-col space-y-2">
      <Box className="px-4">
        <Button
          leftSection={<IconView360 size={12} />}
          variant="filled"
          radius={"xl"}
          className="w-max ml-auto  flex items-center gap-0.5 bg-primary-500 text-white"
          onClick={() => {
            navigate.push(`detail/${selectedPayable?.id ?? ""}`);
          }}
        >
          View
        </Button>
      </Box>
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
              name="receiverId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receiver"
                  placeholder="Select Receiver"
                  value={watch("receiverId")}
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
                  error={errors?.receiverId?.message}
                />
              )}
            />
            <Controller
              name="receiverAccount"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Receiver Account"
                  placeholder="Select Receiver Account"
                  value={watch("receiverAccount")}
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
                  error={errors?.receiverAccount?.message}
                />
              )}
            />
          </Flex>
          <Flex gap={8}>
            <Controller
              name="receiverType"
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
                  error={errors?.receiverType?.message}
                />
              )}
            />
            <Controller
              name="payableType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Payable Type"
                  placeholder="Select Payable Type"
                  data={["User", "Vendor", "Other"]}
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.payableType?.message}
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
              onClick={() => reset(payableDefaultValues)}
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
                  opened={reasonOpened}
                  onClose={closeReason}
                  title="Reason"
                  centered
                  size={"50%"}
                >
                  <ReasonForm
                    id={String(params.id)}
                    onClose={closeReason}
                    type="archive"
                  />{" "}
                </Modal>
                {!(
                  selectedPayable?.status === "REJECTED" ||
                  selectedPayable?.status === "PAID"
                ) && (
                  <Button
                    leftSection={<IconReceipt2 size={16} color="gray" />}
                    variant="default"
                    className="text-gray-900"
                    onClick={openMarkAsPaid}
                  >
                    Mark as Paid
                  </Button>
                )}

                {selectedPayable?.status !== "REJECTED" && (
                  <Button
                    leftSection={<IconBan size={16} />}
                    variant="filled"
                    className={`shadow-none bg-red-500 rounded flex items-center`}
                    onClick={openReason}
                  >
                    Void
                  </Button>
                )}
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
        title={"Delete Payable"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">
            {selectedPayable?.finalAmount}{" "}
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
              selectedPayable?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedPayable?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
      <Modal
        opened={markAsPaidOpened}
        onClose={closeMarkAsPaid}
        title="Fill Forms"
        size={"70%"}
      >
        <Divider />
        <MarkAsPaidFrom id={String(params.id)} onClose={closeMarkAsPaid} />
      </Modal>
      <Modal
        opened={reasonOpened}
        onClose={closeReason}
        title="Reason"
        centered
        size={"60%"}
      >
        <Divider />
        <ReasonForm id={String(params.id)} onClose={closeReason} type="void" />
      </Modal>
    </Box>
  );
}
