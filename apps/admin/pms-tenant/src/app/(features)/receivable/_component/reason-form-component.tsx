"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Group, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArchive } from "@tabler/icons-react";
import { useParams, useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { useArchiveReceivableMutation } from "../_store/receivable.query";

interface Props {
  onClose: () => void;
  onCreating?: (data: any) => void;
  id?: string;
}

const reasonSchema = z.object({
  reason: z.string().optional(),
});

// Infer TypeScript type
type FormSchema = z.infer<typeof reasonSchema>;

// Default Values
const defaultValue: FormSchema = {
  reason: "",
};
export default function ReasonForm(props: Props) {
  const params = useParams();
  const navigate = useRouter();

  const [archiveReceivable, { isLoading: archivingReceivable }] =
    useArchiveReceivableMutation();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormSchema>({
    resolver: zodResolver(reasonSchema),
    mode: "all",
  });

  const onSubmit: SubmitHandler<any> = async (data) => {
    try {
      const response = await archiveReceivable({
        ...data,
        id: props.id?.toString(),
      }).unwrap();

      if (response) {
        props.onClose();
        notifications.show({
          title: "Success",
          message: "Successfully archived",
          color: "green",
        });
      }
    } catch (err) {}
  };

  const onError = (error: any) => {};

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
            <Box>
              <Textarea
                required
                minRows={8}
                placeholder="Reason"
                {...register("reason")}
                error={errors?.reason?.message}
              />
            </Box>
            <Box className="w-full flex space-x-4  justify-end mt-4">
              <Button
                variant="default"
                className="bg-none"
                onClick={() => reset({ ...defaultValue })}
              >
                Reset
              </Button>
              <Button
                variant="filled"
                className="shadow-none bg-[#F59E0B] rounded flex items-center"
                bg={"primary.4"}
                type="submit"
                loading={archivingReceivable}
                leftSection={<IconArchive />}
              >
                {"Archive"}
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
