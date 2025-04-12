import { notifications } from '@mantine/notifications';
import { RECEIVABLE_ENDPOINT } from './receivable.endpoint';
import {
  appApi,
  Collection,
  CollectionQuery,
  collectionQueryBuilder,
} from '@pms/entity';
import { Receivable } from '@/app/models/receivable.model';

let receivableCollection: CollectionQuery;

export const receivableQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceivable: builder.query<Receivable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${RECEIVABLE_ENDPOINT.detail}/${data?.id}`,
        method: 'GET',
        params: collectionQueryBuilder(data),
      }),
    }),

    getReceivables: builder.query<Collection<Receivable>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: RECEIVABLE_ENDPOINT.list,
        method: 'GET',
        params: collectionQueryBuilder(data),
      }),
      providesTags: ['Receivables'],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            receivableCollection = param;
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message || 'Error, try again',
            color: 'red',
          });
        }
      },
    }),

    createReceivable: builder.mutation<Receivable, Receivable>({
      query: (newData: any) => ({
        url: `${RECEIVABLE_ENDPOINT.create}`,
        method: 'POST',
        data: newData,
      }),
      invalidatesTags: ['Receivables'],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notifications.show({
              title: 'Success',
              message: 'Successfully created',
              color: 'green',
            });

            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivables',
                receivableCollection,
                (draft) => {
                  if (data) {
                    draft.data.push(data);
                    draft.count += 1;
                  }
                },
              ),
            );
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message || 'Error, try again',
            color: 'red',
          });
        }
      },
    }),

    updateReceivable: builder.mutation<Receivable, Receivable>({
      query: (newData: Receivable) => ({
        url: `${RECEIVABLE_ENDPOINT.update}`,
        method: 'PUT',
        data: newData,
      }),
      invalidatesTags: ['ReceivableInfo'],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivables',
                receivableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((item) =>
                      item.id === data.id ? data : item,
                    );
                  }
                },
              ),
            );

            notifications.show({
              title: 'Success',
              message: 'Successfully updated',
              color: 'green',
            });
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message || 'Error, try again',
            color: 'red',
          });
        }
      },
    }),
    archiveReceivable: builder.mutation<Receivable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${RECEIVABLE_ENDPOINT.archive}/${data?.id}`,
        method: 'DELETE',
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivables',
                receivableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((receivable) => {
                      if (receivable.id === data.id) return data;
                      else {
                        return receivable;
                      }
                    });
                  }
                },
              ),
            );
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivable',
                param,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                },
              ),
            );
            notifications.show({
              title: 'Success',
              message: 'Successfully archived',
              color: 'green',
            });
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : 'Error try again',
            color: 'red',
          });
        }
      },
    }),
    restoreReceivable: builder.mutation<Receivable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${RECEIVABLE_ENDPOINT.restore}/${data?.id}`,
        method: 'POST',
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivables',
                receivableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((receivable) => {
                      if (receivable.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return receivable;
                      }
                    });
                  }
                },
              ),
            );
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivable',
                param,
                (draft) => {
                  if (data) {
                    draft.archivedAt = new Date
                  }
                },
              ),
            );
            notifications.show({
              title: 'Success',
              message: 'Successfully restored',
              color: 'green',
            });
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : 'Error try again',
            color: 'red',
          });
        }
      },
    }),
    deleteReceivable: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${RECEIVABLE_ENDPOINT.delete}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Receivables'],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              receivableQuery.util.updateQueryData(
                'getReceivables',
                receivableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (item) => item.id?.toString() !== id,
                    );
                    draft.count -= 1;
                  }
                },
              ),
            );

            notifications.show({
              title: 'Success',
              message: 'Successfully deleted',
              color: 'green',
            });
          }
        } catch (error: any) {
          notifications.show({
            title: 'Error',
            message: error?.error?.data?.message || 'Error, try again',
            color: 'red',
          });
        }
      },
    }),
  }),

  overrideExisting: true,
});

export const {
  useLazyGetReceivableQuery,
  useArchiveReceivableMutation,
  useGetReceivableQuery,
  useRestoreReceivableMutation,
  useLazyGetReceivablesQuery,
  useCreateReceivableMutation,
  useUpdateReceivableMutation,
  useDeleteReceivableMutation,
} = receivableQuery;
