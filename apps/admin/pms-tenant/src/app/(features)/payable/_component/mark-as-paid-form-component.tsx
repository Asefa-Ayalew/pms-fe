"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Group,
  NumberInput,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconReceipt2 } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetBankAccountsQuery } from "../../bank-accounts/_store/bank-account.query";
import { useMarkAsPaidMutation } from "../_store/payable.query";
import { CollectionQuery } from "@pms/entity";
import { getCurrentSession } from "@pms/auth";
import { MarkAsPidDefaultValues, MarkAsPidFormSchema, MarkAsPidSchema } from "../../../schemas/mark-as-paid-schema";

interface Props {
  onClose: () => void;
  id?: string;
}

export default function MarkAsPaidFrom(props: Props) {
  const params = useParams();
  const navigate = useRouter();
  const collection: CollectionQuery = useMemo(
    () => ({
      skip: 0,
      top: 20,
      orderBy: [{ field: "createdAt", direction: "desc" }],
    }),
    []
  );

  const [markAsPid, { isLoading: markingAsPaid }] = useMarkAsPaidMutation();
  const [getBankAccounts, { data: bankAccounts, isLoading }] =
    useLazyGetBankAccountsQuery();
  const [ user, setUser ] = useState<any>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<any>("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MarkAsPidFormSchema>({
    resolver: zodResolver(MarkAsPidSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const response = await markAsPid({
        ...data,
        id: props.id?.toString(),
        paidById: user?.id,
      }).unwrap();

      if (response) {
        props.onClose();
        notifications.show({
          title: "Success",
          message: "You have successfully mark as paid",
          color: "green",
        });
      }
    } catch (err) {}
  };

  const onError = (error: any) => {};

    useEffect(() => {
      const fetchSession = async () => {
        const session = await getCurrentSession() || {};
        setUser(session);
      };
  
      fetchSession();
    }, []);

  useEffect(() => {
    getBankAccounts(collection);
  }, [collection, getBankAccounts]);

  return (
    <Box
      className="w-full p-4 flex-col space-y-4 buser"
      onClick={(e) => e.stopPropagation()}
    >
      <form
        name="Room form"
        onSubmit={handleSubmit(onSubmit, onError)}
        autoComplete="off"
        className="w-full"
      >
        <Box className="flex w-full  justify-center">
          <Group mt="xl"></Group>
          <Box className="px-2 w-full mt-4 flex-col space-y-4">
            <Flex gap={8}>
              <Controller
                name="transactionType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    withCheckIcon={false}
                    label="Transaction Type"
                    placeholder="Select Transaction Type"
                    data={["T1", "T2", "T3"]}
                    className="w-1/2"
                    withAsterisk
                    searchable
                    error={errors?.transactionType?.message}
                  />
                )}
              />
              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    withCheckIcon={false}
                    label="Payment Method"
                    placeholder="Select Payment Method"
                    data={["Cash", "Bank Transfer", "Other"]}
                    className="w-1/2"
                    withAsterisk
                    searchable
                    error={errors?.paymentMethod?.message}
                  />
                )}
              />
            </Flex>
            <Flex gap={8}>
              <Controller
                name="fromAccountId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    withCheckIcon={false}
                    label="Receiver Account"
                    placeholder="Select Receiver Account"
                    value={watch("fromAccountId")}
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
                    error={errors?.fromAccountId?.message}
                  />
                )}
              />
              <Controller
                name="serviceCharge"
                control={control}
                render={({ field }) => (
                  <NumberInput
                    {...field}
                    className="w-1/2"
                    label="Service Charge"
                    placeholder="Enter Service Charge"
                    error={errors?.serviceCharge?.message}
                    withAsterisk
                  />
                )}
              />
            </Flex>
            <Flex gap={8}>
              <Controller
                name="transactionDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    {...field}
                    className="w-1/2"
                    label="Start Date"
                    error={errors?.transactionDate?.message?.toString() || ""}
                    required
                  />
                )}
              />
              <Controller
                name="paidDate"
                control={control}
                render={({ field }) => (
                  <DateInput
                    {...field}
                    className="w-1/2"
                    label="End Date"
                    error={errors?.paidDate?.message?.toString() || ""}
                    required
                  />
                )}
              />
            </Flex>
            <Flex gap={8}>
              <TextInput
                label="Transaction Reference"
                className="w-1/2"
                required
                placeholder="City"
                {...register("transactionReference")}
                error={errors?.transactionReference?.message}
              />
              <Textarea
                required
                minRows={8}
                className="w-1/2"
                placeholder="Remark"
                {...register("remark")}
                error={errors?.remark?.message}
              />
            </Flex>
            <Box className="w-full flex space-x-4  justify-end mt-4">
              <Button
                variant="default"
                className="bg-none"
                onClick={() => reset({ ...MarkAsPidDefaultValues })}
              >
                Reset
              </Button>
              <Button
                variant="filled"
                className="shadow-none rounded flex items-center"
                bg={"primary.4"}
                type="submit"
                loading={markingAsPaid}
                leftSection={<IconReceipt2 />}
              >
                {"Mark as Paid"}
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
