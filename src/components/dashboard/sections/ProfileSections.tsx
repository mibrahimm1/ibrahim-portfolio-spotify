import React, { useState } from 'react';
import { useDashboard } from '../context';
import {
  ArrayField,
  BareText,
  Card,
  CheckboxField,
  ColorField,
  IdField,
  NumberField,
  PlaylistSelect,
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
import { aiConfigFromDraft, newItem } from '../model';
import { processAIQuery } from '@/lib/aiEngine';

const PLACEHOLDER_HINT = 'Placeholders: {name} {firstName} {email} {phone} {phoneDisplay} {role}';

export const ProfileSection: React.FC = () => {
  const { draft } = useDashboard();
  const placeholderBooking = draft.profile.calendarBookingUrl.replace(/\/$/, '') === 'https://calendar.google.com';
  return (
    <Section title="Profile" description="Who you are. These details appear on Home, in the AI answers, on the resume page and in contact links.">
      <Card title="Identity">
        <Row cols={3}>
          <TextField path={['profile', 'name']} label="Full name" />
          <TextField path={['profile', 'firstName']} label="First name" hint="Used in copy like “Ask Ibrahim's AI”" />
          <TextField path={['profile', 'shortName']} label="Handle" />
        </Row>
        <Row cols={3}>
          <TextField path={['profile', 'initials']} label="Initials" hint="Shown in the avatar when there's no photo" />
          <TextField path={['profile', 'avatarLetter']} label="Avatar letter" hint="Small round avatars" />
          <TextField path={['profile', 'verifiedLabel']} label="Verified label" />
        </Row>
        <UploadField path={['profile', 'avatarImage']} label="Profile photo" />
      </Card>
      <Card title="Headline">
        <Row>
          <TextField path={['profile', 'role']} label="Role" />
          <TextField path={['profile', 'gpa']} label="GPA" optional />
        </Row>
        <TextField path={['profile', 'tagline']} label="Tagline" />
        <Row>
          <TextField path={['profile', 'availabilityLine']} label="Availability line" />
          <TextField path={['profile', 'locationChip']} label="Location chip" />
        </Row>
        <ArrayField path={['profile', 'locations']} label="Locations" newValue={() => ''} addLabel="Add location" render={(p) => <BareText path={p} />} />
        <TextField path={['profile', 'bio']} label="Bio" multiline rows={5} hint="Used as the resume summary" />
      </Card>
      <Card title="Contact">
        <Row>
          <TextField path={['profile', 'email']} label="Email" type="email" />
          <UrlField
            path={['profile', 'calendarBookingUrl']}
            label="Booking link"
            hint={
              placeholderBooking ? (
                <span className="text-[#ffa42b]">Still the placeholder. Paste your Google Calendar appointment-schedule link.</span>
              ) : (
                'Every “Book a call” button opens this'
              )
            }
          />
        </Row>
        <Row>
          <TextField path={['profile', 'phone']} label="Phone (for tel: links)" placeholder="+1 555 010 0000" />
          <TextField path={['profile', 'phoneDisplay']} label="Phone (as displayed)" />
        </Row>
        <Row>
          <UrlField path={['profile', 'github']} label="GitHub" />
          <UrlField path={['profile', 'linkedin']} label="LinkedIn" />
        </Row>
      </Card>
      <Card title="Resume file">
        <Row>
          <UploadField path={['profile', 'resumePdf']} label="Resume PDF" kind="pdf" optional={false} hint="Served by every “Download resume” button" />
          <TextField path={['profile', 'resumeFileName']} label="Download file name" placeholder="Your_Name_Resume.pdf" />
        </Row>
      </Card>
    </Section>
  );
};

export const SiteSection: React.FC = () => (
  <Section title="Site & SEO" description="What search engines and link previews show.">
    <Card>
      <TextField path={['site', 'title']} label="Page title" />
      <TextField path={['site', 'description']} label="Description" multiline rows={3} />
      <TagsField path={['site', 'keywords']} label="Keywords" />
      <Row>
        <TextField path={['site', 'author']} label="Author" />
        <ColorField path={['site', 'themeColor']} label="Browser theme colour" />
      </Row>
    </Card>
  </Section>
);

export const HomeSection: React.FC = () => (
  <Section title="Home page" description="The profile page visitors land on.">
    <Card title="Featured playlist">
      <Row>
        <PlaylistSelect path={['home', 'featuredPlaylistId']} label="Featured playlist" hint="The profile Play button, “Top tracks” and empty-state buttons use it" />
        <NumberField path={['home', 'topTracksCount']} label="Top tracks to show" min={1} max={10} />
      </Row>
    </Card>
    <Card title="Shelf titles">
      <Row>
        <TextField path={['home', 'topArtistsTitle']} label="Tech stack title" />
        <TextField path={['home', 'topArtistsSubtitle']} label="Tech stack subtitle" />
      </Row>
      <Row>
        <TextField path={['home', 'topTracksTitle']} label="Top tracks title" />
        <TextField path={['home', 'topTracksSubtitle']} label="Top tracks subtitle" />
      </Row>
      <Row>
        <TextField path={['home', 'followingTitle']} label="Recommenders title" />
        <TextField path={['home', 'followingSubtitle']} label="Recommenders subtitle" />
      </Row>
    </Card>
    <Card title="Your Recruiter Mix">
      <Row>
        <TextField path={['recruiterMix', 'title']} label="Title" />
        <TextField path={['recruiterMix', 'subtitle']} label="Library subtitle" />
      </Row>
      <TextField path={['recruiterMix', 'description']} label="Description" multiline rows={2} />
    </Card>
  </Section>
);

/* --------------------------------- AI ----------------------------------- */

const AiTester: React.FC = () => {
  const { draft } = useDashboard();
  const [query, setQuery] = useState('');
  let answer: { answer: string; referencedTrack?: { title: string } } | null = null;
  try {
    answer = query.trim() ? processAIQuery(query, aiConfigFromDraft(draft)) : null;
  } catch {
    answer = { answer: 'Fix the highlighted problems to test answers.' };
  }
  return (
    <Card title="Try it (uses your unsaved draft)">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask something a recruiter might ask…"
        aria-label="Test question"
        className="spotify-input"
      />
      {answer && (
        <div className="rounded-lg bg-[rgba(255,255,255,0.07)] p-4 text-sm leading-relaxed" data-testid="ai-test-answer">
          <p>{answer.answer}</p>
          {answer.referencedTrack && <p className="mt-2 text-xs font-bold text-accent">Links to: {answer.referencedTrack.title}</p>}
        </div>
      )}
    </Card>
  );
};

export const AiSection: React.FC = () => {
  const { draft } = useDashboard();
  return (
    <Section
      title="AI assistant"
      description="The “Ask …'s AI” search answers from these, in first person. A query that starts like a suggested question gets that answer; otherwise the first answer with a matching keyword wins (top to bottom), else the default."
    >
      <AiTester />
      <Card title="Suggested questions">
        <ListEditor
          path={['starterPrompts']}
          noun="question"
          takenIds={(d) => d.starterPrompts.map((p) => p.id)}
          newItem={newItem.prompt}
          itemTitle={(p) => String(p.question ?? '')}
          itemSubtitle={(p) => String(p.subtitle ?? '')}
          renderItem={(path) => (
            <>
              <Row>
                <TextField path={[...path, 'question']} label="Question" />
                <IdField path={[...path, 'id']} titlePath={[...path, 'question']} siblings={draft.starterPrompts.map((p) => p.id)} />
              </Row>
              <TextField path={[...path, 'subtitle']} label="Subtitle" />
              <TextField path={[...path, 'initialResponse']} label="Answer" multiline rows={4} hint={PLACEHOLDER_HINT} />
              <TrackSelect path={[...path, 'referencedTrackId']} label="Linked item" optional />
            </>
          )}
        />
      </Card>
      <Card title="Answers by keyword">
        <ListEditor
          path={['ai', 'intents']}
          noun="answer"
          takenIds={(d) => d.ai.intents.map((i) => i.id)}
          newItem={newItem.intent}
          itemTitle={(i) => String(i.id ?? '')}
          itemSubtitle={(i) => ((i.keywords as string[]) ?? []).join(', ')}
          renderItem={(path) => (
            <>
              <Row>
                <IdField path={[...path, 'id']} siblings={draft.ai.intents.map((i) => i.id)} />
                <TrackSelect path={[...path, 'trackId']} label="Linked item" optional />
              </Row>
              <TagsField path={[...path, 'keywords']} label="Keywords" hint="Matched at word starts: “rag” matches “RAG pipeline” but not “storage”" />
              <TextField path={[...path, 'answer']} label="Answer" multiline rows={5} hint={PLACEHOLDER_HINT} />
            </>
          )}
        />
      </Card>
      <Card title="Default answer">
        <TextField path={['ai', 'defaultAnswer']} label="When nothing matches" multiline rows={4} hint={PLACEHOLDER_HINT} />
      </Card>
    </Section>
  );
};

/* ------------------------- Smaller sections ------------------------------ */

export const CoverLetterSection: React.FC = () => (
  <Section title="Cover letter" description="Plays in Lyrics mode (the mic button). Each paragraph is one “line”; longer paragraphs stay on screen longer.">
    <ArrayField path={['coverLetterStanzas']} label="Paragraphs" newValue={() => ''} addLabel="Add paragraph" render={(p) => <BareText path={p} multiline rows={4} />} />
  </Section>
);

export const ThemesSection: React.FC = () => {
  const { draft } = useDashboard();
  return (
    <Section title="Accent themes" description="Colours visitors can pick from the gear menu. The first theme is the default.">
      <ListEditor
        path={['accentThemes']}
        noun="theme"
        minItems={1}
        takenIds={(d) => d.accentThemes.map((t) => t.id)}
        newItem={newItem.theme}
        itemTitle={(t, i) => `${t.name}${i === 0 ? ' (default)' : ''}`}
        itemSubtitle={(t) => String(t.primary ?? '')}
        leading={(t) => <span className="h-8 w-8 flex-shrink-0 rounded-full" style={{ backgroundColor: String(t.primary) }} aria-hidden="true" />}
        renderItem={(path) => (
          <>
            <Row>
              <TextField path={[...path, 'name']} label="Name" />
              <IdField path={[...path, 'id']} titlePath={[...path, 'name']} siblings={draft.accentThemes.map((t) => t.id)} />
            </Row>
            <Row cols={4}>
              <ColorField path={[...path, 'primary']} label="Primary" />
              <ColorField path={[...path, 'hover']} label="Hover" />
              <ColorField path={[...path, 'pressed']} label="Pressed" />
              <ColorField path={[...path, 'banner']} label="Profile header" />
            </Row>
          </>
        )}
      />
    </Section>
  );
};

export const ExtrasSection: React.FC = () => (
  <Section title="What's New & footer">
    <Card title="What's New (bell menu)">
      <ArrayField path={['whatsNew']} label="Items, newest first" newValue={() => ''} addLabel="Add item" render={(p) => <TrackSelect path={p} label="Item" />} />
    </Card>
    <Card title="Footer columns">
      <ListEditor
        path={['footer', 'columns']}
        noun="column"
        itemTitle={(c) => String(c.title ?? '')}
        itemSubtitle={(c) => `${(c.links as unknown[]).length} links`}
        newItem={() => ({ title: 'New column', links: [] })}
        renderItem={(path) => (
          <>
            <TextField path={[...path, 'title']} label="Column title" />
            <ListEditor
              path={[...path, 'links']}
              noun="link"
              itemTitle={(l) => String(l.label ?? '')}
              itemSubtitle={(l) => String(l.href ?? '')}
              newItem={() => ({ label: '', href: 'https://' })}
              renderItem={(lPath) => (
                <>
                  <Row>
                    <TextField path={[...lPath, 'label']} label="Label" />
                    <TextField path={[...lPath, 'href']} label="Link" hint="https://…, mailto:, tel: or a site path like /resume" />
                  </Row>
                  <CheckboxField path={[...lPath, 'download']} label="Download instead of opening" hint="For the resume PDF link" />
                </>
              )}
            />
          </>
        )}
      />
    </Card>
  </Section>
);

export const ResumeSection: React.FC = () => (
  <Section title="Resume page" description="The plain, printable /resume page for recruiters who prefer a standard layout.">
    <Card>
      <Row>
        <TextField path={['resume', 'locationLine']} label="Location line" />
        <TextField path={['resume', 'recommendationsHeading']} label="References heading" />
      </Row>
    </Card>
    <Card title="Skills">
      <ListEditor
        path={['resume', 'skills']}
        noun="skill group"
        itemTitle={(s) => String(s.label ?? '')}
        itemSubtitle={(s) => String(s.value ?? '')}
        newItem={() => ({ label: '', value: '' })}
        renderItem={(path) => (
          <Row>
            <TextField path={[...path, 'label']} label="Label" />
            <TextField path={[...path, 'value']} label="Skills" />
          </Row>
        )}
      />
    </Card>
    <Card title="Sections (in order)">
      <ListEditor
        path={['resume', 'sections']}
        noun="section"
        itemTitle={(s) => String(s.heading ?? '')}
        itemSubtitle={(s) => `${s.variant} · ${s.playlistId}`}
        newItem={(d) => ({ heading: 'New section', playlistId: d.playlists[0]?.id ?? '', variant: 'projects' })}
        renderItem={(path) => (
          <>
            <Row>
              <TextField path={[...path, 'heading']} label="Heading" />
              <PlaylistSelect path={[...path, 'playlistId']} label="Playlist" />
            </Row>
            <Row>
              <SelectField
                path={[...path, 'variant']}
                label="Style"
                options={[
                  { value: 'experience', label: 'Experience (title | company, key metric)' },
                  { value: 'projects', label: 'Projects (title + link, headline)' },
                  { value: 'education', label: 'Education (with coursework)' },
                  { value: 'publication', label: 'Publication (with DOI)' },
                  { value: 'bullets', label: 'Bullet list' },
                ]}
              />
              <NumberField path={[...path, 'limit']} label="Show at most" optional min={1} max={50} />
            </Row>
          </>
        )}
      />
    </Card>
  </Section>
);
