<?php
// =============================================================================
// SpaceMania — contador de visitas ("SEÑALES INTERCEPTADAS")
// Autor: Leox433 (leonidas433)
// Método: fichero JSON fuera de httpdocs con flock; una visita por sesión (cookie 30 min)
// Versión: 1.0.0
// Fecha: 2026-09-06
// Sin IPs, sin logs, sin datos personales.
// =============================================================================
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$dataFile = dirname($_SERVER['DOCUMENT_ROOT']) . '/spacemania-data/visits.json';
$sameOrigin = ($_SERVER['HTTP_SEC_FETCH_MODE'] ?? '') === 'cors'
           && ($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'same-origin';
$seen = isset($_COOKIE['sm_v']);
$count = $sameOrigin && !$seen;

$fh = @fopen($dataFile, 'c+');
if (!$fh) { http_response_code(503); echo '{"error":"storage"}'; exit; }
if (!flock($fh, LOCK_EX)) { fclose($fh); http_response_code(503); echo '{"error":"lock"}'; exit; }
$raw = stream_get_contents($fh);
$data = json_decode($raw ?: '{}', true);
$total = (int)($data['total'] ?? 0);
if ($count) {
  $total++;
  rewind($fh); ftruncate($fh, 0);
  fwrite($fh, json_encode(['total' => $total, 'updated' => gmdate('c')]));
  fflush($fh);
  setcookie('sm_v', '1', ['expires' => time() + 1800, 'path' => '/spacemania/', 'secure' => true, 'httponly' => true, 'samesite' => 'Lax']);
}
flock($fh, LOCK_UN); fclose($fh);
echo json_encode(['total' => $total]);
