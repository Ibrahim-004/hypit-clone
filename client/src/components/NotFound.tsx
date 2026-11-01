import { Link } from 'react-router-dom';
export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-4 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-4 text-accent underline">
        Go home
      </Link>
    </main>
  );
}
