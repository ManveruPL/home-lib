# Application Description: Home Library (Book Management System)

The Home Library application is a personal book cataloging and management system. It allows users to digitize, organize, track, and search their physical and digital book collections.

The first version is designed to be **fully self-contained and offline**, storing all data locally on the user's device. No cloud synchronization or external databases are required for core operations, ensuring user privacy and instant load times.

---

## 1. Mobile-First Design Priorities

As this application is designed **primarily for mobile devices**, the user experience (UX) and interface (UI) prioritize mobile constraints and patterns:

* **Bottom Navigation**: Primary app views (Library, Search/Filter, Quick Scan, Settings) are accessed via a bottom navigation bar, placing key actions within easy thumb reach.
* **Touch-Optimized Controls**: Interactive elements (buttons, tag selections, stars for ratings) feature large tap targets (minimum $48\times48$ pixels) and generous spacing to prevent accidental taps.
* **Smart Mobile Input**: Forms use targeted mobile keyboards (e.g., numeric input modes for ISBNs and page counts) and minimize virtual keyboard shifts. Dropdown selectors and multi-select filters open as fullscreen bottom drawer sheets rather than small desktop dropdown lists.
* **PWA & Offline Resilience**: The app behaves like a native mobile app (Progressive Web App - PWA), allowing users to "install" it to their home screen. It operates fully without an active internet connection (e.g., inside home basements, bookstores, or libraries).
* **Native Mobile Integrations**:
  * **Camera Scan**: Accesses the native rear camera with barcode boundary guidance overlay.
  * **Share Sheet Backups**: Uses the mobile device's native share controller to allow users to text, email, or save backup files to their device storage.

---

## 2. Core Entities and Information Model
The system distinguishes between books, authors, and genres as separate, interrelated concepts.

### A. Book Entity
The system captures extensive details about each book. The profile for a book includes:
- **Title**: The main name of the book.
- **Subtitle**: Subtitle or secondary title (if applicable).
- **Authors**: Associated author profiles (supports multiple co-authors).
- **Genres**: Associated genres/categories (supports multiple tags).
- **ISBN (International Standard Book Number)**: ISBN-10 or ISBN-13 barcode numbers.
- **Publisher**: The publishing house or company.
- **Publication Date**: The year or specific date the edition was published.
- **Description**: A synopsis or plot summary of the book.
- **Page Count**: The total number of pages.
- **Cover Image**: Visual cover representation.
- **Language**: The language the book is written in.
- **Ownership Status**: A setting that categorizes the book as:
  - *Owned*: The copy is currently in the user's physical or digital collection.
  - *Wishlist / To Buy*: The user does not own the book yet but wants to acquire it.
- **Personal Rating**: A 5-star rating scale for the user's personal review.
- **Reading Status**: Tracking the reading state:
  - *To Read* (Wishlist / Backlog)
  - *Reading* (Currently active)
  - *Completed* (Finished reading)
  - *Paused* (Temporarily put aside)
- **Physical Location/Shelf**: Notes on where the physical book is kept (e.g., "Living Room - Shelf 3").
- **Personal Notes**: Personal reviews, quotes, or thoughts.
- **Date Cataloged**: When the book was added to the library.

### B. Author Entity
Authors are managed as independent entities, allowing them to be cataloged once and linked to multiple books.
- **Name**: The full name of the author.
- **Biography**: Background information, list of accomplishments, or personal notes.
- **Birth Date / Death Date**: Life dates to help organize and differentiate historical authors.

### C. Genre Entity
Genres act as descriptive tags for organizing the collection.
- **Name**: The name of the category (e.g., "Science Fiction", "Biography", "Fantasy").

---

## 3. Book Addition and Management Workflows
Adding books to the library is quick and flexible, offering two primary workflows for adding books and complete editing capabilities.

```
                  ┌────────────────────────┐
                  │   Add Book Interface   │
                  └───────────┬────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
 ┌──────────────┐                          ┌──────────────┐
 │  1. Manual / │                          │ 2. Automatic │
 │  Prefill Form│                          │ Barcode Scan │
 └──────┬───────┘                          └──────┬───────┘
        │                                         │
        │ [ISBN field at top]                     │ [Camera Scanner]
        │                                         │
        ├─► [Optional: Type or Scan ISBN]         ▼
        │                 │                [Scan Barcode]
        │                 ▼                       │
        │         [Trigger Download]              ▼
        │                 │                [Lookup Book API]
        │                 ▼                       │
        │         [Lookup Book API]        ┌──────┴──────┐
        │                 │                ▼ Found       ▼ Not Found
        │                 ▼                ┌───────────┐ ┌───────────┐
        │         [Prefill Form Fields]    │Auto-Create│ │Show Error │
        │                 │                │Book Entity│ │& Fallback │
        │                 ▼                └─────┬─────┘ └─────┬─────┘
        │                 │                      │             ▼
        ▼                 ▼                      ▼         (To Manual
 ┌───────────────────────────────────────┐ [Show Details     Form)
 │ Review & Edit Form Fields             │    to User]
 │ (Title, Authors, Ownership, Location) │
 └──────────────────┬────────────────────┘
                    │
                    ▼
             ┌─────────────┐
             │ Save to DB  │
             └─────────────┘
```

### 1. Manual & Semi-Automatic Form Path
In this workflow, the user opens the standard book creation form. They can choose to fill the form completely manually or use the built-in ISBN prefill assistant.
- **ISBN Assistant (At Form Top)**:
  - The **ISBN input field** is positioned first at the very top of the form.
  - To input the ISBN, the user can tap the field (which invokes a **numeric key entry layout**) or tap the camera barcode icon next to it to open a camera scanning drawer.
  - Once the ISBN is populated, the user taps **"Download Info"**. The system queries the external lookup API chain (Polish e-ISBN first, falling back to Open Library) and automatically populates the form fields (Title, Subtitle, Page count, Publisher, Publication Date, Description, and Cover image) with the retrieved data.
- **Manual Input / Refinement**:
  - The user reviews, updates, or corrects any prefilled fields.
  - If no ISBN is provided or lookup fails, the user simply enters all metadata manually.
- **Author Assignment**:
  - The user selects an author from a searchable list. Tapping the selector slides up a fullscreen bottom sheet showing cataloged authors.
  - If the author is new, the user taps a **"+ Add New Author"** shortcut, creating the record in an overlay modal without losing their current place in the book form.
- **Genre Assignment**:
  - Tapping the genre field opens a bottom sheet with checkable tags, where users can also type a new tag to create it dynamically.
- **Saving**:
  - The user sets their collection status details (Ownership Status, Reading Status, Shelf Location, Rating, Notes) and taps **"Save"** to add the book.

### 2. Automatic Addition Flow (Barcode Scanning / Quick Add)
- Accessible directly from a quick action button on the bottom navigation bar.
- **Mobile Camera Scan**: The user launches the scan interface, which opens a full-screen camera view finder with a highlighted alignment window. It uses the device's auto-focus and flash (if available) to scan in low light.
- **Automated Direct Creation**:
  - The system decodes the barcode, performs the lookup through the API chain, matches or creates the author, and immediately saves the book directly to the database.
  - **The form is completely bypassed.** The user is taken directly to the **Book Details View** showing the newly added book, with a haptic success vibration.
  - If lookup fails, a warning alert is displayed, and the app routes the user to the manual form with the scanned ISBN pre-filled.

### 3. Editing Existing Books
- The user can edit any book already saved in their library at any time.
- Tapping **"Edit Book"** from the book's details page opens the editing form populated with the current book metadata.
- The user can touch any field to change the information, including:
  - Switching the **Ownership Status** (e.g., shifting a book from "Wishlist" to "Owned" once purchased).
  - Updating the **Reading Status** (e.g., from "To Read" to "Reading").
  - Modifying the authors, adding/removing genre tags, updating physical shelf locations, and appending personal notes.
- Tapping **"Save Changes"** updates the record in the local database.

---

## 4. External Metadata Lookup API Sources

To support automatic detail retrieval, the application implements a dual-source lookup API chain:

```
                  ┌──────────────────────┐
                  │ Perform ISBN Lookup  │
                  └──────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │  1. Query Polish e-ISBN API  │
              └──────────────┬───────────────┘
                             │
                     ┌───────┴───────┐
                     ▼ Found         ▼ Not Found
             ┌───────────────┐     ┌─────────────────────────────┐
             │ Load Metadata │     │ 2. Query Open Library API   │
             └───────┬───────┘     └─────────────┬───────────────┘
                     │                           │
                     │                   ┌───────┴───────┐
                     │                   ▼ Found         ▼ Not Found
                     │           ┌───────────────┐     ┌───────────────┐
                     │           │ Load Metadata │     │ Return Lookup │
                     │           └───────┬───────┘     │     Error     │
                     │                   │             └───────────────┘
                     ▼                   ▼
             ┌───────────────────────────────────┐
             │ Optional: Query Open Library for  │
             │   Extended Author Information     │
             └─────────────────┬─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Return Final Book & │
                    │    Author Details   │
                    └─────────────────────┘
```

### A. Primary Source: Polish e-ISBN (e-isbn.pl)
- **API Documentation**: [e-ISBN Web Services API Documentation (PDF)](https://e-isbn.pl/IsbnWeb/start/Dokumentacja_API.pdf)
- **Purpose**: Serves as the primary metadata source. This registry is highly accurate for books published on the Polish book market, containing rich bibliographic records, titles, publishers, physical sizes, publication dates, and author designations.
- **Workflow**: The application queries this database first. If a match is found, the bibliographic data is returned.

### B. Fallback Source: Open Library API (openlibrary.org)
- **API Documentation**: [Open Library Developers API Page](https://openlibrary.org/developers/api)
- **Purpose**: Serves two vital roles:
  1. **Metadata Fallback**: If the book is not found in the Polish e-ISBN database (e.g., international books or specialized publications), the system queries Open Library to retrieve metadata.
  2. **Author Profile Enrichment**: While e-ISBN returns publisher-oriented book and author names, it does not hold detailed biographical histories or author cover portraits. The application can query Open Library's Author endpoints to fetch additional biographies, birth dates, and other context for the local author database record.

---

## 5. Search and Filtering Capabilities
To manage large collections, the system provides powerful retrieval mechanisms:

### A. Unified Search
A search bar at the top of the library allows users to locate books using:
- **Book Title / Subtitle**
- **Author Name**
- **ISBN Number**
- The search is instant, updating the book list in real-time as the user types.

### B. Filtering
Users can isolate specific subsets of their library by applying filters:
- **Filter by Author**: Show only books written by a chosen author.
- **Filter by Genre**: Show only books belonging to one or more selected genres.
- **Filter by Reading Status**: Group and view books by their current reading state (*To Read*, *Reading*, *Completed*, *Paused*).
- **Filter by Ownership**: Filter the view to show only *Owned* books (the user's physical library) or only *Wishlist* items (books they plan to buy).

### C. Sorting
Books can be arranged in the list view according to:
- **Date Added** (Chronological order of cataloging)
- **Title** (Alphabetical A-Z or Z-A)
- **Author Name** (Alphabetical A-Z or Z-A)
- **Personal Rating** (Highest to lowest)
- **Page Count** (Shortest to longest or vice-versa)

---

## 6. Offline Data Integrity and Portability
Because all data resides locally on the user's browser/device:
- **Cache Risks**: Clearing browser history or site data might erase the library database.
- **Export & Import Backup**: To protect user data, the app includes a simple **Backup & Restore** function:
  - **Backup**: Exports the entire library (books, authors, and genres) into a single, portable JSON file. On mobile, this triggers the native **Share Sheet**, allowing the user to send the file via messaging apps, email, or save it to local cloud drives (e.g., iCloud, Google Drive).
  - **Restore**: Allows the user to load a previously saved backup file. On mobile, this launches the native **Document Picker** to locate and select the backup file on the device.
