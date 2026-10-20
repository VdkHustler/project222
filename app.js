(function () {
  "use strict";

  const resource = window.PRIZNAKI;
  const rootKey = resource && Object.keys(resource)[0];
  const template =
    resource &&
    rootKey &&
    resource[rootKey].Шаблон &&
    resource[rootKey].Шаблон["Ввод наблюдений"];

  const $ = (id) => document.getElementById(id);

  function isObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function isFieldSpec(node) {
    if (!isObject(node)) return false;
    const keys = Object.keys(node);
    if (keys.length === 0) return true;
    return keys.some(function (key) {
      return (
        key === "Качественное значение" ||
        key === "Числовое значение" ||
        key === "Характеристика" ||
        key === "поле ввода" ||
        key === "отсутствует" ||
        key === "присутствие"
      );
    });
  }

  function optionLabel(name, node) {
    const syn = node && node.Синонимы && node.Синонимы.синоним;
    if (Array.isArray(syn) && syn.length) return name + " (" + syn.join(", ") + ")";
    return name;
  }

  function eachCharacteristic(char, fn) {
    if (Array.isArray(char)) {
      char.forEach(function (item) {
        if (!isObject(item)) return;
        Object.keys(item).forEach(function (name) {
          fn(name, item[name]);
        });
      });
      return;
    }
    if (isObject(char)) {
      Object.keys(char).forEach(function (name) {
        fn(name, char[name]);
      });
    }
  }

  function makeSub(title) {
    const box = document.createElement("div");
    box.className = "subblock";
    const heading = document.createElement("h3");
    heading.className = "subblock__title";
    heading.textContent = title;
    box.appendChild(heading);
    return box;
  }

  function bindObs(el, kind, name, section, unit) {
    el.classList.add("obs");
    el.dataset.kind = kind;
    el.dataset.name = name;
    el.dataset.section = section;
    if (unit) el.dataset.unit = unit;
    return el;
  }

  function addPlaceholder(select, text) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = text;
    select.appendChild(option);
  }

  function renderChoice(parent, name, spec, section) {
    const choices = spec["Качественное значение"] || {};
    const multiple = !!spec.совместность;
    const field = document.createElement("div");
    field.className = "field";

    if (multiple) {
      const label = document.createElement("span");
      label.className = "field__label";
      label.textContent = name;
      const box = document.createElement("div");
      box.className = "multi-value field__input";
      bindObs(box, "multi", name, section);
      const hint = document.createElement("p");
      hint.className = "multi-value__hint";
      hint.textContent = "Можно отметить несколько значений.";
      const checks = document.createElement("div");
      checks.className = "multi-value__checks";
      Object.keys(choices).forEach(function (value) {
        const lab = document.createElement("label");
        lab.className = "multi-value__opt";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = value;
        lab.appendChild(input);
        lab.appendChild(document.createTextNode(" " + optionLabel(value, choices[value])));
        checks.appendChild(lab);
      });
      box.appendChild(hint);
      box.appendChild(checks);
      field.appendChild(label);
      field.appendChild(box);
      parent.appendChild(field);
      return;
    }

    const inputId = "obs-" + Math.random().toString(36).slice(2, 9);
    const label = document.createElement("label");
    label.className = "field__label";
    label.htmlFor = inputId;
    label.textContent = name;
    const select = document.createElement("select");
    select.id = inputId;
    select.className = "field__input";
    bindObs(select, "choice", name, section);
    addPlaceholder(select, "Выберите значение");
    Object.keys(choices).forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = optionLabel(value, choices[value]);
      select.appendChild(option);
    });
    field.appendChild(label);
    field.appendChild(select);
    parent.appendChild(field);
  }

  function renderNumber(parent, name, spec, section) {
    const meta = spec["Числовое значение"] || {};
    const unit = meta["единица измерения"] || "";
    const field = document.createElement("div");
    field.className = "field";
    const inputId = "obs-" + Math.random().toString(36).slice(2, 9);
    const label = document.createElement("label");
    label.className = "field__label";
    label.htmlFor = inputId;
    label.textContent = name;
    const row = document.createElement("div");
    row.className = "field-with-unit";
    const input = document.createElement("input");
    input.id = inputId;
    input.type = "number";
    input.step = "any";
    input.className = "field__input";
    input.placeholder = "Число";
    if (meta["нижняя граница"] != null) input.min = String(meta["нижняя граница"]);
    if (meta["верхняя граница"] != null) input.max = String(meta["верхняя граница"]);
    bindObs(input, "number", name, section, unit);
    row.appendChild(input);
    if (unit) {
      const unitEl = document.createElement("span");
      unitEl.className = "unit";
      unitEl.textContent = unit;
      row.appendChild(unitEl);
    }
    field.appendChild(label);
    field.appendChild(row);
    parent.appendChild(field);
  }

  function renderText(parent, name, spec, section, inputType) {
    const field = document.createElement("div");
    field.className = "field";
    const inputId = "obs-" + Math.random().toString(36).slice(2, 9);
    const label = document.createElement("label");
    label.className = "field__label";
    label.htmlFor = inputId;
    label.textContent = name;
    const input = document.createElement("input");
    input.id = inputId;
    input.type = inputType || "text";
    input.className = "field__input";
    if (!inputType && spec["поле ввода"]) input.placeholder = spec["поле ввода"];
    bindObs(input, inputType === "date" ? "date" : "text", name, section);
    field.appendChild(label);
    field.appendChild(input);
    parent.appendChild(field);
  }

  function renderFlag(parent, name, section) {
    const field = document.createElement("div");
    field.className = "field";
    const label = document.createElement("label");
    label.className = "check-line";
    const input = document.createElement("input");
    input.type = "checkbox";
    bindObs(input, "flag", name, section);
    const text = document.createElement("span");
    text.textContent = name;
    label.appendChild(input);
    label.appendChild(text);
    field.appendChild(label);
    parent.appendChild(field);
  }

  function renderGroup(parent, name, spec, section) {
    const box = makeSub(name);
    parent.appendChild(box);
    const next = section + " / " + name;
    eachCharacteristic(spec.Характеристика, function (childName, childSpec) {
      renderField(box, childName, childSpec, next);
    });
  }

  function syncPresence(select) {
    const extra = select._extra;
    if (!extra) return;
    extra.hidden = select.value !== "присутствие";
  }

  function renderPresence(parent, name, spec, section) {
    const field = document.createElement("div");
    field.className = "field";
    const inputId = "obs-" + Math.random().toString(36).slice(2, 9);
    const label = document.createElement("label");
    label.className = "field__label";
    label.htmlFor = inputId;
    label.textContent = name;
    const select = document.createElement("select");
    select.id = inputId;
    select.className = "field__input";
    bindObs(select, "presence", name, section);
    addPlaceholder(select, "Не указано");
    if (Object.prototype.hasOwnProperty.call(spec, "отсутствует")) {
      const absent = document.createElement("option");
      absent.value = "отсутствует";
      absent.textContent = "Отсутствует";
      select.appendChild(absent);
    }
    if (Object.prototype.hasOwnProperty.call(spec, "присутствие")) {
      const present = document.createElement("option");
      present.value = "присутствие";
      present.textContent = "Присутствует";
      select.appendChild(present);
    }
    field.appendChild(label);
    field.appendChild(select);
    parent.appendChild(field);

    const details = spec.присутствие;
    if (!isObject(details) || !details.Характеристика) return;
    const extra = makeSub(name + " — уточнение");
    extra.classList.add("presence-extra");
    extra.hidden = true;
    eachCharacteristic(details.Характеристика, function (childName, childSpec) {
      renderField(extra, childName, childSpec, section + " / " + name);
    });
    select._extra = extra;
    select.addEventListener("change", function () {
      syncPresence(select);
    });
    parent.appendChild(extra);
  }

  function renderField(parent, name, spec, section) {
    if (!isObject(spec)) return;
    if (Object.keys(spec).length === 0) {
      renderFlag(parent, name, section);
      return;
    }
    if (Object.prototype.hasOwnProperty.call(spec, "отсутствует") || Object.prototype.hasOwnProperty.call(spec, "присутствие")) {
      renderPresence(parent, name, spec, section);
      return;
    }
    if (spec["Характеристика"]) {
      renderGroup(parent, name, spec, section);
      return;
    }
    if (spec["Числовое значение"]) {
      renderNumber(parent, name, spec, section);
      return;
    }
    if (spec["Качественное значение"]) {
      renderChoice(parent, name, spec, section);
      return;
    }
    if (spec["поле ввода"]) {
      renderText(parent, name, spec, section);
    }
  }

  function renderBody(parent, node, section) {
    if (!isObject(node)) return;

    const place = node["место записи в документе"];
    if (place && place["путь к узлу документа"]) {
      const hint = document.createElement("p");
      hint.className = "card__hint";
      hint.textContent = "Место записи в документе: " + place["путь к узлу документа"];
      parent.appendChild(hint);
    }

    if (isObject(node.Группа)) {
      Object.keys(node.Группа).forEach(function (name) {
        const child = node.Группа[name];
        if (isFieldSpec(child)) {
          renderField(parent, name, child, section);
          return;
        }
        const box = makeSub(name);
        parent.appendChild(box);
        renderBody(box, child, section + " / " + name);
      });
    }

    if (isObject(node.Наблюдение)) {
      Object.keys(node.Наблюдение).forEach(function (name) {
        renderField(parent, name, node.Наблюдение[name], section);
      });
    }

    if (isObject(node.Дата)) {
      renderText(parent, "Дата", { "поле ввода": "дата" }, section, "date");
      renderBody(parent, node.Дата, section);
    }
  }

  function renderForm() {
    const tabs = template.Вкладка || {};
    const tabBar = $("tabs");
    const panels = $("panels");
    const names = Object.keys(tabs);

    names.forEach(function (tabName, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tabs__btn" + (index === 0 ? " tabs__btn--active" : "");
      button.textContent = tabName;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", index === 0 ? "true" : "false");

      const panel = document.createElement("section");
      panel.className = "card panel" + (index === 0 ? " panel--active" : "");
      const title = document.createElement("h2");
      title.className = "card__title";
      title.textContent = tabName;
      panel.appendChild(title);

      const menus = (tabs[tabName] && tabs[tabName]["Вершина меню"]) || {};
      Object.keys(menus).forEach(function (menuName) {
        const box = makeSub(menuName);
        panel.appendChild(box);
        renderBody(box, menus[menuName], tabName + " / " + menuName);
      });

      button.addEventListener("click", function () {
        tabBar.querySelectorAll(".tabs__btn").forEach(function (el) {
          el.classList.remove("tabs__btn--active");
          el.setAttribute("aria-selected", "false");
        });
        panels.querySelectorAll(".panel").forEach(function (el) {
          el.classList.remove("panel--active");
        });
        button.classList.add("tabs__btn--active");
        button.setAttribute("aria-selected", "true");
        panel.classList.add("panel--active");
      });

      tabBar.appendChild(button);
      panels.appendChild(panel);
    });
  }

  function hiddenByPresence(el) {
    const extra = el.closest(".presence-extra");
    return !!(extra && extra.hidden);
  }

  function pushRow(rows, el, value) {
    const row = {
      раздел: el.dataset.section,
      название: el.dataset.name,
      значение: value,
    };
    if (el.dataset.unit) row.единица_измерения = el.dataset.unit;
    rows.push(row);
  }

  function collectRows() {
    const rows = [];
    document.querySelectorAll(".obs").forEach(function (el) {
      if (hiddenByPresence(el)) return;
      const kind = el.dataset.kind;
      if (kind === "multi") {
        const values = [];
        el.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
          if (box.checked) values.push(box.value);
        });
        if (values.length) pushRow(rows, el, values);
        return;
      }
      if (kind === "flag") {
        if (el.checked) pushRow(rows, el, "отмечено");
        return;
      }
      if (kind === "number") {
        if (el.value === "") return;
        pushRow(rows, el, Number(el.value));
        return;
      }
      if (el.value !== "") pushRow(rows, el, el.value);
    });
    return rows;
  }

  function downloadJson(obj) {
    const text = JSON.stringify(obj, null, 2);
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.href = URL.createObjectURL(blob);
    link.download = "пациент_" + stamp + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function setStatus(message, isError) {
    const el = $("form-status");
    if (!el) return;
    el.textContent = message;
    el.classList.toggle("status--error", !!isError);
  }

  function init() {
    if (!template || !template.Вкладка) {
      setStatus("Не загружен ресурс признаков.", true);
      return;
    }

    renderForm();

    $("btn-reset").addEventListener("click", function () {
      if (!window.confirm("Очистить все поля формы?")) return;
      $("patient-form").reset();
      setTimeout(function () {
        document.querySelectorAll("select.obs[data-kind='presence']").forEach(syncPresence);
      }, 0);
      setStatus("");
    });

    $("patient-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const form = $("patient-form");
      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus("Проверьте числовые поля: значение вне допустимых границ.", true);
        return;
      }
      const rows = collectRows();
      if (!rows.length) {
        setStatus("Заполните хотя бы одно наблюдение.", true);
        return;
      }
      downloadJson({
        метаданные: {
          источник: rootKey,
          версия_прототипа: "3.0",
        },
        наблюдения: rows,
      });
      setStatus("Файл JSON сохранён. Записей: " + rows.length + ".");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
