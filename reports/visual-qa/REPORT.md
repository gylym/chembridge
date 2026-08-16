# ChemBridge visual QA report

Audit date: 2026-08-16  
Target: `https://gylym.github.io/chembridge/`

## Findings and fixes

| Severity | Page / location | Actual (BEFORE) | Expected | Found by | Implemented fix |
| --- | --- | --- | --- | --- | --- |
| Critical | Admin content APIs | A teacher/content role could mutate content outside its scope, including published/site-managed records. | Entity-specific permissions and ownership checks. | Backend/Security Agent | Split CMS permissions, added teacher ownership checks, protected published records and site settings. |
| Critical | Login/session → Back/Forward | Browser history could restore a protected UI route after logout or for the wrong role. | Every route transition must pass the same authorization guard. | Frontend Agent | Centralized route authorization for initial load, navigation and `popstate`. |
| High | Admin editor, tablet/mobile | Three simultaneous columns clipped the editor; independent nested scroll areas trapped scrolling. | One readable editor surface with predictable page scrolling. | Product/UX + UI/Design Agents | Added responsive master/detail behavior, section selector and one-column mobile forms. |
| High | Lesson/quiz completion | Failed API saves could still display completion and award local XP. | Completion and XP only after authoritative server success, with retryable failure state. | Frontend + QA Agents | Added saving/error/retry states and server-authoritative quiz result rendering. |
| High | Public learning API | Draft content and answer keys could be returned publicly. | Only published parent content; answer keys stay server-side. | Backend/Security Agent | Added published joins and server-side grading; removed public correct-answer data. |
| High | Admin notices/forms | API failures appeared in a green success notice; errors had little context. | Typed success/error/info feedback and accessible alerts. | UI/Design Agent | Added notice tones, error styling, retry states and status semantics. |
| High | 320 px header | Login/menu controls were clipped and the menu target shrank below 44 px. | No overflow and 44 px touch targets. | UI/Design Agent | Added compact narrow-header rules and fixed-size controls. |
| High | Content catalogs | Network/403/500 failures looked like genuinely empty video/resource lists. | Loading, empty and failure states must be distinct. | Frontend + QA Agents | Added explicit resource state, error copy and retry controls. |
| Medium | Public periodic/reaction/lab routes | Anonymous visitors saw a fake signed-in student shell and logout controls. | Public shell until authenticated. | QA Agent | Separated public and authenticated shells. |
| Medium | Lesson navigation | Selected lesson existed only in React state and was lost on refresh/history navigation. | Addressable, bookmarkable lesson URL. | Frontend Agent | Added `?lesson=<id>` URL synchronization and history restoration. |
| Medium | Element/video dialogs | Mouse-only close; no Escape, focus trap or focus restore. | Accessible keyboard lifecycle. | UI/Design Agent | Added initial focus, Escape, focus trap, background lock and focus restoration. |
| Medium | File upload | A 15 MB file was converted to roughly 20 MB base64 JSON in memory. | Streaming multipart upload. | Performance Agent | Replaced FileReader/base64 transport with `FormData`. |

## BEFORE evidence

- [`landing-desktop.jpg`](before/landing-desktop.jpg) — landing, 1440×900.
- [`landing-mobile.jpg`](before/landing-mobile.jpg) — landing, 390×844.
- [`login-desktop.jpg`](before/login-desktop.jpg) — login, 1440×900.
- [`admin-desktop.jpg`](before/admin-desktop.jpg) — admin overview, desktop.
- [`admin-editor-tablet.jpg`](before/admin-editor-tablet.jpg) — clipped admin editor, tablet.
- [`dashboard-desktop.jpg`](before/dashboard-desktop.jpg) — signed-in dashboard.
- [`lesson-detail-desktop.jpg`](before/lesson-detail-desktop.jpg) — lesson flow before URL/persistence fixes.

## AFTER evidence

The `after/` captures are added after the GitHub Pages deployment passes validation. Every image is captured from the published URL, not a design mock-up.

## Validation contract

The release workflow runs `typecheck → lint → unit tests → GitHub Pages build`. Manual QA then checks landing, login, admin master/detail, lesson completion, periodic dialog, desktop/mobile layouts, browser console and failed requests.
