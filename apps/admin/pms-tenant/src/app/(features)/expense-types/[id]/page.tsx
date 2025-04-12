'use client';

import { useParams } from "next/navigation";
import NewExpenseTypeTypeComponent from "../_component/new-expense-type-component";

export default function NewExpenseTypeTypePage() {
    const params = useParams();

    return (
        <NewExpenseTypeTypeComponent editMode={params?.id==='new' ?'new':'detail'} />
    );
}