import { Property } from "./property.model";
import { RevenueType } from "./revenue-type.model";
import { Room } from "./room.model";

export interface InvoiceItem {
  id?: string;
  propertyId?: string;
  roomId?: string;
  revenueTypeId?: string;
  property?: Property;
  room?: Room;
  revenueType?: RevenueType;
  unitPrice?: number;
  numUnits?: number;
  taxable?: boolean;
  chargeCode?: string;
  remark?: string;
  totalAmount?: number;
  finalAmount?: number;
  totalTax?: number;
  totalDiscount?: number;
  discountPercent?: number;
  metadata?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}
