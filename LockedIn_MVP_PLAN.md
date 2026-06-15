# LockedIn MVP Implementation Plan

## Project

**LockedIn** is a federated, trust-verified, AI-native professional networking platform designed as a free and open-source alternative to LinkedIn.

The MVP goal is to build a working, polished, federation-ready professional identity platform where users can create a profile, import career history, publish posts, customize feed ranking, and show basic trust verification.

---

# 1. MVP Philosophy

LockedIn should not feel like a LinkedIn clone.

It should feel like:

- A professional identity layer
- A trust-first career network
- An open-source public profile system
- A transparent feed and discovery platform
- A future-ready federated network

## Design Principles

- Clean and calm UI
- Minimal social media noise
- Professional cards and readable layouts
- Trust badges visible but not flashy
- Feed customization should be obvious
- Open-source and self-hostable feeling
- More GitHub / Linear / Vercel style than LinkedIn clone

---

# 2. Correct MVP Build Order

Build the MVP in this exact order:

```txt
1. Prisma cleanup
2. Supabase Auth
3. User + Profile foundation
4. JSON Resume import
5. Posts + Feed
6. Feed sliders
7. Verification badge
8. Basic AI helper
9. ActivityPub foundation placeholders
10. Polish, testing, documentation, deployment
```

Why this order?

- Prisma must be stable before any feature development.
- Auth must exist before profile, posts, feed, and verification.
- Profile is the core product object.
- Import gives the MVP its strongest onboarding advantage.
- Feed and sliders prove the transparent algorithm philosophy.
- Verification adds trust.
- AI and ActivityPub should be MVP-ready but not overbuilt at first.

---

# 3. MVP Feature Scope

## Must Have

### Authentication

Users can:

- Sign up
- Log in
- Log out
- Maintain sessions
- Create a profile after signup

### Profile

Users can create and edit:

- Name
- Username
- Headline
- Bio
- Location
- Website
- GitHub URL
- Skills
- Experience
- Avatar URL

### Public Profile

Each user gets:

```txt
/profile/[username]
```

The page should show:

- Profile header
- Headline
- Bio
- Skills
- Experience
- Links
- Verification badge if verified

### Import

MVP import starts with:

- JSON Resume upload
- Parse JSON Resume
- Map data to profile fields
- Save experience and skills

LinkedIn ZIP archive import should be planned but not required for MVP v1.

### Feed

Users can:

- Create text posts
- View a feed
- See author details
- See verification status

### Feed Sliders

Users can control feed ranking using:

- Recency weight
- Verified weight
- Skill match weight

### Verification

MVP verification supports:

- User enters a company/school email or domain
- App stores verification record
- Verified badge appears on profile

Real email OTP and DNS TXT verification can come after MVP v1.

### AI Helper

MVP AI helper can include:

- Improve headline
- Rewrite bio
- Suggest profile summary

Keep the AI layer abstracted so OpenAI, Ollama, or other providers can be swapped later.

---

# 4. Recommended Tech Stack

## Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Next.js API routes
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage
- Prisma ORM

## AI

- OpenAI-compatible abstraction
- Prompt templates
- Safety logging later

## Deployment

- Vercel for frontend/API
- Supabase for database/auth/storage
- Docker later for self-hosting

---

# 5. Environment Setup

Create `.env.local`:

```env
DATABASE_URL="your_supabase_pooling_url"
DIRECT_URL="your_supabase_direct_url"

NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

OPENAI_API_KEY=""
OPENAI_API_URL="https://api.openai.com/v1"
```

Never commit `.env.local`.

---

# 6. Folder Structure

Use this structure:

```txt
src/
  app/
    page.tsx
    login/
      page.tsx
    signup/
      page.tsx
    dashboard/
      page.tsx
    profile/
      [username]/
        page.tsx
    settings/
      profile/
        page.tsx
    api/
      auth/
      profile/
        import/
          route.ts
      posts/
        route.ts
      feed/
        route.ts
      verification/
        route.ts
      ai/
        profile/
          route.ts

  components/
    layout/
      AppShell.tsx
      Navbar.tsx
      Sidebar.tsx
    auth/
      LoginForm.tsx
      SignupForm.tsx
    profile/
      ProfileHeader.tsx
      ProfileCard.tsx
      EditProfileForm.tsx
      ExperienceSection.tsx
      SkillsSection.tsx
      JsonResumeUploader.tsx
    feed/
      CreatePostCard.tsx
      FeedPostCard.tsx
      FeedSliderControls.tsx
    verification/
      VerifiedBadge.tsx
      VerificationForm.tsx
    ui/

  lib/
    prisma/
      client.ts
    supabase/
      client.ts
      server.ts
    crypto/
      keys.ts
    feed/
      score.ts
    resume/
      parse-json-resume.ts
    ai/
      client.ts
      prompts.ts

prisma/
  schema.prisma
```

---

# 7. Prisma Schema

Replace or clean `prisma/schema.prisma` with this MVP schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id             String   @id @default(uuid())
  email          String   @unique
  name           String
  username       String   @unique
  publicKey      String?
  privateKey     String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  profile        Profile?
  posts          Post[]
  comments       Comment[]
  likes          Like[]
  feedPreference FeedPreference?
}

model Profile {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  headline       String?
  bio            String?
  location       String?
  website        String?
  githubUrl      String?
  avatarUrl      String?
  jsonResumeData Json?

  experiences    Experience[]
  skills         UserSkill[]
  verifications  Verification[]
}

model Experience {
  id          String   @id @default(uuid())
  profileId   String
  profile     Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

  company     String
  role        String
  startDate   DateTime?
  endDate     DateTime?
  description String?
}

model Skill {
  id       String      @id @default(uuid())
  name     String      @unique
  profiles UserSkill[]
}

model UserSkill {
  profileId String
  skillId   String

  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)
  skill     Skill   @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([profileId, skillId])
}

model Verification {
  id         String   @id @default(uuid())
  profileId  String
  profile    Profile  @relation(fields: [profileId], references: [id], onDelete: Cascade)

  domain     String
  method     String
  verifiedAt DateTime @default(now())
}

model Post {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  content   String
  apId      String   @unique
  local     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  comments  Comment[]
  likes     Like[]
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  content   String
  createdAt DateTime @default(now())

  post      Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Like {
  userId String
  postId String

  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@id([userId, postId])
}

model FeedPreference {
  id             String @id @default(uuid())
  userId         String @unique
  user           User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  recencyWeight  Float  @default(0.5)
  verifiedWeight Float  @default(0.3)
  skillWeight    Float  @default(0.2)
}
```

Run:

```bash
npx prisma generate
npx prisma db push
```

---

# 8. Step-by-Step Implementation

## Step 1: Prisma Client

Create:

```txt
src/lib/prisma/client.ts
```

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## Step 2: Supabase Browser Client

Create:

```txt
src/lib/supabase/client.ts
```

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

---

## Step 3: Supabase Server Client

Create:

```txt
src/lib/supabase/server.ts
```

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component cookie write fallback
          }
        },
      },
    }
  );
}
```

---

## Step 4: Cryptographic Key Utility

Create:

```txt
src/lib/crypto/keys.ts
```

```ts
import crypto from "crypto";

export function generateUserKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    publicKey,
    privateKey,
  };
}
```

For MVP, store the private key directly only in development. Before production, encrypt it using a server-side encryption key.

---

## Step 5: Signup Flow

Create signup page:

```txt
src/app/signup/page.tsx
```

Signup should:

1. Create Supabase Auth user
2. Create local `User`
3. Create local `Profile`
4. Create `FeedPreference`
5. Generate RSA keys
6. Redirect to `/settings/profile`

Required fields:

```txt
name
username
email
password
```

---

## Step 6: Login Flow

Create login page:

```txt
src/app/login/page.tsx
```

Login should:

1. Authenticate with Supabase
2. Redirect to `/dashboard`

---

## Step 7: Landing Page

Create:

```txt
src/app/page.tsx
```

Landing page sections:

```txt
Hero
Value proposition
How LockedIn is different
Trust verification
Transparent feed controls
Open-source CTA
```

Hero copy:

```txt
Own your professional identity.
Verify your trust.
Control your feed.
```

---

## Step 8: Profile Edit Page

Create:

```txt
src/app/settings/profile/page.tsx
```

Create component:

```txt
src/components/profile/EditProfileForm.tsx
```

Fields:

```txt
name
headline
bio
location
website
githubUrl
skills
experience
```

Acceptance criteria:

- User can update profile
- Saved data appears on public profile
- Empty fields do not break UI

---

## Step 9: Public Profile Page

Create:

```txt
src/app/profile/[username]/page.tsx
```

Public profile should show:

```txt
Name
Username
Headline
Bio
Location
Website
GitHub
Skills
Experience
Verified badge
Recent posts
```

Use components:

```txt
ProfileHeader
SkillsSection
ExperienceSection
VerifiedBadge
```

---

## Step 10: JSON Resume Import

Create parser:

```txt
src/lib/resume/parse-json-resume.ts
```

```ts
export function parseJsonResume(data: any) {
  return {
    basics: {
      name: data.basics?.name ?? "",
      headline: data.basics?.label ?? "",
      bio: data.basics?.summary ?? "",
      location: data.basics?.location?.city ?? "",
      website: data.basics?.url ?? "",
    },
    skills: Array.isArray(data.skills)
      ? data.skills.flatMap((skill: any) => skill.keywords ?? [skill.name]).filter(Boolean)
      : [],
    experience: Array.isArray(data.work)
      ? data.work.map((work: any) => ({
          company: work.name ?? "",
          role: work.position ?? "",
          startDate: work.startDate ? new Date(work.startDate) : null,
          endDate: work.endDate ? new Date(work.endDate) : null,
          description: work.summary ?? "",
        }))
      : [],
  };
}
```

Create API:

```txt
src/app/api/profile/import/route.ts
```

The API should:

1. Accept JSON body
2. Parse JSON Resume
3. Update profile
4. Replace or append skills
5. Replace or append experience
6. Store raw JSON in `jsonResumeData`

---

## Step 11: JSON Resume Uploader Component

Create:

```txt
src/components/profile/JsonResumeUploader.tsx
```

Flow:

```txt
Choose file
Read file as text
JSON.parse
POST to /api/profile/import
Show success message
Refresh profile
```

---

## Step 12: Post Creation

Create API:

```txt
src/app/api/posts/route.ts
```

POST should:

- Require authenticated user
- Validate content length
- Create post
- Generate `apId`

Example `apId`:

```txt
${NEXT_PUBLIC_APP_URL}/posts/${postId}
```

Create component:

```txt
src/components/feed/CreatePostCard.tsx
```

Acceptance criteria:

- User can create a post
- Empty posts are rejected
- Post appears in dashboard feed

---

## Step 13: Feed Scoring Utility

Create:

```txt
src/lib/feed/score.ts
```

```ts
export function calculatePostScore(input: {
  recencyWeight: number;
  verifiedWeight: number;
  skillWeight: number;
  recencyScore: number;
  verifiedScore: number;
  skillScore: number;
}) {
  return (
    input.recencyWeight * input.recencyScore +
    input.verifiedWeight * input.verifiedScore +
    input.skillWeight * input.skillScore
  );
}
```

---

## Step 14: Feed API

Create:

```txt
src/app/api/feed/route.ts
```

Feed API should:

1. Read user feed preferences
2. Fetch posts with authors, profiles, skills, verification records
3. Calculate scores
4. Sort posts by score
5. Return ranked posts

For MVP:

```txt
recencyScore = newer posts get higher score
verifiedScore = author has verification ? 1 : 0
skillScore = shared skill count / max possible skill count
```

---

## Step 15: Feed Slider Controls

Create:

```txt
src/components/feed/FeedSliderControls.tsx
```

Sliders:

```txt
Recency
Verified
Skills
```

Behavior:

- Save preferences
- Refresh feed
- Show values clearly

Acceptance criteria:

- User can adjust sliders
- Feed order changes
- Slider state persists

---

## Step 16: Dashboard Page

Create:

```txt
src/app/dashboard/page.tsx
```

Dashboard contains:

```txt
CreatePostCard
FeedSliderControls
Feed list
Profile completion card
Verification prompt
```

---

## Step 17: Verification MVP

Create component:

```txt
src/components/verification/VerificationForm.tsx
```

Create API:

```txt
src/app/api/verification/route.ts
```

MVP behavior:

1. User enters email or domain
2. Extract domain
3. Save verification record
4. Show badge on profile

Later production behavior:

- Send email OTP
- Verify code
- DNS TXT challenge
- Rate limit attempts

---

## Step 18: Verified Badge

Create:

```txt
src/components/verification/VerifiedBadge.tsx
```

Badge states:

```txt
Verified domain
Unverified
Pending verification
```

UI copy:

```txt
Verified professional domain
```

---

## Step 19: AI Profile Helper

Create API:

```txt
src/app/api/ai/profile/route.ts
```

Create abstraction:

```txt
src/lib/ai/client.ts
src/lib/ai/prompts.ts
```

MVP AI actions:

```txt
Improve headline
Rewrite bio
Suggest profile summary
```

Rules:

- Do not send secrets to client
- Keep prompts short
- Log only metadata later
- Never overwrite profile automatically without user approval

---

## Step 20: ActivityPub Foundation Placeholders

Do not build full federation in MVP v1.

Only add placeholders:

```txt
src/app/.well-known/webfinger/route.ts
src/app/users/[username]/route.ts
```

MVP behavior:

- Return basic actor-style JSON
- Use public key from user record
- Keep inbox/outbox for later

---

# 9. UI Component Checklist

## Layout

- Navbar
- Sidebar
- AppShell
- PageContainer

## Auth

- SignupForm
- LoginForm

## Profile

- ProfileHeader
- ProfileCard
- EditProfileForm
- JsonResumeUploader
- ExperienceSection
- SkillsSection

## Feed

- CreatePostCard
- FeedPostCard
- FeedSliderControls

## Verification

- VerificationForm
- VerifiedBadge

## Shared UI

- Button
- Input
- Textarea
- Card
- Badge
- Avatar
- Tabs
- Slider
- Toast

---

# 10. MVP Pages Checklist

```txt
/                         Landing page
/signup                   Signup page
/login                    Login page
/dashboard                Main feed dashboard
/settings/profile         Edit profile/import/verify
/profile/[username]       Public profile
```

---

# 11. GitHub Issues to Create

Create these issues in order:

## Foundation

1. Clean Prisma schema for MVP
2. Configure Supabase environment
3. Create Prisma client utility
4. Create Supabase client utilities
5. Add base app layout

## Auth

6. Build signup page
7. Build login page
8. Create user/profile after signup
9. Generate RSA keypair on signup

## Profile

10. Build edit profile form
11. Build public profile page
12. Build skills section
13. Build experience section

## Import

14. Build JSON Resume parser
15. Build JSON Resume import API
16. Build resume uploader component

## Feed

17. Build post model API
18. Build create post component
19. Build feed API
20. Build feed post card
21. Build feed slider controls

## Verification

22. Build verification API
23. Build verification form
24. Build verified badge component

## AI

25. Build AI abstraction client
26. Build headline improvement API
27. Build bio rewrite API

## Polish

28. Add responsive dashboard
29. Add empty states
30. Add loading states
31. Add error states
32. Add seed data
33. Add README setup guide
34. Add basic tests
35. Run production build fix pass

---

# 12. Sprint Plan

## Sprint 1: Foundation and Auth

Goal:

```txt
A user can sign up, log in, and get a local profile record.
```

Tasks:

- Prisma cleanup
- Supabase setup
- Auth pages
- User/Profile creation
- RSA keypair generation

Done when:

```txt
User can sign up and see dashboard.
```

---

## Sprint 2: Profile and Import

Goal:

```txt
A user can create a professional profile and import JSON Resume data.
```

Tasks:

- Edit profile page
- Public profile page
- Skills and experience UI
- JSON Resume parser
- JSON Resume uploader

Done when:

```txt
Uploaded resume data appears on public profile.
```

---

## Sprint 3: Feed and Sliders

Goal:

```txt
A user can post updates and control feed ranking.
```

Tasks:

- Create post API
- Feed API
- Feed cards
- Feed slider controls
- Save feed preferences

Done when:

```txt
Changing sliders changes the feed order.
```

---

## Sprint 4: Verification and Trust

Goal:

```txt
A user can add a verified domain badge.
```

Tasks:

- Verification API
- Verification form
- Verified badge component
- Show badge on profile and feed

Done when:

```txt
Verified users display a trust badge.
```

---

## Sprint 5: AI, Polish, and Launch Readiness

Goal:

```txt
The MVP feels polished and ready for public demo.
```

Tasks:

- AI headline helper
- AI bio helper
- Empty states
- Loading states
- Error states
- Mobile responsiveness
- README setup guide
- Production build

Done when:

```txt
npm run build succeeds and demo flow works end-to-end.
```

---

# 13. Demo Flow

The MVP demo should follow this path:

```txt
1. User opens landing page
2. User signs up
3. User lands on profile setup
4. User imports JSON Resume
5. Profile is auto-filled
6. User edits headline and bio
7. User verifies a domain
8. User creates a post
9. User adjusts feed sliders
10. User opens public profile
```

---

# 14. Testing Checklist

## Auth

- Signup works
- Login works
- Logout works
- Invalid login shows error

## Profile

- Profile update works
- Public profile loads
- Missing fields do not break page
- Skills render correctly
- Experience renders correctly

## Import

- Valid JSON Resume imports
- Invalid JSON shows error
- Empty resume does not crash app

## Feed

- Post creation works
- Empty post is rejected
- Feed loads posts
- Feed scoring works
- Sliders persist

## Verification

- Domain is saved
- Badge appears on profile
- Badge appears in feed

## Build

Run:

```bash
npm run lint
npm run build
```

---

# 15. MVP Acceptance Criteria

The MVP is complete when:

```txt
User can sign up and log in
User profile is created automatically
User can edit profile
User can import JSON Resume
User can view public profile
User can create posts
User can see feed
User can adjust feed sliders
User can add verification badge
App is responsive
App builds successfully
README explains local setup
```

---

# 16. What Not to Build in MVP v1

Do not build these yet:

```txt
Full ActivityPub federation
Real remote inbox/outbox delivery
Full LinkedIn ZIP parser
Company pages
Messaging
Notifications
Mobile app
Recruiter ATS APIs
Advanced moderation
DID login
Payment system
```

These are important later, but they will slow down MVP delivery.

---

# 17. Final MVP Roadmap

```txt
Phase 1: Foundation
Prisma + Supabase + Auth

Phase 2: Identity
Profile + Public Profile + Import

Phase 3: Network
Posts + Feed + Feed Sliders

Phase 4: Trust
Verification + Badges

Phase 5: Intelligence
AI Profile Helper

Phase 6: Launch
Polish + Tests + Docs + Deployment
```

---

# 18. Final Developer Rule

Every feature must follow this rule:

```txt
Does this strengthen professional identity, trust, portability, or transparent discovery?
```

If yes, build it.

If no, postpone it.
