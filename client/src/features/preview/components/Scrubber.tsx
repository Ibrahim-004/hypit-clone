import { formatSeconds } from '../../../lib/format';
export function Scrubber({
  value,
  max,
  onSeek,
}: {
  value: number;
  max: number;
  onSeek: (seconds: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted">{formatSeconds(value)}</span>
      <input
        type="range"
        aria-label="Preview scrubber"
        min={0}
        max={Math.max(1, max)}
        step={0.25}
        value={value}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="w-full"
      />
      <span className="text-xs text-muted">{formatSeconds(max)}</span>
    </div>
  );
}
