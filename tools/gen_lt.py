import re,sys
p=sys.argv[1]
css=open(p).read()
css=re.split(r"\n/\* ---- LT-GEN START",css)[0]
base=re.split(r"\n/\* ---- PALETTE-GEN START",css)[0]
def rgb(h):
    h=h.lstrip('#')
    if len(h)==3:h=''.join(c*2 for c in h)
    return [int(h[i:i+2],16) for i in (0,2,4)]
def lum(h):
    r,g,b=rgb(h);return (0.2126*r+0.7152*g+0.0722*b)/255
def sat(h):
    r=rgb(h);return max(r)-min(r)
MUT={'#8b98a2','#9aa6b0','#9aa3ab','#8a949c','#a3acb3'}
ACC={'#c9b8c3','#c7b9c4'}
EXCL={'#1b1e25','#dfe0e3','#edebec','#e1e0e2','#c8c6c8','#fff','#ffffff','#000','#000000'}
def mapc(h,prop):
    h=h.lower()
    if h in EXCL:return None
    if h in ACC:return 'var(--mv)'
    if h in MUT:return 'var(--mut)'
    if len(h)==4:h='#'+''.join(c*2 for c in h[1:])
    if sat(h)>46:return None
    L=lum(h)
    txt=prop in('color','fill','stroke','caret-color','-webkit-text-fill-color')
    bord=prop.startswith('border') or prop=='outline'
    if txt:
        if L>0.55:return 'var(--ink)'
        if L<0.16:return 'var(--pg)'
        return None
    if L>0.82:return 'var(--ink)'
    if L<0.10:return 'var(--pg)'
    if L<0.30:return 'var(--track)' if bord else ('var(--card)' if L<0.145 else 'var(--chip)')
    if L<0.55 and bord:return 'var(--track)'
    return None
HEX=re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b')
def blocks(s):
    i=0;n=len(s)
    while i<n:
        j=s.find('{',i)
        if j<0:break
        sel=s[i:j].strip();d=1;k=j+1
        while k<n and d:
            d+=(s[k]=='{')-(s[k]=='}');k+=1
        yield sel,s[j+1:k-1];i=k
nc=re.sub(r'/\*.*?\*/','',base,flags=re.S)
rules=[]
for sel,body in blocks(nc):
    if sel.startswith('@media'):
        for s2,b2 in blocks(body):rules.append((sel,s2,b2))
    elif sel.startswith('@'):continue
    else:rules.append((None,sel,body))
SKIP=re.compile(r'\.ip\w*|\.igr|\.ipdlg|\.dz-layer|\.pk-|\.au-|\.ob\b|\.ob-|\.scr\.ob|\.sh2-sheet|\.sh2-tpv|\.btn\[')
out=['\n/* ---- LT-GEN START (generated: Focus, Profile, Settings and friends pages follow the active light theme; rerun gen_pal.py then gen_lt.py after CSS edits) ---- */']
for media,sel,body in rules:
    parts=[s.strip() for s in sel.split(',') if s.strip().startswith('.dz ') and s.strip() not in('.dz .scr','.dz .scr.n','.dz .scr.n.nd')]
    if not parts or any(SKIP.search(s) for s in parts):continue
    decls=[d.strip() for d in re.split(r';(?![^(]*\))',body) if d.strip()]
    keep=[]
    for d in decls:
        if ':' not in d:continue
        prop,val=d.split(':',1);prop=prop.strip();val=val.strip()
        if prop.startswith('--'):
            if HEX.search(val) and prop in('--ink','--mut','--card','--chip','--pg','--track','--mv'):keep.append(prop+':inherit')
            continue
        ch=[False]
        def rep(m):
            r=mapc(m.group(0),prop)
            if r:ch[0]=True;return r
            return m.group(0)
        nv=HEX.sub(rep,val)
        if ch[0]:keep.append(prop+':'+nv)
    if not keep:continue
    def scope(s):
        if re.match(r'^\.dz \.nt(?![\w-])',s):return s.replace('.dz .nt','.dz .scr.nd.lt.nt',1)
        if re.match(r'^\.dz \.scr\.n\.nd\b',s):return s.replace('.scr.n.nd','.scr.n.nd.lt',1)
        if re.match(r'^\.dz \.scr\.nd\b',s):return s.replace('.scr.nd','.scr.nd.lt',1)
        if re.match(r'^\.dz \.n\.nd\b',s):return s.replace('.n.nd','.n.nd.lt',1)
        if re.match(r'^\.dz \.scr\.n(?![\w-])',s):return None
        return '.dz .scr.nd.lt '+s[len('.dz '):]
    ps=[scope(s) for s in parts];ps=[x for x in ps if x]
    if not ps:continue
    rule=','.join(ps)+'{'+';'.join(keep)+'}'
    out.append(f'{media}{{{rule}}}' if media else rule)

X='.dz .scr.nd.lt '
out.append(X+'.pf .hname,'+X+'.pf .gear{color:var(--ink)}')
out.append(X+'.pf .promo{background:var(--ink)}'+X+'.pf .promo h3{color:var(--pg)}'+X+'.pf .promo .go{background:var(--pg);color:var(--ink);border-bottom-color:var(--track)}')
out.append(X+'.ss .shd button:not(.sbk){color:var(--ink)}')
out.append(X+'.ring2 .c{color:var(--ink)}'+X+'.fx-btn{color:var(--ink)}'+X+'.fx-btn.on{color:#1b1e25}')
# theme variables for light-following dark roots
V={'':dict(ink='#1b1e25',card='#edebec',mut='#4b5d6d',mv='#c9b8c3',chip='#e1e0e2',pg='#dfe0e3',track='#c8c6c8'),
'ocean':dict(ink='#14303f',card='#eaf3fb',mut='#44677c',mv='#8fb9d3',chip='#c4dbe8',pg='#d6e8f1',track='#b7cfdd'),
'forest':dict(ink='#16301f',card='#eaf4ec',mut='#46654f',mv='#93bda1',chip='#cbdccf',pg='#dde8df',track='#bcd0c1'),
'sunset':dict(ink='#3b1d12',card='#f9ece6',mut='#7a5446',mv='#e0a78f',chip='#e6cbc0',pg='#f1ddd5',track='#dcbfb3'),
'mono':dict(ink='#1e1e1e',card='#f5f5f5',mut='#5c5c5c',mv='#a8a8a8',chip='#d4d4d4',pg='#e6e6e6',track='#c4c4c4')}
for k,v in V.items():
    pre=f'html[data-palette="{k}"] ' if k else ''
    out.append(pre+'.dz .scr.n.nd.lt{'+';'.join(f'--{a}:{b}' for a,b in v.items())+f';--navbg:{v["ink"]};background:{v["pg"]};color:{v["ink"]}}}')
out.append('/* ---- LT-GEN END ---- */\n')
open(p,'w').write(css.rstrip('\n')+'\n'+'\n'.join(out))
print(len(out))
