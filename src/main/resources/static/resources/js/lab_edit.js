// Basic variable
let states;
let steps;
let labId;
let current_step = 0;
let current_states;
let instruction_input = $('#step-instruction-input');
// jQuery Selectors
let equip_list = $('#equip-item-list');
let step_list = $('#step-item-list');
let initial_edit = $('#initial-edit');
let not_initial_edit = $('#not-initial-edit');
let initial_states_list = $('#initial-states-container');
let delete_step_btn =$("#delete-step-btn");
let select_input = $(".inputEquip");
// get field from lab object
function extractLabInfo() {
    console.log(lab);
    states = lab['stateMap'];
    steps = lab['steps'];
    labId = lab['id'];
}

// load steps to the right panel, the last step will be selected
function loadSteps() {
    step_list.empty();
    for(let i = 0; i < steps.length; i++) {
        step_list.append(
            "<div class=\"form-check\">\n" +
            "  <input class=\"form-check-input\" type=\"radio\" name=\"exampleRadios\" id=\"exampleRadios" + i + "\" value=" + i + " checked>\n" +
            "  <label class=\"form-check-label\" for=\"exampleRadios" + i + "\">\n" +
            " Step " +i +": <span>" + steps[i]['brief']+ "</span>\n" +
            "  </label>\n" +
            "</div>"
        )
    }
    // set current step selection to the last 1
    current_step = steps.length - 1
}

function initialStates() {
    equip_list.empty();
    for(let v of (Object.values(states))) {
        let src = "/resources/images/equipments/" + v['equipmentId'] + ".png";
        equip_list.append($("<div class=\"card\" id=" + v['id'] + ">\n" +
            "    <div class=\"card-header\">\n" +
            "        <img src=" + src + "><textarea class='equip-name-input'>" + v['name'] + "</textarea>\n" +
            "        <button class=\"btn btn-link\" data-toggle=\"collapse\" data-target=\"#collapse-" + v['id'] + "\" aria-expanded=\"true\" aria-controls=\"collapseOne\">\n" +
            "            <span>+</span>" +
            "        </button>\n" +
            "    </div>\n" +
            "\n" +
            "    <div id=\"collapse-" + v['id'] + "\" class=\"collapse\" aria-labelledby=\"headingOne\" data-parent=\"#accordion\">\n" +
            "      <div class=\"card-body\">" +
            " <ul class='list-group'></ul>" +
            "      </div>\n" +
            "    </div>\n" +
            "  </div>"));
    }
}

function loadStepEdit() {
    $('#step-edit-counter').text(current_step);
    instruction_input.val(steps[current_step]['brief']);
    if(current_step == 0){
        delete_step_btn.prop('disabled', true);
        instruction_input.prop('disabled', true);
        initial_edit.css('display', 'block');
        not_initial_edit.css('display', 'none');
        initial_states_list.empty();
        let map = steps[0]['map'];
        for(let v of (Object.values(states))) {
            let li = $(constructStepInput(v)).appendTo(initial_states_list);
            let fields = map[v['id']];
            if(fields == null) {
                continue;
            }
            let rows = [$(li).find(".form-row")];
            for(let i = Object.keys(fields).length; i > 1; i --) {
                rows.push($(constructStepInputTextOnly()).appendTo(li));
            }
            let keys = (Object.keys(fields)).reverse();
            for(let i = 0; i < keys.length; i++) {
                let row = $(rows[i]);
                row.find('.inputProperty').val(keys[i]);
                row.find('.inputValue').val(fields[keys[i]]);
            }
        }
    } else {
        delete_step_btn.prop('disabled', false);
        instruction_input.prop('disabled', false);
        loadOption();
        initial_edit.css('display', 'none');
        not_initial_edit.css('display', 'block');
    }
}

function reFetch() {
    $.ajax({
        type: "POST",
        url: "/api/labs/" + labId,
        data: {},
        success: function (data) {
            lab = data;
            extractLabInfo();
        }
    });
}

function reFetchLabAndLoadSteps() {
    $.ajax({
        type: "POST",
        url: "/api/labs/" + labId,
        data: {},
        success: function (data) {
            lab = data;
            extractLabInfo();
            loadSteps();
            loadPanelsByStep();
        }
    });
}

function performStep() {
    current_states = {};
    for(let i = 0; i < current_step; i++) {
        let map = steps[i]['map'];
        for(let k of Object.keys(map)){
            current_states[k] = map[k]
        }
    }
}
function reFetchLabAndLoadStates() {
    $.ajax({
        type: "POST",
        url: "/api/labs/" + labId,
        data: {},
        success: function (data) {
            lab = data;
            extractLabInfo();
            initialStates();
            loadPanelsByStep();
        }
    });
}

function loadOption() {
    select_input.empty();
    select_input.append($("<option value=-1>None</option>"));
    for(let v of Object.values(states)) {
        select_input.append($("<option value=" + v['id'] + ">" + v['name'] + "</option>"))
    }
}
function loadStates() {
    for(let card of equip_list.find(".card")) {
        let stateId = $(card).attr('id');
        let fields = current_states[stateId];
        let list = $(card).find('ul');
        list.empty();
        if(fields != null) {
            console.log(list);
            for(let k of Object.keys(fields)) {
                $("<li class='list-group-item'>" + k + ": " + fields[k] + "</li>").appendTo(list)
            }
        }
    }
}
// initial left and right side bar
function initialPanels() {
    loadSteps();
    initialStates();
}

function loadPanelsByStep() {
    performStep();
    loadStates();
    loadStepEdit();
}

$('#add-step-btn').click(function () {
    addStep();
});

function addStep() {
    $.ajax({
        type: "POST",
        url: "/lab/" + labId + "/add_step",
        data: {},
        success: function (data) {
            reFetchLabAndLoadSteps();
        }
    });
}
// initial page
function initialPage() {
    extractLabInfo();
    initialPanels();
    loadPanelsByStep();
}

function changeStateName(id, name) {
    states[id]['name'] = name;
    $.ajax({
        type: "POST",
        url: "/lab/" + labId + "/changeStateName/" + id,
        data: {'name': name},
        success: function (data) {
        }
    });
}

function constructStepInput(state) {
    return "<li class=\"list-group-item\">\n" +
    "                                <div class=\"form-row\">\n" +
    "                                    <div class=\"form-group col-md-3\">\n" +
    "                                        <label>Equipment</label>\n" +
    "                                        <select class=\"form-control\" disabled>\n" +
    "                                            <option selected value='" + state['id'] + "'>" + state['name'] + "</option>\n" +
    "                                        </select>\n" +
    "                                    </div>\n" +
    "                                    <div class=\"form-group col-md-4\">\n" +
    "                                        <label>Property</label>\n" +
    "                                        <input type=\"text\" class=\"form-control inputProperty\">\n" +
    "                                    </div>\n" +
    "                                    <div class=\"form-group col-md-4\">\n" +
    "                                        <label>Value</label>\n" +
    "                                        <input type=\"text\" class=\"form-control inputValue\">\n" +
    "                                    </div>\n" +
    "                                    <button class=\"text-btn no-border-btn add-property-btn\"><span aria-hidden=\"true\">+</span></button>\n" +
    "                                </div>\n" +
    "                            </li>"
}

function constructStepInputTextOnly() {
     return   "                                <div class=\"form-row\">\n" +
        "                                    <div class=\"form-group col-md-3\">\n" +
        "                                    </div>\n" +
        "                                    <div class=\"form-group col-md-4\">\n" +
        "                                        <label>Property</label>\n" +
        "                                        <input type=\"text\" class=\"form-control inputProperty\">\n" +
        "                                    </div>\n" +
        "                                    <div class=\"form-group col-md-4\">\n" +
        "                                        <label>Value</label>\n" +
        "                                        <input type=\"text\" class=\"form-control inputValue\">\n" +
        "                                    </div>\n" +
        "                                    <button class=\"text-btn no-border-btn delete-property-btn\"><span aria-hidden=\"true\">-</span></button>\n" +
        "                                </div>\n"
}

function constructStepInputTextOnlyDisabled() {
    return   "                                <div class=\"form-row\">\n" +
        "                                    <div class=\"form-group col-md-3\">\n" +
        "                                    </div>\n" +
        "                                    <div class=\"form-group col-md-4\">\n" +
        "                                        <label>Property</label>\n" +
        "                                        <input type=\"text\" class=\"form-control inputProperty\" disabled>\n" +
        "                                    </div>\n" +
        "                                    <div class=\"form-group col-md-4\">\n" +
        "                                        <label>Value</label>\n" +
        "                                        <input type=\"text\" class=\"form-control inputValue\" disabled>\n" +
        "                                    </div>\n" +
        "                                </div>\n"
}
function updateStepState(li) {
    let stateId = li.find('select').children('option:selected').val();
    let props = [];
    let vals = [];
    li.find('.form-row').each(function (i, row) {
        row = $(row);
        props.push(row.find('.inputProperty').val());
        vals.push(row.find('.inputValue').val());
    });

    $.ajax({
        type: "POST",
        url: "/lab/" + labId + "/changeStepState",
        data: {
            'property': props,
            'value': vals,
            'stateId': stateId,
            'stepId': current_step
        },
        success: function (data) {
            reFetch();
        }
    });
}
$(document).on('click', '#step-item-list input:radio', function (event) {
    let i = $('#step-item-list input:radio:checked').val();
    if(i !== current_step) {
        current_step = i;
        loadPanelsByStep();
    }
});

$(document).on('change', '.equip-name-input', function (event) {
    let input = $(this);
    changeStateName(input.closest('.card').attr('id'), input.val());
    loadPanelsByStep();
});

$(document).on('click', '.add-property-btn', function () {
    $(this).closest('li').append(constructStepInputTextOnly());
});

$(document).on('click', '.delete-property-btn', function () {
    let parent = $(this).closest('li');
    $(this).closest('.form-row').remove();
    updateStepState(parent);
});

$(document).on('change', '.inputProperty, .inputValue', function () {
    updateStepState($(this).closest('li'));
});

function change_instruction() {
    let brief = instruction_input.val();
    $.ajax({
        type: "POST",
        url: "/lab/" + labId + "/change_step_brief",
        data: {
            'brief': brief,
            'i': current_step
        },
        success: function (data) {
            $('#step-item-list input:radio:checked').next().find('span').text(instruction_input.val());
            steps[current_step]['brief'] = brief;
        }
    });
}


instruction_input.change(function () {
    change_instruction();
});

select_input.change(function () {
    let li = $(this).closest('li');
    let stateId = $(this).val();
    let name = $(this).find('option:selected').text();
    let rows = $(li).find('.form-row');
    for(let i = 1; i < rows.length; i++) {
        $(rows[i]).remove();
    }
    let row = $(rows[0]);
    row.find('input').val("");
    if(stateId == -1) {

    } else {
        let fields = current_states[stateId];
        if(fields != null) {
            rows = [row];
            for (let i = Object.keys(fields).length; i > 1; i--) {
                rows.push($(constructStepInputTextOnlyDisabled()).appendTo(li));
            }
            let keys = (Object.keys(fields)).reverse();
            for (let i = 0; i < keys.length; i++) {
                let row = $(rows[i]);
                row.find('.inputProperty').val(keys[i]);
                row.find('.inputValue').val(fields[keys[i]]);
            }
        }
    }
    if($(li).hasClass('optionOne')) {
        li = $('#after-section .optionOne');
    } else {
        li = $('#after-section .optionTwo');
    }
    rows = $(li).find('.form-row');
    for(let i = 1; i < rows.length; i++) {
        $(rows[i]).remove();
    }
    let select = $(li).find('select');
    $(select).empty();
    $(select).append($("<option selected value='" + stateId + "'>" + name + "</option>"));
    row = $(rows[0]);
    row.find('input').val("");
    if(stateId == -1) {

    } else {
        let fields = current_states[stateId];
        if(fields != null) {
            rows = [row];
            for (let i = Object.keys(fields).length; i > 1; i--) {
                rows.push($(constructStepInputTextOnly()).appendTo(li));
            }
            let keys = (Object.keys(fields)).reverse();
            for (let i = 0; i < keys.length; i++) {
                let row = $(rows[i]);
                row.find('.inputProperty').val(keys[i]);
                row.find('.inputValue').val(fields[keys[i]]);
            }
        }
    }
});
initialPage();