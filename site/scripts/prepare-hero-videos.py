# Original files are read-only inputs. Encode outside the synced workspace, then replace derivatives atomically.
import subprocess, pathlib, json, re, hashlib, argparse, shutil, tempfile

parser = argparse.ArgumentParser(description='Prepare the assembly, Malaysian flag and school flag clips for SRSS web headers.')
parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'), help='Path to a trusted FFmpeg executable')
parser.add_argument('sources', nargs=3, help='Original assembly, Malaysian flag and school flag videos, in that order')
args = parser.parse_args()
if not args.ffmpeg: parser.error('Install FFmpeg or pass --ffmpeg /path/to/ffmpeg.')
ff = args.ffmpeg
sources = args.sources
destination = pathlib.Path(__file__).resolve().parents[1] / 'public/assets/video'
out = pathlib.Path(tempfile.mkdtemp(prefix='srss-hero-video-'))
out.mkdir(parents=True, exist_ok=True)
names = ['assembly', 'malaysia-flag', 'school-flag']
manifest = []
for source, name in zip(sources, names):
    info = subprocess.run([ff, '-hide_banner', '-i', source], capture_output=True, text=True).stderr
    h, m, s = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info).groups()
    duration = int(h)*3600 + int(m)*60 + float(s)
    start, usable, speed, fade = .25, duration-.6, 1.55, 1.2
    slowed = usable*speed
    filters = f'[0:v]trim=start={start}:duration={usable},scale=1280:-2,minterpolate=fps=48:mi_mode=mci:me=epzs:search_param=16,setpts={speed}*(PTS-STARTPTS),fps=30,format=yuv420p,setsar=1,split=2[body][head];[body]trim=start={fade},setpts=PTS-STARTPTS,fps=30[main];[head]trim=duration={fade},setpts=PTS-STARTPTS,fps=30[intro];[main][intro]xfade=transition=fade:duration={fade}:offset={slowed-2*fade}[loop]'
    target = out / f'{name}-loop-v1.mp4'
    subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-threads', '2', '-filter_complex_threads', '2', '-i', source, '-filter_complex', filters, '-map', '[loop]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-maxrate', '1000k', '-bufsize', '2000k', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', str(target)], check=True)
    mobile = out / f'{name}-mobile-loop-v1.mp4'
    subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-i', str(target), '-vf', 'scale=640:-2', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '550k', '-bufsize', '1100k', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(mobile)], check=True)
    poster = out / f'{name}-poster-v1.jpg'
    subprocess.run([ff, '-y', '-hide_banner', '-loglevel', 'error', '-ss', '0', '-i', str(target), '-frames:v', '1', '-q:v', '3', str(poster)], check=True)
    manifest.append({'source': pathlib.Path(source).name, 'sourceSha256':hashlib.sha256(pathlib.Path(source).read_bytes()).hexdigest(), 'loop':target.name, 'mobileLoop':mobile.name, 'mobileWidth':640, 'mobileBytes':mobile.stat().st_size, 'poster':poster.name, 'sourceDurationSeconds':duration, 'approximateLoopSeconds':round(slowed-fade,2), 'playbackSpeed':round(1/speed,3), 'loopDissolveSeconds':fade, 'fps':30, 'interpolation':'motion-compensated', 'width':1280, 'bytes':target.stat().st_size, 'audio':False, 'classification':'User-supplied illustrative Hailuo school scene; no event/date or pupil identity asserted.'})
    print(name, target.stat().st_size, 'bytes', flush=True)
(out/'manifest.json').write_text(json.dumps({'excludedSource':'SRSS25_closure_03.mov','sourceOriginals':'Preserved unchanged at the user-supplied paths.', 'clips':manifest},indent=2)+'\n')

import os, shutil
destination.mkdir(parents=True, exist_ok=True)
for media in out.iterdir():
    if media.is_file():
        incoming=destination/(media.name+".incoming")
        shutil.copyfile(media,incoming)
        os.replace(incoming,destination/media.name)

shutil.rmtree(out)
