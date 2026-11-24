import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

export function userControlsFixture(h) {
  const { prisma, request, seedUser, fixturePassword, login } = h;
  async function target(role = "DONOR", pending = false) {
    const id = "user-control-" + randomUUID();
    const user = await seedUser({
      id,
      email: id + "@example.test",
      password: fixturePassword,
      displayName: "Account " + id,
      role,
      phone: null,
      normalizedPhone: null,
    });
    if (pending)
      await (
        role === "DONOR"
          ? prisma.donorProfile
          : role === "NGO"
            ? prisma.nGOProfile
            : prisma.volunteerProfile
      ).update({
        where: { userId: id },
        data: { verificationStatus: "PENDING" },
      });
    return user;
  }
  async function signIn(user) {
    const response = await request("/api/auth/login", {
      method: "POST",
      body: { email: user.email, password: fixturePassword },
    });
    assert.equal(response.status, 200);
    return response.headers.get("set-cookie").split(";")[0];
  }
  async function detail(id, cookie) {
    const response = await request("/api/admin/users?id=" + id, { cookie });
    assert.equal(response.status, 200);
    return response.json();
  }
  function change(cookie, user, action, extra = {}) {
    return request("/api/admin/users", {
      cookie,
      method: "PATCH",
      body: {
        id: user.id,
        action,
        expectedVersion: user.version ?? 0,
        note: "Account access review for testing",
        submissionKey: randomUUID(),
        ...(action === "DELETE" ? { confirmation: "DELETE" } : {}),
        ...extra,
      },
    });
  }
  return {
    ...h,
    target,
    signIn,
    detail,
    change,
    admin: async () => (await login("ADMIN")).cookie,
  };
}
export async function listing(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    user = await f.target("NGO", true);
  let response = await f.request("/api/admin/users?q=" + user.id, {
      cookie: admin,
    }),
    body = await response.json();
  assert.equal(body.total, 1);
  assert.equal(body.items[0].verification, "PENDING");
  assert.equal(body.items[0].access, "ACTIVE");
  assert.equal(body.items[0].password, undefined);
  const queue = await (
    await f.request("/api/admin/accounts?q=" + user.id, { cookie: admin })
  ).json();
  assert.equal(queue.total, 1);
  assert.equal((await f.change(admin, user, "BAN")).status, 200);
  assert.equal(
    (
      await (
        await f.request("/api/admin/accounts?q=" + user.id, { cookie: admin })
      ).json()
    ).total,
    0,
  );
  assert.equal(
    (
      await (
        await f.request("/api/admin/users?role=DONOR&q=" + user.id, {
          cookie: admin,
        })
      ).json()
    ).total,
    0,
  );
  assert.equal(
    (
      await (
        await f.request("/api/admin/users?access=BANNED&q=" + user.id, {
          cookie: admin,
        })
      ).json()
    ).total,
    1,
  );
  for (const qs of [
    "role=ADMIN",
    "access=HACKED",
    "page=0",
    "page=-1",
    "q=" + "x".repeat(121),
  ])
    assert.equal(
      (await f.request("/api/admin/users?" + qs, { cookie: admin })).status,
      422,
    );
  const legacy = await f.request("/admin/accounts", { cookie: admin });
  assert.equal(legacy.status, 307);
  assert.match(legacy.headers.get("location"), /\/admin\/verifications/);
}
export async function sessionRevocation(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    user = await f.target(),
    cookie = await f.signIn(user),
    second = await f.signIn(user);
  const posted = await f.newDonation(cookie);
  assert.equal(posted.response.status, 201);
  const ngo = (await f.login("NGO")).cookie;
  assert.equal((await f.change(admin, user, "BAN")).status, 200);
  for (const token of [cookie, second])
    assert.equal(
      (await f.request("/api/profile", { cookie: token })).status,
      401,
    );
  assert.equal(
    await f.prisma.authSession.count({ where: { userId: user.id } }),
    0,
  );
  assert.equal(
    (
      await f.request("/api/auth/login", {
        method: "POST",
        body: { email: user.email, password: f.fixturePassword },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await f.request("/api/claims", {
        cookie: ngo,
        method: "POST",
        body: { donationId: posted.body.donation.id },
      })
    ).status,
    409,
  );
  const visible = await (
    await f.request("/api/donations", { cookie: ngo })
  ).json();
  assert.equal(
    visible.donations.some((d) => d.id === posted.body.donation.id),
    false,
  );
  assert.equal(
    (await f.change(admin, (await f.detail(user.id, admin)).user, "UNBAN"))
      .status,
    200,
  );
  assert.equal((await f.request("/api/profile", { cookie })).status, 401);
  assert.equal(
    (await f.request("/api/profile", { cookie: await f.signIn(user) })).status,
    200,
  );
  assert.equal(
    (await f.prisma.donorProfile.findUnique({ where: { userId: user.id } }))
      .verificationStatus,
    "VERIFIED",
  );
  assert.equal((await f.detail(user.id, admin)).history.length, 2);
  const ngoUser = await f.target("NGO"),
    ngoCookie = await f.signIn(ngoUser);
  const ngoProfile = await f.prisma.nGOProfile.findUniqueOrThrow({
    where: { userId: ngoUser.id },
  });
  assert.equal(
    (
      await f.request("/api/ngos?id=" + ngoProfile.id, {
        cookie: await f.signIn(user),
      })
    ).status,
    200,
  );
  const pendingDonation = await f.newDonation(await f.signIn(user));
  const reserved = await f.request("/api/claims", {
    cookie: ngoCookie,
    method: "POST",
    body: { donationId: pendingDonation.body.donation.id },
  });
  assert.equal(reserved.status, 201);
  const reservedClaim = (await reserved.json()).claim;
  assert.equal((await f.change(admin, ngoUser, "BAN")).status, 200);
  assert.equal(
    (
      await f.request("/api/ngos?id=" + ngoProfile.id, {
        cookie: await f.signIn(user),
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await f.newDonation(await f.signIn(user), {
        preferredNgoProfileId: ngoProfile.id,
      })
    ).response.status,
    422,
  );
  const volunteer = await f.target("VOLUNTEER"),
    volunteerCookie = await f.signIn(volunteer);
  const dispatches = await (
    await f.request("/api/dispatches", { cookie: volunteerCookie })
  ).json();
  assert.equal(
    dispatches.dispatches.some((d) => d.claimId === reservedClaim.id),
    false,
  );
  assert.equal(
    (
      await f.request("/api/dispatches", {
        cookie: volunteerCookie,
        method: "POST",
        body: { claimId: reservedClaim.id },
      })
    ).status,
    409,
  );
}
export async function deletion(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    user = await f.target(),
    cookie = await f.signIn(user);
  const post = await f.newDonation(cookie);
  assert.equal(post.response.status, 201);
  const historicalPost = await f.newDonation(cookie);
  assert.equal(historicalPost.response.status, 201);
  const ngoProfile = await f.prisma.nGOProfile.findUniqueOrThrow({
    where: { userId: "test-NGO" },
  });
  const historicalClaim = await f.prisma.claim.create({
    data: {
      donationId: historicalPost.body.donation.id,
      ngoProfileId: ngoProfile.id,
      status: "CANCELLED",
    },
  });
  await f.prisma.donation.update({
    where: { id: historicalPost.body.donation.id },
    data: { status: "CANCELLED" },
  });
  const profile = await f.prisma.donorProfile.findUnique({
    where: { userId: user.id },
  });
  await f.prisma.accountReview.create({
    data: {
      targetUserId: user.id,
      actorUserId: "test-ADMIN",
      actorLabel: "Test admin",
      status: "VERIFIED",
      previousStatus: "PENDING",
      note: "Historical approval remains retained",
      submissionKey: randomUUID(),
      previousUpdatedAt: profile.updatedAt,
    },
  });
  assert.equal(
    (await f.change(admin, user, "DELETE", { confirmation: "wrong" })).status,
    422,
  );
  const key = randomUUID(),
    result = await f.change(admin, user, "DELETE", { submissionKey: key });
  assert.equal(result.status, 200, JSON.stringify(await result.clone().json()));
  const data = await f.detail(user.id, admin);
  assert.equal(data.user.access, "DELETED");
  assert.equal(data.user.email, null);
  assert.equal(data.history[0].action, "DELETE");
  assert.equal(
    (
      await f.prisma.donation.findUnique({
        where: { id: post.body.donation.id },
      })
    ).status,
    "CANCELLED",
  );
  assert.equal(
    await f.prisma.accountReview.count({ where: { targetUserId: user.id } }),
    1,
  );
  assert.equal(
    (
      await f.prisma.claim.findUniqueOrThrow({
        where: { id: historicalClaim.id },
      })
    ).status,
    "CANCELLED",
  );
  const stored = await f.prisma.user.findUnique({ where: { id: user.id } });
  assert.equal(stored.password, null);
  assert.equal(stored.normalizedPhone, null);
  assert.equal(stored.displayName, user.displayName);
  assert.equal((await f.request("/api/profile", { cookie })).status, 401);
  assert.equal(
    (await f.change(admin, user, "DELETE", { submissionKey: key })).status,
    200,
  );
  assert.equal((await f.change(admin, data.user, "UNBAN")).status, 409);
  assert.equal(
    await f.prisma.userAccessAudit.count({ where: { targetUserId: user.id } }),
    1,
  );
  assert.equal(
    (
      await (
        await f.request("/api/admin/users?q=" + user.id, { cookie: admin })
      ).json()
    ).total,
    0,
  );
  assert.equal(
    (
      await (
        await f.request("/api/admin/users?access=DELETED&q=" + user.id, {
          cookie: admin,
        })
      ).json()
    ).total,
    1,
  );
  // Removing login identity releases the email for a new, separately verified account.
  const registered = await f.request("/api/auth/register", {
    method: "POST",
    body: {
      email: user.email,
      password: "NewPassword123",
      fullName: "New account",
      phone: "019" + String(Math.floor(10000000 + Math.random() * 90000000)),
      role: "DONOR",
      termsAccepted: true,
      details: { address: "Badda, Dhaka" },
    },
  });
  assert.equal(
    registered.status,
    201,
    JSON.stringify(await registered.clone().json()),
  );
  const fresh = await registered.json();
  assert.notEqual(fresh.user.id, user.id);
  assert.equal(
    (await f.detail(fresh.user.id, admin)).user.verification,
    "VERIFIED",
  );
  const ngo = await f.target("NGO"),
    ngoCookie = await f.signIn(ngo),
    need = await f.newFoodRequest(ngoCookie);
  assert.equal(need.response.status, 201);
  const legacyNeeds = [];
  for (const status of ["DRAFT", "PENDING_REVIEW"]) {
    const created = await f.newFoodRequest(ngoCookie);
    assert.equal(created.response.status, 201);
    await f.prisma.foodRequest.update({
      where: { id: created.body.request.id },
      data: { status },
    });
    legacyNeeds.push(created.body.request.id);
  }
  assert.equal((await f.change(admin, ngo, "DELETE")).status, 200);
  assert.equal(
    await f.prisma.foodRequest.count({
      where: { id: { in: legacyNeeds }, status: "CANCELLED" },
    }),
    2,
  );
  assert.equal(
    (
      await f.prisma.foodRequest.findUnique({
        where: { id: need.body.request.id },
      })
    ).status,
    "CANCELLED",
  );
}
export async function activeWork(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    rescue = await f.assignedRescue();
  const row = await f.prisma.claim.findUnique({
    where: { id: rescue.claim.id },
    include: {
      donation: { include: { donor: true } },
      ngo: true,
      volunteer: true,
    },
  });
  for (const id of [
    row.donation.donor.userId,
    row.ngo.userId,
    row.volunteer.userId,
  ]) {
    const current = await f.detail(id, admin);
    assert.ok(current.activity.activeRescues > 0);
    const response = await f.change(admin, current.user, "DELETE");
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /active rescues/);
    assert.equal(
      (await f.prisma.user.findUnique({ where: { id } })).deletedAt,
      null,
    );
  }
  assert.equal(
    (
      await f.change(
        admin,
        (await f.detail(rescue.volunteerUser.id, admin)).user,
        "BAN",
      )
    ).status,
    200,
  );
  assert.equal(
    (await f.prisma.claim.findUnique({ where: { id: row.id } })).status,
    "ASSIGNED",
  );
  assert.equal(
    (await f.request("/api/missions", { cookie: rescue.volunteer })).status,
    401,
  );
  assert.equal(
    (
      await f.change(
        admin,
        (await f.detail(rescue.volunteerUser.id, admin)).user,
        "UNBAN",
      )
    ).status,
    200,
  );
}
export async function races(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    user = await f.target();
  const results = await Promise.all([
    f.change(admin, user, "BAN"),
    f.change(admin, user, "BAN"),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  let current = (await f.detail(user.id, admin)).user;
  const key = randomUUID();
  const replays = await Promise.all([
    f.change(admin, current, "UNBAN", { submissionKey: key }),
    f.change(admin, current, "UNBAN", { submissionKey: key }),
  ]);
  assert.deepEqual(
    replays.map((r) => r.status),
    [200, 200],
  );
  assert.equal(
    await f.prisma.userAccessAudit.count({ where: { submissionKey: key } }),
    1,
  );
  assert.equal(
    (
      await f.change(admin, current, "UNBAN", {
        submissionKey: key,
        note: "A different reason for the same key",
      })
    ).status,
    409,
  );
  current = (await f.detail(user.id, admin)).user;
  const loginAttempts = Array.from({ length: 6 }, () =>
    f.request("/api/auth/login", {
      method: "POST",
      body: { email: user.email, password: f.fixturePassword },
    }),
  );
  const [banned, ...logged] = await Promise.all([
    f.change(admin, current, "BAN"),
    ...loginAttempts,
  ]);
  assert.equal(banned.status, 200);
  assert.equal(
    await f.prisma.authSession.count({ where: { userId: user.id } }),
    0,
  );
  assert.equal(
    (await f.change(admin, (await f.detail(user.id, admin)).user, "UNBAN"))
      .status,
    200,
  );
  for (const response of logged) {
    assert.ok([200, 401].includes(response.status));
    if (response.status === 200)
      assert.equal(
        (
          await f.request("/api/profile", {
            cookie: response.headers.get("set-cookie").split(";")[0],
          })
        ).status,
        401,
      );
  }
  // A claimed rescue can never be attached to a deleted donor.
  for (let i = 0; i < 3; i++) {
    const donor = await f.target(),
      cookie = await f.signIn(donor),
      donation = await f.newDonation(cookie),
      ngo = (await f.login("NGO")).cookie;
    assert.equal(donation.response.status, 201);
    const [removed, claim] = await Promise.all([
      f.change(admin, donor, "DELETE"),
      f.request("/api/claims", {
        cookie: ngo,
        method: "POST",
        body: { donationId: donation.body.donation.id },
      }),
    ]);
    const deleted = (
      await f.prisma.user.findUnique({ where: { id: donor.id } })
    ).deletedAt;
    assert.ok([200, 409].includes(removed.status), "delete " + removed.status);
    assert.ok([201, 409].includes(claim.status), "claim " + claim.status);
    if (deleted) {
      assert.equal(claim.status, 409);
      assert.equal(
        await f.prisma.claim.count({
          where: { donationId: donation.body.donation.id },
        }),
        0,
      );
    } else {
      assert.equal(removed.status, 409);
      assert.equal(claim.status, 201);
    }
  }
}
export async function authorization(h) {
  const f = userControlsFixture(h),
    admin = await f.admin(),
    user = await f.target();
  assert.equal((await f.request("/api/admin/users")).status, 401);
  for (const role of ["DONOR", "NGO", "VOLUNTEER"]) {
    const cookie = (await f.login(role)).cookie;
    assert.equal((await f.request("/api/admin/users", { cookie })).status, 403);
    assert.equal((await f.change(cookie, user, "BAN")).status, 403);
  }
  assert.equal(
    (await f.change(admin, { id: "test-ADMIN" }, "BAN")).status,
    403,
  );
  assert.equal(
    (await f.change(admin, user, "BAN", { note: "short" })).status,
    422,
  );
  assert.equal(
    (await f.change(admin, user, "BAN", { expectedVersion: -1 })).status,
    422,
  );
  assert.equal(
    (await f.change(admin, user, "BAN", { action: "PROMOTE" })).status,
    422,
  );
  assert.equal(
    (
      await f.request("/api/admin/users", {
        cookie: admin,
        method: "PATCH",
        headers: { origin: "https://elsewhere.example" },
        body: { id: user.id, action: "BAN" },
      })
    ).status,
    403,
  );
  assert.equal(
    (await f.change(admin, user, "BAN", { expectedVersion: 9 })).status,
    409,
  );
  assert.equal(
    (await f.prisma.user.findUnique({ where: { id: user.id } })).isActive,
    true,
  );
}
