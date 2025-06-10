// elements
const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");

const exportBtn = document.querySelector("#export-notes");

// function
function showNotes() {
  cleanNotes();
  getNotes().forEach((note) => {
    const noteElement = createNote(note.id, note.content, note.fixed);
    notesContainer.appendChild(noteElement);
  });
}

function cleanNotes() {
  notesContainer.replaceChildren([]);
}

function addNote() {
  const notes = getNotes();
  const noteObject = {
    id: genereteId(),
    content: noteInput.value,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content);

  notesContainer.appendChild(noteElement);

  notes.push(noteObject);

  saveNotes(notes);
  noteInput.value = "";
}

function genereteId() {
  return Math.floor(Math.random() * 5000);
}

function createNote(id, content, fixed) {
  const element = document.createElement("div");
  element.classList.add("note");
  const textArea = document.createElement("textarea");
  textArea.value = content;
  textArea.placeholder = "Adicione algum texto";
  textArea.addEventListener("keyup", (e) => {
    updateNote(id, e.target.value);
  });
  element.appendChild(textArea);

  const pinIcon = document.createElement("i");
  pinIcon.classList.add(...["bi", "bi-pin"]);
  element.appendChild(pinIcon);

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add(...["bi", "bi-x-lg"]);
  element.appendChild(deleteIcon);

  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);
  element.appendChild(duplicateIcon);

  if (fixed) {
    element.classList.add("fixed");
  }
  //element events
  element.querySelector(".bi-pin").addEventListener("click", () => {
    toggleFixNote(id);
  });

  element.querySelector(".bi-x-lg").addEventListener("click", () => {
    deleteNote(id, element);
  });

  element
    .querySelector(".bi-file-earmark-plus")
    .addEventListener("click", () => {
      copyNote(id);
    });

  return element;
}

function toggleFixNote(id) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];
  targetNote.fixed = !targetNote.fixed;
  saveNotes(notes);
  showNotes();
}

function deleteNote(id, element) {
  const notes = getNotes();
  const filteredNotes = notes.filter((notes) => notes.id !== id);
  saveNotes(filteredNotes);
  element.remove();
}

function copyNote(id) {
  const notes = getNotes();
  const targetNote = notes.find((notes) => notes.id === id);

  const duplicateNote = {
    id: genereteId(),
    content: targetNote.content,
    fixed: targetNote.fixed,
  };

  notes.push(duplicateNote);
  saveNotes(notes);
  showNotes();
}

// local storage
function getNotes() {
  let notes = [];
  try {
    const storedNotes = JSON.parse(localStorage.getItem("notes") || "[]");
    if (Array.isArray(storedNotes)) {
      notes = storedNotes;
    }
  } catch (e) {
    console.warn("Erro ao ler notas do localStorage", e);
  }
  const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1));
  return orderedNotes;
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];
  targetNote.content = newContent;
  saveNotes(notes);
  console.log(newContent);
}

function searchNotes(search) {
  const searchResults = getNotes().filter((note) =>
    note.content.includes(search)
  );

  if (search !== "") {
    cleanNotes();

    searchResults.forEach((note) => {
      const noteElement = createNote(note.id, note.content);
      notesContainer.appendChild(noteElement);
    });

    return;
  }

  cleanNotes();
  showNotes();
}

function exportData() {
  const notes = getNotes();

  const csvString = [
    ["ID", "Conteúdo", "Fixado?"],
    ...notes.map((note) => [note.id, note.content, note.fixed]),
  ]
    .map((e) => e.join(","))
    .join("\n");

  const element = document.createElement("a");
  element.href = "data:text/csv;charset=utf-8" + encodeURI(csvString);

  element.target = "_blank";
  element.download = "notes.csv";
  element.click();
}

// events
addNoteBtn.addEventListener("click", () => addNote());
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  searchNotes(search);
});

noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addNote();
  }
});

exportBtn.addEventListener("click", () => {
  exportData();
});

// inicialização
showNotes();
