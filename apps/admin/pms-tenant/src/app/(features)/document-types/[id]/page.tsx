'use client';

import { useParams } from 'next/navigation';
import NewDocumentTypeTypeComponent from '../_component/new-document-type-component';

export default function NewDocumentTypeTypePage() {
  const params = useParams();

  return (
    <NewDocumentTypeTypeComponent
      editMode={params?.id === 'new' ? 'new' : 'detail'}
    />
  );
}
