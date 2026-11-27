"""Make 480px WebP copies of the product photos in public/products for product cards.

Cards show photos about 180-300px wide, but the originals are 1500px+ and ~220 KB;
the copies are ~26 KB. LazyImage (src/components/LazyImage.tsx) uses /thumbs/... and
falls back to the original if a copy is missing. Run from frontend/public after adding
photos:  cd frontend/public && python3 ../scripts/make-thumbnails.py   (needs Pillow)
"""
import os, sys
from concurrent.futures import ProcessPoolExecutor
from PIL import Image, ImageOps
SRC, DST, W = 'products', 'thumbs/products', 480
def work(path):
    rel = os.path.relpath(path, SRC)
    out = os.path.join(DST, os.path.splitext(rel)[0] + '.webp')
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path): return 0
    os.makedirs(os.path.dirname(out), exist_ok=True)
    try:
        im = ImageOps.exif_transpose(Image.open(path))
        if im.mode in ('P', 'LA'): im = im.convert('RGBA')
        if im.mode not in ('RGB', 'RGBA'): im = im.convert('RGB')
        im.thumbnail((W, W * 2), Image.LANCZOS)
        im.save(out, 'WEBP', quality=78, method=5)
        return os.path.getsize(out)
    except Exception as e:
        print('skip', path, e, file=sys.stderr); return 0
files = [os.path.join(d, f) for d, _, fs in os.walk(SRC) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
with ProcessPoolExecutor() as ex: sizes = list(ex.map(work, files, chunksize=16))
print(len(files), 'images,', round(sum(sizes)/1e6, 1), 'MB of thumbnails written')
