export const PAYABLE_ENDPOINT = {
  list: `${process.env.NEXT_PUBLIC_APP_API}/payables/get-payables`,
  create: `${process.env.NEXT_PUBLIC_APP_API}/payables/create-payable`,
  detail: `${process.env.NEXT_PUBLIC_APP_API}/payables/get-payable`,
  update: `${process.env.NEXT_PUBLIC_APP_API}/payables/update-payable`,
  delete: `${process.env.NEXT_PUBLIC_APP_API}/payables/delete-payable`,
  archive: `${process.env.NEXT_PUBLIC_APP_API}/payables/archive-payable`,
  restore: `${process.env.NEXT_PUBLIC_APP_API}/payables/restore-payable`,
  generateBankSlip: `${process.env.NEXT_PUBLIC_APP_API}/payables/generate-bank-payment-request-pdf`,
  markAsPaid: `${process.env.NEXT_PUBLIC_APP_API}/payables/mark-as-paid`,
  voidPayable: `${process.env.NEXT_PUBLIC_APP_API}/payables/void-payable`,
};
