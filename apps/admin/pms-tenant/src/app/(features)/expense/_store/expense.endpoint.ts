export const EXPENSE_ENDPOINT = {
  list: `${process.env.NEXT_PUBLIC_APP_API}/expenses/get-expenses`,
  create: `${process.env.NEXT_PUBLIC_APP_API}/expenses/create-expense`,
  detail: `${process.env.NEXT_PUBLIC_APP_API}/expenses/get-expense`,
  update: `${process.env.NEXT_PUBLIC_APP_API}/expenses/update-expense`,
  delete: `${process.env.NEXT_PUBLIC_APP_API}/expenses/delete-expense`,
  archive: `${process.env.NEXT_PUBLIC_APP_API}/expenses/archive-expense`,
  restore: `${process.env.NEXT_PUBLIC_APP_API}/expenses/restore-expense`,
  sendToPayable: `${process.env.NEXT_PUBLIC_APP_API}/expenses/send-to-payable`,
};
