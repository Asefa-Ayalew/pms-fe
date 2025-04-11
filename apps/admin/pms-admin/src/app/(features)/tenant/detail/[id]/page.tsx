import dynamic from 'next/dynamic';

const TenantTypeDetailComponent = dynamic(() =>
    import('../../_component/tenant-detail-component')
  );
export default function TenantDetailPage() {
return (
    <TenantTypeDetailComponent />

    );
}