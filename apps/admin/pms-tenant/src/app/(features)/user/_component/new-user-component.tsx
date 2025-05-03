"use client";
import countryJson from "../../../constants/country-json.json";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Fieldset,
  Group,
  Input,
  LoadingOverlay,
  Modal,
  MultiSelect,
  Radio,
  Select,
  Switch,
  TextInput
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconArrowBack,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InputMask from "react-input-mask";
import z from "zod";
import { useLazyGetRolesQuery } from "../../role/_store/role.query";
import {
  useArchiveUserMutation,
  useCreateUserMutation,
  useCreateUserRoleMutation,
  useDeleteUserMutation,
  useLazyGetDepartmentsQuery,
  useLazyGetUserQuery,
  useRestoreUserMutation,
  useUpdateUserMutation,
} from "../_store/user.query";

import { CollectionQuery } from "@pms/entity";
import { NewUserSchema } from "../../../schemas/new-user-schema";
import { User } from "../../../models/user.model";
import { Department } from "../../../models/department.model";
import { Role } from "../../../models/role.model";


interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}

type FormSchema = z.infer<typeof NewUserSchema>;

const defaultValue: User = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  gender: "Male",
  departmentId: "",
  employeeNumber: "",
  isEmployee: true,
  startDate: new Date(),
  // userRoles: {
  //   userId: "",
  //   roleIds: [],
  // },
  address: {
    country: "",
    city: "",
    subcity: "",
    woreda: "",
    kebele: ""
  },
  email: "",
  dateOfBirth: new Date(),
  endDate: new Date(),
  password: ""
};

const countryCodes = countryJson.map((country: any) => {
  return { value: country.code, label: country.name, key: country.code };
});

export default function NewUserComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>();
  const [countryCode, setCountryCode] = useState<string>("+251");

  const [getRoles, roles] = useLazyGetRolesQuery();

  const [getUser, user] = useLazyGetUserQuery();
  const [createUser, createResponse] = useCreateUserMutation();
  const [createUserRole, createRoleResponse] = useCreateUserRoleMutation();
  const [updateUser, updateResponse] = useUpdateUserMutation();
  const [archiveUser, archiveResponse] = useArchiveUserMutation();
  const [restoreUser, restoreResponse] = useRestoreUserMutation();
  const [deleteUser, deleteResponse] = useDeleteUserMutation();
  const [collection, setCollection] = useState<CollectionQuery>({});
  const [getDepartments, departments] = useLazyGetDepartmentsQuery();
  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(NewUserSchema),
    mode: "all",
  });

  function onSubmit(data: FormSchema) {
    const userRoles = data.userRoles;
    console.log("User Roles", userRoles)
    if (editMode === "new") {
      createUser({
        ...data,
        phone: `${data?.phone?.split(" ").join("")}`,
        endDate: undefined,
      }).then((response: any) => {
        if (response?.data) {
          if (userRoles) {
            const newUserRoles = {
              ...userRoles,
              userId: response.data.id
            }
            createUserRole(newUserRoles);
          }
          onCreating?.(false);
          if (!onCreating) {
            navigate.push(`/user/detail/${response?.data?.id}`);
          }
        }
      });
    } else {
      const updatedData = {
        ...data,
        id: `${params?.id}`,
        phone: `${data?.phone?.split(" ").join("")}`,
      };

      updateUser(updatedData).then(async (response: any) => {
        if (response?.data) {
          if (data?.userRoles) {
            const updatedRoles = {
              ...userRoles,
              userId: response.data.id
            }
            createUserRole(userRoles ?? data?.userRoles);
          }
          // if (currentUser?.id === response.data.id) {
          //   await update({
          //     profile: response.data,
          //   });
          // }

          navigate.push(`/user/detail/${response?.data?.id}`);
        }
      });
    }
  }

  function handleDelete() {
    selectedUser?.archivedAt
      ? restoreUser({ id: `${selectedUser?.id}` }).then((response: any) => {
        if (response?.data) {
          setOpenDeleteModal(false);
        }
      })
      : deleteUser(`${selectedUser?.id}`)
        .then((response: any) => {
          if (response?.data) {
            setOpenDeleteModal(false);
          }
        })
        .finally(() => {
          setOpenDeleteModal(false);
          navigate.push(`/user`);
        });
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    if (editMode === "detail") {
      getUser({
        id: `${params?.id}`,
        includes: ["userRoles", "userContacts"],
      }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response?.data,
            dateOfBirth: new Date(response?.data?.dateOfBirth),
            startDate: new Date(response?.data?.startDate),
            endDate: new Date(response?.data?.endDate),
          });
        }
      });
    } else {
      // reset({
      //   ...defaultValue,
      // });
    }
  }, [params?.id, editMode]);

  useEffect(() => {
    getDepartments(collection);
    getRoles(collection);
  }, [collection]);

  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <div className="flex px-4 buser-0 buser-b-2 items-center justify-center">
        <h3 className="text-2xl font-semibold">
          {editMode === "new"
            ? "New User Registration" : "User Detail"}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={
            user.isLoading ||
            user?.isFetching ||
            roles?.isLoading ||
            roles?.isFetching
          }
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form
          name="User form"
          onSubmit={handleSubmit(onSubmit, onError)}
          autoComplete="off"
          className="w-full"
        >
          <div className="flex w-full  justify-center">
            <div className="px-2 w-4/5 flex-col space-y-4">
              <Fieldset legend="Basic Information">
                <div className="md:flex sm:flex-row md:space-x-4">
                  <TextInput
                    label="First Name"
                    className="w-full"
                    required
                    placeholder="First Name"
                    {...register("firstName")}
                    error={errors?.firstName?.message}
                  />
                  <TextInput
                    label="Middle Name"
                    className="w-full"
                    required
                    placeholder="Middle Name"
                    {...register("middleName")}
                    error={errors?.middleName?.message}
                  />
                </div>

                <div className="flex space-x-4">
                  <TextInput
                    label="Last Name"
                    className="sm:w-full lg:w-1/2"
                    placeholder="Last Name"
                    {...register("lastName")}
                    error={errors?.lastName?.message}
                  />
                  <Controller
                    name="isEmployee"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        className="lg:w-1/2 sm:w-full lg:mt-7"
                        checked={watch("employeeNumber") ? true : field.value}
                        onChange={(e) => {
                          setValue("isEmployee", e.currentTarget.checked, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                        label="Is Employee"
                      />
                    )}
                  />
                </div>
                <div className="lg:flex sm:flex-row lg:gap-x-2">
                  {(watch("isEmployee") || watch("employeeNumber")) && (
                    <TextInput
                      label="Employee ID Number"
                      className="sm:w-full"
                      placeholder="Employee ID Number"
                      {...register("employeeNumber")}
                      error={errors?.employeeNumber?.message}
                    />
                  )}
                  {editMode === "new" && (
                    <TextInput
                      label="Password"
                      className="sm:w-full"
                      type="password"
                      placeholder="Password"
                      {...register("password")}
                      error={errors?.password?.message}
                    />
                  )}
                </div>
                <div className="flex space-x-4">
                  <DatePickerInput
                    label="Date of Birth"
                    className="w-full"
                    error={errors?.dateOfBirth?.message}
                    required
                    value={watch("dateOfBirth")}
                    onChange={(value) => {
                      setValue("dateOfBirth", dayjs(value).toDate());
                    }}
                  />
                  <div className="flex w-full justify-between items-center">
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Radio.Group
                          {...field}
                          withAsterisk
                          label="Select Gender"
                          value={watch("gender")}
                          onChange={(event) => {
                            setValue("gender", event as "Male" | "Female");
                          }}
                        >
                          <Group mt="xs">
                            <Radio value="Male" label="Male" />
                            <Radio value="Female" label="Female" />
                          </Group>
                        </Radio.Group>
                      )}
                    />
                  </div>
                </div>
              </Fieldset>
              <Fieldset legend="Address Information">
                <div className="flex space-x-4">
                  <div className="flex w-full">
                    <Select
                      radius={"xs"}
                      searchable
                      onChange={(code) => {
                        if (
                          code &&
                          countryJson.find((item: any) => item.code === code)
                        ) {
                          setCountryCode(
                            countryJson.find((item: any) => item.code === code)
                              ?.dial_code ?? "+251"
                          );
                        }
                      }}
                      classNames={{
                        input:
                          "border border-gray-400/70 border-r-0 rounded rounded-r-none",
                      }}
                      value={
                        countryJson.find(
                          (item: any) => item.dial_code === countryCode
                        )?.code ?? "ET"
                      }
                      label="Code"
                      data={countryJson?.map((item: any) => ({
                        label: `${item.name} (${item.dial_code})`,
                        value: item.code,
                        key: item.name,
                      }))}
                      maxDropdownHeight={400}
                    />
                    <Input.Wrapper
                      className="w-full"
                      label="Phone number"
                      required
                      error={errors.phone && `${errors?.phone?.message}`}
                    >
                      <Input
                        classNames={{ input: "rounded-l-none" }}
                        component={InputMask}
                        mask={`${countryCode} 999 999 999`}
                        value={watch("phone")}
                        placeholder="Phone number"
                        {...register("phone")}
                      />
                    </Input.Wrapper>
                  </div>
                </div>
                <div className="flex gap-x-3">
                  <TextInput
                    type="email"
                    label="Email"
                    required
                    className="w-full"
                    placeholder="Email"
                    {...register("email")}
                    error={errors?.email?.message}
                  />
                  <Controller
                    control={control}
                    name="address.country"
                    render={({ field }) => (
                      <Select
                        label="Country"
                        searchable
                        required
                        placeholder="Select Country"
                        className="w-full"
                        error={errors?.address?.country?.message}
                        value={field.value}
                        onChange={field.onChange}
                        data={countryJson?.map((item: any) => ({
                          label: `${item.name}`,
                          value: item.name,
                          key: item.name,
                        }))}
                      />
                    )}
                  />
                </div>
                <div className="flex gap-x-3">
                  <TextInput
                    label="City"
                    className="w-full"
                    required
                    placeholder="Enter City"
                    {...register("address.city")}
                    error={errors?.address?.city?.message}
                  />
                  <TextInput
                    label="Subcity"
                    className="w-full"
                    required
                    placeholder="Enter Subcity"
                    {...register("address.subcity")}
                    error={errors?.address?.subcity?.message}
                  />
                </div>
                <div className="flex gap-x-3">
                  <TextInput
                    label="Woreda"
                    className="w-full"
                    required
                    placeholder="Enter Woreda"
                    {...register("address.woreda")}
                    error={errors?.address?.woreda?.message}
                  />
                  <TextInput
                    label="Kebele"
                    className="w-full"
                    required
                    placeholder="Enter Kebele"
                    {...register("address.kebele")}
                    error={errors?.address?.kebele?.message}
                  />
                </div>
              </Fieldset>
              <Fieldset legend="Employment Information">
                <div className="md:flex sm:flex-row md:space-x-4">
                  <TextInput
                    label="Job Title"
                    className="w-full"
                    required
                    placeholder="Job Title"
                    {...register("jobTitle")}
                    error={errors?.jobTitle?.message}
                  />
                  <TextInput
                    label="TIN"
                    className="w-full"
                    required
                    placeholder="TIN"
                    {...register("tin")}
                    error={errors?.tin?.message}
                  />
                </div>
                <div className="flex space-x-4">
                  <Controller
                    control={control}
                    name="departmentId"
                    render={({ field }) => (
                      <Select
                        label="Department"
                        searchable
                        placeholder="Select Department"
                        className="w-full"
                        error={errors?.departmentId?.message}
                        value={field.value}
                        onChange={(selectedValue) => { field.onChange(selectedValue) }}
                        data={
                          departments?.data?.data?.map((item: Department) => ({
                            label: item?.name,
                            value: item?.id ?? '',
                            key: item?.name,
                          })) ?? []
                        }
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name="userRoles"
                    render={({ field }) => (
                      <MultiSelect
                        label="Role"
                        searchable
                        placeholder="Select role here"
                        className="w-full"
                        error={errors?.userRoles?.message}
                        value={field.value?.roleIds ?? []} // Directly use the string array
                        onChange={(selectedValues) => {
                          const updatedRoles = selectedValues.map((roleId) => roleId); // Convert to string array
                          const roleSet = {
                            userId: params.id,
                            roleIds: updatedRoles, // Use string[] instead of object[]
                          };
                          field.onChange(roleSet);
                          console.log("Rolesets", roleSet);
                        }}
                        data={
                          roles?.data?.data?.map((item: Role) => ({
                            label: item?.name,
                            value: item?.id,
                            key: item?.key,
                          })) ?? []
                        }
                      />
                    )}
                  />

                </div>
                <div className="flex space-x-4">
                  {watch("isEmployee") && (
                    <>
                      <DatePickerInput
                        label="Start Date"
                        className="w-full"
                        error={errors?.startDate?.message}
                        value={watch("startDate")}
                        onChange={(value) => {
                          setValue("startDate", dayjs(value).toDate());
                        }}
                      />
                      <DatePickerInput
                        label="End Date (if terminated)"
                        className="w-full"
                        error={errors?.endDate?.message}
                        value={watch("endDate") || undefined}
                        clearable
                        onChange={(value) => {
                          setValue("endDate", value ? dayjs(value).toDate() : undefined, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }}
                      />
                    </>
                  )}
                </div>
              </Fieldset>
              <div className="w-full flex space-x-4  justify-end">
                <Button
                  variant="default"
                  className="bg-none"
                // onClick={() =>
                //   // reset({
                //   //   ...defaultValue,
                //   // })
                // }
                >
                  Reset
                </Button>
                {editMode === "detail" && (

                  <Button
                    type="button"
                    variant="filled"
                    color="red"
                    className={`shadow-none bg-red-500 rounded flex items-center`}
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setSelectedUser(user?.data);
                    }}
                    loading={
                      archiveResponse?.isLoading || restoreResponse?.isLoading
                    }
                    leftSection={
                      user?.data?.archivedAt ? (
                        <IconArrowBack size={15} />
                      ) : (
                        <IconTrash size={15} />
                      )
                    }
                  >
                    {user?.data?.archivedAt ? "Restore" : "Delete"}
                  </Button>
                )}
                <Button
                  variant="filled"
                  // className="shadow-none bg-primary-500 rounded flex items-center"
                  bg={"primary.4"}
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

      <Modal
        opened={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        size={"40%"}
        title={"Delete Contact"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{selectedUser?.firstName} </span>
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
              selectedUser?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedUser?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
