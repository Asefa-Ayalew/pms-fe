'use client';

import { useParams } from 'next/navigation';
import ExpenseFormComponent from '../_component/expense-form-component';

export default function NewExpenseTypePage() {
  const params = useParams();

  return (
    <ExpenseFormComponent editMode={params?.id === 'new' ? 'new' : 'detail'} />
  );
}
