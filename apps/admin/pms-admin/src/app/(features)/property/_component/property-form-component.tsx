"use client";
import { getCurrentSession } from "@pms/auth";

import countryJson from "@/app/constants/country-json.json";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Flex,
  Modal,
  NumberInput,
  Switch,
  TagsInput,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDeviceFloppy, IconTrash, IconView360 } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import {
  useCreatePropertyMutation,
  useDeletePropertyMutation,
  useLazyGetPropertyQuery,
  useUpdatePropertyMutation,
} from "../_store/property.query";
import ReasonForm from "./reason-form-component";
import { Property } from "@/app/models/property.model";
import { defaultValue, FormSchema, propertySchema } from "@/app/schemas/property-schema";

interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}


export default function PropertyFormComponent(props: Props) {
  const { editMode } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property>();
  const [opened, { close }] = useDisclosure(false);

  const [getProperty, property] = useLazyGetPropertyQuery();
  const [createProperty, { isLoading: creating }] =
    useCreatePropertyMutation();
  const [updateProperty, { isLoading: updating }] =
    useUpdatePropertyMutation();
  const [deleteProperty, { isLoading: deleting }] = useDeletePropertyMutation();
  const [user, setUser] = useState<any>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(propertySchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<Property> = async (data) => {
    if (editMode === "new") {
      try {
        const response = await createProperty({
          ...data,
          tenantId: user?.id,
        }).unwrap();

        if (response) {
          notifications.show({
            title: "Success",
            message: "Property created successfully",
            color: "green",
          });
          navigate.push(`/property/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry Not created successfully",
          color: "red",
        });
      }
    } else {
      try {
        const response = await updateProperty({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: "Success",
            message: "Property Updated successfully",
            color: "green",
          });
        }
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Sorry property not updated successfully",
          color: "red",
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProperty((params?.id ?? "").toString()).unwrap();
      if (response) {
        notifications.show({
          title: "Success",
          message: "Property Deleted successfully",
          color: "green",
        });
        navigate.push("/property");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Not archived successfully",
        color: "red",
      });
    }
  };

  const onError = (error: any) => {
    console.log("Error", error);
  };

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getCurrentSession();
      setUser(session);
    };
  
    fetchSession();
  }, []);
  
  useEffect(() => {
    if (editMode === "detail") {
      getProperty({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          reset({
            ...response?.data,
            amenities: response?.data?.amenities,
          });
        }
      });
    } else {
      reset({
        ...defaultValue,
      });
    }
  }, [params?.id, editMode, getProperty, reset]);

  return (
    <Box className="w-full p-4 flex-col space-y-4 buser">
      <Box className="px-4">
        <Button
          leftSection={<IconView360 size={12} />}
          variant="filled"
          radius={"xl"}
          className="w-max ml-auto  flex items-center gap-0.5 bg-primary-500 text-white"
          onClick={() => {
            navigate.push(`detail/${property?.data?.id}`);
          }}
        >
          View
        </Button>
      </Box>
      <form
        name="Property form"
        onSubmit={handleSubmit(onSubmit, onError)}
        autoComplete="off"
        className="w-full"
      >
        <Box className="flex w-full  justify-center">
          <Box className="px-2 w-full mt-4 flex-col space-y-4">
            <Flex gap={8}>
              <TextInput
                label="Country"
                className="w-full"
                required
                placeholder="Country"
                {...register("address.country")}
                error={errors?.address?.country?.message}
              />
              <TextInput
                label="City"
                className="w-full"
                required
                placeholder="City"
                {...register("address.city")}
                error={errors?.address?.city?.message}
              />
            </Flex>
            <Flex gap={8}>
              <TextInput
                label="Sub City"
                className="w-full"
                required
                placeholder="Sub City"
                {...register("address.subcity")}
                error={errors?.address?.subcity?.message}
              />
              <TextInput
                label="Woreda"
                className="w-full"
                required
                placeholder="Woreda"
                {...register("address.woreda")}
                error={errors?.address?.woreda?.message}
              />
            </Flex>
            <Flex gap={8}>
              <TextInput
                className="w-1/2"
                label="Kebele"
                required
                placeholder="Kebele"
                {...register("address.kebele")}
                error={errors?.address?.kebele?.message}
              />
              <Controller
                name="numberOfRooms"
                control={control}
                render={({ field: { name, value, onChange } }) => (
                  <NumberInput
                    className="w-1/2"
                    name={name}
                    label="Number of Rooms"
                    placeholder="Number of Rooms"
                    value={value}
                    onChange={onChange}
                    error={errors?.numberOfRooms?.message}
                    allowNegative={false}
                    withAsterisk
                  />
                )}
              />
            </Flex>
            <Flex gap={8}>
              <Controller
                name="size"
                control={control}
                render={({ field: { name, value, onChange } }) => (
                  <NumberInput
                    name={name}
                    label="Size in m2"
                    placeholder="Size in m2"
                    value={value}
                    className="w-1/2"
                    onChange={onChange}
                    error={errors?.size?.message}
                    suffix=" m2"
                    allowNegative={false}
                    withAsterisk
                  />
                )}
              />
              <Controller
                name="isFurnished"
                control={control}
                render={({ field: { name, value } }) => (
                  <Switch
                    className="mt-8"
                    name={name}
                    label="Is Furnished"
                    checked={value}
                    onChange={(event) =>
                      setValue("isFurnished", event.currentTarget.checked)
                    }
                  />
                )}
              />
            </Flex>
            <Flex gap={8}>
              <Box className="w-1/2">
                <Textarea
                  label="Description"
                  className="w-full"
                  required
                  minRows={6}
                  placeholder="Description"
                  {...register("description")}
                  error={errors?.description?.message}
                />
              </Box>
              <Box className="w-1/2">
                <TagsInput
                  label="Amenities"
                  className="w-full"
                  required
                  clearable
                  data={[]}
                  placeholder="Add amenities"
                  value={watch("amenities")}
                  {...register("amenities", { setValueAs: (v) => v || [] })}
                  error={errors?.amenities?.message}
                  onChange={(values) => setValue("amenities", values)}
                />
              </Box>
            </Flex>
            <Box className="w-full flex space-x-4  justify-end mt-4">
              <Button
                variant="default"
                className="bg-none"
                onClick={() => reset({ ...defaultValue })}
              >
                Reset
              </Button>
              {/* {property?.data?.deletedAt !== null && (  */}
              <Button
                variant="filled"
                // className="shadow-none bg-primary-500 rounded flex items-center"
                bg={"primary.4"}
                type="submit"
                loading={editMode === "new" ? creating : updating}
                leftSection={<IconDeviceFloppy />}
              >
                {editMode === "new" ? "Save" : "Update"}
              </Button>
              {/* )} */}
              {editMode === "detail" && (
                <>
                  <Modal
                    opened={opened}
                    onClose={close}
                    title="Reason"
                    centered
                    size={"50%"}
                  >
                    <ReasonForm
                      id={String(params.id)}
                      onClose={close}
                      type="property"
                    />{" "}
                  </Modal>
                  <Button
                    type="button"
                    variant="filled"
                    color="red"
                    className={`shadow-none bg-red-500 rounded flex items-center`}
                    onClick={() => {
                      setOpenDeleteModal(true);
                      setSelectedProperty(property?.data);
                    }}
                    loading={deleting}
                    leftSection={<IconTrash size={16} />}
                  >
                    {"Delete"}
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </form>
      <Modal
        opened={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        size={"40%"}
        title={"Delete Property"}
        centered
      >
        {property?.data?.deletedAt !== null ? (
          <Box>
            <h2 className="">
              Are you sure You want to delete{" "}
              <span className="underline text-xl">
                {selectedProperty?.description}{" "}
              </span>
            </h2>
            <Box className="flex my-4">
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
                loading={deleting}
                leftSection={<IconTrash />}
              >
                {"Delete"}
              </Button>
            </Box>
          </Box>
        ) : (
          <ReasonForm id={String(params.id)} onClose={close} type="property" />
        )}
      </Modal>
    </Box>
  );
}
