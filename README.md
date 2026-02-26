# Smart Study Planner - Specification Document

## 1. Project Overview
- **Project Name**: Smart Study Planner
- **Type**: Single-page Web Application
- **Core Functionality**: A study management app that allows users to add subjects with deadlines, auto-generates daily study plans based on priority, tracks progress, and supports dark/light themes.
- **Target Users**: Students and learners who want to organize their study schedule efficiently

## 2. UI/UX Specification

### Layout Structure
- **Header**: App title with theme toggle button (fixed top)
- **Main Content**: Three-column layout on desktop, stacked on mobile
  - Left Column: Subject List (add/edit/delete subjects)
  - Center Column: Daily Study Plan (auto-generated)
  - Right Column: Progress Tracker
- **Responsive Breakpoints**:
  - Mobile: < 768px (single column, stacked)
  - Tablet: 768px - 1024px (two columns)
  - Desktop: > 1024px (three columns)

### Visual Design

#### Color Palette

**Light Theme:**
- Background: `#F8F9FC` (soft off-white)
- Card Background: `#FFFFFF`
- Primary: `#6366F1` (indigo)
- Primary Hover: `#4F46E5`
- Secondary: `#10B981` (emerald green)
- Accent: `#F59E0B` (amber for deadlines)
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`
- Border: `#E2E8F0`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`

**Dark Theme:**
- Background: `#0F172A` (dark navy)
- Card Background: `#1E293B`
- Primary: `#818CF8` (lighter indigo)
- Primary Hover: `#6366F1`
- Secondary: `#34D399`
- Accent: `#FBBF24`
- Text Primary: `#F1F5F9`
- Text Secondary: `#94A3B8`
- Border: `#334155`

#### Typography
- **Font Family**: `'Outfit', sans-serif` (Google Fonts)
- **Headings**: 
  - H1: 28px, font-weight 700
  - H2: 20px, font-weight 600
  - H3: 16px, font-weight 600
- **Body**: 14px, font-weight 400
- **Small**: 12px, font-weight 400

#### Spacing System
- Base unit: 4px
- Padding: 16px (cards), 12px (buttons), 8px (inputs)
- Margins: 24px (between sections), 16px (between cards)
- Border Radius: 12px (cards), 8px (buttons), 6px (inputs)

#### Visual Effects
- Card shadows (light): `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`
- Card shadows (dark): `0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)`
- Hover transitions: 0.2s ease-in-out
- Page load animation: Fade in with slight upward movement (0.4s)
- Card entrance: Staggered fade-in (0.3s delay between cards)
- Button hover: Scale 1.02 with shadow increase

### Components

#### Header
- App logo/title on left
- Theme toggle button on right (sun/moon icon)
- Sticky position

#### Subject List Card
- Title: "Subjects"
- Input field for subject name
- Date picker for deadline
- "Add Subject" button
- List of subjects with:
  - Subject name
  - Deadline date (formatted nicely)
  - Days remaining badge (color-coded)
  - Delete button (trash icon)
- Empty state message when no subjects

#### Daily Study Plan Card
- Title: "Today's Study Plan"
- Date display
- Auto-generated list of study sessions
- Each session shows:
  - Subject name
  - Priority indicator (high/medium/low)
  - Estimated duration
  - Checkbox to mark complete
- "Generate New Plan" button
- Empty state when no subjects exist

#### Progress Tracker Card
- Title: "Progress"
- Overall completion percentage (circular progress)
- Total sessions completed
- Subjects completed
- Current streak (days)
- Weekly chart (simple bar chart)

## 3. Functionality Specification

### Core Features

#### Subject Management
- Add new subject with name and deadline
- Delete subject with confirmation
- Calculate days remaining until deadline
- Priority calculation based on deadline urgency:
  - ≤ 2 days: High priority
  - ≤ 7 days: Medium priority
  - > 7 days: Low priority
- Persist subjects in localStorage

#### Auto-Generate Daily Plan
- Algorithm considers:
  - Subject priority (higher priority = more sessions)
  - Deadline proximity
  - Study duration per subject (split large subjects)
- Generate 4-6 study sessions per day
- Each session: 25-45 minutes
- Persist today's plan in localStorage

#### Progress Tracking
- Mark study sessions as complete
- Track completed sessions count
- Calculate completion percentage
- Track study streak (consecutive days)
- Persist progress in localStorage

#### Theme Switching
- Toggle between light/dark themes
- Persist theme preference in localStorage
- Smooth transition animation between themes

### User Interactions
1. **Adding a Subject**: Enter name → Select deadline → Click Add → Subject appears in list → Plan auto-regenerates
2. **Completing a Session**: Click checkbox → Session marked complete → Progress updates → Celebration animation
3. **Deleting a Subject**: Click delete → Subject removed → Plan auto-regenerates
4. **Theme Toggle**: Click moon/sun icon → Theme switches with fade animation

### Data Handling
- All data stored in localStorage
- Data structure:
  
```
json
  {
    "subjects": [{"id", "name", "deadline", "createdAt"}],
    "todayPlan": [{"id", "subjectId", "subjectName", "duration", "completed"}],
    "progress": {"totalCompleted": 0, "streak": 0, "lastStudyDate": null},
    "theme": "light"
  }
  
```

### Edge Cases
- No subjects: Show helpful empty states
- All subjects completed: Show celebration message
- Deadline passed: Mark as overdue, still show in list
- Same-day deadline: High priority, show warning

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Header displays with title and theme toggle
- [ ] Three cards visible on desktop, stacked on mobile
- [ ] Theme toggle works and persists
- [ ] Cards have proper shadows and rounded corners
- [ ] Colors match specification exactly
- [ ] Animations are smooth and visible

### Functional Checkpoints
- [ ] Can add subject with name and deadline
- [ ] Subject appears in list with days remaining
- [ ] Can delete subject
- [ ] Daily plan generates automatically when subjects added
- [ ] Can mark sessions as complete
- [ ] Progress percentage updates correctly
- [ ] All data persists after page refresh
- [ ] Responsive layout works on all screen sizes
