//imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBvZL7H3UgC_HZkdN29SlVpYdf7Bj00VtY",
  authDomain: "tasklist-f13ff.firebaseapp.com",
  projectId: "tasklist-f13ff",
  storageBucket: "tasklist-f13ff.firebasestorage.app",
  messagingSenderId: "351884158337",
  appId: "1:351884158337:web:419368ac05d3a692147480",
};

// Firebase e Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// search tasks
const searchInput = document.querySelector("#search-input");
searchInput.addEventListener("keyup", (e) => {
  if (searchInput.value.trim() === "") {
    showTask();
  }
  searchTask(searchInput.value);
});

// export tasks
const exportBtn = document.querySelector("#export-tasks");
exportBtn.addEventListener("click", () => exportTasks());

// collection ref
const taskRef = collection(db, "tasks");

// Save tasks
async function saveTask(task) {
  try {
    await addDoc(taskRef, {
      content: task.content,
      fixed: task.fixed,
      criadoEm: new Date(),
    });
    showTask();
    showToast("Tarefa adicionada com sucesso");
  } catch (e) {
    showToast("Erro ao adicionar tarefa");
    console.error(e);
  }
}

// Show
async function showTask() {
  const q = query(taskRef, orderBy("fixed", "desc"));
  const querySnapshot = await getDocs(q);

  renderTask(querySnapshot);
}

function renderTask(querySnapshot) {
  try {
    const container = document.getElementById("task-container");
    container.innerHTML = "";
    querySnapshot.forEach((doc) => {
      const task = doc.data();
      const id = doc.id;
      const div = document.createElement("div");
      div.className = "task";
      div.textContent = task.content;
      container.appendChild(div);

      if (task.fixed) {
        div.classList.add("fixed");
      }

      // pin icon
      div.appendChild(
        createIcon("bi-pin", () => toggleTaskFixation(id), "Fixar nota")
      );
      // delete icon
      div.appendChild(
        createIcon("bi-x-lg", () => deleteTask(id), "Deletar nota")
      );
      // copy icon
      div.appendChild(
        createIcon("bi-file-earmark-plus", () => copyTask(id), "Fixar nota")
      );
    });
  } catch (e) {
    console.log(e);
  }
}

const createIcon = (className, onClick, arialLabel = "") => {
  const icon = document.createElement("i");
  icon.classList.add("bi", className);
  icon.addEventListener("click", onClick);
  icon.setAttribute("arial-label", arialLabel);
  return icon;
};

// Event listeners
document.querySelector(".add-task").addEventListener("click", handleTaskAdd);

document.getElementById("task-content").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    handleTaskAdd();
  }
});

async function handleTaskAdd() {
  const input = document.getElementById("task-content");
  const content = input.value.trim();

  if (content !== "") {
    const task = {
      content: content,
      fixed: false,
    };
    await saveTask(task);
    input.value = "";
    await showTask();
  }
}

async function deleteTask(id) {
  try {
    await deleteDoc(doc(db, "tasks", id));
    showTask();
    showToast("Tarefa excluída");
  } catch (e) {
    showToast("Erro ao deletar tarefa");
    console.error(e);
  }
}

async function copyTask(id) {
  try {
    const docRef = doc(db, "tasks", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      await addDoc(taskRef, {
        content: data.content,
        fixed: data.fixed,
        criadoEm: new Date(),
      });
      showTask();
      showToast("Tarefa duplicada");
    }
  } catch (e) {
    console.error("Erro:", e);
  }
}

async function toggleTaskFixation(id) {
  try {
    const docRef = doc(db, "tasks", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newValue = !data.fixed;

      await updateDoc(docRef, {
        fixed: newValue,
      });
    }

    showTask();
    showToast("Tarefa fixada");
  } catch (e) {
    showToast("Erro ao fixar tarefa");
    console.log(e);
  }
}

async function searchTask(text) {
  try {
    const q = query(collection(db, "tasks"), orderBy("fixed", "desc"));
    const tasks = await getDocs(q);

    const filteredTasks = tasks.docs.filter((doc) => {
      const data = doc.data();
      return data.content.toLowerCase().includes(text.toLowerCase());
    });

    renderTask(filteredTasks);
  } catch (e) {
    console.log("Erro ao buscar tarefas: " + e);
  }
}

async function exportTasks() {
  try {
    const q = query(taskRef);
    const tasks = await getDocs(q);

    const csvString = [
      ["Conteúdo", "Fixado?"],
      ...tasks.docs.map((task) => [task.data().content, task.data().fixed]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const element = document.createElement("a");
    element.href = "data:text/csv;charset=utf-8" + encodeURI(csvString);

    element.target = "_blank";
    element.download = "tasks.csv";
    element.click();
  } catch (e) {
    console.log("Erro ao exportar dados: " + e);
  }
}

const showToast = (message) => {
  const container = document.querySelector("#toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    container.removeChild(toast);
  }, 3000);
};

// start
window.addEventListener("DOMContentLoaded", showTask);
