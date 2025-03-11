import * as echarts from "../libs/echarts.js";
import { currentChartOptions as chartCurrentOptions } from "./chart-rendering.js";
import { chartInitialOptions } from "./chart-options.js";
import { chartPageInitModule } from "./chart-ui.js";

export var chartInstances = {};

export function initializeChartModule() {
  function initializeChartAreas() {
    var charts = document.querySelector("#chart-mode").options;
    var chartWrapper = document.querySelector(".main-chart-wrapper");
    var initialEmptyChart = document.querySelector("#chart");

    for (var chart of charts) {
      var type = chart.value;

      chartCurrentOptions[type + "Chart"] =
        structuredClone(chartInitialOptions);

      var areaToClone = initialEmptyChart.cloneNode();
      areaToClone.id = "chart-" + type;
      areaToClone.classList.add("chart-" + type);
      chartWrapper.appendChild(areaToClone);

      chartInstances[type + "Chart"] = echarts.init(
        document.querySelector("#chart-" + type),
        "dark",
        {
          renderer: "svg",
        }
      );
    }

    initialEmptyChart.remove();
  }

  function setCurrentChartAreaVisible() {
    var current = document.querySelector("#chart-mode").value;
    var chartInstancesDOMElements = document.querySelectorAll(".main-chart");

    for (var instance of chartInstancesDOMElements) {
      instance.classList.contains(`chart-${current}`)
        ? instance.classList.add("chart-visible")
        : instance.classList.remove("chart-visible");
    }

    chartInstances[current + "Chart"].resize();
  }

  var switchCurrentChartArea = (() => {
    var templatesWrappers = {};
    var previousType = "";

    var type = document.querySelector("#chart-mode").value;
    var options = document.querySelector("#chart-mode").options;
    var blankWrapper = document.querySelector(".template-items");
    var wrapper = document.querySelector(".template-items");
    var clonedWrapper = wrapper.cloneNode(true);

    templatesWrappers["blank"] = blankWrapper;

    for (var option of options) {
      templatesWrappers[option.value] = null;
    }

    templatesWrappers[type] = clonedWrapper;

    wrapper.replaceWith(templatesWrappers[type]);

    previousType = type;

    return () => {
      var type = document.querySelector("#chart-mode").value;
      var wrapper = document.querySelector(".template-items");
      var clonedWrapper = wrapper.cloneNode(true);

      templatesWrappers[previousType] = clonedWrapper;

      if (templatesWrappers[type]) {
        wrapper.replaceWith(templatesWrappers[type]);
      } else {
        templatesWrappers[type] = templatesWrappers["blank"].cloneNode(true);
        wrapper.replaceWith(templatesWrappers[type]);
      }

      previousType = type;
    };
  })();

  initializeChartAreas();
  setCurrentChartAreaVisible();
  switchCurrentChartArea();
  chartPageInitModule();

  document.querySelector("#chart-mode").addEventListener("change", () => {
    setCurrentChartAreaVisible();
    switchCurrentChartArea();
  });

  /*
  
  // TODO (chart debugging -- comment out)
  document.body.addEventListener("keydown", (e) => {
    if (e.key === "Q") {
      var type = document.querySelector("#chart-mode").value + "Chart";
      console.log(chartInstances[type].getModel().option);
    }
    if (e.key === "q") {
      var type = document.querySelector("#chart-mode").value + "Chart";
      console.log(chartInstances[type].getModel().option.series);
    }
  });

  */
}
