
import { notifications } from "@mantine/notifications";
import { ROLE_ENDPOINT } from "./role.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { Role } from "../../../models/role.model";

let roleCollection: CollectionQuery;
let archivedRoleCollection: CollectionQuery;
const roleQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getRole: builder.query<Role, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.detail}/${id}`,
        method: "get",
      }),
    }),
    getRoles: builder.query<Collection<Role>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: ROLE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            roleCollection = param;
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
    createRole: builder.mutation<Role, Role>({
      query: (newData: any) => ({
        url: `${ROLE_ENDPOINT.create}`,
        method: "post",
        data: newData,
      }),

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
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
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
            title: "error",
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
            color: "red",
          });
        }
      },
    }),
    updateRole: builder.mutation<Role, Role>({
      query: (newData: Role) => ({
        url: `${ROLE_ENDPOINT.update}`,
        method: "put",
        data: newData,
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((role) => {
                      if (role.id === data.id) {
                        return data;
                      } else {
                        return role;
                      }
                    });
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
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
            color: "red",
          });
        }
      },
    }),
    switchRole: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.switch}/${id}`,
        method: "get",
      }),
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            notifications.show({
              title: "Success",
              message: "Successfully switched",
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
    deleteRole: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ROLE_ENDPOINT.delete}/${id}`,
        method: "delete",
      }),

      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              roleQuery.util.updateQueryData(
                "getRoles",
                roleCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.filter(
                      (role) => role.id?.toString() !== id
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
            message: error?.error?.data?.message
              ? error?.error?.data?.message
              : "Error try again",
            color: "red",
          });
        }
      },
    }),
  }),
  overrideExisting: true,
});
export const {
  useLazyGetRoleQuery,
  useLazyGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useSwitchRoleMutation,
} = roleQuery;
