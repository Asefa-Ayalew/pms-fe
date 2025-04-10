import { ExpenseType } from "./expense-type.model";
import { Payable } from "./payable.model";
import { Property } from "./property.model";
import { Room } from "./room.model";
import { User } from "./user.model";

export interface Expense {
  id?: string;
  propertyId?: string;
  roomId?: string;
  userId?: string;
  property?: Property;
  room?: Room;
  expenseType?: ExpenseType;
  payable?: Payable;
  user?: User;
  expenseTypeId?: string;
  unitPrice?: number;
  taxable?: boolean;
  numUnits?: number;
  chargeCode?: string;
  remark?: string;
  totalAmount?: number;
  finalAmount?: number;
  totalTax?: number;
  totalDiscount?: number;
  discountPercent?: number;
  metadata?: any;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  archivedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  sentToPayable?: Boolean;
  posted?: boolean;
}
