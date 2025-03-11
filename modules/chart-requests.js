import { currentChartOptions } from "./chart-rendering.js";
import { sendMessage } from "./networking.js";
import { channelsObjects } from "./initialize-data.js";
import { ui } from "./utilities.js";

export var prevIDs = {};
export var lastQueryID = {};
export var previousWholeQuery = {};
export var requestChartData;

export function chartRequestsModule() {
  var chartTypes = document.querySelector("#chart-mode").options;
  for (var chart of chartTypes) {
    var type = chart.value + "Chart";
    prevIDs[type] = "";
    lastQueryID[type] = "";
    previousWholeQuery[type] = "";
  }

  requestChartData = () => {
    var chartMode = document.querySelector("#chart-mode");
    var type = chartMode.value + "Chart";
    var seriesLinesTemplateContainer =
      document.querySelector(".template-items");
    var channels = document.querySelector("#KANALY");
    var measurements = document.querySelector("#ZAMERY");
    var options = currentChartOptions[type];

    if (seriesLinesTemplateContainer.childElementCount === 8) {
      ui.showMessage("Шаблон не может содержать \nболее восьми серий.");
      return;
    }

    if (channels.value === "0") {
      ui.showMessage("Выберите канал.");
      return;
    }

    if (measurements.value === "0" && chartMode.value === "trc") {
      ui.showMessage("Выберите замер.");
      return;
    }

    ui.blockTemplateButtons();

    var currentID =
      measurements.value !== "0" ? measurements.value : channels.value;

    lastQueryID[type] = currentID || lastQueryID[type];

    var mapping = {
      trcChart: "D_NR",
      traChart: "D_TREND",
      siChart: "D_SIGNAL",
      spChart: "D_SPECTR",
      vvChart: "D_ORBITA",
      vzChart: "D_SKZ_W",
      stChart: "D_SOST",
    };

    var base = mapping[type] + "/";

    if (
      type === "siChart" &&
      channelsObjects[lastQueryID[type]].KANALY_TYPE === "O"
    ) {
      base = mapping[type] + "_V" + "/";
    }

    var prevIDsArray = prevIDs[type].split(",");

    if (options.outerMessage) {
      prevIDsArray = options.outerMessage.split("/")[1].split(",");
    }

    var alreadyQueried = prevIDsArray.some((el) => el === currentID);

    var filteredIDsArray = prevIDsArray;

    if (alreadyQueried) {
      filteredIDsArray = prevIDsArray.filter((el) => {
        return el !== currentID;
      });
    }

    if (prevIDsArray[prevIDsArray.length - 1] !== currentID) {
      prevIDs[type] = prevIDs[type]
        ? filteredIDsArray + "," + lastQueryID[type]
        : lastQueryID[type];
    }

    if (alreadyQueried) {
      previousWholeQuery[type] = options.outerMessage;
    } else {
      previousWholeQuery[type] = !options.outerMessage
        ? base + prevIDs[type]
        : options.outerMessage + "," + currentID;
    }

    var offset = new Date().getTimezoneOffset();
    var isCurrent = document.querySelector("#filters-is-current").value;
    var firstDTValue =
      new Date(document.querySelector("#date-ante").value) - offset;
    var lastDTValue =
      new Date(document.querySelector("#date-post").value) - offset;
    var firstDate =
      isCurrent !== "0" ? "/" + isCurrent + "," + firstDTValue : "";
    var secondDate = isCurrent !== "0" ? "," + lastDTValue : "";
    var dates = firstDate + secondDate;

    if (isCurrent === "signal") {
      dates = "/" + firstDTValue;
    }

    if (isCurrent === "S") {
      dates = "/" + "S," + firstDTValue;
    }

    if (type === "trcChart") {
      dates = "";
    }

    if (type === "stChart") {
      dates = "/" + firstDTValue + "," + lastDTValue;
    }

    var finalQuery = previousWholeQuery[type];
    options.outerMessage = finalQuery;

    if (options.outerDates && options.outerDates !== dates) {
      options.outerDates = dates;
    }

    options.outerDates && (options.outerDates = dates);

    var finalMessage = options.outerDates
      ? finalQuery + options.outerDates
      : finalQuery + dates;

    options.outerDates = dates;

    sendMessage(finalMessage);
  };

  document
    .querySelector("#js-add-item-button")
    .addEventListener("click", requestChartData);
}
