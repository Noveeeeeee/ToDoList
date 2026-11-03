import "./style.css"

//1. STATO
const CHIAVE = "todo-tasks"
const CHIAVE_NOME = "todo-nome"

// Legge i task salvati nel browser
function caricaStato() {
  const testo = localStorage.getItem(CHIAVE)
  if (testo === null) return []      // prima visita: nessun dato
  return JSON.parse(testo)           // da stringa JSON a array
}

// let (non const) perché le azioni riassegnano un array nuovo
let tasks = caricaStato()

 //2. RIFERIMENTI ALLA PAGINA
const lista     = document.querySelector("#lista")
const info      = document.querySelector("#info")
const azioni    = document.querySelector("#azioni")
const benvenuto = document.querySelector("#benvenuto")
const form      = document.querySelector("#form-task")
const campo     = document.querySelector("#campo-task")

// 3. PERSISTENZA
// Scrive lo stato nel browser (da array a stringa JSON)
function salvaStato() {
  localStorage.setItem(CHIAVE, JSON.stringify(tasks))
}

// 4. VIEW 
// Legge lo stato e ridisegna la pagina. Non decide niente.
function render() {
  const messaggio = document.querySelector("#messaggio")   // locale: nessuna variabile globale in più

  // sfida bonus: i completati vanno in fondo.
  // [...tasks] fa una copia, perché sort() modifica l'array su cui viene chiamato.
  // false(0) viene prima di true(1); a parità l'ordine resta quello di prima.
  const ordinati = [...tasks].sort((a, b) => Number(a.completed) - Number(b.completed))

  lista.innerHTML = ordinati
    .map(t => `
      <li class="${t.completed ? "fatto" : ""}" data-id="${t.id}">
        <span class="titolo">${t.title}</span>
        <button class="elimina" data-id="${t.id}">×</button>
      </li>
    `)
    .join("")

  // tutti i numeri si ricavano dallo stato, non si salvano
  const totali = tasks.length
  const completati = tasks.filter(t => t.completed).length
  const restanti = totali - completati

  info.textContent = `Task presenti: ${totali} · Task completati: ${completati}`

  // sfida 8: la frase cambia in base alla situazione
  // (si controlla prima la lista vuota, perché con 0 task "restanti" è 0)
  if (totali === 0) {
    messaggio.textContent = "Non hai task."
  } else if (restanti === 0) {
    messaggio.textContent = "Non hai nessun task."
  } else {
    messaggio.textContent = `Ti restano ${restanti} task su ${totali}.`
  }

  // sfida 9: il pulsante compare solo se c'è almeno un task completato
  azioni.innerHTML = completati > 0
    ? `<button id="pulisci">Elimina task completati (${completati})</button>`
    : ""
}

// sfida 7: saluto o richiesta del nome, a seconda di cosa è salvato
function renderBenvenuto() {
  const nome = localStorage.getItem(CHIAVE_NOME)

  if (nome) {
    benvenuto.innerHTML = `<p>Ciao ${nome}</p>`
    return
  }

  benvenuto.innerHTML = `
    <input type="text" id="campo-nome" placeholder="Come ti chiami?" autocomplete="off">
    <button id="salva-nome">Salva</button>
  `

  document.querySelector("#salva-nome").addEventListener("click", () => {
    const valore = document.querySelector("#campo-nome").value.trim()
    if (valore === "") return
    localStorage.setItem(CHIAVE_NOME, valore)   // è già una stringa
    renderBenvenuto()                           // ridisegna: ora mostra il saluto
  })
}

//5. AZIONI
// Ogni azione: nuovo array -> salvaStato() -> render()

function addTask(title) {
  const pulito = title.trim()
  if (pulito === "") return          // niente task vuoti

  tasks = [...tasks, { id: Date.now(), title: pulito, completed: false }]
  salvaStato()
  render()
}

function toggleTask(id) {
  tasks = tasks.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
  salvaStato()
  render()
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id)
  salvaStato()
  render()
}

// sfida 9: come deleteTask, ma si tengono i task non completati
function deleteCompletati() {
  if (!confirm("Elimino tutti i task completati?")) return

  tasks = tasks.filter(t => !t.completed)
  salvaStato()
  render()
}

//6. EVENTI
form.addEventListener("submit", (evento) => {
  evento.preventDefault()            // evita il ricaricamento della pagina
  addTask(campo.value)
  campo.value = ""
  campo.focus()
})

// Un solo listener sulla lista (i <li> vengono ricreati a ogni render)
lista.addEventListener("click", (evento) => {
  const elemento = evento.target

  // click sul pulsante ×
  if (elemento.classList.contains("elimina")) {
    deleteTask(Number(elemento.dataset.id))
    return
  }

  // click in un punto qualsiasi della riga
  const riga = elemento.closest("li")
  if (riga) {
    toggleTask(Number(riga.dataset.id))
  }
})

// Stesso schema per il pulsante "Elimina completati":
// il listener sta sul contenitore fisso, il pulsante viene ricreato a ogni render
azioni.addEventListener("click", (evento) => {
  if (evento.target.id === "pulisci") {
    deleteCompletati()
  }
})

//7. AVVIO 
renderBenvenuto()
render()
