'use client';
import countryJson from '../../../constants/constant/countryJson';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Flex,
  Group,
  Input,
  Select,
  TextInput,
} from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import ReactInputMask from 'react-input-mask';
import z from 'zod';
import {
  useCreateEmergencyContactMutation,
  useLazyGetEmergencyContactQuery,
  useUpdateEmergencyContactMutation,
} from '../_store/emergency-contact.query';
import {
  EmergencyContact,
  UserContactType,
} from '@/app/models/emergency-contact.model';
import { NewEmergencyContactSchema } from '@/app/schemas/new-emergency-contact-schema';

interface Props {
  editMode: 'new' | 'detail' | 'view';
  onClose: () => void;
  onCreating?: (data: any) => void;
  data?: EmergencyContact;
}
const countryCodes = countryJson.map((country: any) => {
  return { value: country.code, label: country.name, key: country.code };
});

type FormSchema = z.infer<typeof NewEmergencyContactSchema>;

const defaultValue: FormSchema = {
  firstName: '',
  middleName: '',
  lastName: '',
  phone: '',
  email: '',
  userId: '',
  contactType: UserContactType.EMERGENCY,
  address: {
    country: '',
    city: '',
    subcity: '',
    woreda: '',
    kebele: '',
  },
};

export default function EmergencyContactForm(props: Props) {
  const { editMode } = props;
  const params = useParams();
  const navigate = useRouter();

  const [getEmergencyContact, contact] = useLazyGetEmergencyContactQuery();
  const [createEmergencyContact, { isLoading: creating, isSuccess: created }] =
    useCreateEmergencyContactMutation();
  const [updateEmergencyContact, { isLoading: updating }] =
    useUpdateEmergencyContactMutation();
  const [countryCode, setCountryCode] = useState<string>('+251');
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormSchema>({
    resolver: zodResolver(NewEmergencyContactSchema),
    mode: 'all',
  });

  const onSubmit: SubmitHandler<EmergencyContact> = async (data) => {
    console.log(data, 'data');
    if (editMode === 'new') {
      try {
        const response = await createEmergencyContact({
          ...data,
          userId: String(params.id),
        }).unwrap();
        console.log(response, 'response');
        if (response) {
          props.onClose();
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        const response = await updateEmergencyContact({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          props.onClose();
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const onError = (error: any) => {
    console.log('Error', error);
  };

  useEffect(() => {
    if (editMode === 'detail') {
      if (contact?.data) {
        reset({ ...contact.data });
      } else if (props.data) {
        console.log(props.data);
        reset({ ...props.data });
      } else {
        reset({ ...defaultValue });
      }
    }
  }, [props.data, contact, editMode, reset]);

  return (
    <Box>
      {props?.editMode !== 'view' ? (
        <Box className="w-full p-4 flex-col space-y-4 buser">
          <form
            name="EmergencyContact form"
            onSubmit={handleSubmit(onSubmit, onError)}
            autoComplete="off"
            className="w-full"
          >
            <Box className="flex w-full  justify-center">
              <Group mt="xl"></Group>
              <Box className="px-2 w-full mt-4 flex-col space-y-4">
                <Flex gap={8}>
                  <TextInput
                    label="First Name"
                    className="w-full"
                    required
                    placeholder="First Name"
                    {...register('firstName')}
                    error={errors?.firstName?.message}
                  />
                  <TextInput
                    label="Middle Name"
                    className="w-full"
                    required
                    placeholder="Middle Name"
                    {...register('middleName')}
                    error={errors?.middleName?.message}
                  />
                </Flex>
                <Flex gap={8}>
                  <TextInput
                    label="Last Name"
                    className="w-full"
                    placeholder="Last Name"
                    {...register('lastName')}
                    error={errors?.lastName?.message}
                  />
                  <Select
                    label="Contact Type"
                    className="w-full"
                    value={watch('contactType')}
                    onChange={(value) =>
                      setValue('contactType', value as UserContactType)
                    }
                    data={[
                      { value: UserContactType.BAIL, label: 'Bail' },
                      { value: UserContactType.EMERGENCY, label: 'Emergency' },
                      { value: UserContactType.FAMILY, label: 'Family' },
                      { value: UserContactType.FRIEND, label: 'Friend' },
                      { value: UserContactType.OTHER, label: 'Other' },
                    ]}
                    error={errors?.contactType?.message}
                  />
                </Flex>
                <Flex gap={8}>
                  <div className="flex w-full">
                    <Select
                      radius={'xs'}
                      searchable
                      onChange={(code) => {
                        if (
                          code &&
                          countryJson.find((item: any) => item.code === code)
                        ) {
                          setCountryCode(
                            countryJson.find((item: any) => item.code === code)
                              ?.dial_code ?? '+251',
                          );
                        }
                      }}
                      classNames={{
                        input:
                          'border border-gray-400/70 border-r-0 rounded rounded-r-none',
                      }}
                      value={
                        countryJson.find(
                          (item: any) => item.dial_code === countryCode,
                        )?.code ?? 'ET'
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
                        classNames={{ input: 'rounded-l-none' }}
                        component={ReactInputMask}
                        mask={`${countryCode} 999 999 999`}
                        value={watch('phone')}
                        placeholder="Phone number"
                        {...register('phone')}
                      />
                    </Input.Wrapper>
                  </div>
                </Flex>
                <Flex gap={8}>
                  <TextInput
                    type="email"
                    label="Email"
                    required
                    className="w-full"
                    placeholder="Email"
                    {...register('email')}
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
                </Flex>
                <Flex gap={8}>
                  <TextInput
                    label="City"
                    className="w-full"
                    required
                    placeholder="Enter City"
                    {...register('address.city')}
                    error={errors?.address?.city?.message}
                  />
                  <TextInput
                    label="Subcity"
                    className="w-full"
                    required
                    placeholder="Enter Subcity"
                    {...register('address.subcity')}
                    error={errors?.address?.subcity?.message}
                  />
                </Flex>
                <Flex gap={8}>
                  <TextInput
                    label="Woreda"
                    className="w-full"
                    required
                    placeholder="Enter Woreda"
                    {...register('address.woreda')}
                    error={errors?.address?.woreda?.message}
                  />
                  <TextInput
                    label="Kebele"
                    className="w-full"
                    required
                    placeholder="Enter Kebele"
                    {...register('address.kebele')}
                    error={errors?.address?.kebele?.message}
                  />
                </Flex>
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
                    // className="shadow-none bg-primary-500 rounded flex items-center"
                    bg={'primary.4'}
                    type="submit"
                    loading={editMode === 'new' ? creating : updating}
                    leftSection={<IconDeviceFloppy />}
                  >
                    {editMode === 'new' ? 'Save' : 'Update'}
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
              {'Contact Name'}
            </td>
            <td className="p-2">
              {props?.data?.firstName} {props?.data?.middleName}{' '}
              {props?.data?.lastName}
            </td>
          </tr>
          <tr className="flex border-b border-dashed">
            <td className="w-1/3 p-2 bg-gray-100 text-gray-900 border-r">
              {'Phone Number'}
            </td>
            <td className="p-2">{props.data?.phone}</td>
          </tr>
        </Box>
      )}
    </Box>
  );
}
