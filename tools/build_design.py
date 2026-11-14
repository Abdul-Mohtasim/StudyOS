#!/usr/bin/env python3
"""Builds src/designapp/{design.css,designRuntime.js} from the approved v14 design file.
Usage: python3 build_design.py path/to/StudyOS_Final_Design_v14.html path/to/frontend/src/designapp
Nothing in the design is redrawn: its own CSS and code run inside a Shadow DOM."""
import re, sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf8').read()

# ---------- CSS ----------
styles = re.findall(r'<style[^>]*>(.*?)</style>', s, re.S)
css = '\n'.join(styles)
css = css.replace(':root{', ':host{', 1)
css = re.sub(r'\nbody\{[^}]*\}', '\n', css, count=1)

# ---------- script ----------
sc = re.search(r'<script>(.*?)</script>', s, re.S).group(1)
sc = re.sub(r"const INTRO_B64='[A-Za-z0-9+/=]+'", "const INTRO_B64=''", sc)
sc = re.sub(r"const LCB64='[A-Za-z0-9+/=]+'", "const LCB64=''", sc)
assert sc.lstrip().startswith('(()=>{'), 'unexpected script start'

def sub1(pat, rep, text, flags=0, count=1):
    new, n = re.subn(pat, lambda m: rep, text, count=count, flags=flags)
    assert n >= 1, 'pattern not found: ' + pat[:60]
    return new

sc = sub1(r"const \$=\(s,r=document\)=>r\.querySelector\(s\);", "const $=(s,r=ROOT)=>r.querySelector(s);", sc)
sc = sub1(r"const \$\$=\(q,r=document\)=>\[\.\.\.r\.querySelectorAll\(q\)\];", "const $$=(q,r=ROOT)=>[...r.querySelectorAll(q)];", sc)
n_head = sc.count('document.head.appendChild(')
sc = sc.replace('document.head.appendChild(', 'ROOT.appendChild(')

# haptics -> the app (no vibration/dot UI of the prototype)
hp = re.search(r"function hap\(k\)\{.*?\n\}\n", sc, re.S)
assert hp
sc = sc.replace(hp.group(0), "function hap(k){if(!S.haptics)return;try{APP.haptic&&APP.haptic(k)}catch(e){}}\n", 1)

# tab bar navigation -> the app
tn = re.search(r"/\* tab bar navigation \*/\ndocument\.addEventListener\('click'.*?,true\);\n", sc, re.S)
assert tn
sc = sc.replace(tn.group(0), """/* tab bar navigation (handled by the app) */
ROOT.addEventListener('click',e=>{const n=e.target.closest('.nv[data-k]');if(!n)return;e.stopPropagation();const k=n.dataset.k;if(k==='profile'&&SCREENS[CUR].t==='Profile')return;hap('light');APP.navigate&&APP.navigate(k)},true);
""", 1)


# ---------- data binding patches (strings from the design are replaced by app data) ----------
def P(old, new, count=1):
    global sc
    assert sc.count(old) >= 1, 'patch target missing: ' + old[:70]
    sc = sc.replace(old, new, count)

# accessor + NS holder at the top of the runtime
sc = sc.replace('(()=>{', '(()=>{\nconst APPD=()=>APP.data||{};let DESIGN_NS=null;', 1)
# Profile
P('@aisha_rahman · Joined 2026', '@${APPD().username} · Joined ${APPD().joined}')
P('<span class="plus2">+2</span>', '${APPD().extraSubjects>0?`<span class="plus2">+${APPD().extraSubjects}</span>`:\'\'}')
P('<b>12</b><span>Following</span>', '<b>${APPD().following}</b><span>Following</span>')
P('<b>8</b><span>Followers</span>', '<b>${APPD().followers}</b><span>Followers</span>')
P('${U.streak} days</div>', '${APPD().streak} days</div>')
P('${18+(U.done?1:0)} tasks', '${APPD().tasksDone} tasks')
P('42 hours', '${APPD().hours} hours')
P('1,240 XP', '${Number(APPD().gems||0).toLocaleString()} gems')
P('<div class="hname">Aisha Rahman</div>', '<div class="hname">${APPD().name}</div>')
P('<div class="qn">Aisha Rahman</div><div class="qhh">@aisha_rahman</div>', '<div class="qn">${APPD().name}</div><div class="qhh">@${APPD().username}</div>')
# sections that need data the app does not have yet are not shown (no made-up friends or badges)
a = sc.index('<div class="sec">Friend streaks</div>')
b = sc.index('</div></div><div class="pfbar" data-bar>', a)
sc = sc[:a] + sc[b:]
# Friends leaderboard from real data; the study groups card is hidden until groups exist
P("${[['1','R','Rohan',520],['2','M','Meera',475],['3','A','Aisha (You)',430],['4','K','Kabir',380],['5','S','Sana',300]].map(([r,a,n,m])=>`<div class=\"lbrow${r==='3'?' me':''}\"><span class=\"rk\">${r}</span><span class=\"ava\">${a}</span><span>${n}</span><span class=\"mn\">${m} min</span></div>`).join('')}",
  "${(APPD().leaderboard||[]).map((o,i)=>[String(i+1),(o.name||'?').trim().charAt(0).toUpperCase(),o.me?o.name+' (You)':o.name,o.minutes,o.me]).map(([r,a,n,m,me])=>`<div class=\"lbrow${me?' me':''}\"><span class=\"rk\">${r}</span><span class=\"ava\">${a}</span><span>${n}</span><span class=\"mn\">${m} min</span></div>`).join('')}")
a = sc.index('<b style="display:block;font:700 20px var(--display);margin-top:18px">Study groups</b>')
b = sc.index('<div class="btn2" style="margin-top:14px;border-radius:24px">Invite a friend</div>', a)
sc = sc[:a] + sc[b:]
# real QR code (the design's matrix is only a placeholder)
P("const QM=[[", "const QM0=[[")
P("const qrSvg=()=>{const n=QM.length", "const qrSvg=()=>{const QM=(APP.qrMatrix&&APP.qrMatrix())||QM0;const n=QM.length")
# Edit profile
P('<input class="sin" value="Aisha"><div class="sfl">Last name</div><input class="sin" value="Rahman"><div class="sfl">Username</div><input class="sin" value="aisha_rahman"><div class="sfl">Password</div><input class="sin" type="password" value="studyos8"><div class="sfl">Email</div><input class="sin" value="aisha.rahman@gmail.com">',
  '<input class="sin" data-fn value="${APPD().first}"><div class="sfl">Last name</div><input class="sin" data-ln value="${APPD().last}"><div class="sfl">Username</div><input class="sin" value="${APPD().username}"><div class="sfl">Password</div><input class="sin" type="password" placeholder="••••••••" value=""><div class="sfl">Email</div><input class="sin" value="${APPD().email}">')
# Notifications: keep the design's own state object, start from the saved one
P("const NS={smart:1,cal:1,rt:17*60,st:20*60+30};", "const NS=Object.assign({smart:1,cal:1,rt:17*60,st:20*60+30},APPD().notifState||{});DESIGN_NS=NS;")
# haptics can be muted while restoring saved choices
P("function hap(k){if(!S.haptics)return;", "function hap(k){if(!S.haptics||SUPPRESS)return;")

glue = open(__file__.rsplit('/',1)[0] + '/design_glue.js').read()

# controller -> minimal, no tabs / spec panel / phone chrome
ci = sc.index('/* ---------- controller ---------- */')
tail = glue + """
/* ---------- controller (app version) ---------- */
const stage=$('#stage');
function go(i){
  try{introStop(0)}catch(e){}RUN++;timers.forEach(clearTimeout);timers.length=0;
  CUR=i;stage.innerHTML=SCREENS[i].html();R=stage.firstElementChild;
  try{CS&&CS.stop()}catch(e){}
  S.mute=true;S.sound=false;
  SCREENS[i].play();
  try{postRender(SCREENS[i].t)}catch(e){console.error(e)}
  try{APP.onScreen&&APP.onScreen(SCREENS[i].t)}catch(e){}
}
S.sound=false;S.unlocked=true;
return {
  go:(title)=>{const i=SCREENS.findIndex(x=>x.t===title);if(i<0)throw new Error('Unknown design screen: '+title);go(i)},
  title:()=>SCREENS[CUR]&&SCREENS[CUR].t,
  titles:()=>SCREENS.map(x=>x.t),
  destroy:()=>{RUN++;timers.forEach(clearTimeout);timers.length=0;try{introStop(0)}catch(e){}}
};
})();
"""
sc = sc[:ci] + tail
sc = sc.lstrip()
assert sc.startswith('(()=>{')
body = sc[len('(()=>{'):]
body = body[:body.rindex('})();')]
runtime = ("/* GENERATED by tools/build_design.py from StudyOS_Final_Design_v14.html. Do not edit by hand. */\n"
           "/* eslint-disable */\n"
           "export function createDesign(ROOT, APP){\n" + body + "\n}\n")
# the controller tail ends with 'return {...};\n' then '})();' removed above -> ok
open(out + '/designRuntime.js', 'w').write(runtime)
open(out + '/design.css', 'w').write(css)
print('runtime bytes', len(runtime), 'css bytes', len(css), 'head appends', n_head)
