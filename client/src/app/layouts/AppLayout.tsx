import { Outlet } from 'react-router-dom';
import { Toast } from '../../components/ui/Toast';
export function AppLayout() {
  return (
    <div>
      <Outlet />
      <Toast />
    </div>
  );
}
