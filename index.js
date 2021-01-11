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

  const formattedRecentTotalDate = d3.utcFormat("%B %e, %Y")(recentTotalDate);

  document.querySelector("#total-doses").innerText = totalDosesAdministered;

  document.querySelector("#date").innerText = formattedRecentTotalDate;

  document.querySelector("#daily-doses").innerText = addCommasToBigNumber(
    dailyDoseTotal
  );

  data = data.filter((row) => row.region === "Total");

  console.log(data);

  window.data = data;

  const x = data.map((row) => d3.utcFormat("%Y-%m-%d")(row.date));

  const y = data.map((row) => row.total_doses_administered);

  window.x = x;

  Plotly.newPlot(
    "chart",
    [
      {
        x: x,
        y: y,
        marker: {
          color: "rgb(0, 163, 184)",
          size: 8,
          line: {
            color: "rgb(0, 163, 184)",
            width: 0.5,
          },
        },
        type: "scatter",
      },
    ],
    {
      title: {
        text: "Vaccine Doses Administered in California",
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
      font: {
        family:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
      },
    },
    {
      displayModeBar: false,
      responsive: true,
    }
  );
};

run();
