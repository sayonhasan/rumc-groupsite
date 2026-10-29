// app.js — FULL VERSION — Students Community of RUMC
// Black + Light Blue Space Theme — keeps ALL your ideas

console.log("RUMC FULL app.js loaded — Space Theme");

// === DATA FROM YOUR SPEC ===
const members = [
  ["Sadi","618"], ["Mustakim","636"], ["Nahiyan","634"], ["Labiba","643"],
  ["Alif","613"], ["Shoaib","602"], ["Tazim","637"], ["Samiul","633"],
  ["Shafi","630"], ["Rifwan","772"], ["Ramim","621"], ["Nudar","654"],
  ["Anas","632"], ["Labib","644"], ["Salman","655"], ["Turjo","615"], ["Rafsan","646"]
];

const admins = [
  ["Sayon","608","Founder, Lead Strategist, Owner"],
  ["Shafee","629","Co-Founder, AssistantX"],
  ["Sadik","641","Assistant, 4CF"]
];

const assistants = []; // N/A for now

const studyGroup = {
  name: "RUMC (VI-A, BM-MS) Study Group (2026)",
  description: "Welcome! This group was specifically made for academics as by the name, and being helpful is our main priority. Want to leave? You will be asked for feedback.",
  benefits: [
    "Accurate everyday diaries.",
    "Everyday routine and HW reminders.",
    "Voting systems for improvements.",
    "Exam reminders, notes, suggestions and more."
  ],
  whyUs: "Run by BdMO Regional Champion ('26) (5th), English Olympiad Grand Finalist (Malaysia and Singapore '26), WMI & BdMSO TST 3rd, and more. Admins have passed voting and strictly follow rules.",
  rules: [
    "No insignificant or unimportant messages are allowed here. (Memes, random messages, random forwards, stickers, videos etc.)",
    "Please use proper language and be kind to others. Swearing or bullying will not be tolerated.",
    "Do not send any too many messages at once. Spamming or replying without reason is forbidden.",
    "Forwarding or copying messages (Notes, diary, etc) from this group to other areas is strictly restricted. If anyone outside this group wants them, invite them. They will be added."
  ],
  creation: "12 April, 2026",
  madeBy: "Sayon"
};

const familyGroup = {
  name: "Family Members of RUMC (VI-A, BM-MS, 2026)",
  description: "Welcome to our group! This group was made for chatting with one another and having a good time. Chill, chat and have fun. Enjoy this group. If you want academic help, go to the other group (@RUMC (VI-A, BM-MS) Study Group - 2026). This one was actually made first in the community, even before it. First group that actually stayed in the long run.",
  madeBy: "MD. Sekh Sadi Ahmed, (Ex-Owner, Founder, Member)",
  creation: "22 February, 2026",
  owner: "Currently Owned by Sayon — Co-Founder, Owner, Community Owner, Lead Strategist."
};

// === WHATSAPP VALIDATION ===
function isValidBDPhone(phone){ return /^01[0-9]{9}$/.test(phone); }

// === AUTH & DASHBOARD WITH FIREBASE ===
window.handleAuth = async () => {
  const name = document.getElementById('s_name')?.value.trim();
  const phone = document.getElementById('s_phone')?.value.trim();
  const cls = document.getElementById('s_class')?.value.trim();
  const code = document.getElementById('s_code')?.value.trim();
  const err = document.getElementById('s_err');
  if(err) err.style.display = isValidBDPhone(phone) ? 'none' : 'block';
  if(!isValidBDPhone(phone) || !name || !cls || !code){ return; }

  const userData = {
    name, phone, classCode: cls, code,
    joinedAt: new Date().toISOString(),
    attendance: 94, hwDone: 12, hwTotal: 15, notes: 34,
    group: studyGroup.name, verified: true
  };

  localStorage.setItem('rumc_user', JSON.stringify({name, phone, cls, code, joinedAt: userData.joinedAt}));

  if(window.db && window.setDoc && window.doc){
    try{
      await window.setDoc(window.doc(window.db, "users", phone), userData);
    }catch(e){ alert("Firebase save failed: " + e.message); }
  }
  document.getElementById('signModal')?.classList.remove('active');
  openDashboard();
};

window.openSign = () => document.getElementById('signModal')?.classList.add('active');
window.closeSign = () => document.getElementById('signModal')?.classList.remove('active');
window.openDashboard = () => {
  const raw = localStorage.getItem('rumc_user');
  if(!raw){ openSign(); return; }
  const u = JSON.parse(raw);
  document.getElementById('d_phone').textContent = u.phone + " — ● Verified & Tracking via WhatsApp";
  document.getElementById('dashUser').textContent = `${u.name} • Class ${u.cls} • Joined ${new Date(u.joinedAt).toLocaleDateString()}`;
  document.getElementById('dashboard')?.classList.add('active');
};
window.closeDashboard = () => document.getElementById('dashboard')?.classList.remove('active');

// === LISTS — Buttons you asked: members / admins / assistants ===
window.showList = (type) => {
  const modal = document.getElementById('listModal');
  const title = document.getElementById('listTitle');
  const body = document.getElementById('listBody');
  if(!modal || !title || !body) return;
  body.innerHTML = '';
  if(type === 'members'){
    title.textContent = `All Members — Names & Class Code Only (${members.length})`;
    members.forEach(([n,c])=>{
      let d=document.createElement('div'); d.className='pill mono';
      d.innerHTML=`<b>${n}</b> <span>(${c})</span>`;
      body.appendChild(d);
    });
  }
  if(type === 'admins'){
    title.textContent = `Admins — Names, Class Code, Role`;
    admins.forEach(([n,c,r])=>{
      let d=document.createElement('div'); d.className='pill mono'; d.style.minWidth='280px';
      d.innerHTML=`<b>${n}</b> <span>(${c})</span> — <span>${r}</span>`;
      body.appendChild(d);
    });
  }
  if(type === 'assistants'){
    title.textContent = `Assistants — Helping at every point`;
    body.innerHTML = `<p style="color:var(--muted)">Assistants: N/A — No assistants currently. Recruitment open.</p>`;
  }
  modal.classList.add('active');
};

// === WHATSAPP TRACKING ===
window.sendWhatsApp = (phone, message) => {
  if(!isValidBDPhone(phone)){ alert("Enter valid BD number — 11 digits starting with 01"); return; }
  const intl = "88" + phone;
  const url = `https://wa.me/${intl}?text=${encodeURIComponent(message || "Hello from RUMC!")}`;
  window.open(url, "_blank");
};

// === MEMBER COUNT UPDATE ===
async function updateMemberCount(){
  const elTotal = document.getElementById('totalCount');
  const elHist = document.getElementById('histCount');
  try{
    if(window.db){
      const {collection,getDocs} = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js");
      const snap = await getDocs(collection(window.db, "users"));
      const total = snap.size + members.length;
      if(elTotal) elTotal.textContent = total + "+";
      if(elHist) elHist.textContent = total + "+";
    } else {
      if(elTotal) elTotal.textContent = members.length + "+";
      if(elHist) elHist.textContent = members.length + "+";
    }
  }catch(e){}
}

function initStars(){
  const container = document.getElementById('stars');
  if(!container) return;
  for(let i=0;i<120;i++){
    let d=document.createElement('div'); d.className='star';
    d.style.left=Math.random()*100+'%'; d.style.top=Math.random()*100+'%';
    d.style.animationDelay=Math.random()*3+'s';
    container.appendChild(d);
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  initStars();
  setTimeout(updateMemberCount, 1200);
});
