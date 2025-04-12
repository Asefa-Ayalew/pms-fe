'use client';

import { useParams } from 'next/navigation';
import InvoiceItemFormComponent from '../_component/invoice-item--form-component';

export default function NewInvoiceItemTypePage() {
  const params = useParams();

  return (
    <InvoiceItemFormComponent
      editMode={params?.id === 'new' ? 'new' : 'detail'}
    />
  );
}
