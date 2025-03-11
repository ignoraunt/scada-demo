import { sendMessage } from "./networking.js";
import { currentChartOptions } from "./chart-rendering.js";
import { clearAllCurrentTemplateSeriesLines } from "./chart-ui.js";
import { chartInstances } from "./initialize-chart.js";
import { itemVisibility } from "./handle-series-visibility.js";
import { sys, ui } from "./utilities.js";

export function cutTrendingSeriesOnTimestamp() {
  var timespan = document.querySelector("#timespan").value * 60000;
  var len = currentChartOptions.trcChart.series.length;

  if (currentChartOptions.trcChart.series.length) {
    var i;
    for (i = 0; i < len; i++) {
      if (itemVisibility.trcChart[i] === 1) {
        var buffer = currentChartOptions.trendingChartBuffer[i];
        currentChartOptions.trcChart.series[i].data = structuredClone(buffer);
        var series = currentChartOptions.trcChart.series[i].data;
        var serWidth = new Date(series.at(-1).value[0]) - timespan;

        var seriesOverflowIndex = series.findIndex((el) => {
          return new Date(el.value[0]).getTime() > serWidth;
        });

        if (seriesOverflowIndex > 0) {
          series.splice(0, seriesOverflowIndex);
        }
      }
    }

    chartInstances.trcChart.setOption(currentChartOptions.trcChart);

    document.querySelector("#timespan").setAttribute("disabled", "");
    setTimeout(() => {
      document.querySelector("#timespan").removeAttribute("disabled");
    }, 1000);
  }
}

export var extendArchiveChart = (() => {
  var earlierDate;
  var laterDate;

  var f = (e) => {
    var datesRange;

    if (e.code === "ArrowRight") {
      datesRange = laterDate + 90000;
    } else if (e.code === "ArrowLeft") {
      datesRange = earlierDate - 90000;
    }

    var base = currentChartOptions.traChart.outerMessage;
    var newQuery = base + "/S," + datesRange;

    sendMessage(newQuery);
  };

  f.setEarlierDate = (v) => {
    earlierDate = v;
  };

  f.setLaterDate = (v) => {
    laterDate = v;
  };

  f.getEarlierDate = () => {
    return earlierDate;
  };

  return f;
})();

export var separateGrids = (() => {
  var height = 320;
  var top = 50;
  var right = 35;
  var padding = top;
  var margin = 50;

  var f = (index) => {
    var type = sys.getChartType();

    var visibleGrids = currentChartOptions[type].grid.filter(
      (el) => el.show === true
    );

    visibleGrids[index].height = height;
    visibleGrids[index].top = top;
    visibleGrids[index].right = right;

    top = height * (index + 1) + margin * (index + 1) + padding;

    chartInstances[type].resize({
      height: top + 50,
    });

    chartInstances[type].setOption(currentChartOptions[type]);
  };

  f.reset = () => (top = 50);

  return f;
})();

export function deduplicateByDate(arr) {
  var len = arr.length;
  var index = 0;
  var carriage = 0;

  for (index; index < len; index++) {
    if (typeof arr[carriage + 1] === "undefined") {
      return;
    }

    var current = arr[carriage].name;
    var next = arr[carriage + 1].name;

    if (current === next) {
      arr.splice(carriage, 1);
      carriage--;
    }

    carriage++;
  }
}

export function clearIfRawDataDuplicates(e) {
  var type = document.querySelector("#chart-mode").value + "Chart";

  if (
    type === "traChart" &&
    currentChartOptions.traChart.outerDates &&
    currentChartOptions.traChart.outerDates[1] === "S"
  ) {
    ui.showMessage(
      "Невозможно построить более одного тренда сырых данных одновременно."
    );
    e.preventDefault();
    clearAllCurrentTemplateSeriesLines();
  }
}
