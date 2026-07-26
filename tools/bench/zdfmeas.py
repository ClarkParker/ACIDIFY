import cmath, json, math, os, struct, subprocess
SD="/tmp/claude-0/-home-user/0d638a5f-d17d-5e69-9f78-27c8a9360bd2/scratchpad"
CMAJ=f"{SD}/cmaj-bin/linux/x64/cmaj"; D=f"{SD}/bench/zdf"
TMPL=open(f"{D}/Zdf.cmajor").read()
def fft(x):
    n=len(x)
    if n==1: return list(x)
    ev,od=fft(x[0::2]),fft(x[1::2]); o=[0]*n
    for k in range(n//2):
        t=cmath.exp(-2j*math.pi*k/n)*od[k]; o[k]=ev[k]+t; o[k+n//2]=ev[k]-t
    return o
def measure(cut,res,amp=1.0,rate=48000,n=32768,cap4=18.0):
    src=TMPL.replace("CUTOFF",f"{float(cut)}").replace("RESONANCE",f"{float(res)}").replace("CAP4",f"{float(cap4)}").replace("AMPLITUDE",f"{float(amp)}f")
    open(f"{D}/Gen.cmajor","w").write(src)
    json.dump({"CmajorVersion":1,"ID":"com.b.zdf","version":"1.0","name":"Zdf","source":["Gen.cmajor"]},open(f"{D}/Zdf.cmajorpatch","w"))
    r=subprocess.run([CMAJ,"render",f"--rate={rate}",f"--length={n+30000}","--channels=2","--blockSize=512",f"--output={D}/ir.wav",f"{D}/Zdf.cmajorpatch"],capture_output=True,text=True)
    if r.returncode!=0: raise RuntimeError(r.stdout+r.stderr)
    d=open(f"{D}/ir.wav","rb").read(); off=12; data=None
    while off+8<=len(d):
        cid=d[off:off+4]; sz=struct.unpack("<I",d[off+4:off+8])[0]
        if cid==b"data": data=(off+8,sz); break
        off+=8+sz+(sz&1)
    cnt=data[1]//4; xs=struct.unpack(f"<{cnt}f",d[data[0]:data[0]+data[1]])
    dry,wet=list(xs[0::2]),list(xs[1::2])
    i0=max(range(len(dry)),key=lambda i:abs(dry[i]))
    ir=wet[i0:i0+n]; ir+=[0.0]*(n-len(ir))
    return ir,rate
def resp(ir,rate):
    sp=fft(ir); n=len(ir)
    return [(k*rate/n, 20*math.log10(max(abs(sp[k]),1e-12))) for k in range(n//2)]
