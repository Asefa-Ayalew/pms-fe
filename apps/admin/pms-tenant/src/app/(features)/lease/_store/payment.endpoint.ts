export const PAYMENT_ENDPOINT = {
  list: `${process.env.NEXT_PUBLIC_APP_API}/leases/get-leases`,
  create: `${process.env.NEXT_PUBLIC_APP_API}/leases/create-lease`,
  detail: `${process.env.NEXT_PUBLIC_APP_API}/leases/get-lease`,
  update: `${process.env.NEXT_PUBLIC_APP_API}/leases/update-lease`,
  delete: `${process.env.NEXT_PUBLIC_APP_API}/leases/delete-lease`,
  archive: `${process.env.NEXT_PUBLIC_APP_API}/leases/archive-lease`,
  restore: `${process.env.NEXT_PUBLIC_APP_API}/leases/restore-lease`,
};
