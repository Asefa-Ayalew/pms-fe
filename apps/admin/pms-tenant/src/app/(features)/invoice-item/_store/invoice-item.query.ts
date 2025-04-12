import { notifications } from "@mantine/notifications";
import { INVOICE_ITEM_ENDPOINT } from "./invoice-item.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { InvoiceItem } from "@/app/models/invoice-item.model";
import { Receivable } from "@/app/models/receivable.model";

let invoiceItemCollection: CollectionQuery;

export const invoiceItemQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceItem: builder.query<InvoiceItem, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${INVOICE_ITEM_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getInvoiceItems: builder.query<Collection<InvoiceItem>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: INVOICE_ITEM_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["InvoiceItems"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            invoiceItemCollection = param;
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

    createInvoiceItem: builder.mutation<InvoiceItem, InvoiceItem>({
      query: (newData: any) => ({
        url: `${INVOICE_ITEM_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["InvoiceItems"],
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
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItems",
                invoiceItemCollection,
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

    updateInvoiceItem: builder.mutation<InvoiceItem, InvoiceItem>({
      query: (newData: InvoiceItem) => ({
        url: `${INVOICE_ITEM_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["InvoiceItemInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItems",
                invoiceItemCollection,
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
    archiveInvoiceItem: builder.mutation<InvoiceItem, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${INVOICE_ITEM_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItems",
                invoiceItemCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((invoiceItem) => {
                      if (invoiceItem.id === data.id) return data;
                      else {
                        return invoiceItem;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItem",
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
    restoreInvoiceItem: builder.mutation<InvoiceItem, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${INVOICE_ITEM_ENDPOINT.restore}/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItems",
                invoiceItemCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((invoiceItem) => {
                      if (invoiceItem.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return invoiceItem;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItem",
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
    deleteInvoiceItem: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${INVOICE_ITEM_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["InvoiceItems"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              invoiceItemQuery.util.updateQueryData(
                "getInvoiceItems",
                invoiceItemCollection,
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
    sendToReceivable: builder.mutation<Receivable, Receivable>({
      query: (newData: any) => ({
        url: `${INVOICE_ITEM_ENDPOINT.sendToReceivable}`,
        method: "POST",
        data: newData,
      }),
    }),
  }),

  overrideExisting: true,
});

export const {
  useLazyGetInvoiceItemQuery,
  useArchiveInvoiceItemMutation,
  useGetInvoiceItemQuery,
  useRestoreInvoiceItemMutation,
  useLazyGetInvoiceItemsQuery,
  useCreateInvoiceItemMutation,
  useUpdateInvoiceItemMutation,
  useDeleteInvoiceItemMutation,
  useSendToReceivableMutation,
} = invoiceItemQuery;
