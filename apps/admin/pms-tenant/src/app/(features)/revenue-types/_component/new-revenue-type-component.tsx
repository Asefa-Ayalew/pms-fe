// import CustomRichTextEditor from "@/src/shared/component/rich-text-editor/rich-text-editor";
import countryJson from "../../../constants/country-json.json";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, LoadingOverlay, Modal, Switch, TextInput } from "@mantine/core";
import { IconArrowBack, IconDeviceFloppy, IconTrash } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  useArchiveRevenueTypeMutation,
  useCreateRevenueTypeMutation,
  useDeleteRevenueTypeMutation,
  useLazyGetRevenueTypeQuery,
  useRestoreRevenueTypeMutation,
  useUpdateRevenueTypeMutation,
} from "../_store/revenue-type.query";
import { NewRevenueTypeSchema } from "../../../schemas/new-revenue-type-schema";
import { RevenueType } from "../../../models/revenue-type.model";


interface Props {
  editMode: "new" | "detail";
  onCreating?: (data: any) => void;
}

type FormSchema = z.infer<typeof NewRevenueTypeSchema>;

const defaultValue: RevenueType = {
  name: "",
  code: "",
  description: "",
  isActive: true,
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

export default function NewRevenueTypeComponent(props: Props) {
  const { editMode, onCreating } = props;
  const params = useParams();
  const navigate = useRouter();

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRevenueType, setSelectedRevenueType] = useState<RevenueType>();
  const [countryCode, setCountryCode] = useState<string>("+251");

  const [getRevenueType, revenueType] = useLazyGetRevenueTypeQuery();
  const [createRevenueType, createResponse] = useCreateRevenueTypeMutation();
  const [updateRevenueType, updateResponse] = useUpdateRevenueTypeMutation();
  const [archiveRevenueType, archiveResponse] = useArchiveRevenueTypeMutation();
  const [restoreRevenueType, restoreResponse] = useRestoreRevenueTypeMutation();
  const [deleteRevenueType, deleteResponse] = useDeleteRevenueTypeMutation();
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
    resolver: zodResolver(NewRevenueTypeSchema),
    mode: "all",
    defaultValues: defaultValue, // Set default values here
  });

  const isActive = watch("isActive"); // Watch the `isActive` field

  function onSubmit(data: RevenueType) {
    if (editMode === "new") {
      createRevenueType({
        ...data,
      }).then((response: any) => {
        if (response?.data) {
          onCreating?.(false);
          if (!onCreating) {
            navigate.push(`/revenue-types/detail/${response?.data?.id}`);
          }
        }
      });
    } else {
      const updatedData = {
        ...data,
        id: `${params?.id}`,
      };

      updateRevenueType(updatedData).then(async (response: any) => {
        if (response?.data) {
          navigate.push(`/revenue-types/detail/${response?.data?.id}`);
        }
      });
    }
  }

  function handleDelete() {
    selectedRevenueType?.archivedAt
      ? restoreRevenueType({ id: `${selectedRevenueType?.id}` }).then((response: any) => {
        if (response?.data) {
          setOpenDeleteModal(false);
        }
      })
      : deleteRevenueType(`${selectedRevenueType?.id}`)
        .then((response: any) => {
          if (response?.data) {
            setOpenDeleteModal(false);
          }
        })
        .finally(() => {
          setOpenDeleteModal(false);
          navigate.push(`/revenue-type`);
        });
  }

  const onError = (error: any) => {
    console.log("Error", error);
  };
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
      getRevenueType({
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
  const desc = watch("description");
  return (
    <div className="w-full p-4 flex-col space-y-4 buser">
      <div className="flex px-4 buser-0 buser-b-2">
        <h3 className="text-2xl font-semibold">
          {editMode === "detail"
            ? `${revenueType?.data?.name ?? ""}`
            : "New RevenueType"}
        </h3>
      </div>
      <div className="w-full flex justify-center relative">
        <LoadingOverlay
          visible={
            revenueType?.isLoading ||
            revenueType?.isFetching
          }
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <form
          name="RevenueType form"
          onSubmit={handleSubmit(onSubmit, onError)}
          autoComplete="off"
          className="w-full"
        >
          <div className="flex w-full  justify-center">
            <div className="px-2 w-4/5 mt-4 flex-col space-y-4">
              <div className="flex space-x-4 mt-4">
                <TextInput
                  label="Revenue Type Name"
                  className="w-full"
                  required
                  placeholder="Revenue Type Name"
                  {...register("name")}
                  error={errors?.name?.message}
                />
                <TextInput
                  label="Revenue Type Code"
                  className="w-full"
                  required
                  placeholder="Revenue Type Code"
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

              <div className="flex mt-4">
                <label className="mr-4">Is Active:</label>
                <Switch
                  checked={isActive} // Use the watched value
                  onChange={(e) => {
                    setValue("isActive", e.currentTarget.checked, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              </div>

              <div className="w-full flex space-x-4 justify-end mt-4">
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
                        setSelectedRevenueType(revenueType?.data);
                      }}
                      loading={
                        archiveResponse?.isLoading || restoreResponse?.isLoading
                      }
                      leftSection={
                        revenueType?.data?.archivedAt ? (
                          <IconArrowBack size={15} />
                        ) : (
                          <IconTrash size={15} />
                        )
                      }
                    >
                      {revenueType?.data?.archivedAt ? "Restore" : "Delete"}
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
        title={"Delete RevenueType"}
        centered
      >
        <h2 className="">
          Are you sure You want to delete{" "}
          <span className="underline text-xl">{selectedRevenueType?.name} </span>
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
              selectedRevenueType?.archivedAt ? (
                <IconArrowBack size={15} />
              ) : (
                <IconTrash size={15} />
              )
            }
          >
            {selectedRevenueType?.archivedAt ? "Restore" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}