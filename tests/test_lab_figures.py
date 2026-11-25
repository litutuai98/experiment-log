import base64
import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'core'))

from deskcore import report_protocol
from deskcore.engine import ManagedConnection, api_endpoint
from desk_lab import backend as E
from desk_lab import figures as F

DAY = '2026-11-25'
PNG = b'\x89PNG\r\n\x1a\n' + b'\x00' * 64
JPEG = b'\xff\xd8\xff\xe0' + b'\x00' * 64


class FigureTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        self.db = root / 'lab.db'
        self.settings = {'base_url': 'https://api.deepseek.com', 'api_key': 'main-key', 'model': 'deepseek-v4-pro',
                         'ai_engine': 'api', 'vision_base_url': '', 'vision_model': '', 'vision_api_key': '', 'vision_protocol': 'auto'}
        self.calls = []
        self.reply = {'kind': 'figure', 'title': '模型结构', 'caption': '编码器接解码器', 'columns': [], 'rows': [], 'notes': ''}

        def conn():
            c = sqlite3.connect(self.db, factory=ManagedConnection)
            c.row_factory = sqlite3.Row
            return c

        def fetch(url, payload=None, headers=None, limit=0):
            self.calls.append({'url': url, 'payload': payload, 'headers': headers})
            if 'anthropic' in url or url.endswith('/messages'):
                return json.dumps({'content': [{'type': 'text', 'text': json.dumps(self.reply, ensure_ascii=False)}], 'usage': {}}).encode()
            return json.dumps({'choices': [{'message': {'content': json.dumps(self.reply, ensure_ascii=False)}}], 'usage': {'total_tokens': 9}}).encode()

        self.desk = SimpleNamespace(conn=conn, DATA=root, fetch=fetch, api_endpoint=api_endpoint,
                                    REPORT_PROTOCOL=report_protocol, settings=lambda **_: dict(self.settings),
                                    ai_ready=lambda cfg: True, save_settings=self.save_settings)
        E.init(self.desk)
        F.init(self.desk)
        out = E.save(self.desk, {'action': 'save', 'day': DAY, 'experiment': {'title': 'HEAT 流式识别'}})
        self.exp = out['experiments'][0]['id']

    def save_settings(self, values):
        for k, v in values.items():
            if k in self.settings:
                self.settings[k] = v
        if values.get('clear_vision_api_key'):
            self.settings['vision_api_key'] = ''

    def tearDown(self):
        self.tmp.cleanup()

    def upload(self, raw=PNG, mode='auto', **extra):
        return F.upload(self.desk, {'experiment_id': self.exp, 'day': DAY, 'mode': mode, 'filename': 'shot.png',
                                    'data': base64.b64encode(raw).decode(), **extra})

    def figures(self):
        return E.read(self.desk, DAY)['experiments'][0]['figures']

    def use_vision(self, **cfg):
        self.settings.update(vision_base_url='https://dashscope.aliyuncs.com/compatible-mode/v1',
                             vision_model='qwen-vl-max', vision_api_key='vision-key', **cfg)

    def test_without_vision_model_image_is_saved_as_image(self):
        out = self.upload()
        self.assertEqual(out['kind'], 'image')
        self.assertIn('视觉模型', out['notice'])
        figs = self.figures()
        self.assertEqual(len(figs), 1)
        self.assertEqual(figs[0]['title'], 'shot')
        path, mime = F.image_file(self.desk, figs[0]['id'])
        self.assertEqual(path.read_bytes(), PNG)
        self.assertEqual(mime, 'image/png')
        self.assertEqual(self.calls, [], 'no network call without a vision model')

    def test_deepseek_flash_reads_images_without_extra_setup(self):
        self.settings['model'] = 'deepseek-flash'
        self.reply = {'kind': 'table', 'title': 't', 'caption': '', 'notes': '', 'columns': ['a'], 'rows': [['1']]}
        out = self.upload()
        self.assertEqual(out['kind'], 'table')
        call = self.calls[0]
        self.assertEqual(call['url'], 'https://api.deepseek.com/chat/completions')
        self.assertEqual(call['headers']['Authorization'], 'Bearer main-key')
        self.assertEqual(call['payload']['model'], 'deepseek-flash')
        self.assertTrue(F.vision_status(self.desk)['ready'])

    def test_text_only_main_model_is_not_sent_images(self):
        self.settings['model'] = 'deepseek-v4-pro'
        self.assertFalse(F.vision_status(self.desk)['ready'])

    def test_blank_vision_address_reuses_main_service(self):
        self.settings['vision_model'] = 'qwen-vl-max'
        self.settings['base_url'] = 'https://api.deepseek.com'
        out = self.upload()
        self.assertEqual(len(self.calls), 1, 'vision falls back to the main service only when explicitly given a model')
        self.assertEqual(self.calls[0]['headers']['Authorization'], 'Bearer main-key')
        self.assertTrue(self.calls[0]['url'].startswith('https://api.deepseek.com'))
        self.assertEqual(out['kind'], 'image')

    def test_table_screenshot_becomes_structured_table(self):
        self.use_vision()
        self.reply = {'kind': 'table', 'title': 'dev 集 WER', 'caption': '三个变体对比', 'notes': '',
                      'columns': ['变体', 'WER', 'CER'], 'rows': [['baseline', '13.1', '8.2'], ['lr=3e-4', '12.8']]}
        out = self.upload(raw=JPEG)
        self.assertEqual(out['kind'], 'table')
        fig = self.figures()[0]
        self.assertEqual(fig['table']['columns'], ['变体', 'WER', 'CER'])
        self.assertEqual(fig['table']['rows'][1], ['lr=3e-4', '12.8', ''], 'short rows are padded, numbers untouched')
        self.assertEqual(fig['title'], 'dev 集 WER')
        call = self.calls[0]
        self.assertEqual(call['url'], 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions')
        self.assertEqual(call['headers']['Authorization'], 'Bearer vision-key')
        image = call['payload']['messages'][1]['content'][1]['image_url']['url']
        self.assertTrue(image.startswith('data:image/jpeg;base64,'))
        self.assertIn('HEAT 流式识别', call['payload']['messages'][1]['content'][0]['text'])

    def test_model_diagram_stays_an_image_by_default(self):
        self.use_vision()
        out = self.upload()
        self.assertEqual(out['kind'], 'image')
        fig = self.figures()[0]
        self.assertIsNone(fig['table'])
        self.assertEqual(fig['caption'], '编码器接解码器')
        self.assertEqual(fig['analysis']['decision'], 'figure')

    def test_keep_as_image_skips_the_model(self):
        self.use_vision()
        out = self.upload(mode='image')
        self.assertEqual(out['kind'], 'image')
        self.assertEqual(self.calls, [])

    def test_vision_failure_keeps_the_image(self):
        self.use_vision()
        self.desk.fetch = lambda *a, **k: (_ for _ in ()).throw(ValueError('HTTP 401'))
        out = self.upload()
        self.assertEqual(out['kind'], 'image')
        self.assertIn('图片已保存', out['notice'])
        self.assertEqual(len(self.figures()), 1)

    def test_anthropic_protocol(self):
        self.settings.update(vision_base_url='https://api.anthropic.com', vision_model='claude-sonnet', vision_api_key='ak')
        self.upload()
        call = self.calls[0]
        self.assertEqual(call['url'], 'https://api.anthropic.com/v1/messages')
        self.assertEqual(call['headers']['x-api-key'], 'ak')
        self.assertEqual(call['payload']['messages'][0]['content'][0]['source']['media_type'], 'image/png')

    def test_convert_later_edit_and_append_to_results(self):
        out = self.upload()
        fid = out['figure_id']
        self.use_vision()
        self.reply = {'kind': 'table', 'title': '', 'caption': '', 'notes': '', 'columns': ['a|b', 'WER'], 'rows': [['x', '1.0']]}
        self.assertEqual(F.analyze(self.desk, {'id': fid})['kind'], 'table')
        fig = self.figures()[0]
        self.assertEqual(fig['title'], 'shot', 'existing title is kept')
        F.update(self.desk, {'id': fid, 'revision': fig['revision'], 'title': 'dev WER',
                             'table': {'columns': ['a|b', 'WER'], 'rows': [['x', '0.9']]}})
        F.to_results(self.desk, {'id': fid, 'day': DAY})
        results = E.read(self.desk, DAY)['experiments'][0]['results']
        self.assertIn('dev WER', results)
        self.assertIn('| a\\|b | WER |', results)
        self.assertIn('| x | 0.9 |', results)
        F.update(self.desk, {'id': fid, 'kind': 'image'})
        self.assertEqual(self.figures()[0]['kind'], 'image')
        self.assertIsNotNone(self.figures()[0]['table'], 'switching to image keeps the transcription')

    def test_rejects_non_images_and_oversize(self):
        with self.assertRaises(ValueError):
            self.upload(raw=b'PK\x03\x04 a zip file')
        with self.assertRaises(ValueError):
            self.upload(raw=b'\x89PNG\r\n\x1a\n' + b'0' * (F.MAX_BYTES + 1))
        with self.assertRaises(ValueError):
            F.upload(self.desk, {'experiment_id': 'missing', 'day': DAY, 'data': base64.b64encode(PNG).decode()})

    def test_delete_figure_and_experiment_remove_files(self):
        fid = self.upload()['figure_id']
        path, _ = F.image_file(self.desk, fid)
        F.delete(self.desk, {'id': fid})
        self.assertFalse(path.exists())
        fid = self.upload()['figure_id']
        path, _ = F.image_file(self.desk, fid)
        exp = E.read(self.desk, DAY)['experiments'][0]
        E.save(self.desk, {'action': 'delete', 'id': self.exp, 'revision': exp['revision'], 'day': DAY})
        self.assertFalse(path.exists())
        self.assertEqual(F.image_file(self.desk, fid), (None, None))

    def test_unassigned_upload_then_move_into_experiment(self):
        out = F.upload(self.desk, {'experiment_id': '', 'day': DAY, 'filename': 'a.png', 'data': base64.b64encode(PNG).decode()})
        state = E.read(self.desk, DAY)
        self.assertEqual([f['id'] for f in state['loose_figures']], [out['figure_id']])
        self.assertEqual(state['experiments'][0]['figures'], [])
        with self.assertRaises(ValueError):
            F.to_results(self.desk, {'id': out['figure_id'], 'day': DAY})
        F.move(self.desk, {'id': out['figure_id'], 'experiment_id': self.exp})
        state = E.read(self.desk, DAY)
        self.assertEqual(state['loose_figures'], [])
        self.assertEqual(len(state['experiments'][0]['figures']), 1)
        with self.assertRaises(ValueError):
            F.move(self.desk, {'id': out['figure_id'], 'experiment_id': 'missing'})

    def test_pdf_is_kept_as_attachment_without_vision_call(self):
        self.use_vision()
        pdf = b'%PDF-1.7\n' + b'0' * 100
        out = self.upload(raw=pdf, filename='ablation.pdf')
        self.assertEqual(out['kind'], 'file')
        self.assertEqual(self.calls, [], 'PDFs are never sent to the vision model')
        fig = self.figures()[0]
        self.assertEqual(fig['mime'], 'application/pdf')
        self.assertEqual(fig['title'], 'ablation')
        path, mime = F.image_file(self.desk, fig['id'])
        self.assertEqual((path.read_bytes(), mime), (pdf, 'application/pdf'))
        with self.assertRaises(ValueError):
            F.analyze(self.desk, {'id': fig['id']})
        with self.assertRaises(ValueError):
            F.update(self.desk, {'id': fig['id'], 'kind': 'image'})
        with self.assertRaises(ValueError):
            self.upload(raw=b'%PDF-1.7\n' + b'0' * (F.MAX_PDF_BYTES + 1))

    def test_images_inside_text_fields_belong_to_the_new_experiment(self):
        up = F.upload(self.desk, {'experiment_id': '', 'inline': True, 'field': 'model', 'day': DAY,
                                  'filename': 'arch.png', 'data': base64.b64encode(PNG).decode()})
        self.assertTrue(up['url'].startswith('/api/experiments/figure?id=' + up['figure_id']))
        self.assertEqual(E.read(self.desk, DAY)['loose_figures'], [], 'unsaved inline images are not listed as loose')
        text = '编码器结构如下：\n![整体结构，左边是编码器](figure:%s)\n右边接 LLM。' % up['figure_id']
        out = E.save(self.desk, {'action': 'save', 'day': DAY, 'experiment': {'title': '新实验', 'model': text}})
        exp = next(e for e in out['experiments'] if e['id'] == out['saved_id'])
        self.assertEqual(exp['model'], text, 'text and image marker are stored together')
        fig = exp['figures'][0]
        self.assertEqual((fig['inline'], fig['field'], fig['caption']), (True, 'model', '整体结构，左边是编码器'))
        # removing the marker later keeps the image as a normal attachment
        E.save(self.desk, {'action': 'save', 'id': exp['id'], 'revision': exp['revision'], 'day': DAY,
                           'experiment': {'title': '新实验', 'model': '只剩文字'}})
        exp = next(e for e in E.read(self.desk, DAY)['experiments'] if e['id'] == out['saved_id'])
        self.assertFalse(exp['figures'][0]['inline'])

    def test_inline_rules(self):
        with self.assertRaises(ValueError):
            F.upload(self.desk, {'experiment_id': self.exp, 'inline': True, 'field': 'title', 'data': base64.b64encode(PNG).decode()})
        with self.assertRaises(ValueError):
            F.upload(self.desk, {'experiment_id': self.exp, 'inline': True, 'field': 'results', 'data': base64.b64encode(b'%PDF-1.4 x').decode()})
        self.use_vision()
        F.upload(self.desk, {'experiment_id': self.exp, 'inline': True, 'field': 'results', 'mode': 'table', 'data': base64.b64encode(PNG).decode()})
        self.assertEqual(self.calls, [], 'inline images are kept as images, no model call')

    def test_image_file_rejects_path_tricks(self):
        self.assertEqual(F.image_file(self.desk, '../../settings'), (None, None))

    def test_changing_vision_service_requires_new_key(self):
        self.use_vision()
        with self.assertRaises(ValueError):
            F.save_vision(self.desk, {'vision_base_url': 'https://other.example.com/v1'})
        status = F.save_vision(self.desk, {'vision_base_url': 'https://other.example.com/v1', 'vision_api_key': 'k2'})
        self.assertTrue(status['ready'])
        self.assertNotIn('vision_api_key', status)


if __name__ == '__main__':
    unittest.main()
