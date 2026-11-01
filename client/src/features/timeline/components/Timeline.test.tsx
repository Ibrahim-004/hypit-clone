import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from './Timeline';
import { useTimeline } from '../hooks/useTimeline';
import type { ClientScene } from '../types';

const initial: ClientScene[] = [
  { id: 'a', order: 0, text: 'First scene', duration: 5, visual: 'A', transition: 'fade' },
  { id: 'b', order: 1, text: 'Second scene', duration: 5, visual: 'B', transition: 'cut' },
];

function Wrapper() {
  const timeline = useTimeline(initial);
  return (
    <Timeline
      scenes={timeline.scenes}
      canUndo={timeline.canUndo}
      canRedo={timeline.canRedo}
      onUndo={timeline.undo}
      onRedo={timeline.redo}
      onChange={timeline.updateScene}
      onDelete={timeline.deleteScene}
      onMove={timeline.moveScene}
      onAdd={timeline.addScene}
      onReorder={timeline.reorder}
    />
  );
}

describe('Timeline', () => {
  it('moves a scene down with the keyboard-friendly button and supports undo', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const narrations = screen.getAllByLabelText(/narration/);
    expect((narrations[0] as HTMLTextAreaElement).value).toBe('First scene');
    await user.click(screen.getByRole('button', { name: 'Move scene 1 down' }));
    const afterMove = screen.getAllByLabelText(/narration/);
    expect((afterMove[0] as HTMLTextAreaElement).value).toBe('Second scene');
    await user.click(screen.getByRole('button', { name: 'Undo' }));
    const afterUndo = screen.getAllByLabelText(/narration/);
    expect((afterUndo[0] as HTMLTextAreaElement).value).toBe('First scene');
  });
  it('edits scene text inline', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);
    const narration = screen.getAllByLabelText(/narration/)[0] as HTMLTextAreaElement;
    await user.clear(narration);
    await user.type(narration, 'Edited scene');
    expect(narration.value).toBe('Edited scene');
  });
});
