import { Link } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { Card } from '../../../components/ui/Card';

export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-4">
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Log in</h1>
        <LoginForm />
        <p className="mt-4 text-sm text-muted">
          No account yet?{' '}
          <Link to="/register" className="text-accent underline">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
