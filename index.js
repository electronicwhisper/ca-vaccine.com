const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

const addCommasToBigNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatDateForPlotly = (date) => {
  // Juggling time zone stuff. Still don't really understand this. -Toby
  const s = d3.utcFormat("%Y-%m-%d")(date);
  return +d3.timeParse("%Y-%m-%d")(s);
}

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

  const datePadding = oneDay / 2;
  const startDate = formatDateForPlotly(data[0].date);
  const endDate = formatDateForPlotly(data[data.length - 1].date);
  const xAxisRange = [startDate - datePadding, endDate + datePadding];

  Plotly.newPlot(
    "chart",
    [
      {
        x: data.map((row) => formatDateForPlotly(row.date)),
        y: data.map((row) => row.total_doses_administered),
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
      hovermode: "x",
      hoverdistance: 1000,
      xaxis: {
        type: 'date',
        range: xAxisRange,
      },
      yaxis: {
        tickmode: "linear",
        tick0: 0,
        dtick: 100000,
        rangemode: "tozero",
        autorange: true,
        hoverformat: ",f",
      },
      font: {
        family:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
      },
      margin: {
        l: 50,
        r: 25,
        b: 50,
        t: 25,
        pad: 4,
      },
    },
    {
      displayModeBar: false,
      responsive: true,
    }
  );

  const x = [];
  const y = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const previousRow = data[i - 1];

    // divide by num of days between row and previous row
    const daysBetween = Math.round((row.date - previousRow.date) / oneDay);

    console.log(daysBetween);
    x.push(formatDateForPlotly(row.date));

    y.push(
      (row.total_doses_administered - previousRow.total_doses_administered) /
        daysBetween
    );
  }

  console.log(x);
  console.log(y);

  Plotly.newPlot(
    "chart-2",
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
      hovermode: "x",
      hoverdistance: 1000,
      xaxis: {
        type: 'date',
        range: xAxisRange,
      },
      yaxis: {
        tickmode: "linear",
        tick0: 0,
        dtick: 10000,
        rangemode: "tozero",
        autorange: true,
        hoverformat: ",f",
      },
      font: {
        family:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
      },
      margin: {
        l: 50,
        r: 25,
        b: 50,
        t: 25,
        pad: 4,
      },
    },
    {
      displayModeBar: false,
      responsive: true,
    }
  );
};

run();
