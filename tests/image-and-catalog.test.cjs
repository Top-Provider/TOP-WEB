const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { imageResponse } = require("../src/lib/image-response.ts");
const {
  listPublicProducts,
  mapProductRow,
  listPublicSoftware,
  listPublicSolutionTopics,
} = require("../src/lib/public-catalog.ts");
const { mapUsersToTeam, listTeamMembers } = require("../src/lib/team.ts");
const { listPublicCustomers } = require("../src/lib/public-customers.ts");

afterEach(() => {
  delete globalThis.topDbPool;
});

test("imageResponse decodes base64 data URIs and safely redirects external or relative URLs", async () => {
  const pngB64 = Buffer.from("fake-png").toString("base64");
  const dataRes = imageResponse(
    `data:image/png;base64,${pngB64}`,
    "https://example.com/api/product-image/1",
    "/images/fallback.png"
  );
  assert.equal(dataRes.status, 200);
  assert.equal(dataRes.headers.get("Content-Type"), "image/png");
  assert.equal(dataRes.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(Buffer.from(await dataRes.arrayBuffer()).toString(), "fake-png");

  const extRes = imageResponse("https://cdn.example.com/a.webp", "https://example.com/api/x", "/fallback.png");
  assert.equal(extRes.status, 307);
  assert.equal(extRes.headers.get("location"), "https://cdn.example.com/a.webp");

  const relRes = imageResponse("/images/ok.jpg", "https://example.com/api/x", "/images/fallback.png");
  assert.equal(relRes.status, 307);
  assert.equal(relRes.headers.get("location"), "https://example.com/images/ok.jpg");

  // Protocol-relative URL must not become an open redirect
  const protoRelRes = imageResponse("//evil.example.com/x.png", "https://example.com/api/x", "/images/fallback.png");
  assert.equal(protoRelRes.status, 307);
  assert.equal(protoRelRes.headers.get("location"), "https://example.com/images/fallback.png");
});

test("public-catalog queries products, software, topics and maps ProductItemResponse", async () => {
  const calls = [];
  globalThis.topDbPool = {
    query: async (sql, values) => {
      calls.push({ sql, values });
      return { rows: [{ id: 10, name: "Item" }] };
    },
  };

  await listPublicProducts({ categoryId: "Printing", limit: 99999, orderDir: "desc" });
  assert.ok(calls[0].sql.includes("category_id = $1"));
  assert.ok(calls[0].sql.includes("ORDER BY id DESC"));
  assert.deepEqual(calls[0].values, ["Printing", 1000]);

  await listPublicSoftware(500);
  assert.deepEqual(calls[1].values, [100]);

  await listPublicSolutionTopics();
  assert.ok(calls[2].sql.includes("ORDER BY sort_order ASC"));

  const mapped = mapProductRow(
    { id: 7, name: "Thermal Printer", product_type: "other", is_active: true },
    {
      defaultCategory: "Printing",
      defaultSubCategory: "Receipt",
      defaultBrand: "TOP",
      fallbackImage: "/images/default.png",
      strictPrinterSupply: true,
    }
  );
  assert.equal(mapped.id, 7);
  assert.equal(mapped.slug, "prod-7");
  assert.equal(mapped.product_type, "printer");
  assert.equal(mapped.cover_image_url, "/images/default.png");
  assert.deepEqual(mapped.specifications, []);
});

test("team helper filters executives/home members and resolves Thai/English names and avatars", async () => {
  const members = mapUsersToTeam([
    { id: 1, show_on_home: false, job_role: "Staff", first_name_th: "สมชาย" },
    { id: 2, show_on_home: true, prefix_th: "คุณ", first_name_th: "วิภา", last_name_th: "ดี", avatar_url: "data:image/png;base64,abc", position: "PM" },
    { id: 3, show_on_home: false, job_role: "CEO", prefix_en: "Mr.", first_name_en: "John", last_name_en: "Doe", avatar_url: "/images/ceo.jpg" },
  ]);
  assert.equal(members.length, 2);
  assert.equal(members[0].name, "คุณ วิภา ดี");
  assert.equal(members[0].imageSrc, "/api/team-image/2");
  assert.equal(members[1].name, "Mr. John Doe");
  assert.equal(members[1].badge, "CEO");
  assert.equal(members[1].imageSrc, "/images/ceo.jpg");

  globalThis.topDbPool = {
    query: async (sql) => {
      assert.ok(sql.includes('"TB_USERS"'));
      return { rows: [{ id: 5, show_on_home: true, first_name_th: "ทดสอบ" }] };
    },
  };
  const listed = await listTeamMembers();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, "ทดสอบ");
});

test("listPublicCustomers maps active hospitals and converts base64 logos to image routes", async () => {
  globalThis.topDbPool = {
    query: async () => ({
      rows: [{ id: "12", name: "โรงพยาบาลกลาง", logo_url: "/api/customer-image/12" }],
    }),
  };
  const customers = await listPublicCustomers();
  assert.deepEqual(customers, [
    { customerId: 12, customerName: "โรงพยาบาลกลาง", logoUrl: "/api/customer-image/12" },
  ]);
});
