'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Flex, NumberInput, Select } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconView360 } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useLazyGetTenantsQuery } from '../../../bank-accounts/_store/bank-account.query';
import { useLazyGetPropertiesQuery } from '../../../property/_store/property.query';
import { useLazyGetRoomsQuery } from '../../../property/_store/room.query';
import {
  useCreateLeaseMutation,
  useLazyGetLeaseQuery,
  useUpdateLeaseMutation,
} from '../../_store/lease.query';
import { CollectionQuery } from '@pms/entity';
import { LeaseDefaultValues, LeaseFormSchema, LeaseSchema } from '../../../../schemas/lease-schema';
import { Lease } from '../../../../models/lease.model';

interface Props {
  editMode: 'new' | 'detail';
  onCreating?: (data: any) => void;
}

export default function NewLeaseComponent({ editMode }: Props) {
  const params = useParams();
  const navigate = useRouter();

  const [getLease, lease] = useLazyGetLeaseQuery();
  const [getProperties, { data: properties }] = useLazyGetPropertiesQuery();
  const [getRooms, { data: rooms }] = useLazyGetRoomsQuery();
  const [getTenants, { data: tenants }] = useLazyGetTenantsQuery();
  const [createLease, { isLoading: creating }] = useCreateLeaseMutation();
  const [updateLease, { isLoading: updating }] = useUpdateLeaseMutation();

  const collection: CollectionQuery = useMemo(
    () => ({
      skip: 0,
      top: 20,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeaseFormSchema>({
    resolver: zodResolver(LeaseSchema),
    mode: 'all',
    defaultValues: LeaseDefaultValues,
  });

  useEffect(() => {
    if (editMode === 'detail') {
      getLease({ id: `${params?.id}` }).then((response) => {
        if (response?.data) {
          reset({
            ...response.data,
            roomId: response.data?.room?.description,
            startDate: new Date(response.data.startDate),
            endDate: new Date(response.data.endDate),
          });
        }
      });
    } else {
      reset(LeaseDefaultValues);
    }
  }, [params?.id, editMode]);

  useEffect(() => {
    getProperties({ id: `${params?.id}` });
    if (params.id) {
      getRooms({
        ...collection,
        filter: [[{ field: 'propertyId', value: params.id, operator: '=' }]],
      });
    }
  }, [params.id, collection]);

  useEffect(() => {
    getTenants(collection);
  }, [collection, getTenants]);

  const onSubmit: SubmitHandler<Lease> = async (data) => {
    console.log(data, 'data');
    if (editMode === 'new') {
      try {
        const response = await createLease(data).unwrap();

        if (response) {
          notifications.show({
            title: 'Success',
            message: 'Lease created successfully',
            color: 'green',
          });
          navigate.push(`/lease/${response?.id}`);
        }
      } catch (err) {
        notifications.show({
          title: 'Error',
          message: 'Sorry Lease Not created successfully',
          color: 'red',
        });
      }
    } else {
      try {
        const response = await updateLease({
          ...data,
          id: `${params?.id}`,
        });
        if (response) {
          notifications.show({
            title: 'Success',
            message: 'Lease Updated successfully',
            color: 'green',
          });
        }
      } catch (err) {
        notifications.show({
          title: 'Error',
          message: 'Sorry Lease not updated successfully',
          color: 'red',
        });
      }
    }
  };

  return (
    <Box className="w-full p-4 flex-col space-y-4">
      <Box className="px-4">
        <Button
          leftSection={<IconView360 size={12} />}
          variant="filled"
          radius={'xl'}
          className="w-max ml-auto  flex items-center gap-0.5 bg-primary-500 text-white"
          onClick={() => {
            navigate.push(`detail/${lease?.data?.id}`);
          }}
        >
          View
        </Button>
      </Box>
      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="w-full"
      >
        <Flex direction="column" gap={16}>
          <Flex gap={8}>
            <Controller
              name="propertyId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Property"
                  placeholder="Select Property"
                  data={
                    properties?.data?.map((p) => ({
                      label: p.description || '',
                      value: p.id || '',
                    })) || []
                  }
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.propertyId?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    setValue('roomId', String(lease.data?.roomId));
                    if (value) {
                      getRooms({
                        ...collection,
                        filter: [
                          [{ field: 'propertyId', value, operator: '=' }],
                        ],
                      });
                    }
                  }}
                />
              )}
            />
            <Controller
              name="roomId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Room"
                  placeholder="Select Room"
                  value={watch('roomId')}
                  data={
                    rooms?.data?.map((p) => ({
                      label: p.description || '',
                      value: p.id || '',
                    })) || []
                  }
                  className="w-1/2"
                  withAsterisk
                  searchable
                  disabled={!watch('propertyId')}
                  error={errors?.roomId?.message}
                />
              )}
            />
          </Flex>
          <Flex gap={8}>
            <Controller
              name="contractorId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  withCheckIcon={false}
                  label="Contractor"
                  placeholder="Select Contractor"
                  data={
                    tenants?.data?.map((p) => ({
                      label: p.name || '',
                      value: p.id || '',
                    })) || []
                  }
                  className="w-1/2"
                  withAsterisk
                  searchable
                  error={errors?.contractorId?.message}
                />
              )}
            />
            <Controller
              name="monthlyRent"
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  className="w-1/2"
                  label="Monthly Rent"
                  placeholder="Enter monthly rent"
                  error={errors?.monthlyRent?.message}
                  withAsterisk
                />
              )}
            />
          </Flex>
          <Flex gap={8}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  className="w-1/2"
                  label="Start Date"
                  error={errors?.startDate?.message?.toString() || ''}
                  required
                />
              )}
            />
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DateInput
                  {...field}
                  className="w-1/2"
                  label="End Date"
                  error={errors?.endDate?.message?.toString() || ''}
                  required
                />
              )}
            />
          </Flex>
          <Flex justify="flex-end" gap={8}>
            <Button variant="default" onClick={() => reset(LeaseDefaultValues)}>
              Reset
            </Button>
            <Button
              type="submit"
              variant="filled"
              bg="primary.4"
              loading={editMode === 'new' ? creating : updating}
              leftSection={<IconDeviceFloppy />}
            >
              {editMode === 'new' ? 'Save' : 'Update'}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Box>
  );
}
