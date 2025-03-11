import { chartInstances } from "./initialize-chart.js";
import { currentChartOptions } from "./chart-rendering.js";

export var sys = {
  resizeAndApplyOptions: function () {
    var type = document.querySelector("#chart-mode").value + "Chart";
    chartInstances[type].resize();
    chartInstances[type].setOption(currentChartOptions[type]);
  },

  getChartType: function () {
    var type = document.querySelector("#chart-mode").value + "Chart";
    return type;
  },

  getChartObject: function (manual) {
    var type = document.querySelector("#chart-mode").value + "Chart";
    return manual
      ? currentChartOptions[manual + "Chart"]
      : currentChartOptions[type];
  },
};

export var ui = {
  backdrop: document.querySelector("#js-backdrop"),
  subtitle: document.querySelector("#js-subtitle"),
  templateButtons: document.querySelectorAll(".template-wrapper button"),
  addItemButton: document.querySelector("#js-add-item-button"),

  blockTemplateButtons: function () {
    this.templateButtons.forEach((el) => {
      el.setAttribute("disabled", "");
      el.classList.add("template-buttons-grayed-out");
    });

    document.querySelectorAll(".template-item").forEach((el) => {
      el.firstElementChild.setAttribute("disabled", "");
    });

    this.addItemButton.setAttribute("disabled", "");
    setTimeout(() => {
      this.addItemButton.classList.add("button-spinner");
    }, 250);
  },

  unblockTemplateButtons: function () {
    this.addItemButton.classList.remove("button-spinner");
    this.templateButtons.forEach((el) => {
      el.removeAttribute("disabled");
      setTimeout(() => {
        el.classList.remove("template-buttons-grayed-out");
        el.classList.add("template-buttons-graying-in");
      }, 100);

      setTimeout(() => {
        el.classList.remove("template-buttons-graying-in");
      }, 1000);
    });

    document.querySelectorAll(".template-item").forEach((el) => {
      el.firstElementChild.removeAttribute("disabled");
    });
    document.querySelector("#js-add-item-button").removeAttribute("disabled");
  },

  easeTrendingChartIn: function (i) {
    var backdrop = this.backdrop;
    var chartType = "#chart-" + document.querySelector("#chart-mode").value;
    backdrop.style.display = "flex";
    setTimeout(() => {
      backdrop.classList.add("appearing");
    });
    if (i === 0) {
      document.querySelector(chartType).classList.add("appearing");
      setTimeout(() => {
        document.querySelector(chartType).classList.remove("appearing");
      }, 3000);
      setTimeout(() => {
        backdrop.classList.remove("appearing");
      }, 2500);
      setTimeout(() => {
        backdrop.style.display = "none";
      }, 3200);
    } else {
      setTimeout(() => {
        backdrop.classList.remove("appearing");
      }, 4000);
      setTimeout(() => {
        backdrop.style.display = "none";
      }, 4700);
    }
  },

  easeChartIn: function () {
    var chartType = "#chart-" + document.querySelector("#chart-mode").value;
    document.querySelector(chartType).classList.add("appearing");
    setTimeout(() => {
      document.querySelector(chartType).classList.remove("appearing");
    }, 250);
  },

  blockUI: function () {
    var chartType = "#chart-" + document.querySelector("#chart-mode").value;
    chartType.classList &&
      document.querySelector(chartType).classList.add("appearing");
    this.backdrop.classList.add("appearing");
    this.backdrop.style.display = "flex";
  },

  unblockUI: function () {
    var chartType = "#chart-" + document.querySelector("#chart-mode").value;
    this.backdrop.classList.add("appearing");
    setTimeout(() => {
      this.backdrop.classList.remove("appearing");
      document.querySelector(chartType).classList.remove("appearing");
    }, 1200);
    setTimeout(() => {
      this.backdrop.style.display = "none";
    }, 1900);
  },

  clearTemplateSeries: function () {
    var chartType = "#chart-" + document.querySelector("#chart-mode").value;
    setTimeout(() => {
      document.querySelector(chartType).classList.add("appearing");
    });
    document.querySelectorAll(".template-item").forEach((el) => {
      el.classList.remove("template-item-animating");
      setTimeout(() => {
        el.remove();
      }, 750);
    });
  },

  connect: function () {
    document.body.classList.remove("disconnected-main-values-wrapper");
    this.backdrop.classList.remove("appearing");
    setTimeout(() => {
      this.backdrop.style.display = "none";
      this.subtitle.style.display = "none";
    }, 1000);
  },

  close: function () {
    this.backdrop.style.display = "flex";
    this.backdrop.classList.add("appearing");
    this.subtitle.style.display = "none";
    document.body.classList.add("disconnected-main-values-wrapper");
    document.querySelectorAll(".main-page-value").forEach((el) => {
      el.classList.add("disconnected-main-values");
      el.innerText = "- - -";
      el.dataset.status = "disconnected";
      el.dataset.innerStatus = "disconnected";
    });
  },

  closeModal: function () {
    var modal = document.querySelector(".dialog-templates-message");
    var button = modal.querySelector("button");
    button.removeEventListener("click", this.closeModal);
    modal.close();
  },

  showMessage: function (message) {
    var modal = document.querySelector(".dialog-templates-message");
    modal.innerHTML = "";

    var p = document.createElement("p");
    p.innerText = message;
    modal.appendChild(p);

    var button = document.createElement("button");
    button.innerText = "OK";
    button.addEventListener("click", this.closeModal);
    modal.appendChild(button);

    modal.showModal();
  },
};

var modal = document.querySelector(".dialog-templates-message");

modal.addEventListener("mousedown", (e) => {
  if (e.target.nodeName === "DIALOG") {
    modal.close();
  }
});

document.querySelector("#js-backdrop").addEventListener("click", (e) => {
  e.target.classList.add("click-danger");
  setTimeout(() => {
    e.target.classList.remove("click-danger");
  }, 75);
});

/*

function downloadChartAsImage() {
  var type = document.querySelector("#chart-mode").value + "Chart";

  var lightThemeColors = [
    "#5470c6",
    "#91cc75",
    "#fac858",
    "#ee6666",
    "#73c0de",
    "#3ba272",
    "#fc8452",
    "#9a60b4",
    "#ea7ccc",
  ];

  var currentColors = structuredClone(
    chartInstances[type].getModel().option.color
  );

  var chartDimensions = document
    .querySelector("#chart-" + document.querySelector("#chart-mode").value)
    .getBoundingClientRect();

  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", chartDimensions.width - 30);
  canvas.setAttribute("height", chartDimensions.height - 40);
  document.body.appendChild(canvas);

  var canvasContext = canvas.getContext("2d");

  var image = new Image();

  chartInstances[type].setOption({
    color: lightThemeColors,
    backgroundColor: "#fff",
  });

  var chartImageData = chartInstances[type].getDataURL({
    pixelRatio: 1,
    excludeComponents: ["dataZoom", "toolbox"],
  });

  image.src = chartImageData;

  image.onload = () => {
    canvasContext.drawImage(image, 0, 0);

    var anchor = document.createElement("a");

    var timeAndDate = new Date();

    var formattedTimeAndDate =
      timeAndDate.getFullYear() +
      "-" +
      String(timeAndDate.getMonth()).padStart(2, "0") +
      "-" +
      String(timeAndDate.getDate()).padStart(2, "0") +
      "--" +
      String(timeAndDate.getHours()).padStart(2, "0") +
      "-" +
      String(timeAndDate.getMinutes()).padStart(2, "0");

    var filename = formattedTimeAndDate + ".png";

    anchor.setAttribute("download", filename);
    canvas.toBlob((blob) => {
      anchor.setAttribute("href", URL.createObjectURL(blob));
      anchor.click();
    });
    canvas.remove();
  };

  chartInstances[type].setOption({
    color: currentColors,
    backgroundColor: "hsl(210 10% 11%)",
  });
}

document.body.addEventListener("keydown", (e) => {
  if (e.key === "c") {
    downloadChartAsImage();
  }
});

*/

export var makeChartRectangular = () => {
  var type = "vvChart";
  var minMaxArr = [];

  currentChartOptions[type].xAxis.min = (v) => {
    minMaxArr.push(Math.floor(v.min));
  };

  currentChartOptions[type].xAxis.max = (v) => {
    minMaxArr.push(Math.floor(v.max));
  };

  currentChartOptions[type].yAxis.min = (v) => {
    minMaxArr.push(Math.floor(v.min));
  };

  currentChartOptions[type].yAxis.max = (v) => {
    minMaxArr.push(Math.floor(v.max));
  };

  Promise.resolve().then(() => {
    if (minMaxArr.length === 0) return;

    var xRange = minMaxArr[1] - minMaxArr[0];
    var yRange = minMaxArr[3] - minMaxArr[2];
    var widerRange = xRange >= yRange ? xRange : yRange;
    var narrowerRange = xRange >= yRange ? yRange : xRange;
    var diff = Math.abs(widerRange - narrowerRange);
    var coeff = widerRange / narrowerRange;
    var pad = widerRange * 0.95;

    if (widerRange === xRange) {
      currentChartOptions[type].xAxis.min = Math.floor(
        minMaxArr[0] - xRange + pad
      );
      currentChartOptions[type].xAxis.max = Math.floor(
        minMaxArr[1] + xRange - pad
      );
      currentChartOptions[type].yAxis.min = Math.floor(
        minMaxArr[2] - yRange * coeff - diff / 2 + pad
      );
      currentChartOptions[type].yAxis.max = Math.floor(
        minMaxArr[3] + yRange * coeff + diff / 2 - pad
      );
    } else {
      currentChartOptions[type].xAxis.min = Math.floor(
        minMaxArr[0] - xRange * coeff - diff / 2 + pad
      );
      currentChartOptions[type].xAxis.max = Math.floor(
        minMaxArr[1] + xRange * coeff + diff / 2 - pad
      );
      currentChartOptions[type].yAxis.min = Math.floor(
        minMaxArr[2] - yRange + pad
      );
      currentChartOptions[type].yAxis.max = Math.floor(
        minMaxArr[3] + yRange - pad
      );
    }

    var _h = chartInstances[type]
      .getModel()
      .getComponent("grid")
      .coordinateSystem.getRect().height;

    chartInstances[type].resize({
      width: _h + 120,
    });

    chartInstances[type].setOption(currentChartOptions[type]);
  });
};

export var throttle = (callee, delay) => {
  var timeout = 0;
  return (...args) => {
    if (timeout !== 0) return;
    timeout = setTimeout(() => {
      callee(...args);
      clearTimeout(timeout);
      timeout = 0;
    }, delay);
  };
};

export var debounce = (callee, delay) => {
  var timeout = 0;
  return (...args) => {
    if (timeout !== 0) return;
    callee(...args);
    timeout = setTimeout(() => {
      clearTimeout(timeout);
      timeout = 0;
    }, delay);
  };
};
