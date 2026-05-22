#!/usr/bin/env python3
"""Generate MOCK 2 Listening audio with ElevenLabs. Run from repo root.
Outputs mp3/M2/<LEVEL>/... mirroring the file names referenced in QUIZ2.
Young voices: Laura (F) / Liam (M) / George (narrator)."""
import os, re, subprocess, tempfile, json, urllib.request, time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY=open(os.path.join(ROOT,"A2 Level.txt"),encoding="utf-8").read().strip()
MODEL="eleven_multilingual_v2"; FMT="mp3_44100_128"
V_F="FGY2WhTYpPnrIDTdsKH5"; V_M="TX3LPaxmHKxFdv7VOQHJ"; V_N="JBFqnCBsd6RMkjVDRZzb"
FEMALE={"Woman","Girl","Mum","Emma","Lucy","Nina","Mia","Maya","Elena","Sofia","Olivia","Helena"}
MALE={"Man","Boy","Jack","Sam","Tom","Leo","Ben","Daniel","Marcus","Coach"}
NAMES=sorted(FEMALE|MALE|{"Teacher","Interviewer","Assistant"}, key=len, reverse=True)
SPK=re.compile(r'\s*\b('+'|'.join(NAMES)+r'):\s*')
def vfor(s): return V_F if s in FEMALE else V_M if s in MALE else V_N
def segs(sc, lead_voice=V_N):
    p=SPK.split(sc); out=[]; lead=p[0].strip()
    if lead: out.append((lead_voice,lead))
    for i in range(1,len(p),2):
        t=p[i+1].strip() if i+1<len(p) else ""
        if t: out.append((vfor(p[i]),t))
    return out
def tts(vid,txt,dest):
    body=json.dumps({"text":txt,"model_id":MODEL,"voice_settings":{"stability":0.45,"similarity_boost":0.8}}).encode()
    req=urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}?output_format={FMT}",
        data=body,method="POST",headers={"xi-api-key":KEY,"Content-Type":"application/json","Accept":"audio/mpeg"})
    with urllib.request.urlopen(req,timeout=180) as r,open(dest,"wb") as f: f.write(r.read())

# Each entry: (relative_output_path, script, lead_voice_for_untagged_text)
JOBS=[
 # ---------------- A2 ----------------
 ("A2/A2-P1-q1","Question one. Girl: Did you get a new pet? Boy: Yes! I really wanted a dog, but our flat is too small, so we got a cat instead. She's lovely.",V_N),
 ("A2/A2-P1-q2","Question two. Boy: How are we getting to the park? Girl: We could take the bus, but it's such a nice day. Let's walk. Boy: OK, walking sounds good.",V_N),
 ("A2/A2-P1-q3","Question three. Mum: What would you like for breakfast? Boy: Could I have toast, please? Mum: We've run out of bread. How about some fruit? Boy: OK, a banana then.",V_N),
 ("A2/A2-P1-q4","Question four. Girl: Shall we have the picnic tomorrow? Boy: The forecast says it'll be windy all day. Girl: Then let's wait until Sunday, it'll be sunny.",V_N),
 ("A2/A2-P1-q5","Question five. Man: When's the next bus? Woman: There was one at four, but we missed it. The next is at half past four. Man: OK, twenty minutes to wait.",V_N),
 ("A2/A2-P2","Listen to your teacher talking about the book fair. Teacher: Here are the details for our school book fair. It takes place on Friday in the school library. It opens at one o'clock in the afternoon. Most books cost about three pounds. If you want to help on the day, please speak to Mrs Carter. And remember, you can bring your old books to give away too.",V_N),
 ("A2/A2-P3","Emma: Hi Jack, are you going to join the music club? Jack: Maybe. When does it meet? Emma: On Wednesdays after school, at four o'clock. Jack: What instrument do you play? Emma: I play the guitar, but you can learn the piano there too. Jack: How much is it? Emma: It's free this term, which is great. Jack: And where is it? Emma: In the music room, next to the gym. You should come, it's really fun.",V_F),
 ("A2/A2-P4","Lucy: I started my art class last September. I wasn't sure about it at first, because I thought I couldn't draw, but the teacher is so kind and now it's my favourite class. We meet on Monday afternoons. My favourite thing is painting, although we also do drawing and clay. Last week I made a small bowl out of clay for my mum, and she loved it. In December there's going to be an exhibition where we show our work to our families. I feel a little shy about it, but excited too.",V_F),
 ("A2/A2-P5","Sam: All my friends are busy on Saturday. Tom is playing tennis with his brother in the morning. Nina is going swimming at the new pool. Leo is visiting his grandparents in the countryside. Mia is going shopping for new shoes with her mum. And Ben is staying at home to read his new book, because he loves reading.",V_M),
 # ---------------- B1 ----------------
 ("B1/B1-P1-q1","Question one. Girl: Shall we go cycling on Saturday? Boy: I'd love to, but my bike's broken. Could we go for a swim instead? Girl: Good idea, the pool it is.",V_N),
 ("B1/B1-P1-q2","Question two. Boy: What did you buy your dad? Girl: I was going to get him a book, but he reads everything online now, so I got him a nice mug. Boy: He'll like that.",V_N),
 ("B1/B1-P1-q3","Question three. Woman: How are you getting home tonight? Man: I usually take the train, but it's not running, so my sister's picking me up by car. Woman: Lucky you.",V_N),
 ("B1/B1-P1-q4","Question four. Girl: Should I take my umbrella? Boy: It's sunny now, but they say it'll snow later. Girl: Snow? In October? Then I'll wear my big coat.",V_N),
 ("B1/B1-P1-q5","Question five. Man: Are you having a coffee? Woman: I'd love one, but I had three already today. I'll just have some water, thanks.",V_N),
 ("B1/B1-P1-q6","Question six. Boy: What time's the film? Girl: I thought it was at seven, but actually it starts at half past seven. Boy: Great, more time to eat first.",V_N),
 ("B1/B1-P1-q7","Question seven. Mum: You look worried. Boy: I can't find my keys. Mum: Did you check your jacket? Boy: Oh — here they are, in my bag. Phew.",V_N),
 ("B1/B1-P2-q1","You will hear a boy talking about a holiday. Boy: The hotel was comfortable and the beach was close, but what made the holiday for me was the people we met. We made friends from three different countries, and we still message each other now.",V_N),
 ("B1/B1-P2-q2","You will hear a girl talking about her new phone. Girl: It takes amazing photos and the screen is lovely, but honestly the battery is the best thing. It lasts two whole days, so I never worry about charging it.",V_N),
 ("B1/B1-P2-q3","You will hear a woman talking about a restaurant. Woman: The food was fine and the prices were reasonable, but we waited forty minutes just to order. I won't go back, mainly because of how slow the service was.",V_N),
 ("B1/B1-P2-q4","You will hear a coach talking to a young athlete. Coach: Your speed has really improved, well done. But before the race on Sunday, I don't want you training hard. Rest is what matters now, so take it easy this week.",V_N),
 ("B1/B1-P2-q5","You will hear a boy talking about a concert. Boy: I'd been looking forward to it for months. The band was brilliant, of course, but what surprised me was how friendly everyone in the crowd was. Nobody pushed.",V_N),
 ("B1/B1-P2-q6","You will hear a girl explaining why she's tired. Girl: It's not that I went to bed late, actually I was asleep by ten. But my neighbour's dog barked half the night, so I kept waking up. I feel exhausted.",V_N),
 ("B1/B1-P3","Hi everyone. Let me tell you about our weekend cycling trip. We'll leave from the school gate on Saturday at eight o'clock in the morning, so please don't be late. The ride is about thirty kilometres in total, but don't worry, we'll stop often. We're cycling to Greenwood Lake, where we'll have lunch. The trip costs fifteen pounds, which includes lunch and a guide. You must bring a helmet, that's the most important rule. And please remember to bring a waterproof jacket in case it rains. See you on Saturday!",V_N),
 ("B1/B1-P4","Interviewer: Today I'm talking to Maya, a young chef. Maya, how did you learn to cook? Maya: People assume my parents taught me, but actually they're terrible cooks! I learned from my grandmother during the summer holidays. Interviewer: What kind of food do you cook? Maya: I trained in French cooking, but the food I love most is the simple home cooking from my own country. Interviewer: What's the hardest part of your job? Maya: It's not the cooking itself, it's the long hours standing up. You're on your feet for ten hours sometimes. Interviewer: What was your biggest challenge? Maya: Opening my own restaurant at twenty-three. Everyone said I was too young, and that made me work even harder to prove them wrong. Interviewer: What advice would you give? Maya: Don't try to cook complicated dishes at first. Master a few simple things really well. Interviewer: And the future? Maya: I'd like to write a cookbook one day, to share my grandmother's recipes.",V_N),
 # ---------------- B2 ----------------
 ("B2/B2-P1-q1","Question one. Woman: Have you finished that novel? Man: I have. The writing was beautiful, I'll admit, but the ending annoyed me, it just stopped, with nothing resolved. I felt cheated, frankly.",V_N),
 ("B2/B2-P1-q2","Question two. Man: I'm phoning about the headphones I bought online. Woman: Is there a fault? Man: Not exactly. They work perfectly, but they're far bigger than they looked in the photo. They're uncomfortable, so I'd like to send them back.",V_N),
 ("B2/B2-P1-q3","Question three. Teacher: Before the test, a word of advice. Cramming the night before rarely works. What really helps is going over a little each day. And please, don't compare yourself to others, focus on your own progress.",V_N),
 ("B2/B2-P1-q4","Question four. Woman: How's the photography course going? Man: Everyone expected me to find the technical side hard, but honestly that came easily. What I struggle with is being patient enough to wait for the right light.",V_N),
 ("B2/B2-P1-q5","Question five. Man: Shall we book the city break or the beach? Woman: We've done plenty of cities lately. But this time I'd rather somewhere we can actually relax, so let's find a quiet place in the mountains.",V_N),
 ("B2/B2-P1-q6","Question six. Woman: Attention, please. Due to the building work, Thursday's lecture has been moved to the main library, not Room 12. The time stays the same, and recordings will be available afterwards as usual.",V_N),
 ("B2/B2-P1-q7","Question seven. Boy: How was your piano exam? Girl: My playing went fine, technically. But I was so nervous my hands were shaking, and I think the examiner could tell. I just couldn't relax.",V_N),
 ("B2/B2-P1-q8","Question eight. Woman: I'd like to return this coat. Assistant: Is something wrong with it? Woman: No, it's lovely, but I've found exactly the same one cheaper elsewhere, so I'd rather have my money back.",V_N),
 ("B2/B2-P2","Hi, I'm Olivia, and I want to tell you about our community garden project. The project began in two thousand and fifteen, on a piece of land that used to be a car park. These days, the garden is run entirely by volunteers, there are about forty of us. What surprises most people is that our best-selling product isn't vegetables at all, it's honey, from our own beehives. We meet every Saturday morning, all year round. If you join, you don't need any experience, but you do need to bring a pair of gloves. The one thing we ask is that you commit to at least two hours a week. The money we raise goes towards a new greenhouse, which we hope to build next spring. To sign up, just send us an email, there's no form to fill in.",V_F),
 ("B2/B2-P3","Speaker one. Woman: My whole family plays something, my grandfather, my mother, my brothers. It honestly never occurred to me not to. I picked up the violin almost as soon as I could hold one. Speaker two. Man: I'd been under enormous pressure at work, and a friend suggested the piano. Now, after a difficult day, an hour of playing just melts the tension away. Speaker three. Woman: There was this teacher at school who believed I had a good ear. She kept telling me to try, and in the end I couldn't say no. I'm so glad she pushed me. Speaker four. Man: I heard a guitar solo in a film when I was twelve and I was absolutely mesmerised. I thought, I have to learn to do that. So I saved up and bought a cheap guitar. Speaker five. Woman: For me it was about proving something to myself. Everyone says you can't learn an instrument as an adult. I wanted to show that they were wrong, and now I play in a small band.",V_N),
 ("B2/B2-P4","Interviewer: Tom, your history podcast has thousands of listeners. How did it start? Tom: Almost by accident. I was recording stories for my younger brother, who hated reading, and a friend said other people might enjoy them too. Interviewer: Did you have any training in broadcasting? Tom: None at all. I studied engineering, actually. But I think that taught me to explain complicated things in simple steps, which is exactly what the podcast needs. Interviewer: What's the most difficult part? Tom: People imagine it's the recording, but that's the fun bit. The research is what eats up my time, I can spend a week checking a single date. Interviewer: How do you choose your topics? Tom: I used to pick famous events, but I've learned that listeners prefer the small, strange stories that no one's heard. Interviewer: What mistake do new podcasters make? Tom: They worry too much about expensive equipment. Honestly, good content recorded on a cheap microphone beats dull content recorded perfectly. Interviewer: What's next for you? Tom: I've had offers to turn it into a television series, but for now I'd rather keep it independent and do live shows instead. Interviewer: Tom, thank you.",V_N),
 # ---------------- C1 ----------------
 ("C1/C1-P1-q1","Question one. Woman: I've drafted the funding proposal. Man: It's persuasive, genuinely. My only reservation is the budget section, it's so optimistic that a careful reader might lose faith in the rest. I'd build in some caution.",V_N),
 ("C1/C1-P1-q2","Question two. Man: What did you make of the exhibition? Woman: The individual pieces were stunning, no question. But the way they were arranged made no sense to me, there was no thread, no story. I left feeling oddly unmoved.",V_N),
 ("C1/C1-P1-q3","Question three. Woman: How did the interview go? Man: Hard to say. I answered everything competently enough, but I never managed to show them why I actually wanted the role. I came across as capable rather than committed, I think.",V_N),
 ("C1/C1-P1-q4","Question four. Man: I attended that lecture on memory you recommended. Woman: And? Man: The content was first-rate, but he read it word for word from his notes. Brilliant ideas delivered in a monotone, half the room was asleep.",V_N),
 ("C1/C1-P1-q5","Question five. Woman: We finally finished renovating the cottage. Man: Was it worth it? Woman: The result is beautiful, I won't deny it. But it took twice as long and cost three times what we'd planned. I'm not sure I'd do it again.",V_N),
 ("C1/C1-P1-q6","Question six. Man: Have you read the manuscript I sent? Woman: I have. The argument is original and the research impeccable. If I'm honest, though, the language is so dense that only specialists will ever get through it. It needs simplifying.",V_N),
 ("C1/C1-P2","Hello, I'm Daniel, and for nine years I worked as one of the last lighthouse keepers on this coast. People romanticise the job, but the reality is that the hardest thing to cope with is not the storms, it's the isolation. I'd often go three weeks without seeing another person. My main daily duty was maintaining the light itself, of course, but I also kept detailed weather records for the national service. The biggest danger, surprisingly, wasn't the sea; it was fire, because everything in the tower was made of wood. To stay sane, I taught myself to paint, and I produced over two hundred canvases. Visitors always ask about the food, the supply boat came just once a month, so I learned to bake my own bread. The thing I miss most now is the silence. And the one piece of advice I'd give anyone considering such a life is simple: learn to enjoy your own company.",V_M),
 ("C1/C1-P3","Interviewer: Elena, your documentaries have won major awards. What drew you to the form? Elena: Many people assume it was a love of cinema. Actually, it was the opposite, I trained as a journalist and grew frustrated that print couldn't capture people's faces, their hesitations. Film could. Interviewer: You're known for spending years on a single project. Why so long? Elena: Because trust can't be rushed. The moments that matter only happen once people forget the camera is there, and that takes months, sometimes years. Interviewer: Is funding your greatest challenge? Elena: People expect me to say money, but no. The hardest part is the editing, deciding what to leave out. I once cut my favourite scene because it served my ego, not the story. Interviewer: How do you choose subjects? Elena: I look for ordinary people in extraordinary circumstances, never celebrities. The unknown taxi driver tells us more about a society than any famous politician. Interviewer: Are you optimistic about documentary's future? Elena: Cautiously. Streaming has brought huge audiences, but it also pressures film-makers to sensationalise. I worry we're trading depth for drama. Interviewer: Finally, advice for newcomers? Elena: Listen far more than you speak. Your best material comes from silence, not from your clever questions. Interviewer: Elena, thank you.",V_N),
 ("C1/C1-P4","Speaker one. Woman: I'd visited the country once on holiday and simply fell in love with the pace of life. So I sold everything and moved. The hardest part? The bureaucracy, the endless paperwork nearly defeated me before I'd even unpacked. Speaker two. Man: My company offered me a transfer with a much better salary, and I'd have been foolish to refuse. Professionally it's been great. Personally, though, I underestimated how much I'd miss my old friends. Speaker three. Woman: I moved entirely for love, my partner is from there. We're very happy, but I'll be honest, learning the language as an adult has been humbling. I still feel like a child when I speak. Speaker four. Man: I was simply curious. I'd always wondered what it would be like to start again somewhere completely unfamiliar. The biggest struggle has been the climate, oddly, I never adjusted to the long, dark winters. Speaker five. Woman: I came to study for a master's degree and just never left. The academic side was fine; what threw me was the cost of living. I had no idea how expensive everyday things would be.",V_N),
]

def main():
    tmp=tempfile.mkdtemp(prefix="m2_")
    sil=os.path.join(tmp,"s.mp3"); lead=os.path.join(tmp,"l.mp3")
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","0.5","-q:a","9",sil],check=True,capture_output=True)
    subprocess.run(["ffmpeg","-y","-f","lavfi","-i","anullsrc=r=44100:cl=mono","-t","1.5","-q:a","9",lead],check=True,capture_output=True)
    done=0
    for rel,sc,lv in JOBS:
        outpath=os.path.join(ROOT,"mp3","M2",rel+".mp3")
        os.makedirs(os.path.dirname(outpath),exist_ok=True)
        if os.path.exists(outpath) and os.path.getsize(outpath)>2000:
            print("skip (exists)",rel); done+=1; continue
        files=[lead]
        name=rel.replace("/","_")
        for j,(vid,txt) in enumerate(segs(sc,lv)):
            seg=os.path.join(tmp,f"{name}_{j}.mp3"); print(f"  {rel} seg {j+1}..."); tts(vid,txt,seg); files+=[seg,sil]; time.sleep(0.12)
        lst=os.path.join(tmp,f"{name}.txt"); open(lst,"w",encoding="utf-8").write("".join(f"file '{f.replace(os.sep,'/')}'\n" for f in files))
        subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c:a","libmp3lame","-q:a","4",outpath],check=True,capture_output=True)
        print(f"OK {rel}.mp3 ({os.path.getsize(outpath)//1024} KB)"); done+=1
    print(f"DONE {done}/{len(JOBS)}")
main()
