import { notifications } from "@mantine/notifications";
import { LEASE_ENDPOINT } from "./lease.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { Lease, LeaseDocument } from "../../../models/lease.model";

let leaseCollection: CollectionQuery;

export const leaseQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getLease: builder.query<Lease, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${LEASE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getLeases: builder.query<Collection<Lease>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: LEASE_ENDPOINT.list,
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

    createLease: builder.mutation<Lease, Lease>({
      query: (newData: any) => ({
        url: `${LEASE_ENDPOINT.create}`,
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
        url: `${LEASE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["LeaseInfo"],
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
        url: `${LEASE_ENDPOINT.archive}/${data?.id}`,
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
    restoreLease: builder.mutation<Lease, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${LEASE_ENDPOINT.restore}/${data?.id}`,
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
            dispatch(
              leaseQuery.util.updateQueryData("getLease", param, (draft) => {
                if (data) {
                  draft.archivedAt = new Date();
                }
              })
            );
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
        url: `${LEASE_ENDPOINT.delete}/${id}`,
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
    // document
    createDocument: builder.mutation<LeaseDocument, FormData>({
      query: (newData: FormData) => ({
        url: `${LEASE_ENDPOINT.createDocument}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Leases"],
    }),
    removeDocument: builder.mutation<void, { id: string; leaseId: string }>({
      query: (newData: any) => ({
        url: `${LEASE_ENDPOINT.removeDocument}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Leases"],
    }),
  }),

  overrideExisting: true,
});

export const {
  useLazyGetLeaseQuery,
  useArchiveLeaseMutation,
  useGetLeaseQuery,
  useRestoreLeaseMutation,
  useLazyGetLeasesQuery,
  useCreateLeaseMutation,
  useUpdateLeaseMutation,
  useDeleteLeaseMutation,
  // document
  useCreateDocumentMutation,
  useRemoveDocumentMutation,
} = leaseQuery;
