import { controllersList, channelsObjects } from "./initialize-data.js";
import { measurementsObjects } from "./handle-main-page.js";
import { chartInstances } from "./initialize-chart.js";
import {
  defaultYAxis,
  defaultXAxis,
  defaultGrid,
  defaultDataZoom,
} from "./chart-options.js";
import {
  chartSeriesColors,
  clearAllCurrentTemplateSeriesLines,
} from "./chart-ui.js";
import { sys, ui, debounce, makeChartRectangular } from "./utilities.js";
import {
  cutTrendingSeriesOnTimestamp,
  extendArchiveChart,
  separateGrids,
  clearIfRawDataDuplicates,
} from "./chart-utilities.js";
import { initializeTrendingChart } from "./handle-trending-charts.js";
import {
  addSignalChart,
  addOrbitChart,
  addRawArchiveChart,
  addPolarChart,
  addStatusChart,
  addArchiveChart,
} from "./chart-series-add.js";
import {
  updateStatusChart,
  updateChart,
  updateSKZChart,
  updateArchiveChart,
} from "./chart-series-update.js";
import { minMax } from "./handle-series-visibility.js";
import { makeSeveralGrids } from "./chart-separation.js";

export var currentChartOptions = {};
export var handleIncomingChartMessage;
export var gridUnitsMapping = {};

export function chartRenderModule() {
  currentChartOptions.trendingChartBuffer = [];
  for (var i = 0; i < 8; i++) {
    currentChartOptions.trendingChartBuffer[i] = [];
  }

  var chartTypes = document.querySelector("#chart-mode").options;
  for (var chart of chartTypes) {
    var type = chart.value + "Chart";
    gridUnitsMapping[type] = {};
    gridUnitsMapping[type].enabled = 0;
  }

  var debouncedExtendArchiveChart = debounce(extendArchiveChart, 750);

  function setBasicChartOptions(index, identity, type, units) {
    var divide = document.querySelector("#chart-divider").value;
    var chart = sys.getChartObject();

    if (divide === "several") {
      chart.grid[index] = structuredClone(defaultGrid);

      chart.xAxis[index] = structuredClone(defaultXAxis);
      chart.xAxis[index].gridIndex = index;

      if (identity === "D_NR" || identity === "D_TREND") {
        chart.xAxis[index].type = "time";
      }

      if (identity === "D_SIGNAL") {
        chart.xAxis[index].name = "секунды";
      }

      if (identity === "D_SPECTR") {
        chart.xAxis[index].name = "Гц";
        chart.xAxis[index].max = "dataMax";
      }

      chart.yAxis[index] = structuredClone(defaultYAxis);
      chart.yAxis[index].gridIndex = index;
      chart.yAxis[index].name = `${units}`;

      gridUnitsMapping[type][index] = units;

      if (identity === "D_TREND" || identity === "D_NR") {
        for (var unit in gridUnitsMapping[type]) {
          if (
            gridUnitsMapping[type][unit] !== 0 &&
            gridUnitsMapping[type][unit] !== units
          ) {
            Promise.resolve().then(() => {
              var divider = document.querySelector("#chart-divider");
              gridUnitsMapping[type].enabled = 1;
              divider.setAttribute("disabled", "");
              divider.options[1].selected = "selected";
            });
          }
        }
      }

      chart.yAxis[index].axisLabel = {};
      chart.yAxis[index].axisLabel.formatter = (value) => {
        return value;
      };

      if (index === 0) {
        chart.dataZoom = structuredClone(defaultDataZoom);
      }
      chart.dataZoom[0].xAxisIndex.push(index);
      chart.dataZoom[1].xAxisIndex.push(index);

      chart.tooltip.position = "";
      chart.tooltip.valueFormatter = (value) => {
        if (typeof value === "number") {
          return value.toFixed(3);
        }
      };
    }

    if (divide === "single") {
      chart.grid = structuredClone(defaultGrid);

      chart.xAxis = structuredClone(defaultXAxis);
      chart.xAxis.scale = true;

      if (identity === "D_NR" || identity === "D_TREND") {
        chart.xAxis.type = "time";
      }

      if (identity === "D_SIGNAL") {
        chart.xAxis.name = "секунды";
      }

      if (identity === "D_SPECTR") {
        chart.xAxis.name = "Гц";
        chart.xAxis.max = "dataMax";
      }

      if (identity === "D_ORBITA") {
        chart.xAxis.name = "мВ";
        chart.yAxis.name = "мВ";
        chart.xAxis.axisLine.lineStyle.color = "transparent";
        chart.tooltip.show = false;
        chart.tooltip.trigger = "item";
      }

      if (identity === "D_SKZ_W") {
        chart.polar = {
          center: ["50%", "50%"],
        };

        chart.angleAxis = {
          type: "category",
          startAngle: 90,
        };

        chart.radiusAxis = {
          min: 0,
        };

        chart.tooltip = {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
        };

        chart.xAxis.scale = true;
        chart.xAxis.axisLine.lineStyle.color = "transparent";

        setTimeout(() => {
          chart.radiusAxis = [{}];
          chart.radiusAxis[0].axisLabel = {};
          chart.radiusAxis[0].axisLabel.show = false;
          chart.radiusAxis[0].axisLine = {};
          chart.radiusAxis[0].axisLine.lineStyle = {};
          chart.radiusAxis[0].axisLine.lineStyle.color = "transparent";
          chartInstances[type].setOption(chart);
        });
      }

      chart.yAxis = structuredClone(defaultYAxis);
      chart.yAxis.name = units;

      gridUnitsMapping[type][index] = units;

      if (identity === "D_TREND" || identity === "D_NR") {
        for (var unit in gridUnitsMapping[type]) {
          if (
            gridUnitsMapping[type][unit] !== 0 &&
            gridUnitsMapping[type][unit] !== units
          ) {
            Promise.resolve(makeSeveralGrids).then((makeSeveralGrids) => {
              var divider = document.querySelector("#chart-divider");
              gridUnitsMapping[type].enabled = 1;
              divider.setAttribute("disabled", "");
              divider.options[1].selected = "selected";
              ui.showMessage(
                "Невозможно отобразить разные единицы измерения на одной оси."
              );
              makeSeveralGrids();
            });
          }
        }
      }

      chart.yAxis.axisLabel = {};
      chart.yAxis.axisLabel.formatter = (value) => {
        return value;
      };

      if (identity === "D_ORBITA") {
        chart.yAxis.axisLabel.formatter = (value) => {
          return value;
        };
      }

      if (identity === "D_SOST") {
        chart.xAxis.type = "time";
        chart.yAxis.type = "category";
        chart.yAxis.min = 0;
        chart.yAxis.max = 8;
        chart.yAxis.inverse = true;
      }

      chart.dataZoom = structuredClone(defaultDataZoom);

      var dataZoomVerticalSlider = structuredClone(defaultDataZoom[0]);
      dataZoomVerticalSlider.orient = "vertical";
      dataZoomVerticalSlider.width = 20;
      dataZoomVerticalSlider.height = "ph";
      dataZoomVerticalSlider.right = 15;
      delete dataZoomVerticalSlider.xAxisIndex;
      dataZoomVerticalSlider.yAxisIndex = [0, 1, 2, 3, 4, 5, 6, 7];

      chart.dataZoom.push(dataZoomVerticalSlider);

      if (identity === "D_SOST") {
        chart.dataZoom.splice(2);
      }

      if (identity === "D_ORBITA") {
        chart.dataZoom = [];
        makeChartRectangular();
      }

      chart.tooltip.valueFormatter = (value) => {
        if (typeof value === "number") {
          return value.toFixed(3);
        }
      };
    }
  }

  function addItemToSeriesTemplate(query, identity, type, time) {
    if (identity === "D_NR_U") return;

    var seriesLinesTemplateContainer =
      document.querySelector(".template-items");

    var item = document.createElement("label");
    item.dataset.id = query;
    item.classList.add("template-item");

    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = true;
    input.setAttribute("disabled", "");
    item.appendChild(input);

    if (
      identity === "D_NR" ||
      identity === "D_TREND" ||
      identity === "D_SOST"
    ) {
      var currentMeasurement = measurementsObjects[query.split("/")[1]] ?? 0;
      var currentChannel = channelsObjects[currentMeasurement.KANALY_ID] ?? 0;

      var span = document.createElement("span");
      span.innerText = `${currentChannel.KANALY_NAME} | ${currentMeasurement.ZAMERY_MEMO}`;
      item.appendChild(span);

      var colorMark = document.createElement("div");
      colorMark.classList.add("series-color-mark");
      item.appendChild(colorMark);

      seriesLinesTemplateContainer.appendChild(item);

      setTimeout(() => {
        item.classList.add("template-item-animating");
      }, 200);

      setTemplateSeriesLinesColors(type);
    } else {
      var currentChannel = channelsObjects[query.split("/")[1]] ?? 0;

      var date = new Date(time);

      var formattedDate =
        date.toLocaleDateString("ru-RU") +
        " " +
        date.toLocaleTimeString("ru-RU");

      var span = document.createElement("span");
      span.innerText = `${currentChannel.KANALY_NAME} | ${formattedDate}`;
      item.appendChild(span);

      var colorMark = document.createElement("div");
      colorMark.classList.add("series-color-mark");
      item.appendChild(colorMark);

      seriesLinesTemplateContainer.appendChild(item);

      setTimeout(() => {
        item.classList.add("template-item-animating");
      }, 100);

      setTemplateSeriesLinesColors(type);
    }
  }

  function setTemplateSeriesLinesColors(type) {
    var seriesLinesTemplateContainer =
      document.querySelector(".template-items");

    var i = 0;
    for (i = 0; i < seriesLinesTemplateContainer.children.length; i++) {
      var element = seriesLinesTemplateContainer.children[i];
      element.lastElementChild.style.backgroundColor =
        chartSeriesColors[type][i];
    }
  }

  function addChartSeriesLine(data, index, identity, type, query) {
    if (index === 0) {
      ui.easeChartIn();
    }

    if (identity === "D_SOST") {
      addStatusChart(data, index, identity, type, query);
      return;
    }

    if (type === "traChart" && !data.chart[4]) {
      addRawArchiveChart(data, index, identity, type);
      return;
    }

    if (identity !== "D_SKZ_W" && data.chart[4]) {
      addArchiveChart(data, index, identity, type);
      return;
    }

    if (
      identity === "D_SIGNAL" ||
      identity === "D_SIGNAL_V" ||
      identity === "D_SPECTR"
    ) {
      addSignalChart(data, index, identity, type);
      return;
    }

    if (identity === "D_ORBITA") {
      addOrbitChart(data, index, identity, type);
      return;
    }

    if (identity === "D_SKZ_W") {
      addPolarChart(data, index, identity, type);
      return;
    }
  }

  function updateChartSeriesLine(data, query, index, identity, type, time) {
    if (identity === "D_NR") return;

    if (identity === "D_TREND") {
      updateArchiveChart(data, query, index, identity, type, time);
      return;
    }

    if (identity === "D_SKZ_W") {
      updateSKZChart(data, query, index, identity, type, time);
      return;
    }

    if (identity === "D_SOST") {
      updateStatusChart(data, query, index, identity, type, time);
      return;
    }

    updateChart(data, query, index, identity, type, time);
  }

  function handleChartData(data, query, index, identity, type) {
    if (data.chart && data.chart[0].length === 0) {
      ui.showMessage("Нет данных за этот период.");
      return;
    }

    if (data.measure) {
      var time = data.measure.DT;
    }

    if (data.MEASURE_EXTDATA_W) {
      var time = data.MEASURE_EXTDATA_W.DT;
    }

    var divide = document.querySelector("#chart-divider").value;
    var hasRepeatedQuery = sys.getChartObject().queries.includes(query);

    var queryID = query.split("/")[1];

    var controllerID;
    for (var o in measurementsObjects) {
      if (measurementsObjects[o].KANALY_ID === Number(queryID)) {
        controllerID = measurementsObjects[o].KONTROLLERY_ID;
      }
    }

    var elves;
    if (queryID.length === 4) {
      elves = controllersList.data[controllerID].KONTROLLERY_SLONY3;
    } else if (queryID.length === 6) {
      elves = measurementsObjects[queryID].ZAMERY_SLONY;
    }

    var units = elves || "(Не удалось загрузить единицы измерения)";

    setBasicChartOptions(index, identity, type, units);

    if (identity !== "D_NR_U" && hasRepeatedQuery) {
      updateChartSeriesLine(data, query, index, identity, type, time);
      return;
    }

    if (identity === "D_NR") {
      initializeTrendingChart(data, index);
    } else {
      addChartSeriesLine(data, index, identity, type, query);
    }

    if (identity !== "D_NR_U") {
      sys.getChartObject().queries.push(query);

      setTimeout(() => {
        addItemToSeriesTemplate(query, identity, type, time);
      }, 150);
    }

    if (identity !== "D_NR") {
      if (divide === "several") separateGrids(index);
    }

    sys.resizeAndApplyOptions();
  }

  handleIncomingChartMessage = (data, identity) => {
    if (!data) return;

    var isResponseEmpty = ((o) => {
      for (var p in o) return false;
      return true;
    })(data.measure);

    if (data && data.measure && isResponseEmpty) {
      ui.showMessage("Невалидный запрос.");
      return;
    }

    var type = sys.getChartType();
    var queries = data.message.split("/")[1].split(",");

    separateGrids.reset();

    queries.forEach((el, index) => {
      var itemData = data[el];
      var query = identity + "/" + el;

      handleChartData(itemData, query, index, identity, type);
    });
  };

  document.body.addEventListener("keydown", (e) => {
    var type = document.querySelector("#chart-mode").value + "Chart";
    var isCurrent = document.querySelector("#filters-is-current").value;

    if (
      currentChartOptions.traChart.series.length &&
      type === "traChart" &&
      e.code === "ArrowUp" &&
      isCurrent !== "S"
    ) {
      minMax(false);
    }

    if (
      currentChartOptions.traChart.series.length &&
      type === "traChart" &&
      (e.code === "ArrowLeft" || e.code === "ArrowRight")
    ) {
      debouncedExtendArchiveChart(e);
    }
  });

  document
    .querySelector("#timespan")
    .addEventListener("change", cutTrendingSeriesOnTimestamp);

  document
    .querySelector("#KANALY")
    .addEventListener("mousedown", clearIfRawDataDuplicates);

  document
    .querySelector("#ZAMERY")
    .addEventListener("mousedown", clearIfRawDataDuplicates);

  document
    .querySelector("#filters-is-current")
    .addEventListener("mousedown", clearIfRawDataDuplicates);

  document
    .querySelector("#filters-is-current")
    .addEventListener("click", (e) => {
      if (
        currentChartOptions.traChart.outerDates &&
        currentChartOptions.traChart.outerDates[1] === "N" &&
        e.target.value === "S"
      ) {
        clearAllCurrentTemplateSeriesLines();
      }
    });
}
