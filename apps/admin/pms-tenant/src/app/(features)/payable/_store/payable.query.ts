
import { notifications } from "@mantine/notifications";
import { PAYABLE_ENDPOINT } from "./payable.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { Payable } from "../../../models/payable.model";
import { GenerateBankSlip } from "../../../models/generate-bank-slip";
import { MarkAsPaid } from "../../../models/mark-as-paid.model";

let payableCollection: CollectionQuery;

export const payableQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayable: builder.query<Payable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${PAYABLE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getPayables: builder.query<Collection<Payable>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: PAYABLE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["Payables"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            payableCollection = param;
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

    createPayable: builder.mutation<Payable, Payable>({
      query: (newData: any) => ({
        url: `${PAYABLE_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["Payables"],
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
              payableQuery.util.updateQueryData(
                "getPayables",
                payableCollection,
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

    updatePayable: builder.mutation<Payable, Payable>({
      query: (newData: Payable) => ({
        url: `${PAYABLE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["Payables"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayables",
                payableCollection,
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
    archivePayable: builder.mutation<Payable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${PAYABLE_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayables",
                payableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((payable) => {
                      if (payable.id === data.id) return data;
                      else {
                        return payable;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayable",
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
    restorePayable: builder.mutation<Payable, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${PAYABLE_ENDPOINT.restore}/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayables",
                payableCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((payable) => {
                      if (payable.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return payable;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayable",
                param,
                (draft) => {
                  if (data) {
                    draft.archivedAt = new Date();
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
    deletePayable: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${PAYABLE_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payables"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              payableQuery.util.updateQueryData(
                "getPayables",
                payableCollection,
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
    generateBankSlip: builder.mutation<GenerateBankSlip, GenerateBankSlip>({
      query: (newData: any) => ({
        url: `${PAYABLE_ENDPOINT.generateBankSlip}`,
        method: "POST",
        data: newData,
      }),
    }),
    markAsPaid: builder.mutation<MarkAsPaid, MarkAsPaid>({
      query: (newData: any) => ({
        url: `${PAYABLE_ENDPOINT.markAsPaid}`,
        method: "POST",
        data: newData,
      }),
    }),
    voidPayable: builder.mutation<any, any>({
      query: (newData: any) => ({
        url: `${PAYABLE_ENDPOINT.voidPayable}`,
        method: "POST",
        data: newData,
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useLazyGetPayableQuery,
  useArchivePayableMutation,
  useGetPayableQuery,
  useRestorePayableMutation,
  useLazyGetPayablesQuery,
  useCreatePayableMutation,
  useUpdatePayableMutation,
  useDeletePayableMutation,
  useGenerateBankSlipMutation,
  useMarkAsPaidMutation,
  useVoidPayableMutation,
} = payableQuery;
