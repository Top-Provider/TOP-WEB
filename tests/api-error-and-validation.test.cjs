const { test } = require("node:test");
const assert = require("node:assert/strict");
const { z } = require("zod");
const { apiError, HttpError, isDbConnectionError } = require("../src/lib/api-error.ts");
const {
  recordId,
  tableName,
  columnName,
  selectColumns,
  saveSchema,
  validateData,
  activitySchema,
} = require("../src/lib/data-validation.ts");

test("isDbConnectionError detects connection codes, messages, and nested errors", () => {
  assert.equal(isDbConnectionError(null), false);
  assert.equal(isDbConnectionError("ECONNREFUSED"), false);
  assert.equal(isDbConnectionError({ code: "ECONNREFUSED" }), true);
  assert.equal(isDbConnectionError({ code: "08006" }), true);
  assert.equal(isDbConnectionError({ message: "Connection terminated unexpectedly" }), true);
  assert.equal(isDbConnectionError({ message: "timeout exceeded when connecting" }), true);
  assert.equal(isDbConnectionError({ errors: [{ code: "ETIMEDOUT" }] }), true);
  assert.equal(isDbConnectionError({ code: "23505", message: "duplicate key" }), false);
});

test("apiError maps HttpError, ZodError/SyntaxError, DB errors, and unknown errors", async () => {
  const httpRes = apiError(new HttpError(403, "ไม่อนุญาต"));
  assert.equal(httpRes.status, 403);
  assert.deepEqual(await httpRes.json(), { success: false, error: "ไม่อนุญาต" });

  let zodErr;
  try {
    z.object({ name: z.string() }).parse({});
  } catch (e) {
    zodErr = e;
  }
  const zodRes = apiError(zodErr);
  assert.equal(zodRes.status, 400);
  assert.equal((await zodRes.json()).success, false);

  const syntaxRes = apiError(new SyntaxError("Unexpected token"));
  assert.equal(syntaxRes.status, 400);

  const origConsoleError = console.error;
  console.error = () => {};
  try {
    const dbRes = apiError({ code: "ECONNREFUSED" });
    assert.equal(dbRes.status, 503);
    assert.equal((await dbRes.json()).success, false);

    const unknownRes = apiError(new Error("boom"));
    assert.equal(unknownRes.status, 500);
    assert.equal((await unknownRes.json()).success, false);
  } finally {
    console.error = origConsoleError;
  }
});

test("data-validation enforces allowlisted tables, columns, and field types", () => {
  assert.equal(recordId.parse(42), 42);
  assert.equal(recordId.parse("123"), "123");
  assert.throws(() => recordId.parse("0"));
  assert.throws(() => recordId.parse(-5));

  assert.equal(tableName("public.tb_products"), "TB_PRODUCTS");
  assert.throws(() => tableName("pg_catalog.pg_tables"), HttpError);

  assert.equal(columnName("TB_PRODUCTS", "name"), '"name"');
  assert.throws(() => columnName("TB_PRODUCTS", "secret_col"), HttpError);

  assert.equal(selectColumns("TB_PRODUCTS"), "*");
  assert.equal(selectColumns("TB_PRODUCTS", "id, name"), '"id", "name"');

  assert.throws(() => validateData("TB_PRODUCTS", {}), HttpError);
  assert.throws(() => validateData("TB_PRODUCTS", { is_active: "yes" }), HttpError);
  assert.throws(() => validateData("TB_ACTIVITIES", { sort_order: -1 }), HttpError);
  assert.throws(() => validateData("TB_PRODUCTS", { name: "   " }), HttpError);

  const valid = validateData("TB_PRODUCTS", { name: "Printer X", is_active: true });
  assert.deepEqual(valid, { name: "Printer X", is_active: true });

  const parsedSave = saveSchema.parse({ table: "TB_PRODUCTS", action: "insert", data: { name: "Printer X" } });
  assert.equal(parsedSave.idColumn, "id");

  const parsedActivity = activitySchema.parse({
    title: "งานอบรม",
    category: "seminar",
    event_date: "2026-11-18",
    customerId: 5,
    is_active: true,
  });
  assert.equal(parsedActivity.customerId, 5);
});
