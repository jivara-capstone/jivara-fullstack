import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const supertest = require('supertest');
const app = require('./dist/src/app.js').default || require('./dist/src/app.js');
const agent = supertest(app);
const methods = ['get','post','put','patch','delete'];
const accounts = {
  superadmin: { email: 'superadmin@jivara.test', password: 'Demo12345' },
  admin: { email: 'admin@jivara.test', password: 'Demo12345' },
  nurse: { email: 'nurse1@jivara.test', password: 'Demo12345' },
  patient: { email: 'patient1@jivara.test', password: 'Demo12345' },
};
const fakeUuid = '00000000-0000-4000-8000-000000000001';
const runId = Date.now();
const results = [];
const state = { tokens: {}, refresh: {}, users: {}, ids: { patient: undefined, nurse: undefined, schedule: undefined, scan: undefined, alert: undefined, approval: undefined, activity: undefined, notification: undefined } };

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function http(method, path, { token, body, headers = {}, timeoutMs = 8000 } = {}) {
  let req = agent[method.toLowerCase()](path).timeout({ response: timeoutMs, deadline: timeoutMs + 1000 });
  for (const [k, v] of Object.entries(headers)) req = req.set(k, v);
  if (token) req = req.set('Authorization', `Bearer ${token}`);
  if (body !== undefined) req = req.set('Content-Type', 'application/json').send(body);
  try {
    const res = await req;
    const text = typeof res.text === 'string' ? res.text : JSON.stringify(res.body ?? '');
    return { status: res.status, text: text.slice(0, 350), json: res.body, contentType: res.headers['content-type'] || '' };
  } catch (err) {
    if (err?.response) {
      const res = err.response;
      const text = typeof res.text === 'string' ? res.text : JSON.stringify(res.body ?? '');
      return { status: res.status, text: text.slice(0, 350), json: res.body, contentType: res.headers?.['content-type'] || '' };
    }
    return { status: 0, text: err?.timeout ? `TIMEOUT_AFTER_${err.timeout}ms` : String(err), json: undefined };
  }
}

function tokenFrom(loginJson) { return loginJson?.data?.access_token || loginJson?.data?.accessToken || loginJson?.access_token || loginJson?.token; }
function refreshFrom(loginJson) { return loginJson?.data?.refresh_token || loginJson?.data?.refreshToken || loginJson?.refresh_token; }

async function loginAll() {
  for (const [role, cred] of Object.entries(accounts)) {
    const res = await http('post', '/api/v1/auth/login', { body: { identifier: cred.email, email: cred.email, password: cred.password }, timeoutMs: 10000 });
    if (res.status !== 200) throw new Error(`Login ${role} gagal: HTTP ${res.status} ${res.text}`);
    state.tokens[role] = tokenFrom(res.json);
    state.refresh[role] = refreshFrom(res.json);
    state.users[role] = res.json?.data?.user || {};
    if (!state.tokens[role]) throw new Error(`Login ${role} tidak mengembalikan access token`);
  }
}

function collectUuids(obj, hint = '') {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) return obj.forEach(x => collectUuids(x, hint));
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k).toLowerCase();
    if (typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
      if (!state.ids.patient && (hint.includes('patient') || key.includes('patient'))) state.ids.patient = v;
      if (!state.ids.nurse && (hint.includes('nurse') || key.includes('nurse'))) state.ids.nurse = v;
      if (!state.ids.schedule && (hint.includes('schedule') || key.includes('schedule'))) state.ids.schedule = v;
      if (!state.ids.scan && (hint.includes('scan') || key.includes('scan'))) state.ids.scan = v;
      if (!state.ids.alert && (hint.includes('alert') || key.includes('alert'))) state.ids.alert = v;
      if (!state.ids.approval && (hint.includes('approval') || key.includes('approval') || key === 'id')) state.ids.approval = v;
      if (!state.ids.activity && (hint.includes('activity') || key.includes('activity') || key.includes('audit'))) state.ids.activity = v;
      if (!state.ids.notification && (hint.includes('notification') || key.includes('notification'))) state.ids.notification = v;
    }
    collectUuids(v, `${hint} ${key}`);
  }
}

async function discoverIds() {
  const probes = [
    ['superadmin','/api/v1/patients?limit=20'], ['admin','/api/v1/patients?limit=20'], ['nurse','/api/v1/patients?limit=20'],
    ['superadmin','/api/v1/nurses?limit=20'], ['admin','/api/v1/nurses?limit=20'],
    ['superadmin','/api/v1/medication-schedules?limit=20'], ['nurse','/api/v1/medication-schedules?limit=20'], ['patient','/api/v1/medication-schedules?limit=20'],
    ['patient','/api/v1/food-scans?limit=20'], ['superadmin','/api/v1/food-scans?limit=20'],
    ['superadmin','/api/v1/alerts?limit=20'], ['nurse','/api/v1/alerts?limit=20'],
    ['superadmin','/api/v1/audit-logs?limit=20'], ['superadmin','/api/v1/auth/admin-approvals?limit=20'],
    ['patient','/api/v1/patients/me']
  ];
  for (const [role, path] of probes) {
    const res = await http('get', path, { token: state.tokens[role], timeoutMs: 8000 });
    if (res.status >= 200 && res.status < 300) collectUuids(res.json, path);
  }
  state.ids.patient ||= state.users.patient?.patientId || state.users.patient?.id || fakeUuid;
  state.ids.nurse ||= state.users.nurse?.nurseId || state.users.nurse?.id || fakeUuid;
  state.ids.schedule ||= fakeUuid;
  state.ids.scan ||= fakeUuid;
  state.ids.alert ||= fakeUuid;
  state.ids.approval ||= fakeUuid;
  state.ids.activity ||= fakeUuid;
  state.ids.notification ||= fakeUuid;
}

function pathWithParams(path) {
  const concrete = path
    .replace('{scanId}', state.ids.scan || fakeUuid)
    .replace('{id}', path.includes('/nurses/') ? (state.ids.nurse || fakeUuid)
      : path.includes('/patients/') ? (state.ids.patient || fakeUuid)
      : path.includes('/medication-schedules/') ? (state.ids.schedule || fakeUuid)
      : path.includes('/alerts/') ? (state.ids.alert || fakeUuid)
      : path.includes('/admin-approvals/') ? (state.ids.approval || fakeUuid)
      : fakeUuid);
  if (path === '/api/v1/notifications/user-preferences') return `${concrete}?key=admin_critical_activity`;
  return concrete;
}

function bodyFor(method, path) {
  const today = new Date().toISOString();
  const unique = `${runId}-${Math.floor(Math.random()*10000)}`;
  if (path === '/api/v1/activity-reads') return { activityIds: [state.ids.activity || fakeUuid] };
  if (path === '/api/v1/auth/register') return { fullName: 'Smoke Admin', email: `smoke.admin.${unique}@jivara.test`, password: 'Demo12345', phone: `+62813${String(runId).slice(-8)}`, gender: 'male', address: 'Smoke test address', organizationName: `Smoke Hospital ${unique}` };
  if (path === '/api/v1/auth/login') return { identifier: accounts.superadmin.email, email: accounts.superadmin.email, password: accounts.superadmin.password };
  if (path === '/api/v1/auth/complete-password-change') return { newPassword: 'Demo12345' };
  if (path === '/api/v1/auth/change-password') return { currentPassword: 'wrong-password-for-safe-smoke-test', newPassword: 'Demo12345' };
  if (path === '/api/v1/auth/refresh') return { refresh_token: state.refresh.admin || 'invalid-refresh-token' };
  if (path === '/api/v1/auth/logout') return { refresh_token: state.refresh.nurse || 'invalid-refresh-token' };
  if (path === '/api/v1/auth/status') return { refresh_token: state.refresh.patient || 'invalid-refresh-token' };
  if (path === '/api/v1/auth/me') return { fullName: state.users.superadmin?.fullName || 'Super Admin Jivara' };
  if (path === '/api/v1/food-scans') return { patientId: state.ids.patient, imageUrl: '/uploads/food-scans/smoke-test.jpg', imageSizeKb: 1 };
  if (path.includes('/food-scans/{scanId}/detections')) return { patientId: state.ids.patient };
  if (path.includes('/food-scans/{scanId}/interactions')) return { patientId: state.ids.patient, detectedItems: ['nasi'], includeRecommendations: false };
  if (path.includes('/food-scans/{scanId}/recommendations')) return { patientId: state.ids.patient, topN: 1 };
  if (path === '/api/v1/nutrition-estimates') return { detectedItems: [{ label: 'nasi', confidence: 0.9, portionGrams: 100 }] };
  if (path === '/api/v1/medication-logs') return { scheduleId: state.ids.schedule, status: 'missed', scheduledTime: today };
  if (path === '/api/v1/medication-logs/snooze') return { reminderJobId: fakeUuid, minutes: 10, scheduleId: state.ids.schedule, snoozeMinutes: 10 };
  if (path === '/api/v1/medication-schedules') return { patientId: state.ids.patient, drugName: `Smoke Test ${unique}`, dosage: '1 tablet', stock: 1, frequency: 1, scheduledTimes: ['23:59'], instructions: 'Smoke test', reminderEnabled: false, isActive: true, startDate: today.slice(0,10), endDate: today.slice(0,10) };
  if (path.includes('/medication-schedules/{id}')) return { drugName: `Smoke Test Updated ${unique}`, dosage: '1 tablet', stock: 1, frequency: 1, scheduledTimes: ['23:58'], instructions: 'Smoke update', reminderEnabled: false, isActive: true };
  if (path === '/api/v1/medication-schedules/bulk') return { schedules: [{ patientId: state.ids.patient, drugName: `Smoke Bulk ${unique}`, dosage: '1 tablet', frequency: 1, scheduledTimes: ['23:57'], instructions: 'Smoke bulk', stock: 1, reminderEnabled: false, startDate: today.slice(0,10), endDate: today.slice(0,10) }] };
  if (path === '/api/v1/notifications/events') return { notificationId: state.ids.notification || fakeUuid, eventType: 'opened' };
  if (path === '/api/v1/notifications/preferences') return { enabled: true };
  if (path === '/api/v1/notifications/subscribe') return { subscription: { endpoint: `https://example.test/push/${unique}`, keys: { p256dh: 'test-p256dh', auth: 'test-auth' } } };
  if (path === '/api/v1/notifications/user-subscribe') return { subscription: { endpoint: `https://example.test/user-push/${unique}`, keys: { p256dh: 'test-p256dh', auth: 'test-auth' } } };
  if (path === '/api/v1/notifications/send') return { patientId: state.ids.patient, type: 'smoke_test', title: 'Smoke test', body: 'Smoke test notification', urgency: 'normal', data: { smoke: true } };
  if (path === '/api/v1/notifications/user-preferences') return { key: 'admin_critical_activity', enabled: true, criticalAlert: true, medicationReminder: true };
  if (path === '/api/v1/nurses') return { fullName: `Smoke Nurse ${unique}`, email: `smoke.nurse.${unique}@jivara.test`, password: 'Demo12345', phone: `+62812${String(runId).slice(-8)}`, age: 30, gender: 'female', address: 'Smoke test address', employeeId: `SMK-${unique}`, department: 'Smoke' };
  if (path.includes('/nurses/{id}')) return { fullName: `Smoke Nurse Updated ${unique}`, phone: `+62811${String(runId).slice(-8)}`, age: 31, gender: 'female', address: 'Smoke update', employeeId: `SMKUP-${unique}`, department: 'Smoke', isActive: true };
  if (path === '/api/v1/patients') return { fullName: `Smoke Patient ${unique}`, email: `smoke.patient.${unique}@jivara.test`, password: 'Demo12345', phone: `+62810${String(runId).slice(-8)}`, age: 45, gender: 'male', address: 'Smoke patient address', assignedNurseId: state.ids.nurse !== fakeUuid ? state.ids.nurse : undefined };
  if (path.includes('/patients/{id}/assign')) return { nurseId: state.ids.nurse, nurseIds: [state.ids.nurse] };
  if (path.includes('/patients/{id}')) return { fullName: `Smoke Patient Updated ${unique}`, phone: `+62819${String(runId).slice(-8)}`, age: 46, gender: 'male', address: 'Smoke update' };
  if (path.includes('/admin-approvals/{id}/reject')) return { reason: 'Smoke test rejection reason' };
  return undefined;
}

function rolesFor(method, path) {
  if (path === '/api/v1/auth/login' || path === '/api/v1/auth/register' || path === '/api/v1/auth/status' || path === '/api/v1/public/stats' || path === '/api/v1/notifications/public-key') return [null];
  if (path.includes('/patients/me') || path.includes('/food-scans') || path.includes('/nutrition-estimates') || path.includes('/notifications/preferences') || path.includes('/medication-logs')) return ['patient','nurse','admin','superadmin'];
  if (path.includes('/admin-approvals')) return ['superadmin'];
  if (path.includes('/admin-dashboard/nurse-summary')) return ['nurse','admin','superadmin'];
  if (path.includes('/admin-dashboard') || path.includes('/audit-logs') || path.includes('/nurses')) return ['admin','superadmin'];
  if (path.includes('/alerts')) return ['nurse','admin','superadmin'];
  return ['superadmin','admin','nurse','patient'];
}

function classify(opPath, status, text) {
  if (status === 0 && opPath.includes('/activity-events') && text.includes('TIMEOUT')) return 'OK_STREAM_TIMEOUT';
  if (status === 0) return 'ERROR';
  if (status >= 500) return 'FAIL_5XX';
  if (status === 404 && (opPath.includes('{') || text.includes('NOT_FOUND') || text.includes('tidak ditemukan'))) return 'OK_RESOURCE_404';
  if (status === 404) return 'FAIL_404_ROUTE';
  if ([400,401,403,409,422].includes(status)) return 'OK_HANDLED_4XX';
  if (status >= 200 && status < 300) return 'OK_2XX';
  if (status >= 300 && status < 400) return 'OK_3XX';
  return 'CHECK';
}

async function runOperation(method, opPath) {
  const actualPath = pathWithParams(opPath);
  const body = ['post','put','patch'].includes(method) ? bodyFor(method, opPath) : undefined;
  const roles = rolesFor(method, opPath);
  let final, usedRole = roles[0] || 'public';
  for (const role of roles) {
    const token = role ? state.tokens[role] : undefined;
    const timeoutMs = opPath.includes('/activity-events') ? 1500 : 12000;
    const res = await http(method, actualPath, { token, body, timeoutMs });
    usedRole = role || 'public';
    final = res;
    if (![401,403].includes(res.status) || roles.length === 1) break;
  }
  const category = classify(opPath, final.status, final.text);
  results.push({ method: method.toUpperCase(), path: opPath, actualPath, role: usedRole, status: final.status, category, snippet: final.text.replace(/\s+/g,' ').slice(0,180) });
  if (final.status >= 200 && final.status < 300) collectUuids(final.json, opPath);
}

async function main() {
  const specRes = await http('get', '/openapi.json', { timeoutMs: 10000 });
  if (specRes.status !== 200) throw new Error(`Gagal ambil /openapi.json: ${specRes.status} ${specRes.text}`);
  const spec = specRes.json;
  await loginAll();
  await discoverIds();
  const ops = [];
  for (const [path, item] of Object.entries(spec.paths)) for (const m of methods) if (item[m]) ops.push([m, path]);
  for (const [m, p] of ops) {
    await runOperation(m, p);
    await sleep(25);
  }
  const summary = results.reduce((acc, r) => (acc[r.category] = (acc[r.category] || 0) + 1, acc), {});
  const report = { mode: 'supertest(app) against Scalar /openapi.json', generatedAt: new Date().toISOString(), total: results.length, idsUsed: state.ids, summary, results };
  fs.writeFileSync('tmp-openapi-smoke-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ mode: report.mode, generatedAt: report.generatedAt, total: report.total, summary: report.summary }, null, 2));
  console.log('\nProblem endpoints (5xx/route-404/error/check):');
  for (const r of results.filter(r => ['FAIL_5XX','FAIL_404_ROUTE','ERROR','CHECK'].includes(r.category))) {
    console.log(`${r.method} ${r.path} role=${r.role} status=${r.status} ${r.category} :: ${r.snippet}`);
  }
  console.log('\nHandled 4xx/resource 404/stream timeout endpoints:');
  for (const r of results.filter(r => ['OK_HANDLED_4XX','OK_RESOURCE_404','OK_STREAM_TIMEOUT'].includes(r.category))) {
    console.log(`${r.method} ${r.path} role=${r.role} status=${r.status} ${r.category} :: ${r.snippet}`);
  }
  console.log('\nFull report: tmp-openapi-smoke-report.json');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
