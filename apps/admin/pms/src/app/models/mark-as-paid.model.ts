export interface MarkAsPaid {
  id?: string;
  transactionDate?: Date;
  transactionType?: string;
  transactionReference?: string;
  serviceCharge?: number;
  paymentMethod?: string;
  paidDate?: Date;
  paidById?: string;
  fromAccountId?: string;
  remark?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  archivedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  archivedAt?: Date;
}
