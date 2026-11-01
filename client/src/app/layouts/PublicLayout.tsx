import { Outlet } from 'react-router-dom';
import { Toast } from '../../components/ui/Toast';
export function PublicLayout() {
  return (
    <div>
      <Outlet />
      <Toast />
    </div>
  );
}
