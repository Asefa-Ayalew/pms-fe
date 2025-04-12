"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  FileInput,
  Flex,
  Group,
  Select,
  Textarea,
  TextInput,
} from "@mantine/core";
import { IconDeviceFloppy, IconUpload } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useLazyGetDocumentTypesQuery } from "../../../document-types/_store/document-type.query";
import { useCreateDocumentMutation } from "../../_store/lease.query";
import { LeaseDocument } from "@/app/models/lease.model";
import { useLazyGetTenantsQuery } from "@/app/(features)/tenant/_store/tenant.query";
import { CollectionQuery } from "@pms/entity";
import { leaseDocumentDefaultValues, leaseDocumentFormSchema, leaseDocumentSchema } from "@/app/schemas/lease-schema";

interface Props {
  editMode: "new" | "detail" | "view";
  onClose: () => void;
  onCreating?: (data: any) => void;
  data?: LeaseDocument;
}

export default function LeaseDocumentForm(props: Props) {
  const { editMode } = props;
  const params = useParams();
  const navigate = useRouter();

  const [getTenants, { data: tenants, isLoading: tenantsLoading }] =
    useLazyGetTenantsQuery();
  const [getDocumentTypes, { data: documentTypes }] =
    useLazyGetDocumentTypesQuery();
  const [createLeaseDocument, { isLoading: creating, isSuccess: created }] =
    useCreateDocumentMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<leaseDocumentFormSchema>({
    resolver: zodResolver(leaseDocumentSchema),
    mode: "all",
  });

  useEffect(() => {
    getTenants(collection);
  }, [collection, getTenants]);

  useEffect(() => {
    getDocumentTypes(collection);
  }, [collection, getDocumentTypes]);

  const onSubmit: SubmitHandler<LeaseDocument> = async (data) => {
    try {
      const formData = new FormData();
      // Append form fields
      formData.append(
        "leaseId",
        Array.isArray(params.id) ? params.id[0] : params.id
      );
      formData.append("tenantId", data.tenantId);
      formData.append("documentTypeId", data.documentTypeId);
      formData.append("reference", data.reference);
      formData.append("description", data.description);

      if (selectedFile) {
        formData.append("document", selectedFile);
      }
      const response = await createLeaseDocument(formData).unwrap();

      if (response) {
        props.onClose();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onError = (error: any) => {
    console.log("Error", error);
  };

  return (
    <Box>
      {props?.editMode !== "view" ? (
        <Box className="w-full p-4 flex-col space-y-4 buser">
          <form
            name="Lease Document form"
            onSubmit={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <Box className="flex w-full  justify-center">
              <Group mt="xl"></Group>
              <Box className="px-2 w-full mt-4 flex-col space-y-4">
                <Flex gap={8}>
                  <Controller
                    name="tenantId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        withCheckIcon={false}
                        label="Property"
                        placeholder="Select Property"
                        data={
                          tenants?.data?.map((tenant) => ({
                            label: tenant.name || "",
                            value: tenant.id || "",
                          })) || []
                        }
                        className="w-1/2"
                        withAsterisk
                        searchable
                        error={errors?.tenantId?.message}
                      />
                    )}
                  />
                  <Controller
                    name="documentTypeId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        withCheckIcon={false}
                        label="Document Type"
                        placeholder="Select Document Type"
                        data={
                          documentTypes?.data?.map((docType) => ({
                            label: docType.name || "",
                            value: docType.id || "",
                          })) || []
                        }
                        className="w-1/2"
                        withAsterisk
                        searchable
                        error={errors?.documentTypeId?.message}
                      />
                    )}
                  />
                </Flex>
                <Flex gap={8}>
                  <TextInput
                    label="Reference"
                    className="w-1/2"
                    required
                    placeholder="Reference"
                    {...register("reference")}
                    error={errors?.reference?.message}
                  />
                  <Textarea
                    label="Description"
                    className="w-1/2"
                    required
                    minRows={6}
                    placeholder="Description"
                    {...register("description")}
                    error={errors?.description?.message}
                  />
                </Flex>
                <FileInput
                  label="Attachment"
                  placeholder="Upload file"
                  accept="application/pdf,image/*"
                  leftSection={<IconUpload />}
                  className="w-full"
                  onChange={setSelectedFile}
                />

                <Box className="w-full flex space-x-4  justify-end mt-4">
                  <Button
                    variant="default"
                    className="bg-none"
                    onClick={() => reset({ ...leaseDocumentDefaultValues })}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="filled"
                    // className="shadow-none bg-primary-500 rounded flex items-center"
                    bg={"primary.4"}
                    type="submit"
                    loading={creating}
                    leftSection={<IconDeviceFloppy />}
                  >
                    {editMode === "new" ? "Save" : "Update"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </form>
        </Box>
      ) : (
        <Box className="w-full">
          <tr className="flex border-t border-b border-dashed">
            <td className="w-1/3 p-2 bg-gray-100 text-gray-900 border-r">
              {"Description"}
            </td>
            <td className="p-2">{props?.data?.description}</td>
          </tr>
          <tr className="flex border-b border-dashed">
            <td className="w-1/3 p-2 bg-gray-100 text-gray-900 border-r">
              {"Reference"}
            </td>
            <td className="p-2">{props.data?.reference}</td>
          </tr>
        </Box>
      )}
    </Box>
  );
}
