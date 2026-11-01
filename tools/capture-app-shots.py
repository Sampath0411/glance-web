"""Regenerate the app screenshots in public/assets/app from the Glance source tree.

Runs the real desktop window with a throwaway copy of the package and demo data,
so no enrolled identity, credential name, or local path from the maintainer's PC
appears in the images.

    python tools\\capture-app-shots.py [--repo C:\\path\\to\\glance-win]

The window is shown with WA_DontShowOnScreen, so nothing flashes on screen, and
the images are captured at 2x for crisp rendering on the site.
"""

from __future__ import annotations

import argparse
import json
import os
import random
import shutil
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
OUT = HERE / "public" / "assets" / "app"

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--repo", type=Path, default=Path(r"C:\Users\sampa\glance-win"))
args = parser.parse_args()
repo = args.repo.resolve()

work = Path(tempfile.mkdtemp(prefix="glance-shots-"))
app_root = work / "app"
shutil.copytree(repo / "glance", app_root / "glance", ignore=shutil.ignore_patterns("__pycache__"))
shutil.copytree(repo / "assets", app_root / "assets")
(app_root / "data").mkdir(parents=True)
(app_root / "models" / "buffalo_s").mkdir(parents=True)
for name in ("det_500m.onnx", "w600k_mbf.onnx"):
    (app_root / "models" / "buffalo_s" / name).write_bytes(b"demo")
(app_root / "data" / "agent_config.json").write_text(
    json.dumps({"threshold": 0.6, "timeout": 90, "identity": "Alex", "camera": 0}, indent=2),
    encoding="utf-8",
)
rng = random.Random(11)
(app_root / "data" / "identities.json").write_text(
    json.dumps({
        "version": 1,
        "model": "arcface-w600k_mbf-v1",
        "identities": [
            {
                "name": name,
                "samples": [[round(rng.uniform(-1, 1), 4) for _ in range(512)] for _ in range(samples)],
            }
            for name, samples in (("Alex", 8), ("Priya", 6))
        ],
    }),
    encoding="utf-8",
)

OUT.mkdir(parents=True, exist_ok=True)
os.environ["QT_SCALE_FACTOR"] = "2"
sys.path.insert(0, str(app_root))

from PySide6.QtCore import Qt  # noqa: E402
from PySide6.QtWidgets import QApplication, QLabel  # noqa: E402

from glance.desktop.main import MainWindow  # noqa: E402
from glance.desktop.models_setup import ModelsDialog  # noqa: E402
from glance.desktop.theme import ACCENT, resolve_theme  # noqa: E402


def pump(app: QApplication, seconds: float) -> None:
    end = time.time() + seconds
    while time.time() < end:
        app.processEvents()
        time.sleep(0.02)


def save(widget, filename: str) -> None:
    pixmap = widget.grab()
    target = OUT / filename
    pixmap.save(str(target))
    print(f"{filename}: {pixmap.width()}x{pixmap.height()} -> {target.stat().st_size} bytes")


app = QApplication(sys.argv[:1])
# The real entry point applies the theme stylesheet; without it the window only
# shows default Qt widgets and the shots do not match the shipped app.
app.setStyleSheet(resolve_theme("dark").stylesheet)
window = MainWindow()
window.setAttribute(Qt.WA_DontShowOnScreen, True)
window.resize(1060, 780)
window.show()
pump(app, 2.5)

# The sandbox has no agent task or stored credential, so the snapshot labels are
# filled in with the state an enrolled, configured account shows.
d = window.dashboard
d.status_dot.set_color(ACCENT)
d.status_title.setText("Protection on")
d.status_detail.setText("Waiting for a lock · Alex · threshold 0.60")
d.pause_button.setText("Pause protection")
d.autostart.setEnabled(True)
d.autostart.setChecked(True)
d.identity_card[1].setText("Alex")
d.identity_card[2].setText("8 samples")
d.credential_card[1].setText("Stored")
d.credential_card[2].setText("alex")
d.unlock_card[1].setText("09:41")
d.unlock_card[2].setText("Alex · most recent grant")
pump(app, 0.4)

for index, filename in ((0, "overview.png"), (4, "recognition.png"), (5, "about.png")):
    window._navigate(index)
    pump(app, 1.0)
    # The sandbox has no agent task, so the status pill would read "Paused".
    window.nav.set_status("Protected", ACCENT)
    save(window, filename)

# Word-wrapped labels only report their final height once a width exists, so size
# the dialog to its layout rather than to sizeHint().
dialog = ModelsDialog(None)
dialog.setAttribute(Qt.WA_DontShowOnScreen, True)
dialog.setFixedWidth(560)
dialog.show()
pump(app, 0.6)
for label in dialog.findChildren(QLabel):
    if label.wordWrap() and label.width() > 0:
        label.setMinimumHeight(label.heightForWidth(label.width()))
dialog.layout().activate()
dialog.setFixedHeight(dialog.layout().heightForWidth(560))
dialog.layout().activate()
pump(app, 0.3)
save(dialog, "models-dialog.png")

shutil.rmtree(work, ignore_errors=True)
print("saved to", OUT)
