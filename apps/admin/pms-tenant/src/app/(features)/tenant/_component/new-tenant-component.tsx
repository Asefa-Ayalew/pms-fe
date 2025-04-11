"use client";
import { Tenant } from "../../../models/tenant.model";
import { NewTenantSchema } from "../../../schemas/new-tenant-schema";
import countryJson from "../../../constants/country-json.json";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  LoadingOverlay,
  Modal,
  Select,
  TextInput,
} from "@mantine/core";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  useArchiveTenantMutation,
  useCreateTenantMutation,
  useDeleteTenantMutation,
  useLazyGetTenantQuery,
  useRestoreTenantMutation,
  useUpdateTenantMutation,
} from "../_store/tenant.query";
import { getCurrentSession } from "@pms/auth";

interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}

type FormSchema = z.infer<typeof NewTenantSchema>;

const defaultValue: Tenant = {
  name: "",
  tradeName: "",
  tin: "",
  phoneNumber: "",
  email: "",
  shortCode: "",
  industry: "",
};

const countryCodes = countryJson
  .map((country) => ({
    value: country.dial_code,
    label: `${country.name} (${country.dial_code})`,
  }))
  .filter(
    (value, index, self) =>
      index === self.findIndex((t) => t.value === value.value)
  );

export default function NewTenantComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();
  const [currentSession, setCurrentSession] = useState<any>(null);
  
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant>();
  const [countryCode, setCountryCode] = useState<string>("+251");

  const [getTenant, tenant] = useLazyGetTenantQuery();
  const [createTenant, createResponse] = useCreateTenantMutation();
  const [updateTenant, updateResponse] = useUpdateTenantMutation();
  const [archiveTenant, archiveResponse] = useArchiveTenantMutation();
  const [restoreTenant, restoreResponse] = useRestoreTenantMutation();
  const [deleteTenant, deleteResponse] = useDeleteTenantMutation();
  const [secondaryPhoneNumbers, setSecondaryPhoneNumbers] = useState<string[]>(
    []
  );
  const [secondaryEmails, setSecondaryEmails] = useState<string[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(NewTenantSchema),
    mode: "all",
  });

  function onSubmit(data: Tenant) {
    const requestData = {
      ...data,
      phoneNumber: `${data.phoneNumber}`,
      secondaryPhoneNumbers: secondaryPhoneNumbers.filter(
        (phone) => phone.trim() !== ""
      ),
      secondaryEmails: secondaryEmails.filter((email) => email.trim() !== ""),
    };
    if (editMode === "new") {
      createTenant(requestData).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          navigate.push(`/tenants/detail/${response?.data?.id}`);
        }
      });
    } else {
      updateTenant({ ...requestData, id: `${params?.id}` }).then(
        (response: any) => {
          if (response?.data) {
            navigate.push(`/tenants/detail/${response?.data?.id}`);
          }
        }
      );
    }
  }
  const onError = (error: any) => {
    console.log("Error", error);
  };
  function handleDeleteTenant() {
    if (!selectedTenant?.id) return;

    deleteTenant(`${params?.id}`).then((response: any) => {
      if (response?.data) {
        setOpenDeleteModal(false);
        navigate.push("/tenants");
      }
    });
  }
  const addSecondaryPhoneNumber = () => {
    setSecondaryPhoneNumbers([...secondaryPhoneNumbers, ""]);
  };

  const removeSecondaryPhoneNumber = (index: number) => {
    const newSecondaryPhoneNumbers = [...secondaryPhoneNumbers];
    newSecondaryPhoneNumbers.splice(index, 1);
    setSecondaryPhoneNumbers(newSecondaryPhoneNumbers);
  };

  const addSecondaryEmail = () => {
    setSecondaryEmails([...secondaryEmails, ""]);
  };

  const removeSecondaryEmail = (index: number) => {
    const newSecondaryEmails = [...secondaryEmails];
    newSecondaryEmails.splice(index, 1);
    setSecondaryEmails(newSecondaryEmails);
  };

  const handleSecondaryPhoneNumberChange = (index: number, value: string) => {
    const newSecondaryPhoneNumbers = [...secondaryPhoneNumbers];
    newSecondaryPhoneNumbers[index] = value;
    setSecondaryPhoneNumbers(newSecondaryPhoneNumbers);
  };

  const handleSecondaryEmailChange = (index: number, value: string) => {
    const newSecondaryEmails = [...secondaryEmails];
    newSecondaryEmails[index] = value;
    setSecondaryEmails(newSecondaryEmails);
  };

  useEffect(() => {
    getCurrentSession()?.then((session: any) => {
      setCurrentSession(session);
    });
  }, []);
  
  useEffect(() => {
    if (editMode === "detail") {
      getTenant({ id: `${params?.id}` }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response.data,
            secondaryPhoneNumbers: response.data.secondaryPhoneNumbers || [],
            secondaryEmails: response.data.secondaryEmails || [],
          });
          setSecondaryPhoneNumbers(response.data.secondaryPhoneNumbers || []);
          setSecondaryEmails(response.data.secondaryEmails || []);
        }
      });
    } else {
      reset(defaultValue);
    }
  }, [params?.id, editMode]);

  return (
    <div className="w-full p-4 flex-col space-y-4">
      <div className="flex px-4 border-b-2 items-center justify-center">
        <h3 className="text-2xl font-semibold">
          {editMode === "new" ? "New Tenant" : ""}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={tenant?.isLoading || tenant?.isFetching}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form
          name="Tenant form"
          onSubmit={handleSubmit(onSubmit, onError)}
          autoComplete="off"
          className="w-full"
        >
          <div className="flex w-full justify-center">
            <div className="px-2 w-4/5 mt-4 flex-col space-y-4">
              <TextInput
                label="Tenant Name"
                className="w-full"
                placeholder="Tenant Name"
                {...register("name")}
                error={errors?.name?.message}
              />

              {/* Trade Name */}
              <TextInput
                label="Trade Name"
                className="w-full"
                placeholder="Trade Name"
                {...register("tradeName")}
                error={errors?.tradeName?.message}
              />

              {/* TIN (Taxpayer Identification Number) */}
              <TextInput
                label="TIN"
                className="w-full"
                placeholder="Taxpayer Identification Number"
                {...register("tin")}
                error={errors?.tin?.message}
              />

              {/* Email */}
              <div className="flex space-x-4">
                <TextInput
                  label="Email"
                  type="email"
                  className="w-full"
                  placeholder="Tenant Email"
                  {...register("email")}
                  error={errors?.email?.message}
                />
                <Button className="mt-7" onClick={addSecondaryEmail}>
                  <IconPlus size={20} />
                </Button>
              </div>
              {secondaryEmails.map((email, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <TextInput
                    label="Secondary Email Address"
                    className="w-full"
                    placeholder="Secondary Email Address"
                    {...register(`secondaryEmails.${index}`)}
                    error={errors?.secondaryEmails?.[index]?.message}
                    onChange={(event) =>
                      handleSecondaryEmailChange(
                        index,
                        event.currentTarget.value
                      )
                    }
                  />
                  <Button
                    variant="subtle"
                    color="red"
                    className="mt-4 text-red-600"
                    onClick={() => removeSecondaryEmail(index)}
                  >
                    <IconTrash size={20} />
                  </Button>
                </div>
              ))}

              {/* Phone Number with Country Code */}
              <div className="flex space-x-4">
                <Select
                  label="Country Code"
                  className="w-1/4"
                  data={countryCodes}
                  value={countryCode}
                  onChange={(value) => setCountryCode(value ?? "+251")}
                  searchable
                />
                <TextInput
                  label="Phone Number"
                  className="w-3/4"
                  placeholder="Phone Number"
                  {...register("phoneNumber")}
                  error={errors?.phoneNumber?.message}
                />
                <Button className="mt-7" onClick={addSecondaryPhoneNumber}>
                  <IconPlus size={20} />
                </Button>
              </div>
              <TextInput
                label="Short Code"
                className="w-3/4"
                placeholder="Short Code"
                {...register("shortCode")}
                error={errors?.shortCode?.message}
              />
              {secondaryPhoneNumbers.map((phoneNumber, index) => (
                <div key={index} className="flex space-x-4 items-center">
                  <Select
                    label="Country Code"
                    className="w-1/4"
                    data={countryCodes}
                    value={countryCode}
                    onChange={(value) => setCountryCode(value ?? "+251")}
                    searchable
                  />
                  <TextInput
                    label="Secondary Phone Number"
                    className="w-3/4"
                    placeholder="Secondary Phone Number"
                    {...register(`secondaryPhoneNumbers.${index}`)}
                    error={errors?.secondaryPhoneNumbers?.[index]?.message}
                    onChange={(event) =>
                      handleSecondaryPhoneNumberChange(
                        index,
                        event.currentTarget.value
                      )
                    }
                  />
                  <Button
                    variant="subtle"
                    color="red"
                    className="mt-7"
                    onClick={() => removeSecondaryPhoneNumber(index)}
                  >
                    <IconTrash size={20} />
                  </Button>
                </div>
              ))}
              {/* Industry */}
              <TextInput
                label="Industry"
                className="w-full"
                placeholder="Industry Type"
                {...register("industry")}
                error={errors?.industry?.message}
              />

              {/* Buttons */}
              <div className="w-full flex space-x-4 justify-end mt-4">
                <Button variant="default" onClick={() => reset(defaultValue)}>
                  Reset
                </Button>

                {editMode === "detail" && (
                  <Button
                    type="button"
                    variant="filled"
                    color="red"
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setSelectedTenant(tenant?.data);
                    }}
                    loading={
                      archiveResponse?.isLoading || restoreResponse?.isLoading
                    }
                    leftSection={
                      tenant?.data?.archivedAt ? (
                        <IconArrowBack size={15} />
                      ) : (
                        <IconTrash size={15} />
                      )
                    }
                  >
                    {tenant?.data?.archivedAt ? "Restore" : "Delete"}
                  </Button>
                )}

                <Button
                  variant="filled"
                  type="submit"
                  loading={
                    editMode === "new"
                      ? createResponse?.isLoading
                      : updateResponse?.isLoading
                  }
                  leftSection={<IconDeviceFloppy />}
                >
                  {editMode === "new" ? "Save" : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Modal */}
      <Modal
        opened={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        size={"40%"}
        title={"Delete Tenant"}
        centered
      >
        <h2>
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{selectedTenant?.name}</span>?
        </h2>
        <div className="flex my-4">
          <Button
            variant="default"
            className="mx-2"
            onClick={() => setOpenDeleteModal(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="filled"
            color="red"
            className="mx-2"
            onClick={handleDeleteTenant}
            loading={archiveResponse?.isLoading || deleteResponse?.isLoading}
            leftSection={<IconTrash size={15} />}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
