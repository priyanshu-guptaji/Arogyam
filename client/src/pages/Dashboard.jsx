import { CareManagerDashboard } from './CareManagerDashboard';
import { ParentDashboard } from './ParentDashboard';
import { ChildDashboard } from './ChildDashboard';

export function Dashboard({ user }) {
  const role = user?.role;

  switch (role) {
    case 'Care Manager':
      return <CareManagerDashboard />;
    case 'Parent':
      return <ParentDashboard />;
    case 'Child':
      return <ChildDashboard />;
    default:
      return <ChildDashboard />;
  }
}
