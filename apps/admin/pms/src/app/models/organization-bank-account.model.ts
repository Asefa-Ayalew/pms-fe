import { BankAccountType } from "../shared/enum/app.enum";

export interface OrganizationBankAccount {
    id?: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    accountType: BankAccountType;
    isActive: boolean;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    archivedAt?: string;
}