export const locationOptions = ["OWS Elem", "Learning Resource Center", "All Libraries"];

export const categoryOptions = [
  "C000 - Generalities",
  "C100 - Philosophy/Psychology",
  "C200 - Religion",
  "C300 - Social Sciences",
  "C400 - Language",
  "C500 - Natural Sciences",
  "C600 - Technology",
  "C700 - Art",
  "C800 - Literature",
  "C900 - Geography History",
  "Fiction",
  "Filipiniana"
];

export const bookFieldGroups = [
  {
    title: "Title Proper",
    fields: [
      { label: "Title", name: "title", required: true },
      { label: "Author", name: "responsibility", required: true },
      { label: "Added Entry: Corporate", name: "corporateEntry" }
    ]
  },
  {
    title: "Publication",
    fields: [
      { label: "Place", name: "place" },
      { label: "Publisher", name: "publisher", required: true },
      { label: "Year", name: "publicationDate", type: "number", required: true },
      { label: "Extent/Dimension", name: "extent" },
      { label: "ISBN", name: "isbn", required: true },
      { label: "URL", name: "url", type: "url" }
    ]
  },
  {
    title: "Local Information",
    fields: [
      { label: "Call Number", name: "callNumber", required: true },
      { label: "Accession", name: "accession" },
      { label: "Language", name: "language" },
      { label: "Entered By", name: "enteredBy" },
      { label: "Date Entered", name: "dateEntered", type: "date" },
      { label: "Updated By", name: "updatedBy" },
      { label: "Date Updated", name: "dateUpdated", type: "date" },
      { label: "Volume/Copy", name: "volumeCopy" },
      { label: "On Shelf", name: "onShelf", type: "number", required: true },
      { label: "ID", name: "recordId" }
    ]
  }
];
