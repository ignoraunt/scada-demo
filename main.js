import { networkingModule } from "./modules/networking.js";
import { initializeDataModule } from "./modules/initialize-data.js";
import { initializeUIModule } from "./modules/initialize-ui.js";
import { initializeChartModule } from "./modules/initialize-chart.js";
import { mainPageModule } from "./modules/handle-main-page.js";
import { chartRequestsModule } from "./modules/chart-requests.js";
import { chartRenderModule } from "./modules/chart-rendering.js";
import { seriesVisibilityModule } from "./modules/handle-series-visibility.js";
import { chartSeparationModule } from "./modules/chart-separation.js";
import { templatesModule } from "./modules/templates.js";
import { addMarksModule } from "./modules/handle-adding-marks.js";

(() => {
  var bootList = [
    networkingModule,
    initializeDataModule,
    initializeUIModule,
    initializeChartModule,
    mainPageModule,
    chartRequestsModule,
    chartRenderModule,
    seriesVisibilityModule,
    chartSeparationModule,
    templatesModule,
    addMarksModule,
  ];

  var i;
  for (i = 0; i < bootList.length; i++) {
    setTimeout(
      (i) => {
        bootList[i]();
      },
      0,
      i
    );
  }
})();
