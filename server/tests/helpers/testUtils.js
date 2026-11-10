const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// index.js calls app.listen on import, so tests mount the same router on their own app.
function buildApp() {
    const app = express();
    app.use(express.json());
    app.use("/user", require("../../routes/user"));
    return app;
}

const ADMIN_MOBILE = "9999999999";
const ADMIN_PASSWORD = "correct-password";

function authToken(options = { expiresIn: "10m" }, mobile = ADMIN_MOBILE) {
    return jwt.sign({ user: { id: mobile } }, process.env.JWT_SECURE, options);
}

// AdminData rows (header excluded): name in A, mobile in C, bcrypt hash in H.
function adminRow({ name = "Test Admin", mobile = ADMIN_MOBILE, password = ADMIN_PASSWORD } = {}) {
    const row = [];
    row[0] = name;
    row[2] = mobile;
    row[7] = bcrypt.hashSync(password, 4);
    return row;
}

// UserData row with all 16 columns (A..P). Override by column name.
function memberRow(overrides = {}) {
    const m = {
        name: "rahul sharma",
        email: "rahul@example.com",
        mobile: "9000000001",
        address: "Mumbai",
        fileId: "file-1",
        start: "01-11-2026",
        end: "01-11-2027",
        dob: "01-01-2000",
        age: "26",
        blood: "O+",
        workout: "Morning",
        paid: "No",
        amount: "",
        acceptedBy: "",
        fiveDay: "No",
        expiryDay: "No",
        ...overrides,
    };
    return [m.name, m.email, m.mobile, m.address, m.fileId, m.start, m.end, m.dob, m.age, m.blood, m.workout, m.paid, m.amount, m.acceptedBy, m.fiveDay, m.expiryDay];
}

// Only Date is faked: faking timers wholesale would stall supertest.
function freezeClock(isoString) {
    jest.useFakeTimers({
        now: new Date(isoString),
        doNotFake: ["nextTick", "setImmediate", "clearImmediate", "setInterval", "clearInterval", "setTimeout", "clearTimeout", "queueMicrotask", "performance", "hrtime"],
    });
}

module.exports = { buildApp, authToken, adminRow, memberRow, freezeClock, ADMIN_MOBILE, ADMIN_PASSWORD };
