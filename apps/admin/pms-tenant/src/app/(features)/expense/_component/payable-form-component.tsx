"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Select, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetBankAccountsQuery } from "../../bank-accounts/_store/bank-account.query";
import { useLazyGetRoomsQuery } from "../../property/_store/room.query";
import { useLazyGetUsersQuery } from "../../user/_store/user.query";
import { useSendToPaybleMutation } from "../_store/expense.query";
import { Expense } from "@/app/models/expense.model";
import { CollectionQuery } from "@pms/entity";
import { payableModalDefaultValues, PayableModalFormSchema, PayableModalSchema } from "@/app/schemas/payable-modal-shema";
import { Payable } from "@/app/models/payable.model";

export default function PayableForm(props: { data: Expense[] | undefined }) {
  const params = useParams();
  const navigate = useRouter();
  const [getUsers, { data: users }] = useLazyGetUsersQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getBankAccounts, { data: bankAccounts }] =
    useLazyGetBankAccountsQuery();
  const [sendToPayable, { isLoading: sendingToPayable }] =
    useSendToPaybleMutation();

  const [expenses, setExpenses] = useState(props.data || []);
  const [selectedUser, setSelectedUser] = useState<any>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<any>(undefined);

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
  } = useForm<PayableModalFormSchema>({
    resolver: zodResolver(PayableModalSchema),
    mode: "all",
    defaultValues: payableModalDefaultValues,
  });

  useEffect(() => {
    getBankAccounts(collection);
  }, [collection, getBankAccounts]);

  useEffect(() => {
    getUsers(collection);
  }, [collection, getUsers]);

  const removeExpense = (id: string) => {
    setExpenses((prevExpenses) => prevExpenses.filter((i) => i.id !== id));
  };

  const uniqueProperties = Array.from(
    new Map(
      (expenses || []).map((expense) => [expense?.property?.id, expense])
    ).values()
  ).map((expense) => expense?.property);

  const onSubmit: SubmitHandler<Payable> = async (data) => {
    const submittedData = {
      ...data,
      expenses: props?.data?.map((item) => String(item.id)),
      receiverName: selectedUser?.firstName,
      bankName: selectedAccount?.bankName,
    };
    try {
      const response = await sendToPayable(submittedData).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Expense sent to payable successfully",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Sorry Expense sent to payable successfully",
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
                    uniqueProperties?.map((p) => ({
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
          </Flex>
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
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>Room name</Table.Th>
                <Table.Th>Expense Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className="w-8"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {expenses?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item?.property?.description}</Table.Td>
                  <Table.Td>{item?.room?.description}</Table.Td>
                  <Table.Td>{item?.expenseType?.description}</Table.Td>
                  <Table.Td>{item?.status}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      onClick={() => removeExpense(String(item?.id))}
                    >
                      <IconTrash size={14} color="red"></IconTrash>
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Flex justify="flex-end" gap={8}>
            <Button
              variant="default"
              onClick={() => reset(payableModalDefaultValues)}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="filled"
              bg="primary.4"
              //   loading={sendingToPayable}
              leftSection={<IconDeviceFloppy />}
            >
              Send to Payable
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
