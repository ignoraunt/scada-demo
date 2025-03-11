import * as echarts from "../libs/echarts.js";
import { disableFirstOption } from "./initialize-data.js";
import { chartInitialOptions } from "./chart-options.js";
import { prevIDs, lastQueryID } from "./chart-requests.js";
import { chartInstances } from "./initialize-chart.js";
import { currentChartOptions } from "./chart-rendering.js";
import { ui, throttle } from "./utilities.js";
import { startTrendingUpdate } from "./handle-trending-charts.js";
import {
  visibilityBuffer,
  itemVisibility,
} from "./handle-series-visibility.js";
import { gridUnitsMapping } from "./chart-rendering.js";

export var chartSeriesColors = {};
export var axes = {};
export var clearAllCurrentTemplateSeriesLines;
export var filtering;
export var filterDates;

export function chartPageInitModule() {
  function chartResize() {
    for (var instance in chartInstances) {
      chartInstances[instance].resize();
    }
  }

  var throttledChartResize = throttle(chartResize, 100);
  window.addEventListener("resize", throttledChartResize);
  window.addEventListener("fullscreenchange", throttledChartResize);

  var charts = document.querySelector("#chart-mode").options;

  for (var chart of charts) {
    var type = chart.value + "Chart";
    var originalColors = chartInstances[type]._theme.color;
    var dimmedColors = new Array(originalColors.length);

    var i = 0;
    for (i = 0; i < originalColors.length; i++) {
      dimmedColors[i] = originalColors[i] + "cc";
    }

    chartSeriesColors[type] = dimmedColors;

    axes[type] = 0;
  }

  function getAxesStatutes(e) {
    var t = e.target.value + "Chart";
    document.querySelector("#chart-divider").options[axes[t]].selected =
      "selected";
  }

  function setAxesStatutes(e) {
    var type = document.querySelector("#chart-mode").value + "Chart";
    if (e.target.value === "single") {
      axes[type] = 0;
    } else {
      axes[type] = 1;
    }
  }

  clearAllCurrentTemplateSeriesLines = () => {
    ui.blockUI();
    defaultFiltersByType();

    var type = document.querySelector("#chart-mode").value + "Chart";

    if (type === "traChart" || type === "stChart") {
      document.querySelector("#filters-is-current").value = "N";
    }

    if (type === "trcChart") {
      startTrendingUpdate.stop();
    }

    chartInstances[type].dispose();

    chartInstances[type] = echarts.init(
      document.querySelector(
        "#chart-" + document.querySelector("#chart-mode").value
      ),
      "dark",
      {
        renderer: "svg",
      }
    );

    currentChartOptions[type] = structuredClone(chartInitialOptions);
    currentChartOptions[type].outerMessage = "";
    prevIDs[type] = "";
    lastQueryID[type] = "";
    gridUnitsMapping[type] = {};

    visibilityBuffer[type] = {};
    itemVisibility[type] = [];
    for (i = 0; i < 8; i++) {
      itemVisibility[type][i] = 1;
    }

    if (type === "trcChart") {
      currentChartOptions.trendingChartBuffer = [];
      var i;
      for (i = 0; i < 8; i++) {
        currentChartOptions.trendingChartBuffer[i] = [];
      }
    }

    ui.clearTemplateSeries();
    ui.unblockUI();
  };

  function defaultSeparationByType() {
    var type = document.querySelector("#chart-mode").value;
    var divider = document.querySelector("#chart-divider");
    var flag = gridUnitsMapping[type + "Chart"].enabled;

    if (flag) {
      divider.setAttribute("disabled", "");
      divider.options[1].selected = "selected";
    } else if (!flag) {
      divider.removeAttribute("disabled");
    }

    if (type === "vv" || type === "vz" || type === "st") {
      divider.setAttribute("disabled", "");
      divider.options[0].selected = "selected";
    } else {
      divider.removeAttribute("disabled");
    }
  }

  function defaultFiltersByType() {
    var type = document.querySelector("#chart-mode").value;
    var channels = document.querySelector("#KANALY");
    var measurements = document.querySelector("#ZAMERY");
    var duration = document.querySelector("#duration");
    var filters = document.querySelector("#filters-is-current");
    var dateAnte = document.querySelector("#date-ante");
    var datePost = document.querySelector("#date-post");
    var addButton = document.querySelector("#js-add-item-button");
    var timespan = document.querySelector("#timespan");

    channels.options[0].selected = "selected";
    channels.classList.add("suggest");

    measurements.options[0].selected = "selected";
    measurements.setAttribute("disabled", "");
    measurements.classList.remove("suggest");

    duration.setAttribute("disabled", "");
    duration.options[0].selected = "selected";

    filters.setAttribute("disabled", "");
    filters.options[0].selected = "selected";

    dateAnte.setAttribute("disabled", "");
    dateAnte.previousSibling.textContent = "Начало";

    datePost.setAttribute("disabled", "");
    addButton.setAttribute("disabled", "");

    if (type === "trc") {
      timespan.removeAttribute("disabled");
    } else {
      timespan.setAttribute("disabled", "");
    }
  }

  function onChannelsSelect() {
    var type = document.querySelector("#chart-mode").value;
    var measurements = document.querySelector("#ZAMERY");
    var filters = document.querySelector("#filters-is-current");
    var addButton = document.querySelector("#js-add-item-button");

    if (type === "trc" || type === "tra" || type === "st") {
      measurements.removeAttribute("disabled");
      measurements.classList.add("suggest");
      addButton.setAttribute("disabled", "");
    } else {
      filters.removeAttribute("disabled");
      addButton.removeAttribute("disabled");
    }
  }

  function onMeasurementsSelect() {
    var type = document.querySelector("#chart-mode").value;
    var measurements = document.querySelector("#ZAMERY");
    var addButton = document.querySelector("#js-add-item-button");
    var filters = document.querySelector("#filters-is-current");
    var dateAnte = document.querySelector("#date-ante");
    var datePost = document.querySelector("#date-post");
    var duration = document.querySelector("#duration");

    measurements.classList.remove("suggest");
    addButton.removeAttribute("disabled");

    disableFirstOption("filters-is-current");

    var filterCurrent = filters.value;

    if (type === "trc") {
      filters.setAttribute("disabled", "");
      dateAnte.setAttribute("disabled", "");
      datePost.setAttribute("disabled", "");
      duration.setAttribute("disabled", "");
    }

    if (type === "tra") {
      filters.removeAttribute("disabled");
      dateAnte.removeAttribute("disabled");
      datePost.removeAttribute("disabled");
      duration.removeAttribute("disabled");

      if (filterCurrent === "S") {
        dateAnte.previousSibling.textContent = "Дата";
        datePost.setAttribute("disabled", "");
        duration.setAttribute("disabled", "");
      }
    }

    if (type === "si" || type === "sp") {
      filters.setAttribute("disabled", "");
      dateAnte.setAttribute("disabled", "");
      datePost.setAttribute("disabled", "");
      duration.setAttribute("disabled", "");
    }

    if (type === "st") {
      dateAnte.removeAttribute("disabled");
      datePost.removeAttribute("disabled");
      duration.removeAttribute("disabled");
    }
  }

  function onDatesSelect() {
    var type = document.querySelector("#chart-mode").value;
    var filters = document.querySelector("#filters-is-current");
    var dateAnte = document.querySelector("#date-ante");
    var datePost = document.querySelector("#date-post");
    var duration = document.querySelector("#duration");

    var filterCurrent = filters.value;

    if (type === "tra" || type === "st") {
      if (filterCurrent === "S") {
        dateAnte.previousSibling.textContent = "Дата";
        datePost.setAttribute("disabled", "");
        duration.setAttribute("disabled", "");
      } else {
        dateAnte.previousSibling.textContent = "Начало";
        datePost.removeAttribute("disabled");
        duration.removeAttribute("disabled");
      }
    }

    if (type === "si" || type === "sp" || type === "vv") {
      if (filterCurrent === "signal") {
        dateAnte.removeAttribute("disabled");
        dateAnte.previousSibling.textContent = "Дата";
      }

      if (filterCurrent === "0") {
        dateAnte.setAttribute("disabled", "");
        dateAnte.previousSibling.textContent = "Начало";
      }
    }
  }

  function clampTimespan() {
    var time = document.querySelector("#timespan").value;
    if (time > 30) {
      time.value = 30;
    }
    if (time < 1) {
      time.value = 1;
    }
  }

  filtering = () => {
    var type = document.querySelector("#chart-mode").value;
    var channelsOptions = document.querySelector("#KANALY").options;

    defaultFiltersByType();
    defaultSeparationByType();

    if (type === "trc" || type === "tra" || type === "st") {
      for (var option of channelsOptions) {
        option.removeAttribute("disabled");
      }
    } else if (type === "si") {
      for (var option of channelsOptions) {
        option.removeAttribute("disabled");
        if (option.value[0] === "7") {
          option.setAttribute("disabled", "");
        }
      }
    } else if (type === "sp") {
      for (var option of channelsOptions) {
        option.removeAttribute("disabled");
        if (option.value[0] !== "6") {
          option.setAttribute("disabled", "");
        }
      }
    } else if (type === "vv") {
      for (var option of channelsOptions) {
        option.removeAttribute("disabled");
        if (option.value[0] === "6" || option.value[0] === "7") {
          option.setAttribute("disabled", "");
        }
      }
    } else if (type === "vz") {
      for (var option of channelsOptions) {
        option.removeAttribute("disabled");
        if (option.value[0] !== "7") {
          option.setAttribute("disabled", "");
        }
      }
    }
  };

  filterDates = () => {
    var type = document.querySelector("#chart-mode").value;
    var f = document.querySelector("#filters-is-current");
    var o = document.createElement("option");

    if (type === "tra" || type === "st") {
      f.innerHTML = "";

      o = document.createElement("option");
      o.value = "0";
      o.text = "Текущие (без усреднения)";
      f.add(o);

      o = document.createElement("option");
      o.value = "S";
      o.text = "Сырые данные";
      f.add(o);

      o = document.createElement("option");
      o.value = "N";
      o.text = "Минутное";
      f.add(o);

      o = document.createElement("option");
      o.value = "H";
      o.text = "Часовое";
      f.add(o);

      o = document.createElement("option");
      o.value = "D";
      o.text = "Дневное";
      f.add(o);

      f.options[1].selected = "selected";

      if (type === "st") {
        f.options[2].selected = "selected";
      }
    } else {
      f.innerHTML = "";

      if (type === "trc") {
        o = document.createElement("option");
        o.value = "0";
        o.text = "Текущие (без усреднения)";
        f.add(o);
      }

      o = document.createElement("option");
      o.value = "0";
      o.text = "Текущие (без усреднения)";
      f.add(o);

      o = document.createElement("option");
      o.value = "signal";
      o.text = "На дату";
      f.add(o);
    }
  };

  document.querySelector("#chart-mode").addEventListener("change", (e) => {
    getAxesStatutes(e);
    defaultSeparationByType();
    filtering();
    filterDates();
  });

  document.querySelector("#chart-divider").addEventListener("change", (e) => {
    setAxesStatutes(e);
  });

  document
    .querySelector("#KANALY")
    .addEventListener("change", onChannelsSelect);

  document
    .querySelector("#ZAMERY")
    .addEventListener("change", onMeasurementsSelect);

  document
    .querySelector("#filters-is-current")
    .addEventListener("change", onDatesSelect);

  document.querySelector("#timespan").addEventListener("change", clampTimespan);

  document
    .querySelector("#remove-all-template-items")
    .addEventListener("click", clearAllCurrentTemplateSeriesLines);
}
