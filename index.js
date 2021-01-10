const addCommasToBigNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const run = async () => {
  let data = await d3.csv("cdph-data.csv", d3.autoType);
  window.data = data;
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

  const width = 800;
  const height = 500;

  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]);

  const margin = { top: 20, right: 30, bottom: 30, left: 60 };

  const x = d3
    .scaleUtc()
    .domain(d3.extent(data, (d) => d.date))
    .range([margin.left, width - margin.right]);

  const timeFormat = d3.utcFormat("%b %e");

  const xAxis = (g) =>
    g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(d3.utcDay)
          .tickFormat(timeFormat)
          .tickSizeOuter(0)
      );

  svg.append("g").call(xAxis);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total_doses_administered)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const yAxis = (g) =>
    g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .select(".tick:last-of-type text")
          .clone()
          .attr("x", 3)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Total Doses Administered")
      );

  svg.append("g").call(yAxis);

  const line = d3
    .line()
    .defined((d) => !isNaN(d.total_doses_administered))
    .x((d) => x(d.date))
    .y((d) => y(d.total_doses_administered));

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  document.body.appendChild(svg.node());
};

run();
