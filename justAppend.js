const fields = [];
let nextFieldId = 1;

const fieldBuilder = document.querySelector("#fieldBuilder");
const fieldType = document.querySelector("#fieldType");
const fieldLabel = document.querySelector("#fieldLabel");
const fieldName = document.querySelector("#fieldName");
const fieldPlaceholder = document.querySelector("#fieldPlaceholder");
const placeholderGroup = document.querySelector("#placeholderGroup");
const fieldRequired = document.querySelector("#fieldRequired");
const optionsBlock = document.querySelector("#optionsBlock");
const optionsList = document.querySelector("#optionsList");
const addOption = document.querySelector("#addOption");
const dynamicForm = document.querySelector("#dynamicForm");
const emptyState = document.querySelector("#emptyState");
const fieldCount = document.querySelector("#fieldCount");
const clearForm = document.querySelector("#clearForm");
const previewSubmit = document.querySelector("#previewSubmit");

const optionFieldTypes = ["select", "radio", "checkbox"];
const fieldTypeLabels = {
    text: "Text field",
    textarea: "Text area",
    select: "Drop down",
    radio: "Radio button",
    checkbox: "Checkbox"
};

fieldType.addEventListener("change", updateBuilderForType);
fieldBuilder.addEventListener("submit", addField);
addOption.addEventListener("click", () => addOptionRow());
clearForm.addEventListener("click", clearAllFields);
previewSubmit.addEventListener("click", () => dynamicForm.requestSubmit());

dynamicForm.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
        return;
    }

    const id = Number(actionButton.dataset.id);
    const action = actionButton.dataset.action;

    if (action === "delete") {
        deleteField(id);
    }

    if (action === "up") {
        moveField(id, -1);
    }

    if (action === "down") {
        moveField(id, 1);
    }
});

dynamicForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Form submitted");
});

optionsList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-option]");

    if (!removeButton || optionsList.children.length <= 1) {
        return;
    }

    removeButton.closest(".option-row").remove();
});

updateBuilderForType();
renderForm();

function addField(event) {
    event.preventDefault();

    const type = fieldType.value;
    const newField = {
        id: nextFieldId,
        type,
        label: fieldLabel.value.trim(),
        name: toNameValue(fieldName.value),
        placeholder: fieldPlaceholder.value.trim(),
        required: fieldRequired.checked,
        options: optionFieldTypes.includes(type) ? getOptions() : []
    };

    if (!newField.label || !newField.name) {
        return;
    }

    if (optionFieldTypes.includes(type) && newField.options.length === 0) {
        addOptionRow();
        return;
    }

    nextFieldId += 1;
    fields.push(newField);
    resetBuilder();
    renderForm();
}

function getOptions() {
    return Array.from(optionsList.querySelectorAll(".option-row"))
        .map((row) => {
            const text = row.querySelector("[data-option-text]").value.trim();
            const value = row.querySelector("[data-option-value]").value.trim();

            return {
                text,
                value: value || toNameValue(text)
            };
        })
        .filter((option) => option.text);
}

function updateBuilderForType() {
    const usesOptions = optionFieldTypes.includes(fieldType.value);
    optionsBlock.hidden = !usesOptions;
    placeholderGroup.hidden = usesOptions;

    if (usesOptions && optionsList.children.length === 0) {
        addOptionRow("Option 1", "option_1");
        addOptionRow("Option 2", "option_2");
    }
}

function addOptionRow(text = "", value = "") {
    const row = document.createElement("div");
    row.className = "option-row";
    row.innerHTML = `
        <input data-option-text type="text" placeholder="Text" value="${escapeAttribute(text)}">
        <input data-option-value type="text" placeholder="Value" value="${escapeAttribute(value)}">
        <button class="icon-button danger" data-remove-option type="button" aria-label="Remove option">x</button>
    `;

    optionsList.appendChild(row);
}

function resetBuilder() {
    fieldBuilder.reset();
    optionsList.replaceChildren();
    updateBuilderForType();
    fieldLabel.focus();
}

function clearAllFields() {
    fields.splice(0, fields.length);
    renderForm();
}

function deleteField(id) {
    const index = fields.findIndex((field) => field.id === id);

    if (index >= 0) {
        fields.splice(index, 1);
        renderForm();
    }
}

function moveField(id, direction) {
    const index = fields.findIndex((field) => field.id === id);
    const targetIndex = index + direction;

    if (index < 0 || targetIndex < 0 || targetIndex >= fields.length) {
        return;
    }

    const [field] = fields.splice(index, 1);
    fields.splice(targetIndex, 0, field);
    renderForm();
}

function renderForm() {
    dynamicForm.replaceChildren();

    fields.forEach((field, index) => {
        dynamicForm.appendChild(createFieldCard(field, index));
    });

    const hasFields = fields.length > 0;
    emptyState.hidden = hasFields;
    previewSubmit.hidden = !hasFields;
    fieldCount.textContent = hasFields
        ? `${fields.length} field${fields.length === 1 ? "" : "s"}`
        : "No fields yet";
}

function createFieldCard(field, index) {
    const card = document.createElement("section");
    card.className = "field-card";

    const top = document.createElement("div");
    top.className = "field-top";

    const labelWrap = document.createElement("div");
    const label = document.createElement("label");
    label.className = "field-label";
    label.htmlFor = `field-${field.id}`;
    label.textContent = field.label;

    if (field.required) {
        const mark = document.createElement("span");
        mark.className = "required-mark";
        mark.textContent = " *";
        label.appendChild(mark);
    }

    const meta = document.createElement("p");
    meta.className = "field-meta";
    meta.textContent = `${fieldTypeLabels[field.type]} - name: ${field.name}`;

    labelWrap.append(label, meta);
    top.append(labelWrap, createActions(field.id, index));

    card.appendChild(top);
    card.appendChild(createInput(field));

    return card;
}

function createActions(id, index) {
    const actions = document.createElement("div");
    actions.className = "field-actions";

    actions.append(
        createActionButton("up", id, "Move up", "^", index === 0),
        createActionButton("down", id, "Move down", "v", index === fields.length - 1),
        createActionButton("delete", id, "Remove field", "x")
    );

    return actions;
}

function createActionButton(action, id, label, text, disabled = false) {
    const button = document.createElement("button");
    button.className = action === "delete" ? "icon-button danger" : "icon-button";
    button.type = "button";
    button.dataset.action = action;
    button.dataset.id = String(id);
    button.ariaLabel = label;
    button.title = label;
    button.textContent = text;
    button.disabled = disabled;

    return button;
}

function createInput(field) {
    if (field.type === "textarea") {
        const textarea = document.createElement("textarea");
        applyCommonAttributes(textarea, field);
        textarea.placeholder = field.placeholder;
        return textarea;
    }

    if (field.type === "select") {
        const select = document.createElement("select");
        applyCommonAttributes(select, field);
        appendOptions(select, field.options);
        return select;
    }

    if (field.type === "radio" || field.type === "checkbox") {
        const wrap = document.createElement("div");

        field.options.forEach((option, index) => {
            const id = `field-${field.id}-${index}`;
            const label = document.createElement("label");
            label.className = "choice-row";
            label.htmlFor = id;

            const input = document.createElement("input");
            input.id = id;
            input.name = field.type === "checkbox" ? `${field.name}[]` : field.name;
            input.type = field.type;
            input.value = option.value;

            if (field.required && index === 0) {
                input.required = true;
            }

            label.append(input, document.createTextNode(option.text));
            wrap.appendChild(label);
        });

        return wrap;
    }

    const input = document.createElement("input");
    input.type = "text";
    applyCommonAttributes(input, field);
    input.placeholder = field.placeholder;
    return input;
}

function applyCommonAttributes(element, field) {
    element.id = `field-${field.id}`;
    element.name = field.name;
    element.required = field.required;
}

function appendOptions(select, options) {
    const placeholder = document.createElement("option");
    placeholder.textContent = "Select an option";
    placeholder.value = "";
    select.appendChild(placeholder);

    options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        select.appendChild(optionElement);
    });
}

function toNameValue(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function escapeAttribute(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
