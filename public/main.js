async function fetchUsers() {
  const res = await fetch('/api/users');
  const users = await res.json();
  const list = document.getElementById('userList');
  list.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = `${user.name} (${user.email})`;
    list.appendChild(li);
  });
}

async function addUser() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });
  fetchUsers();
}

window.onload = fetchUsers;
