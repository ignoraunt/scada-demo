import { axes } from "./chart-ui.js";
import { addMarksModule } from "./handle-adding-marks.js";
import { sendMessage } from "./networking.js";

export var wsStatus;

export function initializeUIModule() {
  wsStatus = {
    connected: () => {
      document
        .querySelector("#js-ws-status")
        .classList.add("ws-status--is-connected");
    },

    disconnected: () => {
      document
        .querySelector("#js-ws-status")
        .classList.remove("ws-status--is-connected");
    },

    sendDebugMessage: () => {
      sendMessage(
        document.querySelector("#js-query-debug-terminal-input").value
      );
    },
  };

  var mainWrapper = document.querySelector(".main-wrapper");
  var chartWrapper = document.querySelector(".main-chart-wrapper");
  var chartMode = document.querySelector("#chart-mode");
  var chartDivider = document.querySelector("#chart-divider");
  var timespan = document.querySelector("#timespan");
  var swapPagesButtons = document.querySelectorAll(".transition-button");
  var terminal = document.querySelector("#js-query-debug-terminal");

  function togglePages() {
    var mainWrapper = document.querySelector(".main-wrapper");
    var chartWrapper = document.querySelector(".main-chart-wrapper");
    if (chartWrapper.style.display === "grid") {
      chartWrapper.style.display = "none";
      mainWrapper.style.display = "grid";
      localStorage.setItem("main-page", "none");
      localStorage.setItem("charts-page", "grid");
      addMarksModule();
    } else if (mainWrapper.style.display === "grid") {
      chartWrapper.style.display = "grid";
      mainWrapper.style.display = "none";
      localStorage.setItem("main-page", "grid");
      localStorage.setItem("charts-page", "none");
    }
  }

  function toggleManualTerminal() {
    var terminal = document.querySelector("#js-query-debug-terminal");
    if (localStorage.getItem("queryingTerminalStatus")) {
      terminal.style.display = localStorage.getItem("queryingTerminalStatus");
    }
    if (terminal.style.display === "flex") {
      terminal.style.display = "none";
      localStorage.setItem("queryingTerminalStatus", "none");
    } else {
      terminal.style.display = "flex";
      localStorage.setItem("queryingTerminalStatus", "flex");
    }
  }

  function setLocalStorageChartType() {
    localStorage.setItem(
      "chartType",
      document.querySelector("#chart-mode").value
    );
  }

  function setLocalStorageGridType() {
    localStorage.setItem("gridType", JSON.stringify(axes));
  }

  function setLocalStorageTimespan() {
    localStorage.setItem("timespan", document.querySelector("#timespan").value);
  }

  mainWrapper.style.display = "grid";
  chartWrapper.style.display = "none";
  terminal.style.display = "none";

  if (localStorage.getItem("main-page")) {
    chartWrapper.style.display = localStorage.getItem("main-page");
  }

  if (localStorage.getItem("charts-page")) {
    mainWrapper.style.display = localStorage.getItem("charts-page");
  }

  if (localStorage.getItem("chartType")) {
    chartMode.value = localStorage.getItem("chartType");
  }

  if (localStorage.getItem("gridType")) {
    var type = chartMode.value + "Chart";
    var savedAxes = JSON.parse(localStorage.getItem("gridType"));
    for (var axis in savedAxes) {
      axes[axis] = savedAxes[axis];
    }
    chartDivider.options[axes[type]].selected = "selected";
  }

  if (localStorage.getItem("timespan")) {
    timespan.value = localStorage.getItem("timespan");
  }

  for (var button of swapPagesButtons) {
    button.addEventListener("click", togglePages);
  }

  chartMode.addEventListener("change", setLocalStorageChartType);

  chartDivider.addEventListener("change", (e) => {
    setLocalStorageGridType(e);
  });

  timespan.addEventListener("change", setLocalStorageTimespan);

  document
    .querySelector("#js-query-debug-terminal-button")
    .addEventListener("click", wsStatus.sendDebugMessage);

  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  document.body.addEventListener("keydown", (e) => {
    if (e.code === "Backquote") {
      toggleManualTerminal();
    }
  });
}
