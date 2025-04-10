export interface Receivable {
  id?: string;
  items?: string[];
  propertyId?: string;
  roomId?: string;
  creditorId?: string;
  creditorAccount?: string;
  bankName?: string;
  creditorName?: string;
  creditorType?: string;
  invoiceType?: string;
  remark?: string;
  totalAmount?: number;
  finalAmount?: number;
  totalTax?: number;
  totalDiscount?: number;
  metadata?: any;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  archivedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  archivedAt?: Date;
}
