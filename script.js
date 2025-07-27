class TaskManager {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    this.render();
  }

  save() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.updateStats();
  }

  add(text, category, priority) {
    const task = {
      id: Date.now(),
      text,
      category,
      priority,
      completed: false
    };
    this.tasks.push(task);
    this.save();
    this.render();
    this.confetti();
  }

  toggleComplete(id) {
    const task = this.tasks.find(t => t.id === id);
    task.completed = !task.completed;
    this.save();
    this.render();
    if (task.completed) this.confetti();
  }

  delete(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
    this.render();
  }

  filter(status) {
    if (status === 'all') return this.tasks;
    if (status === 'active') return this.tasks.filter(t => !t.completed);
    if (status === 'completed') return this.tasks.filter(t => t.completed);
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    document.getElementById('taskStats').textContent = `${completed} / ${total} tasks completed`;
  }

  render(filter = 'all') {
    const list = document.getElementById('taskList');
    list.innerHTML = '';
    const filtered = this.filter(filter);
    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = 'task-item' + (task.completed ? ' completed' : '');

      const text = document.createElement('span');
      text.textContent = task.text;
      text.contentEditable = true;
      text.addEventListener('blur', () => {
        task.text = text.textContent;
        this.save();
      });

      const badge = document.createElement('span');
      badge.className = 'category-label';
      badge.textContent = `${task.category} • ${task.priority}`;

      const toggle = document.createElement('button');
      toggle.textContent = task.completed ? 'Undo' : 'Done';
      toggle.onclick = () => this.toggleComplete(task.id);

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.onclick = () => this.delete(task.id);

      item.append(text, badge, toggle, del);
      list.appendChild(item);
    });
    this.updateStats();
  }

  confetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    size: Math.random() * 6 + 2,
    dx: Math.random() * 4 - 2,
    dy: Math.random() * 4 + 2,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    life: 60 // life in frames
  }));

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    if (particles.some(p => p.life > 0)) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      // Clear once done
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  animate();
}

}

const taskManager = new TaskManager();

function addTask() {
  const input = document.getElementById('taskInput');
  const category = document.getElementById('category').value;
  const priority = document.getElementById('priority').value;
  const text = input.value.trim();
  if (text) taskManager.add(text, category, priority);
  input.value = '';
}

function filterTasks(status) {
  taskManager.render(status);
}
