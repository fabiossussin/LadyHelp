var $sl = { apps: function () { } };
(function ($, $sl) {
    const listenerSuffix = '.sl';

    $sl.globals = function () {
        $sl.globals.bindHtml('pageTitle', '[name=page-title]')
    };
    $sl.globals.environments = {
        prod: 'Production',
        staging: 'Staging',
        dev: 'Development'
    };

    $sl.services = function () {
        $sl.services.listeners();
        $sl.services.number();
        $sl.services.object();
        $sl.services.string();
        $sl.globals();
        $sl.services.form();
    };

    $sl.services.barcode = function (options, callback) {
        let $bootbox = bootbox.dialog({
            message: `<div id="scanner-container" class="text-center"></div>`
        });
        $bootbox.init(() => {
            $bootbox.find('.bootbox-body').height(360);
            const resolutions = [
                { width: 640, height: 360 },
                { width: 1280, height: 720 }
            ];
            const innerWindowSize = { width: $(document).width(), height: $(document).height() };
            let resolution = resolutions[0];
            for (let i = 0; i < resolutions.length; i++) {
                if (resolutions[i].width < innerWindowSize.width && resolutions[i].height < innerWindowSize.height) {
                    resolution = resolutions[i];
                } else break;
            }
            const defaultOptions = {
                inputStream: {
                    name: 'Live',
                    type: 'LiveStream',
                    target: $bootbox.find('#scanner-container')[0],
                    constraints: {
                        width: resolution.width,
                        height: resolution.height,
                        facingMode: 'environment'
                    },
                },
                decoder: {
                    readers: [
                        'code_128_reader'
                    ]
                }
            };
            Quagga.init($.extend(true, {}, defaultOptions, options), function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                Quagga.start();
                let $drawingCanvas = $(Quagga.canvas.dom.overlay);
                $drawingCanvas.closest('.bootbox-body').height($drawingCanvas.height() + 30);
            });
            Quagga.onProcessed(function (result) {
                var drawingCtx = Quagga.canvas.ctx.overlay;
                var drawingCanvas = Quagga.canvas.dom.overlay;
                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
                        result.boxes.filter(function (box) {
                            return box !== result.box;
                        }).forEach(function (box) {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'green', lineWidth: 2 });
                        });
                    }
                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: '#00F', lineWidth: 2 });
                    }
                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                    }
                }
            });
            Quagga.onDetected(callback);
        });
        $bootbox.on(`hidden.bs.modal${listenerSuffix}.services.barcode`, () => Quagga.stop());
    };

    $sl.services.browsers = function () { };
    $sl.services.browsers.isSafari = function () {
        return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
            navigator.userAgent &&
            navigator.userAgent.indexOf('CriOS') == -1 &&
            navigator.userAgent.indexOf('FxiOS') == -1;
    };
    $sl.services.browsers.isTouch = function () {
        try {
            document.createEvent("TouchEvent");
            return true;
        } catch (e) {
            return false;
        }
    };

    $sl.services.button = function () { };
    $sl.services.button.idle = function ($el) {
        return $($el).each(function () {
            let $btn = $(this);
            if ($btn.data('action') == 'loading') {
                $btn.html($btn.data('original-html'));
                $btn.attr('disabled', false);
                $btn.data('action', 'idle');
            }
        });
    };
    $sl.services.button.loading = function ($el) {
        return $($el).each(function () {
            let $btn = $(this);
            if (!$btn.data('loading-html')) {
                let loadingHtml = '<i class="fas fa-spinner fa-pulse"></i>';
                if ($btn.find('i').length) {
                    let $clone = $btn.clone();
                    $clone.find('i').first().replaceWith(loadingHtml);
                    loadingHtml = $clone.html();
                }
                $btn.data('loading-html', loadingHtml)
            }
            if ($btn.data('action') != 'loading') {
                $btn.attr('disabled', true);
                $btn.data('original-html', $btn.html());
                $btn.html($btn.data('loading-html'));
                $btn.data('action', 'loading');
            }
        });
    };

    $sl.services.cookie = function (name, value, days) {
        return 'undefined' == typeof value ? $sl.services.cookie.get(name) : $sl.services.cookie.set(name, value, days);
    };
    $sl.services.cookie.get = function (name) {
        let nameEquals = 'st.' + name + $applicationStoreVersion + '=';
        let cookiesArray = document.cookie.split(';');
        for (let i = 0; i < cookiesArray.length; i++) {
            let cookie = cookiesArray[i].trim();
            if (0 == cookie.indexOf(nameEquals))
                return atob(cookie.substring(nameEquals.length, cookie.length));
        }
        return null;
    };
    $sl.services.cookie.set = function (name, value, days) {
        let cookie = 'st.' + name + $applicationStoreVersion + '=' + btoa(value);
        if (days) {
            let date = new Date;
            date.setTime(date.getTime() + 1000 * (60 * (60 * (24 * days)))), cookie += `; expires=${date.toGMTString()}`
        }
        cookie += '; path=/';
        document.cookie = cookie;
    };

    $sl.services.form = function () { };
    $sl.services.form.validate = function ($el, options) {
        const defaultOptions = {
            errorPlacement: function ($error, $el) {
                $error = $('<div>').addClass('w-100').append($error);
                let $inputGroup = $el.closest('.input-group');
                if ($inputGroup.length) {
                    $inputGroup.append($error);
                } else {
                    $error.insertAfter($el);
                }
            },
            highlight: function (el) {
                let $el = $(el);
                $el.closest('.validation-group').add(`[for="${$el.attr('id')}"]`).add($el).addClass('invalid');
                $el.fadeOut(() => $el.fadeIn(() => $el.fadeOut(() => $el.fadeIn())));
            },
            unhighlight: function (el) {
                let $el = $(el);
                $el.closest('.validation-group').add(`[for="${$el.attr('id')}"]`).add($el).removeClass('invalid');
            },
            ignore: ''
        };
        return $el.validate($.extend(true, {}, defaultOptions, options));
    };

    $sl.services.listeners = function () {
        let resizeInterval;
        $(window).on(`resize${listenerSuffix}`, function () {
            clearInterval(resizeInterval);
            resizeInterval = setInterval(function () {
                clearInterval(resizeInterval);
                $(window).trigger('slResizeEnd');
            }, 200);
        });
    }

    $sl.services.number = function () {
        $sl.services.number.mask();
        $sl.services.number.money();
    };
    $sl.services.number.mask = function (minimumFractionDigits = 0, minimumIntegerDigits = 1) {
        if (typeof (0).mask == 'undefined')
            Object.defineProperty(Number.prototype, 'mask', { value: $sl.services.number.mask });

        let value = this;
        if (!(value instanceof Number))
            return;

        return value.toLocaleString('pt-BR', { minimumFractionDigits, minimumIntegerDigits });
    }
    $sl.services.number.money = function (minimumFractionDigits = 2, minimumIntegerDigits = 1) {
        if (typeof (0).money == 'undefined')
            Object.defineProperty(Number.prototype, 'money', { value: $sl.services.number.money });

        let value = this;
        if (!(value instanceof Number))
            return;

        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits, minimumIntegerDigits });
    }

    $sl.services.object = function () {
        $sl.services.object.bindHtml();
        $sl.services.object.isEqual();
    };
    $sl.services.object.bindHtml = function (property, selector) {
        if (typeof {}.bindHtml == 'undefined')
            Object.defineProperty(Object.prototype, 'bindHtml', { value: $sl.services.object.bindHtml });

        if (property && selector)
            Object.defineProperty(this, property, {
                get: () => {
                    const $obj = $(selector).first();
                    if (!$obj)
                        return;
                    return $obj.is('input, select, textarea') ? $obj.val() : $obj.text();
                },
                set: (x) => {
                    const $obj = $(selector);
                    if (!$obj || !$obj.length)
                        return;
                    $obj.is('input, select, textarea') ? $obj.val(x) : $obj.text(x);
                }
            })
    };

    $sl.services.object.isEqual = function (other) {
        if (typeof {}.isEqual == 'undefined')
            Object.defineProperty(Object.prototype, 'isEqual', { value: $sl.services.object.isEqual });

        const value = this;

        // Pega o tipo do objeto
        var type = Object.prototype.toString.call(value);

        // Se os objetos não forem do mesmo tipo, retorna false
        if (type !== Object.prototype.toString.call(other)) return false;

        // Se os valores não são arrays ou objetos, retorna a comparação entre eles
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return value === other;

        // Compara os tamanhos dos 2 valores
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compara os dois
        var compare = function (item1, item2) {

            // Pega o tipo do objeto
            var itemType = Object.prototype.toString.call(item1);

            // Se for um objeto ou um array, compara recursivamente
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!item1.isEqual(item2)) return false;
            }

            // Se não, faz uma simples comparação
            else {

                // Se os dois valores não tem o mesmo tipo, retorna false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Caso contrário, se for uma função, converte em uma string e compare
                // Caso contrário, apenas compara
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compara as propriedades
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // Se tudo der certo, retorna true
        return true;

    };

    $sl.services.request = function () { };
    $sl.services.request.defaultFailCallback = function (data) {
        if (data && data.responseJSON && data.responseJSON.message)
            $sl.services.toast({
                title: data.responseJSON.title,
                message: data.responseJSON.message,
                type: data.responseJSON.type
            });
        else if (data.status !== 0)
            $sl.services.toast({
                title: 'Erro',
                message: 'Ocorreu um erro que não conseguimos identificar ao processar sua solicitação',
                type: 'danger'
            });
    };
    $sl.services.request.get = function (options) {
        options = $.extend({
            fail: $sl.services.request.defaultFailCallback,
            always: function () { },
            headers: $.extend({}, $sl.services.request.getDefaultHeaders(), ((options && options.headers) || {}))
        },
            options, {
                type: 'GET'
            });

        return $.ajax(options).done(options.done).fail(options.fail).always(options.always);
    };
    $sl.services.request.getDefaultHeaders = function () {
        return {
            'Content-Type': 'application/json',
        };
    }
    $sl.services.request.post = function (options) {
        options = $.extend({
            fail: $sl.services.request.defaultFailCallback,
            headers: $.extend({}, $sl.services.request.getDefaultHeaders(), ((options && options.headers) || {})),
            serializeDataAsJson: true
        },
            options, {
                type: 'POST'
            });
        if (options.serializeDataAsJson && typeof options.data == 'object')
            options.data = JSON.stringify(options.data);
        return $.ajax(options).done(options.done).fail(options.fail);
    };

    $sl.services.slick = function ($el, options) {
        if ($el.find('.slick-list').length)
            $el.slick('destroy');
        $el.slick($.extend({
            lazyLoad: 'ondemand',
            infinite: true,
            autoplay: false,
            dots: true,
            mobileFirst: true,
            autoplaySpeed: 8000,
            pauseOnHover: true,
            pauseOnDotsHover: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: true,
            rows: 1,
            prevArrow: `<a class="slick-arrow slick-arrow-left ${options.arrowsClass}" name="slick-prev"><i class="fas fa-angle-left"></i></a>`,
            nextArrow: `<a class="slick-arrow slick-arrow-right ${options.arrowsClass}" name="slick-next"><i class="fas fa-angle-right"></i></a>`
        }, options));
    }

    $sl.services.string = function () {
        $sl.services.string.zipCodeMask();
        $sl.services.string.phoneMask();
        $sl.services.string.cpfCnpjMask();
        $sl.services.string.onlyDigits();
        $sl.services.string.toNumber();
    };
    $sl.services.string.zipCodeMask = function () {
        if (typeof ''.zipCodeMask == 'undefined')
            Object.defineProperty(String.prototype, 'zipCodeMask', { value: $sl.services.string.zipCodeMask });

        let value = this;

        if (value instanceof String)
            value = value.toString();

        if (typeof value === 'string' && value.length > 0) {
            let i = 0;
            return '#####-###'.replace(/#/g, _ => (value[i] ? value[i++] : ''));
        }

        return value;
    };
    $sl.services.string.phoneMask = function () {
        if (typeof ''.phoneMask == 'undefined')
            Object.defineProperty(String.prototype, 'phoneMask', { value: $sl.services.string.phoneMask });

        let value = this;

        if (value instanceof String)
            value = value.toString();

        if (typeof value === 'string' && value.length > 0) {
            const pattern = value.length <= 10 ? '(##) ####-####' : '(##) #####-####';
            let i = 0;
            return pattern.replace(/#/g, _ => (value[i] ? value[i++] : ''));
        }

        return value;
    };
    $sl.services.string.cpfCnpjMask = function () {
        if (typeof ''.cpfCnpjMask == 'undefined')
            Object.defineProperty(String.prototype, 'cpfCnpjMask', { value: $sl.services.string.cpfCnpjMask });

        let value = this;

        if (value instanceof String)
            value = value.toString();

        if (typeof value === 'string' && value.length > 0) {
            const pattern = value.length <= 11 ? '###.###.###-##' : '##.###.###/####-##';
            let i = 0;
            return pattern.replace(/#/g, _ => (value[i] ? value[i++] : ''));
        }

        return value;
    };
    $sl.services.string.onlyDigits = function () {
        if (typeof ''.onlyDigits == 'undefined')
            Object.defineProperty(String.prototype, 'onlyDigits', { value: $sl.services.string.onlyDigits });

        let value = this;

        if (value instanceof String)
            value = value.toString();
        if (typeof value === 'string') {
            return value.replace(/[^\d]/gi, '');
        }

        return value;
    };
    $sl.services.string.toNumber = function () {
        if (typeof ''.toNumber == 'undefined')
            Object.defineProperty(String.prototype, 'toNumber', { value: $sl.services.string.toNumber });

        let value = this;

        if (value instanceof String)
            value = value.toString();
        if (typeof value === 'string') {
            return +value.replace(/([^\d*,*])/gi, '').replace(',', '.');
        }

        return value;
    };

    $sl.services.validate = function () { };
    $sl.services.validate.isCnpjValid = function (s) {
        let cnpj = s.replace(/[^\d]+/g, '')

        // Valida a quantidade de caracteres
        if (cnpj.length !== 14)
            return false

        // Elimina inválidos com todos os caracteres iguais
        if (/^(\d)\1+$/.test(cnpj))
            return false

        // Cáculo de validação
        let t = cnpj.length - 2,
            d = cnpj.substring(t),
            d1 = parseInt(d.charAt(0)),
            d2 = parseInt(d.charAt(1)),
            calc = x => {
                let n = cnpj.substring(0, x),
                    y = x - 7,
                    s = 0,
                    r = 0

                for (let i = x; i >= 1; i--) {
                    s += n.charAt(x - i) * y--;
                    if (y < 2)
                        y = 9
                }

                r = 11 - s % 11
                return r > 9 ? 0 : r
            }

        return calc(t) === d1 && calc(t + 1) === d2
    }
    $sl.services.validate.isCpfValid = function (s) {
        let cpf = s.replace(/[^\d]+/g, '')

        var numeros, digitos, soma, i, resultado, digitos_iguais;
        digitos_iguais = 1;
        if (cpf.length < 11)
            return false;
        for (i = 0; i < cpf.length - 1; i++)
            if (cpf.charAt(i) != cpf.charAt(i + 1)) {
                digitos_iguais = 0;
                break;
            }
        if (!digitos_iguais) {
            numeros = cpf.substring(0, 9);
            digitos = cpf.substring(9);
            soma = 0;
            for (i = 10; i > 1; i--)
                soma += numeros.charAt(10 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;
            numeros = cpf.substring(0, 10);
            soma = 0;
            for (i = 11; i > 1; i--)
                soma += numeros.charAt(11 - i) * i;
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;

            return true;
        }
        else
            return false;
    }

    $sl.services.toast = function (options) {
        options = $.extend(true, {}, {
            title: '',
            message: '',
            type: 'info',
            mouseOver: 'resetDuration',
            duration: 5000
        }, options);

        switch (options.type) {
            case 'success':
                options.icon = 'fas fa-check-circle';
                break;
            case 'info':
                options.icon = 'fas fa-question-circle';
                break;
            case 'warning':
                options.icon = 'fas fa-exclamation-circle';
                break;
            case 'danger':
                options.icon = 'fas fa-bug';
                break;
        }

        if (!options.title && !options.message)
            return;

        let $el = $(`
    <div class="toast ${options.type}" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <i class="${options.icon}"></i>
        <strong class="mr-auto">${options.title}</strong>
        <small>${moment().format('DD/MM HH:mm')}</small>
        <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
          <i aria-hidden="true" class="fa fa-close"></i>
        </button>
      </div>
      <div class="toast-body">${options.message}</div>
    </div>`).appendTo('.toast-container');
        $el.toast({ autohide: false }).toast('show');

        if (typeof options.duration == 'number') {
            const setRemoveInterval = () => setInterval(() => {
                clearInterval($sl.services.toast.interval);
                $el.remove();
            }, options.duration);
            $sl.services.toast.interval = setRemoveInterval();

            if (options.mouseOver == 'resetDuration') {
                $el.on(`mouseover${listenerSuffix}.services.toast`, () => clearInterval($sl.services.toast.interval));
                $el.on(`mouseout${listenerSuffix}.services.toast`, () => $sl.services.toast.interval = setRemoveInterval());
            }
        }
    };

    $sl.services.url = function () { };
    $sl.services.url.hash = function (name, value) {
        if (typeof name == 'object') {
            $sl.services.url.hash._write(name);
        } else {
            let hashObj = $sl.services.url.hash._read();
            if (typeof name == 'undefined') {
                return hashObj;
            }
            if (name == 'destroy') {
                delete hashObj[value];
            }
            else {
                if (typeof value == 'undefined') {
                    return hashObj[name] || '';
                }
                hashObj[name] = value;
            }
            $sl.services.url.hash._write(hashObj)
        } return null;
    };
    $sl.services.url.hash._read = function () {
        let indexHash = window.location.href.indexOf('#');
        let hash = indexHash != -1 ? window.location.href.substring(indexHash + 1) : '';
        let obj = {};
        if (hash.length) {
            let split = hash.split('&');
            for (let i = 0; i < split.length; i++) {
                let keyValue = split[i].split('=');
                obj[keyValue[0]] = decodeURIComponent(keyValue[1])
            }
        }
        return obj;
    };
    $sl.services.url.hash._write = function (obj) {
        let keys = Object.keys(obj);
        if (keys.length) {
            let values = [];
            for (let i = 0; i < keys.length; i++) {
                let val = obj[keys[i]];
                switch (typeof val) {
                    case 'string':
                        values.push(encodeURIComponent(val));
                        break;
                    case 'number':
                    case 'boolean':
                        values.push(encodeURIComponent(val + ''));
                        break;
                    case 'object':
                        val == null ? values.push(encodeURIComponent('')) : values.push(encodeURIComponent(val.toString()));
                        break;
                    default:
                        values.push(encodeURIComponent(''));
                        break;
                }
            }
            let keyValue = [];
            for (let i = 0; i < keys.length; i++) {
                values[i].length && keyValue.push(keys[i] + '=' + values[i]);
            }
            location.hash = keyValue.join('&');
        } else {
            location.hash = '';
        }
    };
    $sl.services.url.params = function (name, value, updateLocation = true) {
        if (typeof name == 'object')
            return $sl.services.url.params[updateLocation ? '_write' : '_createQueryString'](name);
        let obj = $sl.services.url.params._read();
        if (typeof name == 'undefined')
            return obj;
        if (name == 'destroy') {
            delete obj[value];
        } else {
            if (typeof value == 'undefined')
                return obj[name] || '';
            obj[name] = value;
        }
        return $sl.services.url.params[updateLocation ? '_write' : '_createQueryString'](obj);
    };
    $sl.services.url.params._read = function () {
        let indexParams = window.location.href.indexOf('?');
        let params = indexParams != -1 ? window.location.href.substring(indexParams + 1) : '';
        let obj = {};
        if (params.length) {
            let split = params.split('&');
            for (let i = 0; i < split.length; i++) {
                let keyValue = split[i].split('=');
                obj[keyValue[0]] = decodeURIComponent(keyValue[1])
            }
        }
        return obj;
    };
    $sl.services.url.params._createQueryString = function (obj) {
        let keys = Object.keys(obj);
        if (!keys.length)
            return '';
        let values = [];
        for (let i = 0; i < keys.length; i++) {
            let val = obj[keys[i]];
            switch (typeof val) {
                case 'string':
                    values.push(encodeURIComponent(val));
                    break;
                case 'number':
                case 'boolean':
                    values.push(encodeURIComponent(val + ''));
                    break;
                case 'object':
                    val == null ? values.push(encodeURIComponent('')) : values.push(encodeURIComponent(val.toString()));
                    break;
                default:
                    values.push(encodeURIComponent(''));
                    break;
            }
        }
        let keyValue = [];
        for (let i = 0; i < keys.length; i++) {
            values[i].length && keyValue.push(keys[i] + '=' + values[i]);
        }
        return '?' + keyValue.join('&');
    }
    $sl.services.url.params._write = function (obj) {
        const query = $sl.services.url.params._createQueryString(obj);
        if (location.search != query)
            location.search = query;
    };
    $(document).ready($sl.services);
})(window.jQuery, $sl);