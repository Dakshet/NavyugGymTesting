// Runs before any module is loaded: the controller reads these at require time.
process.env.JWT_SECURE = "test-jwt-secret";
process.env.SPREADSHEETID = "test-sheet-id";
process.env.DRIVE_PHOTO_FOLDER_ID = "test-photo-folder";
process.env.CRON_SECRET = "test-cron-secret";
process.env.USER = "gym@example.com";
process.env.APP_PASSWORD = "test-app-password";
process.env.PRIVATE_KEY = "test-private-key";
process.env.CLIENT_EMAIL = "svc@example.com";
