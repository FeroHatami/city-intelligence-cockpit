# Local Outreach Workflow

City Intelligence Cockpit includes a semi-automated outreach queue for local lead
review. It generates and organizes message drafts, but it never sends email or
messages automatically.

## Guarantees

- Local only.
- No Gmail API.
- No SMTP.
- No paid outreach services.
- No bulk sending.
- No authentication.
- The user reviews and sends any message manually outside the app.

## Lead Fields

Outreach queue metadata is stored with each lead:

- `outreach_status`
- `outreach_channel`
- `outreach_message`
- `outreach_last_generated_at`
- `outreach_last_copied_at`

Valid outreach statuses:

- `draft`
- `ready_to_review`
- `copied`
- `sent_manually`
- `replied`
- `not_interested`

An empty `outreach_status` means the lead is not in the outreach queue.

## In-App Flow

1. Open `Saved Leads`.
2. Create or import a lead.
3. Select `Generate Outreach` to create a local rule-based draft.
4. Select `Add to Outreach Queue`.
5. Choose an outreach channel such as `email`, `linkedin`, `phone`, `website`,
   or `other`.
6. Review and edit the message text.
7. Move the lead through local statuses such as `Ready to review`, `Copied`,
   `Sent manually`, or `Replied`.
8. Use `Copy Message` when browser clipboard access is available.
9. Send manually outside City Intelligence Cockpit only after review.

## Export

Use `Export Outreach Queue CSV` to export queued leads only.

CSV columns:

`name, category, website, phone, address, outreach_channel, outreach_message, outreach_status, status, notes`

Normal lead JSON and CSV exports still include all saved leads and the full lead
schema.

## Backend And Storage

Browser localStorage remains the default storage path. The optional local SQLite
backend stores the same outreach fields when the user manually syncs leads to
the backend.

The queue is intentionally a review list, not an email sender. It is suitable
for local research, drafting, and manual follow-up tracking.

## Current UI Controls

- `Generate Outreach`
- `Add to Outreach Queue`
- `Mark Ready to Review`
- `Mark Copied`
- `Mark Sent Manually`
- `Mark Replied`
- `Mark Not Interested`
- `Export Outreach Queue CSV`
