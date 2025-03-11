import { throttle } from "./utilities.js";

export function addMarksModule() {
  var maps = document.querySelectorAll("map");
  var throttledResize = throttle(addMarksModule, 100);
  var marksToDelete = document.querySelectorAll(".map-area");
  marksToDelete.forEach((el) => el.remove());

  for (var map of maps) {
    map.wrapper = document.querySelector(`#js-image-wrapper-${map.name}`);
    map.img = document.querySelector(`[usemap="#${map.name}"]`);

    var ratio = map.img.offsetWidth / (map.img.naturalWidth || map.img.width);

    Array.from(map.areas).forEach((element) => {
      var areaCoords = element.coords
        .split(",")
        .map((coord) => Math.floor(coord * ratio))
        .join(",")
        .split(",");

      var mark = document.createElement("div");
      mark.id = `parameter-${element.dataset.legend}-bulb`;
      mark.style.left = areaCoords[0] + "px";
      mark.style.top = areaCoords[1] + "px";
      mark.classList.add("map-area");
      map.wrapper.appendChild(mark);
    });
  }

  function showMarks(e) {
    var mark = document.querySelector(
      `#parameter-${e.target.id.split("-")[3]}-bulb`
    );
    mark && mark.classList.add("image-mark-active");
  }

  function hideMarks(e) {
    var mark = document.querySelector(
      `#parameter-${e.target.id.split("-")[3]}-bulb`
    );

    setTimeout(() => {
      mark && mark.classList.remove("image-mark-active");
    }, 25);
  }

  document
    .querySelectorAll(".main-page-display .main-page-value")
    .forEach((el) => el.addEventListener("mouseover", showMarks));
  document
    .querySelectorAll(".main-page-display .main-page-value")
    .forEach((el) => el.addEventListener("mouseout", hideMarks));

  window.addEventListener("resize", throttledResize);
  window.addEventListener("fullscreenchange", throttledResize);
}
