import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import {
  sampleVerificationPdf,
  sampleVerificationImage,
} from "./verification-fixtures.mjs";
export async function runVerificationChecks({
  prisma,
  request,
  login,
  seedUser,
  fixturePassword,
  base,
}) {
  async function account(role) {
    const id = `document-${role.toLowerCase()}-${randomUUID()}`,
      email = id + "@example.test";
    await seedUser({
      id,
      role,
      email,
      password: fixturePassword,
      displayName: "Sample " + role,
      phone: null,
      normalizedPhone: null,
    });
    const model = role === "NGO" ? prisma.nGOProfile : prisma.volunteerProfile;
    await model.update({
      where: { userId: id },
      data: { verificationStatus: "PENDING" },
    });
    const response = await request("/api/auth/login", {
      method: "POST",
      body: { email, password: fixturePassword },
    });
    assert.equal(response.status, 200);
    return { id, cookie: response.headers.get("set-cookie").split(";")[0] };
  }
  const ngo = await account("NGO"),
    volunteer = await account("VOLUNTEER"),
    other = await account("NGO");
  const admin = (await login("ADMIN")).cookie,
    donor = (await login("DONOR")).cookie;
  const pdf = await sampleVerificationPdf(),
    png = await sampleVerificationImage();
  async function json(response, expected = 200) {
    assert.equal(response.status, expected, await response.clone().text());
    return response.json();
  }
  async function state(user) {
    return json(await request("/api/verification", { cookie: user.cookie }));
  }
  async function upload(
    user,
    bytes = pdf,
    type = "application/pdf",
    name = "DEMO.pdf",
    key = randomUUID(),
    headers = {},
  ) {
    const form = new FormData();
    form.set("file", new File([bytes], name, { type }));
    form.set("submissionKey", key);
    form.set("userId", other.id);
    return fetch(base + "/api/verification", {
      method: "POST",
      headers: { cookie: user.cookie, ...headers },
      body: form,
    });
  }
  async function review(user, action = "APPROVE", options = {}) {
    const detail = await json(
      await request("/api/admin/accounts?id=" + user.id, { cookie: admin }),
    );
    return request("/api/admin/accounts", {
      method: "PATCH",
      cookie: admin,
      body: {
        id: user.id,
        action,
        note: "Checked the uploaded sample document and account details.",
        expectedUpdatedAt: detail.account.version,
        ...(detail.account.document
          ? { documentId: detail.account.document.id }
          : {}),
        submissionKey: randomUUID(),
        ...options,
      },
    });
  }
  const chunked = new ReadableStream({
    start(controller) {
      for (let index = 0; index < 6; index++)
        controller.enqueue(new Uint8Array(1024 * 1024));
      controller.close();
    },
  });
  assert.equal(
    (
      await fetch(base + "/api/verification", {
        method: "POST",
        headers: {
          cookie: ngo.cookie,
          "content-type": "multipart/form-data; boundary=bounded-upload",
        },
        body: chunked,
        duplex: "half",
      })
    ).status,
    413,
    "Chunked uploads cannot bypass the request size limit",
  );
  assert.equal((await request("/api/verification")).status, 401);
  assert.equal(
    (await request("/api/verification", { method: "POST", body: {} })).status,
    401,
  );
  assert.equal(
    (await request("/api/verification", { cookie: donor })).status,
    403,
  );
  assert.equal(
    (await request("/api/verification", { cookie: admin })).status,
    403,
  );
  assert.equal((await upload({ cookie: donor })).status, 403);
  assert.equal((await upload({ cookie: admin })).status, 403);
  assert.equal(
    (
      await upload(ngo, pdf, "application/pdf", "DEMO.pdf", randomUUID(), {
        origin: "https://other.example",
      })
    ).status,
    403,
  );
  assert.equal((await state(ngo)).document, null);
  assert.equal(
    (await review(ngo)).status,
    422,
    "A document is required for approval",
  );
  assert.equal(
    await prisma.accountReview.count({ where: { targetUserId: ngo.id } }),
    0,
  );
  assert.equal((await upload(ngo, Buffer.from("not a PDF"))).status, 422);
  assert.equal((await upload(ngo, Buffer.alloc(0))).status, 422);
  assert.equal(
    (await upload(ngo, png, "image/svg+xml", "test.svg")).status,
    422,
  );
  assert.equal((await upload(ngo, png, "image/jpeg", "fake.jpg")).status, 422);
  assert.ok(
    [413, 422].includes(
      (await upload(ngo, Buffer.alloc(5 * 1024 * 1024 + 1))).status,
    ),
  );
  const scriptPdf = await PDFDocument.create();
  scriptPdf.addPage();
  scriptPdf.addJavaScript("demo", "app.alert('sample')");
  assert.equal(
    (await upload(ngo, Buffer.from(await scriptPdf.save()))).status,
    422,
  );
  const longPdf = await PDFDocument.create();
  for (let i = 0; i < 11; i++) longPdf.addPage();
  assert.equal(
    (await upload(ngo, Buffer.from(await longPdf.save()))).status,
    422,
  );
  const before = await json(
    await request("/api/admin/accounts?id=" + ngo.id, { cookie: admin }),
  );
  const key = randomUUID(),
    first = await json(
      await upload(ngo, pdf, "application/pdf", "DEMO-NGO.pdf", key),
      201,
    );
  assert.equal(first.status, "PENDING");
  assert.equal((await state(ngo)).document.id, first.document.id);
  assert.equal(
    (await state(other)).document,
    null,
    "The session owns the document regardless of form userId",
  );
  assert.equal(
    (await json(await upload(ngo, pdf, "application/pdf", "DEMO-NGO.pdf", key)))
      .document.id,
    first.document.id,
  );
  assert.equal(
    await prisma.verificationDocument.count({ where: { ownerId: ngo.id } }),
    1,
  );
  assert.equal(
    (await upload(ngo, png, "image/png", "different.png", key)).status,
    409,
  );
  const file = await request(first.document.url, { cookie: ngo.cookie });
  assert.equal(file.status, 200);
  assert.equal(file.headers.get("content-type"), "application/pdf");
  assert.match(file.headers.get("cache-control"), /private.*no-store/);
  assert.equal(file.headers.get("x-content-type-options"), "nosniff");
  assert.match(
    (
      await request(first.document.url + "?download=1", { cookie: ngo.cookie })
    ).headers.get("content-disposition"),
    /^attachment/,
  );
  assert.equal(
    (await PDFDocument.load(await file.arrayBuffer())).getPageCount(),
    1,
  );
  assert.equal((await request(first.document.url)).status, 401);
  for (const cookie of [other.cookie, volunteer.cookie, donor])
    assert.equal((await request(first.document.url, { cookie })).status, 404);
  assert.equal(
    (await request(first.document.url, { cookie: admin })).status,
    200,
  );
  assert.equal(
    (
      await review(ngo, "APPROVE", {
        expectedUpdatedAt: before.account.version,
      })
    ).status,
    409,
  );
  assert.equal(
    (await review(ngo, "APPROVE", { documentId: randomUUID() })).status,
    409,
  );
  assert.equal(
    (await review(ngo, "APPROVE", { documentId: undefined })).status,
    409,
  );
  assert.equal((await review(ngo)).status, 200);
  const approved = await state(ngo);
  assert.equal(approved.status, "VERIFIED");
  assert.equal(approved.reviews[0].document.id, first.document.id);
  assert.equal(
    (await upload(ngo)).status,
    409,
    "Verified accounts cannot be silently reopened",
  );
  const directory = await json(
    await request(
      "/api/ngos?id=" +
        (
          await prisma.nGOProfile.findUniqueOrThrow({
            where: { userId: ngo.id },
          })
        ).id,
      { cookie: donor },
    ),
  );
  assert.ok(!JSON.stringify(directory).includes(first.document.id));
  assert.ok(!JSON.stringify(directory).includes("DEMO-NGO.pdf"));

  const v1key = randomUUID(),
    v1 = await json(
      await upload(volunteer, pdf, "application/pdf", "DEMO-ID-v1.pdf", v1key),
      201,
    );
  assert.equal(
    (
      await review(volunteer, "REJECT", {
        note: "Please upload a clearer sample image for the document.",
      })
    ).status,
    200,
  );
  assert.equal((await state(volunteer)).status, "REJECTED");
  const old = await json(
    await request("/api/admin/accounts?id=" + volunteer.id, { cookie: admin }),
  );
  const v2 = await json(
    await upload(volunteer, png, "image/png", "DEMO-ID-v2.png"),
    201,
  );
  assert.equal(v2.document.mimeType, "image/webp");
  const normalized = await request(v2.document.url, {
    cookie: volunteer.cookie,
  });
  const image = await sharp(
    Buffer.from(await normalized.arrayBuffer()),
  ).metadata();
  assert.equal(image.format, "webp");
  assert.equal(image.exif, undefined);
  const pending = await state(volunteer);
  assert.equal(pending.status, "PENDING");
  assert.equal(pending.document.id, v2.document.id);
  assert.equal(pending.reviews[0].document.id, v1.document.id);
  assert.equal(
    (await upload(volunteer, pdf, "application/pdf", "DEMO-ID-v1.pdf", v1key))
      .status,
    409,
  );
  assert.equal(
    (
      await review(volunteer, "APPROVE", {
        expectedUpdatedAt: old.account.version,
        documentId: v1.document.id,
      })
    ).status,
    409,
  );
  assert.equal((await review(volunteer)).status, 200);
  assert.equal((await state(volunteer)).reviews.length, 2);
  assert.equal(
    (await request(v1.document.url, { cookie: admin })).status,
    200,
    "The reviewed original remains available for audit",
  );
  assert.equal(
    (await request(v1.document.url, { cookie: other.cookie })).status,
    404,
  );

  const race = await account("NGO");
  const a = await json(await upload(race), 201);
  const snapshot = await json(
    await request("/api/admin/accounts?id=" + race.id, { cookie: admin }),
  );
  const [newUpload, oldReview] = await Promise.all([
    upload(race, png, "image/png", "DEMO-new.png"),
    review(race, "APPROVE", {
      expectedUpdatedAt: snapshot.account.version,
      documentId: a.document.id,
    }),
  ]);
  assert.ok(
    (newUpload.status === 201 && oldReview.status === 409) ||
      (newUpload.status === 409 && oldReview.status === 200),
  );
  const final = await state(race);
  if (final.status === "VERIFIED")
    assert.equal(final.document.id, a.document.id);
  else assert.notEqual(final.document.id, a.document.id);
  const quota = await account("NGO");
  const q = await json(await upload(quota), 201);
  await prisma.verificationDocument.update({
    where: { id: q.document.id },
    data: { byteSize: 20 * 1024 * 1024 },
  });
  assert.equal(
    (await upload(quota, png, "image/png", "second.png")).status,
    422,
  );
  assert.equal(
    await prisma.verificationDocument.count({ where: { ownerId: quota.id } }),
    1,
  );
}
