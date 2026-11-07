"""Real Chromium interaction tests; no external assets or services required."""
import functools
import http.server
import json
import os
import pathlib
import re
import threading
import unittest
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[4]
APP = '/assets/apps/pcb-mount-optimizer/index.html'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

class StudioBrowserTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(ROOT)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = 'http://127.0.0.1:' + str(cls.server.server_port)
        cls.pw = sync_playwright().start()
        executable = os.environ.get('CHROMIUM_EXECUTABLE')
        cls.browser = cls.pw.chromium.launch(executable_path=executable, headless=True, args=['--no-sandbox'])

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.server.shutdown()
        cls.server.server_close()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 1440, 'height': 1000}, has_touch=True)
        self.page = self.context.new_page()
        self.errors = []
        self.page.on('pageerror', lambda e: self.errors.append(str(e)))
        if os.environ.get('STUDIO_INLINE_MODE'):
            folder = ROOT / 'assets/apps/pcb-mount-optimizer'
            html = (folder / 'index.html').read_text()
            html = re.sub(r'<script[^>]*src="[^"]+"[^>]*></script>', '', html)
            html = re.sub(r'<link[^>]*rel="stylesheet"[^>]*>', '', html)
            self.page.set_content(html)
            self.page.add_style_tag(content=(folder / 'studio.css').read_text())
            self.page.add_script_tag(content=(folder / 'studio-core.js').read_text())
            self.page.add_script_tag(content=(folder / 'studio.js').read_text())
        else:
            self.page.goto(self.base + APP)
        self.page.wait_for_function('!!window.PCBMountApp')
        self.page.on('dialog', lambda d: d.accept())

    def tearDown(self):
        self.assertEqual(self.errors, [], 'Browser runtime errors')
        self.context.close()

    def upload(self, selector, data, name='project.json'):
        content = data if isinstance(data, str) else json.dumps(data)
        self.page.locator(selector).set_input_files({'name': name, 'mimeType': 'application/json', 'buffer': content.encode()})

    def project(self):
        return self.page.evaluate('window.PCBMountApp.getState()')

    def click_board(self, x, y):
        pos = self.page.evaluate('''([x,y])=>{const p=new DOMPoint(x,-y).matrixTransform(document.getElementById('board').getScreenCTM());return {x:p.x,y:p.y}}''', [x,y])
        if self.page.viewport_size['width'] < 760:
            self.page.touchscreen.tap(pos['x'], pos['y'])
        else:
            self.page.mouse.click(pos['x'], pos['y'])

    def rectangle_board(self):
        for key, value in [('width','100'),('height','80'),('thickness','1.6')]:
            self.page.locator('#'+key).fill(value)
        self.page.locator('#make-board').click()

    def exact_region(self, name, kind, points):
        self.page.locator('#region-name').fill(name)
        self.page.locator('#region-kind').select_option(kind)
        self.page.locator('#precise-region').evaluate('(el)=>el.open=true')
        self.page.locator('#region-coords').fill(points)
        self.page.locator('#save-region').click()

    def setup_project(self):
        self.rectangle_board()
        self.exact_region('Left','mount','5,5\n30,5\n30,30\n5,30')
        self.exact_region('Right','mount','70,50\n95,50\n95,75\n70,75')
        self.exact_region('Tool','load','45,35\n55,35\n55,45\n45,45')
        self.page.locator('[data-step="2"]').click()
        for key,value in [('min-mounts','2'),('max-mounts','4'),('spacing','20'),('clearance','3'),('pitch','5')]:
            self.page.locator('#'+key).fill(value)
        self.page.locator('#one-per-region').select_option('yes')
        self.page.locator('#analysis-settings').evaluate('(el)=>el.open=true')
        self.page.locator('#case-id').fill('MY-FE-v1')
        self.page.locator('#force').fill('42')
        self.page.locator('#direction').select_option('-Z')
        self.page.locator('#support').fill('User fixed patch radius 2mm')
        self.page.locator('#engineering-checks').evaluate('(el)=>el.open=true')
        self.page.locator('#enable-strain').check()
        self.page.locator('#limit-strain').fill('1200')
        self.page.locator('#tolerance-strain').fill('5')
        self.page.locator('[data-step="3"]').click()
        self.add_xy(10,10)
        self.add_xy(80,60)

    def add_xy(self,x,y):
        self.page.locator('#mount-x').evaluate('(el)=>el.closest("details").open=true')
        self.page.locator('#mount-x').fill(str(x));self.page.locator('#mount-y').fill(str(y));self.page.locator('#add-mount').click()

    def test_blank_start_no_prefilled_constraints(self):
        p=self.project()
        self.assertEqual(p['board']['outline'],[])
        self.assertTrue(all(v is None for v in p['rules'].values()))
        self.assertTrue(self.page.locator('#export-request').is_disabled())
        self.assertEqual(self.page.locator('.candidate').count(),0)

    def test_rectangle_polygon_drawing_and_edit_delete(self):
        self.rectangle_board()
        self.page.locator('#region-name').fill('Drawn rectangle')
        self.page.locator('#draw-region').click();self.click_board(5,5);self.click_board(30,30)
        self.assertEqual(len(self.project()['regions']),1)
        self.page.locator('#region-name').fill('Drawn polygon')
        self.page.locator('#region-shape').select_option('polygon');self.page.locator('#draw-region').click()
        for q in [(70,50),(95,50),(95,75),(70,75)]:self.click_board(*q)
        self.page.locator('#undo-vertex').click();self.click_board(70,75);self.page.locator('#finish-drawing').click()
        self.assertEqual(len(self.project()['regions']),2)
        self.page.locator('[data-edit-region="Drawn rectangle"]').click()
        self.page.locator('#region-name').fill('Renamed');self.page.locator('#save-region').click()
        self.assertEqual(self.project()['regions'][-1]['id'],'Renamed')
        self.page.locator('[data-delete-region="Renamed"]').click()
        self.assertEqual(len(self.project()['regions']),1)

    def test_custom_outline_csv_and_self_crossing_rejection(self):
        self.page.locator('#thickness').fill('2')
        self.upload('#outline-file','x,y\n0,0\n100,0\n100,50\n40,50\n40,80\n0,80','outline.csv')
        self.page.wait_for_function('window.PCBMountApp.getState().board.outline.length===6')
        self.assertEqual(len(self.project()['board']['outline']),6)
        self.upload('#outline-file','x,y\n0,0\n20,20\n0,20\n30,0','bad.csv')
        self.page.wait_for_function('document.getElementById("notice").classList.contains("error")')
        self.assertEqual(len(self.project()['board']['outline']),6)

    def test_candidate_selection_spacing_export_and_save_reopen(self):
        self.setup_project()
        self.page.locator('#show-candidates').click();self.assertGreater(self.page.locator('.candidate').count(),0)
        self.add_xy(15,15);self.assertEqual(len(self.project()['mounts']),2)
        self.assertIn('spacing',self.page.locator('#notice').inner_text())
        with self.page.expect_download() as d:self.page.locator('#export-request').click()
        request=json.loads(pathlib.Path(d.value.path()).read_text())
        self.assertEqual(request['project']['analysis']['forceN'],42)
        self.assertEqual(len(request['project']['mounts']),2)
        with self.page.expect_download() as d:self.page.locator('#save-project').click()
        original=json.loads(pathlib.Path(d.value.path()).read_text())
        self.page.locator('#clear-mounts').click()
        self.upload('#project-file',original)
        self.page.wait_for_function('window.PCBMountApp.getState().mounts.length===2')
        self.assertEqual(self.project(),original)

    def test_fe_comparison_and_stale_input_invalidation(self):
        self.setup_project()
        self.page.locator('#verification').evaluate('(el)=>el.open=true')
        templates=[]
        for prefix in ['prediction','fe']:
            with self.page.expect_download() as d:self.page.locator('#'+prefix+'-template').click()
            obj=json.loads(pathlib.Path(d.value.path()).read_text());obj['source']=prefix+' run';obj['values']['strain']=1000 if prefix=='prediction' else 1020;templates.append(obj)
            self.upload('#'+prefix+'-file',obj,prefix+'.json')
        self.page.wait_for_function('window.PCBMountApp.getReport().comparison.status==="agreement"')
        self.assertIn('Numerical agreement',self.page.locator('#verdict').inner_text())
        self.page.locator('[data-step="2"]').click();self.page.locator('#spacing').fill('21')
        self.assertIsNone(self.page.evaluate('window.PCBMountApp.getReport().prediction'))
        self.upload('#prediction-file',templates[0],'old.json')
        self.page.wait_for_function('document.getElementById("notice").textContent.includes("different geometry")')
        self.assertIsNone(self.page.evaluate('window.PCBMountApp.getReport().prediction'))

    def test_missing_values_cannot_be_reported_as_agreement(self):
        self.setup_project()
        self.page.evaluate('''()=>{const p=window.PCBMountApp.getState(),C=window.MountStudioCore;for(const [method,func] of [['prediction','loadPrediction'],['direct-fe','loadFeResult']]){let r=C.resultTemplate(p,method);r.source=method+' fixture';window.PCBMountApp[func](r);}}''')
        self.assertEqual(self.page.evaluate('window.PCBMountApp.getReport().comparison.status'),'partial')

    def test_cutout_keepout_and_all_region_types_render(self):
        self.rectangle_board()
        for name,kind,coords in [('allowed','mount','5,5\n25,5\n25,25\n5,25'),('exclude','keepout','10,10\n15,10\n15,15\n10,15'),('hole','cutout','40,40\n45,40\n45,45\n40,45'),('load','load','60,40\n65,40\n65,45\n60,45'),('strain','strain','70,20\n75,20\n75,25\n70,25')]:
            self.exact_region(name,kind,coords)
        self.assertEqual(len(self.project()['regions']),5)
        for kind in ['mount','keepout','cutout','load','strain']:self.assertEqual(self.page.locator('svg .region.'+kind).count(),1)

    def test_mobile_tap_and_no_horizontal_overflow(self):
        self.page.set_viewport_size({'width':390,'height':844})
        self.rectangle_board()
        self.page.locator('#region-name').fill('Touch region');self.page.locator('#draw-region').click()
        self.page.locator('#board').scroll_into_view_if_needed()
        self.click_board(10,10);self.click_board(40,40)
        self.assertEqual(len(self.project()['regions']),1)
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),390)
        self.page.screenshot(path=str(pathlib.Path(os.environ.get('TEST_ARTIFACT_DIR','/tmp'))/'mount-studio-mobile.png'),full_page=True)

    def test_zoom_preserves_coordinates(self):
        self.rectangle_board();self.page.locator('#zoom-in').click();self.page.locator('#zoom-in').click()
        self.page.locator('#region-name').fill('Zoom region');self.page.locator('#draw-region').click();self.click_board(30,25);self.click_board(60,55)
        poly=self.project()['regions'][0]['polygon'];self.assertAlmostEqual(poly[0]['x'],30,delta=.3);self.assertAlmostEqual(poly[0]['y'],25,delta=.3)
        self.page.locator('#fit').click()

    @unittest.skipIf(os.environ.get('STUDIO_INLINE_MODE'), 'Local browser navigation is restricted; run full navigation checks in CI.')
    def test_portfolio_navigation_in_both_directions(self):
        self.page.goto(self.base+'/index.html')
        self.page.locator('#mount-studio-entry a').click()
        self.page.wait_for_function('!!window.PCBMountApp')
        self.assertTrue(self.page.url.endswith(APP))
        self.page.locator('#portfolio-link').click()
        self.assertTrue(self.page.url.endswith('/index.html#mount-studio-entry'))
        self.assertGreaterEqual(self.page.locator('[data-mount-studio]').count(),2)

    @unittest.skipIf(os.environ.get('STUDIO_INLINE_MODE'), 'Local browser navigation is restricted; run full navigation checks in CI.')
    def test_portfolio_entry_works_without_javascript(self):
        context=self.browser.new_context(java_script_enabled=False)
        page=context.new_page();page.goto(self.base+'/index.html');page.locator('#mount-studio-entry a').click()
        self.assertTrue(page.url.endswith(APP));self.assertTrue(page.locator('#portfolio-link').is_visible());context.close()

    def test_desktop_screenshot_and_no_console_errors(self):
        self.setup_project();self.page.locator('#show-candidates').click()
        self.assertLessEqual(self.page.evaluate('document.documentElement.scrollWidth'),1440)
        self.page.screenshot(path=str(pathlib.Path(os.environ.get('TEST_ARTIFACT_DIR','/tmp'))/'mount-studio-desktop.png'),full_page=True)

if __name__=='__main__':
    unittest.main(verbosity=2)
