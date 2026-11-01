import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { ChatPanel } from '../../chat/components/ChatPanel';
import { Timeline } from '../../timeline/components/Timeline';
import { TimelineSkeleton } from '../../timeline/components/TimelineSkeleton';
import { PreviewPlayer } from '../../preview/components/PreviewPlayer';
import { Tabs } from '../../../components/ui/Tabs';
import { SaveStatus } from '../../../components/SaveStatus';
import { Button } from '../../../components/ui/Button';
import { useUiStore } from '../../../store/ui-store';
import { useTimeline } from '../../timeline/hooks/useTimeline';
import { useAutosave } from '../../timeline/hooks/useAutosave';
import { toClientScenes, toSceneInputs, type ClientScene } from '../../timeline/types';

export function EditorPage() {
  const { id } = useParams();
  const projectId = id ?? '';
  const projectQuery = useProject(projectId);
  const activeTab = useUiStore((s) => s.activeTab);
  const timeline = useTimeline([]);
  const [savedScenes, setSavedScenes] = useState<ClientScene[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (projectQuery.data?.scenes && !loaded) {
      const initial = toClientScenes(projectQuery.data.scenes);
      timeline.resetScenes(initial);
      setSavedScenes(initial);
      setLoaded(true);
    }
  }, [projectQuery.data, loaded, timeline]);

  const handleSaved = useCallback((scenes: ClientScene[]) => setSavedScenes(scenes), []);
  const handleRollback = useCallback(
    (scenes: ClientScene[]) => {
      timeline.resetScenes(scenes);
    },
    [timeline],
  );
  const autosave = useAutosave({
    projectId,
    scenes: timeline.scenes,
    savedScenes,
    onSaved: handleSaved,
    onRollback: handleRollback,
  });

  const exportJson = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          { title: projectQuery.data?.title ?? 'project', scenes: toSceneInputs(timeline.scenes) },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectQuery.data?.title ?? 'project'}-scenes.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [projectQuery.data, timeline]);

  const handleGenerated = useCallback(
    (scenes: ClientScene[]) => {
      timeline.resetScenes(scenes);
    },
    [timeline],
  );

  if (projectQuery.isPending)
    return (
      <main className="mx-auto max-w-6xl p-4">
        <TimelineSkeleton />
      </main>
    );
  if (projectQuery.isError || !projectQuery.data) {
    return (
      <main className="mx-auto max-w-6xl p-4">
        <p role="alert" className="text-danger">
          Could not load this project.
        </p>
      </main>
    );
  }

  const chat = <ChatPanel projectId={projectId} onGenerated={handleGenerated} />;
  const timelineView = (
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
  const preview = <PreviewPlayer scenes={timeline.scenes} />;

  return (
    <main className="mx-auto max-w-7xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{projectQuery.data.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportJson}>Export scene JSON</Button>
          <SaveStatus status={autosave.status} />
        </div>
      </header>
      <div className="mb-4">
        <Tabs />
      </div>
      <div className="grid gap-4 md:hidden">
        {activeTab === 'chat' ? chat : null}
        {activeTab === 'timeline' ? timelineView : null}
        {activeTab === 'preview' ? preview : null}
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-3">
        {chat}
        {timelineView}
        {preview}
      </div>
    </main>
  );
}
