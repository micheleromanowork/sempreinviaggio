import AdminSidebar from '@/components/admin/AdminSidebar'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session.userId) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 min-w-0 lg:pl-0">
        <div className="lg:ml-0 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
