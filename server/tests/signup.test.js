const request = require("supertest");
const { store, resetFakes, sheetsApi, driveApi } = require("./helpers/fakes");
const { buildApp, memberRow, freezeClock } = require("./helpers/testUtils");

const app = buildApp();
const PHOTO = Buffer.from("fake-jpeg-bytes");

function submitSignup(fields = {}, { withPhoto = true } = {}) {
    const body = {
        fName: "Rahul Sharma",
        email: "  Rahul@Example.com ",
        mobileNo: "9000000001",
        address: "Mumbai",
        dOB: "01-01-2000",
        age: "26",
        bloodGroup: "O+",
        workoutTime: "Morning",
        ...fields,
    };
    let req = request(app).post("/user/signup");
    Object.entries(body).forEach(([key, value]) => {
        req = req.field(key, value);
    });
    if (withPhoto) {
        req = req.attach("uPhoto", PHOTO, { filename: "photo.jpg", contentType: "image/jpeg" });
    }
    return req;
}

beforeEach(() => {
    freezeClock("2026-11-10T10:00:00Z");
    resetFakes();
});

afterEach(() => jest.useRealTimers());

describe("POST /user/signup", () => {
    test("appends a new member row with normalised values and a one-year validity", async () => {
        const res = await submitSignup();

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sheetsApi.spreadsheets.values.append).toHaveBeenCalledTimes(1);
        expect(store.UserData[1]).toEqual(["rahul sharma", "rahul@example.com", "9000000001", "Mumbai", "new-photo-id", "10-11-2026", "10-11-2027", "01-01-2000", "26", "O+", "Morning", "No", "", "", "No", "No"]);
    });

    test("uploads the photo to the configured Drive folder, named after the email", async () => {
        await submitSignup();

        const call = driveApi.files.create.mock.calls[0][0];
        expect(call.resource).toEqual({ name: "rahul@example.com.jpg", parents: ["test-photo-folder"] });
        expect(call.media.mimeType).toBe("image/jpeg");
    });

    test("reuses the first cleared row instead of appending", async () => {
        resetFakes({ userRows: [memberRow({ email: "a@example.com", fileId: "a" }), [], memberRow({ email: "b@example.com", fileId: "b" })] });

        const res = await submitSignup();

        expect(res.status).toBe(200);
        expect(sheetsApi.spreadsheets.values.append).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("UserData!A3");
        expect(store.UserData[2][1]).toBe("rahul@example.com");
        expect(store.UserData[1][1]).toBe("a@example.com");
        expect(store.UserData[3][1]).toBe("b@example.com");
    });

    test("re-registration overwrites the same row, resets payment and deletes the old photo", async () => {
        resetFakes({
            userRows: [
                memberRow({ email: "other@example.com", fileId: "other" }),
                memberRow({ email: "rahul@example.com", fileId: "old-photo", paid: "Yes", amount: "3000", acceptedBy: "Admin", fiveDay: "Yes", expiryDay: "Yes" }),
            ],
        });

        const res = await submitSignup({ email: "RAHUL@example.com" });

        expect(res.status).toBe(200);
        expect(sheetsApi.spreadsheets.values.append).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.update.mock.calls[0][0].range).toBe("UserData!A3");
        const row = store.UserData[2];
        expect(row[4]).toBe("new-photo-id");
        expect(row.slice(11)).toEqual(["No", "", "", "No", "No"]);
        expect(driveApi.files.delete).toHaveBeenCalledWith({ fileId: "old-photo" });
        expect(store.UserData[1][1]).toBe("other@example.com");
    });

    test("an old-photo delete failure does not fail the signup", async () => {
        resetFakes({ userRows: [memberRow({ fileId: "old-photo" })] });
        driveApi.files.delete.mockRejectedValue(new Error("drive down"));

        const res = await submitSignup();

        expect(res.status).toBe(200);
    });

    test("returns 500 and leaves the sheet and old photo untouched when the upload fails", async () => {
        resetFakes({ userRows: [memberRow({ fileId: "old-photo" })] });
        driveApi.files.create.mockRejectedValue(new Error("upload failed"));

        const res = await submitSignup();

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(sheetsApi.spreadsheets.values.update).not.toHaveBeenCalled();
        expect(sheetsApi.spreadsheets.values.append).not.toHaveBeenCalled();
        expect(driveApi.files.delete).not.toHaveBeenCalled();
    });

    test("removes the freshly uploaded photo when the sheet write fails", async () => {
        sheetsApi.spreadsheets.values.append.mockRejectedValue(new Error("sheet write failed"));

        const res = await submitSignup();

        expect(res.status).toBe(500);
        expect(driveApi.files.delete).toHaveBeenCalledWith({ fileId: "new-photo-id" });
    });

    // Current behaviour: no input validation, so a missing photo surfaces as a generic 500 (CLAUDE.md §8.3 asks for 400).
    test("a request without a photo is rejected with 500 and writes nothing", async () => {
        const res = await submitSignup({}, { withPhoto: false });

        expect(res.status).toBe(500);
        expect(sheetsApi.spreadsheets.values.append).not.toHaveBeenCalled();
        expect(driveApi.files.create).not.toHaveBeenCalled();
    });

    test("uses the IST date even when UTC is still the previous day", async () => {
        // 19:00 UTC on 9 Nov is 00:30 IST on 10 Nov
        freezeClock("2026-11-09T19:00:00Z");

        await submitSignup();

        expect(store.UserData[1][5]).toBe("10-11-2026");
    });

    test("a 29-Feb start rolls the end date forward to 01-Mar", async () => {
        freezeClock("2028-02-29T06:00:00Z");

        await submitSignup();

        expect(store.UserData[1][5]).toBe("29-02-2028");
        expect(store.UserData[1][6]).toBe("01-03-2029");
    });
});
