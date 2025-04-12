"use client";
import countryJson from "../../../constants/country-json.json";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal, TextInput } from "@mantine/core";
import { IconArrowBack, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import {
  useArchiveExpenseTypeMutation,
  useCreateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
  useLazyGetExpenseTypeQuery,
  useRestoreExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
} from "../_store/expense-type.query";
import { NewExpenseTypeSchema } from "@/app/schemas/new-expense-type-schema";
import { ExpenseType } from "@/app/models/expense-type.model";

interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}



type FormSchema = z.infer<typeof NewExpenseTypeSchema>;

const defaultValue: ExpenseType = {
  name: "",
  description: "",
  code: "",
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

export default function NewExpenseTypeComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<ExpenseType>();
  const [countryCode, setCountryCode] = useState<string>("+251");

  const [getExpenseType, expenseType] = useLazyGetExpenseTypeQuery();
  const [createExpenseType, createResponse] = useCreateExpenseTypeMutation();
  const [updateExpenseType, updateResponse] = useUpdateExpenseTypeMutation();
  const [archiveExpenseType, archiveResponse] = useArchiveExpenseTypeMutation();
  const [restoreExpenseType, restoreResponse] = useRestoreExpenseTypeMutation();
  const [deleteExpenseType, deleteResponse] = useDeleteExpenseTypeMutation();
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
    resolver: zodResolver(NewExpenseTypeSchema),
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
  function onSubmit(data: ExpenseType) {
    if (editMode === "new") {
      createExpenseType({
        ...data,
      }).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate.push(`/expense-types/detail/${response?.data?.id}`);
          }
        }
      });
    } else {
      const updatedData = {
        ...data,
        id: `${params?.id}`,
      };

      updateExpenseType(updatedData).then(async (response: any) => {
        if (response?.data) {
          // do some logics here
          navigate.push(`/expense-types/detail/${response?.data?.id}`);
        }
      });
    }
  }

  function handleDelete() {
    selectedExpenseType?.archivedAt
      ? restoreExpenseType({ id: `${selectedExpenseType?.id}` }).then((response: any) => {
        if (response?.data) {
          setOpenDeleteModal(false);
        }
      })
      : deleteExpenseType(`${selectedExpenseType?.id}`)
        .then((response: any) => {
          if (response?.data) {
            setOpenDeleteModal(false);
          }
        })
        .finally(() => {
          setOpenDeleteModal(false);
          navigate.push(`/expense-types`);
        });
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };
  const desc = watch("description");
  useEffect(() => {
    if (editMode === "detail") {
      getExpenseType({
        id: `${params?.id}`,
      }).then((response: any) => {
        if (response?.data) {
          reset({ ...response?.data, description: response?.data?.description || "", });
          setEditorContent(response?.data?.description || "");
        }
      });
    } else {
      reset({
        ...defaultValue,
      });
    }
  }, [params?.id, editMode]);

  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <div className="flex px-4 buser-0 buser-b-2">
        <h3 className="text-2xl font-semibold">
          {editMode === "detail"
            ? `${expenseType?.data?.name ?? ""}`
            : "New ExpenseType"}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={
            expenseType?.isLoading ||
            expenseType?.isFetching
          }
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form
          name="ExpenseType form"
          onSubmit={handleSubmit(onSubmit, onError)}
          autoComplete="off"
          className="w-full"
        >
          <div className="md:flex sm:flex-row w-full  justify-center">
            <div className="px-2 w-4/5 mt-4 flex-col space-y-4">
              <div className="md:flex sm:flex-row md:space-x-4 mt-4">
                <TextInput
                  label="Expense Type Name"
                  className="w-full"
                  required
                  placeholder="Expense Type Name"
                  {...register("name")}
                  error={errors?.name?.message}
                />
                <TextInput
                  label="Expense Type Code"
                  className="w-full"
                  required
                  placeholder="Expense Type Code"
                  {...register("code")}
                  error={errors?.code?.message}
                />
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

              <div className="w-full flex space-x-4  justify-end mt-4">
                <Button
                  variant="default"
                  className="bg-none"
                  onClick={() =>
                    reset({
                      ...defaultValue
                    })
                  }
                >
                  Reset
                </Button>
                {editMode === "detail" && (
                  <div>
                    <Button
                      type="button"
                      variant="filled"
                      color="red"
                      className={`shadow-none bg-red-500 rounded flex items-center`}
                      onClick={() => {
                        setOpenDeleteModal(true);
                        setSelectedExpenseType(expenseType?.data);
                      }}
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      leftSection={
                        expenseType?.data?.archivedAt ? (
                          <IconArrowBack size={15} />
                        ) : (
                          <IconTrash size={15} />
                        )
                      }
                    >
                      {expenseType?.data?.archivedAt ? "Restore" : "Delete"}
                    </Button>
                  </div>
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
        title={"Delete ExpenseType"}
        centered
      >
        {/* Modal content */}
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{selectedExpenseType?.name} </span>
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
              selectedExpenseType?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedExpenseType?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
