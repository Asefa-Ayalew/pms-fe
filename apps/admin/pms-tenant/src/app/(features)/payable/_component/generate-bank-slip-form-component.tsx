"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Flex, Select, Switch, Table } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetOrganizationBankAccountsQuery } from "../../organization-bank-accounts/_store/organization-bank-account.query";
import { useGenerateBankSlipMutation } from "../_store/payable.query";
import { Payable } from "@/app/models/payable.model";
import { CollectionQuery } from "@pms/entity";
import { GenerateBankSlipDefaultValues, GenerateBankSlipFormSchema, GenerateBankSlipSchema } from "@/app/schemas/generate-bank-slip-schema";
import { GenerateBankSlip } from "@/app/models/generate-bank-slip";

export default function GenerateBankSlipForm(props: {
  data: Payable[] | undefined;
}) {
  const params = useParams();
  const navigate = useRouter();

  const [getBankAccounts, { data: bankAccounts }] =
    useLazyGetOrganizationBankAccountsQuery();
  const [generateBankSlip, { isLoading: generatingBankSlip }] =
    useGenerateBankSlipMutation();

  const [payables, setPayables] = useState(props.data || []);
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
  } = useForm<GenerateBankSlipFormSchema>({
    resolver: zodResolver(GenerateBankSlipSchema),
    mode: "all",
    defaultValues: GenerateBankSlipDefaultValues,
  });

  useEffect(() => {
    getBankAccounts(collection);
  }, [collection, getBankAccounts]);

  const removePayable = (id: string) => {
    setPayables((prevPayables) => prevPayables.filter((i) => i.id !== id));
  };

  const onSubmit: SubmitHandler<GenerateBankSlip> = async (data) => {
    const submittedData = {
      ...data,
      items: props?.data?.map((item) => String(item.id)),
    };
    try {
      const response = await generateBankSlip(submittedData).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Payable generated bank slip successfully",
          color: "green",
        });
      }
    } catch (err: any) {
      console.log("error", err);
      notifications.show({
        title: "Error",
        message: err?.data?.message,
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
              name="fromAccountId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="From Account"
                  placeholder="Select Account"
                  value={watch("fromAccountId")}
                  data={
                    bankAccounts?.data?.map((p) => ({
                      label: p.accountNumber + "-" + p.bankCode || "",
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
                  error={errors?.fromAccountId?.message}
                />
              )}
            />
            <Controller
              name="mergeSimilarReceivers"
              control={control}
              render={({ field: { name, value, onChange } }) => (
                <Switch
                  className="mt-8 w-1/2"
                  name={name}
                  label="Merge Similar Receivers"
                  checked={value}
                  onChange={(event) =>
                    setValue(
                      "mergeSimilarReceivers",
                      event.currentTarget.checked
                    )
                  }
                />
              )}
            />
          </Flex>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Property</Table.Th>
                <Table.Th>Room name</Table.Th>
                <Table.Th>Payable Type</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className="w-8"></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {payables?.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item?.property?.description}</Table.Td>
                  <Table.Td>{item?.room?.description}</Table.Td>
                  <Table.Td>{item?.payableType}</Table.Td>
                  <Table.Td>{item?.status}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      onClick={() => removePayable(String(item?.id))}
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
              onClick={() => reset(GenerateBankSlipDefaultValues)}
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
              Generate Bank Slip
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
