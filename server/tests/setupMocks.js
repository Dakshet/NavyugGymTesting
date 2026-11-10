// Every external service is faked so tests never reach Google, Gmail or the real .env.
jest.mock("dotenv", () => ({ config: () => ({}) }));
jest.mock("googleapis", () => require("./helpers/fakes").googleapisModule);
jest.mock("nodemailer", () => require("./helpers/fakes").nodemailerModule);
jest.mock("jspdf", () => require("./helpers/fakes").jspdfModule);
jest.mock("jspdf-autotable", () => ({}));

beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});
