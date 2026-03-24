/**
 * Auth Integration Tests
 *
 * These tests hit the real Express app but use a shared in-memory
 * MongoDB (or your test Atlas cluster via TEST_MONGO_URI).
 * No mocking — if the test passes, the whole stack works.
 */

import request from "supertest";
import mongoose from "mongoose";
import { createApp } from "../../src/app";
import { User } from "../../src/models/User.model";

const app = createApp();

// Setup / Teardown
beforeAll(async () => {
  const uri = process.env.TEST_MONGO_URI ?? process.env.MONGO_URI!;
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  // Clean users between tests
  await User.deleteMany({ email: /@test\.shopsphere\.com$/ });
});

// Helpers
const TEST_EMAIL = "integration@test.shopsphere.com";
const TEST_PASS = "Test@123456";

const registerUser = () =>
  request(app).post("/api/v1/auth/register").send({
    name: "Test User",
    email: TEST_EMAIL,
    password: TEST_PASS,
  });

const loginUser = () =>
  request(app).post("/api/v1/auth/login").send({
    email: TEST_EMAIL,
    password: TEST_PASS,
  });

// Tests
describe("POST /api/v1/auth/register", () => {
  it("registers a new user and returns 201", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it("rejects duplicate email with 409", async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects weak password with 400", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test",
      email: "weak@test.shopsphere.com",
      password: "password", // No uppercase, no number
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("rejects invalid email format with 400", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      name: "Test",
      email: "not-an-email",
      password: TEST_PASS,
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await registerUser();
    // Manually verify email so login works
    await User.findOneAndUpdate({ email: TEST_EMAIL }, { isVerified: true });
  });

  it("returns access token and sets refresh cookie on valid credentials", async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/refreshToken/);
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: TEST_EMAIL,
      password: "Wrong@Password1",
    });
    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  it("rejects non-existent email with 401 (same message to prevent enumeration)", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "nobody@test.shopsphere.com",
      password: TEST_PASS,
    });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });
});

describe("GET /api/v1/auth/me", () => {
  let accessToken: string;

  beforeEach(async () => {
    await registerUser();
    await User.findOneAndUpdate({ email: TEST_EMAIL }, { isVerified: true });
    const res = await loginUser();
    accessToken = res.body.data.accessToken as string;
  });

  it("returns user profile with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(TEST_EMAIL);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("rejects request with no token", async () => {
    const res = await request(app).get("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects request with invalid token", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("returns new access token when refresh cookie is valid", async () => {
    await registerUser();
    await User.findOneAndUpdate({ email: TEST_EMAIL }, { isVerified: true });
    const loginRes = await loginUser();
    const cookie = loginRes.headers["set-cookie"][0] as string;

    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("returns 401 when no refresh cookie", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("clears refresh cookie and returns 200", async () => {
    await registerUser();
    await User.findOneAndUpdate({ email: TEST_EMAIL }, { isVerified: true });
    const loginRes = await loginUser();
    const cookie = loginRes.headers["set-cookie"][0] as string;
    const token = loginRes.body.data.accessToken as string;

    const res = await request(app)
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    // Cookie should be cleared (maxAge=0 or expires in past)
    const setCookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(setCookie).toMatch(/refreshToken=;|Max-Age=0/i);
  });
});

describe("Health Check", () => {
  it("GET /health returns 200", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});
