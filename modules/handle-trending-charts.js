import { ui } from "./utilities.js";
import { defaultSeriesLine } from "./chart-options.js";
import { currentChartOptions } from "./chart-rendering.js";
import { sendMessage } from "./networking.js";
import { chartInstances } from "./initialize-chart.js";
import { separateGrids } from "./chart-utilities.js";

export var startTrendingUpdate = (() => {
  var id = 0;

  var f = (updateQuery) => {
    clearInterval(id);
    id = setInterval(() => {
      sendMessage(updateQuery);
    }, 3000);
  };

  f.stop = () => {
    clearInterval(id);
  };

  return f;
})();

export var initializeTrendingChart = (() => {
  var padding = [];

  return (data, index) => {
    ui.easeTrendingChartIn(index);

    var lineToAdd = { ...structuredClone(defaultSeriesLine) };

    lineToAdd.label.formatter = ({ data }) => {
      return data.value ? data.value[1].toFixed(3) : data[1].toFixed(3);
    };

    lineToAdd.lineStyle.width = 2;

    var xItem = data.TIME;
    var yItem = data.VALUE;
    var itemISODate = new Date(xItem).toISOString();
    var currentItem = {
      name: itemISODate,
      value: [itemISODate, yItem],
    };

    var series = currentChartOptions.trcChart.series;

    if (series[0] && series[0].data.length > 1) {
      var baseline = series[0].data;
      padding = Array.from(baseline.length);

      for (var i = 0; i < baseline.length; i++) {
        padding[i] = {
          name: baseline[i]["value"][0],
          value: [baseline[i]["value"][0], "-"],
        };
      }

      var xyArray = padding;
    } else {
      var xyArray = [currentItem];
    }

    lineToAdd.data = xyArray;

    separateGrids.reset();

    var divide = document.querySelector("#chart-divider").value;
    if (divide === "several") {
      lineToAdd.xAxisIndex = index;
      lineToAdd.yAxisIndex = index;
      for (i = 0; i < index + 1; i++) {
        separateGrids(i);
      }
    }

    series.push(lineToAdd);

    currentChartOptions.trendingChartBuffer[index] = xyArray;

    if (padding.length) {
      currentChartOptions.trendingChartBuffer[index] = structuredClone(padding);
    }

    var queryIDs = currentChartOptions.trcChart.outerMessage;
    var updateQuery = "D_NR_U/" + queryIDs.split("/")[1];

    startTrendingUpdate(updateQuery);
  };
})();

export var updateTrendingChart = (data) => {
  var timespan = document.querySelector("#timespan").value * 60000;
  var queryIDs = data.message.split("/")[1].split(",");

  queryIDs.forEach((el, index) => {
    var xItem = data[el].TIME;
    var yItem = data[el].VALUE;

    var series = currentChartOptions.trcChart.series[index].data;
    var buffer = currentChartOptions.trendingChartBuffer[index];

    var currentItemISODate = new Date(xItem).toISOString();

    var currentItem = {
      name: currentItemISODate,
      value: [currentItemISODate, yItem],
    };

    if (series.length) {
      if (currentItemISODate !== series.at(-1).value[0]) {
        series.push(currentItem);
      }
    }

    if (buffer.length) {
      if (currentItemISODate !== buffer.at(-1).value[0]) {
        buffer.push(currentItem);
      }
    }

    if (series.length) {
      var serWidth = new Date(series.at(-1).value[0]) - timespan;
      var seriesOverflowIndex = series.findIndex((el) => {
        return new Date(el.value[0]).getTime() > serWidth;
      });
      if (seriesOverflowIndex > 0) {
        series.splice(0, seriesOverflowIndex);
      }
    }
  });

  chartInstances.trcChart.setOption(currentChartOptions.trcChart);
};
