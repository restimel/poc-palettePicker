(function() {
    'use strict';

    var mainDialog;
    var configuration = {
        colors: [],
        defaultColor: 0,
        dialogClass: '',
        btnClass: '',
        dialogStyle: 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 3px solid black; padding: 1em; background-color: white;',
        btnStyle: 'height: 1em; width: 1.5em;',
        type: 'paletteColor',
    };

    function palettePicker(elements) {
        elements = elements || [];

        if (!(elements instanceof Array)) {
            elements = [elements];
        } else
        if (elements.length === 0) {
            elements.push(document);
        }

        searchFromElements(elements);
    }

    palettePicker.configuration = function(config) {
        Object.assign(configuration, config || {});
    };

    function searchFromElements(elements) {
        Array.from(elements).forEach(function (elem) {
            if (typeof elem === 'string') {
                searchFromElements(document.querySelectorAll(elem));
                return;
            }
            
            if (!(elem instanceof Node)) {
                console.warn('unable to manage this node', elem);
            }

            if (elem.type === configuration.type || (elem.dataset && elem.dataset.type === configuration.type)) {
                transformElement(element);
            } else {
                const query = [
                    '[type="',
                    configuration.type,
                    '"], [data-type="',
                    configuration.type,
                    '"]'].join('');
                Array.from(elem.querySelectorAll(query)).forEach(transformElement);
            }
        });
    }

    function transformElement(element) {
        var btn = createButton(element, element.value, 'open');
        element.addEventListener('focus', function () {
            openPicker(element);
        });
        element.dataset.type = 'paletteColor';
        /* hide element but keep it focusable */
        element.style.position = 'fixed';
        element.style.top = '-100%';
        element.parentNode.insertBefore(btn, element);
        element.addEventListener('change', function() {
            btn.firstChild.style.background = element.value;
        });

        btn.title = element.title;
    }

    function createButton(element, value, action) {
        var actionFn = {
            open: openPicker,
            select: selectValue,
        };
        var btn = document.createElement('button');
        var color = document.createElement('div');
        var colorValue = value || (typeof configuration.defaultColor === 'number' ? configuration.colors[configuration.defaultColor] : configuration.defaultColor);

        color.style.cssText = configuration.btnStyle;
        color.style.backgroundColor = colorValue;
        btn.className = configuration.btnClass;
        btn.onclick = function() {actionFn[action](element, colorValue)};
        btn.appendChild(color);
        return btn;
    }

    function openPicker(element) {
        var dialog = document.createElement('div');
        var title = document.createElement('h1');
        title.textContent = element.dataset.title || 'Choose color';
        dialog.appendChild(title);

        configuration.colors.forEach(function(color) {
            var elem = createButton(element, color, 'select');
            if (color === element.value) {
                elem.classList.add('active');
            }
            dialog.appendChild(elem);
        });
        dialog.className = configuration.dialogClass;
        dialog.style.cssText = configuration.dialogStyle;

        if (mainDialog) {
            closeDialog();
        }

        document.addEventListener('mousedown', clickOutside, false);
        mainDialog = dialog;
        document.body.appendChild(dialog);
    }

    function clickOutside(evt) {
        if (!mainDialog.contains(evt.target)) {
            closeDialog();
        }
    }

    function closeDialog() {
        document.removeEventListener('mousedown', clickOutside, false);
        document.body.removeChild(mainDialog);
        mainDialog = null;
    }

    function selectValue(element, value) {
        element.value = value;
        element.dispatchEvent(new InputEvent('input'));
        element.dispatchEvent(new InputEvent('change'));
        closeDialog();
    }

    self.palettePicker = palettePicker;
})();