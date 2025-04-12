export const RECEIVABLE_ENDPOINT = {
    list: `${process.env.NEXT_PUBLIC_APP_API}/receivables/get-receivables`,
    create: `${process.env.NEXT_PUBLIC_APP_API}/receivables/create-receivable`,
    detail: `${process.env.NEXT_PUBLIC_APP_API}/receivables/get-receivable`,
    update: `${process.env.NEXT_PUBLIC_APP_API}/receivables/update-receivable`,
    delete: `${process.env.NEXT_PUBLIC_APP_API}/receivables/delete-receivable`,
    archive: `${process.env.NEXT_PUBLIC_APP_API}/receivables/archive-receivable`,
    restore: `${process.env.NEXT_PUBLIC_APP_API}/receivables/restore-receivable`,
};
