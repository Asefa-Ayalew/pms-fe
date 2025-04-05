
import { notifications } from "@mantine/notifications";
import { propertyEndpoint } from "./property.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { Property } from "@/app/models/property.model";

let propertyCollection: CollectionQuery;

export const propertyQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperty: builder.query<Property, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${propertyEndpoint.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getProperties: builder.query<Collection<Property>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: propertyEndpoint.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["Properties"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            propertyCollection = param;
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
    getArchivedProperties: builder.query<Collection<Property>, CollectionQuery>(
      {
        query: (data: CollectionQuery) => ({
          url: propertyEndpoint.listArchivedProperties,
          method: "GET",
          params: collectionQueryBuilder(data),
        }),
        providesTags: ["Properties"],
        async onQueryStarted(param, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            if (data) {
              propertyCollection = param;
            }
          } catch (error: any) {
            notifications.show({
              title: "Error",
              message: error?.error?.data?.message || "Error, try again",
              color: "red",
            });
          }
        },
      }
    ),

    createProperty: builder.mutation<Property, Property>({
      query: (newData: any) => ({
        url: propertyEndpoint.create,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Properties"],
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
              propertyQuery.util.updateQueryData(
                "getProperties",
                propertyCollection,
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

    updateProperty: builder.mutation<Property, Property>({
      query: (newData: Property) => ({
        url: `${propertyEndpoint.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["Properties"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              propertyQuery.util.updateQueryData(
                "getProperties",
                propertyCollection,
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
    archiveProperty: builder.mutation<Property, { id: string; reason: string }>(
      {
        query: (data: any) => ({
          url: `${propertyEndpoint.archive}`,
          data,
          method: "DELETE",
        }),
        invalidatesTags: ["Properties"],
        async onQueryStarted(param, { dispatch, queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            if (data) {
              dispatch(
                propertyQuery.util.updateQueryData(
                  "getProperties",
                  propertyCollection,
                  (draft) => {
                    if (data) {
                      draft.data = draft?.data?.map((property) => {
                        const prop = JSON.parse(JSON.stringify(property));
                        if (prop.id === data.id) return data;
                        else {
                          return property;
                        }
                      });
                    }
                  }
                )
              );
              dispatch(
                propertyQuery.util.updateQueryData(
                  "getProperty",
                  param,
                  (draft) => {
                    if (data) {
                      draft.archivedAt = data?.archivedAt;
                    }
                  }
                )
              );
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
      }
    ),
    restoreProperty: builder.mutation<Property, string>({
      query: (id) => ({
        url: `${propertyEndpoint.restore}/${id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              propertyQuery.util.updateQueryData(
                "getProperties",
                propertyCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((property) => {
                      if (property.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return property;
                      }
                    });
                  }
                }
              )
            );
            // dispatch(
            //   propertyQuery.util.updateQueryData(
            //     "getProperty",
            //     param,
            //     (draft) => {
            //       if (data) {
            //         draft.archivedAt = "";
            //       }
            //     }
            //   )
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
    deleteProperty: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${propertyEndpoint.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              propertyQuery.util.updateQueryData(
                "getProperties",
                propertyCollection,
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
  useLazyGetPropertyQuery,
  useGetArchivedPropertiesQuery,
  useLazyGetArchivedPropertiesQuery,
  useArchivePropertyMutation,
  useGetPropertyQuery,
  useRestorePropertyMutation,
  useLazyGetPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertyQuery;
