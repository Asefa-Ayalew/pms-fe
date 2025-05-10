'use client';

import { useParams } from "next/navigation";
import NewTenantTypeComponent from "../_component/new-tenant-component";

export default function NewTenantTypePage() {
    const params = useParams();
console.log('params', params);

    return (
        <NewTenantTypeComponent editMode={params?.id === 'new' ? 'new' : 'detail'} />
    );
}