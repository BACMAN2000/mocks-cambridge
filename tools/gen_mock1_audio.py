#!/usr/bin/env python3
"""Regenerate MOCK 1 Listening audio from tools/new_listening_mock1.json.
Outputs to mp3/<LEVEL>/... (the MOCK 1 paths), OVERWRITING the old audio.
Young voices: Laura (F) / Liam (M) / George (narrator)."""
import os, re, subprocess, tempfile, json, urllib.request, time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY=open(os.path.join(ROOT,"A2 Level.txt"),encoding="utf-8").read().strip()
DATA=json.load(open(os.path.join(ROOT,"tools","new_listening_mock1.json"),encoding="utf-8"))
MODEL="eleven_multilingual_v2"; FMT="mp3_44100_128"
V_F="FGY2WhTYpPnrIDTdsKH5"; V_M="TX3LPaxmHKxFdv7VOQHJ"; V_N="JBFqnCBsd6RMkjVDRZzb"
FEMALE={"Woman","Girl"}; MALE={"Man","Boy","Coach"}
NAMES=["Woman","Man","Girl","Boy","Teacher","Interviewer","Assistant","Coach"]
SPK=re.compile(r'\s*\b('+'|'.join(NAMES)+r'):\s*')
def vfor(s): return V_F if s in FEMALE else V_M if s in MALE else V_N
def segs(sc):
    p=SPK.split(sc); out=[]; lead=p[0].strip()
    if lead: out.append((V_N,lead))
    for i in range(1,len(p),2):
        t=p[i+1].strip() if i+1<len(p) else ""
        if t: out.append((vfor(p[i]),t))
    return out
def tts(vid,txt,dest):
    body=json.dumps({"text":txt,"model_id":MODEL,"voice_settings":{"stability":0.45,"similarity_boost":0.8}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format={FMT}",
        data=body,method="POST",headers={"xi-api-key":KEY,"Content-Type":"application/json","Accept":"audio/mpeg"})
    with urllib.request.urlopen(req,timeout=180) as r,open(dest,"wb") as f: f.write(r.read())

def build_jobs():
    jobs=[]
    for lvl in ["A2","B1","B2","C1"]:
        for a in DATA[lvl]["audios"]:
            scripts=a.get("scripts",[])
            if a.get("paged"):
                for i,q in enumerate(a["questions"]):
                    path=q.get("audio","")
                    if path and i < len(scripts):
                        jobs.append((path, scripts[i]))
            else:
                path=a.get("file","")
                if path and scripts:
                    jobs.append((path, scripts[0]))
    return jobs

def main():
    jobs=build_jobs()
    print("jobs:",len(jobs))
    tmp=tempfile.mkdtemp(prefix="m1_")
    sil=os.path.join(tmp,"s.mp3"); lead=os.path.join(tmp,"l.mp3")
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","0.5","-q:a","9",sil],check=True,capture_output=True)
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","1.5","-q:a","9",lead],check=True,capture_output=True)
    done=0
    for rel,sc in jobs:
        outpath=os.path.join(ROOT,"mp3",rel)
        os.makedirs(os.path.dirname(outpath),exist_ok=True)
        files=[lead]; name=rel.replace("/","_").replace(".mp3","")
        for j,(vid,txt) in enumerate(segs(sc)):
            seg=os.path.join(tmp,f"{name}_{j}.mp3"); print(f"  {rel} seg {j+1}..."); tts(vid,txt,seg); files+=[seg,sil]; time.sleep(0.12)
        lst=os.path.join(tmp,f"{name}.txt"); open(lst,"w",encoding="utf-8").write("".join(f"file '{f.replace(os.sep,'/')}'\n" for f in files))
        subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c:a","libmp3lame","-q:a","4",outpath],check=True,capture_output=True)
        print(f"OK {rel} ({os.path.getsize(outpath)//1024} KB)"); done+=1
    print(f"DONE {done}/{len(jobs)}")
main()
