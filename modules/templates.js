import { sendMessage } from "./networking.js";
import { clearAllCurrentTemplateSeriesLines } from "./chart-ui.js";
import { currentChartOptions } from "./chart-rendering.js";
import { chartInitialOptions } from "./chart-options.js";
import { ui } from "./utilities.js";

export function templatesModule() {
  var templatesModalWindow = document.querySelector(".dialog-templates-menu");

  function loadSeriesTemplate(e) {
    e.stopPropagation();
    var templates = JSON.parse(localStorage.getItem("template"));

    if (templates) {
      clearAllCurrentTemplateSeriesLines();
      var type = document.querySelector("#chart-mode").value + "Chart";
      var name = e.target.innerText;
      var query = templates[type][name];

      var base = query.split("/")[0] + "/" + query.split("/")[1];
      var dates = "/" + query.split("/")[2];

      currentChartOptions[type] = structuredClone(chartInitialOptions);
      currentChartOptions[type].outerMessage = base;
      currentChartOptions[type].outerDates = dates;

      document.querySelector("#js-backdrop").style.display = "flex";

      setTimeout(() => {
        sendMessage(query);
      }, 600);
    }

    templatesModalWindow.close();
  }

  function handleSaveSeriesTemplate(message, prompt) {
    prompt = prompt || false;

    var modal = document.querySelector(".dialog-templates-message");

    modal.innerHTML = "";

    if (prompt === true) {
      var p = document.createElement("p");
      p.innerText = message;
      modal.appendChild(p);

      var i = document.createElement("input");
      i.type = "text";
      document.body.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          saveSeriesTemplate(i.value);
        }
      });
      modal.appendChild(i);

      var b1 = document.createElement("button");
      b1.innerText = "Отмена";
      modal.appendChild(b1);

      var b2 = document.createElement("button");
      b2.innerText = "Сохранить";
      b2.addEventListener("click", () => saveSeriesTemplate(i.value));
      modal.appendChild(b2);
    } else {
      var p = document.createElement("p");
      p.innerText = message;
      modal.appendChild(p);
    }

    modal.showModal();
  }

  function saveSeriesTemplate(name) {
    var templateList = document.querySelectorAll(".template-items label");
    if (templateList.length === 0) {
      ui.showMessage("Пустой список.");
      return;
    }

    if (!name) return;

    var trimmedName = name.trim();

    if (trimmedName === null || trimmedName === "") {
      ui.showMessage("Пустое имя.");
      return;
    }

    if (trimmedName.length > 45) {
      ui.showMessage("Имя слишком длинное.");
      return;
    }

    if (!/^[a-zA-Zа-яА-Яё\d,.() -]*$/g.test(trimmedName)) {
      ui.showMessage("Недопустимые символы.");
      return;
    }

    var templates = JSON.parse(localStorage.getItem("template"));
    var chartTypeSelect = document.querySelector("#chart-mode");
    var charts = chartTypeSelect.options;
    var type = chartTypeSelect.value + "Chart";
    var options = currentChartOptions[type];

    if (!templates) {
      templates = {};
      for (var chart of charts) {
        var v = chart.value + "Chart";
        templates[v] = {};
      }
    }

    var queryIDs = options.outerMessage.split("/")[1].split(",");

    if (queryIDs.length > 8) {
      queryIDs.length = 8;
    }

    var base = options.outerMessage;
    var dates = options.outerDates;

    templates[type][trimmedName] = base + dates;

    localStorage.setItem("template", JSON.stringify(templates));

    ui.closeModal();
  }

  var applyNameEdit = (() => {
    var currentEvent = "";

    return (e, oldName) => {
      if (e.type === "keydown") {
        currentEvent = "keydown";
      }

      if (currentEvent === "keydown" && e.type === "blur") {
        return;
      }

      var targetElement = e.target;
      var newName = e.target.value.trim();

      if (newName === "") {
        ui.showMessage("Имя не может быть пустым.");
        newName = oldName;
      }

      var editedItem = document.createElement("span");
      editedItem.classList.add("saved-templates-name");
      editedItem.innerText = newName;

      var buttons = document.querySelectorAll(".saved-templates-button");
      buttons.forEach((el) => {
        el.style.pointerEvents = "all";
        el.style.cursor = "pointer";
      });

      targetElement.replaceWith(editedItem);
      editedItem.addEventListener("click", loadSeriesTemplate);

      if (oldName !== newName) {
        var chartType = document.querySelector("#chart-mode").value + "Chart";
        var templates = JSON.parse(localStorage.getItem("template"));

        Object.defineProperty(
          templates[chartType],
          newName,
          Object.getOwnPropertyDescriptor(templates[chartType], oldName)
        );

        delete templates[chartType][oldName];

        localStorage.setItem("template", JSON.stringify(templates));
      }

      currentEvent = "";
    };
  })();

  function editTemplatesItemName(e) {
    e.stopPropagation();
    var buttonClicked = e.target;
    var elementToEdit =
      buttonClicked.parentElement.parentElement.firstElementChild;
    var oldName = elementToEdit.innerText;

    var buttons = document.querySelectorAll(".saved-templates-button");
    buttons.forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.cursor = "default";
    });

    var input = document.createElement("input");
    input.type = "text";
    input.maxLength = "45";
    input.value = oldName;
    input.classList.add("saved-templates-input");

    var backdrop = document.querySelector(".dialog-templates-menu");
    backdrop.classList.add("disable-backdrop");

    elementToEdit.replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Tab" || e.key === "Escape") {
        e.preventDefault();
        applyNameEdit(e, oldName);
      }
    });

    input.addEventListener("blur", (e) => {
      backdrop.classList.remove("disable-backdrop");
      applyNameEdit(e, oldName);
    });
  }

  function removeTemplatesItem(e) {
    e.stopPropagation();
    var targetElement = e.target.parentElement.parentElement;
    var itemToRemove = targetElement.firstElementChild.innerText;
    var chartType = document.querySelector("#chart-mode").value + "Chart";
    var template = JSON.parse(localStorage.getItem("template"));

    delete template[chartType][itemToRemove];

    localStorage.setItem("template", JSON.stringify(template));

    targetElement.remove();

    var isEmpty = ((o) => {
      for (var p in o[chartType]) return false;
      return true;
    })(template);

    if (isEmpty) {
      templatesModalWindow.close();
    }
  }

  function openTemplatesMenu() {
    var chartType = document.querySelector("#chart-mode").value + "Chart";
    var templates = JSON.parse(localStorage.getItem("template"));

    var isEmpty = ((o) => {
      if (o === null) return true;
      for (var p in o[chartType]) return false;
      return true;
    })(templates);

    if (isEmpty) {
      ui.showMessage("Нет сохраненных шаблонов.");
      return;
    }

    var wrapper = document.querySelector(".dialog-templates-menu .dialog-list");
    wrapper.innerHTML = "";

    var currentTemplates = templates[chartType];

    for (var template in currentTemplates) {
      var item = document.createElement("div");
      item.classList.add("saved-templates-item");

      var name = document.createElement("span");
      name.innerText = template;
      name.classList.add("saved-templates-name");
      item.appendChild(name);

      var buttons = document.createElement("div");
      buttons.classList.add("saved-templates-buttons");

      var editButton = document.createElement("span");
      editButton.innerText = "Переименовать";
      editButton.classList.add("saved-templates-button");
      editButton.addEventListener("click", editTemplatesItemName);
      buttons.appendChild(editButton);

      var removeButton = document.createElement("span");
      removeButton.innerText = "Удалить";
      removeButton.classList.add("saved-templates-button");
      removeButton.addEventListener("click", removeTemplatesItem);
      buttons.appendChild(removeButton);

      item.appendChild(buttons);

      name.addEventListener("click", loadSeriesTemplate);
      wrapper.appendChild(item);
    }

    templatesModalWindow.showModal();
  }

  document
    .querySelector("#load-template")
    .addEventListener("click", openTemplatesMenu);

  document.querySelector("#save-template").addEventListener("click", () => {
    handleSaveSeriesTemplate("Введите название шаблона:", true);
  });

  document
    .querySelector(".close-button-templates")
    .addEventListener("click", () => {
      templatesModalWindow.close();
    });

  templatesModalWindow.addEventListener("mousedown", (event) => {
    if (event.target.nodeName === "DIALOG") {
      templatesModalWindow.close();
    }
  });
}
