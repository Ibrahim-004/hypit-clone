import { Link } from 'react-router-dom';
import { RegisterForm } from './RegisterForm';
import { Card } from '../../../components/ui/Card';

export function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-4">
      <Card>
        <h1 className="mb-4 text-2xl font-bold">Create account</h1>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
