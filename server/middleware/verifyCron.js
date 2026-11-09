const crypto = require("crypto");

// Vercel cron sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET env var is set.
const verifyCron = (req, res, next) => {
    const secret = process.env.CRON_SECRET;

    if (!secret) {
        console.error("CRON_SECRET is not set; refusing cron request");
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }

    const expected = Buffer.from(`Bearer ${secret}`);
    const received = Buffer.from(req.header("authorization") || "");

    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
        return res.status(401).json({ success: false, Error: "Unauthorized" })
    }

    next();
}

module.exports = {
    verifyCron,
}
