# -*- coding: utf-8 -*-
"""Generate the SkillForge Product & Technical Guide PDF."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem, KeepTogether, HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# ---- Brand palette ---------------------------------------------------------
ORANGE = HexColor(0xF97316)
ORANGE_D = HexColor(0xEA580C)
NAVY = HexColor(0x26344E)
INK = HexColor(0x0F172A)
MUTED = HexColor(0x64748B)
LIGHT = HexColor(0xF1F5F9)
LINE = HexColor(0xE2E8F0)
VIOLET = HexColor(0x8B5CF6)
EMER = HexColor(0x10B981)
SKY = HexColor(0x0EA5E9)
WHITE = colors.white

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "SkillForge-Guide.pdf")

# ---- Styles ----------------------------------------------------------------
ss = getSampleStyleSheet()
def S(name, **kw):
    return ParagraphStyle(name, **kw)

body = S('body', fontName='Helvetica', fontSize=10, leading=15, textColor=INK,
         alignment=TA_JUSTIFY, spaceAfter=6)
bodyL = S('bodyL', parent=body, alignment=TA_LEFT)
lead = S('lead', fontName='Helvetica', fontSize=11.5, leading=17, textColor=MUTED,
         alignment=TA_LEFT, spaceAfter=8)
h1 = S('h1', fontName='Helvetica-Bold', fontSize=18, leading=22, textColor=NAVY,
       spaceBefore=6, spaceAfter=2)
h2 = S('h2', fontName='Helvetica-Bold', fontSize=12.5, leading=16, textColor=ORANGE_D,
       spaceBefore=12, spaceAfter=4)
h3 = S('h3', fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=NAVY,
       spaceBefore=8, spaceAfter=2)
small = S('small', fontName='Helvetica', fontSize=8.5, leading=12, textColor=MUTED)
klabel = S('klabel', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=WHITE)
cellH = S('cellH', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=WHITE)
cell = S('cell', fontName='Helvetica', fontSize=9, leading=12.5, textColor=INK)
cellB = S('cellB', fontName='Helvetica-Bold', fontSize=9, leading=12.5, textColor=NAVY)
cellM = S('cellM', fontName='Helvetica', fontSize=8.7, leading=12, textColor=MUTED)
mono = S('mono', fontName='Courier', fontSize=8.6, leading=12, textColor=NAVY)
monoLight = S('monoLight', fontName='Courier', fontSize=8.6, leading=13, textColor=HexColor(0xE8EEF7))

story = []

def section(num, title):
    story.append(Spacer(1, 6))
    bar = Table([[Paragraph(f'<font color="#F97316">{num}</font>&nbsp;&nbsp;{title}', h1)]],
                colWidths=[165*mm])
    bar.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 2, ORANGE),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bar)
    story.append(Spacer(1, 6))

def p(txt, style=body):
    story.append(Paragraph(txt, style))

def bullets(items, style=bodyL):
    items2 = [ListItem(Paragraph(t, style), leftIndent=6, value='•',
                       bulletColor=ORANGE) for t in items]
    story.append(ListFlowable(items2, bulletType='bullet', start='•',
                              leftIndent=12, bulletFontName='Helvetica-Bold'))
    story.append(Spacer(1, 4))

def tbl(rows, widths, header=True, zebra=True, header_bg=NAVY, align_left=True):
    data = []
    for r_i, row in enumerate(rows):
        cells = []
        for c_i, c in enumerate(row):
            if isinstance(c, Paragraph):
                cells.append(c)
            else:
                st = cellH if (header and r_i == 0) else cell
                cells.append(Paragraph(str(c), st))
        data.append(cells)
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    style = [
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, LINE),
    ]
    if header:
        style += [('BACKGROUND', (0,0), (-1,0), header_bg),
                  ('TOPPADDING', (0,0), (-1,0), 7),
                  ('BOTTOMPADDING', (0,0), (-1,0), 7)]
    if zebra:
        for i in range(1, len(data)):
            if i % 2 == 0:
                style.append(('BACKGROUND', (0,i), (-1,i), LIGHT))
    t.setStyle(TableStyle(style))
    story.append(t)
    story.append(Spacer(1, 8))

# ============================================================ COVER
def cover():
    story.append(Spacer(1, 40))
    logo = Table([[Paragraph('SkillForge', S('logo', fontName='Helvetica-Bold',
                   fontSize=40, textColor=WHITE, leading=44))]], colWidths=[165*mm])
    logo.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), NAVY),
        ('TOPPADDING', (0,0), (-1,-1), 26),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
    ]))
    story.append(logo)
    tag = Table([[Paragraph('Turn Skills Into Successful Businesses.',
                  S('tag', fontName='Helvetica-Bold', fontSize=14, textColor=WHITE))]],
                colWidths=[165*mm])
    tag.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ORANGE),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
    ]))
    story.append(tag)
    story.append(Spacer(1, 34))
    p('Product &amp; Technical Guide', S('ct', fontName='Helvetica-Bold', fontSize=26,
      textColor=NAVY, leading=30))
    p('A complete walkthrough of what SkillForge is, how it works, how it is built, '
      'and how to run it — the entrepreneurship enablement platform that matches your '
      'skills to real businesses and guides you from idea to first revenue.',
      S('cl', fontName='Helvetica', fontSize=11.5, textColor=MUTED, leading=17))
    story.append(Spacer(1, 26))
    story.append(HRFlowable(width='100%', thickness=1, color=LINE))
    story.append(Spacer(1, 14))
    meta = Table([
        [Paragraph('Platform', cellM), Paragraph('Full-stack web application (Next.js 15 + Express + PostgreSQL)', cellB)],
        [Paragraph('Designed &amp; Developed by', cellM), Paragraph('V. Saatwik Sairaam', cellB)],
        [Paragraph('Document', cellM), Paragraph('Product &amp; Technical Guide, Edition 1', cellB)],
    ], colWidths=[45*mm, 120*mm])
    meta.setStyle(TableStyle([
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
        ('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),
        ('LEFTPADDING',(0,0),(-1,-1),0),
    ]))
    story.append(meta)
    story.append(Spacer(1, 40))
    note = Table([[Paragraph('Copyright 2026 SkillForge &nbsp;•&nbsp; All Rights Reserved &nbsp;•&nbsp; '
                   'Designed &amp; Developed by V. Saatwik Sairaam', small)]], colWidths=[165*mm])
    note.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),LIGHT),
        ('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8),
        ('LEFTPADDING',(0,0),(-1,-1),12)]))
    story.append(note)
    story.append(PageBreak())

cover()

# ============================================================ 1. OVERVIEW
section('01', 'What is SkillForge?')
p('SkillForge is an end-to-end <b>entrepreneurship enablement platform</b>. It helps '
  'everyday people — home cooks, tailors, designers, students, makers — discover a '
  'business that fits their skills and budget, learn exactly what they need, follow a '
  'step-by-step roadmap, get guidance from verified mentors, and launch their own '
  'micro-enterprise.')
p('Think of it as a <b>startup accelerator operating system</b>: instead of a vague '
  '"go start a business", every user gets a matched idea, a learning path, a checklist, '
  'and a community — all the way to their first Rs. 10,000 in revenue.')
p('<b>The problem it solves.</b> Most first-time founders in India do not lack skill — '
  'they lack a clear, trustworthy path: which business fits me, what will it cost, what '
  'do I need to learn, and what do I do first? SkillForge turns that uncertainty into a '
  'guided, measurable journey.', bodyL)
story.append(Spacer(1, 4))
p('Who it is for', h2)
tbl([
    ['Role', 'What they do on the platform'],
    ['Visitor', 'Browses business ideas, learning resources and the community without an account.'],
    ['Entrepreneur', 'Takes a skill assessment, gets matched ideas, follows roadmaps, learns, earns certificates.'],
    ['Mentor', 'Applies, gets verified, accepts session bookings, reviews, and runs a mentor dashboard.'],
    ['Admin', 'Manages users, verifies mentors, approves content, handles complaints, posts announcements.'],
], [32*mm, 133*mm])

# ============================================================ 2. FEATURES
section('02', 'What You Can Do (Features)')
p('SkillForge is organised into modules that cover the whole journey from discovery to launch.')
tbl([
    ['Area', 'Highlights'],
    ['Discovery', 'Skill &amp; interest assessment, business readiness score, and a recommendation engine that ranks ideas by fit.'],
    ['Business ideas', 'Rich detail pages: overview, market demand, SWOT, investment breakdown, licenses, marketing, risks, revenue model, lean canvas, launch checklist.'],
    ['Roadmaps', 'Interactive 14-step journey per business with per-user progress tracking (idea validation to first customer to scale).'],
    ['Learning', 'Video / article / PDF / template resources with lessons, enrollment, progress, and auto-issued certificates.'],
    ['Mentors', 'Verified mentor profiles, session booking, ratings &amp; reviews, and a mentor dashboard.'],
    ['Community', 'Forum with success stories and questions, threaded comments, likes, and trending tags.'],
    ['Dashboard', 'Readiness &amp; profile rings, saved ideas, learning progress, certificates, achievements, upcoming sessions.'],
    ['Notifications', 'In-app notifications across roadmap, learning, mentor, community, achievements and certificates.'],
    ['Admin console', 'Analytics overview, user management, mentor verification, content approval, complaints, announcements.'],
], [30*mm, 135*mm])

# ============================================================ 3. TECH STACK
section('03', 'Technology Stack')
tbl([
    ['Layer', 'Technology', 'Why'],
    ['Frontend', 'Next.js 15 (App Router), React 19, TypeScript', 'Modern, fast, SEO-friendly, type-safe UI.'],
    ['Styling', 'Tailwind CSS, shadcn-style UI, Framer Motion', 'Consistent design system, smooth animation, dark mode.'],
    ['Backend', 'Node.js, Express, TypeScript', 'Lightweight, well-understood REST API.'],
    ['Database', 'PostgreSQL 16 + Prisma ORM', 'Relational integrity with a fully type-safe data layer.'],
    ['Auth', 'JWT access + rotating refresh tokens, bcrypt, OTP, Google', 'Secure, stateless, revocable sessions.'],
    ['Validation', 'Zod', 'Every request validated before it reaches business logic.'],
    ['Media / Email', 'Cloudinary, Nodemailer', 'Offloaded uploads and transactional email.'],
    ['Ops', 'Docker, Docker Compose', 'One-command local + reproducible deploys.'],
], [26*mm, 74*mm, 65*mm])

# ============================================================ 4. ARCHITECTURE
section('04', 'How It Is Built (Architecture)')
p('SkillForge is a <b>decoupled full-stack application</b> split into two deployable apps '
  'that share a typed contract: a Next.js web client and an Express API, backed by PostgreSQL.')
p('Layered (Clean) Architecture', h2)
p('Every backend feature is a module with the same internal layering. A request flows '
  'strictly inward, and each layer has one job:')
tbl([
    ['Layer', 'Responsibility'],
    ['Route', 'Declares HTTP endpoints and wires middleware (auth, RBAC, validation).'],
    ['Controller', 'Thin. Parses the request, calls a service, shapes the response. No business logic.'],
    ['Service', 'The heart. Owns business rules, orchestration and transactions. Never touches req / res.'],
    ['Repository', 'The only layer that talks to Prisma. Keeps services persistence-agnostic.'],
], [30*mm, 135*mm])
p('Request lifecycle', h2)
flow = Table([[
    Paragraph('Browser', S('f', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
    Paragraph('->', cell),
    Paragraph('Middleware<br/><font size=7>Helmet · CORS · rate-limit<br/>auth · RBAC · Zod</font>', S('f2', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, alignment=TA_CENTER, leading=11)),
    Paragraph('->', cell),
    Paragraph('Controller -> Service -> Repository', S('f3', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
    Paragraph('->', cell),
    Paragraph('PostgreSQL', S('f4', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
]], colWidths=[24*mm, 6*mm, 45*mm, 6*mm, 55*mm, 6*mm, 23*mm])
flow.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(0,0),ORANGE), ('BACKGROUND',(2,0),(2,0),VIOLET),
    ('BACKGROUND',(4,0),(4,0),SKY), ('BACKGROUND',(6,0),(6,0),EMER),
    ('VALIGN',(0,0),(-1,-1),'MIDDLE'), ('ALIGN',(0,0),(-1,-1),'CENTER'),
    ('TOPPADDING',(0,0),(-1,-1),9),('BOTTOMPADDING',(0,0),(-1,-1),9),
    ('ROUNDEDCORNERS',[4,4,4,4]),
]))
story.append(flow)
story.append(Spacer(1, 10))
p('Built to scale', h2)
bullets([
    '<b>Stateless API</b> — no server-side session, so it scales horizontally behind a load balancer.',
    '<b>Normalized database</b> with indexed foreign keys and pagination on every list endpoint.',
    '<b>Caching-ready</b> — the service layer is the natural seam to add Redis for hot reads.',
    '<b>Media offloaded</b> to Cloudinary; app servers stay stateless and container-friendly.',
])
story.append(PageBreak())

# ============================================================ 5. HOW IT WORKS
section('05', 'How It Works — User Journeys')
p('The Entrepreneur journey', h2)
tbl([
    ['Step', 'What happens'],
    ['1. Sign up', 'Create an account (email + password or Google); a 6-digit code verifies the email.'],
    ['2. Assessment', 'Pick skills &amp; interests, set budget, experience, available time and preferred business type.'],
    ['3. Readiness score', 'The platform computes a 0-100 business readiness score and profile completion.'],
    ['4. Recommendations', 'The engine ranks business ideas by how well they match the profile (see Section 6).'],
    ['5. Explore an idea', 'Open a rich business page: investment, SWOT, licenses, marketing, revenue model, checklist.'],
    ['6. Start a roadmap', 'Begin the 14-step launch roadmap; mark steps complete and watch progress update.'],
    ['7. Learn', 'Enroll in short courses; completing one issues a downloadable certificate.'],
    ['8. Get mentored', 'Browse verified mentors and book a session; leave a rating afterwards.'],
    ['9. Community', 'Ask questions, share a success story, like and comment.'],
], [34*mm, 131*mm])
p('The Mentor journey', h2)
bullets([
    '<b>Apply</b> with a headline, areas of expertise, experience and languages — the account is upgraded to Mentor.',
    '<b>Verification</b> by an admin moves the profile from Pending to Verified before it appears publicly.',
    '<b>Sessions</b> — accept, confirm, complete or cancel booking requests from entrepreneurs.',
    '<b>Reputation</b> — completed sessions can be reviewed; the profile rating recomputes automatically.',
    '<b>Dashboard</b> — students, sessions by status, and average rating at a glance.',
])
p('The Admin journey', h2)
bullets([
    '<b>Overview</b> — live counts of users by role, ideas, resources, mentors, sessions, posts and open complaints.',
    '<b>People</b> — search users, toggle active state, change roles; approve or reject pending mentors.',
    '<b>Content</b> — move businesses and learning resources through Draft / Review / Published / Archived.',
    '<b>Support</b> — triage complaints and broadcast announcements.',
])

# ============================================================ 6. RECOMMENDATION ENGINE
section('06', 'The Recommendation Engine')
p('The engine scores every published business against the user profile and returns the '
  'top matches with a <b>match score from 0 to 100</b> and the list of matched skills. '
  'When a signed-in user asks for recommendations with no inputs, the engine reads their '
  'saved assessment automatically.')
tbl([
    ['Factor', 'Max points', 'How it is scored'],
    ['Skill overlap', '60', 'Weighted fraction of the business\'s required skills the user has (each skill weighted).'],
    ['Budget fit', '25', 'Full points when the budget comfortably covers the range; scaled down toward the minimum; 0 if below entry cost.'],
    ['Type fit', '10', 'Matches preferred business type (home / online / offline / hybrid).'],
    ['Growth potential', '5', 'High +5, Medium +3, Low +1 — a nudge toward higher-upside ideas.'],
], [34*mm, 22*mm, 109*mm])
p('<b>Worked example.</b> For the demo entrepreneur "Priya" (skills: Cooking, Baking, '
  'Digital Marketing; budget Rs. 50,000; prefers a home business), the engine returns '
  '<b>Home Catering with a match score of 100</b> — full skill overlap, comfortable budget, '
  'matching type, and high growth. This was verified live against the running API.', bodyL)

# ============================================================ 7. DATABASE
section('07', 'Database Design')
p('A normalized PostgreSQL schema managed with Prisma — 30+ models. The core entities:')
tbl([
    ['Group', 'Models'],
    ['Identity', 'User, RefreshToken, OtpToken'],
    ['Profile', 'Skill, Interest, UserSkill, UserInterest'],
    ['Catalog', 'Category, Business, BusinessSkill'],
    ['Roadmaps', 'Roadmap, RoadmapStep, UserRoadmap, UserRoadmapStep'],
    ['Learning', 'LearningResource, Lesson, Enrollment, LessonProgress, Certificate'],
    ['Mentoring', 'MentorProfile, MentorSession, MentorReview'],
    ['Community', 'ForumPost, Comment, PostLike'],
    ['Engagement', 'Bookmark, Notification, Achievement, UserAchievement'],
    ['Admin', 'Complaint, Announcement'],
], [30*mm, 135*mm])
p('Every table carries created / updated audit timestamps, foreign keys are indexed, and '
  'join tables that hold extra data (like skill weights or step progress) are modelled '
  'explicitly.', bodyL)

# ============================================================ 8. SECURITY
section('08', 'Security &amp; Authentication')
tbl([
    ['Control', 'Implementation'],
    ['Password storage', 'bcrypt hashing (cost 12); OAuth-only accounts store no password.'],
    ['Sessions', 'Short-lived JWT access token (15 min) + long-lived refresh token, rotated on every use.'],
    ['Token revocation', 'Refresh tokens are stored server-side and can be revoked per device; reset revokes all.'],
    ['Email / reset', 'One-time 6-digit codes (hashed, expiring) for verification and password reset.'],
    ['Google login', 'ID token verified server-side, linked or created by Google account id.'],
    ['Authorization', 'Role-based access control (Visitor / Entrepreneur / Mentor / Admin) on every privileged route.'],
    ['Transport / headers', 'Helmet security headers, strict CORS allowlist, secure httpOnly cookies.'],
    ['Abuse protection', 'Global rate limiting plus a stricter limiter on auth endpoints.'],
    ['Input safety', 'Zod validation on every request body, query and params before controllers run.'],
], [34*mm, 131*mm])

# ============================================================ 9. API
section('09', 'API Reference (selected)')
p('All responses use one envelope: <font name="Courier">{ success, message, data, meta }</font>. '
  'Lists include <font name="Courier">meta.pagination</font>. Base path: '
  '<font name="Courier">/api/v1</font>.')
tbl([
    ['Module', 'Representative endpoints'],
    ['auth', 'POST /auth/register · /login · /refresh · /google · /verify-otp · /forgot-password · /reset-password'],
    ['users', 'GET /users/me/dashboard · PUT /users/me/assessment · GET/POST/DELETE /users/me/bookmarks'],
    ['businesses', 'GET /businesses · GET /businesses/:slug · POST /businesses/recommend'],
    ['roadmaps', 'POST /roadmaps/:id/start · GET /roadmaps/me · PATCH /roadmaps/me/steps/:id'],
    ['learning', 'GET /learning/resources · POST /learning/resources/:id/enroll · PATCH /learning/me/lessons/:id'],
    ['mentors', 'GET /mentors · POST /mentors/apply · POST /mentors/:id/book · POST /mentors/sessions/:id/review'],
    ['community', 'GET /community/posts · POST /community/posts · POST /community/posts/:id/like'],
    ['notifications', 'GET /notifications · PATCH /notifications/read-all'],
    ['admin', 'GET /admin/overview · PATCH /admin/mentors/:id/verify · GET /admin/users'],
], [26*mm, 139*mm])

# ============================================================ 10. RUNNING
section('10', 'Running It Locally')
p('Prerequisites: Node.js 20+, npm, and Docker (for PostgreSQL).')
p('Quick start', h2)
steps = [
    'npm install &amp;&amp; npm run setup   # root tooling + both apps',
    'cp apps/api/.env.example apps/api/.env',
    'cp apps/web/.env.example apps/web/.env.local',
    'docker compose up -d db          # start PostgreSQL',
    'npm run db:deploy                # create tables',
    'npm run db:seed                  # demo users, ideas, mentors, roadmaps, community',
    'npm run dev                      # API on :4000 + web on http://localhost:3000',
]
code = Table([[Paragraph(s, monoLight)] for s in steps], colWidths=[165*mm])
code.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),HexColor(0x0B1220)),
    ('TEXTCOLOR',(0,0),(-1,-1),HexColor(0xE8EEF7)),
    ('LEFTPADDING',(0,0),(-1,-1),12),('RIGHTPADDING',(0,0),(-1,-1),12),
    ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3),
    ('TOPPADDING',(0,0),(-1,0),9),('BOTTOMPADDING',(0,-1),(-1,-1),9),
]))
# recolor mono for dark bg
for i, s in enumerate(steps):
    pass
story.append(code)
story.append(Spacer(1, 8))
p('Demo accounts (after seeding)', h2)
tbl([
    ['Role', 'Email', 'Password'],
    ['Admin', 'admin@skillforge.app', 'Password123'],
    ['Mentor', 'mentor@skillforge.app', 'Password123'],
    ['Entrepreneur', 'priya@skillforge.app', 'Password123'],
], [34*mm, 86*mm, 45*mm])
p('Email delivery (SMTP), file uploads (Cloudinary) and Google login are wired in code and '
  'activate as soon as real credentials are added to the environment file. In development, '
  'one-time codes are printed to the API console.', small)

# ============================================================ 11. VERIFICATION
section('11', 'Quality &amp; Verification')
p('The platform was verified live, end to end, against the running stack with real '
  'authentication tokens and seeded data.')
tbl([
    ['Check', 'Result'],
    ['Backend API smoke test', 'All exercised endpoints working across every module (auth, users, businesses, roadmaps, learning, mentors, community, notifications, admin).'],
    ['Auth &amp; security', 'Login, refresh-token rotation, RBAC blocked with 403, bad password 401, invalid input 422 — all correct.'],
    ['Recommendation engine', 'Returns Home Catering at match score 100 for the demo profile.'],
    ['Writes persist', 'Bookmark create/list/delete, roadmap start, community like, learning enroll — all confirmed.'],
    ['Unit tests', '9 / 9 passed (recommendation scoring + password hashing).'],
    ['Type safety', 'TypeScript compiles with 0 errors on both client and server.'],
    ['Production build', 'Next.js build succeeds for all 36 routes.'],
], [42*mm, 123*mm])

story.append(Spacer(1, 16))
story.append(HRFlowable(width='100%', thickness=2, color=ORANGE))
story.append(Spacer(1, 10))
credit = Table([[Paragraph(
    '<b><font size=13 color="#26344E">SkillForge</font></b><br/>'
    '<font color="#64748B">Turn Skills Into Successful Businesses</font><br/><br/>'
    '<font size=9 color="#64748B">Copyright 2026 SkillForge</font><br/>'
    '<font size=10>Designed &amp; Developed by <b><font color="#EA580C">V. Saatwik Sairaam</font></b></font><br/>'
    '<font size=8 color="#94A3B8">All Rights Reserved</font>',
    S('cr', fontName='Helvetica', alignment=TA_CENTER, leading=15))]], colWidths=[165*mm])
credit.setStyle(TableStyle([('ALIGN',(0,0),(-1,-1),'CENTER')]))
story.append(credit)

# ============================================================ BUILD
def footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.5)
    canvas.line(22*mm, 14*mm, w-22*mm, 14*mm)
    canvas.setFont('Helvetica', 8); canvas.setFillColor(MUTED)
    canvas.drawString(22*mm, 9*mm, 'SkillForge - Product & Technical Guide')
    canvas.drawCentredString(w/2, 9*mm, 'Designed & Developed by V. Saatwik Sairaam')
    canvas.drawRightString(w-22*mm, 9*mm, f'Page {doc.page}')
    canvas.restoreState()

doc = BaseDocTemplate(OUT, pagesize=A4,
    leftMargin=22*mm, rightMargin=22*mm, topMargin=18*mm, bottomMargin=20*mm,
    title='SkillForge - Product & Technical Guide', author='V. Saatwik Sairaam')
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')
doc.addPageTemplates([PageTemplate(id='all', frames=[frame], onPage=footer)])
doc.build(story)
print('WROTE', OUT)
