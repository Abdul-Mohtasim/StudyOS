import re,sys
css=open(sys.argv[1]).read()
# drop previous generated block
css=re.split(r"\n/\* ---- PALETTE-GEN START",css)[0]
base=css
P={
 'ocean':dict(pg='#d6e8f1',card='#eaf3fb',chip='#c4dbe8',ink='#14303f',mv='#8fb9d3',track='#b7cfdd'),
 'forest':dict(pg='#dde8df',card='#eaf4ec',chip='#cbdccf',ink='#16301f',mv='#93bda1',track='#bcd0c1'),
 'sunset':dict(pg='#f1ddd5',card='#f9ece6',chip='#e6cbc0',ink='#3b1d12',mv='#e0a78f',track='#dcbfb3'),
 'mono':dict(pg='#e6e6e6',card='#f5f5f5',chip='#d4d4d4',ink='#1e1e1e',mv='#a8a8a8',track='#c4c4c4'),
}
MAP=lambda v:{'#c9b8c3':v['mv'],'#c7b9c4':v['mv'],'#1b1e25':v['ink'],'#dfe0e3':v['pg'],'#edebec':v['card'],'#e1e0e2':v['chip'],'#c8c6c8':v['track']}
SKIP=re.compile(r'\.nd\b|\.ss\b|\.ip\w*|\.dkc|\.igr|\.ipdlg|\.dz-layer|\.pk-|@keyframes|\.au-|\.dz \.scr\.n\b(?!\s)')
def blocks(s):
    i=0;n=len(s)
    while i<n:
        j=s.find('{',i)
        if j<0:break
        sel=s[i:j].strip();d=1;k=j+1
        while k<n and d:
            d+= (s[k]=='{')-(s[k]=='}');k+=1
        yield sel,s[j+1:k-1];i=k
# strip comments
nc=re.sub(r'/\*.*?\*/','',base,flags=re.S)
rules=[]
for sel,body in blocks(nc):
    if sel.startswith('@media'):
        for s2,b2 in blocks(body): rules.append((sel,s2,b2))
    elif sel.startswith('@'):continue
    else: rules.append((None,sel,body))
cols=re.compile('|'.join(re.escape(c) for c in ['#c9b8c3','#c7b9c4','#1b1e25','#dfe0e3','#edebec','#e1e0e2','#c8c6c8']),re.I)
out=['\n/* ---- PALETTE-GEN START (generated: paid colour themes repaint the light app; rerun gen_pal.py after CSS edits) ---- */']
for k,v in P.items():
    m=MAP(v)
    for media,sel,body in rules:
        if not sel.startswith('.dz') or SKIP.search(sel): continue
        decls=[d.strip() for d in re.split(r';(?![^(]*\))',body) if d.strip()]
        keep=[]
        for d in decls:
            if ':' not in d or d.startswith('--'):continue
            if cols.search(d): keep.append(cols.sub(lambda x:m[x.group(0).lower()],d))
        if not keep:continue
        def scope(s):
            s=s.strip()
            m=re.match(r'^\.dz (?:\.scr\.n|\.n)(?=[\s.:\[]|$)(.*)$',s)
            if m: return f'html[data-palette="{k}"] .dz .scr.n:not(.nd){m.group(1)}'
            return f'html[data-palette="{k}"] .dz .scr.n:not(.nd) '+s[len('.dz '):]
        ps=','.join(scope(s) for s in sel.split(',') if s.strip().startswith('.dz '))
        if not ps:continue
        rule=ps+'{'+';'.join(keep)+'}'
        out.append(f'{media}{{{rule}}}' if media else rule)
out.append('/* ---- PALETTE-GEN END ---- */\n')
open(sys.argv[1],'w').write(base.rstrip('\n')+'\n'+'\n'.join(out))
print(len(out))
