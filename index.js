const palette = [
  "#18AFCC",
  "#12008A",
  "#C300A4",
  "#00AD00",
  "#9A5CFE",
  "#B7A033",
];

const regionInfo = {
  region_one: {
    name: "Region One",
    color: palette[0],
    population: 14790415,
  },
  region_two: {
    name: "Region Two",
    color: palette[1],
    population: 8823965,
  },
  region_three: {
    name: "Region Three",
    color: palette[2],
    population: 806979,
  },
  region_four: {
    name: "Region Four",
    color: palette[3],
    population: 3917557,
  },
  region_five: {
    name: "Region Five",
    color: palette[4],
    population: 2970648,
  },
  region_six: {
    name: "Region Six",
    color: palette[5],
    population: 8202659,
  },
};

const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

const addCommasToBigNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatDateForPlotly = (date) => {
  // Juggling time zone stuff. Still don't really understand this. -Toby
  const s = d3.utcFormat("%Y-%m-%d")(date);
  return +d3.timeParse("%Y-%m-%d")(s);
};

const plotlyLayout = {
  hovermode: "x",
  hoverdistance: 1000,
  dragmode: false,
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
  showlegend: false,
};
const plotlyConfig = {
  displayModeBar: false,
  responsive: true,
};

const populateChart = ({ container, x, y, dtick, xAxisRange }) => {
  Plotly.newPlot(
    container,
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
      ...plotlyLayout,
      xaxis: {
        type: "date",
        range: xAxisRange,
        fixedrange: true,
      },
      yaxis: {
        tickmode: "linear",
        tick0: 0,
        dtick: dtick,
        rangemode: "tozero",
        autorange: true,
        hoverformat: ",f",
        fixedrange: true,
      },
    },
    plotlyConfig
  );
};

const populateRegion = ({ container, data, region, xAxisRange }) => {
  const lastRow = data[data.length - 1];
  const prevLastRow = data[data.length - 2];
  const daysBetween = Math.round((lastRow.date - prevLastRow.date) / oneDay);
  const dailyRate = Math.round(
    (lastRow[region] - prevLastRow[region]) / daysBetween
  );

  container.querySelector(".cumulative").innerText = addCommasToBigNumber(
    lastRow[region]
  );
  container.querySelector(".date").innerText = d3.utcFormat("%B %e, %Y")(
    lastRow.date
  );
  container.querySelector(".daily-rate").innerText = addCommasToBigNumber(
    dailyRate
  );

  populateChart({
    container: container.querySelector(".chart-cumulative"),
    x: data.map((row) => formatDateForPlotly(row.date)),
    y: data.map((row) => row[region]),
    dtick: 100000,
    xAxisRange,
  });

  const x = [];
  const y = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const previousRow = data[i - 1];
    const daysBetween = Math.round((row.date - previousRow.date) / oneDay);
    x.push(formatDateForPlotly(row.date));
    y.push((row[region] - previousRow[region]) / daysBetween);
  }

  populateChart({
    container: container.querySelector(".chart-daily-rate"),
    x,
    y,
    dtick: 10000,
    xAxisRange,
  });
};

const determineXAxisRange = (data) => {
  const datePadding = oneDay / 2;
  const startDate = formatDateForPlotly(data[0].date);
  const endDate = formatDateForPlotly(data[data.length - 1].date);
  return [startDate - datePadding, endDate + datePadding];
};

const populateHeadlines = (data) => {
  const lastRow = data[data.length - 1];
  const prevLastRow = data[data.length - 2];
  const daysBetween = Math.round((lastRow.date - prevLastRow.date) / oneDay);
  const dailyRate = Math.round(
    (lastRow.total - prevLastRow.total) / daysBetween
  );

  document.querySelector(".cumulative").innerText = addCommasToBigNumber(
    lastRow.total
  );
  document.querySelector(".date").innerText = d3.utcFormat("%B %e, %Y")(
    lastRow.date
  );
  document.querySelector(".daily-rate").innerText = addCommasToBigNumber(
    dailyRate
  );
};

const populateCumulativeChart = (data, xAxisRange) => {
  populateChart({
    container: document.querySelector(".chart-cumulative"),
    x: data.map((row) => formatDateForPlotly(row.date)),
    y: data.map((row) => row.total),
    dtick: 100000,
    xAxisRange,
  });
};

const populateDailyRateChart = (data, xAxisRange) => {
  const x = [];
  const y = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const previousRow = data[i - 1];
    const daysBetween = Math.round((row.date - previousRow.date) / oneDay);
    x.push(formatDateForPlotly(row.date));
    y.push((row.total - previousRow.total) / daysBetween);
  }

  populateChart({
    container: document.querySelector(".chart-daily-rate"),
    x,
    y,
    dtick: 10000,
    xAxisRange,
  });
};

const run = async () => {
  let data = await d3.csv("data/cdph-doses.csv", d3.autoType);
  populateHeadlines(data);
  const xAxisRange = determineXAxisRange(data);
  populateCumulativeChart(data, xAxisRange);
  populateDailyRateChart(data, xAxisRange);

  const regionData = Object.keys(regionInfo).map((region) => {
    return {
      x: data.map((row) => formatDateForPlotly(row.date)),
      y: data.map((row) => (row[region] * 100) / regionInfo[region].population),
      marker: {
        color: regionInfo[region].color,
        size: 8,
        line: {
          color: regionInfo[region].color,
          width: 0.5,
        },
      },
      name: regionInfo[region].name,
      type: "scatter",
    };
  });

  Plotly.newPlot(
    document.querySelector(".chart-regions"),
    regionData,
    {
      ...plotlyLayout,
      xaxis: {
        type: "date",
        range: xAxisRange,
        fixedrange: true,
      },
      yaxis: {
        tickmode: "linear",
        tick0: 0,
        dtick: 0.2,
        rangemode: "tozero",
        autorange: true,
        hoverformat: ".2f",
        fixedrange: true,
      },
    },
    plotlyConfig
  );
};

run();
