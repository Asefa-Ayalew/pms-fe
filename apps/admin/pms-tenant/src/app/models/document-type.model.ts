export interface DocumentType {
    id?: string;
    name: string;
    code: string;
    description: string;
    isMandatory?: boolean;
    hasExpirationDate?: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    archivedAt?: string;
}