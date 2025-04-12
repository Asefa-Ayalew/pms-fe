
import { notifications } from "@mantine/notifications";
import { DOCUMENT_TYPE_ENDPOINT } from "./document-type.endpoint";
import { appApi, Collection, CollectionQuery, collectionQueryBuilder } from "@pms/entity";
import { DocumentType } from "@/app/models/document-type.model";

let documentTypeCollection: CollectionQuery;

export const documentTypeQuery = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocumentType: builder.query<DocumentType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.detail}/${data?.id}`,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
    }),

    getDocumentTypes: builder.query<Collection<DocumentType>, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: DOCUMENT_TYPE_ENDPOINT.list,
        method: "GET",
        params: collectionQueryBuilder(data),
      }),
      providesTags: ["DocumentTypes"],
      async onQueryStarted(param, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            documentTypeCollection = param;
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

    createDocumentType: builder.mutation<DocumentType, DocumentType>({
      query: (newData: any) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.create}`,
        method: "POST",
        data: newData,
      }),
      invalidatesTags: ["DocumentTypes"],
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
              documentTypeQuery.util.updateQueryData(
                "getDocumentTypes",
                documentTypeCollection,
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

    updateDocumentType: builder.mutation<DocumentType, DocumentType>({
      query: (newData: DocumentType) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.update}`,
        method: "PUT",
        data: newData,
      }),
      invalidatesTags: ["DocumentTypeInfo"],
      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              documentTypeQuery.util.updateQueryData(
                "getDocumentTypes",
                documentTypeCollection,
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
    archiveDocumentType: builder.mutation<DocumentType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.archive}/${data?.id}`,
        method: "DELETE",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              documentTypeQuery.util.updateQueryData(
                "getDocumentTypes",
                documentTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((documentType) => {
                      if (documentType.id === data.id) return data;
                      else {
                        return documentType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              documentTypeQuery.util.updateQueryData("getDocumentType", param, (draft) => {
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
    restoreDocumentType: builder.mutation<DocumentType, CollectionQuery>({
      query: (data: CollectionQuery) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.restore }/${data?.id}`,
        method: "POST",
      }),

      async onQueryStarted(param, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              documentTypeQuery.util.updateQueryData(
                "getDocumentTypes",
                documentTypeCollection,
                (draft) => {
                  if (data) {
                    draft.data = draft?.data?.map((documentType) => {
                      if (documentType.id === data.id)
                        return { ...data, archivedDate: null };
                      else {
                        return documentType;
                      }
                    });
                  }
                }
              )
            );
            dispatch(
              documentTypeQuery.util.updateQueryData("getDocumentType", param, (draft) => {
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
    deleteDocumentType: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `${ DOCUMENT_TYPE_ENDPOINT.delete}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DocumentTypes"],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              documentTypeQuery.util.updateQueryData(
                "getDocumentTypes",
                documentTypeCollection,
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
  useLazyGetDocumentTypeQuery,
  useArchiveDocumentTypeMutation,
  useGetDocumentTypeQuery,
  useRestoreDocumentTypeMutation,
  useLazyGetDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} = documentTypeQuery;
