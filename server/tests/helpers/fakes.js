// In-memory stand-ins for Google Sheets, Google Drive and nodemailer.
// Sheet store layout mirrors the real sheet: index 0 is the header row, so sheet row N is store[N - 1].

const store = { UserData: [], AdminData: [] };

const sheetsApi = {
    spreadsheets: {
        values: {
            get: jest.fn(),
            update: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
        },
    },
};

const driveApi = {
    files: {
        create: jest.fn(),
        delete: jest.fn(),
    },
};

const sendMail = jest.fn();

// "UserData!L5" / "UserData!A5:Q5" / "UserData" -> { sheet, col (0-based), row (1-based) }
function parseRange(range) {
    const match = /^(\w+)(?:!([A-Z]+)(\d+)(?::[A-Z]+\d+)?)?$/.exec(range);
    const [, sheet, letters, rowNumber] = match;
    const col = letters ? letters.split("").reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1 : 0;
    return { sheet, col, row: rowNumber ? Number(rowNumber) : null };
}

function installDefaultBehaviour() {
    sheetsApi.spreadsheets.values.get.mockImplementation(async ({ range }) => ({
        data: { values: store[parseRange(range).sheet].map((row) => [...row]) },
    }));

    sheetsApi.spreadsheets.values.update.mockImplementation(async ({ range, resource }) => {
        const { sheet, col, row } = parseRange(range);
        const rows = store[sheet];
        while (rows.length < row) rows.push([]);
        const target = rows[row - 1];
        resource.values[0].forEach((value, offset) => {
            target[col + offset] = value;
        });
        return { status: 200 };
    });

    sheetsApi.spreadsheets.values.append.mockImplementation(async ({ range, resource }) => {
        store[parseRange(range).sheet].push(...resource.values.map((row) => [...row]));
        return { status: 200 };
    });

    sheetsApi.spreadsheets.values.clear.mockImplementation(async ({ range }) => {
        const { sheet, row } = parseRange(range);
        store[sheet][row - 1] = [];
        return { status: 200 };
    });

    driveApi.files.create.mockImplementation(async () => ({ data: { id: "new-photo-id", webViewLink: "link" } }));
    driveApi.files.delete.mockImplementation(async () => ({}));
    sendMail.mockImplementation(async () => ({ messageId: "message-1" }));
}

// Call from beforeEach: clears recorded calls, seeds sheets and restores happy-path behaviour.
function resetFakes({ userRows = [], adminRows = [] } = {}) {
    sheetsApi.spreadsheets.values.get.mockReset();
    sheetsApi.spreadsheets.values.update.mockReset();
    sheetsApi.spreadsheets.values.append.mockReset();
    sheetsApi.spreadsheets.values.clear.mockReset();
    driveApi.files.create.mockReset();
    driveApi.files.delete.mockReset();
    sendMail.mockReset();

    store.UserData = [["header"], ...userRows.map((row) => [...row])];
    store.AdminData = [["header"], ...adminRows.map((row) => [...row])];
    installDefaultBehaviour();
}

class GoogleAuth {
    async getClient() {
        return {};
    }
}

const googleapisModule = {
    google: {
        auth: { GoogleAuth },
        sheets: () => sheetsApi,
        drive: () => driveApi,
    },
};

const nodemailerModule = {
    createTransport: () => ({ sendMail }),
};

class FakePdf {
    setFontSize() {}
    setFont() {}
    setLineWidth() {}
    text() {}
    line() {}
    autoTable() {}
    output() {
        return new TextEncoder().encode("%PDF-fake").buffer;
    }
}

const jspdfModule = { jsPDF: FakePdf };

module.exports = {
    store,
    sheetsApi,
    driveApi,
    sendMail,
    resetFakes,
    googleapisModule,
    nodemailerModule,
    jspdfModule,
};
