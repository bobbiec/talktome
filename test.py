from inky import InkyWHAT as iw, inky
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from font_hanken_grotesk import HankenGroteskMedium

PALETTE = [
    255, 255, 255,  # white
    0, 0, 0,        # black
    255, 255, 0     # yellow
] + [0, 0, 0] * 252

screen = iw('yellow')

p = Image.new('P', (1, 1))
p.putpalette(PALETTE)

img = Image.open('icarus.png')

text = Image.new('RGBA', img.size, (255, 255, 255, 0))
font = ImageFont.truetype(HankenGroteskMedium, 48)
small_font = ImageFont.truetype(HankenGroteskMedium, 24)

d = ImageDraw.Draw(text)
d.text((10, 10), "CIA Office Hours", font=font, fill=(0, 0, 0, 255))
d.text((10, 58), "2/21/2020", font=small_font, fill=(0, 0, 0, 255))
# d.text((10, 58), "Raceday 2016\nIcarus - Ari\nHill 5 - Aldy", font=small_font, fill=(0, 0, 0, 255))

img = Image.alpha_composite(img, text).convert('RGB').quantize(palette=p)

img = img.rotate(180)

screen.set_image(img)
screen.show()


