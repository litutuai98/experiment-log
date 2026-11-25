import json
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'core'))
import server
from desk_lab import backend as E

DAY = '2026-11-24'


class ExperimentTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / 'lab.db'

        def conn():
            c = sqlite3.connect(self.db, factory=server.ManagedConnection)
            c.row_factory = sqlite3.Row
            return c
        self.desk = SimpleNamespace(conn=conn)
        E.init(self.desk)
        E.init(self.desk)

    def tearDown(self):
        self.tmp.cleanup()

    def create(self, title, **extra):
        out = E.save(self.desk, {'action': 'save', 'day': DAY, 'experiment': {'title': title, **extra}})
        return next(e for e in out['experiments'] if e['title'] == title)

    def ai(self, payload):
        self.desk.settings = lambda **_: {'model': 'm'}
        self.desk.ai_ready = lambda _: True
        self.desk.REPORT_PROTOCOL = SimpleNamespace(decode=json.loads)
        body = {'choices': [{'finish_reason': 'stop', 'message': {'content': json.dumps(payload, ensure_ascii=False)}}]}
        self.desk.ai_request = Mock(return_value=json.dumps(body))

    def test_create_edit_and_stale_revision(self):
        e = self.create('HEAT 流式识别', directory='/exp/heat', data='AMI dev', model='Whisper-large')
        self.assertEqual((e['directory'], e['status'], e['revision']), ('/exp/heat', 'active', 1))
        out = E.save(self.desk, {'action': 'save', 'day': DAY, 'id': e['id'], 'revision': 1,
                                 'experiment': {**e, 'results': 'WER 12.3'}})
        self.assertEqual(out['experiments'][0]['results'], 'WER 12.3')
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'save', 'day': DAY, 'id': e['id'], 'revision': 1, 'experiment': e})
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'save', 'day': DAY, 'experiment': {'title': '  '}})
        done = E.save(self.desk, {'action': 'toggle-done', 'day': DAY, 'id': e['id'], 'revision': 2})['experiments'][0]
        self.assertEqual(done['status'], 'done')

    def test_variants_keep_failed_attempts(self):
        e = self.create('HEAT')
        out = E.save(self.desk, {'action': 'variant-save', 'day': DAY, 'experiment_id': e['id'],
                                 'variant': {'name': 'lr=1e-4', 'verdict': 'ineffective', 'result': 'WER 13.1',
                                             'takeaway': '学习率太小收敛慢'}})
        v = out['experiments'][0]['variants'][0]
        self.assertEqual((v['verdict'], v['takeaway']), ('ineffective', '学习率太小收敛慢'))
        out = E.save(self.desk, {'action': 'variant-save', 'day': DAY, 'experiment_id': e['id'], 'id': v['id'],
                                 'variant': {**v, 'verdict': 'mixed'}})
        self.assertEqual(out['experiments'][0]['variants'][0]['verdict'], 'mixed')
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'variant-save', 'day': DAY, 'experiment_id': e['id'],
                               'variant': {'name': 'x', 'verdict': 'great'}})
        out = E.save(self.desk, {'action': 'variant-delete', 'day': DAY, 'id': v['id']})
        self.assertEqual(out['experiments'][0]['variants'], [])

    def test_links_show_on_both_sides_and_reject_duplicates(self):
        a, b = self.create('A'), self.create('B')
        out = E.save(self.desk, {'action': 'link-add', 'day': DAY, 'src': a['id'], 'dst': b['id'],
                                 'kind': 'builds_on', 'note': '沿用前端'})
        by = {e['id']: e for e in out['experiments']}
        self.assertEqual((by[a['id']]['links'][0]['direction'], by[b['id']]['links'][0]['direction']), ('out', 'in'))
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'link-add', 'day': DAY, 'src': b['id'], 'dst': a['id'], 'kind': 'builds_on'})
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'link-add', 'day': DAY, 'src': a['id'], 'dst': a['id'], 'kind': 'related'})
        out = E.save(self.desk, {'action': 'link-delete', 'day': DAY, 'id': by[a['id']]['links'][0]['id']})
        self.assertTrue(all(not e['links'] for e in out['experiments']))

    def test_logs_and_delete_keeps_diary(self):
        e = self.create('HEAT')
        log = {'action': 'log', 'day': DAY, 'experiment_id': e['id'], 'content': '跑完 dev 集', 'batch': 'batch-0001'}
        self.assertEqual(len(E.save(self.desk, log)['logs']), 1)
        out = E.save(self.desk, log)
        self.assertEqual(len(out['logs']), 1, 'same batch must not duplicate')
        fresh = next(x for x in out['experiments'] if x['id'] == e['id'])
        out = E.save(self.desk, {'action': 'delete', 'day': DAY, 'id': e['id'], 'revision': fresh['revision']})
        self.assertEqual(out['experiments'], [])
        self.assertEqual((out['logs'][0]['experiment_id'], out['logs'][0]['content']), ('', '【HEAT】跑完 dev 集'))

    def test_apply_merges_fields_creates_experiments_and_variants(self):
        e = self.create('HEAT', directory='/exp/heat', results='WER 12.3')
        entries = [
            {'experiment_id': e['id'], 'log': '换了学习率', 'results': 'WER 11.9', 'directory': '/exp/heat',
             'variant_name': 'lr=3e-4', 'variant_verdict': 'effective', 'variant_result': 'WER 11.9'},
            {'experiment_id': '', 'new_title': '说话人归属', 'log': '搭了基线', 'paths': '/ckpt/a.pt'},
            {'experiment_id': 'not-real', 'new_title': '', 'log': '开组会'}]
        out = E.save(self.desk, {'action': 'apply', 'day': DAY, 'entries': entries, 'batch': 'batch-0002'})
        by = {x['title']: x for x in out['experiments']}
        self.assertEqual(by['HEAT']['results'], 'WER 12.3\n（11-24）WER 11.9')
        self.assertEqual(by['HEAT']['directory'], '/exp/heat')
        self.assertEqual(by['HEAT']['variants'][0]['verdict'], 'effective')
        self.assertEqual(by['说话人归属']['paths'], '/ckpt/a.pt')
        self.assertEqual(sorted(l['experiment_id'] == '' for l in out['logs']), [False, False, True])
        again = E.save(self.desk, {'action': 'apply', 'day': DAY, 'entries': entries, 'batch': 'batch-0002'})
        self.assertEqual(len(again['logs']), 3)
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'apply', 'day': DAY, 'entries': [{'log': ''}], 'batch': 'batch-0003'})
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'apply', 'day': DAY, 'entries': [{'log': 'x', 'variant_name': 'v'}], 'batch': 'batch-0004'})

    def test_papers_link_experiments_and_track_venue(self):
        e = self.create('HEAT')
        out = E.save(self.desk, {'action': 'paper-save', 'day': DAY,
                                 'paper': {'title': '流式多说话人识别', 'stage': 'writing', 'venue': 'ICASSP 2027', 'deadline': '2026-12-15'},
                                 'experiments': [{'experiment_id': e['id'], 'note': '表 2 主结果'}]})
        p = out['papers'][0]
        self.assertEqual((p['venue'], p['done'], p['experiments'][0]['note']), ('ICASSP 2027', 0, '表 2 主结果'))
        self.assertEqual(out['experiments'][0]['papers'], [p['id']])
        out = E.save(self.desk, {'action': 'paper-toggle', 'day': DAY, 'id': p['id'], 'revision': p['revision']})
        self.assertEqual(out['papers'][0]['done'], 1)
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'paper-save', 'day': DAY, 'paper': {'title': 'x', 'link': 'ftp://a'}})
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'paper-save', 'day': DAY, 'paper': {'title': 'x', 'stage': 'won'}})
        out = E.save(self.desk, {'action': 'paper-delete', 'day': DAY, 'id': p['id'], 'revision': out['papers'][0]['revision']})
        self.assertEqual((out['papers'], out['experiments'][0]['papers']), ([], []))

    def test_report_revision_and_plain_draft(self):
        e = self.create('HEAT')
        with self.assertRaises(ValueError):
            E.report_draft(self.desk, {'day': DAY})
        E.save(self.desk, {'action': 'log', 'day': DAY, 'experiment_id': e['id'], 'content': 'WER 降到 11.9', 'batch': 'batch-0005'})
        E.save(self.desk, {'action': 'log', 'day': DAY, 'experiment_id': '', 'content': '读了两篇论文', 'batch': 'batch-0006'})
        draft = E.report_draft(self.desk, {'day': DAY, 'mode': 'plain'})['content']
        self.assertIn('## HEAT\n- WER 降到 11.9', draft)
        self.assertIn('## 其他\n- 读了两篇论文', draft)
        out = E.save(self.desk, {'action': 'report', 'day': DAY, 'content': draft, 'revision': None})
        self.assertEqual(out['report']['revision'], 1)
        with self.assertRaises(ValueError):
            E.save(self.desk, {'action': 'report', 'day': DAY, 'content': 'x', 'revision': None})
        out = E.save(self.desk, {'action': 'report', 'day': DAY, 'content': '改过', 'revision': 1})
        self.assertEqual((out['report']['content'], out['days'][0]['report']), ('改过', True))

    def test_ai_organize_sanitises_ids_and_ai_report(self):
        e = self.create('HEAT')
        self.ai({'entries': [
            {'experiment_id': e['id'], 'new_title': '忽略', 'log': '试了 lr', 'variant_name': 'lr=1e-4', 'variant_verdict': 'ineffective'},
            {'experiment_id': 'made-up', 'new_title': '', 'log': '杂事', 'variant_verdict': 'awesome'},
            {'log': ''}]})
        out = E.organize(self.desk, {'text': '今天试了 lr', 'day': DAY})['entries']
        self.assertEqual(len(out), 2)
        self.assertEqual((out[0]['experiment_id'], out[0]['new_title'], out[0]['variant_verdict']), (e['id'], '', 'ineffective'))
        self.assertEqual((out[1]['experiment_id'], out[1]['variant_verdict']), ('', ''))
        sent = json.loads(self.desk.ai_request.call_args.args[1]['messages'][1]['content'])
        self.assertEqual(sent['experiments'][0]['title'], 'HEAT')
        with self.assertRaises(ValueError):
            E.organize(self.desk, {'text': '   '})
        E.save(self.desk, {'action': 'log', 'day': DAY, 'experiment_id': e['id'], 'content': 'x', 'batch': 'batch-0007'})
        self.ai({'report': '今天完成了 HEAT 的评测。'})
        self.assertEqual(E.report_draft(self.desk, {'day': DAY, 'mode': 'ai'})['content'], '今天完成了 HEAT 的评测。\n')
        self.desk.ai_ready = lambda _: False
        with self.assertRaises(ValueError):
            E.organize(self.desk, {'text': 'x'})


if __name__ == '__main__':
    unittest.main()
