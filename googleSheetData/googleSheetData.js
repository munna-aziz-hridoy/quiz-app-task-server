const { google } = require("googleapis");

const googleSheetData = async (range, keyFile) => {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();
  const spreadsheetId = "1Mjz9tF5Sz2Q3TRvdzloSlDVJNqNgkjSCKwla6QF_7Ps";

  const googleSheets = google.sheets({ version: "v4", auth: client });

  const googleSheetsData = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return googleSheetsData.data;
};

module.exports = googleSheetData;
