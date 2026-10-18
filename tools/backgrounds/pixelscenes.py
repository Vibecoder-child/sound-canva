"""사운드 캔버스 배경용 픽셀 아트 애니메이션 생성기 (320x180, 반복 재생되는 animated WebP)."""
import math, random, sys
from PIL import Image, ImageDraw

W, H = 320, 180
N = 24            # 프레임 수 (한 바퀴)
DUR = 125         # 프레임당 ms → 3초에 한 바퀴


def hexc(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def sky(img, top, bottom, y0=0, y1=H, bands=7):
    """계단식 그라데이션 + 경계만 디더링 (픽셀 아트 하늘)."""
    px = img.load(); top, bottom = hexc(top) if isinstance(top, str) else top, hexc(bottom) if isinstance(bottom, str) else bottom
    for y in range(y0, y1):
        t = (y - y0) / max(1, (y1 - y0 - 1)) * (bands - 1)
        lo = int(t); fr = t - lo
        c0, c1 = mix(top, bottom, lo / (bands - 1)), mix(top, bottom, min(lo + 1, bands - 1) / (bands - 1))
        for x in range(W):
            px[x, y] = c1 if fr * 16 > BAYER[y % 4][x % 4] + 0.5 else c0


def dither_rect(img, box, c_a, c_b, ratio):
    px = img.load(); x0, y0, x1, y1 = box
    for y in range(max(0, y0), min(H, y1)):
        for x in range(max(0, x0), min(W, x1)):
            px[x, y] = c_b if ratio * 16 > BAYER[y % 4][x % 4] + 0.5 else c_a


def glow(img, cx, cy, r, color, strength=0.55, flicker=0.0, steps=5):
    """동심원 띠로 표현한 픽셀 아트식 빛 번짐 (띠 경계만 살짝 디더링)."""
    px = img.load(); color = hexc(color) if isinstance(color, str) else color
    r = r * (1 + flicker)
    for y in range(max(0, int(cy - r)), min(H, int(cy + r) + 1)):
        for x in range(max(0, int(cx - r)), min(W, int(cx + r) + 1)):
            d = math.hypot((x - cx), (y - cy) * 1.25) / r
            if d >= 1: continue
            a = (1 - d) ** 1.5 * steps
            lvl = int(a); fr = a - lvl
            if fr * 16 > BAYER[y % 4][x % 4] + 8: lvl += 1      # 띠 경계의 좁은 디더
            if lvl: px[x, y] = mix(px[x, y], color, min(1.0, lvl / steps * strength * 1.6))


def stars(img, rng, n, ymax, frame, colors=('#ffffff', '#cfd8ff', '#ffe8b0')):
    px = img.load()
    for i in range(n):
        x, y = rng.randrange(W), rng.randrange(ymax)
        ph = rng.random(); big = rng.random() < 0.12
        on = (math.sin((frame / N + ph) * 2 * math.pi) + 1) / 2
        c = hexc(colors[i % len(colors)])
        base = px[x, y]
        px[x, y] = mix(base, c, 0.35 + 0.65 * on)
        if big and on > 0.6:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                if 0 <= x + dx < W and 0 <= y + dy < H: px[x + dx, y + dy] = mix(px[x + dx, y + dy], c, 0.45)


def pine(d, x, base, h, color):
    """계단 모양 소나무 실루엣."""
    w = max(3, h // 3)
    for i in range(h):
        hw = int((i / h) * w) + (1 if i % 4 == 3 else 0)
        d.line([(x - hw, base - h + i), (x + hw, base - h + i)], fill=color)
    d.rectangle([x - 1, base, x + 1, base + 3], fill=color)


def save(frames, path):
    frames[0].save(path, save_all=True, append_images=frames[1:], duration=DUR, loop=0, lossless=True, method=6)


# ───────────────────────────── 장면들 ─────────────────────────────

def scene_rain(f):
    rng = random.Random(1)
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    # 창밖: 밤하늘 + 도시 실루엣
    sky(img, '#0b1626', '#2a4a6b', 0, 140)
    for i in range(26):                                # 먼 건물
        bx = rng.randrange(-10, W); bw = rng.randrange(14, 34); bh = rng.randrange(25, 70)
        d.rectangle([bx, 140 - bh, bx + bw, 140], fill=hexc('#13233a'))
    for i in range(14):                                # 가까운 건물 + 창문 불빛
        bx = rng.randrange(-10, W); bw = rng.randrange(20, 44); bh = rng.randrange(40, 95)
        d.rectangle([bx, 140 - bh, bx + bw, 140], fill=hexc('#0d1829'))
        for wy in range(140 - bh + 5, 136, 7):
            for wx in range(bx + 4, bx + bw - 3, 6):
                r = rng.random()
                if r < 0.33:
                    lit = '#f4c76b' if r < 0.24 else '#9fc6ff'
                    if r < 0.03 and (f // 6) % 2: continue  # 아주 가끔 깜빡이는 창
                    d.rectangle([wx, wy, wx + 2, wy + 2], fill=hexc(lit))
    d.rectangle([0, 140, W, 180], fill=hexc('#0a1220'))
    # 빗줄기 (프레임마다 아래로, 한 바퀴에 정확히 화면 높이만큼 이동 → 끊김 없는 반복)
    rr = random.Random(7)
    for i in range(170):
        x0, y0 = rr.randrange(W + 40), rr.randrange(H); spd = rr.choice((1, 2, 3))
        L = 3 + spd * 2; y = (y0 + f * spd * H / N) % (H + 20) - 10; x = (x0 - y * 0.25) % (W + 40) - 20
        c = mix(hexc('#2a4a6b'), hexc('#9cc3ea'), 0.3 + 0.2 * spd)
        d.line([(x, y), (x - L * 0.25, y + L)], fill=c)
    # 창틀 (실내 시점) — 가운데 십자 창살
    frame_c, frame_l = hexc('#1a120e'), hexc('#2c1f17')
    d.rectangle([0, 0, W, 10], fill=frame_c); d.rectangle([0, 0, 16, H], fill=frame_c); d.rectangle([W - 17, 0, W, H], fill=frame_c)
    d.rectangle([W // 2 - 4, 0, W // 2 + 4, 150], fill=frame_c); d.rectangle([0, 78, W, 84], fill=frame_c)
    d.line([(17, 11), (W - 18, 11)], fill=frame_l); d.line([(W // 2 + 4, 11), (W // 2 + 4, 150)], fill=frame_l)
    # 창턱 + 화분 + 머그
    d.rectangle([0, 150, W, 160], fill=hexc('#3a281c')); d.line([(0, 150), (W, 150)], fill=hexc('#5a3e2a'))
    d.rectangle([0, 160, W, H], fill=hexc('#120c09'))
    d.rectangle([40, 136, 54, 150], fill=hexc('#8a4b2e')); d.rectangle([38, 134, 56, 137], fill=hexc('#a35b37'))
    for lx, ly in ((44, 124), (47, 118), (50, 126), (41, 128), (52, 120)):
        d.ellipse([lx - 3, ly - 2, lx + 3, ly + 2], fill=hexc('#3f7a43'))
    d.rectangle([258, 140, 268, 150], fill=hexc('#d9d2c3')); d.rectangle([268, 142, 271, 147], outline=hexc('#d9d2c3'))
    for k in range(3):                                  # 머그 김
        sx = 261 + k * 3 + int(2 * math.sin((f / N) * 2 * math.pi + k)); sy = 136 - ((f * 1 + k * 8) % 24)
        if sy > 118: img.putpixel((sx, sy), mix(hexc('#2a4a6b'), (230, 230, 230), 0.5))
    # 유리 위를 미끄러지는 물방울
    rd = random.Random(3)
    for i in range(10):
        gx = rd.randrange(20, W - 20); gy0 = rd.randrange(12, 70); length = rd.randrange(20, 60)
        if abs(gx - W // 2) < 7: continue
        top = 11 if gy0 < 78 else 85
        y = gy0 + ((f + i * 5) % N) / N * length
        bottom = 77 if gy0 < 78 else 149
        if y < bottom:
            img.putpixel((gx, int(y)), hexc('#cfe6ff')); img.putpixel((gx, int(y) - 1), hexc('#7fa6cf'))
    # 따뜻한 실내 조명 반사
    glow(img, W - 52, 150, 40, '#ffb36b', 0.18)
    return img


def scene_fire(f):
    rng = random.Random(2)
    img = Image.new('RGB', (W, H)); d = ImageDraw.Draw(img)
    sky(img, '#08070f', '#2a1612', 0, 112)
    stars(img, random.Random(5), 70, 78, f)
    # 먼 산 + 숲 실루엣
    pts = [(0, 96)] + [(x, 92 - int(10 * math.sin(x / 37) + 6 * math.sin(x / 13))) for x in range(0, W + 1, 4)] + [(W, 112), (0, 112)]
    d.polygon(pts, fill=hexc('#1a0f12'))
    for i in range(30):
        x = rng.randrange(-5, W + 5); h = rng.randrange(18, 42)
        if 110 < x < 210: h = min(h, 22)
        pine(d, x, 112, h, hexc('#120a0b'))
    d.rectangle([0, 112, W, H], fill=hexc('#1b100c'))
    fl = 0.06 * math.sin(f / N * 2 * math.pi * 3) + 0.04 * math.sin(f / N * 2 * math.pi * 5)
    glow(img, 160, 122, 95, '#ff7a2e', 0.38, fl)
    glow(img, 160, 124, 40, '#ffb347', 0.45, fl)
    # 장작
    d.polygon([(132, 132), (188, 122), (190, 127), (134, 138)], fill=hexc('#3b2316'))
    d.polygon([(130, 123), (186, 135), (184, 140), (128, 129)], fill=hexc('#4a2c1b'))
    for sx in range(136, 186, 6):
        img.putpixel((sx, 130), hexc('#ff6a2a') if (sx // 6 + f) % 3 else hexc('#ffc46b'))
    # 불꽃: 층별로 흔들리는 혀 모양
    cols = ['#b8321c', '#ff6a2a', '#ffb347', '#fff1b0']
    for layer, (c, scale) in enumerate(zip(cols, (1.0, 0.78, 0.55, 0.3))):
        for tongue in range(5):
            ph = f / N * 2 * math.pi * (2 + tongue % 2) + tongue * 1.7
            cx = 160 + (tongue - 2) * 7 * scale + 2 * math.sin(ph)
            hgt = (34 + 10 * math.sin(ph * 1.3 + tongue)) * scale
            wid = 7 * scale + 1
            base = 128
            poly = [(cx - wid, base), (cx - wid * 0.6, base - hgt * 0.5), (cx + 1.5 * math.sin(ph + 1), base - hgt), (cx + wid * 0.6, base - hgt * 0.45), (cx + wid, base)]
            d.polygon([(int(x), int(y)) for x, y in poly], fill=hexc(c))
    # 불티
    rs = random.Random(9)
    for i in range(16):
        x0 = 150 + rs.randrange(20); spd = rs.choice((2, 3, 4)); ph = rs.randrange(N)
        t = ((f + ph) % N) / N
        y = 120 - t * spd * 22; x = x0 + 6 * math.sin(t * 6 + i)
        if y > 20:
            img.putpixel((int(x), int(y)), hexc('#ffd27a') if t < 0.6 else hexc('#ff8a3a'))
    return img


SCENES = {'rain': scene_rain, 'fire': scene_fire}

if __name__ == '__main__':
    out = sys.argv[1]
    names = sys.argv[2:] or list(SCENES)
    for n in names:
        frames = [SCENES[n](f) for f in range(N)]
        save(frames, f'{out}/{n}_bg.webp')
        print(n, 'ok')
