import { sys, makeChartRectangular } from "./utilities.js";
import {
  defaultGrid,
  defaultXAxis,
  defaultYAxis,
  defaultDataZoom,
} from "./chart-options.js";
import { separateGrids } from "./chart-utilities.js";
import { chartInstances } from "./initialize-chart.js";
import { currentChartOptions } from "./chart-rendering.js";
import { gridUnitsMapping } from "./chart-rendering.js";

export var makeSeveralGrids;

export function chartSeparationModule() {
  function makeSingleGrid() {
    var chart = sys.getChartObject();
    var type = sys.getChartType();
    var identity = chart.outerMessage.split("/")[0];
    var separatedOptions = chartInstances[type].getModel().option;

    chart.grid = [];
    chart.xAxis = [];
    chart.yAxis = [];
    chart.grid[0] = structuredClone(defaultGrid);
    chart.xAxis[0] = structuredClone(defaultXAxis);
    chart.xAxis[0].scale = true;
    chart.yAxis[0] = structuredClone(defaultYAxis);

    chart.animation = false;
    chart.xAxis.animation = false;

    if (identity === "D_NR" || identity === "D_TREND") {
      chart.xAxis[0].type = separatedOptions.xAxis[0].type;
    }

    if (identity === "D_SPECTR") {
      chart.xAxis[0].max = separatedOptions.xAxis[0].max;
    }

    if (identity === "D_ORBITA") {
      chart.xAxis[0].axisLine.lineStyle.color = "transparent";
      chart.tooltip.show = separatedOptions.tooltip[0].show;
      chart.tooltip.trigger = separatedOptions.tooltip[0].trigger;
    }

    chart.dataZoom = structuredClone(defaultDataZoom);

    var verticalSlider = structuredClone(defaultDataZoom[0]);
    verticalSlider.orient = "vertical";
    verticalSlider.width = 20;
    verticalSlider.height = "ph";
    verticalSlider.right = 15;
    delete verticalSlider.xAxisIndex;
    verticalSlider.yAxisIndex = [0, 1, 2, 3, 4, 5, 6, 7];
    chart.dataZoom.push(verticalSlider);

    if (identity === "D_ORBITA") {
      chart.dataZoom = [];
      makeChartRectangular();
    }

    var i;
    for (i = 0; i < chart.series.length; i++) {
      chart.series[i].xAxisIndex = 0;
      chart.series[i].yAxisIndex = 0;
    }

    chartInstances[type].setOption(chart, {
      replaceMerge: ["dataZoom"],
    });

    chartInstances[type].setOption(chart, {
      notMerge: true,
    });

    chartInstances[type].resize({
      height: "auto",
    });

    setTimeout(() => {
      chart.animation = true;
      chart.xAxis.animation = true;
      chartInstances[type].setOption(chart);
    });

    Promise.resolve()
      .then(() => {
        chart.yAxis[0].name = gridUnitsMapping[type][0];
      })
      .then(() => {
        chartInstances[type].setOption(chart);
      });
  }

  makeSeveralGrids = () => {
    var chart = sys.getChartObject();
    var type = sys.getChartType();
    var length = chart.series.length;
    var singleOptions = chartInstances[type].getModel().option;

    var singleType = singleOptions.xAxis[0].type;
    var singleXName = singleOptions.xAxis[0].name;

    chart.grid = [];
    chart.xAxis = [];
    chart.yAxis = [];
    chart.dataZoom.splice(2);

    var i;

    for (i = 0; i < length; i++) {
      chart.grid[i] = structuredClone(defaultGrid);
      chart.xAxis[i] = structuredClone(defaultXAxis);
      chart.xAxis[i].gridIndex = i;
      chart.xAxis[i].type = singleType;
      chart.xAxis[i].name = singleXName;
      chart.xAxis[i].scale = true;
      chart.yAxis[i] = structuredClone(defaultYAxis);
      chart.yAxis[i].gridIndex = i;
      chart.yAxis[i].axisLabel = {};
      chart.yAxis[i].axisLabel.formatter = (value) => {
        return value;
      };

      Promise.resolve(i)
        .then((i) => {
          chart.yAxis[i].name = gridUnitsMapping[type][i];
        })
        .then(() => {
          chartInstances[type].setOption(chart);
        });

      chart.tooltip.position = "";
      chart.tooltip.valueFormatter = (value) => {
        if (typeof value === "number") {
          return value.toFixed(3);
        }
      };

      if (type !== "traChart") {
        chart.series[i].xAxisIndex = i;
        chart.series[i].yAxisIndex = i;
      }
    }

    if (type === "traChart") {
      var c, j;

      for (i = 0; i < length / 3; i++) {
        c = (i + 1) * 3;
        for (j = 0; j < 3; j++) {
          var r = c + j - 3;
          chart.series[r].xAxisIndex = i;
          chart.series[r].yAxisIndex = i;
        }
      }
    }

    chart.series.forEach((el, i) => {
      if (el.data.length === 0) {
        chart.grid[i].show = false;
        chart.xAxis[i].show = false;
        chart.yAxis[i].show = false;
      }
    });

    var visibleGrids = currentChartOptions[type].grid.filter(
      (el) => el.show === true
    );

    separateGrids.reset();

    var visibleLength;
    type === "traChart"
      ? (visibleLength = visibleGrids.length / 3)
      : (visibleLength = visibleGrids.length);

    chart.animation = false;
    chart.xAxis.animation = false;
    chart.yAxis.animation = false;

    for (i = 0; i < visibleLength; i++) {
      separateGrids(i);
    }

    chartInstances[type].setOption(chart, {
      replaceMerge: ["dataZoom"],
    });

    chartInstances[type].setOption(chart);

    setTimeout(() => {
      chart.animation = true;
      chart.xAxis.animation = true;
      chartInstances[type].setOption(chart);
    });
  };

  document.querySelector("#chart-divider").addEventListener("change", (e) => {
    var t = sys.getChartObject();
    if (t.queries.length !== 0) {
      e.target.value === "single" ? makeSingleGrid() : makeSeveralGrids();
    }
  });
}
