export const DOCUMENT_TYPE_ENDPOINT = {
    list: `${process.env.NEXT_PUBLIC_APP_API}/document-types/get-document-types`,
    create: `${process.env.NEXT_PUBLIC_APP_API}/document-types/create-document-type`,
    detail: `${process.env.NEXT_PUBLIC_APP_API}/document-types/get-document-type`,
    update: `${process.env.NEXT_PUBLIC_APP_API}/document-types/update-document-type`,
    delete: `${process.env.NEXT_PUBLIC_APP_API}/document-types/delete-document-type`,
    archive: `${process.env.NEXT_PUBLIC_APP_API}/document-types/archive-document-type`,
    restore: `${process.env.NEXT_PUBLIC_APP_API}/document-types/restore-document-type`,
};
