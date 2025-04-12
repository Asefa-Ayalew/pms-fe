export const REVENUE_TYPE_ENDPOINT = {
    list: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/get-revenue-types`,
    create: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/create-revenue-type`,
    detail: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/get-revenue-type`,
    update: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/update-revenue-type`,
    delete: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/delete-revenue-type`,
    archive: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/archive-revenue-type`,
    restore: `${process.env.NEXT_PUBLIC_APP_API}/revenue-types/restore-revenue-type`,
};
