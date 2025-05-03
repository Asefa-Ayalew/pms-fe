import { notifications } from "@mantine/notifications";
import { MAINTENANCE_REQUEST_ENDPOINT } from "./maintenance-request.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { MaintenanceRequest } from "../../../models/maintenance-request.model";

let maintenanceRequestCollection: CollectionQuery;

export const maintenanceRequestQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaintenanceRequest: builder.query<MaintenanceRequest, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getMaintenanceRequests: builder.query<Collection<MaintenanceRequest>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: MAINTENANCE_REQUEST_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["MaintenanceRequests"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            maintenanceRequestCollection = param;
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

    createMaintenanceRequest: builder.mutation<MaintenanceRequest, MaintenanceRequest>({
      query: (newData: any) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["MaintenanceRequests"],
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
              maintenanceRequestQuery.util.updateQueryData(
                "getMaintenanceRequests",
                maintenanceRequestCollection,
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

    updateMaintenanceRequest: builder.mutation<MaintenanceRequest, MaintenanceRequest>({
      query: (newData: MaintenanceRequest) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["MaintenanceRequestInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              maintenanceRequestQuery.util.updateQueryData(
                "getMaintenanceRequests",
                maintenanceRequestCollection,
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
    archiveMaintenanceRequest: builder.mutation<MaintenanceRequest, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              maintenanceRequestQuery.util.updateQueryData(
                "getMaintenanceRequests",
                maintenanceRequestCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((maintenanceRequest) => {
                      if (maintenanceRequest.id === data.id) return data;
                      else {
                        return maintenanceRequest;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              maintenanceRequestQuery.util.updateQueryData("getMaintenanceRequest", param, (draft) => {
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
    restoreMaintenanceRequest: builder.mutation<MaintenanceRequest, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.restore }/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              maintenanceRequestQuery.util.updateQueryData(
                "getMaintenanceRequests",
                maintenanceRequestCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((maintenanceRequest) => {
                      if (maintenanceRequest.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return maintenanceRequest;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              maintenanceRequestQuery.util.updateQueryData("getMaintenanceRequest", param, (draft) => {
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
    deleteMaintenanceRequest: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ MAINTENANCE_REQUEST_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MaintenanceRequests"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              maintenanceRequestQuery.util.updateQueryData(
                "getMaintenanceRequests",
                maintenanceRequestCollection,
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
  useLazyGetMaintenanceRequestQuery,
  useArchiveMaintenanceRequestMutation,
  useGetMaintenanceRequestQuery,
  useRestoreMaintenanceRequestMutation,
  useLazyGetMaintenanceRequestsQuery,
  useCreateMaintenanceRequestMutation,
  useUpdateMaintenanceRequestMutation,
  useDeleteMaintenanceRequestMutation,
} = maintenanceRequestQuery;
