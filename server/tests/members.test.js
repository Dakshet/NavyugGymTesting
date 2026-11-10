const request = require("supertest");
const { store, resetFakes, sheetsApi, driveApi, sendMail } = require("./helpers/fakes");
const { buildApp, authToken, adminRow, memberRow, freezeClock } = require("./helpers/testUtils");

const app = buildApp();
const asAdmin = (req) => req.set("auth_token", authToken());

beforeEach(() => {
    freezeClock("2026-11-10T10:00:00Z");
});

afterEach(() => jest.useRealTimers());

describe("GET /user/admin/feespending", () => {
    test("returns only unpaid members, newest start date first", async () => {
        resetFakes({
            userRows: [
                memberRow({ fileId: "old", start: "01-10-2026" }),
                memberRow({ fileId: "paid", paid: "Yes" }),
                [],
                memberRow({ fileId: "new", start: "05-11-2026" }),
            ],
        });

        const res = await asAdmin(request(app).get("/user/admin/feespending"));

        expect(res.status).toBe(200);
        expect(res.body.Data.map((row) => row[4])).toEqual(["new", "old"]);
    });

    test("returns 500 when the sheet cannot be read", async () => {
        resetFakes();
        sheetsApi.spreadsheets.values.get.mockRejectedValue(new Error("boom"));

        const res = await asAdmin(request(app).get("/user/admin/feespending"));

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });
});

describe("GET /user/admin/search", () => {
    beforeEach(() => {
        resetFakes({
            userRows: [
                memberRow({ name: "rahul sharma", mobile: "9000000001", fileId: "a" }),
                [],
                memberRow({ name: "priya patel", mobile: "9000000002", fileId: "b" }),
            ],
        });
    });

    test.each([
        ["first name", "rahul", "a"],
        ["surname", "sharma", "a"],
        ["mobile number", "9000000002", "b"],
        ["a case-insensitive query", "PRIYA", "b"],
    ])("finds a member by %s", async (_label, query, fileId) => {
        const res = await asAdmin(request(app).get("/user/admin/search/").query({ name: query }));

        expect(res.status).toBe(200);
        expect(res.body.Data.map((row) => row[4])).toEqual([fileId]);
    });

    test("reports when nobody matches", async () => {
        const res = await asAdmin(request(app).get("/user/admin/search/").query({ name: "nobody" }));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, Data: "User is not found!" });
    });
});

describe("GET /user/admin/feesdeadline", () => {
    test("returns members from 5 days before expiry through the expiry day (IST), newest start first", async () => {
        resetFakes({
            userRows: [
                memberRow({ fileId: "five-days", end: "15-11-2026", start: "15-11-2025" }),
                memberRow({ fileId: "today", end: "10-11-2026", start: "10-11-2025" }),
                memberRow({ fileId: "six-days", end: "16-11-2026" }),
                memberRow({ fileId: "yesterday", end: "09-11-2026" }),
                [],
            ],
        });

        const res = await asAdmin(request(app).get("/user/admin/feesdeadline"));

        expect(res.status).toBe(200);
        expect(res.body.Data.map((row) => row[4])).toEqual(["five-days", "today"]);
    });

    test("is read-only: no mail, no sheet writes, no Drive deletes", async () => {
        resetFakes({ userRows: [memberRow({ end: "12-11-2026" })] });

        await asAdmin(request(app).get("/user/admin/feesdeadline"));

        expect(sendMail).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.update).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.clear).not.toHaveBeenCalled();
        expect(driveApi.files.delete).not.toHaveBeenCalled();
    });

    test("uses the IST day: 19:00 UTC on 14 Nov is already 15 Nov in India", async () => {
        freezeClock("2026-11-14T19:00:00Z");
        resetFakes({ userRows: [memberRow({ fileId: "ends-20", end: "20-11-2026" }), memberRow({ fileId: "ends-19", end: "19-11-2026" })] });

        const res = await asAdmin(request(app).get("/user/admin/feesdeadline"));

        // ends-20 only enters its window (15-20 Nov) on the IST date
        expect(res.body.Data.map((row) => row[4]).sort()).toEqual(["ends-19", "ends-20"]);
    });
});

describe("GET /user/admin/feesend", () => {
    test("returns members expired within the 15-day grace window, and is read-only", async () => {
        resetFakes({
            userRows: [
                memberRow({ fileId: "today", end: "10-11-2026" }),
                memberRow({ fileId: "yesterday", end: "09-11-2026" }),
                memberRow({ fileId: "grace-edge", end: "26-10-2026" }),
                memberRow({ fileId: "purgeable", end: "25-10-2026" }),
                memberRow({ fileId: "future", end: "20-11-2026" }),
                [],
            ],
        });

        const res = await asAdmin(request(app).get("/user/admin/feesend"));

        expect(res.status).toBe(200);
        expect(res.body.Data.map((row) => row[4]).sort()).toEqual(["grace-edge", "yesterday"]);
        expect(sendMail).not.toHaveBeenCalled();
        expect(driveApi.files.delete).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.clear).not.toHaveBeenCalled();
    });
});

describe("PUT /user/admin/feesaccept/:id", () => {
    beforeEach(() => {
        resetFakes({
            userRows: [memberRow({ fileId: "other", email: "other@example.com" }), memberRow({ fileId: "target", email: "rahul@example.com", name: "rahul sharma" })],
            adminRows: [adminRow({ name: "Test Admin" })],
        });
    });

    test("records payment and admin name, then emails the PDF receipt", async () => {
        const res = await asAdmin(request(app).put("/user/admin/feesaccept/target")).send({ amount: "3000" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, Data: "Successfully Add Member" });
        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("UserData!L3");
        expect(store.UserData[2].slice(11, 14)).toEqual(["Yes", "3000", "Test Admin"]);
        expect(store.UserData[1][11]).toBe("No");

        expect(sendMail).toHaveBeenCalledTimes(1);
        const mail = sendMail.mock.calls[0][0];
        expect(mail.to).toBe("rahul@example.com");
        expect(mail.subject).toMatch(/Membership is Approved/);
        expect(mail.attachments).toHaveLength(1);
        expect(mail.attachments[0]).toMatchObject({ filename: "gym-registration-receipt.pdf", contentType: "application/pdf" });
        expect(Buffer.isBuffer(mail.attachments[0].content)).toBe(true);
    });

    test("returns 404 and sends nothing for an unknown member", async () => {
        const res = await asAdmin(request(app).put("/user/admin/feesaccept/missing")).send({ amount: "3000" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, Error: "Member not found!" });
        expect(sheetsApi.spreadsheets.values.update).not.toHaveBeenCalled();
        expect(sendMail).not.toHaveBeenCalled();
    });

    test("still approves but tells the admin when the receipt email fails", async () => {
        sendMail.mockRejectedValue(new Error("smtp down"));

        const res = await asAdmin(request(app).put("/user/admin/feesaccept/target")).send({ amount: "5000" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.Data).toMatch(/receipt email could not be sent/);
        expect(store.UserData[2][11]).toBe("Yes");
    });

    test("returns 500 when the sheet write fails", async () => {
        sheetsApi.spreadsheets.values.update.mockRejectedValue(new Error("write failed"));

        const res = await asAdmin(request(app).put("/user/admin/feesaccept/target")).send({ amount: "3000" });

        expect(res.status).toBe(500);
        expect(sendMail).not.toHaveBeenCalled();
    });
});

describe("DELETE /user/admin/deletedata/:id", () => {
    beforeEach(() => {
        resetFakes({ userRows: [memberRow({ fileId: "keep" }), memberRow({ fileId: "remove" })] });
    });

    test("deletes the Drive photo and clears (not removes) the sheet row", async () => {
        const res = await asAdmin(request(app).delete("/user/admin/deletedata/remove"));

        expect(res.status).toBe(200);
        expect(driveApi.files.delete).toHaveBeenCalledWith({ fileId: "remove" });
        expect(sheetsApi.spreadsheets.values.clear.mock.calls[0][0].range).toBe("UserData!A3:Q3");
        expect(store.UserData).toHaveLength(3);
        expect(store.UserData[2]).toEqual([]);
        expect(store.UserData[1][4]).toBe("keep");
    });

    // Current behaviour: an unknown id is not reported as 404 and nothing is touched.
    test("an unknown id changes nothing", async () => {
        const res = await asAdmin(request(app).delete("/user/admin/deletedata/missing"));

        expect(res.status).toBe(200);
        expect(driveApi.files.delete).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.clear).not.toHaveBeenCalled();
    });

    // Current behaviour: a failed Drive delete is only logged, so the row survives and the API still answers 200.
    test("keeps the row when the Drive delete fails", async () => {
        driveApi.files.delete.mockRejectedValue(new Error("drive down"));

        await asAdmin(request(app).delete("/user/admin/deletedata/remove"));

        expect(sheetsApi.spreadsheets.values.clear).not.toHaveBeenCalled();
        expect(store.UserData[2][4]).toBe("remove");
    });
});

describe("GET /user/admin/fetchimage/:id", () => {
    beforeEach(() => {
        resetFakes();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete global.fetch;
    });

    test("rejects ids with characters outside [A-Za-z0-9_-] without calling upstream", async () => {
        const res = await asAdmin(request(app).get("/user/admin/fetchimage/bad.id"));

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ success: false, Error: "Invalid member ID!" });
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("returns the photo as a base64 data URI", async () => {
        global.fetch.mockResolvedValue({ ok: true, arrayBuffer: async () => new TextEncoder().encode("img").buffer });

        const res = await asAdmin(request(app).get("/user/admin/fetchimage/abc_123-X"));

        expect(res.status).toBe(200);
        expect(global.fetch.mock.calls[0][0]).toBe("https://lh3.googleusercontent.com/d/abc_123-X");
        expect(res.body.imageLink).toBe(`data:image/jpeg;base64,${Buffer.from("img").toString("base64")}`);
    });

    test("returns 500 when the upstream responds with an error", async () => {
        global.fetch.mockResolvedValue({ ok: false });

        const res = await asAdmin(request(app).get("/user/admin/fetchimage/abc"));

        expect(res.status).toBe(500);
    });
});

describe("GET /user/admin/homedata", () => {
    test("counts insiders, outsiders, time slots and age groups for paid-amount members only", async () => {
        resetFakes({
            adminRows: [adminRow({ name: "Test Admin Kumar" })],
            userRows: [
                memberRow({ amount: "2000", workout: "Morning", age: "14" }),
                memberRow({ amount: "3000", workout: "Evening", age: "18" }),
                memberRow({ amount: "5000", workout: "Morning", age: "25" }),
                memberRow({ amount: "6000", workout: "Evening", age: "45" }),
                memberRow({ amount: "", workout: "Morning", age: "30" }),
                [],
            ],
        });

        const res = await asAdmin(request(app).get("/user/admin/homedata"));

        expect(res.status).toBe(200);
        expect(res.body.Data).toEqual({
            adminFirstName: "Test",
            totalMembers: 4,
            insiderMembers: 2,
            outsiderMembers: 2,
            morningMembers: 2,
            eveningMembers: 2,
            membersBelowFifteen: 1,
            fifteenToTwenty: 1,
            twentyToThirty: 1,
            membersAboveThirty: 1,
        });
    });
});

describe("GET /user/admin/fetchmonthwise/:month", () => {
    test("returns paid, active members who started in that month, newest first", async () => {
        resetFakes({
            userRows: [
                memberRow({ fileId: "early", paid: "Yes", start: "02-11-2026" }),
                memberRow({ fileId: "late", paid: "Yes", start: "20-11-2025" }),
                memberRow({ fileId: "unpaid", paid: "No", start: "05-11-2026" }),
                memberRow({ fileId: "other-month", paid: "Yes", start: "05-10-2026" }),
                memberRow({ fileId: "january", paid: "Yes", start: "05-01-2026" }),
                [],
            ],
        });

        const res = await asAdmin(request(app).get("/user/admin/fetchmonthwise/11"));

        expect(res.status).toBe(200);
        expect(res.body.Data.map((row) => row[4])).toEqual(["early", "late"]);
    });

    test("matches zero-padded months with an unpadded month parameter", async () => {
        resetFakes({ userRows: [memberRow({ fileId: "january", paid: "Yes", start: "05-01-2026" })] });

        const res = await asAdmin(request(app).get("/user/admin/fetchmonthwise/1"));

        expect(res.body.Data.map((row) => row[4])).toEqual(["january"]);
    });
});

describe("GET /user/admin/fetchdays", () => {
    test("returns the configured days-for-subscription-end setting", async () => {
        const first = adminRow();
        first[5] = "30";
        resetFakes({ adminRows: [first] });

        const res = await asAdmin(request(app).get("/user/admin/fetchdays"));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, Data: "30" });
    });
});
