import { NextResponse } from 'next/server';

const MAX_FIELD = 200;
const MAX_NOTES = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(value: unknown, max: number) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const recruiterEmail = str(body.recruiterEmail, MAX_FIELD);
  if (!EMAIL_RE.test(recruiterEmail)) {
    return NextResponse.json({ error: 'A valid recruiterEmail is required' }, { status: 400 });
  }

  const items = Array.isArray(body.bookmarkedItems) ? body.bookmarkedItems.slice(0, 50) : [];

  // Log metadata only: the visitor's message itself is delivered through their own
  // mail client (mailto), so nothing sensitive needs to be persisted here.
  console.log('[Portfolio Recruiter Mix Submission Received]:', {
    company: str(body.company, MAX_FIELD),
    itemsCount: items.length,
    notesLength: str(body.notes, MAX_NOTES).length,
    timestamp: str(body.timestamp, 40),
  });

  // To deliver server-side instead, send `body` via Resend/Nodemailer here with secrets from env.
  return NextResponse.json({
    success: true,
    message: 'Recruiter mix recorded successfully. Proceed to Google Meet scheduling.',
  });
}
