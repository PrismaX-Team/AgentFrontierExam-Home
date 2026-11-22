"""Draw the five original, illustrative task plates. The website serves the saved WebP files."""

from pathlib import Path

import numpy as np
from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.colors import to_rgb
from matplotlib.figure import Figure
from matplotlib.patches import Rectangle
from PIL import Image
from scipy.interpolate import make_interp_spline


OUTPUT = Path(__file__).resolve().parents[1] / "src/assets/plates"
WIDTH, HEIGHT = 720, 450


def plate(top, bottom):
    figure = Figure(figsize=(7.2, 4.5), dpi=200)
    FigureCanvasAgg(figure)
    axes = figure.add_axes((0, 0, 1, 1))
    y, x = np.mgrid[0:HEIGHT, 0:WIDTH]
    fade = (0.72 * y / HEIGHT + 0.28 * x / WIDTH)[..., None]
    grain = np.random.default_rng(72).normal(0, 0.003, size=(HEIGHT, WIDTH, 1))
    color = np.array(to_rgb(top)) * (1 - fade) + np.array(to_rgb(bottom)) * fade
    axes.imshow(np.clip(color + grain, 0, 1), extent=(0, WIDTH, HEIGHT, 0), zorder=-5)
    axes.set(xlim=(0, WIDTH), ylim=(HEIGHT, 0), aspect="equal")
    axes.set_axis_off()
    return figure, axes


def save(figure, name):
    figure.canvas.draw()
    image = Image.fromarray(np.asarray(figure.canvas.buffer_rgba()), "RGBA").convert("RGB")
    image.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS).save(
        OUTPUT / (name + ".webp"), quality=90, method=6
    )


def smooth(points):
    points = np.array(points)
    steps = np.r_[0, np.cumsum(np.linalg.norm(np.diff(points, axis=0), axis=1))]
    return make_interp_spline(steps, points, k=2)(np.linspace(0, steps[-1], 180)).T


def text(axes, x, y, label, color, size=15, **options):
    axes.text(x, y, label, color=color, fontsize=size, va="center", **options)


def fine_tuning():
    figure, ax = plate("#f3e8cf", "#d8c8a9")
    ink, line, accent, soft = "#423f37", "#b7aa93", "#a25437", "#eee2c7"
    rows = [102, 224, 349]
    for y in (42, 164, 286, 409):
        ax.plot((48, 672), (y, y), color=line, lw=.9)
    for y, name in zip(rows, ["Prompt tuning", "Adapters", "LoRA"]):
        text(ax, 54, y, name, ink, 19, family="DejaVu Serif")

    # Trainable prompt embeddings precede the input sequence.
    for i in range(9):
        x = 328 + i * 33
        ax.add_patch(Rectangle((x, 82), 24, 41, facecolor=accent if i < 3 else soft,
                               edgecolor=accent if i < 3 else line, lw=1.05))
    # A bottleneck adapter contracts the hidden representation before restoring it.
    outer, narrow = np.array([-30, -10, 10, 30]) + rows[1], np.array([-11, 11]) + rows[1]
    for y in outer:
        for inner in narrow:
            ax.plot((367, 469, 571), (y, inner, y), color=line, lw=.9)
    for x in (367, 571):
        ax.scatter(np.full(4, x), outer, s=33, color=soft, edgecolor=ink, lw=1, zorder=3)
    ax.scatter([469, 469], narrow, s=39, color=accent, zorder=3)

    # A low-rank update adds the product of two smaller trainable matrices to frozen weights.
    for x, y, columns, lines, trained in [
        (332, 317, 6, 6, False), (476, 317, 2, 6, True), (540, 337, 6, 2, True)
    ]:
        for col in range(columns):
            for row in range(lines):
                ax.add_patch(Rectangle((x + col * 11, y + row * 11), 9.6, 9.6,
                                       color=accent if trained else "#998f79", linewidth=0))
    text(ax, 433, 349, "+", ink, 22, ha="center")
    text(ax, 521, 349, "×", ink, 17, ha="center")
    save(figure, "fine-tuning-methods")


def terrain(axes, color, count=25):
    y, x = np.mgrid[-40:491:5, -40:761:5]
    height = (0.24 * y - 0.08 * x + 30 * np.sin(x / 117 + y / 87)
              + 17 * np.sin(x / 76 - y / 108) + 8 * np.cos(x / 48 + y / 63))
    axes.contour(x, y, height, levels=count, colors=color, linewidths=.55, alpha=.7)


def river_corridor():
    figure, ax = plate("#ebe8cc", "#c2d1ba")
    terrain(ax, "#a8b49b")
    paths = [
        smooth([(-50, 467), (99, 368), (177, 352), (242, 274), (268, 247), (369, 230),
                (420, 152), (496, 138), (562, 119), (647, 42), (747, -30)]),
        smooth([(-45, 42), (94, 82), (147, 162), (225, 184), (268, 247)]),
        smooth([(397, 488), (392, 396), (347, 323), (369, 230)]),
        smooth([(748, 284), (669, 234), (608, 225), (552, 189), (496, 138)]),
        smooth([(253, -35), (280, 32), (351, 85), (384, 126), (420, 152)]),
    ]
    # Painting each width across all streams first merges the buffered confluences.
    for width, color in [(31, "#739785"), (29, "#a6c5ad"), (2, "#345f5d")]:
        for x, y in paths:
            ax.plot(x, y, color=color, lw=width, solid_capstyle="round")
    save(figure, "river-corridor")


def cosmic_rays():
    figure, ax = plate("#233b50", "#1c2938")
    grid, pale, observed, alternative = "#577382", "#dce2cf", "#a3d0c4", "#e2ae77"
    left, top, bottom, right = 100, 65, 358, 646
    # Both plotted coordinates are logarithmic, so a power law traces a straight line.
    for decade in (left, left + 182, left + 364):
        for digit in range(1, 10):
            x = decade + 182 * np.log10(digit)
            ax.plot((x, x), (top, bottom), color=grid, lw=.6, alpha=.47 if digit == 1 else .19)
    for y in (85, 143, 201, 259, 317):
        ax.plot((left, right), (y, y), color=grid, lw=.65, alpha=.45)
    ax.plot((left, left, right), (top, bottom, bottom), color=pale, lw=1.1)
    ax.plot((120, 628), (111, 263), color=observed, lw=2.4)
    ax.plot((120, 628), (97, 322), color=alternative, lw=2.3, ls=(0, (6, 3)))
    x = np.array([145, 187, 236, 287, 339, 400, 471, 544, 615])
    y = np.array([117, 128, 151, 170, 188, 214, 236, 267, 291])
    err = np.array([9, 10, 11, 12, 14, 16, 17, 19, 22])
    ax.errorbar(x, y, yerr=err, fmt="o", ms=6.5, mfc="#243a49", mec=pale, mew=1.35,
                ecolor=pale, elinewidth=1.1, capsize=3, zorder=4)
    text(ax, 52, 203, "B / C", pale, rotation=90, ha="center", family="DejaVu Serif")
    text(ax, 375, 399, "Rigidity", pale, ha="center", family="DejaVu Serif")
    save(figure, "cosmic-ray-models")


def recovery():
    figure, ax = plate("#dce4d2", "#b1c5b6")
    dark, light, ochre, grid = "#315651", "#e4ebdb", "#c8a674", "#839b8a"
    x = np.linspace(110, 614, 180)
    t = np.linspace(0, 1, len(x))
    fast = 311 - 177 * (1 - np.exp(-3 * t)) / (1 - np.exp(-3))
    slow = 311 - 177 * (0.35 * t + 0.65 * t**1.8)
    ref = 93
    ax.fill_between(x, ref, fast, color=ochre, alpha=.57)
    for y in (159, 222, 285):
        ax.plot((88, 646), (y, y), color=grid, alpha=.45, lw=.65)
    ax.plot((88, 88, 646), (64, 350, 350), color=dark, lw=1)
    ax.plot((88, 645), (ref, ref), color=dark, lw=1.5)
    ax.plot(x, fast, color=dark, lw=2.7)
    ax.plot(x, slow, color="#5d7d72", lw=2, ls=(0, (5, 4)))
    ax.scatter([x[0], x[-1]], [fast[0], fast[-1]], s=72, edgecolor=dark,
               facecolor=light, lw=1.4, zorder=4)
    text(ax, 626, 68, "Reference", dark, 13, ha="right", family="DejaVu Serif")
    text(ax, 49, 203, "Condition", dark, 14, rotation=90, ha="center", family="DejaVu Serif")
    text(ax, 367, 395, "Time since disturbance", dark, 15, ha="center", family="DejaVu Serif")
    save(figure, "ecological-recovery")


if __name__ == "__main__":
    fine_tuning()
    river_corridor()
    cosmic_rays()
    recovery()
