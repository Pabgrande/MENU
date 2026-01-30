import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import ToastContainer from '../ui/Toast'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
