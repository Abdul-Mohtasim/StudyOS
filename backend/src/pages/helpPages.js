"use strict";

// Public Help Center and Feedback pages. The app opens these in the phone's browser.
// Query options: ?theme=dark|light  &pal=ocean|forest|sunset|mono  &email=...  &type=...

const FAQ = [
  {
    title: "Using StudyOS",
    items: [
      ["What is a streak?", "Your streak counts the days in a row you studied. Finish a task or a focus session each day to keep it going. The streak widget on your home screen shows it too."],
      ["How do focus sessions work?", "Open Focus, pick a subject and a length, then press Start. When the timer ends the session is saved and counts toward your weekly report and your streak."],
      ["What are gems and how do I earn them?", "Gems are the StudyOS coins. You earn them by studying, for example by finishing tasks and focus sessions. Spend them in the Gem Shop, or gift some to a friend."],
      ["How do I add a subject?", "Subjects come from your tasks. Add a task with a subject name and the subject appears on the Subjects page, together with its progress and an icon that fits the name."],
      ["Does StudyOS work without internet?", "Yes. Sign in once, and your saved data stays on the phone. Changes you make offline are sent when the connection is back."],
    ],
  },
  {
    title: "Account Management",
    items: [
      ["How do I change my name, username or email address?", "Open Profile, tap the pencil on your picture, then edit your details and save."],
      ["How do I find, follow and block friends?", "Open Profile and tap ADD FRIENDS. You can search by email, accept requests, and open a friend's profile to remove or block them."],
      ["I'm having trouble accessing my account.", "Check that you use the same sign-in method as before (email or Google). If you forgot your password, use Forgot password on the sign-in screen. Still stuck? Send us feedback and choose Account problem."],
      ["How do I export or delete my data?", "In Settings, open Data, then Export my data to download a copy. To delete your account, open Settings, then Privacy settings, and choose Delete account. This cannot be undone."],
      ["What should I do if my account was compromised?", "Change your password at once from Settings, then send us feedback with the type Account problem so we can help secure your account."],
    ],
  },
  {
    title: "Gems & Shop",
    items: [
      ["What can I buy in the Shop?", "Streak freezes, double gems, paid colour themes, the Widget Pack for your home screen and the Badge Showcase for your profile. Items marked Soon are not available yet."],
      ["How do I use the Widget Pack?", "After you buy it, touch and hold an empty spot on your home screen, tap Widgets, then pick StudyOS. There are four widgets: Streak, Today's tasks, Focus and This week."],
      ["How do colour themes work?", "Buy a theme in the Shop, then open Settings, then Appearance, and tap it. Every page, widget and text field follows the theme you pick."],
      ["How do I get my purchases on a new phone?", "Sign in with the same account. Everything you bought is saved to your account, not to the phone."],
      ["Do gems expire?", "No. Your gems stay on your account until you spend them."],
    ],
  },
];

const TYPES = ["Bug or something broken", "Feature request", "Account problem", "Gems or Shop", "Widgets", "Other"];

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const PAL = {
  "": { a: "#c9b8c3", l: "#8b6f80" },
  ocean: { a: "#8fb9d3", l: "#3f86a8" },
  forest: { a: "#93bda1", l: "#3f9a62" },
  sunset: { a: "#e0a78f", l: "#d9743f" },
  mono: { a: "#a8a8a8", l: "#555555" },
};

const CSS = `
:root{--bg:#131f24;--bar:#131f24;--card:#131f24;--line:#2b3d46;--ink:#f1f5f7;--mut:#8b9ba4;--link:#49c0f8;--field:#1c2c33;--btnT:#10181c}
:root[data-theme="light"]{--bg:#ffffff;--bar:#ffffff;--card:#ffffff;--line:#dfe5e8;--ink:#1f2a30;--mut:#6a7a83;--link:#1a8fd0;--field:#f4f7f8;--btnT:#ffffff}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:600 15px/1.5 "Nunito",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--link);text-decoration:none}
.top{height:56px;display:flex;align-items:center;padding:0 22px;border-bottom:1px solid var(--line);background:var(--bar)}
.logo{font:700 24px "Fredoka","Nunito",system-ui,sans-serif;color:var(--acc);letter-spacing:-.01em}
.wrap{max-width:960px;margin:0 auto;padding:18px 12px 60px}
.crumb{font:800 11px/1 "Nunito",system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;display:flex;gap:10px;align-items:center;color:var(--link);margin:2px 8px 26px}
.crumb i{font-style:normal;color:var(--mut)}
h1{font:600 22px/1.3 "Fredoka","Nunito",system-ui,sans-serif;text-align:center;margin:0 0 24px}
.grp{border:1px solid var(--line);border-radius:12px;margin:0 0 26px;overflow:hidden;background:var(--card)}
.grp h2{margin:0;padding:14px 20px;font:800 12.5px/1.2 "Nunito",system-ui,sans-serif;color:var(--link);border-bottom:1px solid var(--line)}
details{border-bottom:1px solid var(--line)}
details:last-child{border-bottom:0}
summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 20px;font:700 13px/1.35 "Nunito",system-ui,sans-serif}
summary::-webkit-details-marker{display:none}
summary svg{flex:none;width:18px;height:18px;color:var(--mut);transition:transform .2s}
details[open] summary svg{transform:rotate(180deg)}
details p{margin:0;padding:0 20px 16px;color:var(--mut);font:600 13.5px/1.6 "Nunito",system-ui,sans-serif}
.more{text-align:center;margin-top:34px}
.more b{display:block;font:800 12px/1.3 "Nunito",system-ui,sans-serif;margin-bottom:14px}
.btn{display:inline-block;border:0;border-radius:12px;background:var(--link);color:var(--btnT);font:800 11px/1 "Nunito",system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;padding:13px 18px;box-shadow:0 3px 0 rgba(0,0,0,.28);cursor:pointer}
.btn:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.28)}
.btn:disabled{opacity:.55;cursor:default}
.panel{border:1px solid var(--line);border-radius:12px;padding:22px 24px;display:grid;grid-template-columns:1fr 1.25fr;gap:28px;background:var(--card)}
.panel h3{margin:0 0 10px;font:800 12px/1.3 "Nunito",system-ui,sans-serif}
.panel .hint{margin:0;color:var(--mut);font:600 12px/1.6 "Nunito",system-ui,sans-serif}
label{display:block;font:800 11.5px/1.3 "Nunito",system-ui,sans-serif;margin:0 0 6px}
label em{color:#ff4b4b;font-style:normal}
input[type=email],input[type=text],textarea,select{width:100%;border:1px solid var(--line);border-radius:8px;background:var(--field);color:var(--ink);font:700 13px/1.4 "Nunito",system-ui,sans-serif;padding:10px 12px;margin:0 0 14px;outline:none}
textarea{min-height:110px;resize:vertical}
select{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b9ba4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;text-transform:uppercase;font-size:11px;letter-spacing:.05em}
input:focus,textarea:focus,select:focus{border-color:var(--link);box-shadow:0 0 0 3px color-mix(in srgb,var(--link) 25%,transparent)}
.drop{display:block;border:1px dashed var(--line);border-radius:8px;padding:26px 12px;text-align:center;font:800 12px/1.4 "Nunito",system-ui,sans-serif;cursor:pointer;margin:0 0 8px}
.drop.on{border-color:var(--link)}
.drop span{color:var(--link)}
.files{margin:0 0 14px;padding:0;list-style:none;color:var(--mut);font:700 12px/1.6 "Nunito",system-ui,sans-serif}
.files button{border:0;background:none;color:#ff6b6b;font:800 12px "Nunito",system-ui,sans-serif;cursor:pointer;margin-left:8px}
.row{display:flex;justify-content:flex-end;align-items:center;gap:14px}
.msg{flex:1;font:700 12px/1.4 "Nunito",system-ui,sans-serif;color:#ff6b6b}
.msg.ok{color:#58cc02}
.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}
.done{border:1px solid var(--line);border-radius:12px;padding:46px 20px;text-align:center}
.done h2{font:600 20px "Fredoka","Nunito",system-ui,sans-serif;margin:0 0 8px}
.done p{margin:0 0 18px;color:var(--mut)}
/* Proportions of the reference design: the page is laid out 720 CSS px wide and scaled to the phone, so text is small and rows are 48px tall */
.top{height:50px;padding:0 21px}
.logo{font-size:20px}
.wrap{max-width:720px;padding:0 11px 52px}
.crumb{font-size:10px;margin:18px 10px 26px;gap:9px}
h1{font:600 19px/1.3 "Fredoka","Nunito",system-ui,sans-serif;margin:0 0 22px}
.grp{border-radius:8px;margin:0 0 32px}
.grp h2{padding:0 21px;height:48px;display:flex;align-items:center;font:800 10px/1 "Nunito",system-ui,sans-serif}
summary{min-height:48px;padding:0 21px;font:700 11px/1.35 "Nunito",system-ui,sans-serif}
summary svg{width:14px;height:14px}
details p{padding:0 21px 16px;font:600 11px/1.6 "Nunito",system-ui,sans-serif}
.more{margin-top:26px}
.more b{font-size:10px;margin-bottom:10px}
.btn{border-radius:7px;font:800 9px/1 "Nunito",system-ui,sans-serif;padding:0 14px;height:30px;line-height:30px;box-shadow:0 3px 0 rgba(0,0,0,.28)}
.panel{border-radius:8px;padding:21px 24px 22px;grid-template-columns:1fr 1fr;gap:20px}
.panel>div:first-child{padding-right:30px}
.panel h3{font-size:10px;margin:0 0 14px}
.panel .hint{font-size:10px;line-height:1.6}
label{font:800 9.5px/1.3 "Nunito",system-ui,sans-serif;margin:0 0 5px}
input[type=email],input[type=text],textarea,select{border-radius:5px;font:700 11px/1.4 "Nunito",system-ui,sans-serif;padding:0 10px;height:30px;margin:0 0 11px}
textarea{height:50px;min-height:50px;padding:8px 10px;margin-bottom:38px}
select{font-size:8.5px;letter-spacing:.06em;text-transform:uppercase}
.drop{border-radius:5px;padding:0;height:64px;display:flex;align-items:center;justify-content:center;gap:4px;font:800 9.5px/1.4 "Nunito",system-ui,sans-serif;margin:0 0 10px}
.files{font-size:10px}
.row{justify-content:flex-end}
.done{border-radius:8px}
`;

const FONTS =
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@600;700;800&display=swap">';

function shell(title, q, body, script) {
  const theme = q.theme === "light" ? "light" : "dark";
  const pal = PAL[String(q.pal || "").replace(/^theme_/, "")] || PAL[""];
  const acc = theme === "light" ? pal.l : pal.a;
  return `<!doctype html><html lang="en" data-theme="${theme}" style="--acc:${acc};--link:${theme === "light" ? pal.l : pal.a}"><head><meta charset="utf-8"><meta name="viewport" content="width=720"><meta name="robots" content="noindex"><title>${esc(title)} | StudyOS</title><meta name="theme-color" content="${theme === "light" ? "#ffffff" : "#131f24"}">${FONTS}<style>${CSS}</style></head><body><div class="top"><span class="logo">StudyOS</span></div><div class="wrap">${body}</div>${script || ""}</body></html>`;
}

function keep(q) {
  const p = new URLSearchParams();
  for (const k of ["theme", "pal", "email"]) if (q[k]) p.set(k, String(q[k]).slice(0, 120));
  const s = p.toString();
  return s ? `?${s}` : "";
}

const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

function helpPage(q) {
  const groups = FAQ.map(
    (g) =>
      `<section class="grp"><h2>${esc(g.title)}</h2>${g.items
        .map(([a, b]) => `<details><summary>${esc(a)}${CHEV}</summary><p>${esc(b)}</p></details>`)
        .join("")}</section>`
  ).join("");
  const body = `<div class="crumb">Help Center <i>&rsaquo;</i> Home</div><h1>Frequently Asked Questions</h1>${groups}<div class="more"><b>Still unsure about something?</b><a class="btn" href="/help/feedback${keep(q)}">Send feedback</a></div>`;
  return shell("Help Center", q, body);
}

function feedbackPage(q) {
  const email = esc(String(q.email || "").slice(0, 200));
  const want = String(q.type || "");
  const options = TYPES.map((t) => `<option value="${esc(t)}"${t === want ? " selected" : ""}>${esc(t)}</option>`).join("");
  const body = `<div class="crumb"><a href="/help${keep(q)}">Help Center</a> <i>&rsaquo;</i> Feedback</div><h1>What can we help you with?</h1>
<form id="f" class="panel" novalidate autocomplete="on">
<div><h3>Describe your issue</h3><p class="hint">Please describe the issue you are experiencing in as much detail as possible. This will help us understand what's going on.</p></div>
<div>
<label for="email">Your Email Address <em>*</em></label><input id="email" name="email" type="email" maxlength="200" value="${email}" autocomplete="email">
<label for="subject">Subject <em>*</em></label><input id="subject" name="subject" type="text" maxlength="140">
<label for="description">Description <em>*</em></label><textarea id="description" name="description" maxlength="5000"></textarea>
<label for="type">Type of issue <em>*</em></label><select id="type" name="type"><option value="">Please select one...</option>${options}</select>
<label>Attachments</label>
<label class="drop" id="drop" for="file"><span>Add file</span> or drop files here</label><input id="file" type="file" accept="image/*,application/pdf" multiple hidden>
<ul class="files" id="files"></ul>
<input class="hp" type="text" name="website" id="website" tabindex="-1" autocomplete="off" aria-hidden="true">
<div class="row"><span class="msg" id="msg" role="status"></span><button class="btn" id="go" type="submit">Submit</button></div>
</div></form>
<div class="done" id="done" hidden><h2>Thank you!</h2><p>We got your message and will reply to your email address.</p><a class="btn" href="/help${keep(q)}">Back to Help Center</a></div>`;
  const script = `<script>
(function(){
var $=function(i){return document.getElementById(i)},files=[],MAX=3,LIMIT=3*1024*1024;
function say(t,ok){var m=$('msg');m.textContent=t||'';m.className='msg'+(ok?' ok':'')}
function draw(){var u=$('files');u.innerHTML='';files.forEach(function(f,i){var li=document.createElement('li');li.textContent=f.name+' ('+Math.max(1,Math.round(f.size/1024))+' KB)';var b=document.createElement('button');b.type='button';b.textContent='Remove';b.onclick=function(){files.splice(i,1);draw()};li.appendChild(b);u.appendChild(li)})}
function add(list){say('');Array.prototype.forEach.call(list,function(f){
 if(files.length>=MAX){say('You can attach up to '+MAX+' files.');return}
 if(!/^image\\//.test(f.type)&&f.type!=='application/pdf'){say('Only images and PDF files can be attached.');return}
 var total=files.reduce(function(n,x){return n+x.size},0)+f.size;
 if(total>LIMIT){say('Attachments can be 3 MB in total.');return}
 files.push(f)});draw()}
$('file').onchange=function(e){add(e.target.files);e.target.value=''};
var d=$('drop');['dragenter','dragover'].forEach(function(n){d.addEventListener(n,function(e){e.preventDefault();d.classList.add('on')})});
['dragleave','drop'].forEach(function(n){d.addEventListener(n,function(e){e.preventDefault();d.classList.remove('on')})});
d.addEventListener('drop',function(e){if(e.dataTransfer)add(e.dataTransfer.files)});
function b64(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(String(r.result).split(',')[1]||'')};r.onerror=rej;r.readAsDataURL(f)})}
$('f').addEventListener('submit',function(e){e.preventDefault();
 var email=$('email').value.trim(),subject=$('subject').value.trim(),desc=$('description').value.trim(),type=$('type').value;
 if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email))return say('Enter a valid email address.');
 if(!subject)return say('Add a subject.');
 if(!desc)return say('Describe the issue.');
 if(!type)return say('Choose the type of issue.');
 var go=$('go');go.disabled=true;say('Sending...',true);
 Promise.all(files.map(function(f){return b64(f).then(function(c){return{name:f.name,type:f.type,data:c}})})).then(function(att){
  return fetch('/api/support/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,subject:subject,description:desc,type:type,website:$('website').value,attachments:att})})
 }).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw new Error(j.error||'Could not send. Please try again.');return j})})
 .then(function(){$('f').hidden=true;$('done').hidden=false;window.scrollTo(0,0)})
 .catch(function(err){go.disabled=false;say(err.message||'Could not send. Please try again.')})
});
})();
</script>`;
  return shell("Feedback", q, body, script);
}

module.exports = { helpPage, feedbackPage, TYPES };
