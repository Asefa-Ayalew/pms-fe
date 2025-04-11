import { UserRoles } from "./role.model";

interface ProfileImage {
  filename: string;
  path: string;
  originalname: string;
  mimetype: string;
  size: number;
}
interface UserAddress {
  country: string;
  city: string;
  subcity: string;
  woreda: string;
  kebele: string;
}

interface EmergencyContactType {
  phone: string;
  name: string;
}

export interface User {
  id?: string;
  firstName: string;
  middleName: string;
  lastName?: string;
  organizationId?: string;
  organization?: any;
  departmentId?: string;
  roleId?: string[];
  email?: string;
  address: UserAddress;
  phone: string;
  password?: string;
  firebaseUserId?: string;
  jobTitle?: string;
  gender: "Male" | "Female";
  licenseNumber?: string;
  profilePicture?: any;
  isPowerUser?: boolean;
  isEmployee?: boolean;
  isActive?: boolean;
  dateOfBirth?: Date;
  startDate?: Date;
  endDate?: Date;
  tin?: string;
  employeeNumber?: string;
  userRoles?: UserRoles;
  userContacts?: EmergencyContactType[];
  currentRole?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  documentTypeId: string;
  documentTypeCode?: string;
  documentReference?: string;
  file: File;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  archivedAt?: string;
}

export interface PasswordChange {
  oldPassword: string;
  newPassword: string;
}
