"""나머지 7개 장면 (기본, 자연, 카페, 물, 백색소음, 작업, 로파이). pixelscenes.py의 도구를 그대로 씀."""
import math, random, sys
from PIL import Image, ImageDraw
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from pixelscenes import W, H, N, hexc, mix, sky, glow, stars, pine, save, dither_rect, SCENES as BASE

TAU = 2 * math.pi


def wave(f, k=1, ph=0.0):
    return math.sin(f / N * TAU * k + ph)


def steam(img, x, y, f, base_col, n=3, height=18, seed=0):
    """위로 올라가며 흐려지는 김 (한 바퀴에 딱 맞게 반복)."""
    for k in range(n):
        for j in range(3):
            t = ((f + k * 8 + j * N // 3) % N) / N
            sx = x + k * 3 + int(round(1.5 * math.sin(t * TAU * 1.5 + k + seed)))
            sy = int(y - t * height)
            if 0 <= sx < W and 0 <= sy < H:
                img.putpixel((sx, sy), mix(img.getpixel((sx, sy)), base_col, 0.55 * (1 - t)))


def hills(d, base_y, amp, freq, ph, color, step=2):
    pts = [(0, H)] + [(x, base_y - amp * (0.6 * math.sin(x / freq + ph) + 0.4 * math.sin(x / (freq * 0.37) + ph * 2))) for x in range(0, W + step, step)] + [(W, H)]
    d.polygon([(int(x), int(y)) for x, y in pts], fill=color)


def moon(img, d, cx, cy, r, f, col='#f3eccf', glow_col='#cfd8ff'):
    glow(img, cx, cy, r * 4.5, glow_col, 0.22)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=hexc(col))
    for ox, oy, rr in ((-2, -1, 1), (2, 2, 1), (1, -3, 0)):     # 달 표면 무늬
        d.rectangle([cx + ox, cy + oy, cx + ox + rr, cy + oy + rr], fill=mix(hexc(col), (180, 170, 140), 0.45))


# ───────────────────────────── 기본 화면 ─────────────────────────────
def scene_default(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    sky(img, '#0d1124', '#2c2f58', 0, 130)
    stars(img, random.Random(21), 80, 100, f)
    moon(img, d, 74, 40, 9, f)
    for i, (cy, cx0) in enumerate(((52, 150), (30, 230), (66, 40))):      # 천천히 흔들리는 구름
        cx = cx0 + 3 * wave(f, 1, i)
        col = mix(hexc('#2c2f58'), hexc('#6b6f9e'), 0.45)
        for dx, dy, w_ in ((0, 0, 22), (-12, 3, 14), (12, 2, 16), (4, -3, 12)):
            d.ellipse([cx + dx - w_ // 2, cy + dy - 3, cx + dx + w_ // 2, cy + dy + 3], fill=col)
    hills(d, 112, 10, 40, 0.3, hexc('#1c1d3a'))
    hills(d, 124, 8, 28, 1.7, hexc('#15162c'))
    # 언덕 위 작은 오두막 (가운데) + 굴뚝 연기
    hx, hy = 160, 112
    d.polygon([(hx - 14, hy), (hx, hy - 12), (hx + 14, hy)], fill=hexc('#2a1f2e'))
    d.rectangle([hx - 11, hy, hx + 11, hy + 13], fill=hexc('#1e1624'))
    d.rectangle([hx + 6, hy - 14, hx + 9, hy - 6], fill=hexc('#1e1624'))
    lit = '#ffcf7a' if (f // 4) % 6 else '#ffb85c'
    d.rectangle([hx - 6, hy + 4, hx - 2, hy + 8], fill=hexc(lit)); d.rectangle([hx + 3, hy + 4, hx + 7, hy + 8], fill=hexc(lit))
    glow(img, hx, hy + 6, 26, '#ffb36b', 0.18)
    for k in range(4):
        t = ((f + k * 6) % N) / N
        sx = int(hx + 8 + t * 10 + 2 * math.sin(t * TAU)); sy = int(hy - 16 - t * 22)
        r = 1 + int(t * 2)
        d.ellipse([sx - r, sy - r, sx + r, sy + r], fill=mix(hexc('#2c2f58'), hexc('#8a8db8'), 0.5 * (1 - t)))
    hills(d, 142, 6, 22, 3.1, hexc('#0e0f1f'))
    d.rectangle([0, 150, W, H], fill=hexc('#0b0c18'))
    return img


# ───────────────────────────── 자연 ─────────────────────────────
def scene_nature(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    sky(img, '#0a1712', '#3d5a3a', 0, 120)
    glow(img, 160, 112, 120, '#f2b56b', 0.20)            # 새벽 지평선 빛
    stars(img, random.Random(31), 30, 55, f, colors=('#e9f5df', '#ffffff'))
    hills(d, 98, 9, 36, 0.8, hexc('#1f3a2a'))
    rng = random.Random(4)
    for i in range(34):                                    # 숲 실루엣 (가운데는 낮게 비워 둠)
        x = rng.randrange(-6, W + 6); h = rng.randrange(20, 48)
        if 118 < x < 202: continue
        pine(d, x, 118, h, hexc('#11241a'))
    d.rectangle([0, 118, W, H], fill=hexc('#10221a'))
    # 앞쪽 풀잎 (바람에 흔들림)
    rg = random.Random(8)
    for i in range(140):
        x = rg.randrange(W); base = rg.randrange(122, 176); h = rg.randrange(5, 14); ph = rg.random() * TAU
        sway = 2.2 * wave(f, 1, ph + x / 40)
        col = mix(hexc('#1c3d29'), hexc('#4f7e45'), rg.random() * 0.8)
        d.line([(x, base), (int(x + sway), base - h)], fill=col)
    # 반딧불이
    rf = random.Random(12)
    for i in range(18):
        cx, cy = rf.randrange(20, W - 20), rf.randrange(70, 140); ax, ay = rf.randrange(6, 16), rf.randrange(4, 10); ph = rf.random() * TAU
        x = cx + ax * math.sin(f / N * TAU + ph); y = cy + ay * math.sin(f / N * TAU * 2 + ph)
        on = (wave(f, 2, ph) + 1) / 2
        if on > 0.25:
            glow(img, x, y, 4, '#d8ff8a', 0.5 * on)
            img.putpixel((int(x), int(y)), mix(hexc('#d8ff8a'), (255, 255, 255), on * 0.5))
    return img


# ───────────────────────────── 카페 ─────────────────────────────
def scene_cafe(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=hexc('#24170f'))
    for y in range(0, 118, 6):                              # 벽돌 벽
        off = 0 if (y // 6) % 2 else 9
        for x in range(-off, W, 18):
            d.rectangle([x, y, x + 16, y + 4], fill=hexc('#2e1d13'))
    # 큰 창 (밤거리, 비 없이 거리 불빛 번짐)
    wx0, wy0, wx1, wy1 = 70, 18, 250, 106
    sky(img, '#131a2e', '#2b2a3f', wy0, wy1); d.rectangle([0, 0, wx0 - 1, wy1], fill=None)
    img2 = Image.new('RGB', (W, H)); sky(img2, '#131a2e', '#3a2f3a', 0, H)
    img.paste(img2.crop((wx0, wy0, wx1, wy1)), (wx0, wy0))
    # 벽을 다시 그려 창 밖 영역만 남기기
    for (x0, y0, x1, y1) in ((0, 0, wx0, 118), (wx1, 0, W, 118), (wx0, 0, wx1, wy0), (wx0, wy1, wx1, 118)):
        for y in range(y0, y1, 6):
            off = 0 if (y // 6) % 2 else 9
            d.rectangle([x0, y, x1, min(y + 5, y1)], fill=hexc('#24170f'))
            for x in range(-off, W, 18):
                if x + 16 >= x0 and x <= x1:
                    d.rectangle([max(x, x0), y, min(x + 16, x1 - 1), min(y + 4, y1 - 1)], fill=hexc('#2e1d13'))
    rb = random.Random(5)
    for i in range(10):                                     # 창밖 건물과 불빛 번짐
        bx = rb.randrange(wx0, wx1 - 10); bh = rb.randrange(18, 50); bw = rb.randrange(12, 26)
        d.rectangle([bx, wy1 - bh, min(bx + bw, wx1 - 1), wy1], fill=hexc('#1a1726'))
        for k in range(3):
            lx, ly = rb.randrange(bx + 2, bx + bw), rb.randrange(wy1 - bh + 3, wy1 - 2)
            if lx < wx1 - 1: glow(img, lx, ly, 6, rb.choice(('#ffb86b', '#ff8fbf', '#9fc6ff')), 0.35)
    d.rectangle([wx0 - 4, wy0 - 4, wx1 + 4, wy0 - 1], fill=hexc('#120b07')); d.rectangle([wx0 - 4, wy1, wx1 + 4, wy1 + 3], fill=hexc('#120b07'))
    d.rectangle([wx0 - 4, wy0 - 4, wx0 - 1, wy1 + 3], fill=hexc('#120b07')); d.rectangle([wx1 + 1, wy0 - 4, wx1 + 4, wy1 + 3], fill=hexc('#120b07'))
    d.rectangle([158, wy0, 161, wy1], fill=hexc('#120b07'))
    # 창 위의 전구 줄 (하나씩 반짝)
    for i, x in enumerate(range(wx0 + 4, wx1 - 2, 12)):
        y = wy0 + 2 + int(4 * math.sin((x - wx0) / (wx1 - wx0) * math.pi))
        on = (wave(f, 1, i * 0.9) + 1) / 2
        glow(img, x, y + 2, 6, '#ffd27a', 0.25 + 0.3 * on)
        d.rectangle([x, y + 1, x + 1, y + 2], fill=mix(hexc('#ffb347'), hexc('#fff1b0'), on))
    # 펜던트 조명 (가운데 위, 살짝 흔들림)
    sw = 1.2 * wave(f, 1)
    d.line([(160, 0), (int(160 + sw), 6)], fill=hexc('#0d0805'))
    lx = int(160 + sw)
    d.polygon([(lx - 8, 12), (lx - 4, 6), (lx + 4, 6), (lx + 8, 12)], fill=hexc('#3b2a1e'))
    glow(img, lx, 16, 60, '#ffb36b', 0.28)
    d.rectangle([lx - 3, 12, lx + 3, 13], fill=hexc('#ffe6a8'))
    # 테이블 + 커피잔 + 작은 화분 + 책
    d.rectangle([0, 118, W, H], fill=hexc('#1a100a'))
    d.rectangle([90, 118, 230, 124], fill=hexc('#6b4429')); d.line([(90, 118), (230, 118)], fill=hexc('#8a5a37'))
    d.rectangle([96, 124, 100, 160], fill=hexc('#3e2716')); d.rectangle([220, 124, 224, 160], fill=hexc('#3e2716'))
    d.rectangle([150, 108, 162, 118], fill=hexc('#efe6d6')); d.rectangle([162, 110, 165, 115], outline=hexc('#efe6d6'))
    d.rectangle([146, 117, 168, 118], fill=hexc('#d9cfbd')); d.rectangle([151, 108, 161, 109], fill=hexc('#6b3e22'))
    steam(img, 152, 104, f, (235, 225, 210), n=3, height=20)
    d.rectangle([194, 109, 204, 118], fill=hexc('#a35b37'));
    for lx2, ly2 in ((196, 104), (200, 101), (203, 105), (198, 106)):
        d.ellipse([lx2 - 2, ly2 - 2, lx2 + 2, ly2 + 2], fill=hexc('#4f7e45'))
    d.rectangle([112, 113, 134, 117], fill=hexc('#7d3b3b')); d.rectangle([114, 110, 132, 113], fill=hexc('#3b5a7d'))
    return img


# ───────────────────────────── 물 ─────────────────────────────
def scene_water(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    sky(img, '#071821', '#155563', 0, 92)
    stars(img, random.Random(41), 60, 70, f, colors=('#e6fffb', '#ffffff'))
    moon(img, d, 160, 46, 10, f, glow_col='#bff7ef')
    d.rectangle([0, 92, W, H], fill=hexc('#0a2d36'))
    for y in range(92, 150):                                 # 바다 띠
        t = (y - 92) / 58
        d.line([(0, y), (W, y)], fill=mix(hexc('#114552'), hexc('#071c24'), t))
    # 달빛 기둥 (반짝이는 물결)
    for y in range(94, 150, 2):
        spread = 4 + (y - 94) * 0.45
        for k in range(3):
            x = 160 + math.sin(y * 0.7 + f / N * TAU * 2 + k * 2.1) * spread
            w_ = 2 + int(spread * 0.25)
            on = (math.sin(y * 1.3 + f / N * TAU * 3 + k) + 1) / 2
            if on > 0.35:
                d.line([(int(x - w_), y), (int(x + w_), y)], fill=mix(hexc('#3f8f96'), hexc('#e8fff6'), on * (1 - (y - 94) / 70)))
    # 물결 줄무늬
    rw = random.Random(6)
    for i in range(60):
        x0, y0 = rw.randrange(W), rw.randrange(96, 148); L = rw.randrange(4, 12)
        x = (x0 + f * (W / N) * 0.25 * (1 + (y0 - 96) / 52) * 0) + 3 * wave(f, 1, i)
        d.line([(int(x), y0), (int(x + L), y0)], fill=hexc('#1d6470'))
    # 해변으로 밀려오는 파도 (한 바퀴에 한 번)
    t = f / N
    front = 150 + 8 * math.sin(t * TAU)
    d.rectangle([0, int(front) + 2, W, H], fill=hexc('#2a2a2c'))
    d.rectangle([0, 160, W, H], fill=hexc('#1d1d20'))
    for x in range(0, W, 2):
        y = front + 1.5 * math.sin(x / 9 + t * TAU * 2)
        d.line([(x, int(y) - 1), (x + 1, int(y) - 1)], fill=hexc('#cfeee9'))
        d.line([(x, int(y)), (x + 1, int(y) + 1)], fill=hexc('#6fbfc0'))
    return img


# ───────────────────────────── 백색소음 ─────────────────────────────
def scene_whitenoise(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    sky(img, '#101119', '#262834', 0, 126, bands=5)
    d.rectangle([0, 126, W, H], fill=hexc('#15161e')); d.line([(0, 126), (W, 126)], fill=hexc('#2e3040'))
    # 레트로 TV (가운데)
    tx0, ty0, tx1, ty1 = 116, 58, 204, 122
    glow(img, 160, 92, 110, '#c9d2ff', 0.16 + 0.04 * wave(f, 3))
    d.rectangle([tx0, ty0, tx1, ty1], fill=hexc('#3a3330')); d.rectangle([tx0 + 2, ty0 + 2, tx1 - 2, ty1 - 2], fill=hexc('#4a413c'))
    sx0, sy0, sx1, sy1 = tx0 + 7, ty0 + 7, tx1 - 22, ty1 - 7
    rs = random.Random(1000 + f)                              # 프레임마다 다른 지직거림 (24장이 반복)
    px = img.load()
    for y in range(sy0, sy1):
        roll = (y + f * 3) % 18 < 2
        for x in range(sx0, sx1):
            v = rs.random()
            if roll: v = 0.5 + v * 0.5
            c = int(60 + v * 175)
            px[x, y] = (c, c, min(255, c + 12))
    d.rectangle([sx0 - 1, sy0 - 1, sx1, sy1], outline=hexc('#1e1a18'))
    for k, ky in enumerate((ty0 + 12, ty0 + 24)):            # 다이얼
        d.ellipse([tx1 - 16, ky, tx1 - 9, ky + 7], fill=hexc('#22201e')); d.point((tx1 - 13, ky + 2 + k), fill=hexc('#bdb3a3'))
    for k in range(3): d.line([(tx1 - 17, ty1 - 18 + k * 3), (tx1 - 8, ty1 - 18 + k * 3)], fill=hexc('#2a2522'))
    d.line([(150, ty0), (134, ty0 - 22)], fill=hexc('#8e8a84')); d.line([(170, ty0), (190, ty0 - 24)], fill=hexc('#8e8a84'))
    d.rectangle([124, ty1, 128, 128], fill=hexc('#2a2522')); d.rectangle([192, ty1, 196, 128], fill=hexc('#2a2522'))
    # 화면 빛이 바닥에 비침
    for y in range(128, 150, 2):
        w_ = 40 + (y - 128) * 2
        d.line([(160 - w_, y), (160 + w_, y)], fill=mix(hexc('#15161e'), hexc('#3a3f58'), 0.5 * (1 - (y - 128) / 22) * (0.8 + 0.2 * wave(f, 3))))
    # 옆 화분과 창 (왼쪽), 오른쪽 위는 시계 자리라 비워 둠
    d.rectangle([28, 34, 76, 96], fill=hexc('#0b0c14')); d.rectangle([30, 36, 74, 94], fill=hexc('#1a2140'))
    stars(img, random.Random(51), 10, 0 + 1, f) if False else None
    for sx, sy in ((38, 44), (60, 52), (50, 70), (68, 40)):
        if (f + sx) % 8 < 6: img.putpixel((sx, sy), hexc('#dfe6ff'))
    d.line([(52, 36), (52, 94)], fill=hexc('#0b0c14')); d.line([(30, 65), (74, 65)], fill=hexc('#0b0c14'))
    d.rectangle([250, 112, 262, 126], fill=hexc('#6b3e2a'))
    for lx, ly in ((252, 106), (257, 101), (261, 107), (255, 109)): d.ellipse([lx - 3, ly - 2, lx + 3, ly + 2], fill=hexc('#2f5a3a'))
    return img


# ───────────────────────────── 작업 ─────────────────────────────
def scene_workspace(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=hexc('#14112a'))
    # 뒤 창 (보랏빛 밤하늘)
    img2 = Image.new('RGB', (W, H)); sky(img2, '#100e1e', '#3b2f6b', 0, H)
    img.paste(img2.crop((40, 14, 136, 84)), (40, 14))
    for sx, sy in ((52, 24), (90, 30), (120, 22), (70, 46), (110, 56), (60, 64)):
        if (f + sx) % 10 < 8: img.putpixel((sx, sy), hexc('#e8e2ff'))
    d.rectangle([38, 12, 138, 14], fill=hexc('#0b0918')); d.rectangle([38, 84, 138, 86], fill=hexc('#0b0918'))
    d.rectangle([38, 12, 40, 86], fill=hexc('#0b0918')); d.rectangle([136, 12, 138, 86], fill=hexc('#0b0918')); d.rectangle([87, 14, 89, 84], fill=hexc('#0b0918'))
    # 선반과 책 (오른쪽, 시계보다 아래)
    d.rectangle([214, 70, 296, 72], fill=hexc('#3a2c55'))
    rb = random.Random(3); x = 218
    while x < 290:
        w_ = rb.randrange(3, 6); h_ = rb.randrange(10, 17)
        d.rectangle([x, 70 - h_, x + w_ - 1, 69], fill=hexc(rb.choice(('#6b5aa8', '#a86a8f', '#4f7e9a', '#c9a35a', '#5a4a8a'))))
        x += w_ + 1
    # 책상
    d.rectangle([0, 124, W, H], fill=hexc('#0e0c1d'))
    d.rectangle([20, 118, 300, 124], fill=hexc('#4a3a6b')); d.line([(20, 118), (300, 118)], fill=hexc('#6b5a94'))
    # 스탠드 조명 (왼쪽)
    d.line([(66, 118), (66, 100)], fill=hexc('#2a2442')); d.line([(66, 100), (80, 88)], fill=hexc('#2a2442'))
    d.polygon([(74, 83), (91, 86), (87, 95), (72, 90)], fill=hexc('#6b5f9e')); d.line([(75, 90), (87, 94)], fill=hexc('#ffe6b0'))
    glow(img, 86, 108, 58, '#ffcf8a', 0.30)
    d.rectangle([60, 117, 72, 118], fill=hexc('#2a2442'))
    # 모니터 (가운데) + 코드 줄 + 깜빡이는 커서
    mx0, my0, mx1, my1 = 118, 64, 202, 112
    glow(img, 160, 88, 70, '#8f7dff', 0.20)
    d.rectangle([mx0, my0, mx1, my1], fill=hexc('#1b1735')); d.rectangle([mx0 + 3, my0 + 3, mx1 - 3, my1 - 3], fill=hexc('#0d0b1c'))
    rc = random.Random(9); y = my0 + 7
    lines = []
    while y < my1 - 8:
        ind = rc.choice((0, 0, 4, 8)); L = rc.randrange(10, 46)
        lines.append((ind, L, y)); y += 4
    shown = int(len(lines) * (0.55 + 0.45 * (f / (N - 1))))          # 한 바퀴 동안 코드가 한 줄씩 써짐
    for i, (ind, L, y) in enumerate(lines[:shown]):
        segx = mx0 + 7 + ind
        for s in range(0, L, 8):
            d.line([(segx + s, y), (segx + s + rc.randrange(3, 7), y)], fill=hexc(rc.choice(('#b7a4ff', '#7fe0c9', '#ffd27a', '#e6e1ff'))))
    if lines:
        ind, L, y = lines[max(0, shown - 1)]
        if (f // 3) % 2 == 0: d.rectangle([mx0 + 7 + ind + L + 2, y - 1, mx0 + 8 + ind + L + 3, y + 1], fill=hexc('#ffffff'))
    d.rectangle([156, my1, 164, 118], fill=hexc('#1b1735')); d.rectangle([146, 116, 174, 118], fill=hexc('#1b1735'))
    # 키보드 + 머그
    d.rectangle([128, 120, 192, 123], fill=hexc('#2a2442'))
    for k in range(130, 190, 4): img.putpixel((k, 121), hexc('#4a4170'))
    d.rectangle([230, 108, 240, 118], fill=hexc('#d9d2e8')); d.rectangle([240, 110, 243, 115], outline=hexc('#d9d2e8'))
    steam(img, 232, 104, f, (220, 215, 240), n=3, height=16, seed=2)
    return img


# ───────────────────────────── 로파이 ─────────────────────────────
def scene_lofi(f):
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, H], fill=hexc('#1e1022'))
    # 큰 창 너머 노을 하늘 + 구름 + 도시
    wx0, wy0, wx1, wy1 = 60, 12, 260, 104
    img2 = Image.new('RGB', (W, H)); sky(img2, '#2b1640', '#ff9f8a', 0, 104, bands=8)
    img.paste(img2.crop((wx0, wy0, wx1, wy1)), (wx0, wy0))
    glow(img, 196, 92, 40, '#ffd49a', 0.35)
    d.ellipse([186, 82, 206, 102], fill=hexc('#ffcf8f'))
    for i, (cy, cx0, w_) in enumerate(((34, 110, 30), (52, 210, 24), (26, 230, 18))):
        cx = cx0 + 3 * wave(f, 1, i * 1.3)
        col = mix(hexc('#ff9fb4'), hexc('#ffd1c4'), 0.4)
        for dx, dy, ww in ((0, 0, w_), (-w_ // 2, 2, w_ // 2 + 4), (w_ // 2, 2, w_ // 2 + 2)):
            d.ellipse([cx + dx - ww // 2, cy + dy - 2, cx + dx + ww // 2, cy + dy + 2], fill=col)
    rb = random.Random(14)
    for i in range(16):
        bx = rb.randrange(wx0 - 10, wx1); bw = rb.randrange(12, 26); bh = rb.randrange(10, 34)
        d.rectangle([max(bx, wx0), wy1 - bh, min(bx + bw, wx1 - 1), wy1 - 1], fill=hexc('#3a1f3f'))
        for k in range(2):
            lx, ly = rb.randrange(bx + 2, bx + bw), rb.randrange(wy1 - bh + 2, wy1 - 2)
            if wx0 <= lx < wx1 and (f + i) % 12 != 0: img.putpixel((lx, ly), hexc('#ffd27a'))
    fr = hexc('#140a17')
    d.rectangle([wx0 - 4, wy0 - 4, wx1 + 4, wy0 - 1], fill=fr); d.rectangle([wx0 - 4, wy0 - 4, wx0 - 1, wy1 + 2], fill=fr)
    d.rectangle([wx1 + 1, wy0 - 4, wx1 + 4, wy1 + 2], fill=fr); d.rectangle([158, wy0, 161, wy1], fill=fr)
    # 커튼 (살랑임)
    for side, x0 in ((0, wx0 - 2), (1, wx1 - 24)):
        for k in range(24):
            sway = int(1.5 * wave(f, 1, k * 0.25 + side))
            d.line([(x0 + k + sway * (k / 24), wy0 - 2), (x0 + k + sway, wy1 - 6)], fill=mix(hexc('#5a2a55'), hexc('#7a3a6e'), (k % 6) / 6))
    # 창턱 + 고양이(꼬리 살랑) + 화분 + 턴테이블
    d.rectangle([wx0 - 8, wy1 + 2, wx1 + 8, wy1 + 8], fill=hexc('#4a2a3e'))
    cx, cy = 118, wy1 + 2
    d.ellipse([cx - 12, cy - 9, cx + 8, cy + 1], fill=hexc('#120a12'))          # 몸
    d.ellipse([cx + 3, cy - 14, cx + 13, cy - 5], fill=hexc('#120a12'))         # 머리
    d.polygon([(cx + 4, cy - 12), (cx + 6, cy - 17), (cx + 8, cy - 12)], fill=hexc('#120a12'))
    d.polygon([(cx + 9, cy - 12), (cx + 11, cy - 17), (cx + 13, cy - 11)], fill=hexc('#120a12'))
    tail = [(cx - 11, cy - 2)]
    for k in range(1, 8):
        tail.append((cx - 11 - k * 2, cy - 2 - int(k * 1.2 * (0.6 + 0.5 * wave(f, 1, k * 0.3)))))
    d.line(tail, fill=hexc('#120a12'), width=2)
    d.rectangle([224, wy1 - 8, 234, wy1 + 2], fill=hexc('#a35b6a'))
    for lx, ly in ((226, wy1 - 12), (230, wy1 - 16), (233, wy1 - 11)): d.ellipse([lx - 3, ly - 2, lx + 3, ly + 2], fill=hexc('#4f7e5a'))
    # 책상 위 턴테이블 (레코드가 돌아감)
    d.rectangle([0, 124, W, H], fill=hexc('#160b19'))
    d.rectangle([110, 118, 210, 124], fill=hexc('#5a3350')); d.line([(110, 118), (210, 118)], fill=hexc('#7a4a6e'))
    d.rectangle([138, 110, 182, 118], fill=hexc('#2a1a2a'))
    d.ellipse([144, 111, 172, 117], fill=hexc('#0d070d'))
    ang = f / N * TAU
    hx = 158 + int(10 * math.cos(ang)); hy = 114 + int(2.5 * math.sin(ang))
    img.putpixel((hx, hy), hexc('#ff8fbf')); img.putpixel((158, 114), hexc('#ff8fbf'))
    d.line([(178, 111), (170, 114)], fill=hexc('#c9a3bf'))
    glow(img, 160, 116, 50, '#ff8fbf', 0.12)
    return img


SCENES = dict(BASE)
SCENES.update(default=scene_default, nature=scene_nature, cafe=scene_cafe, water=scene_water,
              whitenoise=scene_whitenoise, workspace=scene_workspace, lofi=scene_lofi)

if __name__ == '__main__':
    out = sys.argv[1]
    for n in (sys.argv[2:] or list(SCENES)):
        frames = [SCENES[n](f) for f in range(N)]
        save(frames, f'{out}/{n}_bg.webp')
        print(n, 'ok')
