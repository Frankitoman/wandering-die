import os
from PIL import Image

OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'images', 'classes')
MAX_DIM = (1400, 934)

for fname in sorted(os.listdir(OUT_DIR)):
    if not fname.endswith('_raw.png'):
        continue
    class_id = fname.replace('_raw.png', '')
    src = os.path.join(OUT_DIR, fname)
    dst = os.path.join(OUT_DIR, class_id + '.jpg')
    img = Image.open(src).convert('RGB')
    img.thumbnail(MAX_DIM, Image.LANCZOS)
    img.save(dst, 'JPEG', quality=82, optimize=True)
    os.remove(src)
    print(class_id, os.path.getsize(dst) // 1024, 'KB')

print('done')
