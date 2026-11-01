import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingHero } from '../components/LandingHero';
import { NotFound } from '../components/NotFound';
import { LoginPage } from '../features/auth/components/LoginPage';
import { RegisterPage } from '../features/auth/components/RegisterPage';
import { ProjectsPage } from '../features/projects/components/ProjectsPage';
import { Spinner } from '../components/ui/Spinner';

const EditorPage = lazy(() =>
  import('../features/projects/components/EditorPage').then((m) => ({ default: m.EditorPage })),
);

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingHero /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/app', element: <ProjectsPage /> },
          {
            path: '/app/projects/:id',
            element: (
              <Suspense
                fallback={
                  <div className="flex min-h-screen items-center justify-center">
                    <Spinner label="Loading editor" />
                  </div>
                }
              >
                <EditorPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
