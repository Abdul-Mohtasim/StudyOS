"""Builds the "Ember" mascot (an original flame character) as path data.
Output: frontend/android/app/src/main/assets/mascot.json  (drawn natively by MascotRenderer.java)
Run: python3 tools/make_mascot.py   - then open tools/mascot_preview.html to see every mood.
Coordinates are in a 100x100 box. Colour tokens (not hex) are resolved by the renderer."""
import json,os
def ell(cx,cy,rx,ry):return f"M{cx-rx} {cy}a{rx} {ry} 0 1 0 {2*rx} 0a{rx} {ry} 0 1 0 {-2*rx} 0Z"
def L(d,fill=None,stroke=None,sw=0,tag='',min=0):
    o={'d':d}
    if fill:o['fill']=fill
    if stroke:o['stroke']=stroke;o['sw']=sw
    if tag:o['tag']=tag
    if min:o['min']=min
    return o
BODY="M50 6C57 20 79 32 79 58C79 77 66 91 50 91C34 91 21 77 21 58C21 32 43 20 50 6Z"
BELLY="M50 54C60 54 66 62 66 72C66 82 59 88 50 88C41 88 34 82 34 72C34 62 40 54 50 54Z"
def base(arms=True):
    l=[L(ell(50,94,26,4),'shadow',tag='shadow'),
       L(ell(39,91,8,4),'bodyDark',tag='foot'),L(ell(61,91,8,4),'bodyDark',tag='foot')]
    l+=[L(ell(21,64,5,9),'bodyDark',tag='armL'),L(ell(79,64,5,9),'bodyDark',tag='armR')]
    l+=[L(BODY,'body',tag='body'),L("M30 70C34 80 42 86 50 87",None,'bodyDark',3,tag='body'),L(BELLY,'belly',tag='body')]
    l[-2]['stroke']=None
    return l
def cheeks(): return [L(ell(31,66,5,3),'cheek',tag='face'),L(ell(69,66,5,3),'cheek',tag='face')]
def eye(cx,cy,r=5,look=(0,0)): return [L(ell(cx,cy,r,r+1),'ink',tag='face'),L(ell(cx+1.6+look[0],cy-2+look[1],1.9,1.9),'white',tag='face')]
M={}
# happy: smiling eyes, gentle bounce
M['happy']=base()+[L("M33 58Q39 51 45 58",None,'ink',3,tag='face'),L("M55 58Q61 51 67 58",None,'ink',3,tag='face'),
  L("M42 66Q50 75 58 66",None,'ink',3,tag='face')]+cheeks()
# excited: big sparkly eyes, open smile, tongue
M['excited']=base()+eye(39,56,6.4)+eye(61,56,6.4)+[L(ell(39,56,6.4,7.4),None,None),
  L("M39 50l1.6 3.4 3.6.5-2.6 2.6.6 3.6-3.2-1.8-3.2 1.8.6-3.6-2.6-2.6 3.6-.5Z",'spark',tag='face')]
M['excited']=[x for x in M['excited'] if x.get('fill') or x.get('stroke')]
M['excited']+=[L("M38 65Q50 84 62 65Z",'ink',tag='face'),L(ell(50,74,5,3),'tongue',tag='face')]+cheeks()
# motivated: bright eyes looking up, small smile, waving arm
M['motivated']=base()+eye(40,56,5,(0.6,-0.8))+eye(60,56,5,(0.6,-0.8))+[L("M33 47Q40 43 46 47",None,'ink',2.4,tag='face'),L("M54 47Q60 43 67 47",None,'ink',2.4,tag='face'),
  L("M43 67Q50 73 57 67",None,'ink',3,tag='face')]+cheeks()
# worried: slanted brows, wobbly mouth, sweat drop (level 2: second drop + stronger brows)
M['worried']=base()+eye(40,57,5)+eye(60,57,5)+[L("M33 51L46 46",None,'ink',3,tag='face'),L("M67 51L54 46",None,'ink',3,tag='face'),
  L("M42 70Q46 66 50 70Q54 74 58 70",None,'ink',3,tag='face'),
  L("M76 36Q80 43 76 46Q72 43 76 36Z",'tear',tag='face'),
  L("M23 40Q26 46 23 49Q20 46 23 40Z",'tear',tag='face',min=2)]
# sad: droopy lids, frown, tear, no cheeks
M['sad']=base()+eye(40,59,5)+eye(60,59,5)+[L("M33 52H47V58H33Z",'body',tag='face'),L("M53 52H67V58H53Z",'body',tag='face'),
  L("M33 58L47 54",None,'ink',3,tag='face'),L("M67 58L53 54",None,'ink',3,tag='face'),
  L("M42 73Q50 65 58 73",None,'ink',3,tag='face'),L("M37 65Q41 71 37 74Q33 71 37 65Z",'tear',tag='face')]
# sleeping: closed eyes, tiny mouth (zZz drawn by the renderer)
M['sleeping']=base()+[L("M33 57Q39 63 45 57",None,'ink',3,tag='face'),L("M55 57Q61 63 67 57",None,'ink',3,tag='face'),
  L(ell(50,69,2.6,2.2),'ink',tag='face')]+cheeks()
# celebrating: excited face + party hat
M['celebrating']=[x for x in M['excited']]+[L("M38 24L50 -4L62 24Q50 29 38 24Z",'hat',tag='hat'),L("M45 12Q50 14 55 12",None,'hat2',2.4,tag='hat'),L(ell(50,-4,3,3),'spark',tag='hat')]
anim={ # per mood: bounce (px of 100 box, hz), tilt (deg), breathe (scale amp), wave arm, particles
 'happy':{'bounce':2.2,'hz':1.2,'tilt':0,'breathe':0.01,'wave':0,'fx':'none'},
 'excited':{'bounce':9,'hz':2.2,'tilt':5,'breathe':0.02,'wave':1,'fx':'sparkle'},
 'motivated':{'bounce':1.4,'hz':1.0,'tilt':3,'breathe':0.01,'wave':1,'fx':'none'},
 'worried':{'bounce':0.6,'hz':3.0,'tilt':1.5,'breathe':0.006,'wave':0,'fx':'none'},
 'sad':{'bounce':0.0,'hz':0.5,'tilt':-2,'breathe':0.012,'wave':0,'fx':'none','squash':0.05},
 'sleeping':{'bounce':0.0,'hz':0.35,'tilt':0,'breathe':0.035,'wave':0,'fx':'zzz'},
 'celebrating':{'bounce':11,'hz':2.4,'tilt':7,'breathe':0.02,'wave':1,'fx':'confetti'}}
out={'box':100,'moods':{k:{'layers':v,'anim':anim[k]} for k,v in M.items()},
 'colors':{'body':'#ff9f43','bodyDark':'#e8801f','belly':'#ffd9a0','ink':'#2b1d16','white':'#ffffff','cheek':'#ff7a8a','tear':'#6ec6ff','tongue':'#ff6f7d','spark':'#ffe27a','hat':'#7c5cff','hat2':'#ffffff','shadow':'#00000026'}}
here=os.path.dirname(os.path.abspath(__file__))
dst=os.path.join(here,'..','frontend','android','app','src','main','assets','mascot.json')
json.dump(out,open(dst,'w'),separators=(',',':'))
# preview page
html=['<!doctype html><meta charset=utf-8><body style="margin:0;background:#f1ddd5;font:14px sans-serif"><div style="display:flex;flex-wrap:wrap;gap:12px;padding:12px">']
def svg(m,lvl=1):
    ls=''
    for l in out['moods'][m]['layers']:
        if l.get('min',0)>lvl:continue
        f=out['colors'].get(l.get('fill'),l.get('fill','none')) if l.get('fill') else 'none'
        s=out['colors'].get(l.get('stroke'),'none') if l.get('stroke') else 'none'
        ls+=f'<path d="{l["d"]}" fill="{f}" stroke="{s}" stroke-width="{l.get("sw",0)}" stroke-linecap="round" stroke-linejoin="round"/>'
    return f'<svg viewBox="-10 -12 120 120" width="150" height="150" style="background:#edebec;border-radius:20px">{ls}</svg><div>{m}{" L"+str(lvl) if m=="worried" else ""}</div>'
for m in out['moods']:
    html.append('<div style="text-align:center">'+svg(m,1)+'</div>')
html.append('<div style="text-align:center">'+svg('worried',2)+'</div></div>')
open(os.path.join(here,'mascot_preview.html'),'w').write(''.join(html))
print('ok',os.path.getsize(dst))
