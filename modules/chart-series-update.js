import { sendMessage } from "./networking.js";
import { chartInstances } from "./initialize-chart.js";
import { sys, ui } from "./utilities.js";
import { extendArchiveChart, separateGrids } from "./chart-utilities.js";
import { handleSeriesVisibility } from "./handle-series-visibility.js";
import { currentChartOptions } from "./chart-rendering.js";
import { addStatusChart } from "./chart-series-add.js";

export function updateStatusChart(data, query, index, identity, type, time) {
  addStatusChart(data, index, identity, type, query);
}

export function updateChart(data, query, index, identity, type, time) {
  var currentDuplicateQueryIndex =
    currentChartOptions[type].queries.indexOf(query);

  var date = new Date(time);
  var formattedDate =
    date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU");
  var templateItem = document.querySelector(`[data-id="${query}"]`);
  var spanToReplace = templateItem.firstElementChild.nextElementSibling;
  var stringToReplace =
    spanToReplace.innerText.split(" | ")[0] + " | " + formattedDate;
  spanToReplace.innerText = stringToReplace;

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  var xyArray = Array.from(xArray.length);

  var i;
  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  currentChartOptions[type].series[currentDuplicateQueryIndex].data = xyArray;

  Object.keys(chartInstances).forEach((el) => {
    chartInstances[el].resize();
  });

  var divide = document.querySelector("#chart-divider").value;
  if (divide === "several") separateGrids(index);

  handleSeriesVisibility.skipAndRevertVisibilityState(index);

  chartInstances[type].resize();

  chartInstances[type].setOption(currentChartOptions[type]);
}

export function updateSKZChart(data, query, index, identity, type, time) {
  var currentDuplicateQueryIndex =
    currentChartOptions[type].queries.indexOf(query);

  var date = new Date(time);
  var formattedDate =
    date.toLocaleDateString("ru-RU") + " " + date.toLocaleTimeString("ru-RU");
  var templateItem = document.querySelector(`[data-id="${query}"]`);
  var spanToReplace = templateItem.firstElementChild.nextElementSibling;
  var stringToReplace =
    spanToReplace.innerText.split(" | ")[0] + " | " + formattedDate;
  spanToReplace.innerText = stringToReplace;

  var poles = data.MEASURE_EXTDATA_W.pole_qty;
  var xArray = data.MYCH_W_DATA.pole_dev_mm;
  xArray.length = poles;

  var i;
  for (i = 0; i < xArray.length; i++) {
    xArray[i] += 100;
  }

  var yArray = Array.from(xArray.length);

  for (i = 0; i < xArray.length; i++) {
    yArray[i] = i;
  }

  var xyArray = Array.from(xArray.length);

  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  currentChartOptions[type].series[currentDuplicateQueryIndex].data = xyArray;

  Object.keys(chartInstances).forEach((el) => {
    chartInstances[el].resize();
  });

  var divide = document.querySelector("#chart-divider").value;
  if (divide === "several") separateGrids(index);

  handleSeriesVisibility.skipAndRevertVisibilityState(index);

  chartInstances[type].resize();

  chartInstances[type].setOption(currentChartOptions[type]);
}

export function updateArchiveChart(data, query, index, identity, type, time) {
  var currentDuplicateQueryIndex =
    currentChartOptions[type].queries.indexOf(query);

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  if (type === "traChart" && !data.chart[4]) {
    data.chart[4] = data.chart[2];
    delete data.chart[2];
    delete data.chart[3];
    data.chart[2] = [];
    data.chart[3] = [];
  }

  var k = currentDuplicateQueryIndex;
  var valueSeriesIndex = k * 2 + k;
  var minSeriesIndex = k * 2 + k + 1;
  var maxSeriesIndex = k * 2 + k + 2;

  var xyArray = Array.from(xArray.length);

  var i;

  if (
    type === "traChart" &&
    data.chart[4] &&
    document.querySelector("#filters-is-current").value !== "S"
  ) {
    var minYArray = data.chart[2];
    var maxYArray = data.chart[3];

    var xyMinArray = Array.from(xArray.length);
    var xyMaxArray = Array.from(xArray.length);

    xyArray[0] = [xArray[0], yArray[0]];
    xyMinArray[0] = [xArray[0], minYArray[0]];
    xyMaxArray[0] = [xArray[0], maxYArray[0]];

    for (i = 1; i < xArray.length; i++) {
      if (xArray[i] - xArray[i - 1] > 90000) {
        xArray.splice(i, 0, "-");
        yArray.splice(i, 0, "-");
        minYArray.splice(i, 0, "-");
        maxYArray.splice(i, 0, "-");
      }

      xyArray[i] = [xArray[i], yArray[i]];
      xyMinArray[i] = [xArray[i], minYArray[i]];
      xyMaxArray[i] = [xArray[i], maxYArray[i]];
    }

    var divide = document.querySelector("#chart-divider").value;

    if (divide === "several") {
      currentChartOptions[type].series[valueSeriesIndex].xAxisIndex = index;
      currentChartOptions[type].series[minSeriesIndex].xAxisIndex = index;
      currentChartOptions[type].series[maxSeriesIndex].xAxisIndex = index;

      currentChartOptions[type].series[valueSeriesIndex].yAxisIndex = index;
      currentChartOptions[type].series[minSeriesIndex].yAxisIndex = index;
      currentChartOptions[type].series[maxSeriesIndex].yAxisIndex = index;
    }

    currentChartOptions[type].series[valueSeriesIndex].data = xyArray;
    currentChartOptions[type].series[minSeriesIndex].data = xyMinArray;
    currentChartOptions[type].series[maxSeriesIndex].data = xyMaxArray;
  }

  if (
    type === "traChart" &&
    document.querySelector("#filters-is-current").value === "S"
  ) {
    var base = currentChartOptions[type].series[valueSeriesIndex].data;

    for (i = 0; i < xArray.length; i++) {
      var itemISODate = new Date(xArray[i]).toISOString();
      var currentItem = {
        name: itemISODate,
        value: [itemISODate, yArray[i]],
      };

      xyArray[i] = currentItem;
    }

    var emptyValidItem = {
      name: "-",
      value: ["-", "-"],
    };

    if (!xyArray[0]) {
      ui.showMessage("Данные за этот период отсутствуют.");
      return;
    }

    var actualFirst = base[0].value[0];
    var newFirst = xyArray[0].value[0];

    var actualLast = base.at(-1).value[0];
    var newLast = xyArray.at(-1).value[0];

    var actualFirstNum = new Date(actualFirst).getTime();
    var newFirstNum = new Date(newFirst).getTime();

    var actualLastNum = new Date(actualLast).getTime();
    var newLastNum = new Date(newLast).getTime();

    // === to the left ===
    if (base[0].value && actualFirstNum >= newFirstNum) {
      if (actualFirstNum - newLastNum > 7000) {
        base.unshift(emptyValidItem);
      }

      if (actualFirstNum === newFirstNum) {
        var base = currentChartOptions.traChart.outerMessage;
        sendMessage(
          base + "/R," + (extendArchiveChart.getEarlierDate() - 90000)
        );
      } else {
        extendArchiveChart.setEarlierDate(newLastNum);
        currentChartOptions[type].series[valueSeriesIndex].data =
          xyArray.concat(base);
      }
    }

    // === to the right ===
    if (base[0].value && actualFirstNum < newFirstNum) {
      if (newFirstNum - actualLastNum > 7000) {
        base.push(emptyValidItem);
      }

      extendArchiveChart.setLaterDate(newFirstNum);
      currentChartOptions[type].series[valueSeriesIndex].data =
        base.concat(xyArray);
    }
  }

  var divide = document.querySelector("#chart-divider").value;
  if (divide === "several") separateGrids(index);

  sys.resizeAndApplyOptions();
}
