'use client';
import { useParams } from "next/navigation";
import NewUserTypeComponent from "../_component/new-user-component";

export default function NewUserTypePage() {
  const params = useParams();

  return (
    <NewUserTypeComponent editMode={params?.id === 'new' ? 'new' : 'detail'} />
  )
}
