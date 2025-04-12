import { notifications } from "@mantine/notifications";
import { REVENUE_TYPE_ENDPOINT } from "./revenue-type.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { RevenueType } from "@/app/models/revenue-type.model";

let revenueTypeCollection: CollectionQuery;

export const revenueTypeQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getRevenueType: builder.query<RevenueType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${REVENUE_TYPE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getRevenueTypes: builder.query<Collection<RevenueType>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: REVENUE_TYPE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["RevenueTypes"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            revenueTypeCollection = param;
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

    createRevenueType: builder.mutation<RevenueType, RevenueType>({
      query: (newData: any) => ({
        url: `${REVENUE_TYPE_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["RevenueTypes"],
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
              revenueTypeQuery.util.updateQueryData(
                "getRevenueTypes",
                revenueTypeCollection,
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

    updateRevenueType: builder.mutation<RevenueType, RevenueType>({
      query: (newData: RevenueType) => ({
        url: `${REVENUE_TYPE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["RevenueTypeInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              revenueTypeQuery.util.updateQueryData(
                "getRevenueTypes",
                revenueTypeCollection,
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
    archiveRevenueType: builder.mutation<RevenueType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${REVENUE_TYPE_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              revenueTypeQuery.util.updateQueryData(
                "getRevenueTypes",
                revenueTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((revenueType) => {
                      if (revenueType.id === data.id) return data;
                      else {
                        return revenueType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              revenueTypeQuery.util.updateQueryData("getRevenueType", param, (draft) => {
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
    restoreRevenueType: builder.mutation<RevenueType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${REVENUE_TYPE_ENDPOINT.restore}/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              revenueTypeQuery.util.updateQueryData(
                "getRevenueTypes",
                revenueTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((revenueType) => {
                      if (revenueType.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return revenueType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              revenueTypeQuery.util.updateQueryData("getRevenueType", param, (draft) => {
                if (data) {
                  draft.archivedAt = "";
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
    deleteRevenueType: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${REVENUE_TYPE_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RevenueTypes"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              revenueTypeQuery.util.updateQueryData(
                "getRevenueTypes",
                revenueTypeCollection,
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
  useLazyGetRevenueTypeQuery,
  useArchiveRevenueTypeMutation,
  useGetRevenueTypeQuery,
  useRestoreRevenueTypeMutation,
  useLazyGetRevenueTypesQuery,
  useCreateRevenueTypeMutation,
  useUpdateRevenueTypeMutation,
  useDeleteRevenueTypeMutation,
} = revenueTypeQuery;
