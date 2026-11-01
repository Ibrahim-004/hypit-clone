import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
export function LandingHero() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold sm:text-5xl">
        Turn a prompt into an animated video timeline
      </h1>
      <p className="mt-4 text-lg text-muted">
        Describe your video in chat. Edit every scene, reorder the story, and preview it live before
        you export the JSON.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/register">
          <Button>Get started</Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>
    </main>
  );
}
