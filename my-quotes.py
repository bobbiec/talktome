#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import random
import sys

from inky import InkyWHAT

from PIL import Image, ImageFont, ImageDraw
from font_source_serif_pro import SourceSerifProSemibold
from font_source_sans_pro import SourceSansProSemibold

print("""Inky wHAT: Quotes

Display quotes on Inky wHAT.
""")


# Command line arguments to set display type and colour, and enter your name

parser = argparse.ArgumentParser()
parser.add_argument('--colour', '-c', type=str, default="yellow", choices=["red", "black", "yellow"], help="ePaper display colour")
args = parser.parse_args()

colour = args.colour

# This function will take a quote as a string, a width to fit
# it into, and a font (one that's been loaded) and then reflow
# that quote with newlines to fit into the space required.


def reflow_quote(quote, width, font):
    return quote
    words = quote.split(" ")
    reflowed = ''
    line_length = 0

    for i in range(len(words)):
        if words[i] == "\n":
            line_length = 0
            reflowed = reflowed[:-1] + "\n"
            continue
        word = words[i] + " "
        word_length = font.getsize(word)[0]
        line_length += word_length

        if line_length < width:
            reflowed += word
        else:
            line_length = word_length
            reflowed = reflowed[:-1] + "\n  " + word

    reflowed = reflowed.rstrip()

    return reflowed


# Set up the correct display and scaling factors
inky_display = InkyWHAT(colour)
inky_display.set_border(inky_display.WHITE)
# inky_display.set_rotation(180)

w = inky_display.WIDTH
h = inky_display.HEIGHT

# Create a new canvas to draw on

img = Image.new("P", (inky_display.WIDTH, inky_display.HEIGHT))
draw = ImageDraw.Draw(img)

# Load the fonts

font_size = 64

author_font = ImageFont.truetype(SourceSerifProSemibold, font_size)
quote_font = ImageFont.truetype(SourceSerifProSemibold, font_size)


# The amount of padding around the quote. Note that
# a value of 30 means 15 pixels padding left and 15
# pixels padding right.
#
# Also define the max width and height for the quote.

padding = 50
max_width = w - padding
max_height = h - padding


# Only pick a quote that will fit in our defined area
# once rendered in the font and size defined.

while True:
    print("Enter text to show: ")
    quote = input().replace('\\n', '\n')
    reflowed = reflow_quote(quote, max_width, quote_font)
    p_w, p_h = quote_font.getsize(reflowed)  # Width and height of quote
    p_h = p_h * (reflowed.count("\n") + 1)   # Multiply through by number of lines

    if p_h < max_height:
        # quote fits
        break

# x- and y-coordinates for the top left of the quote

quote_x = (w - max_width) / 2
quote_y = ((h - max_height) + (max_height - p_h)) / 2


# Draw red rectangles top and bottom to frame quote

draw.rectangle(
    (padding / 4,
     padding / 4,
     w - (padding / 4),
     quote_y - (padding / 4)),
    fill=inky_display.RED)
    # draw.rectangle((padding / 4, quote_y + quote_font.getsize("ABCD")[1] + (padding / 4) + 5, w - (padding / 4), h - (padding / 4)), fill=inky_display.RED)
draw.rectangle(
    (padding / 4,
     quote_y + p_h + (padding / 4) + 5,
     w - (padding / 4),
     h - (padding / 4)),
    fill=inky_display.RED)
# Add some white hatching to the red rectangles to make
# it look a bit more interesting

hatch_spacing = 48

for x in range(0, 2 * w, hatch_spacing):
    draw.line((x, 0, x - w, h), fill=inky_display.WHITE, width=3)

# Write our quote and author to the canvas

draw.multiline_text((quote_x, quote_y), reflowed, fill=inky_display.BLACK, font=quote_font, align="left")


# Display the completed canvas on Inky wHAT

inky_display.set_image(img)
inky_display.show()
