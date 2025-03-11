import { chartInstances } from "./initialize-chart.js";
import { currentChartOptions } from "./chart-rendering.js";
import {
  deduplicateByDate,
  cutTrendingSeriesOnTimestamp,
  separateGrids,
} from "./chart-utilities.js";
import { makeChartRectangular } from "./utilities.js";

export var visibilityBuffer = {};
export var itemVisibility = {};
export var handleSeriesVisibility;
export var minMax;

export function seriesVisibilityModule() {
  handleSeriesVisibility = (() => {
    var types = document.querySelector("#chart-mode").options;

    var i;

    for (var type of types) {
      visibilityBuffer[type.value + "Chart"] = {};
      itemVisibility[type.value + "Chart"] = [];
      for (i = 0; i < 8; i++) {
        itemVisibility[type.value + "Chart"][i] = 1;
      }
    }

    var f = (e) => {
      var type = document.querySelector("#chart-mode").value + "Chart";
      var target = e.target;
      var seriesList = e.currentTarget.children;

      if (type === "stChart") {
        target.checked = "true";
        return;
      }

      if (
        target.tagName !== "LABEL" &&
        target.parentElement.tagName !== "LABEL"
      )
        return;

      if (seriesList.length < 2) {
        target.checked = "true";
        return;
      }

      if (type === "vvChart") {
        makeChartRectangular();
      }

      var seriesListIndex = 0;
      var currentIndex;

      for (var seriesItem of seriesList) {
        if (target === seriesItem || target.parentElement === seriesItem) {
          currentIndex = seriesListIndex;
        }
        seriesListIndex += 1;
      }

      var isLast = (() =>
        itemVisibility[type].filter((v) => v === 0).length ===
        seriesList.length - 1)();

      if (isLast && itemVisibility[type][currentIndex] !== 0) {
        target.checked = "true";
        return;
      }

      var options = currentChartOptions[type];
      var visibleGrids;
      var currentIndexOffset = (currentIndex + 1) * 3;

      minMax(true);

      // === make invisible ===
      if (itemVisibility[type][currentIndex] === 1) {
        options.animation = false;
        options.xAxis.animation = false;

        if (type === "traChart") {
          for (i = 0; i < 3; i++) {
            var r = currentIndexOffset + i - 3;
            visibilityBuffer[type][r] = options.series[r].data;
            options.series[r].data = [];
          }
        } else if (type === "trcChart") {
          options.series[currentIndex].data = [];
        } else {
          visibilityBuffer[type][currentIndex] =
            options.series[currentIndex].data;
          options.series[currentIndex].data = [];
        }

        if (document.querySelector("#chart-divider").value === "several") {
          options.xAxis[currentIndex].gridIndex = 0;
          options.yAxis[currentIndex].gridIndex = 0;

          options.xAxis[currentIndex].show = false;
          options.yAxis[currentIndex].show = false;

          options.grid[currentIndex].show = false;
          visibleGrids = options.grid.filter((el) => el.show === true);
          separateGrids.reset();

          for (i = 0; i < visibleGrids.length; i++) {
            separateGrids(i);
          }
        }

        itemVisibility[type][currentIndex] = 0;
        chartInstances[type].setOption(options);

        setTimeout(() => {
          options.animation = true;
          options.xAxis.animation = true;
          chartInstances[type].setOption(options);
        });

        // === make visible ===
      } else if (itemVisibility[type][currentIndex] === 0) {
        options.animation = false;
        options.xAxis.animation = false;

        if (type === "traChart") {
          for (i = 0; i < 3; i++) {
            var r = currentIndexOffset + i - 3;
            options.series[r].data = visibilityBuffer[type][r];
          }
        } else if (type === "trcChart") {
          deduplicateByDate(
            currentChartOptions.trendingChartBuffer[currentIndex]
          );

          options.series[currentIndex].data = structuredClone(
            currentChartOptions.trendingChartBuffer[currentIndex]
          );
        } else {
          options.series[currentIndex].data =
            visibilityBuffer[type][currentIndex];
        }

        if (document.querySelector("#chart-divider").value === "several") {
          options.xAxis[currentIndex].gridIndex = currentIndex;
          options.yAxis[currentIndex].gridIndex = currentIndex;

          options.xAxis[currentIndex].show = true;
          options.yAxis[currentIndex].show = true;

          options.grid[currentIndex].show = true;
          visibleGrids = options.grid.filter((el) => el.show === true);
          separateGrids.reset();

          for (i = 0; i < visibleGrids.length; i++) {
            separateGrids(i);
          }
        }

        itemVisibility[type][currentIndex] = 1;

        if (type === "trcChart") {
          cutTrendingSeriesOnTimestamp();
        }

        chartInstances[type].setOption(options);

        setTimeout(() => {
          options.animation = true;
          options.xAxis.animation = true;
          chartInstances[type].setOption(options);
        });
      }
    };

    f.skipAndRevertVisibilityState = (index) => {
      var type = document.querySelector("#chart-mode").value + "Chart";
      var series = currentChartOptions[type].series;
      if (itemVisibility[type][index] === 0) {
        visibilityBuffer[type][index] = series[index].data;
        series[index].data = [];
      }
    };

    return f;
  })();

  minMax = (() => {
    var isVisible = 1;

    return (reset) => {
      reset && (isVisible = 0);

      var options = currentChartOptions["traChart"];
      var series = options.series;
      var buffer = visibilityBuffer["traChart"];
      var offset = 0;
      var l = series.length / 3;
      var i, s1, s2, s3;

      for (i = 0; i < l; i++) {
        offset = (i + 1) * 3;
        s1 = offset - 3;
        s2 = offset - 2;
        s3 = offset - 1;

        if (isVisible === 1) {
          series[s2].data.length && (buffer[s2] = series[s2].data);
          series[s3].data.length && (buffer[s3] = series[s3].data);

          series[s1].lineStyle = { width: 1 };
          series[s2].data = [];
          series[s3].data = [];
        } else if (itemVisibility["traChart"][i] === 1) {
          series[s1].lineStyle = { width: 2 };
          buffer[s2] && (series[s2].data = buffer[s2]);
          buffer[s3] && (series[s3].data = buffer[s3]);
        }
      }

      isVisible === 0 ? (isVisible = 1) : (isVisible = 0);

      options.animation = false;
      chartInstances["traChart"].setOption(options);
      setTimeout(() => {
        options.animation = true;
      });
    };
  })();

  document
    .querySelector(".template-items")
    .addEventListener("change", handleSeriesVisibility);

  document.querySelector("#chart-mode").addEventListener("change", () => {
    document
      .querySelector(".template-items")
      .addEventListener("change", handleSeriesVisibility);
  });
}
