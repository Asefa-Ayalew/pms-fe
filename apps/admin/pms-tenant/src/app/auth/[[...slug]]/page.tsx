import { Auth } from '@pms/auth';
export default async function AuthPage({ params }: { params: { slug: string } }) {
  return <Auth path={params.slug} config={{ basePath: '/pms-tenant' }} />;
}
