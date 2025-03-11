import { nestedIDsMapping } from "./mappings.js";
import { websocket, sendMessage } from "./networking.js";

export var getMeasurementsObjects;
export var displayMainPageMeasurements;
export var measurementsObjects = null;

export function mainPageModule() {
  var values = {};
  var statuses = {};

  var mainPageIDs = null;
  var modalsInputsIDs = null;

  (() => {
    var mainPageIDsElements = document.querySelectorAll(".main-page-value");
    mainPageIDs = Array(mainPageIDsElements.length);
    modalsInputsIDs = Array(nestedIDsMapping.length);

    var i = 0;
    for (i = 0; i < mainPageIDsElements.length; i++) {
      mainPageIDs[i] = mainPageIDsElements[i].id.slice(13);
    }

    i = 0;
    for (var el in nestedIDsMapping) {
      modalsInputsIDs[i] = nestedIDsMapping[el].id;
      i++;
    }
  })();

  var mainPageQuery = (() => {
    var mainPageQuery = mainPageIDs.join(",");
    var modalsQuery = modalsInputsIDs.join(",");
    var measurementQuery =
      "D_NUM_main_page/" + mainPageQuery + "," + modalsQuery;

    return measurementQuery;
  })();

  function sendMainPageDataRequest() {
    var isDisconnected =
      websocket === undefined || websocket.readyState !== WebSocket.OPEN;

    if (isDisconnected) return;

    sendMessage(mainPageQuery);
  }

  getMeasurementsObjects = (data) => {
    measurementsObjects = data.data;
    sendMainPageDataRequest();

    setInterval(() => {
      sendMainPageDataRequest();
    }, 2700);
  };

  displayMainPageMeasurements = (data) => {
    values = data.data;
    statuses = data.status;

    mainPageIDs.forEach((el) => {
      var value = values[el].toFixed(1).replace(/\./g, ",");
      var units = measurementsObjects[el].ZAMERY_SLONY;
      var element = document.querySelector("#main-page-id-" + el);

      if (units === "мм") {
        value = values[el].toFixed(2).replace(/\./g, ",");
      }

      if (units === "мкм") {
        value = values[el].toFixed(0).replace(/\./g, ",");
      }

      element.innerText = value + " " + units;
      element.dataset.innerStatus = "";
      element.dataset.status = "";
      element.dataset.status = statuses[el] % 10;

      if (nestedIDsMapping[el]) {
        for (var id of nestedIDsMapping[el]["id"]) {
          if (statuses[id] % 10 === 9) {
            element.dataset.innerStatus = statuses[id] % 10;
            break;
          }

          if (statuses[id] % 10 === 8) {
            element.dataset.innerStatus = statuses[id] % 10;
          }
        }
      }
    });
  };

  var dialog = document.querySelector(".modal-values");

  dialog.onclose = () => {
    updateNestedIDs.clear();
  };

  var updateNestedIDs = (() => {
    var modalIntervalId = 0;

    var f = (id) => {
      var currentModal = document.querySelector(".modal-values");
      var fields = currentModal.querySelectorAll(".modal-value-field");
      var current = nestedIDsMapping[id];

      function update() {
        current.id.forEach((el, index) => {
          fields[index].dataset.status = statuses[el] % 10;
          fields[index].innerText = values[el].toFixed(1).replace(/\./g, ",");
        });
      }

      update();

      modalIntervalId = setInterval(() => {
        update();
      }, 2700);
    };

    f.clear = () => {
      clearInterval(modalIntervalId);
    };

    return f;
  })();

  function renderNestedIDModal(id) {
    var currentMainValueID = nestedIDsMapping[id];

    var dialogWrapper = document.querySelector(
      ".modal-values .dialog-padding-wrapper"
    );

    dialogWrapper.innerHTML = "";

    var closeButton = document.createElement("span");
    closeButton.classList.add("close-button");
    closeButton.classList.add("modal-values-close");
    closeButton.addEventListener("click", () => {
      dialog.close();
    });
    closeButton.removeEventListener("click", () => {
      dialog.close();
    });

    dialogWrapper.appendChild(closeButton);

    var titleWrapper = document.createElement("div");
    titleWrapper.innerHTML = "";
    titleWrapper.classList.add("dialog-main-block-header");

    var titleData = currentMainValueID.title.split(".");

    var titles = document.createElement("p");
    titles.classList.add("modal-title");
    titles.innerText = titleData[0] + "\n" + titleData[1];

    titleWrapper.appendChild(titles);

    dialogWrapper.appendChild(titleWrapper);

    var container = document.createElement("div");
    container.classList.add("dialog-main-block");
    container.innerHTML = "";

    currentMainValueID.headers.forEach((el, index) => {
      var header = document.createElement("p");
      header.innerText = currentMainValueID.headers[index];
      header.classList.add("table-header");

      container.appendChild(header);
    });

    currentMainValueID.id.forEach((el) => {
      container.style.gridTemplateColumns = "minmax(0, 1fr) auto";

      var p0 = document.createElement("p");
      p0.innerText = measurementsObjects[el].ZAMERY_MEMO;

      if (currentMainValueID.showUnits) {
        var span = document.createElement("span");
        span.innerText = " (" + measurementsObjects[el].ZAMERY_SLONY + ")";
        p0.appendChild(span);
      }

      var p1 = document.createElement("p");
      p1.innerText = values[el].toFixed(2).replace(/\./g, ",");
      p1.classList.add("modal-value-field");
      p1.classList.add("centered");
      p1.removeAttribute("status");
      p1.dataset.status = statuses[el] % 10;

      if (currentMainValueID.headers.length === 4) {
        container.style.gridTemplateColumns = "minmax(0, 2fr) auto auto auto";

        var p2 = document.createElement("p");
        p2.innerText = measurementsObjects[el].ZAMERY_UYELLOW_PLUS;
        p2.classList.add("centered");

        var p3 = document.createElement("p");
        p3.innerText = measurementsObjects[el].ZAMERY_URED_PLUS;
        p3.classList.add("centered");
      }

      if (currentMainValueID.headers.length === 6) {
        container.style.gridTemplateColumns =
          "minmax(0, 2fr) auto auto auto auto auto";

        var p2 = document.createElement("p");
        p2.innerText = measurementsObjects[el].ZAMERY_UYELLOW_MINUS;
        p2.classList.add("centered");

        var p3 = document.createElement("p");
        p3.innerText = measurementsObjects[el].ZAMERY_URED_MINUS;
        p3.classList.add("centered");

        var p4 = document.createElement("p");
        p4.innerText = measurementsObjects[el].ZAMERY_UYELLOW_PLUS;
        p4.classList.add("centered");

        var p5 = document.createElement("p");
        p5.innerText = measurementsObjects[el].ZAMERY_URED_PLUS;
        p5.classList.add("centered");
      }

      container.appendChild(p0);
      container.appendChild(p1);

      if (currentMainValueID.headers.length === 4) {
        container.appendChild(p2);
        container.appendChild(p3);
      }

      if (currentMainValueID.headers.length === 6) {
        container.appendChild(p2);
        container.appendChild(p3);
        container.appendChild(p4);
        container.appendChild(p5);
      }
    });

    dialogWrapper.appendChild(container);
    dialog.showModal();
  }

  function showNestedIDModal(e) {
    var isActiveTarget = e.target.classList.contains(
      "main-page-value-to-details"
    );

    if (isActiveTarget) {
      var id = e.target.id.slice(13);
      renderNestedIDModal(id);
      updateNestedIDs(id);
    }
  }

  document
    .querySelector(".main-wrapper")
    .addEventListener("click", showNestedIDModal);

  dialog.addEventListener("mousedown", (event) => {
    if (event.target.nodeName === "DIALOG") {
      dialog.close();
    }
  });
}
