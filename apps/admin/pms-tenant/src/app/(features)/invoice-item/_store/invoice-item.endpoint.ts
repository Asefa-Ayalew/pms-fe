export const INVOICE_ITEM_ENDPOINT = {
  list: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/get-invoice-items`,
  create: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/create-invoice-item`,
  detail: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/get-invoice-item`,
  update: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/update-invoice-item`,
  delete: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/delete-invoice-item`,
  archive: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/archive-invoice-item`,
  restore: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/restore-invoice-item`,
  sendToReceivable: `${process.env.NEXT_PUBLIC_APP_API}/invoice-items/send-to-receivable`,
};
