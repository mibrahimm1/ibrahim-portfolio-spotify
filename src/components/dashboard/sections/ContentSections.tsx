import React from 'react';
import { useDashboard } from '../context';
import {
  ArrayField,
  ArtKindSelect,
  BareText,
  Card,
  ColorField,
  IdField,
  RecommenderSelect,
  Row,
  Section,
  SelectField,
  TagsField,
  TextField,
  TrackSelect,
  UploadField,
  UrlField,
} from '../fields';
import { ListEditor } from '../ListEditor';
import { Path, allTrackIds, findReferences, getAt, newItem } from '../model';
import { matchesKeyword } from '@/lib/catalog';
import type { PortfolioContent } from '@/content/schema';

const Swatch: React.FC<{ color: unknown; round?: boolean }> = ({ color, round }) => (
  <span
    aria-hidden="true"
    className={round ? 'h-8 w-8 flex-shrink-0 rounded-full' : 'h-8 w-8 flex-shrink-0 rounded'}
    style={{ backgroundColor: typeof color === 'string' ? color : '#535353' }}
  />
);

/* ------------------------------- Items ---------------------------------- */

const MoveToPlaylist: React.FC<{ trackPath: Path }> = ({ trackPath }) => {
  const { draft, replace, notify } = useDashboard();
  const [, playlistIndex, , trackIndex] = trackPath as [string, number, string, number];
  const current = draft.playlists[playlistIndex];
  if (draft.playlists.length < 2) return null;
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-subdued">Playlist</label>
      <select
        value={current.id}
        onChange={(e) => {
          const target = e.target.value;
          replace((d) => {
            const next = structuredClone(d);
            const [track] = next.playlists[playlistIndex].tracks.splice(trackIndex, 1);
            next.playlists.find((p) => p.id === target)!.tracks.push(track);
            return next;
          });
          notify(`Moved to “${draft.playlists.find((p) => p.id === target)?.title}”`);
        }}
        className="spotify-input cursor-pointer"
      >
        {draft.playlists.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>
    </div>
  );
};

const TrackForm: React.FC<{ path: Path }> = ({ path }) => {
  const { draft } = useDashboard();
  return (
    <>
      <Row>
        <TextField path={[...path, 'title']} label="Title" />
        <IdField path={[...path, 'id']} refKind="track" titlePath={[...path, 'title']} siblings={allTrackIds(draft)} />
      </Row>
      <TextField path={[...path, 'subtitle']} label="Subtitle" hint="Shown like the artist line, e.g. the tech stack or company" />
      <Row cols={3}>
        <TextField path={[...path, 'album']} label="Album / category" />
        <TextField path={[...path, 'dateAdded']} label="Date" placeholder="2025 or Jan 2025 – Present" />
        <TextField path={[...path, 'duration']} label="Tag" hint="Fills the duration column, e.g. “Remote” or “CGPA: 3.6”" />
      </Row>
      <TextField path={[...path, 'hook']} label="Headline" hint="The one-line metric shown on the Highlights card" />
      <TextField path={[...path, 'details']} label="Details" multiline rows={6} />
      <Row>
        <UrlField path={[...path, 'externalUrl']} label="Code / paper link" optional />
        <UrlField path={[...path, 'demoUrl']} label="Live demo link" optional />
      </Row>
      <Row cols={3}>
        <ColorField path={[...path, 'coverColor']} label="Cover colour" contrastPreview />
        <TextField path={[...path, 'statusBadge']} label="Status badge" optional placeholder="In development" />
        <RecommenderSelect path={[...path, 'recommenderId']} label="Endorsed by" optional />
      </Row>
      <Row>
        <UploadField path={[...path, 'coverImage']} label="Cover image" />
        <MoveToPlaylist trackPath={path} />
      </Row>
      <Card title="Credits">
        <ListEditor
          path={[...path, 'credits']}
          noun="credit"
          itemTitle={(c) => String(c.item ?? '')}
          itemSubtitle={(c) => String(c.role ?? '')}
          newItem={() => ({ item: '', role: '' })}
          renderItem={(cPath) => (
            <Row>
              <TextField path={[...cPath, 'item']} label="Technology / course" />
              <TextField path={[...cPath, 'role']} label="Role" />
            </Row>
          )}
        />
      </Card>
    </>
  );
};

/* ----------------------------- Playlists -------------------------------- */

export const PlaylistsSection: React.FC = () => {
  const { draft, focus, setPreview } = useDashboard();
  const focusPlaylist =
    focus.playlist ?? (focus.track ? draft.playlists.find((p) => p.tracks.some((t) => t.id === focus.track))?.id : undefined);

  return (
    <Section
      title="Playlists & items"
      description="Each playlist is a section of your portfolio (projects, roles, education…) and each item in it is a “track”. Drag to reorder."
    >
      <ListEditor
        path={['playlists']}
        noun="playlist"
        refKind="playlist"
        minItems={1}
        openId={focusPlaylist}
        takenIds={(d) => d.playlists.map((p) => p.id)}
        newItem={newItem.playlist}
        itemTitle={(p) => String(p.title ?? '')}
        itemSubtitle={(p) => `${(p.tracks as unknown[]).length} items · ${p.id}`}
        leading={(p) => <Swatch color={p.coverColor} />}
        onOpen={(p) => setPreview(p ? `#/playlist/${p.id}` : '')}
        extraRefs={(d: PortfolioContent, p) =>
          (p.tracks as { id: string }[]).map((t) => ({ kind: 'track' as const, id: t.id, refs: findReferences(d, 'track', t.id) }))
        }
        renderItem={(pPath) => (
          <>
            <Row>
              <TextField path={[...pPath, 'title']} label="Title" />
              <IdField path={[...pPath, 'id']} refKind="playlist" titlePath={[...pPath, 'title']} siblings={draft.playlists.map((p) => p.id)} />
            </Row>
            <Row>
              <TextField path={[...pPath, 'subtitle']} label="Library subtitle" placeholder="Playlist • 4 roles" />
              <TextField path={[...pPath, 'aboutLabel']} label="“About” card heading" placeholder="About the project" />
            </Row>
            <TextField path={[...pPath, 'description']} label="Description" multiline rows={2} />
            <Row cols={3}>
              <ColorField path={[...pPath, 'coverColor']} label="Cover colour" contrastPreview />
              <ArtKindSelect path={[...pPath, 'artKind']} label="Cover glyph" />
              <UploadField path={[...pPath, 'coverImage']} label="Cover image" />
            </Row>
            <div className="pt-2">
              <h4 className="mb-2 text-sm font-bold">Items in this playlist</h4>
              <ListEditor
                path={[...pPath, 'tracks']}
                noun="item"
                refKind="track"
                openId={focus.track}
                takenIds={allTrackIds}
                newItem={newItem.track}
                itemTitle={(t) => String(t.title ?? '')}
                itemSubtitle={(t) => [t.subtitle, t.dateAdded].filter(Boolean).join(' · ')}
                leading={(t) => <Swatch color={t.coverColor} />}
                renderItem={(tPath) => <TrackForm path={tPath} />}
              />
            </div>
          </>
        )}
      />
    </Section>
  );
};

/* ---------------------------- Technologies ------------------------------ */

const KeywordMatches: React.FC<{ path: Path }> = ({ path }) => {
  const { draft } = useDashboard();
  const keywords = (getAt(draft, [...path, 'keywords']) as string[] | undefined) ?? [];
  const matches = draft.playlists.flatMap((p) => p.tracks).filter((t) => keywords.some((k) => matchesKeyword(t, k)));
  return (
    <p className="text-xs text-subdued">
      “This Is …” playlist: <span className="font-bold text-white">{matches.length} items</span>
      {matches.length > 0 && ` — ${matches.slice(0, 4).map((t) => t.title).join(', ')}${matches.length > 4 ? '…' : ''}`}
    </p>
  );
};

export const TechnologiesSection: React.FC = () => {
  const { draft, focus, setPreview } = useDashboard();
  return (
    <Section title="Tech stack" description="The circular “Top artists” on Home. Each one opens a generated “This Is …” playlist of every item whose text matches its keywords.">
      <ListEditor
        path={['technologies']}
        noun="technology"
        openId={focus.technology}
        takenIds={(d) => d.technologies.map((t) => t.id)}
        newItem={newItem.technology}
        itemTitle={(t) => String(t.name ?? '')}
        itemSubtitle={(t) => String(t.category ?? '')}
        leading={(t) => <Swatch color={t.color} round />}
        onOpen={(t) => setPreview(t ? `#/playlist/tech%3A${t.id}` : '')}
        renderItem={(path) => (
          <>
            <Row>
              <TextField path={[...path, 'name']} label="Name" />
              <IdField path={[...path, 'id']} titlePath={[...path, 'name']} siblings={draft.technologies.map((t) => t.id)} />
            </Row>
            <Row cols={3}>
              <TextField path={[...path, 'category']} label="Category" />
              <TextField path={[...path, 'monogram']} label="Monogram" hint="Up to 4 letters, shown when there's no image" />
              <ColorField path={[...path, 'color']} label="Colour" />
            </Row>
            <TextField path={[...path, 'subtitle']} label="Subtitle" />
            <TagsField path={[...path, 'keywords']} label="Keywords" hint="Matched at word starts in item titles, subtitles, details and credits" />
            <KeywordMatches path={path} />
            <UploadField path={[...path, 'image']} label="Image" />
          </>
        )}
      />
    </Section>
  );
};

/* ---------------------------- Recommenders ------------------------------ */

export const RecommendersSection: React.FC = () => {
  const { draft, focus, setPreview } = useDashboard();
  return (
    <Section title="Recommenders" description="People who vouch for you. Each gets a profile page, a Friend Activity row and a Following card.">
      <ListEditor
        path={['recommenders']}
        noun="recommender"
        refKind="recommender"
        openId={focus.recommender}
        takenIds={(d) => d.recommenders.map((r) => r.id)}
        newItem={newItem.recommender}
        itemTitle={(r) => String(r.name ?? '')}
        itemSubtitle={(r) => String(r.title ?? '')}
        onOpen={(r) => setPreview(r ? `#/user/${r.id}` : '')}
        renderItem={(path) => (
          <>
            <Row>
              <TextField path={[...path, 'name']} label="Name" />
              <IdField path={[...path, 'id']} refKind="recommender" titlePath={[...path, 'name']} siblings={draft.recommenders.map((r) => r.id)} />
            </Row>
            <Row>
              <TextField path={[...path, 'title']} label="Title" />
              <TextField path={[...path, 'affiliation']} label="Affiliation" />
            </Row>
            <Row cols={3}>
              <TextField path={[...path, 'email']} label="Email" type="email" />
              <SelectField
                path={[...path, 'type']}
                label="Type"
                options={[
                  { value: 'academic', label: 'Academic' },
                  { value: 'industry', label: 'Industry' },
                ]}
              />
              <TextField path={[...path, 'avatarInitials']} label="Initials" />
            </Row>
            <TextField path={[...path, 'ranking']} label="Headline endorsement" placeholder="Ranks me in the top 5%" />
            <Row>
              <UrlField path={[...path, 'externalUrl']} label="Profile link" />
              <TextField path={[...path, 'externalLabel']} label="Profile link label" />
            </Row>
            <Row>
              <UrlField path={[...path, 'facultyProfileUrl']} label="Second profile link" optional />
              <TextField path={[...path, 'facultyProfileLabel']} label="Second link label" hint="Defaults to “Faculty profile”" optional />
            </Row>
            <Row>
              <TrackSelect path={[...path, 'linkedTrackId']} label="Linked item" hint="Shown as “Featuring” on their profile" />
            </Row>
            <UploadField path={[...path, 'photo']} label="Photo" />
            <Card title="Endorsed competencies">
              <ListEditor
                path={[...path, 'competencies']}
                noun="competency"
                itemTitle={(c) => String(c.name ?? '')}
                newItem={() => ({ name: '', color: '#649AED' })}
                leading={(c) => <Swatch color={c.color} round />}
                renderItem={(cPath) => (
                  <Row>
                    <TextField path={[...cPath, 'name']} label="Name" />
                    <ColorField path={[...cPath, 'color']} label="Colour" />
                  </Row>
                )}
              />
            </Card>
            <ArrayField
              path={[...path, 'fullLetter']}
              label="Letter paragraphs"
              newValue={() => ''}
              addLabel="Add paragraph"
              render={(pPath) => <BareText path={pPath} multiline rows={4} />}
            />
          </>
        )}
      />
    </Section>
  );
};
