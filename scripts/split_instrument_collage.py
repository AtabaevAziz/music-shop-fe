#!/usr/bin/env python3

from __future__ import annotations

import struct
import zlib
from pathlib import Path


OUTPUT_SIZE = 768
INNER_PADDING = 56
SOURCE_PATH = Path(__file__).resolve().parents[2] / "instrumentals.png"
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "assets"

# Bounding boxes were extracted from the provided collage after segmenting
# non-white connected regions. Each box is expanded slightly before export.
INSTRUMENT_BOXES = [
    ("dombra", (70, 15, 182, 422)),
    ("acoustic-guitar", (298, 14, 463, 422)),
    ("electric-guitar", (598, 12, 740, 420)),
    ("drum-kit", (812, 95, 1227, 408)),
    ("grand-piano", (29, 483, 384, 824)),
    ("violin", (480, 487, 599, 817)),
    ("saxophone", (759, 476, 925, 825)),
    ("trumpet", (1050, 500, 1151, 832)),
    ("cello", (370, 845, 488, 1203)),
    ("flute", (751, 860, 779, 1208)),
]


def read_png(path: Path) -> tuple[int, int, list[list[tuple[int, int, int]]]]:
    with path.open("rb") as file:
        if file.read(8) != b"\x89PNG\r\n\x1a\n":
            raise ValueError(f"{path} is not a PNG file")

        width = height = None
        color_type = bit_depth = None
        compressed = bytearray()

        while True:
            header = file.read(8)
            if not header:
                break

            length, chunk_type = struct.unpack(">I4s", header)
            data = file.read(length)
            file.read(4)

            if chunk_type == b"IHDR":
                width, height, bit_depth, color_type, compression, flt, interlace = struct.unpack(
                    ">IIBBBBB", data
                )
                if (bit_depth, color_type, compression, flt, interlace) != (8, 2, 0, 0, 0):
                    raise ValueError("Only 8-bit non-interlaced RGB PNG files are supported")
            elif chunk_type == b"IDAT":
                compressed.extend(data)
            elif chunk_type == b"IEND":
                break

    if width is None or height is None or color_type is None:
        raise ValueError(f"{path} has no valid IHDR chunk")

    raw = zlib.decompress(bytes(compressed))
    stride = width * 3
    rows: list[list[tuple[int, int, int]]] = []
    offset = 0
    previous = [0] * stride

    for _ in range(height):
        filter_type = raw[offset]
        offset += 1
        scanline = list(raw[offset : offset + stride])
        offset += stride
        current = [0] * stride

        if filter_type == 0:
            current = scanline
        elif filter_type == 1:
            for index, value in enumerate(scanline):
                left = current[index - 3] if index >= 3 else 0
                current[index] = (value + left) & 0xFF
        elif filter_type == 2:
            for index, value in enumerate(scanline):
                current[index] = (value + previous[index]) & 0xFF
        elif filter_type == 3:
            for index, value in enumerate(scanline):
                left = current[index - 3] if index >= 3 else 0
                up = previous[index]
                current[index] = (value + ((left + up) // 2)) & 0xFF
        elif filter_type == 4:
            for index, value in enumerate(scanline):
                left = current[index - 3] if index >= 3 else 0
                up = previous[index]
                up_left = previous[index - 3] if index >= 3 else 0
                predictor = paeth(left, up, up_left)
                current[index] = (value + predictor) & 0xFF
        else:
            raise ValueError(f"Unsupported PNG filter type: {filter_type}")

        row = [
            (current[index], current[index + 1], current[index + 2])
            for index in range(0, stride, 3)
        ]
        rows.append(row)
        previous = current

    return width, height, rows


def paeth(a: int, b: int, c: int) -> int:
    prediction = a + b - c
    pa = abs(prediction - a)
    pb = abs(prediction - b)
    pc = abs(prediction - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def write_png(path: Path, pixels: list[list[tuple[int, int, int]]]) -> None:
    height = len(pixels)
    width = len(pixels[0])
    raw = bytearray()

    for row in pixels:
        raw.append(0)
        for red, green, blue in row:
            raw.extend((red, green, blue))

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    idat = zlib.compress(bytes(raw), level=9)

    with path.open("wb") as file:
        file.write(b"\x89PNG\r\n\x1a\n")
        write_chunk(file, b"IHDR", ihdr)
        write_chunk(file, b"IDAT", idat)
        write_chunk(file, b"IEND", b"")


def write_chunk(file, chunk_type: bytes, data: bytes) -> None:
    file.write(struct.pack(">I", len(data)))
    file.write(chunk_type)
    file.write(data)
    checksum = zlib.crc32(chunk_type)
    checksum = zlib.crc32(data, checksum)
    file.write(struct.pack(">I", checksum & 0xFFFFFFFF))


def crop(rows: list[list[tuple[int, int, int]]], box: tuple[int, int, int, int], margin: int = 28):
    min_x, min_y, max_x, max_y = box
    width = len(rows[0])
    height = len(rows)

    min_x = max(0, min_x - margin)
    min_y = max(0, min_y - margin)
    max_x = min(width - 1, max_x + margin)
    max_y = min(height - 1, max_y + margin)

    return [row[min_x : max_x + 1] for row in rows[min_y : max_y + 1]]


def resize_bilinear(
    pixels: list[list[tuple[int, int, int]]], target_width: int, target_height: int
) -> list[list[tuple[int, int, int]]]:
    source_height = len(pixels)
    source_width = len(pixels[0])

    if source_width == target_width and source_height == target_height:
        return [row[:] for row in pixels]

    if target_width == 1:
        x_scale = 0.0
    else:
        x_scale = (source_width - 1) / (target_width - 1)

    if target_height == 1:
        y_scale = 0.0
    else:
        y_scale = (source_height - 1) / (target_height - 1)

    result: list[list[tuple[int, int, int]]] = []
    for target_y in range(target_height):
        source_y = target_y * y_scale
        y0 = int(source_y)
        y1 = min(y0 + 1, source_height - 1)
        y_weight = source_y - y0
        row: list[tuple[int, int, int]] = []

        for target_x in range(target_width):
            source_x = target_x * x_scale
            x0 = int(source_x)
            x1 = min(x0 + 1, source_width - 1)
            x_weight = source_x - x0

            top_left = pixels[y0][x0]
            top_right = pixels[y0][x1]
            bottom_left = pixels[y1][x0]
            bottom_right = pixels[y1][x1]

            row.append(
                tuple(
                    int(
                        round(
                            top_left[channel] * (1 - x_weight) * (1 - y_weight)
                            + top_right[channel] * x_weight * (1 - y_weight)
                            + bottom_left[channel] * (1 - x_weight) * y_weight
                            + bottom_right[channel] * x_weight * y_weight
                        )
                    )
                    for channel in range(3)
                )
            )
        result.append(row)

    return result


def make_square_asset(pixels: list[list[tuple[int, int, int]]]) -> list[list[tuple[int, int, int]]]:
    source_height = len(pixels)
    source_width = len(pixels[0])
    max_inner = OUTPUT_SIZE - 2 * INNER_PADDING
    scale = min(max_inner / source_width, max_inner / source_height)

    resized_width = max(1, round(source_width * scale))
    resized_height = max(1, round(source_height * scale))
    resized = resize_bilinear(pixels, resized_width, resized_height)

    canvas = [[(255, 255, 255) for _ in range(OUTPUT_SIZE)] for _ in range(OUTPUT_SIZE)]
    offset_x = (OUTPUT_SIZE - resized_width) // 2
    offset_y = (OUTPUT_SIZE - resized_height) // 2

    for y, row in enumerate(resized):
        for x, pixel in enumerate(row):
            canvas[offset_y + y][offset_x + x] = pixel

    return canvas


def main() -> None:
    if not SOURCE_PATH.exists():
        raise FileNotFoundError(f"Source image not found: {SOURCE_PATH}")

    _, _, rows = read_png(SOURCE_PATH)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for name, box in INSTRUMENT_BOXES:
        cropped = crop(rows, box)
        asset = make_square_asset(cropped)
        write_png(OUTPUT_DIR / f"{name}.png", asset)
        print(f"created {OUTPUT_DIR / f'{name}.png'}")


if __name__ == "__main__":
    main()
