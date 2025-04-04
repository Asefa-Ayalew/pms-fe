import { Auth } from '@pms/auth';
export default function AuthPage({ params }: { params: { slug: string } }) {
  console.log('params', params);
  
  return <Auth path={params.slug} config={{ basePath: '/pms' }} />;
}
