"""
Generate refined, premium golden horseshoe icons for the Chrome Extension.
Creates 16x16, 32x32, 48x48, and 128x128 PNG icons.
"""
import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_horseshoe_icon(size):
    scale = 4
    canvas_size = size * scale
    
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    
    # 1. Background squircle
    bg = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    pad = canvas_size * 0.04
    corner = canvas_size * 0.28
    
    # Midnight obsidian
    bg_draw.rounded_rectangle(
        [pad, pad, canvas_size - pad, canvas_size - pad],
        radius=corner,
        fill=(11, 15, 25, 255) # deep slate/obsidian
    )
    
    # Subtle inner gold border
    border_w = max(1, int(canvas_size * 0.025))
    bg_draw.rounded_rectangle(
        [pad, pad, canvas_size - pad, canvas_size - pad],
        radius=corner,
        outline=(245, 158, 11, 150),
        width=border_w
    )
    
    # Subtle emerald & golden ambient backdrop glow
    ambient = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    amb_draw = ImageDraw.Draw(ambient)
    amb_draw.ellipse(
        [canvas_size * 0.15, canvas_size * 0.15, canvas_size * 0.85, canvas_size * 0.85],
        fill=(16, 185, 129, 25) # emerald hint
    )
    amb_draw.ellipse(
        [canvas_size * 0.25, canvas_size * 0.25, canvas_size * 0.75, canvas_size * 0.75],
        fill=(245, 158, 11, 45) # gold glow
    )
    ambient = ambient.filter(ImageFilter.GaussianBlur(radius=canvas_size * 0.1))
    bg = Image.alpha_composite(bg, ambient)
    img = Image.alpha_composite(img, bg)

    # 2. Horseshoe Geometry (U-shape facing UP, curve at bottom)
    cx = canvas_size * 0.5
    cy = canvas_size * 0.52
    
    r_outer = canvas_size * 0.32
    r_inner = canvas_size * 0.18
    arm_height = canvas_size * 0.20
    
    hs_mask = Image.new('L', (canvas_size, canvas_size), 0)
    hs_draw = ImageDraw.Draw(hs_mask)
    
    # Coordinate system: (0,0) top-left, y grows downwards.
    # Bottom curve: angle goes from 0 (Right, (cx + r, cy)) -> pi/2 (Bottom, (cx, cy + r)) -> pi (Left, (cx - r, cy))
    # Right arm: from (cx + r, cy) upwards to (cx + r, cy - arm_height)
    # Left arm: from (cx - r, cy) upwards to (cx - r, cy - arm_height)
    
    points = []
    # 1. Right arm outer: from top (cx + r_outer, cy - arm_height) down to (cx + r_outer, cy)
    points.append((cx + r_outer, cy - arm_height))
    points.append((cx + r_outer, cy))
    
    # 2. Outer bottom arc: from angle 0 to pi (clockwise, y positive)
    steps = 40
    for i in range(1, steps):
        angle = math.pi * i / steps
        px = cx + r_outer * math.cos(angle)
        py = cy + r_outer * math.sin(angle)
        points.append((px, py))
    points.append((cx - r_outer, cy))
    
    # 3. Left arm outer: upwards to (cx - r_outer, cy - arm_height)
    points.append((cx - r_outer, cy - arm_height))
    
    # 4. Top-left cap (rounded dome)
    cap_r = (r_outer - r_inner) / 2
    cap_lx = cx - (r_outer + r_inner) / 2
    for i in range(21):
        angle = math.pi + (math.pi * i / 20) # from pi to 2pi (facing up)
        points.append((cap_lx + cap_r * math.cos(angle), cy - arm_height + cap_r * math.sin(angle)))
        
    # 5. Left arm inner: from (cx - r_inner, cy - arm_height) downwards to (cx - r_inner, cy)
    points.append((cx - r_inner, cy - arm_height))
    points.append((cx - r_inner, cy))
    
    # 6. Inner bottom arc: from angle pi back to 0
    for i in range(steps - 1, 0, -1):
        angle = math.pi * i / steps
        px = cx + r_inner * math.cos(angle)
        py = cy + r_inner * math.sin(angle)
        points.append((px, py))
    points.append((cx + r_inner, cy))
    
    # 7. Right arm inner: upwards to (cx + r_inner, cy - arm_height)
    points.append((cx + r_inner, cy - arm_height))
    
    # 8. Top-right cap (rounded dome)
    cap_rx = cx + (r_outer + r_inner) / 2
    for i in range(21):
        angle = 0 - (math.pi * i / 20) # from 0 to -pi (facing up)
        points.append((cap_rx + cap_r * math.cos(angle), cy - arm_height + cap_r * math.sin(angle)))
        
    hs_draw.polygon(points, fill=255)
    
    # 3. Realistic Radiant Gold Gradient
    gold_layer = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(gold_layer)
    for y in range(canvas_size):
        ratio = y / canvas_size
        # Bright gleaming gold on top (#FDE047), rich amber-gold at bottom (#D97706)
        r = int(254 * (1 - ratio*0.15))
        g = int(224 * (1 - ratio*0.35))
        b = int(71 * (1 - ratio*0.65) + 15 * ratio)
        g_draw.line([(0, y), (canvas_size, y)], fill=(r, g, b, 255))
        
    horseshoe_img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    horseshoe_img.paste(gold_layer, (0, 0), hs_mask)
    
    # 4. Horseshoe Nail Holes (Classic lucky 7 holes)
    holes_mask = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(holes_mask)
    hole_radius = max(2.0 * scale, (r_outer - r_inner) * 0.16)
    mid_r = (r_outer + r_inner) / 2
    
    # 3 on right, 1 at bottom center, 3 on left
    hole_coords = [
        # Right arm
        (cx + mid_r, cy - arm_height * 0.65),
        (cx + mid_r, cy - arm_height * 0.05),
        (cx + mid_r * math.cos(math.pi * 0.22), cy + mid_r * math.sin(math.pi * 0.22)),
        # Bottom center
        (cx, cy + mid_r),
        # Left arm
        (cx + mid_r * math.cos(math.pi * 0.78), cy + mid_r * math.sin(math.pi * 0.78)),
        (cx - mid_r, cy - arm_height * 0.05),
        (cx - mid_r, cy - arm_height * 0.65),
    ]
    
    for hx, hy in hole_coords:
        # Dark hole interior
        h_draw.ellipse([hx - hole_radius, hy - hole_radius, hx + hole_radius, hy + hole_radius], fill=(15, 23, 42, 250))
        # Inner golden rim highlight
        h_draw.ellipse([hx - hole_radius, hy - hole_radius, hx + hole_radius, hy + hole_radius], outline=(254, 240, 138, 220), width=max(1, int(scale * 0.6)))
        
    horseshoe_img = Image.alpha_composite(horseshoe_img, holes_mask)
    
    # 5. Horseshoe Glow
    glow_hs = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    glow_hs.paste((245, 158, 11, 160), (0, 0), hs_mask)
    glow_hs = glow_hs.filter(ImageFilter.GaussianBlur(radius=canvas_size * 0.04))
    
    img = Image.alpha_composite(img, glow_hs)
    img = Image.alpha_composite(img, horseshoe_img)
    
    # 6. Sparkling Lucky Star inside the horseshoe cradle
    star_x = cx
    star_y = cy - canvas_size * 0.02
    s_size = canvas_size * 0.10
    
    star_pts = [
        (star_x, star_y - s_size),
        (star_x + s_size*0.22, star_y - s_size*0.22),
        (star_x + s_size, star_y),
        (star_x + s_size*0.22, star_y + s_size*0.22),
        (star_x, star_y + s_size),
        (star_x - s_size*0.22, star_y + s_size*0.22),
        (star_x - s_size, star_y),
        (star_x - s_size*0.22, star_y - s_size*0.22)
    ]
    
    # Star glow
    sglow = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    ImageDraw.Draw(sglow).polygon(star_pts, fill=(255, 255, 255, 220))
    sglow = sglow.filter(ImageFilter.GaussianBlur(radius=scale * 2))
    img = Image.alpha_composite(img, sglow)
    
    # Star core
    ImageDraw.Draw(img).polygon(star_pts, fill=(255, 255, 255, 255))

    return img.resize((size, size), Image.Resampling.LANCZOS)

def main():
    os.makedirs('icons', exist_ok=True)
    for size in [16, 32, 48, 128]:
        icon = create_horseshoe_icon(size)
        icon.save(f'icons/icon{size}.png', 'PNG')
        print(f"Generated icons/icon{size}.png")

if __name__ == '__main__':
    main()
