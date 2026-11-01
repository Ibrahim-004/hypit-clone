import { Button } from '../../../components/ui/Button';
export function PlaybackControls({
  playing,
  onPlay,
  onPause,
}: {
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
}) {
  return (
    <div className="flex gap-2">
      {playing ? <Button onClick={onPause}>Pause</Button> : <Button onClick={onPlay}>Play</Button>}
    </div>
  );
}
