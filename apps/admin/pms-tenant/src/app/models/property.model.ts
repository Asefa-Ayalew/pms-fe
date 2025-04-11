export interface Property {
  id?: string;
  tenantId?: string;
  address: {
    country: string;
    city: string;
    subcity: string;
    woreda: string;
    kebele: string;
  };
  description?: string;
  numberOfRooms: number;
  size: number;
  isFurnished: boolean;
  amenities?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
  deletedBy?: string;
  deletedAt?: string;
}
