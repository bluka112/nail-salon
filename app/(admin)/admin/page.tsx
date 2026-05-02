import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AdminIndex() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/auth/sign-in');
  }
  redirect('/admin/overview');
}
