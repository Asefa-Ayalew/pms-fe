export interface MaintenanceRequest {
  id?: string;
  tenantId?: string;
  propertyId?: string;
  roomId?: string;
  title: string;
  description?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}
