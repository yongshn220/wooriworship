# Woori Worship

A web application designed for church worship teams to collaboratively manage songs, worship setlists, and team schedules.

## 🚀 Current Status: Phase 1 Complete
All Minimum Functional Requirements (MFR) for Phase 1 have been implemented.

### ✅ Completed Features
- **Authentication**: User Login, Register, Logout (Firebase Auth)
- **Team Management**: Create Team, Switch Teams
- **Invitations**: 
  - Leaders can invite users via email
  - Users have an "Invitation Inbox" to accept/decline invites
- **Song Management**: Add, specific details (BPM, Key, etc.), Update, Delete songs
- **Worship (Setlist) Management**: 
  - Create Worship plans
  - **View Worship**: Team members can view shared worship details (Songs, Music Sheets, Descriptions)
  - **Update/Delete**: Full CRUD support for Worships

## 🛠 Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Radix UI (shadcn/ui), Framer Motion
- **State Management**: Recoil
- **Backend**: Firebase (Firestore, Authentication, Storage)

## 📅 Roadmap

### Phase 2: Advanced Features (Next Steps)
- [ ] User Account Deletion
- [ ] Team Deletion (Leader only)
- [ ] Forget Password flow
- [ ] Leader Delegation (Assign new leader)
- [ ] Member Removal (Kick member)

### Phase 3: Quality of Life
- [ ] Custom notes for each worship per user
- [ ] Mobile App version (iOS/Android)

### Phase 4: AI & Recommendation
- [ ] Automated song scoring
- [ ] Tag-based song recommendations
- [ ] Worship rating system

### Phase M: Monetization
- [ ] Premium Team creation limits
- [ ] Song limits for free teams

## 📂 Project Structure
- `app/board`: Main dashboard and feature routes
- `apis`: Service layer for Firebase interactions
- `models`: TypeScript interfaces for domain objects
- `components`: Reusable UI components
- `global-states`: Recoil state definitions
