const db = window.db;
const { doc, setDoc, getDoc, getDocs, collection } = window.fs;
let currentUser = JSON.parse(localStorage.getItem('rumc_user')||'null');

function render(){
  const app = document.getElementById('app');
  if(!currentUser){
    app.innerHTML = `<div class="min-h-screen flex items-center justify-center p-4"><div class="bg-white w-full max-w-md rounded-[28px] shadow-xl p-8"><h1 class="text-3xl font-bold">RUMC Group</h1><p class="text-gray-500 mt-2">23 members • Custom Login</p><input id="username" placeholder="Username (e.g. admin)" class="mt-6 w-full border rounded-xl px-4 py-3"/><input id="password" type="password" placeholder="Password" class="mt-3 w-full border rounded-xl px-4 py-3"/><button onclick="login()" class="mt-4 w-full bg-black text-white rounded-xl py-3 font-bold">Login</button><p class="text-xs text-gray-400 mt-4">Default admin: <b>admin / admin123</b></p><p id="msg" class="text-red-500 text-sm mt-3"></p></div></div>`;
  } else {
    app.innerHTML = `<div class="flex min-h-screen"><aside class="w-64 bg-white border-r p-6"><h2 class="font-bold text-xl">RUMC</h2><p class="text-sm text-gray-500">${currentUser.username} • ${currentUser.role}</p><nav class="mt-8 space-y-2"><button onclick="showTab('dashboard')" class="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100">Dashboard</button><button onclick="showTab('members')" class="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100">Members</button><button onclick="showTab('notices')" class="w-full text-left px-4 py-2 rounded-xl hover:bg-gray-100">Notices</button><button onclick="logout()" class="w-full text-left px-4 py-2 rounded-xl text-red-500 mt-10">Logout</button></nav></aside><main class="flex-1 p-4 md:p-8"><div id="content"></div></main></div>`;
    showTab('dashboard');
  }
}

window.login = async ()=>{
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  const msg = document.getElementById('msg');
  if(!u||!p){msg.innerText='Enter both';return;}
  try{
    if(u==='admin' && p==='admin123'){
      const ref = doc(db,'users','admin');
      const snap = await getDoc(ref);
      if(!snap.exists()){
        await setDoc(ref,{username:'admin', password:'admin123', role:'admin', name:'Admin', createdAt:Date.now()});
      }
    }
    const ref = doc(db,'users',u);
    const snap = await getDoc(ref);
    if(!snap.exists()){msg.innerText='User not found';return;}
    const data = snap.data();
    if(data.password!==p){msg.innerText='Wrong password';return;}
    currentUser = data;
    localStorage.setItem('rumc_user', JSON.stringify(currentUser));
    render();
  }catch(e){msg.innerText=e.message}
}
window.logout = ()=>{localStorage.removeItem('rumc_user');currentUser=null;render();}
window.showTab = async (tab)=>{
  const c = document.getElementById('content');
  if(tab==='dashboard'){
    c.innerHTML=`<h1 class="text-3xl font-bold">Welcome, ${currentUser.name||currentUser.username}</h1><p class="text-gray-500 mt-2">Project: rumc-groupdsh — asia-south1 — Standard — Free</p><div class="grid grid-cols-2 gap-4 mt-6"><div class="bg-white p-6 rounded-2xl"><p class="text-sm text-gray-500">Members</p><p class="text-2xl font-bold">23 max</p></div><div class="bg-white p-6 rounded-2xl"><p class="text-sm text-gray-500">Role</p><p class="text-xl font-bold">${currentUser.role}</p></div></div>`;
  }
  if(tab==='members'){
    c.innerHTML='Loading...';
    const snap = await getDocs(collection(db,'users'));
    let html = `<h1 class="text-2xl font-bold mb-4">Members</h1><div class="grid gap-3">`;
    snap.forEach(d=>{ const u=d.data(); html+=`<div class="bg-white p-4 rounded-2xl flex justify-between"><div><p class="font-bold">${u.name||u.username}</p><p class="text-xs text-gray-500">${u.username} • ${u.role}</p></div></div>`; });
    html+='</div><div class="bg-white mt-6 p-6 rounded-2xl"><h3 class="font-bold">Add Member</h3><input id="m_user" placeholder="username" class="mt-3 w-full border rounded-xl px-4 py-2"/><input id="m_name" placeholder="Full Name" class="mt-2 w-full border rounded-xl px-4 py-2"/><input id="m_pass" placeholder="password" class="mt-2 w-full border rounded-xl px-4 py-2"/><select id="m_role" class="mt-2 w-full border rounded-xl px-4 py-2"><option value="member">member</option><option value="admin">admin</option></select><button onclick="addMember()" class="mt-3 bg-black text-white px-5 py-2 rounded-xl">Save</button></div>';
    c.innerHTML=html;
  }
  if(tab==='notices'){
    const snap = await getDocs(collection(db,'notices'));
    let html = `<h1 class="text-2xl font-bold mb-4">Notices</h1><div class="space-y-3">`;
    snap.forEach(d=>{ const n=d.data(); html+=`<div class="bg-white p-4 rounded-2xl"><p class="font-bold">${n.title}</p><p class="text-sm mt-1">${n.body}</p></div>`; });
    html+=`</div><div class="bg-white mt-6 p-6 rounded-2xl"><h3 class="font-bold">Post Notice</h3><input id="n_title" placeholder="Title" class="mt-3 w-full border rounded-xl px-4 py-2"/><textarea id="n_body" placeholder="Details" class="mt-2 w-full border rounded-xl px-4 py-2"></textarea><button onclick="postNotice()" class="mt-3 bg-black text-white px-5 py-2 rounded-xl">Post</button></div>`;
    c.innerHTML=html;
  }
}
window.addMember = async ()=>{
  const username=document.getElementById('m_user').value.trim().toLowerCase();
  const name=document.getElementById('m_name').value.trim();
  const password=document.getElementById('m_pass').value.trim();
  const role=document.getElementById('m_role').value;
  if(!username||!password){alert('need username/pass');return;}
  await setDoc(doc(db,'users',username),{username, name: name||username, password, role, createdAt:Date.now()});
  alert('Saved');showTab('members');
}
window.postNotice = async ()=>{
  const title=document.getElementById('n_title').value.trim();
  const body=document.getElementById('n_body').value.trim();
  if(!title)return;
  const id=Date.now().toString();
  await setDoc(doc(db,'notices',id),{title, body, createdAt:Date.now(), by:currentUser.username});
  showTab('notices');
}
render();
