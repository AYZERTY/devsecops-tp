"""Résume les mesures Docker et toutes les CVE HIGH/CRITICAL, corrigées ou non."""
import json
import sys
from collections import Counter
from pathlib import Path

folder = Path(sys.argv[1])
image = json.loads((folder / 'image.json').read_text())[0]
scan = json.loads((folder / 'trivy.json').read_text())
vulnerabilities = [v for r in scan.get('Results', []) for v in r.get('Vulnerabilities', [])]
total = Counter(v['Severity'] for v in vulnerabilities)
fixable = Counter(v['Severity'] for v in vulnerabilities if v.get('FixedVersion'))
report = {
    'image_id': image['Id'],
    'bytes': image['Size'],
    'mib': round(image['Size'] / 1024**2, 2),
    'layers': len(image['RootFS']['Layers']),
    'high': total['HIGH'],
    'critical': total['CRITICAL'],
    'fixable_high': fixable['HIGH'],
    'fixable_critical': fixable['CRITICAL'],
}
(folder / 'summary.json').write_text(json.dumps(report, indent=2) + '\n')
print('MESURES_JSON=' + json.dumps(report))
