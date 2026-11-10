const request = require("supertest");
const { store, resetFakes, sheetsApi, driveApi, sendMail } = require("./helpers/fakes");
const { buildApp, adminRow, memberRow, freezeClock } = require("./helpers/testUtils");

const app = buildApp();
const cron = () => request(app).get("/user/cron/daily").set("Authorization", "Bearer test-cron-secret");

beforeEach(() => {
    freezeClock("2026-11-10T10:00:00Z");
});

afterEach(() => jest.useRealTimers());

describe("GET /user/cron/daily authorisation", () => {
    beforeEach(() => resetFakes({ userRows: [memberRow({ end: "10-11-2026" })] }));

    test("rejects a request without the bearer secret", async () => {
        const res = await request(app).get("/user/cron/daily");

        expect(res.status).toBe(401);
        expect(sendMail).not.toHaveBeenCalled();
    });

    test("rejects a wrong secret of the same length", async () => {
        const res = await request(app).get("/user/cron/daily").set("Authorization", "Bearer test-cron-secreX");

        expect(res.status).toBe(401);
    });

    test("fails closed with 500 when CRON_SECRET is not configured", async () => {
        const original = process.env.CRON_SECRET;
        delete process.env.CRON_SECRET;
        try {
            const res = await request(app).get("/user/cron/daily").set("Authorization", "Bearer ");

            expect(res.status).toBe(500);
            expect(sendMail).not.toHaveBeenCalled();
        } finally {
            process.env.CRON_SECRET = original;
        }
    });
});

describe("GET /user/cron/daily reminders", () => {
    test("sends the 5-day reminder once and marks column O", async () => {
        resetFakes({ userRows: [memberRow({ name: "rahul sharma", email: "r@example.com", end: "15-11-2026" })] });

        const res = await cron();

        expect(res.status).toBe(200);
        expect(res.body.Data.reminders).toEqual({ sent: 1, failed: 0 });
        expect(sendMail).toHaveBeenCalledTimes(1);
        const mail = sendMail.mock.calls[0][0];
        expect(mail.to).toBe("r@example.com");
        expect(mail.subject).toMatch(/Expire in 5 Days/);
        expect(mail.text).toContain("Dear Rahul");
        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("UserData!O2");
        expect(store.UserData[1][14]).toBe("Yes");
        expect(store.UserData[1][15]).toBe("No");

        sendMail.mockClear();
        await cron();
        expect(sendMail).not.toHaveBeenCalled();
    });

    test("sends the expiry-day reminder and marks column P", async () => {
        resetFakes({ userRows: [memberRow({ end: "10-11-2026", fiveDay: "Yes" })] });

        const res = await cron();

        expect(res.status).toBe(200);
        expect(sendMail.mock.calls[0][0].subject).toMatch(/Ends Today/);
        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("UserData!P2");
        expect(store.UserData[1][15]).toBe("Yes");
    });

    test("does not resend when the flag is already Yes", async () => {
        resetFakes({
            userRows: [memberRow({ end: "15-11-2026", fiveDay: "Yes" }), memberRow({ end: "10-11-2026", fiveDay: "Yes", expiryDay: "Yes" })],
        });

        const res = await cron();

        expect(res.status).toBe(200);
        expect(sendMail).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.update).not.toHaveBeenCalled();
    });

    test("ignores members whose expiry is not exactly 5 days away or today", async () => {
        resetFakes({ userRows: [memberRow({ end: "14-11-2026" }), memberRow({ end: "16-11-2026" }), []] });

        await cron();

        expect(sendMail).not.toHaveBeenCalled();
    });

    test("a failed mail leaves the flag unset (so it retries) and the job reports failure", async () => {
        resetFakes({ userRows: [memberRow({ end: "15-11-2026" })] });
        sendMail.mockRejectedValue(new Error("smtp down"));

        const res = await cron();

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.Data.reminders).toEqual({ sent: 0, failed: 1 });
        expect(store.UserData[1][14]).toBe("No");
    });

    test("one failing member does not stop the others", async () => {
        resetFakes({ userRows: [memberRow({ email: "bad@example.com", end: "15-11-2026" }), memberRow({ email: "good@example.com", end: "15-11-2026" })] });
        sendMail.mockImplementation(async ({ to }) => {
            if (to === "bad@example.com") throw new Error("rejected");
            return { messageId: "ok" };
        });

        const res = await cron();

        expect(res.body.Data.reminders).toEqual({ sent: 1, failed: 1 });
        expect(store.UserData[1][14]).toBe("No");
        expect(store.UserData[2][14]).toBe("Yes");
    });
});

describe("GET /user/cron/daily purge", () => {
    test("clears rows and deletes photos for members expired more than 15 days ago", async () => {
        resetFakes({
            userRows: [
                memberRow({ fileId: "expired", end: "25-10-2026" }),
                memberRow({ fileId: "grace-edge", end: "26-10-2026" }),
                memberRow({ fileId: "active", end: "01-11-2027" }),
                [],
            ],
        });

        const res = await cron();

        expect(res.status).toBe(200);
        expect(res.body.Data.purge).toEqual({ removed: 1, failed: 0 });
        expect(driveApi.files.delete).toHaveBeenCalledTimes(1);
        expect(driveApi.files.delete).toHaveBeenCalledWith({ fileId: "expired" });
        expect(sheetsApi.spreadsheets.values.clear.mock.calls[0][0].range).toBe("UserData!A2:Q2");
        expect(store.UserData).toHaveLength(5);
        expect(store.UserData[1]).toEqual([]);
        expect(store.UserData[2][4]).toBe("grace-edge");
    });

    test("keeps the row when its Drive photo cannot be deleted, and reports failure", async () => {
        resetFakes({ userRows: [memberRow({ fileId: "expired", end: "25-10-2026" })] });
        driveApi.files.delete.mockRejectedValue(new Error("drive down"));

        const res = await cron();

        expect(res.status).toBe(500);
        expect(res.body.Data.purge).toEqual({ removed: 0, failed: 1 });
        expect(store.UserData[1][4]).toBe("expired");
    });

    test("returns 500 without leaking details when the sheet cannot be read", async () => {
        resetFakes();
        sheetsApi.spreadsheets.values.get.mockRejectedValue(new Error("secret detail"));

        const res = await cron();

        expect(res.status).toBe(500);
        expect(JSON.stringify(res.body)).not.toMatch(/secret detail/);
    });
});

describe("GET /user/admin/visitdata", () => {
    // Sheet row 7 of AdminData holds the monthly counters (data index 5, columns A-L = Jan-Dec).
    function seedCounters(counters) {
        const admins = [adminRow(), adminRow(), adminRow(), adminRow(), adminRow()];
        admins.push(counters);
        resetFakes({ adminRows: admins });
    }

    test("is public and increments the current month's counter in the right cell", async () => {
        seedCounters(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "41", "12"]);

        const res = await request(app).get("/user/admin/visitdata");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ success: true, Data: "Success" });
        const call = sheetsApi.spreadsheets.values.update.mock.calls[0][0];
        expect(call.range).toBe("AdminData!K7");
        expect(call.resource.values).toEqual([[42]]);
    });

    test("picks the month in IST: 20:00 UTC on 31 Oct is already November", async () => {
        freezeClock("2026-10-31T20:00:00Z");
        seedCounters(["0", "0", "0", "0", "0", "0", "0", "0", "0", "7", "0", "0"]);

        await request(app).get("/user/admin/visitdata");

        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("AdminData!K7");
    });

    test("returns 500 when the counter row is missing", async () => {
        resetFakes({ adminRows: [adminRow()] });

        const res = await request(app).get("/user/admin/visitdata");

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });
});
