require('dotenv').config()
const stream = require('stream');

const jwt = require("jsonwebtoken")
const JWT_SECURE = process.env.JWT_SECURE;
const { google } = require("googleapis");
const nodemailer = require("nodemailer")
const { jsPDF } = require("jspdf");     // Import the jsPDF library
require("jspdf-autotable"); // Import jsPDF autoTable plugin
const TOKEN_EXPIRATION = "45m";     // Token will expire in 1 hour (use other formats like '2d', '10m', '365d' as needed
const bcrypt = require("bcryptjs")


// Keys 
const private_key = process.env.PRIVATE_KEY
const client_email = process.env.CLIENT_EMAIL
const spreadsheetId = process.env.SPREADSHEETID
const PHOTO_FOLDER_ID = process.env.DRIVE_PHOTO_FOLDER_ID


// Get Auth Here
async function getAuth() {
    try {

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: client_email,
                private_key: private_key
            },
            scopes: ["https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive"
            ]
        })

        return auth;

    } catch (error) {
        console.log("Get Auth", error.message)
    }

}


// Access google sheet
async function accessGoogleSheet() {
    try {
        const auth = await getAuth(); // Implement your authentication logic here
        const client = await auth.getClient();

        const sheets = google.sheets({ version: "v4", auth: client });

        return sheets;

    } catch (error) {
        console.error("Error accessing Google Sheet:", error.message);
        // Handle errors appropriately (e.g., throw an exception)
    }
}


// Access Google Drive Using Buffer Storage
async function uploadToGoogleDrive(fileBuffer, mimeType, fileName) {
    if (!PHOTO_FOLDER_ID) {
        throw new Error("DRIVE_PHOTO_FOLDER_ID is not set");
    }

    const auth = await getAuth();

    // Obtain an authenticated client
    const drive = google.drive({ version: "v3", auth })

    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileBuffer);

    const response = await drive.files.create({
        resource: {
            name: fileName,
            parents: [PHOTO_FOLDER_ID]
        },
        media: {
            mimeType: mimeType,
            body: bufferStream
        },
        fields: 'id, webViewLink'
    });

    return response.data;
}



// Business dates are IST. Vercel runs in UTC, so read the date parts in Asia/Kolkata explicitly
// instead of using the local getters on new Date().
function getIstDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date);
    const partValue = (type) => Number(parts.find((part) => part.type === type).value);
    return { year: partValue("year"), month: partValue("month"), day: partValue("day") };
}

// Method
async function createPdf(fullName, fullInfo, amount, userName) {
    // Create a new instance of jsPDF
    const doc = new jsPDF();

    // Current Date
    // Add Date
    // const currentDate = new Date();

    // // Get individual components:
    // const year = currentDate.getFullYear();
    // const month = currentDate.getMonth() + 1; // Months are 0-indexed
    // const day = currentDate.getDate();

    // // Format the date:
    // const formattedDate
    //     = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;


    // Add Date according to Indian Standard Time
    const currentDate = new Date();

    // Format the date to Indian Standard Time
    const options = { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-IN', options).format(currentDate);

    // console.log(formattedDate); // Outputs the date in DD-MM-YYYY format as per IST


    // Add since
    doc.setFontSize(8);
    doc.text(`(since 1954)`, 150, 20);

    // Add a title to the PDF
    doc.setFontSize(25);
    doc.setFont("helvetica", "bold");
    // doc.setTextColor(255, 0, 0); // Set text color to red (RGB format)
    doc.text("Navyug Gym Receipt", 60, 20);

    // Set font to bold

    // Reset font to normal for other text
    doc.setFont("helvetica", "normal");


    // Draw a horizontal line below the title (at Y = 25)
    doc.setLineWidth(0.5); // Optional: Set line width
    doc.line(20, 28, 190, 28); // Draw line from (20, 25) to (190, 25)


    // doc.setTextColor(0, 0, 0);   //Reset text color


    // Add Date
    doc.setFontSize(10);
    doc.text(`Date: ${formattedDate}`, 159, 37);
    // doc.text(`Thank you for registering, Dakshet!`, 20, 30);

    // Add some space
    doc.setFontSize(12);
    doc.text(`Name: ${fullName}`, 20, 43);

    doc.setFontSize(10);
    doc.text(`Email Id: ${fullInfo[1]}`, 20, 53);
    doc.text(`Phone no: +91 ${fullInfo[2]}`, 20, 63);
    doc.text(`Address: ${fullInfo[3]}`, 20, 73);

    // Add table headers
    // const headers = ['Name', 'Email', 'Amount'];
    // const rows = [
    //     [clientData.name, clientData.email, `$${clientData.amount}`]
    // ];

    // Add table headers
    const headers = ['    Sr No.', '    Workout Type', '                 Plan Validity', '   Payment Method', ' Amount'];
    const rows = [
        ["       1", "           Gym", `    ${fullInfo[5]}    To    ${fullInfo[6]}`, "              Cash", `    ${amount}`],
        ["", "", "", "              Total", `    ${amount}`]
    ];


    // Add a table to the PDF
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 83,  // Position where the table starts (adjust as needed)
        theme: 'grid', // You can customize the table style here (grid, stripped, etc.)
        headStyles: { fillColor: [192, 192, 192] }, // Custom color for header cells
        bodyStyles: { textColor: [0, 0, 0] }, // Black text color for body
        margin: { top: 20, left: 20 }, // Margin for the table
        tableWidth: 166,
        // columnStyles: {
        //     0: { cellWidth: 40 }, // Set width for the first column
        //     1: { cellWidth: 40 }, // Set width for the second column
        //     2: { cellWidth: 20 }, // Set width for the third column
        // },
        gridLineColor: [0, 0, 0], // Set the grid line color to dark black (RGB: [0, 0, 0])
    });


    doc.setFontSize(10);
    doc.text(`Received by:  Navyug Gym`, 20, 118);
    doc.text(`Received Signature:  ${userName}`, 20, 128);

    // Returned as a buffer (not a shared temp file) so concurrent approvals can't overwrite each other's receipt.
    return Buffer.from(doc.output("arraybuffer"));
}









// Fetch All Data from sheet 1
async function sendMails(email, subject, text, attachments) {
    try {

        // Create reusable transporter object using the default SMTP transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.USER,       // Sender gmail address 
                pass: process.env.APP_PASSWORD,     // App password from gmail account this process are written on the bottom of the web page.
            },
        });


        // mail with defined transport object
        const info = await transporter.sendMail({
            from: {
                name: "Navyug Gym",
                address: process.env.USER,
            }, // sender address
            // to: "bar@example.com, baz@example.com", // When we have list of receivers and here add gym mail account and our gym account.
            to: `${email}`,
            subject: subject, // Subject line
            text: text,
            attachments: attachments
        });

        console.log("Message sent: %s", info.messageId);

    } catch (error) {
        console.error("Send mail error:", error.message);
        // Callers decide how to surface the failure; swallowing it here made failed mails look sent.
        throw error;
    }
}






// Fetch All Data from sheet 1
async function fetchData() {
    try {

        const sheets = await accessGoogleSheet();


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "UserData"
        })

        const data = await response.data.values.slice(1);

        return data;


    } catch (error) {
        console.log("Read data error", error.message);
        // return res.status(400).json({ Error: error.message });
    }
}

async function fetchAdminData() {
    try {

        const sheets = await accessGoogleSheet();


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: "AdminData"
        })

        const data = await response.data.values.slice(1);

        return data;


    } catch (error) {
        console.log("Read data error", error.message);
        // return res.status(400).json({ Error: error.message });
    }
}


// Create New Gym Member
async function createUser(req, res) {
    try {
        //Destructure the request 
        const { fName, email, mobileNo, address, dOB, age, bloodGroup, workoutTime } = req.body;

        let fullName = fName.toLowerCase();

        // Fetch Data
        let data = await fetchData();

        // Check if email already exists and find the row index
        let existingUserIndex = -1;
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].length > 0 && data[i][1] === email) {
                    existingUserIndex = i;
                    break;
                }
            }
        }

        // Upload to Google Drive directly using stream
        const file = req.file;

        // If user exists, delete old image from Google Drive before uploading new one
        if (existingUserIndex !== -1 && data[existingUserIndex][4]) {
            try {
                const auth = await getAuth();
                const drive = google.drive({ version: "v3", auth });
                await drive.files.delete({ fileId: data[existingUserIndex][4] });
                console.log("Old image deleted from Google Drive");
            } catch (error) {
                console.log("Error deleting old image:", error.message);
            }
        }

        const driveResponse = await uploadToGoogleDrive(file.buffer, file.mimetype, `${email}.jpg`);

        // const imageLinkShree = driveResponse.webViewLink;
        const copyImageId = driveResponse.id;


        // Current date in IST, formatted DD-MM-YYYY
        const { year, month, day } = getIstDateParts();
        const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;

        // One year later; Date.UTC rolls 29-Feb forward the same way setFullYear did
        const oneYearLater = new Date(Date.UTC(year + 1, month - 1, day));
        const afterOneYearDate = `${oneYearLater.getUTCDate().toString().padStart(2, '0')}-${(oneYearLater.getUTCMonth() + 1).toString().padStart(2, '0')}-${oneYearLater.getUTCFullYear()}`;



        const sheets = await accessGoogleSheet();
        const auth = await getAuth();
        let response;

        // If user exists, update the existing row with new data
        if (existingUserIndex !== -1) {
            // Update existing user row with new data and reset payment fields
            response = await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `UserData!A${existingUserIndex + 2}`,
                valueInputOption: "USER_ENTERED",
                resource: { values: [[fullName, email, mobileNo, address, copyImageId, formattedDate, afterOneYearDate, dOB, age, bloodGroup, workoutTime, "No", "", "", "No", "No"]] }
            })
        } else {
            // Checking empty rows for new user
            let emptyIndex = 0;

            for (let i = 0; i < data.length; i++) {
                if (data[i].length === 0) {
                    emptyIndex = i + 1;
                    break;
                }
            }

            //Store user data in the database
            if (emptyIndex !== 0) {
                emptyIndex -= 1;
                response = await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `UserData!A${emptyIndex + 2}`,
                    valueInputOption: "USER_ENTERED",
                    resource: { values: [[fullName, email, mobileNo, address, copyImageId, formattedDate, afterOneYearDate, dOB, age, bloodGroup, workoutTime, "No", "", "", "No", "No"]] }
                })
            }
            else {
                response = await sheets.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: "UserData",  //Specify the start cell
                    valueInputOption: "USER_ENTERED",
                    resource: { values: [[fullName, email, mobileNo, address, copyImageId, formattedDate, afterOneYearDate, dOB, age, bloodGroup, workoutTime, "No", "", "", "No", "No"]] }
                })
            }
        }

        return res.status(200).json({ success: true, Result: response })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}



async function loginAdmin(req, res) {
    try {
        //Destructure the user
        const { mobileNo, password } = req.body;


        // Fetch Data
        let data = await fetchAdminData();
        let isMobileNoVerify = false;
        let isPasswordVerify = false;
        let index;

        //Validate the User
        for (let i = 0; i < data.length; i++) {

            if (data[i][2] === mobileNo) {
                isMobileNoVerify = true;
                index = i;
                break;
            }
        }


        if (isMobileNoVerify) {

            // if (data[index][3] === password) {
            //     isPasswordVerify = true;
            // }
            isPasswordVerify = await bcrypt.compare(password, data[index][7])
        }
        else {
            isMobileNoVerify = false;
            return res.status(400).json({ success: false, Error: "User not found!" })
        }


        if (isPasswordVerify) {

            //Create payload
            const payload = {
                user: {
                    id: mobileNo
                }
            }

            //Create a token
            const token = jwt.sign(payload, JWT_SECURE, { expiresIn: TOKEN_EXPIRATION });

            //Final
            return res.status(201).json({ success: true, token })
        }
        else {
            isPasswordVerify = false;
            return res.status(400).json({ success: false, Error: "Passwords doesn't match!" })
        }


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ Error: "Internal Serval Error Occured!" })
    }
}


// Fetch Fees pending data
async function fetchFeesPendingData(req, res) {
    try {

        let dataArray = [];
        let data = await fetchData();


        for (let j = 0; j < data.length; j++) {

            if (data[j][11] === "No") {
                // console.log(data[j])
                dataArray.push(data[j]);
            }
        }

        // Sort in descending order (youngest first)
        dataArray.sort((a, b) => {
            const dateA = new Date(a[5].split('-').reverse().join('-'));
            const dateB = new Date(b[5].split('-').reverse().join('-'));
            return dateB - dateA;
        });


        return res.status(200).json({ success: true, Data: dataArray })



    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}



// Search User
async function searchUser(req, res) {
    try {

        const name = req.query.name;  //It is also accept name, surname and mobile number

        let fullName = name.toLowerCase();
        let dataArray = [];
        let data = await fetchData();


        for (let j = 0; j < data.length; j++) {

            if (data[j].length !== 0) {
                let firstName = data[j][0].split(" ");
                if (firstName[0] === fullName || firstName[1] === fullName || data[j][2] === fullName) {
                    dataArray.push(data[j]);
                }
            }
        }

        if (dataArray.length !== 0) {
            return res.status(200).json({ success: true, Data: dataArray })
        }
        else {
            return res.status(200).json({ success: true, Data: "User is not found!" })

        }

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


const REMINDER_DAYS_BEFORE_EXPIRY = 5;
const PURGE_GRACE_DAYS = 15;
const COL_FLAG_FIVE_DAY = "O";
const COL_FLAG_EXPIRY_DAY = "P";

// "DD-MM-YYYY" (sheet format) -> Date at local midnight, comparable with todayIst().
function parseSheetDate(value) {
    const [day, month, year] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function todayIst() {
    const { year, month, day } = getIstDateParts();
    return new Date(year, month - 1, day);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Newest start date first
function sortByStartDateDesc(rows) {
    return rows.sort((a, b) => {
        const dateA = new Date(a[5].split('-').reverse().join('-'));
        const dateB = new Date(b[5].split('-').reverse().join('-'));
        return dateB - dateA;
    });
}

function capitalizeFirstName(fullName) {
    const first = fullName.split(" ")[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
}

function buildReminderMail(mailType, firstName, date) {
    if (mailType === "beforeFiveDays") {
        return {
            subject: `Reminder: Your Subscription Will Expire in 5 Days`,
            text: `
Dear ${firstName},

We hope this message finds you well! This is a friendly reminder that your subscription with Navyug Gym will expire in 5 days, on ${date}.

We encourage you to renew your membership to continue enjoying our facilities, and the support of our dedicated team to help you reach your fitness goals.

How to Renew Your Membership:
    - Visit Us at the Front Desk - Our team will be happy to assist you with the renewal process.
    - Contact Us: If you have any questions, please reach out to us via email at navyuggym@gmail.com or contact our team directly:
                        - Mahesh Wagh: +91 8291616435
                        - Suresh Tambe: +91 9870216612
                        - Santosh Mahaprolkar: +91 9969087553

We appreciate your commitment to fitness and look forward to supporting you on your journey at Navyug Gym. Don’t hesitate to reach out if you have any questions or need assistance.

Thank you for being a valued member of our gym family!

Warm regards,
The Navyug Gym Team
            `
        };
    }

    return {
        subject: `Important: Your Navyug Gym Subscription Ends Today`,
        text: `
Dear ${firstName},

We hope you're doing well! We wanted to remind you that your subscription with Navyug Gym is set to expire today, ${date}.

To continue enjoying uninterrupted access to our facilities, and support, we encourage you to renew your membership as soon as possible.

How to Renew Your Membership:
    - Visit Us at the Front Desk - Our team will be happy to assist you with the renewal process.
    - Contact Us: If you have any questions, please reach out to us via email at navyuggym@gmail.com or contact our team directly:
                        - Mahesh Wagh: +91 8291616435
                        - Suresh Tambe: +91 9870216612
                        - Santosh Mahaprolkar: +91 9969087553'

To renew your subscription online, please visit our website at [www.navyuggym.in] and fill out the form provided.

We appreciate your commitment to fitness and look forward to supporting you on your journey at Navyug Gym. Don’t hesitate to reach out if you have any questions or need assistance.

Thank you for being a valued member of our gym family!

Warm regards,
The Navyug Gym Team
                `
    };
}


// Members inside the reminder window (5 days before expiry .. expiry day). Read-only.
async function feesDeadlineData(req, res) {
    try {
        const data = await fetchData();
        const currentDate = todayIst();

        const deadlineUserData = data.filter((row) => {
            if (row.length === 0) return false;
            const endDate = parseSheetDate(row[6]);
            const windowStart = addDays(endDate, -REMINDER_DAYS_BEFORE_EXPIRY);
            return windowStart.getTime() <= currentDate.getTime() && currentDate.getTime() <= endDate.getTime();
        });

        return res.status(200).json({ success: true, Data: sortByStartDateDesc(deadlineUserData) })

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


// Expired members still inside the 15-day grace period. Read-only; removal is done by purgeExpiredMembers.
async function feesSubscriptionEndData(req, res) {
    try {
        const data = await fetchData();
        const currentDate = todayIst();

        const expiredUserData = data.filter((row) => {
            if (row.length === 0) return false;
            const endDate = parseSheetDate(row[6]);
            const graceEnd = addDays(endDate, PURGE_GRACE_DAYS);
            return endDate.getTime() < currentDate.getTime() && currentDate.getTime() <= graceEnd.getTime();
        });

        return res.status(200).json({ success: true, Data: sortByStartDateDesc(expiredUserData) })

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


// Sends the 5-day and expiry-day reminders. The flag is written only after the mail is accepted,
// so a failed mail is retried on the next run and a sent mail is never repeated.
async function sendExpiryReminders() {
    const data = await fetchData();
    const sheets = await accessGoogleSheet();
    const currentDate = todayIst();
    const result = { sent: 0, failed: 0 };

    for (let item = 0; item < data.length; item++) {
        const row = data[item];
        if (row.length === 0) continue;

        const endDate = parseSheetDate(row[6]);
        const fiveDayDate = addDays(endDate, -REMINDER_DAYS_BEFORE_EXPIRY);

        let mailType;
        let flagColumn;
        if (fiveDayDate.getTime() === currentDate.getTime() && row[14] === "No") {
            mailType = "beforeFiveDays";
            flagColumn = COL_FLAG_FIVE_DAY;
        }
        else if (endDate.getTime() === currentDate.getTime() && row[15] === "No") {
            mailType = "endSubscription";
            flagColumn = COL_FLAG_EXPIRY_DAY;
        }
        else {
            continue;
        }

        try {
            const { subject, text } = buildReminderMail(mailType, capitalizeFirstName(row[0]), row[6]);
            await sendMails(row[1], subject, text);
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `UserData!${flagColumn}${item + 2}`,
                valueInputOption: "USER_ENTERED",
                resource: { values: [["Yes"]] }
            });
            result.sent++;
        } catch (error) {
            result.failed++;
            console.error(`Reminder (${mailType}) failed for sheet row ${item + 2}:`, error.message);
        }
    }

    return result;
}


// Clears rows (and deletes photos) for members expired more than 15 days ago.
async function purgeExpiredMembers() {
    const data = await fetchData();
    const sheets = await accessGoogleSheet();
    const auth = await getAuth();
    const drive = google.drive({ version: "v3", auth })
    const currentDate = todayIst();
    const result = { removed: 0, failed: 0 };

    for (let item = 0; item < data.length; item++) {
        const row = data[item];
        if (row.length === 0) continue;

        const graceEnd = addDays(parseSheetDate(row[6]), PURGE_GRACE_DAYS);
        if (graceEnd.getTime() >= currentDate.getTime()) continue;

        try {
            await drive.files.delete({ fileId: row[4] });
            await sheets.spreadsheets.values.clear({
                spreadsheetId,
                range: `UserData!A${item + 2}:Q${item + 2}`,
            })
            result.removed++;
        } catch (error) {
            result.failed++;
            console.error(`Purge failed for sheet row ${item + 2}:`, error.message);
        }
    }

    return result;
}


// Scheduled entry point (Vercel cron, see vercel.json). Replaces the mail/delete side effects
// that used to run whenever an admin opened the expiry pages.
async function runDailyMaintenance(req, res) {
    try {
        const reminders = await sendExpiryReminders();
        const purge = await purgeExpiredMembers();
        const hasFailures = reminders.failed > 0 || purge.failed > 0;

        return res.status(hasFailures ? 500 : 200).json({ success: !hasFailures, Data: { reminders, purge } })

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


// Add method to accept payment and then corresponding admin name will be added there.
async function acceptFeesPayment(req, res) {
    try {

        const { amount } = req.body;
        const userId = req.user.id;
        const fileId = req.params.id;

        let data = await fetchData();
        let adminData = await fetchAdminData();
        let userName;
        let firstName;
        let fullInfo;


        //Validate the User
        for (let i = 0; i < adminData.length; i++) {

            // Admin Verification
            if (adminData[i][2] === userId) {
                userName = adminData[i][0]
                break;
            }
        }

        const sheets = await accessGoogleSheet();
        let response;

        for (let j = 0; j < data.length; j++) {

            if (data[j][4] === fileId) {
                firstName = data[j][0]
                fullInfo = data[j]

                response = await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: `UserData!L${j + 2}`,
                    valueInputOption: "USER_ENTERED",
                    resource: { values: [["Yes", amount, userName]] }
                })
            }
        }

        if (!fullInfo) {
            return res.status(404).json({ success: false, Error: "Member not found!" })
        }

        // Here get Full Name
        let fullName = fullInfo[0].split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");


        // Full Name and meta data send to the pdf method.

        const pdfBuffer = await createPdf(fullName, fullInfo, amount, userName);

        // Create attachments
        let attachments = [
            {
                filename: "gym-registration-receipt.pdf",
                content: pdfBuffer,
                contentType: "application/pdf"
            },
        ]



        // Gmail data
        let subject = "Welcome to Navyug Gym! Your Membership is Approved! 🎉"
        let text = `
Dear ${firstName},
We’re thrilled to welcome you to Navyug Gym! Your membership registration has been approved, and we look forward to being a part of your fitness journey.

Here are the next steps and some important details:
    1] Getting Started: Our team will provide a guided orientation of our facilities on your first visit.Feel free to ask any questions to make the most out of your experience with us!
    2] Schedule and Timing: Navyug Gym is open from:- Monday to Saturday: 6:00 AM to 10:00 AM and 4:00 PM to 10:00 PM.
    3] Stay Connected: 
            - Join our official WhatsApp group for updates and announcements: https://chat.whatsapp.com/Csig12I7EnyH3l2G4Aaafl.
            - If you have any questions, please reach out to us via email at navyuggym@gmail.com or contact our team directly:
                    - Mahesh Wagh: +91 8291616435
                    - Suresh Tambe: +91 9870216612
                    - Santosh Mahaprolkar: +91 9969087553

What to Bring on Your First Day:
- Gym attire and any personal equipment you might need.
- A positive attitude and enthusiasm for a great workout!

Please Note: We have attached a document to this email with additional details about your membership.Kindly review it for a smooth start with us.

Thank you for choosing Navyug Gym.We are excited to help you achieve your fitness goals!

Best regards,
Navyug Gym Team
        `

        if (response.status === 200) {
            try {
                await sendMails(fullInfo[1], subject, text, attachments);
            } catch (mailError) {
                // The approval is already saved in the sheet; tell the admin the receipt did not go out.
                return res.status(200).json({ success: true, Data: "Member approved, but the receipt email could not be sent. Please send the receipt manually." })
            }
        }

        return res.status(200).json({ success: true, Data: "Successfully Add Member" })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}



// Delete method use when we accept the payment if you want to delete because of some information mistake.
async function deletePendingUserData(req, res) {
    try {

        const fileId = req.params.id;

        let data = await fetchData();

        const sheets = await accessGoogleSheet();
        const auth = await getAuth();
        // Obtain an authenticated client
        const drive = google.drive({ version: "v3", auth })
        let response;

        for (let j = 0; j < data.length; j++) {

            if (data[j][4] === fileId) {

                try {
                    await drive.files.delete({ fileId: fileId });
                    response = await sheets.spreadsheets.values.clear({
                        spreadsheetId,
                        range: `UserData!A${j + 2}:Q${j + 2}`,
                    })


                } catch (error) {
                    console.log("Error during Deleting: ", error)
                }
            }
        }

        return res.status(200).json({ success: true, Data: response })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


// Using Google drive image.
async function fetchImage(req, res) {
    try {
        // let imageUrl = "https://res.cloudinary.com/dpkaxrntd/image/upload/v1729657532/iqgpcl1hnra06rdi1e93.jpg"

        const fileId = req.params.id;

        // Drive file IDs are URL-safe tokens; anything else would change the upstream URL
        if (!/^[A-Za-z0-9_-]+$/.test(fileId)) {
            return res.status(400).json({ success: false, Error: "Invalid member ID!" })
        }

        let imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`

        // Download the image as a buffer using axios
        // const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const response = await fetch(imageUrl, {
            method: 'GET', // You can use 'GET' or leave it out as it's the default
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Convert the response to an ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        // Convert the buffer to base64
        // const imageBase64 = Buffer.from(response.data, 'binary').toString('base64');
        const imageBase64 = Buffer.from(arrayBuffer).toString('base64');
        const imageMimeType = 'image/jpeg'; // Update this if using a different image type (e.g., image/png)

        // Send the base64 string back to the frontend
        return res.status(200).json({
            success: true,
            imageLink: `data:${imageMimeType};base64,${imageBase64}`,
        });
        // return res.status(200).json({ success: true, imageUrl });



    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}




// Fetch Home data


// Fetch Home data
async function fetchHomeData(req, res) {
    try {

        const userId = req.user.id;
        let data = await fetchData();
        let adminData = await fetchAdminData();
        let adminFirstName;
        // let authority;
        let totalMembers = 0;
        let insiderMembers = 0;
        let outsiderMembers = 0;
        let morningMembers = 0;
        let eveningMembers = 0;
        let membersBelowFifteen = 0;
        let fifteenToTwenty = 0;
        let twentyToThirty = 0;
        let membersAboveThirty = 0;

        let actuallyMember = [];

        const { year, month, day } = getIstDateParts();

        // Format the date:
        const formattedDate
            = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;


        //Validate the User
        for (let i = 0; i < adminData.length; i++) {

            // Admin Verification
            if (adminData[i][2] === userId) {
                adminFirstName = adminData[i][0].split(" ")[0]
                break;
            }
        }



        for (let j = 0; j < data.length; j++) {
            // Member type: Insider or Outsider
            if (data[j][12] === "3000" || data[j][12] === "2000") {
                insiderMembers++;
                actuallyMember.push(data[j]);

            } else if (data[j][12] === "6000" || data[j][12] === "5000") {
                outsiderMembers++;
                actuallyMember.push(data[j]);
            }
            // // Only count active members with payment accepted and not deleted
            // // data[j][11] === "Yes" means payment is accepted
            // // data[j][15] === "No" means member is not deleted/expired
            // // data[j][12] is the membership fee (3000 for insider, 6000 for outsider)
            // if (data[j].length !== 0 && data[j][11] === "Yes" && data[j][15] === "No") {
            //     // Check if membership is still active (end date hasn't passed)
            //     let endDate = data[j][6];
            //     if (endDate) {
            //         const [endDay, endMonth, endYear] = endDate.split("-").map(Number);
            //         const endDeadlineDate = new Date(endYear, endMonth - 1, endDay);
            //         const currentDateCheck = new Date(year, month - 1, day);

            //         // Only count if membership hasn't expired
            //         if (currentDateCheck.getTime() <= endDeadlineDate.getTime()) {
            //             // Member type: Insider or Outsider
            //             if (data[j][12] === "3000") {
            //                 insiderMembers++;
            //                 actuallyMember.push(data[j]);
            //             } else if (data[j][12] === "6000") {
            //                 outsiderMembers++;
            //                 actuallyMember.push(data[j]);
            //             }
            //         }
            //     }
            // }
        }

        for (let j = 0; j < actuallyMember.length; j++) {

            // Time slot: Morning or Evening
            if (actuallyMember[j][10] === "Morning") {
                morningMembers++;
            } else if (actuallyMember[j][10] === "Evening") {
                eveningMembers++;
            }

            // Age categories - Only one of these will execute per iteration
            const age = actuallyMember[j][8];
            if (age <= 15) {
                membersBelowFifteen++;
            } else if (age <= 20) {
                fifteenToTwenty++;
            } else if (age <= 30) {
                twentyToThirty++;
            } else {
                membersAboveThirty++;
            }
        }

        // Total Members
        totalMembers = actuallyMember.length;

        return res.status(200).json({ success: true, Data: { adminFirstName, totalMembers, insiderMembers, outsiderMembers, morningMembers, eveningMembers, membersBelowFifteen, fifteenToTwenty, twentyToThirty, membersAboveThirty } })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}





// Fetch data those according the month name
async function fetchDataMonthWise(req, res) {
    try {

        // Fetch Month Number
        const monthNum = req.params.month;


        // Fetch Data
        let data = await fetchData();
        let monthWiseData = [];


        for (let item = 0; item < data.length; item++) {

            // if (data[item][15] === "No" && data[item][11] === "Yes" && (data[item][5].split('-')[1]) === monthNum) {

            //     monthWiseData.push(data[item])
            // }

            if (
                data[item][15] === "No" &&
                data[item][11] === "Yes" &&
                (parseInt(data[item][5].split('-')[1], 10) === parseInt(monthNum, 10))
            ) {
                monthWiseData.push(data[item]);
                // console.log(data[item])
            }

        }


        // Sort in Decending order (youngest first)
        monthWiseData.sort((a, b) => {
            const dateA = new Date(a[5].split('-').reverse().join('-'));
            const dateB = new Date(b[5].split('-').reverse().join('-'));
            return dateB - dateA;
        });

        return res.status(200).json({ success: true, Data: monthWiseData })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}



// Fetch days for subscription end
async function fetchDaysForSubscriptionEnd(req, res) {
    try {

        // Fetch Data
        let adminData = await fetchAdminData();

        let previousDate = adminData[0][5];


        return res.status(200).json({ success: true, Data: previousDate })


    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}


// Function for finding alphabhet
function getAlphabetFromNumber(num) {
    if (num < 1 || num > 26) {
        return "Invalid number! Enter a number between 1 and 26.";
    }
    // Convert number to corresponding alphabet
    return String.fromCharCode(64 + num); // 'A' is 65 in ASCII
}



// Monthly visit counters live on this AdminData row (cols A–L, one per month).
const VISIT_COUNTER_SHEET_ROW = 7;
// fetchAdminData drops the header row, so sheet row N is at index N - 2.
const VISIT_COUNTER_ADMIN_INDEX = VISIT_COUNTER_SHEET_ROW - 2;

// Count web visit
async function countWebVisit(req, res) {
    try {

        let adminData = await fetchAdminData();
        // Update data for sending email to Main Admin
        const sheets = await accessGoogleSheet();

        const month = getIstDateParts().month - 1; // 0-indexed, matches adminData month columns

        let countVisit = Number(adminData[VISIT_COUNTER_ADMIN_INDEX][month]) + 1;

        let letter = await getAlphabetFromNumber(month + 1);

        // console.log(countVisit);
        let response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `AdminData!${letter}${VISIT_COUNTER_SHEET_ROW}`,              //WHen we add the admin at that time we need to change in the data
            valueInputOption: "USER_ENTERED",
            resource: { values: [[countVisit]] }
        })

        return res.status(200).json({ success: true, Data: "Success" })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ success: false, Error: "Internal Serval Error Occured!" })
    }
}





module.exports = {
    createUser,
    loginAdmin,
    searchUser,
    fetchFeesPendingData,
    feesDeadlineData,
    acceptFeesPayment,
    deletePendingUserData,
    fetchImage,
    fetchHomeData,
    feesSubscriptionEndData,
    runDailyMaintenance,
    fetchDataMonthWise,
    fetchDaysForSubscriptionEnd,
    countWebVisit
}

