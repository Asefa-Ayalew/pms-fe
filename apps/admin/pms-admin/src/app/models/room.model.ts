import { Property } from "./property.model";
import { Tenant } from "./tenant.model";

export interface Room {
  id?: string;
  tenantId?: string;
  propertyId?: string;
  tenant: Tenant;
  property: Property
  roomNumber: string;
  description?: string;
  floorNumber: string;
  size: number;
  amenities?: string[];
  type: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  archivedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  archivedAt?: Date;
}
