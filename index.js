const addCommasToBigNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const run = async () => {
  let data = await d3.csv("cdph-data.csv", d3.autoType);
  const totalSortedByDate = data
    .filter((row) => row.region === "Total")
    .sort((a, b) => a.date - b.date);

  const latestTotalDosesRow = totalSortedByDate[totalSortedByDate.length - 1];

  let totalDosesAdministered = latestTotalDosesRow.total_doses_administered;
  const totalFromDayBefore =
    totalSortedByDate[totalSortedByDate.length - 2].total_doses_administered;

  const dailyDoseTotal = totalDosesAdministered - totalFromDayBefore;

  totalDosesAdministered = addCommasToBigNumber(totalDosesAdministered);

  const recentTotalDate = latestTotalDosesRow.date;

  const formattedRecentTotalDate = d3.timeFormat("%B %e, %Y")(recentTotalDate);

  document.querySelector("#total-doses").innerText = totalDosesAdministered;

  document.querySelector("#date").innerText = formattedRecentTotalDate;

  document.querySelector("#daily-doses").innerText = addCommasToBigNumber(
    dailyDoseTotal
  );

  data = data.filter((row) => row.region === "Total");

  console.log(data);

  window.data = data;

  const x = data.map((row) => d3.timeFormat("%Y-%m-%d")(row.date));

  const y = data.map((row) => row.total_doses_administered);

  window.x = x;

  Plotly.newPlot(
    "chart",
    [{ x: x, y: y, type: "scatter" }],
    {
      title: {
        text: "Total Vaccine Doses Administered in California",
        font: {
          size: 20,
        },
        xref: "paper",
        x: 0.05,
      },
      yaxis: {
        tickmode: "linear",
        tick0: 0,
        dtick: 100000,
        rangemode: "tozero",
        autorange: true,
      },
    },
    {
      displayModeBar: false,
    }
  );
};

run();
