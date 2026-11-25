#!/usr/bin/env python3
"""实验记录：本地运行的实验笔记本（实验、变体、关联、论文与日报）。

    python3 server.py        # http://127.0.0.1:8768

数据保存在本目录 data/ 下，首次运行自动创建；也可以在界面上直接使用。
"""
import os
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
os.environ.setdefault('KNOWLEDGE_ROOT', str(PROJECT_ROOT))
sys.path[:0] = [str(PROJECT_ROOT / 'core'), str(PROJECT_ROOT)]

from deskcore import runtime  # noqa: E402
from deskcore.engine import ManagedConnection  # noqa: E402,F401  供测试直接复用


def main():
    runtime.load_projects([('lab', 'desk_lab', '实验记录', PROJECT_ROOT / 'static')])
    runtime.serve(port=int(os.environ.get('PORT', '8768')),
                  index_files={'/': PROJECT_ROOT / 'static/index.html'},
                  project_dirs=[PROJECT_ROOT / 'static'])


if __name__ == '__main__':
    main()
