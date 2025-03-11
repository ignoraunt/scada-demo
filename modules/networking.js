import * as filters from "./initialize-data.js";
import { handleIncomingChartMessage } from "./chart-rendering.js";
import {
  getMeasurementsObjects,
  displayMainPageMeasurements,
} from "./handle-main-page.js";
import { wsStatus } from "./initialize-ui.js";
import { ui } from "./utilities.js";
import { updateTrendingChart } from "./handle-trending-charts.js";

export var websocket;
export var sendMessage;

export function networkingModule() {
  var url = "ws:// :-) ";

  function initWsConnection() {
    websocket = new WebSocket(url);
    websocket.onopen = () => {
      openWSConnection();
    };
    websocket.onclose = (e) => {
      closeWSConnection(e);
    };
    websocket.onmessage = (e) => {
      readWSMessage(e);
    };
    websocket.onerror = (e) => {
      readWSError(e);
    };
  }

  function openWSConnection() {
    sendMessage("SP_ACTIVE/GET_ZAMERY");
    sendMessage("SP/GET_KONTROLLERY");
    sendMessage("SP_ACTIVE/GET_AGREGAT");

    wsStatus.connected();

    document.querySelectorAll(".main-page-value").forEach((el) => {
      el.classList.remove("disconnected-main-values");
    });

    ui.connect();
  }

  var closeWSConnection = (() => {
    var closedConnections = 0;

    return () => {
      ui.close();

      wsStatus.disconnected();

      if (closedConnections <= 99) {
        setTimeout(() => {
          initWsConnection();
        }, 2000);
      } else {
        closedConnections = 0;
        location.reload();
      }

      closedConnections += 1;

      console.warn("Reconnection attempt: " + closedConnections);
    };
  })();

  sendMessage = (message) => {
    websocket !== undefined && websocket.readyState === WebSocket.OPEN
      ? websocket.send(message)
      : console.warn("WS is not connected");
  };

  function readWSError(e) {
    console.warn("WebSocket error: ", e);
  }

  function readWSMessage(e) {
    var data = JSON.parse(e.data);
    var message = data["message"];
    var identity = message.split("/")[0];
    var mainPageUpdateMessage = message.split(",")[0].split("/")[0];

    if (mainPageUpdateMessage === "D_NUM_main_page") {
      displayMainPageMeasurements(data);
      return;
    }

    if (identity === "D_NR_U") {
      updateTrendingChart(data);
      return;
    }

    if (
      identity === "D_NR" ||
      identity === "D_TREND" ||
      identity === "D_TREND_U" ||
      identity === "D_SIGNAL" ||
      identity === "D_SPECTR" ||
      identity === "D_ORBITA" ||
      identity === "D_SIGNAL_V" ||
      identity === "D_SKZ_W" ||
      identity === "D_SOST"
    ) {
      setTimeout(() => {
        ui.unblockTemplateButtons();
      }, 1000);

      handleIncomingChartMessage(data, identity);
      return;
    }

    if (message === "SP/GET_ZAMERY") {
      getMeasurementsObjects(data);
      return;
    }

    if (message === "SP/GET_AGREGAT") {
      filters.setAGREGATY(data);
      return;
    }

    if (message === "SP/GET_KANALY") {
      filters.setKANALY(data);
      return;
    }

    if (message === "SP/GET_KONTROLLERY") {
      filters.setKONTROLLERY(data);
      return;
    }
  }

  // TODO do we really need this?
  function setServerInitDelayMode(mode, delayInSeconds) {
    if (mode === "public") {
      var sDelay = delayInSeconds;
      var msDelay = (sDelay + 1) * 1000;

      ui.blockUI();

      for (var i = sDelay; i > 0; i--) {
        setTimeout(
          (i) => {
            document.querySelector("#js-subtitle").innerText =
              "Инициализация сервера (" + i + ")";
          },
          msDelay - 1000 - i * 1000,
          i
        );
      }

      setTimeout(() => {
        initWsConnection();
      }, msDelay - 2000);
    }

    if (mode === "dev") {
      initWsConnection();
    }
  }

  setServerInitDelayMode("dev", 9);
}
