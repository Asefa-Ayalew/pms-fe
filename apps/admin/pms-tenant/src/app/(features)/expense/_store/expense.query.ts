import { notifications } from "@mantine/notifications";
import { EXPENSE_ENDPOINT } from "./expense.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { Expense } from "@/app/models/expense.model";
import { Payable } from "@/app/models/payable.model";

let expenseCollection: CollectionQuery;

export const expenseQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpense: builder.query<Expense, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${EXPENSE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getExpenses: builder.query<Collection<Expense>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: EXPENSE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["Expenses"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            expenseCollection = param;
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

    createExpense: builder.mutation<Expense, Expense>({
      query: (newData: any) => ({
        url: `${EXPENSE_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Expenses"],
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
              expenseQuery.util.updateQueryData(
                "getExpenses",
                expenseCollection,
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

    updateExpense: builder.mutation<Expense, Expense>({
      query: (newData: Expense) => ({
        url: `${EXPENSE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["ExpenseInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpenses",
                expenseCollection,
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
    archiveExpense: builder.mutation<Expense, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${EXPENSE_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpenses",
                expenseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((expense) => {
                      if (expense.id === data.id) return data;
                      else {
                        return expense;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpense",
                param,
                (draft) => {
                  if (data) {
                    draft.archivedAt = data?.archivedAt;
                  }
                }
              )
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
    restoreExpense: builder.mutation<Expense, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${EXPENSE_ENDPOINT.restore}/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpenses",
                expenseCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((expense) => {
                      if (expense.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return expense;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpense",
                param,
                (draft) => {
                  if (data) {
                    draft.archivedAt = "";
                  }
                }
              )
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
    deleteExpense: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${EXPENSE_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Expenses"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              expenseQuery.util.updateQueryData(
                "getExpenses",
                expenseCollection,
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
    sendToPayble: builder.mutation<Payable, Payable>({
      query: (newData: any) => ({
        url: `${EXPENSE_ENDPOINT.sendToPayable}`,
        method: "POST",
        data: newData,
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useLazyGetExpenseQuery,
  useArchiveExpenseMutation,
  useGetExpenseQuery,
  useRestoreExpenseMutation,
  useLazyGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useSendToPaybleMutation,
} = expenseQuery;
