import { sendMessage } from "./networking.js";
import { measurementsObjects } from "./handle-main-page.js";
import { filtering, filterDates } from "./chart-ui.js";

export var setKONTROLLERY;
export var setAGREGATY;
export var setKANALY;
export var setZAMERY;
export var controllersList;
export var channelsObjects;
export var channelsSelectList = {};
export var measurementsSelectList = {};
export var disableFirstOption;

export function initializeDataModule() {
  disableFirstOption = (selectElement) => {
    var firstOption = document.querySelectorAll(
      "#" + selectElement + " option"
    )[0];

    if (firstOption.value === "0") {
      firstOption.setAttribute("disabled", "");
      if (selectElement === "filters-is-current") {
        firstOption.remove();
      }
    }
  };

  setKONTROLLERY = (data) => {
    controllersList = data;
  };

  setAGREGATY = (data) => {
    var select = document.querySelector("#AGREGATY");
    var values = Object.values(data.data).sort((a, b) =>
      a.KANALY_NAME > b.KANALY_NAME ? 1 : -1
    );

    values.forEach((el) => {
      var option = document.createElement("option");
      option.value = el.AGREGAT_ID;
      option.innerText = el.AGREGAT_NAME;
      select.appendChild(option);
    });

    sendMessage("SP_ACTIVE/GET_KANALY");
  };

  setKANALY = (data) => {
    channelsObjects = data.data;

    var select = document.querySelector("#KANALY");
    var values = Object.values(data.data)
      .filter(
        (el) =>
          el.AGREGAT_ID === Number(document.querySelector("#AGREGATY").value)
      )
      .sort((a, b) => (a.KANALY_NAME > b.KANALY_NAME ? 1 : -1));

    channelsSelectList = values;
    select.innerHTML = "";

    var option = document.createElement("option");
    option.value = "0";
    option.innerText = "Выберите канал:";
    select.appendChild(option);

    values.forEach((el) => {
      option = document.createElement("option");
      option.value = el.KANALY_ID;
      option.innerText =
        el.KANALY_NAME + (el.KANALY_MEMO ? " (" + el.KANALY_MEMO + ")" : "");
      select.appendChild(option);
    });

    select.removeAttribute("disabled");
    select.style.opacity = "1";

    filtering();
    filterDates();
  };

  setZAMERY = () => {
    var type = document.querySelector("#chart-mode").value;

    disableFirstOption("KANALY");

    document.querySelector("#KANALY").classList.remove("suggest");

    if (type === "trc" || type === "tra") {
      document.querySelector("#ZAMERY").classList.add("suggest");
    }

    var select = document.querySelector("#ZAMERY");

    if (
      measurementsObjects &&
      (document.querySelector("#chart-mode").value === "trc" ||
        document.querySelector("#chart-mode").value === "tra" ||
        document.querySelector("#chart-mode").value === "st")
    ) {
      var values = Object.values(measurementsObjects)
        .filter(
          (el) =>
            el.KANALY_ID === Number(document.querySelector("#KANALY").value)
        )
        .sort((a, b) => (a.ZAMERY_MEMO > b.ZAMERY_MEMO ? 1 : -1));

      measurementsSelectList = values;
      select.innerHTML = "";

      var option = document.createElement("option");
      option.value = "0";
      option.innerText = "Выберите замер:";
      select.appendChild(option);

      values.forEach((el) => {
        option = document.createElement("option");
        option.value = el.ZAMERY_ID;
        option.innerText = el.ZAMERY_MEMO;
        select.appendChild(option);
      });

      select.removeAttribute("disabled");
      select.style.opacity = "1";
    }
  };

  function toDTL(date) {
    var y = date.getFullYear();
    var m = (date.getMonth() + 1).toString().padStart(2, "0");
    var d = date.getDate().toString().padStart(2, "0");
    var h = date.getHours().toString().padStart(2, "0");
    var min = date.getMinutes().toString().padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}`;
  }

  function handleDuration(e) {
    var mapping = {
      hour: 3600000,
      eightHours: 28800000,
      twelveHours: 43200000,
      week: 604800000,
      month: 2629746000,
    };

    var pickerValue = e.target.value;

    var dateAnte = document.querySelector("#date-ante");
    var datePost = document.querySelector("#date-post");

    var currentTime = new Date();
    var currentTimestamp = currentTime.getTime();
    var duration = new Date(currentTimestamp - mapping[pickerValue]);

    dateAnte.value = toDTL(duration);
    datePost.value = toDTL(currentTime);
  }

  (() => {
    var currentUTS = Date.now();
    var minusHourUTS = currentUTS - 3600000;

    var current = new Date(currentUTS);
    var minusHour = new Date(minusHourUTS);

    var currentISO = toDTL(current);
    var minusHourISO = toDTL(minusHour);

    document.querySelector("#date-ante").value = minusHourISO;
    document.querySelector("#date-post").value = currentISO;
  })();

  document.querySelector("#KANALY").addEventListener("change", setZAMERY);
  document
    .querySelector("#ZAMERY")
    .addEventListener("change", () => disableFirstOption("ZAMERY"));
  document
    .querySelector("#duration")
    .addEventListener("change", handleDuration);
}
