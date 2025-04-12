"use client";
// import { CustomRichTextEditorType } from "@/src/models/rich-text-editor.model";
// import CustomRichTextEditor from "@/src/shared/component/rich-text-editor/rich-text-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal, Switch, TextInput } from "@mantine/core";
import { IconArrowBack, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  useArchiveDocumentTypeMutation,
  useCreateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
  useLazyGetDocumentTypeQuery,
  useRestoreDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} from "../_store/document-type.query";
import { NewDocumentTypeSchema } from "@/app/schemas/new-document-type-schema";
import { DocumentType } from "@/app/models/document-type.model";

interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}
type FormSchema = z.infer<typeof NewDocumentTypeSchema>;
const defaultValue: DocumentType = {
  name: "",
  code: "",
  description: "",
  isMandatory: true,
  hasExpirationDate: true,
};

export default function NewDocumentTypeComponent({ editMode, onCreating }: Props) {
  const params = useParams();
  const navigate = useRouter();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>();

  const [getDocumentType, documentType] = useLazyGetDocumentTypeQuery();
  const [createDocumentType, createResponse] = useCreateDocumentTypeMutation();
  const [updateDocumentType, updateResponse] = useUpdateDocumentTypeMutation();
  const [deleteDocumentType, deleteResponse] = useDeleteDocumentTypeMutation();
  const [archiveDocumentType, archiveResponse] = useArchiveDocumentTypeMutation();
  const [restoreDocumentType, restoreResponse] = useRestoreDocumentTypeMutation();
  const [editorContent, setEditorContent] = useState("");

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
    resolver: zodResolver(NewDocumentTypeSchema),
    mode: "all",
  });
  // const config: CustomRichTextEditorType = {
  //   hasBold: true,
  //   hasItalic: true,
  //   hasUnderline: true,
  //   hasColor: true,
  //   hasStrikethrough: true,
  //   hasClearFormatting: true,
  //   hasHighlight: true,
  //   hasHeaders: true,
  //   hasBulletList: true,
  //   hasOrderedList: true,
  //   hasBlockquote: true,
  //   hasSeparator: true,
  //   hasTextAlign: true,
  //   hasTextStyle: true,
  //   hasUndo: true,
  //   hasLink: true,
  //   hasTable: false,
  //   hasFontFamily: true,
  //   hasFontSize: true
  // }

  useEffect(() => {
    if (editMode === "detail") {
      getDocumentType({ id: `${params?.id}` }).then((response: any) => {
        if (response?.data) {
          reset({ ...response?.data, description: response?.data?.description || "", });
          setEditorContent(response?.data?.description || "");
        }
      });
    } else {
      reset(defaultValue);
    }
  }, [params?.id, editMode]);

  function onSubmit(data: DocumentType) {
    if (editMode === "new") {
      createDocumentType(data).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          navigate.push(`/document-types/detail/${response?.data?.id}`);
        }
      });
    } else {
      updateDocumentType({ ...data, id: `${params?.id}` }).then((response: any) => {
        if (response?.data) {
          navigate.push(`/document-types/detail/${response?.data?.id}`);
        }
      });
    }
  }

  function handleDelete() {
    selectedDocumentType?.archivedAt
      ? restoreDocumentType({ id: `${selectedDocumentType?.id}` }).then(() => setOpenDeleteModal(false))
      : deleteDocumentType(`${selectedDocumentType?.id}`).then(() => {
        setOpenDeleteModal(false);
        navigate.push(`/document-types`);
      });
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };
  const isMandatory = watch("isMandatory");
  const hasExpirationDate = watch("hasExpirationDate");
  const desc = watch("description");
  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <div className="flex px-4 buser-0 buser-b-2 items-center justify-center">
        <h3 className="text-2xl font-semibold">
          {editMode === "detail" ? "" : "New Document Type"}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay visible={documentType?.isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        <form onSubmit={handleSubmit(onSubmit, onError)} autoComplete="off" className="w-full">
          <div className="flex w-full justify-center">
            <div className="px-2 w-4/5 mt-4 flex-col space-y-4">
              <div className="flex space-x-4 mt-4">
                <TextInput label="Document Type Name" placeholder="Enter name" {...register("name")} error={errors?.name?.message} className="w-full" />
                <TextInput label="Code" placeholder="Enter code" {...register("code")} error={errors?.code?.message} className="w-full" />
              </div>
              <div className="flex space-x-4 mt-4">
                {/* <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <CustomRichTextEditor
                      label="Department description"
                      {...field}
                      value={desc}
                      // onChange={(value) => {
                      //   setEditorContent(value);
                      //   field.onChange(value);
                      // }}
                      placeholder="Write something..."
                      config={config}
                      error={errors.description?.message}
                    />
                  )}
                /> */}
              </div>
              <div className="flex space-x-4 mt-4">
                <Switch
                  label="Is Mandatory"
                  className="w-full"
                  checked={isMandatory} // Use the watched value
                  onChange={(e) => {
                    setValue("isMandatory", e.currentTarget.checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
                <Switch
                  label="Has Expiration"
                  className="w-full"
                  checked={hasExpirationDate}
                  onChange={(e) => {
                    setValue("hasExpirationDate", e.currentTarget.checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              </div>
              <div className="w-full flex space-x-4 justify-end mt-4">
                <Button variant="default" onClick={() => reset(defaultValue)} className="bg-none">Reset</Button>
                {editMode === "detail" && (
                  <div>
                    <Button
                      type="button"
                      variant="filled"
                      color="red"
                      className={`shadow-none bg-red-500 rounded flex items-center`}
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setSelectedDocumentType(documentType?.data);
                      }}
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      leftSection={
                        documentType?.data?.archivedAt ? (
                          <IconArrowBack size={15} />
                        ) : (
                          <IconTrash size={15} />
                        )
                      }
                    >
                      {documentType?.data?.archivedAt ? "Restore" : "Delete"}
                    </Button>
                  </div>
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
      <Modal
        opened={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false);
        }}
        size={"40%"}
        title={"Delete DocumentType"}
        centered
      >
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{selectedDocumentType?.name} </span>
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
              selectedDocumentType?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedDocumentType?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
