'use client';

import { useParams } from "next/navigation";
import NewRevenueTypeTypeComponent from "../_component/new-revenue-type-component";

export default function NewRevenueTypeTypePage() {
    const params = useParams();

    return (
        <NewRevenueTypeTypeComponent editMode={params?.id==='new' ?'new':'detail'} />
    );
}