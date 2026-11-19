import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

export async function adminFixtures(
  { prisma, seedUser, newDonation, login, fixturePassword },
  prefix = "admin",
) {
  const pending = [];
  for (const [index, role] of ["DONOR", "NGO", "VOLUNTEER"].entries()) {
    const id = `${prefix}-${role}-${randomUUID()}`;
    await seedUser({
      id,
      role,
      email: `${id}@example.test`,
      password: fixturePassword,
      displayName: [
        "Green Table Kitchen",
        "Hope Community Foundation",
        "Nusrat Jahan",
      ][index],
      normalizedPhone: null,
      phone: "01700000001",
    });
    const model =
      role === "DONOR"
        ? prisma.donorProfile
        : role === "NGO"
          ? prisma.nGOProfile
          : prisma.volunteerProfile;
    await model.update({
      where: { userId: id },
      data: { verificationStatus: "PENDING" },
    });
    pending.push(id);
  }
  const { cookie } = await login("DONOR");
  const donation = (
    await newDonation(cookie, {
      title: "Fresh meals for the community",
      estimatedMeals: 80,
    })
  ).body.donation;
  const ngo = await prisma.nGOProfile.findUniqueOrThrow({
    where: { userId: "test-NGO" },
  });
  const claim = await prisma.claim.create({
    data: {
      donationId: donation.id,
      ngoProfileId: ngo.id,
      status: "DISPUTED",
      incidentHoldStatus: "RESERVED",
      deliveryAddressSnapshot: {
        id: "test-snapshot",
        addressLine: "Community centre, Badda",
        city: "Dhaka",
      },
    },
  });
  await prisma.donation.update({
    where: { id: donation.id },
    data: { status: "DISPUTED" },
  });
  const report = await prisma.incidentReport.create({
    data: {
      claimId: claim.id,
      reportedByUserId: "test-NGO",
      type: "WRONG_QUANTITY",
      severity: "HIGH",
      description:
        "The sealed food packets need a quantity check before pickup.",
    },
  });
  return { pending, claim, report };
}
export async function runAdminChecks(helpers) {
  const { prisma, request, login } = helpers;
  const fixture = await adminFixtures(helpers);
  const paths = ["overview", "accounts", "rescues", "reports"].map(
    (p) => "/api/admin/" + p,
  );
  for (const path of paths) assert.equal((await request(path)).status, 401);
  assert.equal((await request("/admin/dashboard")).status, 307);
  for (const role of ["DONOR", "NGO", "VOLUNTEER"]) {
    const { cookie } = await login(role);
    for (const path of paths)
      assert.equal((await request(path, { cookie })).status, 403);
    assert.match(
      (await request("/admin/dashboard", { cookie })).headers.get("location"),
      /unauthorized$/,
    );
    assert.equal(
      (
        await request("/api/admin/accounts", {
          method: "PATCH",
          cookie,
          body: {},
        })
      ).status,
      403,
    );
  }
  const cookie = (await login("ADMIN")).cookie;
  async function get(path) {
    const response = await request(path, { cookie });
    assert.equal(response.status, 200, path);
    return response.json();
  }
  async function review(id, changes = {}, payload) {
    const detail = await get("/api/admin/accounts?id=" + id);
    const body = payload || {
      id,
      action: "APPROVE",
      note: "Identity and registration checked by the operator.",
      submissionKey: randomUUID(),
      expectedUpdatedAt: detail.account.version,
      ...changes,
    };
    const response = await request("/api/admin/accounts", {
      method: "PATCH",
      cookie,
      body,
    });
    return { response, body };
  }
  for (const path of paths) {
    const data = await get(path);
    assert.doesNotMatch(
      JSON.stringify(data),
      /"(?:password|tokenHash|registrationDetails|pickupVerificationToken|deliveryVerificationToken)"/,
    );
  }
  assert.equal(
    (await request("/api/admin/accounts?page=0", { cookie })).status,
    422,
  );
  assert.equal(
    (await request("/api/admin/accounts?role=ADMIN", { cookie })).status,
    422,
  );
  assert.equal(
    (await request("/api/admin/reports?status=INVALID", { cookie })).status,
    422,
  );
  assert.equal(
    (await request("/api/admin/rescues?q=" + "x".repeat(121), { cookie }))
      .status,
    422,
  );
  assert.equal(
    (await request("/api/admin/accounts?id=test-ADMIN", { cookie })).status,
    404,
  );
  const [donor, ngo, volunteer] = fixture.pending;
  assert.equal((await review(donor, { note: "short" })).response.status, 422);
  assert.equal(
    (await review(donor, { action: "DELETE" })).response.status,
    422,
  );
  const rejected = await review(donor, {
    action: "REJECT",
    note: "Certificate number needs correction before approval.",
  });
  assert.equal(rejected.response.status, 200);
  const replay = await review(donor, {}, rejected.body);
  assert.equal(replay.response.status, 200);
  assert.equal((await replay.response.json()).repeated, true);
  assert.equal(
    (
      await review(
        donor,
        {},
        {
          ...rejected.body,
          note: "Different review note on an existing submission.",
        },
      )
    ).response.status,
    409,
  );
  assert.equal(
    await prisma.accountReview.count({ where: { targetUserId: donor } }),
    1,
  );
  assert.equal(
    await prisma.notification.count({
      where: { userId: donor, title: "Account verification updated" },
    }),
    1,
  );
  assert.equal((await review(donor)).response.status, 200);
  assert.equal(
    (await review(donor, { action: "REJECT" })).response.status,
    409,
    "Verified accounts cannot be revoked through verification",
  );
  const detail = await get("/api/admin/accounts?id=" + ngo);
  await prisma.nGOProfile.update({
    where: { userId: ngo },
    data: { summary: "Updated organization information" },
  });
  assert.equal(
    (await review(ngo, { expectedUpdatedAt: detail.account.version })).response
      .status,
    409,
  );
  const concurrentDetail = await get("/api/admin/accounts?id=" + volunteer);
  const requests = await Promise.all(
    ["APPROVE", "REJECT"].map((action) =>
      review(volunteer, {
        action,
        expectedUpdatedAt: concurrentDetail.account.version,
      }),
    ),
  );
  assert.deepEqual(requests.map((r) => r.response.status).sort(), [200, 409]);
  assert.equal(
    await prisma.accountReview.count({ where: { targetUserId: volunteer } }),
    1,
  );
  const audit = await get("/api/admin/accounts?id=" + donor);
  assert.equal(audit.reviews.length, 2);
  assert.equal(audit.reviews[0].actorLabel, "Test administrator");
  const search = await get(
    "/api/admin/accounts?status=ALL&q=" + encodeURIComponent(donor),
  );
  assert.equal(search.items.length, 1);
  assert.equal(search.items[0].id, donor);
  for (let i = 0; i < 22; i++) {
    const id = "pagination-" + i + "-" + randomUUID();
    await helpers.seedUser({
      id,
      role: "DONOR",
      email: id + "@example.test",
      password: helpers.fixturePassword,
      displayName: "Pagination pending " + i,
      normalizedPhone: null,
      phone: null,
    });
    await prisma.donorProfile.update({
      where: { userId: id },
      data: { verificationStatus: "PENDING" },
    });
  }
  const first = await get("/api/admin/accounts?q=Pagination&status=PENDING");
  const second = await get(
    "/api/admin/accounts?q=Pagination&status=PENDING&page=2",
  );
  assert.equal(first.total, 22);
  assert.equal(first.items.length, 20);
  assert.equal(second.items.length, 2);
  assert.equal(
    new Set([...first.items, ...second.items].map((r) => r.id)).size,
    22,
  );
  const overview = await get("/api/admin/overview");
  assert.equal(
    overview.pendingAccounts,
    (await get("/api/admin/accounts?status=PENDING")).total,
  );
  assert.equal(
    overview.openRescues,
    (await get("/api/admin/rescues?status=ACTIVE")).total,
  );
  assert.equal(
    overview.openReports,
    (await get("/api/admin/reports?status=OPEN")).total,
  );
  assert.equal(
    overview.mealsDistributed,
    (
      await prisma.distributionRecord.aggregate({
        _sum: { mealsDistributed: true },
      })
    )._sum.mealsDistributed || 0,
  );
  const rescues = await get("/api/admin/rescues?status=DISPUTED");
  assert.ok(
    rescues.items.some(
      (r) =>
        r.id === fixture.claim.id &&
        r.deliveryAddress === "Community centre, Badda",
    ),
  );
  const report = await get("/api/admin/reports?id=" + fixture.report.id);
  assert.equal(report.description, fixture.report.description);
  assert.equal(
    (
      await request("/api/incidents", {
        method: "PATCH",
        cookie,
        body: {
          id: report.id,
          action: "RESUME",
          note: "Packet quantity checked with both rescue participants.",
        },
      })
    ).status,
    200,
  );
  assert.equal(
    (await prisma.claim.findUniqueOrThrow({ where: { id: fixture.claim.id } }))
      .status,
    "RESERVED",
  );
  assert.equal(
    (await get("/api/admin/reports?id=" + report.id)).reviews.length,
    1,
  );
  assert.ok(
    (await get("/api/admin/overview")).activity.some(
      (a) => a.action === "RESUME",
    ),
  );
}
