"""实验记录子项目：实验、变体、关联、论文与日报。"""
from deskcore import engine, hooks
from . import backend

NAME = '实验记录'
PROJECT_ID = 'lab'


def init(desk):
    backend.init(desk)


def get_experiments(handler, q):
    return backend.read(engine.enrichment_desk(), q.get('day', [''])[0])


def post_experiments(handler, v):
    return backend.save(engine.enrichment_desk(), v)


def post_organize(handler, v):
    return backend.organize(engine.enrichment_desk(), v)


def post_report(handler, v):
    return backend.report_draft(engine.enrichment_desk(), v)


hooks.INIT.append(init)
hooks.register_get('/api/experiments', get_experiments, PROJECT_ID)
hooks.register_post('/api/experiments', post_experiments, PROJECT_ID)
hooks.register_post('/api/experiments/organize', post_organize, PROJECT_ID)
hooks.register_post('/api/experiments/report', post_report, PROJECT_ID)
