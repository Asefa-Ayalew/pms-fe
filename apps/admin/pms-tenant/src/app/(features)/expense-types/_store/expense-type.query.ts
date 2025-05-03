import { notifications } from "@mantine/notifications";
import { EXPENSE_TYPE_ENDPOINT } from "./expense-type.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { ExpenseType } from "../../../models/expense-type.model";

let expenseTypeCollection: CollectionQuery;

export const expenseTypeQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseType: builder.query<ExpenseType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getExpenseTypes: builder.query<Collection<ExpenseType>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: EXPENSE_TYPE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["ExpenseTypes"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            expenseTypeCollection = param;
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

    createExpenseType: builder.mutation<ExpenseType, ExpenseType>({
      query: (newData: any) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["ExpenseTypes"],
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
              expenseTypeQuery.util.updateQueryData(
                "getExpenseTypes",
                expenseTypeCollection,
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

    updateExpenseType: builder.mutation<ExpenseType, ExpenseType>({
      query: (newData: ExpenseType) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["ExpenseTypeInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseTypeQuery.util.updateQueryData(
                "getExpenseTypes",
                expenseTypeCollection,
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
    archiveExpenseType: builder.mutation<ExpenseType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseTypeQuery.util.updateQueryData(
                "getExpenseTypes",
                expenseTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((expenseType) => {
                      if (expenseType.id === data.id) return data;
                      else {
                        return expenseType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              expenseTypeQuery.util.updateQueryData("getExpenseType", param, (draft) => {
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
    restoreExpenseType: builder.mutation<ExpenseType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.restore }/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseTypeQuery.util.updateQueryData(
                "getExpenseTypes",
                expenseTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((expenseType) => {
                      if (expenseType.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return expenseType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              expenseTypeQuery.util.updateQueryData("getExpenseType", param, (draft) => {
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
    deleteExpenseType: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ EXPENSE_TYPE_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExpenseTypes"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseTypeQuery.util.updateQueryData(
                "getExpenseTypes",
                expenseTypeCollection,
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
  useLazyGetExpenseTypeQuery,
  useArchiveExpenseTypeMutation,
  useGetExpenseTypeQuery,
  useRestoreExpenseTypeMutation,
  useLazyGetExpenseTypesQuery,
  useCreateExpenseTypeMutation,
  useUpdateExpenseTypeMutation,
  useDeleteExpenseTypeMutation,
} = expenseTypeQuery;
