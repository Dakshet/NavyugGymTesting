const request = require("supertest");
const jwt = require("jsonwebtoken");
const { resetFakes, sheetsApi } = require("./helpers/fakes");
const { buildApp, authToken, adminRow, ADMIN_MOBILE, ADMIN_PASSWORD } = require("./helpers/testUtils");

const app = buildApp();

const PROTECTED_ROUTES = [
    ["get", "/user/admin/feespending"],
    ["get", "/user/admin/search/?name=rahul"],
    ["get", "/user/admin/feesdeadline"],
    ["put", "/user/admin/feesaccept/file-1"],
    ["delete", "/user/admin/deletedata/file-1"],
    ["get", "/user/admin/fetchimage/file-1"],
    ["get", "/user/admin/homedata"],
    ["get", "/user/admin/feesend"],
    ["get", "/user/admin/fetchmonthwise/11"],
    ["get", "/user/admin/fetchdays"],
];

beforeEach(() => resetFakes({ adminRows: [adminRow()] }));

describe("fetchUser middleware on protected routes", () => {
    test.each(PROTECTED_ROUTES)("%s %s without a token returns 404", async (method, path) => {
        const res = await request(app)[method](path);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, Error: "Token is not found!" });
        expect(sheetsApi.spreadsheets.values.get).not.toHaveBeenCalled();
    });

    test.each(PROTECTED_ROUTES)("%s %s with a garbage token returns 400", async (method, path) => {
        const res = await request(app)[method](path).set("auth_token", "not-a-jwt");

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, Error: "Invalid or expired token!" });
    });

    test("an expired token returns 400 so the frontend forces logout", async () => {
        const expired = authToken({ expiresIn: -10 });

        const res = await request(app).get("/user/admin/fetchdays").set("auth_token", expired);

        expect(res.status).toBe(400);
    });

    test("a token signed with a different secret returns 400", async () => {
        const forged = jwt.sign({ user: { id: ADMIN_MOBILE } }, "other-secret");

        const res = await request(app).get("/user/admin/fetchdays").set("auth_token", forged);

        expect(res.status).toBe(400);
    });

    test("a valid token reaches the handler", async () => {
        const res = await request(app).get("/user/admin/fetchdays").set("auth_token", authToken());

        expect(res.status).toBe(200);
    });
});

describe("POST /user/login/admin", () => {
    test("returns 201 and a token carrying the mobile number as user.id", async () => {
        const res = await request(app).post("/user/login/admin").send({ mobileNo: ADMIN_MOBILE, password: ADMIN_PASSWORD });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        const payload = jwt.verify(res.body.token, process.env.JWT_SECURE);
        expect(payload.user.id).toBe(ADMIN_MOBILE);
        expect(payload.exp - payload.iat).toBe(45 * 60);
    });

    test("returns 400 when the mobile number is unknown", async () => {
        const res = await request(app).post("/user/login/admin").send({ mobileNo: "1111111111", password: ADMIN_PASSWORD });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, Error: "User not found!" });
    });

    test("returns 400 when the password is wrong", async () => {
        const res = await request(app).post("/user/login/admin").send({ mobileNo: ADMIN_MOBILE, password: "wrong" });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, Error: "Passwords doesn't match!" });
        expect(res.body.token).toBeUndefined();
    });

    test("returns 500 without leaking internals when the sheet cannot be read", async () => {
        sheetsApi.spreadsheets.values.get.mockRejectedValue(new Error("quota exceeded: secret detail"));

        const res = await request(app).post("/user/login/admin").send({ mobileNo: ADMIN_MOBILE, password: ADMIN_PASSWORD });

        expect(res.status).toBe(500);
        expect(JSON.stringify(res.body)).not.toMatch(/quota|secret detail/);
    });
});
