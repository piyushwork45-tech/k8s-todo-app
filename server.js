const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = process.env.DATA_FILE || '/data/todos.json';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load todos from file
function loadTodos() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading todos:', e);
  }
  return { todos: [], nextId: 1 };
}

// Save todos to file
function saveTodos(todos, nextId) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ todos, nextId }, null, 2));
  } catch (e) {
    console.error('Error saving todos:', e);
  }
}

let { todos, nextId } = loadTodos();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { text, priority, dueDate, category } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const todo = {
    id: nextId++,
    text: text.trim(),
    done: false,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    category: category || 'General',
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  saveTodos(todos, nextId);
  res.status(201).json(todo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const todo = todos.find(t => t.id === id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  if (typeof req.body.done === 'boolean') todo.done = req.body.done;
  if (req.body.text) todo.text = req.body.text.trim();
  if (req.body.priority) todo.priority = req.body.priority;
  if (req.body.dueDate !== undefined) todo.dueDate = req.body.dueDate;
  if (req.body.category) todo.category = req.body.category;
  saveTodos(todos, nextId);
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = todos.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Todo not found' });
  todos.splice(index, 1);
  saveTodos(todos, nextId);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Todo app listening on port ${PORT}`);
  console.log(`Data file: ${DATA_FILE}`);
});
