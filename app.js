let students = [];
let currentPage = 1;
const studentsPerPage = 10;
let filteredStudents = [];

// Load data from JSON
function loadStudents() {
  fetch("./student.json")
    .then((response) => response.json())
    .then((data) => {
      students = data;
      filteredStudents = [...students];
      initializeDatalist();
      displayStudents();
      generateFilterTags();
    });
}

// Llamamos a loadStudents() al inicio de la aplicación
loadStudents();

// DOM elements
const studentSearch = document.getElementById("studentSearch");
const studentsList = document.getElementById("studentsList");
const studentsDisplay = document.getElementById("studentsDisplay");
const studentDetailsModal = document.getElementById("studentDetailsModal");
const editName = document.getElementById("editName");
const editTags = document.getElementById("editTags");
const positivePointsList = document.getElementById("positivePointsList");
const negativePointsList = document.getElementById("negativePointsList");
const positiveReason = document.getElementById("positiveReason");
const negativeReason = document.getElementById("negativeReason");
const tasksList = document.getElementById("tasksList");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTask");
const positiveSummary = document.getElementById("tab1");
const negativeSummary = document.getElementById("tab3");
const tasksSummary = document.getElementById("tab2");
const addStudentBtn = document.getElementById("addStudent");
const pagination = document.getElementById("pagination");
const filterTags = document.getElementById("filterTags");
let currentStudentIndex = null;

// Initialize datalist with students
function initializeDatalist() {
  studentsList.innerHTML = "";
  students.forEach((student, index) => {
    const option = document.createElement("option");
    option.value = student.name;
    option.dataset.index = index;
    studentsList.appendChild(option);
  });
}

// Generate filter tags based on students' tags
// Generar los filtros basados en las etiquetas de los estudiantes
const allButton = document.createElement("button");
function generateFilterTags() {
  const tags = [...new Set(students.flatMap((student) => student.tags))];

  // Limpiar los filtros actuales
  filterTags.innerHTML = "";

  // Filtro "Todos"
  allButton.id = "filterAll";
  allButton.textContent = `Todos (${students.length})`;
  allButton.className =
    "text-xs p-1 bg-gray-300 text-gray-800 rounded m-1 hover:bg-gray-400 transition active";
  allButton.addEventListener("click", () => {
    filteredStudents = [...students];
    currentPage = 1;
    displayStudents();
    updateActiveFilter(allButton);
  });
  filterTags.appendChild(allButton);

  // Filtros por etiqueta
  tags.forEach((tag) => {
    const count = students.filter((student) => student.tags.includes(tag))
      .length;
    const button = document.createElement("button");
    button.textContent = `${tag} (${count})`;
    button.className =
      "text-xs p-1 bg-gray-300 text-gray-800 rounded m-1 hover:bg-gray-400 transition";
    button.addEventListener("click", () => {
      filterByTag(tag);
      updateActiveFilter(button);
    });
    filterTags.appendChild(button);
  });
}

// Actualizar el filtro activo
function updateActiveFilter(activeButton) {
  document.querySelectorAll("#filterTags button").forEach((button) => {
    button.classList.remove("active");
  });
  activeButton.classList.add("active");
}

function filterByTag(tag) {
  filteredStudents = students.filter((student) => student.tags.includes(tag));
  currentPage = 1;
  displayStudents();
  updateSearchFilterTag(tag, filteredStudents.length);
}

// Display students in the second section
function displayStudents() {
  studentsDisplay.innerHTML = "";
  const start = (currentPage - 1) * studentsPerPage;
  const end = start + studentsPerPage;
  const currentStudents = filteredStudents.slice(start, end);

  currentStudents.forEach((student, index) => {
    const li = document.createElement("li");
    li.className =
      "text-xs p-1 border-b cursor-pointer hover:bg-gray-100 transition";
    li.innerHTML = `
      <div class="flex justify-between items-center gap-x-2">
        <span>${start + index + 1}.</span>
        <span class="flex-grow align-left">${student.name}</span>
        <div class="flex gap-2 items-center">
          <span class="text-green-600">+${student.positivePoints.length}</span>
          <span class="text-gray-600">${student.tasks.length}</span>
          <span class="text-red-600">-${student.negativePoints.length}</span>
        </div>
      </div>`;
    li.dataset.index = start + index;
    li.addEventListener("click", () => showStudentDetails(start + index));

    studentsDisplay.appendChild(li);
  });

  updatePagination(filteredStudents.length);
}

function updatePagination(totalStudents) {
  const totalPages = Math.ceil(totalStudents / studentsPerPage);
  pagination.innerHTML = "";

  const previousButton = createPaginationButton("<", () => {
    if (currentPage > 1) {
      currentPage--;
      displayStudents();
    }
  });
  pagination.appendChild(previousButton);

  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage || (i <= currentPage + 1 && i >= currentPage - 1)) {
      const pageButton = createPaginationButton(i, () => {
        currentPage = i;
        displayStudents();
      });
      if (i === currentPage) {
        pageButton.classList.add("bg-gray-800", "text-white");
      }
      pagination.appendChild(pageButton);
    } else if (i === 1 || i === totalPages) {
      const pageButton = createPaginationButton(i, () => {
        currentPage = i;
        displayStudents();
      });
      pagination.appendChild(pageButton);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      const ellipsis = document.createElement("span");
      ellipsis.textContent = "..";
      pagination.appendChild(ellipsis);
    }
  }

  const nextButton = createPaginationButton(">", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayStudents();
    }
  });
  pagination.appendChild(nextButton);
}

function createPaginationButton(text, onClick) {
  const button = document.createElement("button");
  button.className =
    "mx-1 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition";
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

// Show student details in the modal
function showStudentDetails(index) {
  // Obtén el índice del estudiante en la lista filtrada
  const student = filteredStudents[index];
  if (!student) return; // Verifica que el estudiante exista

  currentStudentIndex = students.indexOf(student); // Encuentra el índice en la lista original
  editName.value = student.name;
  editTags.value = student.tags.join(", ");
  displayPoints(student.positivePoints, positivePointsList);
  displayPoints(student.negativePoints, negativePointsList);
  displayTasks(student.tasks);
  updatePointsSummary(student);
  studentDetailsModal.classList.remove("hidden");
}

function displayPoints(points, listElement) {
  listElement.innerHTML = "";
  points.forEach((point, i) => {
    const li = document.createElement("li");
    li.className =
      "list-decimal list-item ml-4 flex justify-between items-center";
    li.innerHTML = `
    <div class="flex justify-between items-center gap-x-2 border-b hover:bg-gray-100 mb-2">
    <span class="flex-grow">${point.reason}</span>
    <span class="text-gray-500 text-xs">${point.date}</span>
          <button class="remove-point px-2 py-1 bg-red-500 text-white rounded">X</button>
          </div>`;
    li.querySelector(".remove-point").addEventListener("click", () => {
      points.splice(i, 1); // Elimina el punto del array
      displayPoints(points, listElement); // Actualiza la lista de puntos
      updatePointsSummary(filteredStudents[currentStudentIndex]); // Actualiza el resumen
    });
    listElement.appendChild(li);
  });
}

function displayTasks(tasks) {
  tasksList.innerHTML = "";
  tasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.className =
      "list-decimal list-item ml-4 flex justify-between items-center";
    li.innerHTML = `
    <div class="flex justify-between items-center gap-x-2 border-b hover:bg-gray-100 mb-2">
    <span class="flex-grow">${task.task}</span>
      <span class="text-gray-500 text-xs">${task.date}</span>
      <button class="px-2 py-1 bg-red-500 text-white rounded remove-task">X</button>
      </div>`;
    li.querySelector(".remove-task").addEventListener("click", () => {
      removeTask(i);
    });
    tasksList.appendChild(li);
  });
}

function updatePointsSummary(student) {
  positiveSummary.textContent = `Positivos: ${student.positivePoints.length}`;
  negativeSummary.textContent = `Negativos: ${student.negativePoints.length}`;
  tasksSummary.textContent = `Pendientes: ${student.tasks.length}`;
  saveToFile(students);
  initializeDatalist();
  displayStudents();
  generateFilterTags();
}

function addPoint(pointListElement, pointInput, pointType) {
  const point = pointInput.value.trim();
  if (point) {
    const student = students[currentStudentIndex];
    student[pointType].push(point);
    pointInput.value = "";
    displayPoints(student[pointType], pointListElement);
    updatePointsSummary(student);
  }
}

function removePoint(pointListElement, index) {
  const student = students[currentStudentIndex];
  const pointType = pointListElement.id.includes("positive")
    ? "positivePoints"
    : "negativePoints";
  student[pointType].splice(index, 1);
  displayPoints(student[pointType], pointListElement);
  updatePointsSummary(student);
}

function addTask() {
  const task = taskInput.value.trim();
  if (task) {
    students[currentStudentIndex].tasks.push(task);
    taskInput.value = "";
    displayTasks(students[currentStudentIndex].tasks);
  }
}

function removeTask(index) {
  students[currentStudentIndex].tasks.splice(index, 1);
  displayTasks(students[currentStudentIndex].tasks);
  updatePointsSummary(students[currentStudentIndex]);
}

function saveDetails() {
  const student = students[currentStudentIndex];
  student.name = editName.value.trim();
  student.tags = editTags.value.split(",").map((tag) => tag.trim());
  saveToFile(students);
  initializeDatalist();
  displayStudents();
  generateFilterTags();
  closeModal();
}

// Guardar los datos actualizados en el archivo JSON
function saveToFile(data) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "json.php", true); // Verifica la URL y el puerto
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log("Datos guardados con éxito");
      } else {
        console.error("Error al guardar los datos");
      }
    }
  };
  const jsonData = JSON.stringify(data);
  const params = `data=${encodeURIComponent(jsonData)}`;
  xhr.send(params);
}

function deleteStudent(index) {
  students.splice(index, 1);
  saveToFile(students);
  initializeDatalist();
  displayStudents();
  generateFilterTags();
  closeModal();
}

function closeModal() {
  studentDetailsModal.classList.add("hidden");
}

// Handle tab switching
const tabs = document.querySelectorAll(".tab-content");
document.querySelectorAll("button[id^='tab']").forEach((tab) => {
  tab.addEventListener("click", (e) => {
    const targetId = e.target.id.replace("tab", "tabContent");
    tabs.forEach((content) => content.classList.add("hidden"));
    document.getElementById(targetId).classList.remove("hidden");
    document
      .querySelectorAll("button[id^='tab']")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");
  });
});

// Event Listeners
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("saveDetails").addEventListener("click", saveDetails);
document.getElementById("addPositivePoint").addEventListener("click", () => {
  const reason = positiveReason.value.trim();
  if (reason) {
    const point = { reason, date: new Date().toLocaleDateString() };
    students[currentStudentIndex].positivePoints.push(point);

    // Actualizar la lista de puntos positivos en la UI
    displayPoints(
      students[currentStudentIndex].positivePoints,
      positivePointsList
    );

    // Actualizar el resumen de puntos
    updatePointsSummary(students[currentStudentIndex]);

    positiveReason.value = ""; // Limpiar el campo de input
    displayStudents(); // Actualizar la lista de estudiantes para reflejar los cambios
  }
});

document.getElementById("addNegativePoint").addEventListener("click", () => {
  const reason = negativeReason.value.trim();
  if (reason) {
    const point = { reason, date: new Date().toLocaleDateString() };
    students[currentStudentIndex].negativePoints.push(point);

    // Actualizar la lista de puntos negativos en la UI
    displayPoints(
      students[currentStudentIndex].negativePoints,
      negativePointsList
    );

    // Actualizar el resumen de puntos
    updatePointsSummary(students[currentStudentIndex]);

    negativeReason.value = ""; // Limpiar el campo de input
    displayStudents(); // Actualizar la lista de estudiantes para reflejar los cambios
  }
});

document.getElementById("addTask").addEventListener("click", () => {
  const task = taskInput.value.trim();
  if (task) {
    students[currentStudentIndex].tasks.push({
      task,
      date: new Date().toLocaleDateString(),
    });

    // Actualizar la lista de pendientes en la UI
    displayTasks(students[currentStudentIndex].tasks);

    taskInput.value = ""; // Limpiar el campo de input
    displayStudents(); // Actualizar la lista de estudiantes para reflejar los cambios
    updatePointsSummary(students[currentStudentIndex]);
  }
});

// Event listener para el botón de agregar estudiante
addStudentBtn.addEventListener("click", () => {
  const name = studentSearch.value.trim();
  if (name && isStudentNameUnique(name)) {
    const newStudent = {
      name,
      tags: [],
      positivePoints: [],
      negativePoints: [],
      tasks: [],
    };
    students.push(newStudent);
    filteredStudents = [...students]; // Actualizamos filteredStudents
    saveToFile(students);
    initializeDatalist();
    displayStudents();
    studentSearch.value = "";
    updateAddStudentButtonState();

    // Abrir el modal para editar el nuevo estudiante
    currentStudentIndex = students.length - 1; // Seleccionar el índice del nuevo estudiante
    showStudentDetails(filteredStudents.length - 1); // Mostrar el modal
  }
});

// Función para filtrar estudiantes basado en la búsqueda
function filterStudents(searchTerm) {
  filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  currentPage = 1;
  displayStudents();
}

studentSearch.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  if (query) {
    filteredStudents = students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
    updateSearchFilterTag(query, filteredStudents.length);
  } else {
    filteredStudents = [...students];
    document.getElementById("searchFilterTag")?.remove();
    updateActiveFilter(allButton);

  }
  currentPage = 1;
  displayStudents();
  updateAddStudentButtonState();
});

// Event listener para cerrar el modal si se da clic fuera de él
window.addEventListener("click", (e) => {
  if (e.target === studentDetailsModal) {
    closeModal();
  }
});

// Event listener para el botón de eliminar estudiante
document.getElementById("deleteStudent").addEventListener("click", () => {
  if (currentStudentIndex !== null) {
    // Eliminar el estudiante del array
    students.splice(currentStudentIndex, 1);
    filteredStudents = [...students]; // Asegurarse de que la lista filtrada esté actualizada

    // Actualizar la lista de estudiantes
    displayStudents();
    initializeDatalist();
    generateFilterTags();
    studentDetailsModal.classList.add("hidden");
  }
});

// Nuevo event listener para cerrar el modal con la tecla Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !studentDetailsModal.classList.contains("hidden")) {
    closeModal();
  }
});

// Función para validar si el nombre del estudiante ya existe
function isStudentNameUnique(name) {
  return !students.some(
    (student) => student.name.toLowerCase() === name.toLowerCase()
  );
}

// Función para actualizar el estado del botón de agregar estudiante
function updateAddStudentButtonState() {
  const name = studentSearch.value.trim();
  addStudentBtn.disabled = !name || !isStudentNameUnique(name);
  addStudentBtn.classList.toggle("opacity-50", addStudentBtn.disabled);
  addStudentBtn.classList.toggle("cursor-not-allowed", addStudentBtn.disabled);
}

function updateSearchFilterTag(query, count) {
  let searchTag = document.getElementById("searchFilterTag");
  if (searchTag) {
    searchTag.textContent = `Búsqueda: ${query} (${count})`;
  } else {
    searchTag = document.createElement("button");
    searchTag.id = "searchFilterTag";
    searchTag.textContent = `Búsqueda: ${query} (${count})`;
    
    searchTag.className =
    "text-xs p-1 bg-gray-300 text-gray-800 rounded m-1 hover:bg-gray-400 transition active";
    
    searchTag.addEventListener("click", () => {
      studentSearch.value = "";
      filteredStudents = [...students];
      currentPage = 1;
      displayStudents();
      generateFilterTags();
      searchTag.remove();
    });
    filterTags.appendChild(searchTag);
    updateActiveFilter(searchTag);
  }
}

// Inicializar el estado del botón al cargar la página
updateAddStudentButtonState();
