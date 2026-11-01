import { describe, it, expect, beforeAll, afterEach, afterAll, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatPanel } from './ChatPanel';
import { server } from '../../../test/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('ChatPanel', () => {
  it('generates scenes and reports them to the timeline', async () => {
    const user = userEvent.setup();
    const onGenerated = vi.fn();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <ChatPanel projectId="project-1" onGenerated={onGenerated} />
      </QueryClientProvider>,
    );
    await user.type(screen.getByLabelText('Prompt'), 'A cafe ad');
    await user.click(screen.getByRole('button', { name: 'Generate scenes' }));
    expect(await screen.findByText(/Generated 2 scenes/)).toBeInTheDocument();
    expect(onGenerated).toHaveBeenCalledTimes(1);
    const scenes = onGenerated.mock.calls[0]?.[0] as { text: string }[];
    expect(scenes[0]?.text).toBe('Welcome to the cafe');
  });
});
