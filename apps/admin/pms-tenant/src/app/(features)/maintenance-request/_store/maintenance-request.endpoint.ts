export const MAINTENANCE_REQUEST_ENDPOINT = {
    list: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/get-maintenance-requests`,
    create: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/create-maintenance-request`,
    detail: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/get-maintenance-request`,
    update: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/update-maintenance-request`,
    delete: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/delete-maintenance-request`,
    archive: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/archive-maintenance-request`,
    restore: `${process.env.NEXT_PUBLIC_APP_API}/maintenance-requests/restore-maintenance-request`,
};
