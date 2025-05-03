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
import { useSendToReceivableMutation } from "../_store/invoice-item.query";
import { CollectionQuery } from "@pms/entity";
import { receivableDefaultValues, ReceivableFormSchema, ReceivableSchema } from "../../../schemas/receivable-schema";
import { InvoiceItem } from "../../../models/invoice-item.model";
import { Receivable } from "../../../models/receivable.model";

export default function ReceivableForm(props: {
  data: InvoiceItem[] | undefined;
}) {
  const params = useParams();
  const navigate = useRouter();
  const [getUsers, { data: users }] = useLazyGetUsersQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getBankAccounts, { data: bankAccounts }] =
    useLazyGetBankAccountsQuery();
  const [sendToReceivable, { isLoading: sendingToReceivable }] =
    useSendToReceivableMutation();

  const [invoiceItems, setInvoiceItems] = useState(props.data || []);
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
  } = useForm<ReceivableFormSchema>({
    resolver: zodResolver(ReceivableSchema),
    mode: "all",
    defaultValues: receivableDefaultValues,
  });

  useEffect(() => {
    getBankAccounts(collection);
  }, [collection, getBankAccounts]);

  useEffect(() => {
    getUsers(collection);
  }, [collection, getUsers]);

  const removeInvoiceItem = (id: string) => {
    setInvoiceItems((prevInvoiceItems) =>
      prevInvoiceItems.filter((i) => i.id !== id)
    );
  };

  const uniqueProperties = Array.from(
    new Map(
      (invoiceItems || []).map((invoiceItem) => [
        invoiceItem?.property?.id,
        invoiceItem,
      ])
    ).values()
  ).map((invoiceItem) => invoiceItem?.property);

  const onSubmit: SubmitHandler<Receivable> = async (data) => {
    const submittedData = {
      ...data,
      items: props?.data?.map((item) => String(item.id)),
      creditorName: selectedUser?.firstName,
      creditorAccount: selectedAccount?.accountNumber,
      bankName: selectedAccount?.bankName,
    };
    try {
      const response = await sendToReceivable(submittedData).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "InvoiceItem sent to receivable successfully",
          color: "green",
        });
      }
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Sorry InvoiceItem sent to receivable successfully",
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
          </Flex>
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
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>Room name</Table.Th>
                <Table.Th className="w-8"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoiceItems?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item?.property?.description}</Table.Td>
                  <Table.Td>{item?.room?.description}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      onClick={() => removeInvoiceItem(String(item?.id))}
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
              onClick={() => reset(receivableDefaultValues)}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="filled"
              bg="primary.4"
              //   loading={sendingToReceivable}
              leftSection={<IconDeviceFloppy />}
            >
              Send to Receivable
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
