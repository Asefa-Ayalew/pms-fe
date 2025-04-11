import {
  appApi,
  Collection,
  CollectionQuery,
  collectionQueryBuilder,
} from "@pms/entity";
import { notifications } from "@mantine/notifications";
import { LeaseEndpoint } from "./lease.endpoint";
import { Lease } from "@/app/models/lease.model";

let leaseCollection: CollectionQuery;

export const leaseQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeases: builder.query<Collection<Lease>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: LeaseEndpoint.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["Leases"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            leaseCollection = param;
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message || "Error, try again",
            color: "red",
          });
        }
      },
    }),
    getArchivedLeases: builder.query<Collection<Lease>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: LeaseEndpoint.listArchivedLeases,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["Leases"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            leaseCollection = param;
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message || "Error, try again",
            color: "red",
          });
        }
      },
    }),
    getLease: builder.query<Lease, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${LeaseEndpoint.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    createLease: builder.mutation<Lease, Lease>({
      query: (newData: any) => ({
        url: LeaseEndpoint.create,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Leases"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notifications.show({
              title: "Success",
              message: "Successfully created",
              color: "green",
            });

            dispatch(
              leaseQuery.util.updateQueryData(
                "getLeases",
                leaseCollection,
                (draft) => {
                  if (data) {
                    draft.data.push(data);
                    draft.count += 1;
                  }
                }
              )
            );
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message || "Error, try again",
            color: "red",
          });
        }
      },
    }),

    updateLease: builder.mutation<Lease, Lease>({
      query: (newData: Lease) => ({
        url: `$LeaseEndpoint.update}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Leases"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              leaseQuery.util.updateQueryData(
                "getLeases",
                leaseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((item) =>
                      item.id === data.id ? data : item
                    );
                  }
                }
              )
            );

            notifications.show({
              title: "Success",
              message: "Successfully updated",
              color: "green",
            });
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message || "Error, try again",
            color: "red",
          });
        }
      },
    }),
    archiveLease: builder.mutation<Lease, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${LeaseEndpoint.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              leaseQuery.util.updateQueryData(
                "getLeases",
                leaseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((lease) => {
                      if (lease.id === data.id) return data;
                      else {
                        return lease;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              leaseQuery.util.updateQueryData("getLease", param, (draft) => {
                if (data) {
                  draft.archivedAt = data?.archivedAt;
                }
              })
            );
            notifications.show({
              title: "Success",
              message: "Successfully archived",
              color: "green",
            });
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
            color: "red",
          });
        }
      },
    }),
    restoreLease: builder.mutation<Lease, string>({
      query: (id: string) => ({
        url: `${LeaseEndpoint.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              leaseQuery.util.updateQueryData(
                "getLeases",
                leaseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((lease) => {
                      if (lease.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return lease;
                      }
                    });
                  }
                }
              )
            );
            // dispatch(
            //   leaseQuery.util.updateQueryData("getLease", param, (draft) => {
            //     if (data) {
            //       console.log(data);
            //     }
            //   })
            // );
            notifications.show({
              title: "Success",
              message: "Successfully restored",
              color: "green",
            });
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
            color: "red",
          });
        }
      },
    }),
    deleteLease: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `$LeaseEndpoint.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leases"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              leaseQuery.util.updateQueryData(
                "getLeases",
                leaseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (item) => item.id?.toString() !== id
                    );
                    draft.count -= 1;
                  }
                }
              )
            );

            notifications.show({
              title: "Success",
              message: "Successfully deleted",
              color: "green",
            });
          }
        } catch (error: any) {
          notifications.show({
            title: "Error",
            message: error?.error?.data?.message || "Error, try again",
            color: "red",
          });
        }
      },
    }),
  }),

  overrideExisting: true,
});

export const {
  useLazyGetLeaseQuery,
  useLazyGetArchivedLeasesQuery,
  useArchiveLeaseMutation,
  useGetLeaseQuery,
  useRestoreLeaseMutation,
  useLazyGetLeasesQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
} = leaseQuery;
