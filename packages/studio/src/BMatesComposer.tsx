import { TrackDataType } from '@bmates/core';

import React, {
  CanvasHTMLAttributes,
  ReactNode,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import { BMatesSnapshot, BMatesStore, CreateBMatesStoreOptions, createBMatesStore } from './BMatesStore';
import {
  DeclarativeClipData,
  DeclarativeProjectRegistry,
  DeclarativeTrackData,
  TrackToken,
} from './DeclarativeProject';

const StoreContext = createContext<BMatesStore | null>(null);
const ProjectContext = createContext<DeclarativeProjectRegistry | null>(null);
const TrackContext = createContext<TrackToken | null>(null);
const ControlledProjectContext = createContext(false);
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export interface BMatesRootProps extends Omit<CreateBMatesStoreOptions, 'data'> {
  children: ReactNode;
  defaultData?: TrackDataType[];
  project?: TrackDataType[];
  store?: BMatesStore;
}

export const BMatesRoot = ({
  children,
  defaultData,
  onDataChange,
  onError,
  project,
  store,
  style,
}: BMatesRootProps) => {
  const ownedStoreRef = useRef<BMatesStore | null>(null);
  if (!store && !ownedStoreRef.current) {
    ownedStoreRef.current = createBMatesStore({ data: project ?? defaultData, onDataChange, onError, style });
  }
  const resolvedStore = store ?? ownedStoreRef.current;
  if (!resolvedStore) throw new Error('BMatesRoot could not create an editor store.');

  useEffect(() => {
    resolvedStore.setCallbacks({ onDataChange, onError });
  }, [onDataChange, onError, resolvedStore]);

  useEffect(() => {
    if (project) void resolvedStore.setProject(project).catch(() => undefined);
  }, [project, resolvedStore]);

  useEffect(
    () => () => {
      if (!store) resolvedStore.destroy();
    },
    [resolvedStore, store],
  );

  return (
    <StoreContext.Provider value={resolvedStore}>
      <ControlledProjectContext.Provider value={project !== undefined}>{children}</ControlledProjectContext.Provider>
    </StoreContext.Provider>
  );
};

export const useBMatesStore = () => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useBMatesStore must be used within BMatesRoot.');
  return store;
};

export const useBMatesSelector = <T,>(selector: (snapshot: BMatesSnapshot) => T) => {
  const store = useBMatesStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return selector(snapshot);
};

export const useBMatesTrack = (trackId: string) =>
  useBMatesSelector(snapshot => snapshot.data.find(track => track.id === trackId));

export const useBMatesClip = (clipId: string) =>
  useBMatesSelector(snapshot => {
    for (const track of snapshot.data) {
      const clip = track.songs.find(song => song.id === clipId);
      if (clip) return { clip, track };
    }
    return undefined;
  });

export interface BMatesProjectProps {
  children?: ReactNode;
}

export const BMatesProject = ({ children }: BMatesProjectProps) => {
  const store = useBMatesStore();
  const hasControlledProject = useContext(ControlledProjectContext);
  if (hasControlledProject) throw new Error('Use either BMates.Root project or BMates.Project, not both.');
  const registryRef = useRef<DeclarativeProjectRegistry | null>(null);
  if (!registryRef.current) {
    registryRef.current = new DeclarativeProjectRegistry(
      data => store.setProject(data),
      error => store.reportError(error),
    );
  }

  return <ProjectContext.Provider value={registryRef.current}>{children}</ProjectContext.Provider>;
};

export interface BMatesTrackProps extends DeclarativeTrackData {
  children?: ReactNode;
}

export const BMatesTrack = ({ children, group, id, mute, name }: BMatesTrackProps) => {
  const registry = useContext(ProjectContext);
  if (!registry) throw new Error('BMates.Track must be used within BMates.Project.');
  const tokenRef = useRef<TrackToken>(Symbol('bmates-track'));

  useIsomorphicLayoutEffect(() => {
    registry.setTrack(tokenRef.current, { group, id, mute, name });
  }, [group, id, mute, name, registry]);
  useIsomorphicLayoutEffect(() => {
    const token = tokenRef.current;
    return () => registry.removeTrack(token);
  }, [registry]);

  return <TrackContext.Provider value={tokenRef.current}>{children}</TrackContext.Provider>;
};

export interface BMatesClipProps {
  data?: Record<string, unknown>;
  id: string;
  instrument?: string;
  lock?: boolean;
  long?: number;
  mute?: boolean;
  src: string;
  start?: number;
  user?: string;
}

export const BMatesClip = ({
  data,
  id,
  instrument = 'Audio',
  lock,
  long,
  mute,
  src,
  start = 0,
  user = '',
}: BMatesClipProps) => {
  const registry = useContext(ProjectContext);
  const track = useContext(TrackContext);
  if (!registry || !track) throw new Error('BMates.Clip must be used within BMates.Project and BMates.Track.');
  const tokenRef = useRef(Symbol('bmates-clip'));

  useIsomorphicLayoutEffect(() => {
    const clip: DeclarativeClipData = { ...data, id, instrument, lock, long, mute, src, start, user };
    registry.setClip(tokenRef.current, track, clip);
  }, [data, id, instrument, lock, long, mute, registry, src, start, track, user]);
  useIsomorphicLayoutEffect(() => {
    const token = tokenRef.current;
    return () => registry.removeClip(token);
  }, [registry]);

  return null;
};

export const BMatesCanvas = forwardRef<HTMLCanvasElement, CanvasHTMLAttributes<HTMLCanvasElement>>(
  ({ className = 'bmates-editor', ...props }, forwardedRef) => {
    const store = useBMatesStore();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useIsomorphicLayoutEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      store.mount(canvas);
      return () => store.unmount(canvas);
    }, [store]);

    return (
      <canvas
        {...props}
        className={className}
        ref={node => {
          canvasRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
      />
    );
  },
);
BMatesCanvas.displayName = 'BMatesCanvas';

export interface BMatesTrackRenderProps {
  muted: boolean;
  remove: () => void;
  toggleMute: () => void;
  track: TrackDataType;
}

export interface BMatesTrackListProps {
  children: (props: BMatesTrackRenderProps) => ReactNode;
  className?: string;
  empty?: ReactNode;
}

export const BMatesTrackList = ({ children, className = 'bmates-track-list', empty = null }: BMatesTrackListProps) => {
  const store = useBMatesStore();
  const data = useBMatesSelector(snapshot => snapshot.data);
  if (data.length === 0) return <>{empty}</>;

  return (
    <div className={className}>
      {data.map(track => (
        <React.Fragment key={track.id}>
          {children({
            muted: Boolean(track.mute),
            remove: () => store.removeTrack(track.id),
            toggleMute: () => store.muteTrack(track.id),
            track,
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
