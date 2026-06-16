# MASTER SYSTEM RULES — SCHOOL LIBRARY MANAGEMENT SYSTEM

You are building a PROFESSIONAL, LONG-TERM, SCALABLE, PROGRESSIVE WEB APPLICATION (PWA) School Library Management System.

IMPORTANT:
This project is FRONTEND-FIRST for now.
DO NOT implement authentication backend, database storage, Firebase logic, or deployment yet.
Only build the COMPLETE UI SYSTEM, layouts, reusable components, frontend state logic, modal systems, filtering systems, charts rendering, print-preview pages, and simulated local data handling.

The system must be built in a way that is READY for future integration with:

* Firebase Authentication
* Firestore Database
* Cloud Storage
* Vercel deployment
* PWA support
* Offline caching
* Real-time updates

---

## TECH STACK RULES

PRIMARY LANGUAGES:

* HTML5
* CSS3
* Vanilla JavaScript (ES6 Modules)

ALLOWED:

* Chart.js (for charts)
* html2pdf.js OR jsPDF (for PDF generation)
* LocalStorage/sessionStorage ONLY for temporary mock persistence
* PWA manifest + service worker preparation

DO NOT USE:

* React
* Vue
* Angular
* jQuery
* Bootstrap
* Tailwind
* Heavy frameworks

REASON:
The system must remain lightweight, maintainable, fast, and easy to integrate later.

---

## DESIGN SYSTEM RULES

COLOR THEME:
Primary Blue:
#0055ff

Secondary:
White
#ffffff

Accent:
Light blue shades
Soft gray backgrounds
Minimal shadows

DESIGN STYLE:

* Modern
* Clean
* Professional
* Academic
* Minimal
* Spacious
* User-friendly
* Consistent spacing
* Rounded corners
* Responsive

USE THE PROVIDED:

* adminlogin.png
* dashboard.png
* notification.png
* edit book modal.png
* book lending.png
* book list.png

AS VISUAL DESIGN REFERENCES.

DO NOT COPY EXACTLY.
Instead:

* Match layout structure
* Match spacing consistency
* Match UI feel
* Match overall organization

---

## GLOBAL LAYOUT RULES

ALL PAGES MUST SHARE:

* Same left sidebar/navbar
* Same top-right utility section
* Same responsive structure
* Same typography system
* Same spacing system
* Same hover animations
* Same transitions

SIDEBAR STRUCTURE:
TOP:

* School logo placeholder

CENTER NAVIGATION BUTTONS:

* Dashboard
* Add New Book
* Book Lending
* Book List

NAVBAR BUTTON BEHAVIOR:

* Hover:

  * White background container
  * Blue text
  * Smooth transition
* Active/current page:

  * White container
  * Blue text
  * Active indicator

TOP RIGHT AREA:

* Notification button
* Admin account dropdown

---

## NOTIFICATION SYSTEM RULES

NOTIFICATION ICON:

* Has unread red dot indicator
* Click opens dropdown
* Second click closes dropdown

DROPDOWN:

* Header: “Notifications”
* Scrollable notification list ONLY
* Maximum visible area around 10 notifications

NOTIFICATION TYPES:

* Book added
* Book borrowed
* PDF generated
* Book updated
* Book deleted

UNREAD STATE:

* Blue left border highlight
* Red dot indicator

READ STATE:

* Highlight removed
* Red dot removed after opening notifications

STRUCTURE:
Notifications must be stored in a centralized frontend state manager for future database integration.

---

## ARCHITECTURE RULES

USE MODULAR STRUCTURE:

assets/

css/

js/

pages/
dashboard.html
add-book.html
lending.html
book-list.html

COMPONENTIZE:

* Sidebar
* Navbar buttons
* Notification dropdown
* Charts
* Tables
* Modals
* Filter dropdowns
* Search bars
* Book cards
* Status selectors

ALL JAVASCRIPT MUST:

* Use ES6 modules
* Avoid duplicated logic
* Use reusable utility functions
* Separate UI logic from state logic

---

## LONG-TERM SCALABILITY RULES

Build the frontend as if it will eventually handle:

* 10,000+ books
* 5,000+ borrow records
* Real-time updates
* Multiple librarians/admins
* Daily school usage

IMPORTANT:
Avoid tightly coupled code.

USE:

* Reusable rendering functions
* Event delegation
* State-driven rendering
* Dynamic rendering
* Pagination-ready structures
* Virtualized rendering preparation
* Debounced searching
* Efficient filtering

DO NOT:

* Hardcode repeated HTML
* Create huge monolithic JS files
* Use inline styles
* Use inline onclick handlers

---

## PWA PREPARATION RULES

Prepare the project for future PWA support:

* manifest.json structure
* service-worker.js structure
* Offline-ready architecture
* Mobile responsive
* Installable app-ready

DO NOT fully implement backend caching yet.
Just prepare architecture.

---

## RESPONSIVE DESIGN RULES

Support:

* Desktop
* Laptop
* Tablet

Mobile can be partially optimized later.

IMPORTANT:
Tables must remain usable on smaller widths:

* Horizontal scrolling
* Sticky headers where needed

---

## ACCESSIBILITY RULES

Use:

* Semantic HTML
* Proper labels
* ARIA labels where necessary
* Keyboard accessible modals
* Focus states
* Good contrast ratios

---

## MODAL SYSTEM RULES

ALL MODALS MUST:

* Animate smoothly
* Lock background scrolling
* Close with:

  * X button
  * ESC key
  * Outside click

Scrollable content INSIDE modal only.

Reusable modal component system required.

---

## DATA HANDLING RULES

Use temporary mock data arrays and local state only.

DO NOT implement:

* Firebase
* Firestore
* SQL
* APIs

HOWEVER:
Structure ALL code so future integration is EASY.

Use:

* data service abstraction
* state managers
* async-ready functions

---

## PERFORMANCE RULES

Optimize for:

* Smooth rendering
* Minimal DOM re-renders
* Efficient event listeners
* Efficient filtering
* Efficient sorting
* Efficient chart updates

---

## FINAL REQUIREMENT

The final frontend system must feel:

* Production-ready
* Professional
* Maintainable
* Expandable
* Suitable for long-term school usage
* Ready for future Firebase integration
* Ready for Vercel deployment
* Stable for large quantities of records
