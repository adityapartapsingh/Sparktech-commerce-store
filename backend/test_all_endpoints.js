require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./src/app');

// Color helpers for terminal output
const green = (t) => `\x1b[32m${t}\x1b[0m`;
const red = (t) => `\x1b[31m${t}\x1b[0m`;
const cyan = (t) => `\x1b[36m${t}\x1b[0m`;
const yellow = (t) => `\x1b[33m${t}\x1b[0m`;
const bold = (t) => `\x1b[1m${t}\x1b[0m`;

let server;
let baseUrl;

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { status: response.status, data, headers: response.headers };
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// -------------------------------------------------------------
// Test Suite Definition
// -------------------------------------------------------------

test('1. Health Check Endpoint (/health)', async () => {
  const res = await request('/health');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (res.data?.status !== 'ok') throw new Error(`Health status not ok: ${JSON.stringify(res.data)}`);
  if (res.data?.services?.mongo !== 'connected') throw new Error('MongoDB service not reported connected');
});

test('2. Products List API (GET /api/v1/products)', async () => {
  const res = await request('/api/v1/products');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!res.data?.data?.products || !Array.isArray(res.data.data.products)) throw new Error('Products array missing');
  if (res.data.data.products.length === 0) throw new Error('Expected at least 1 product');
  if (!res.data?.data?.pagination) throw new Error('Pagination object missing');
});

test('3. Featured Products API (GET /api/v1/products/featured)', async () => {
  const res = await request('/api/v1/products/featured');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!Array.isArray(res.data?.data)) throw new Error('Expected featured products array');
});

test('4. Product Detail by Slug (GET /api/v1/products/:slug)', async () => {
  const res = await request('/api/v1/products/arduino-uno-r3-dip-board');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!res.data?.data?.name?.includes('Arduino')) throw new Error(`Wrong product returned: ${res.data?.data?.name}`);
  if (!res.data?.data?.variants?.length) throw new Error('Product variants missing');
});

test('5. Category Filter (GET /api/v1/products?category=microcontrollers)', async () => {
  const res = await request('/api/v1/products?category=microcontrollers');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!res.data?.data?.products?.length) throw new Error('No products found for category microcontrollers');
});

test('6. Price Range Filter (GET /api/v1/products?minPrice=100&maxPrice=600)', async () => {
  const res = await request('/api/v1/products?minPrice=100&maxPrice=600');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  const invalid = res.data.data.products.some((p) => p.basePrice < 100 || p.basePrice > 600);
  if (invalid) throw new Error('Product found outside requested price range');
});

test('7. Categories Tree API (GET /api/v1/categories)', async () => {
  const res = await request('/api/v1/categories');
  if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  if (!Array.isArray(res.data?.data) || res.data.data.length === 0) throw new Error('Categories list missing or empty');
});

test('8. Edge Case: Special Regex Characters in Search Query (?search=(*+[{)', async () => {
  const res = await request('/api/v1/products?search=(*+[{');
  if (res.status !== 200) throw new Error(`Expected 200 (graceful empty or match), got ${res.status} (likely unhandled regex error)`);
  if (!Array.isArray(res.data?.data?.products)) throw new Error('Products array missing');
});

test('9. Edge Case: Non-Existent Product Slug (GET /api/v1/products/non-existent-12345)', async () => {
  const res = await request('/api/v1/products/non-existent-12345');
  if (res.status !== 404) throw new Error(`Expected 404 for missing slug, got ${res.status}`);
  if (res.data?.success !== false) throw new Error('Expected success: false');
});

test('10. Edge Case: Malformed ObjectId (GET /api/v1/products/invalid_id_format)', async () => {
  const res = await request('/api/v1/products/invalid_id_format');
  if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
});

test('11. Edge Case: Unknown Route 404 (GET /api/v1/random-unknown-endpoint)', async () => {
  const res = await request('/api/v1/random-unknown-endpoint');
  if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  if (res.data?.success !== false) throw new Error('Expected JSON success: false response');
});

test('12. Security: Protected Auth /me without token (GET /api/v1/auth/me)', async () => {
  const res = await request('/api/v1/auth/me');
  if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
});

test('13. Security: Protected Auth /me with Tampered JWT Token', async () => {
  const res = await request('/api/v1/auth/me', {
    headers: { Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.token' },
  });
  if (res.status !== 401) throw new Error(`Expected 401 for tampered JWT, got ${res.status}`);
});

test('14. Security: Cart endpoint without token (GET /api/v1/cart)', async () => {
  const res = await request('/api/v1/cart');
  if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
});

test('15. Security: Orders endpoint without token (GET /api/v1/orders/my)', async () => {
  const res = await request('/api/v1/orders/my');
  if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
});

test('16. Security: Admin Dashboard endpoint without Admin Auth (GET /api/v1/admin/dashboard)', async () => {
  const res = await request('/api/v1/admin/dashboard');
  if (res.status !== 401 && res.status !== 403) throw new Error(`Expected 401/403, got ${res.status}`);
});

test('17. Validation: Register with invalid email (POST /api/v1/auth/register)', async () => {
  const res = await request('/api/v1/auth/register', {
    method: 'POST',
    body: { name: 'Test', email: 'not-an-email', password: '123' },
  });
  if (res.status !== 400) throw new Error(`Expected 400 Bad Request for invalid registration data, got ${res.status}`);
  if (res.data?.success !== false) throw new Error('Expected success: false');
});

test('18. Guest Inquiry / Feedback API (POST /api/v1/feedback/guest)', async () => {
  const res = await request('/api/v1/feedback/guest', {
    method: 'POST',
    body: {
      name: 'Aditya Test',
      email: 'aditya.qa@example.com',
      phone: '9876543210',
      type: 'suggestion',
      subject: 'Atal Lab 30 Kits Bulk Inquiry',
      message: 'We are requesting a formal quotation for 30 STEM Arduino kits for our university lab.',
    },
  });
  if (res.status !== 201) throw new Error(`Expected 201 Created, got ${res.status}: ${JSON.stringify(res.data)}`);
  if (!res.data?.data?.ticketId?.startsWith('GST-')) throw new Error('Expected generated GST- ticket ID');
});

test('19. Guest Inquiry Validation: Missing Email / Short Message', async () => {
  const res = await request('/api/v1/feedback/guest', {
    method: 'POST',
    body: {
      name: 'Aditya Test',
      email: 'invalid-email',
      message: 'Short',
    },
  });
  if (res.status !== 400) throw new Error(`Expected 400 for invalid guest feedback, got ${res.status}`);
});

test('20. Security: NoSQL Injection in Query Param (?search[$gt]=)', async () => {
  const res = await request('/api/v1/products?search[$gt]=');
  if (res.status !== 200) throw new Error(`Expected 200 after sanitization, got ${res.status}`);
  if (!Array.isArray(res.data?.data?.products)) throw new Error('Products array missing');
});

// -------------------------------------------------------------
// Test Execution Engine
// -------------------------------------------------------------

async function runAllTests() {
  console.log(bold(cyan('\n=======================================================')));
  console.log(bold(cyan('      SPARKTECH COMPLETE API AUDIT & QA TEST SUITE    ')));
  console.log(bold(cyan('=======================================================\n')));

  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(green('✓ MongoDB Connected Successfully.\n'));

  // Start HTTP test server on port 5999
  const PORT = 5999;
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  baseUrl = `http://localhost:${PORT}`;
  console.log(`Live test server running on ${cyan(baseUrl)}\n`);

  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    process.stdout.write(`• ${name.padEnd(72, '.')} `);
    const start = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - start;
      console.log(`${green('PASS')} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.log(`${red('FAIL')} (${elapsed}ms)`);
      console.log(red(`    Error: ${err.message}`));
      failed++;
    }
  }

  console.log('\n-------------------------------------------------------');
  console.log(`Total Tests: ${tests.length} | Passed: ${green(passed)} | Failed: ${failed ? red(failed) : '0'}`);
  console.log('-------------------------------------------------------\n');

  // Teardown
  server.close();
  await mongoose.disconnect();

  if (failed > 0) {
    console.log(red(`❌ Audit completed with ${failed} failure(s).`));
    process.exit(1);
  } else {
    console.log(green('✅ All 20 API, Endpoint, and Edge Case Tests PASSED with 100% Success!'));
    process.exit(0);
  }
}

runAllTests().catch((e) => {
  console.error(red('Fatal test runner error:'), e);
  process.exit(1);
});
