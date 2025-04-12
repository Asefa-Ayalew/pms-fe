export const EXPENSE_TYPE_ENDPOINT = {
    list: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/get-expense-types`,
    create: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/create-expense-type`,
    detail: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/get-expense-type`,
    update: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/update-expense-type`,
    delete: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/delete-expense-type`,
    archive: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/archive-expense-type`,
    restore: `${process.env.NEXT_PUBLIC_APP_API}/expense-types/restore-expense-type`,
};
