const fs = require("fs");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const cdphDataUrl =
  "https://www.cdph.ca.gov/Programs/CID/DCDC/Pages/COVID-19/VaccineDoses.aspx";

const run = async () => {
  const response = await got(cdphDataUrl);
  const dom = new JSDOM(response.body);

  const tables = dom.window.document.querySelectorAll("table");

  let arrayOfDoses;
  tables.forEach((table) => {
    if (table.innerHTML.includes("Total Doses Administered")) {
      const tds = Array.from(table.querySelectorAll("td:nth-child(2)"));
      arrayOfDoses = tds.map((td) => td.textContent.replace(/,/g, ""));
    }
  });

  const h2s = dom.window.document.querySelectorAll("h2");
  let reformattedAsOfDate;
  h2s.forEach((h2) => {
    if (h2.innerHTML.includes("Vaccine Doses Administered")) {
      const asOfDate = new Date(h2.nextSibling.textContent.substr(6));
      reformattedAsOfDate =
        asOfDate.getFullYear().toString() +
        "-" +
        (asOfDate.getMonth() + 1).toString().padStart(2, "0") +
        "-" +
        asOfDate.getDate().toString().padStart(2, "0");
    }
  });

  fs.readFile("data/cdph-doses.csv", "utf8", (err, data) => {
    if (err) throw err;
    const arrayOfData = data.split("\n");
    const lastLine = arrayOfData[arrayOfData.length - 1];
    const lastDate = lastLine.split(",")[0];
    const newData = "\n" + reformattedAsOfDate + "," + arrayOfDoses.join(",");
    if (lastDate !== reformattedAsOfDate) {
      fs.appendFile("data/cdph-doses.csv", newData, (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
    }
  });
};
run();
