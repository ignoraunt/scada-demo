import * as echarts from "../libs/echarts.js";
import { measurementsObjects } from "./handle-main-page.js";
import { channelsObjects } from "./initialize-data.js";
import { defaultSeriesLine } from "./chart-options.js";
import { chartSeriesColors } from "./chart-ui.js";
import { extendArchiveChart } from "./chart-utilities.js";
import { currentChartOptions } from "./chart-rendering.js";
import { sys } from "./utilities.js";

export function addRawArchiveChart(data, index, identity, type) {
  var valueLine = { ...structuredClone(defaultSeriesLine) };

  valueLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.lineStyle.width = 2;

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  var xyArray = Array.from(xArray.length);

  var i;

  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  if (document.querySelector("#filters-is-current").value === "S") {
    extendArchiveChart.setEarlierDate(xyArray.at(-1)[0]);
    extendArchiveChart.setLaterDate(xyArray[0][0]);

    for (i = 0; i < xArray.length; i++) {
      var itemISODate = new Date(xArray[i]).toISOString();
      var currentItem = {
        name: itemISODate,
        value: [itemISODate, yArray[i]],
      };

      xyArray[i] = currentItem;
    }
  }

  valueLine.data = xyArray;

  currentChartOptions[type].series.push(valueLine);
}

export function addArchiveChart(data, index, identity, type) {
  var valueLine = { ...structuredClone(defaultSeriesLine) };

  valueLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.clip = false;

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  var xyArray = Array.from(xArray.length);

  var i;

  var minLine = { ...structuredClone(defaultSeriesLine) };
  var maxLine = { ...structuredClone(defaultSeriesLine) };

  minLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };
  maxLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.lineStyle.width = 2;
  minLine.lineStyle.width = 1;
  maxLine.lineStyle.width = 1;
  minLine.lineStyle.type = "dashed";
  maxLine.lineStyle.type = "dashed";
  minLine.color = chartSeriesColors[type][index];
  maxLine.color = chartSeriesColors[type][index];

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

  valueLine.data = xyArray;
  minLine.data = xyMinArray;
  maxLine.data = xyMaxArray;

  var divide = document.querySelector("#chart-divider").value;

  if (divide === "several") {
    valueLine.xAxisIndex = index;
    valueLine.yAxisIndex = index;

    minLine.xAxisIndex = index;
    minLine.yAxisIndex = index;

    maxLine.xAxisIndex = index;
    maxLine.yAxisIndex = index;
  }

  currentChartOptions[type].series.push(valueLine);
  currentChartOptions[type].series.push(minLine);
  currentChartOptions[type].series.push(maxLine);
}

export function addSignalChart(data, index, identity, type) {
  var valueLine = { ...structuredClone(defaultSeriesLine) };

  valueLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.clip = false;

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  var xyArray = Array.from(xArray.length);

  var i;
  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  valueLine.data = xyArray;

  var divide = document.querySelector("#chart-divider").value;

  if (divide === "several") {
    valueLine.xAxisIndex = index;
    valueLine.yAxisIndex = index;
  }

  currentChartOptions[type].series.push(valueLine);
}

export function addOrbitChart(data, index, identity, type) {
  var valueLine = { ...structuredClone(defaultSeriesLine) };

  valueLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.clip = false;
  valueLine.smooth = true;
  valueLine.showSymbol = false;
  valueLine.silent = true;
  valueLine.emphasis.disabled = true;
  valueLine.label.show = false;

  var xArray = data.chart[0];
  var yArray = data.chart[1];

  var xyArray = Array.from(xArray.length);

  var i;
  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  valueLine.data = xyArray;

  currentChartOptions[type].series.push(valueLine);
}

export function addPolarChart(data, index, identity, type) {
  var valueLine = { ...structuredClone(defaultSeriesLine) };

  valueLine.label.formatter = ({ data }) => {
    return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
  };

  valueLine.clip = false;

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

  valueLine.type = "bar";
  valueLine.coordinateSystem = "polar";
  valueLine.barWidth = "101%";
  valueLine.areaStyle = {
    color: "#22f",
    opacity: 0.2,
  };
  valueLine.barGap = "-100%";
  valueLine.barCategoryGap = "-100%";
  valueLine.label.show = false;

  var xyArray = Array.from(xArray.length);

  var i;

  for (i = 0; i < xArray.length; i++) {
    xyArray[i] = [xArray[i], yArray[i]];
  }

  valueLine.data = xyArray;

  currentChartOptions[type].series.push(valueLine);
}

export function addStatusChart(data, index, identity, type, query) {
  var statusColors = {
    0: "#bbbbbbcc",
    1: "#983f3fcc",
    2: "#1d9f46cc",
    3: "#11a3a3cc",
    4: "#8e52becc",
    5: "#135b9acc",
    6: "#585858cc",
    7: "#808000cc",
    8: "#ffff40cc",
    9: "#ff0000cc",
  };

  function renderGanttItem(params, api) {
    var catIndex = api.value(0);

    var beginTime = api.coord([api.value(1), catIndex]);
    var endTime = api.coord([api.value(2), catIndex]);

    var barLength = endTime[0] - beginTime[0];
    var barHeight = api.size([0, 1])[1] * 0.6;

    var x = beginTime[0];
    var y = beginTime[1] - barHeight;
    var mark = barLength < 2 ? "..." : "";

    var coloredBar = drawRectangle(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight,
    });

    var textBar = drawRectangle(params, {
      x: x,
      y: y,
      width: barLength,
      height: barHeight,
    });

    return {
      type: "group",
      children: [
        {
          type: "rect",
          ignore: !coloredBar,
          shape: coloredBar,
          style: { fill: String(statusColors[api.value(3)]) },
        },
        {
          type: "rect",
          ignore: !textBar,
          shape: textBar,
          style: {
            fill: "transparent",
            stroke: "transparent",
            text: mark,
            textFill: "#c2c4c6",
          },
        },
      ],
    };
  }

  function drawRectangle(params, rect) {
    return echarts.graphic.clipRectByRect(rect, {
      x: params.coordSys.x,
      y: params.coordSys.y,
      width: params.coordSys.width,
      height: params.coordSys.height,
    });
  }

  var chart = sys.getChartObject();

  var formattedArray = [];

  var chartMode = document.querySelector("#chart-mode");
  var chartType = chartMode.value + "Chart";
  var options = currentChartOptions[chartType];

  var queryStartTime = options.outerDates.split(",")[0].slice(1);
  var queryEndTime = options.outerDates.split(",")[1];

  var currentMeasurement = measurementsObjects[query.split("/")[1]];
  var currentChannel = channelsObjects[currentMeasurement.KANALY_ID];

  var descriptions = {
    0: "Не отвечает КИМ измерительного канала",
    1: "Неисправность аппаратной части КИМ",
    2: "Агрегат в работе (вибрация в допуске)",
    3: "Останов агрегата (нет оборотов)",
    4: "Неисправность измерительного канала",
    5: "- - -",
    6: "- - -",
    7: "Превышение уровня ВНИМАНИЕ",
    8: "Превышение уровня ПРЕДУПРЕЖДЕНИЕ",
    9: "Превышение уровня АВАРИЯ",
  };

  formattedArray.push([
    index,
    Number(queryStartTime),
    data.TIME[0],
    data.BYL[0] % 10,
    currentChannel.KANALY_NAME,
    descriptions[data.BYL[0] % 10] || "НЕИЗВЕСТНО",
  ]);

  var i;
  for (i = 1; i < data.TIME.length - 1; i++) {
    formattedArray.push([
      index,
      data.TIME[i - 1],
      data.TIME[i],
      data.BYL[i] % 10,
      currentChannel.KANALY_NAME,
      descriptions[data.BYL[i] % 10] || "НЕИЗВЕСТНО",
    ]);
  }

  formattedArray.push([
    index,
    data.TIME[data.TIME.length - 1],
    Number(queryEndTime),
    data.STAL[data.STAL.length - 1] % 10,
    currentChannel.KANALY_NAME,
    descriptions[data.STAL[data.STAL.length - 1] % 10] || "НЕИЗВЕСТНО",
  ]);

  chart.yAxis.axisLabel.fontSize = 14;
  chart.yAxis.axisLabel.inside = true;
  chart.yAxis.axisLabel.margin = 0;
  chart.yAxis.axisLabel.interval = 0;
  chart.yAxis.axisLabel.verticalAlign = "top";
  chart.yAxis.name = "";

  chart.grid.left = 35;
  chart.grid.left = 35;
  chart.tooltip = {
    backgroundColor: "#14181cbb",
    borderColor: "#242628",
    textStyle: {
      color: "#ddd",
      fontSize: 16,
      textBorderType: "dashed",
    },
  };

  var ganntElement = {
    type: "custom",
    renderItem: renderGanttItem,
    encode: {
      x: [1, 2],
      y: 4,
      tooltip: [1, 2, 5],
    },
    data: formattedArray,
  };

  chart.series[index] = ganntElement;

  sys.resizeAndApplyOptions();
}
