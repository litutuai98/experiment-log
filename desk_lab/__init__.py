"""实验记录子项目：实验、变体、关联、论文、图表与日报。"""
from deskcore import engine, hooks
from . import backend, figures

NAME = '实验记录'
PROJECT_ID = 'lab'
FIGURE_ACTIONS = {'upload': figures.upload, 'analyze': figures.analyze, 'update': figures.update,
                  'delete': figures.delete, 'to-results': figures.to_results, 'move': figures.move}


def init(desk):
    backend.init(desk)
    figures.init(desk)


def get_experiments(handler, q):
    return backend.read(engine.enrichment_desk(), q.get('day', [''])[0])


def post_experiments(handler, v):
    return backend.save(engine.enrichment_desk(), v)


def post_organize(handler, v):
    return backend.organize(engine.enrichment_desk(), v)


def post_report(handler, v):
    return backend.report_draft(engine.enrichment_desk(), v)


def post_figure(handler, v):
    desk = engine.enrichment_desk()
    action = FIGURE_ACTIONS.get(v.get('action'))
    if not action:
        raise ValueError('操作无效')
    result = action(desk, v)
    return {**backend.read(desk, v.get('day')), 'figure_result': result}


def get_figure(handler, q):
    path, mime = figures.image_file(engine.enrichment_desk(), q.get('id', [''])[0])
    if not path:
        return {'error': '图片不存在'}, 404
    raw = path.read_bytes()
    handler.send_response(200)
    handler.send_header('Content-Type', mime)
    if mime == 'application/pdf':
        handler.send_header('Content-Disposition', 'inline')
    handler.send_header('Content-Length', str(len(raw)))
    handler.send_header('Cache-Control', 'private, max-age=86400')
    handler.send_header('X-Content-Type-Options', 'nosniff')
    handler.end_headers()
    handler.wfile.write(raw)
    return hooks.RAW


def post_vision(handler, v):
    return figures.save_vision(engine.enrichment_desk(), v)


hooks.INIT.append(init)
hooks.register_get('/api/experiments', get_experiments, PROJECT_ID)
hooks.register_get('/api/experiments/figure', get_figure, PROJECT_ID)
hooks.register_post('/api/experiments', post_experiments, PROJECT_ID)
hooks.register_post('/api/experiments/organize', post_organize, PROJECT_ID)
hooks.register_post('/api/experiments/report', post_report, PROJECT_ID)
hooks.register_post('/api/experiments/figure', post_figure, PROJECT_ID)
hooks.register_post('/api/experiments/vision', post_vision, PROJECT_ID)
