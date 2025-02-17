/**
 * alert
 * @param message
 * @param option_
 * @returns {*}
 */
const _alert = function(message, option_) {
    message = `<img class="icon font-size--x-large" src="/static/image/icon-dialog-alert.svg" alt="alert"/><br/>${message}<br/>`;
    return new duice.AlertDialog(message)
        .onOpening(option_?.onOpening)
        .onOpened(option_?.onOpened)
        .onClosing(option_?.onClosing)
        .onClosed(option_?.onClosed)
        .open();
}

/**
 * confirm
 * @param message
 * @param option_
 * @returns {*}
 */
const _confirm = function(message, option_) {
    message = `<img class="icon font-size--x-large" src="/static/image/icon-dialog-confirm.svg" alt="confirm"/><br/>${message}<br/>`;
    return new duice.ConfirmDialog(message)
        .onOpening(option_?.onOpening)
        .onOpened(option_?.onOpened)
        .onClosing(option_?.onClosing)
        .onClosed(option_?.onClosed)
        .open();
}

/**
 * prompt
 * @param message
 * @param type
 * @param option_
 * @returns {*}
 */
const _prompt = function(message, type, option_) {
    message = `<img class="icon font-size--x-large" src="/static/image/icon-dialog-prompt.svg" alt="prompt"/><br/>${message}<br/>`;
    return new duice.PromptDialog(message, type)
        .onOpening(option_?.onOpening)
        .onOpened(option_?.onOpened)
        .onClosing(option_?.onClosing)
        .onClosed(option_?.onClosed)
        .open();
}

/**
 * Gets cookie value
 * @param name
 */
const _getCookie = function(name) {
    let value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value? value[2] : null;
}

/**
 * Sets cookie value
 * @param name
 * @param value
 * @param day
 */
const _setCookie = function(name, value, day) {
    let date = new Date();
    date.setTime(date.getTime() + day * 60 * 60 * 24 * 1000);
    document.cookie = name + '=' + value + ';expires=' + date.toUTCString() + ';path=/';
}

/**
 * Deletes cookie
 * @param name
 */
const _deleteCookie = function(name) {
    _setCookie(name, '', -1);
}

/**
 * start progress
 * @private
 */
const _startProgress = function() {
    if(window['NProgress']) {
        NProgress.start();
    }
}

/**
 * stop progress
 * @private
 */
const _stopProgress = function() {
    if(window['NProgress']) {
        NProgress.done();
    }
}

/**
 * _fetch
 * @param url
 * @param options
 * @param _bypass
 */
const _fetch = function(url, options, _bypass) {
    if(!options){
        options = {};
    }
    if(!options.headers){
        options.headers = {};
    }
    // csrf token
    ['XSRF-TOKEN', 'CSRF-TOKEN'].forEach(tokenName => {
        let tokenValue = _getCookie(tokenName);
        if(tokenValue){
            options.headers[`X-${tokenName}`] = tokenValue;
        }
    });
    options.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    options.headers['Pragma'] = 'no-cache';
    options.headers['Expires'] = '0';
    options.redirect = 'follow';
    _startProgress();
    return globalThis.fetch(url, options)
        .then(async function(response) {
            console.debug(response);

            // bypass
            if (_bypass) {
                return response;
            }

            // checks response
            if (response.ok) {
                return response;
            }else{
                const contentType = response.headers.get('content-type');
                let errorMessage;
                if(contentType === 'application/json'){
                    let responseJson = await response.json();
                    errorMessage = responseJson.message;
                }else{
                    errorMessage = await response.text();
                }
                throw Error(errorMessage);
            }
        })
        .catch((error)=>{
            if(!_bypass) {
                _alert(error.message).then();
            }
            throw Error(error);
        })
        .finally(() => {
            _stopProgress();
        });
}

/**
 * Parsed total count from Content-Range header
 * @Param {Response} response
 */
const _parseTotalCount = function(response){
    let totalCount = -1;
    let contentRange = response.headers.get("Content-Range");
    try {
        totalCount = contentRange.split(' ')[1].split('/')[1];
        totalCount = parseInt(totalCount);
        if(isNaN(totalCount)){
            return -1;
        }
        return totalCount;
    }catch(e){
        console.error(e);
        return -1;
    }
}

/**
 * _isDarkMode
 * @returns {boolean}
 * @private
 */
const _isDarkMode = function() {
    // checks cookie
    if(_getCookie('dark-mode') === 'true') {
        return true;
    }
    if(_getCookie('dark-mode') === 'false') {
        return false;
    }
    // checks media query
    if (window.matchMedia) {
        if(window.matchMedia('(prefers-color-scheme: dark)')?.matches){
            return true;
        }
    }
    // returns false
    return false;
}

/**
 * setDarkMode
 * @param enable
 */
const _setDarkMode = function(enable) {
    if(enable){
        document.documentElement.classList.add('dark-mode');
        _setCookie('dark-mode', 'true', 356);
    }else{
        document.documentElement.classList.remove('dark-mode');
        _setCookie('dark-mode', 'false', 356);
    }
}

/**
 * toggle dark mode
 */
const _toggleDarkMode = function() {
    if(_isDarkMode()) {
        _setCookie('dark-mode', 'false', 356);
    }else{
        _setCookie('dark-mode', 'true', 356);
    }
    window.location.reload();
}

// set color scheme
_setDarkMode(_isDarkMode());

/**
 * return random color code
 * @private
 */
const _getRandomColor = function() {
    if (_isDarkMode()) {
        return randomColor({
            luminosity: 'dark',
            format: 'rgb'
        });
    } else {
        return randomColor({
            luminosity: 'bright',
            format: 'rgb'
        });
    }
}

/**
 * Opens link
 * @param linkUrl
 * @param linkTarget
 */
const _openLink = function(linkUrl, linkTarget) {
    if(linkUrl) {
        if(linkTarget) {
            let result = window.open(linkUrl, linkTarget);
            // ios is security block
            if (!result) {
                window.location.href = linkUrl;
            }
        }else{
            window.location.href = linkUrl;
        }
    }
}

/**
 * checks is empty
 * @param value
 * @returns {boolean}
 * @private
 */
const _isEmpty = function(value) {
    return !(value && value.trim().length > 0);
}

/**
 * Checks generic ID (alphabet + number + -,_)
 * @param value
 */
const _isIdFormat = function(value) {
    if(value){
        let pattern = /^[a-zA-Z0-9\-\_\.]{1,}$/;
        return pattern.test(value);
    }
    return false;
}

/**
 * Checks generic password (At least 1 alphabet, 1 number, 1 special char)
 * @param value
 */
const _isPasswordFormat = function(value) {
    if(value){
        let pattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/;
        return pattern.test(value);
    }
    return false;
}

/**
 * Checks valid email address pattern
 * @param value
 */
const _isEmailFormat = function(value) {
    if(value){
        let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return pattern.test(value);
    }
    return false;
}

/**
 * Checks if value is URL address format
 * @param value
 */
const _isUrlFormat = function(value) {
    if(value){
        let pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return pattern.test(value);
    }
    return false;
}

/**
 * change language
 * @param language
 * @private
 */
const _changeLanguage = function(language) {
    if(language) {
        // reload with language parameter
        let url = new URL(document.location.href);
        url.searchParams.delete('_language');
        url.searchParams.append('_language', language);
        document.location.href = url.href;
    }
}

/**
 * webSocketClient
 */
class WebSocketClient {
    constructor(url) {
        this.stomp = Stomp.client(url);
        // this.stomp = Stomp.over(new SockJS(url));
        this.subscriptions = [];
        this.stomp.reconnect = true;
    }

    subscribe(subscription) {
        this.subscriptions.push(subscription);
        if (this.stomp.connected) {
            subscription.subscribe = this.stomp.subscribe(subscription.destination, subscription.listener);
        }
        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription?.subscribe) {
            subscription.subscribe.unsubscribe();
        }
    }

    connect() {
        const _this = this;
        this.stomp.connect({}, function() {
            _this.subscriptions.forEach(subscription => {
                subscription.subscribe = _this.stomp.subscribe(subscription.destination, subscription.listener);
            });
        }, function(error) {
            console.error(error);
            setTimeout(() => _this.connect(), 5000);
        });
    }

    send(message) {
        this.stomp.send(message.destination, message.headers, message.body);
    }

    disconnect() {
        this.stomp.disconnect(() => console.log('websocket disconnected.'));
    }

}

/**
 * load from url search params
 */
const _loadUrlSearchParams = function(object, _properties) {
    const url = new URL(location.href);
    const properties = _properties || Object.keys(object);
    properties.forEach(property => {
        const value = url.searchParams.get(property);
        if (value != null) {
            if (Array.isArray(object[property])) {
                url.searchParams.getAll(property).forEach(v => object[property].push(v));
            } else {
                switch (typeof object[property]) {
                    case 'boolean':
                        object[property] = value === 'true';
                        break;
                    case 'number':
                        object[property] = Number(value);
                        break;
                    default:
                        object[property] = value;
                        break;
                }
            }
        }
    });
}

/**
 * push to url search params
 */
const _pushUrlSearchParams = function(object, _properties) {
    const url = new URL(location.href);
    const properties = _properties || Object.keys(object);
    properties.forEach(property => {
        const value = object[property];
        if (value != null) {
            if (Array.isArray(value)) {
                url.searchParams.delete(property);
                value.forEach(v => url.searchParams.append(property, v));
            } else {
                url.searchParams.set(property, value);
            }
        }
    });
    history.pushState({ time: new Date().getTime() }, null, url);
};

/**
 * deletes url search params
 * @param _properties
 * @private
 */
const _deleteUrlSearchParams = function(_properties) {
    const url = new URL(location.href);
    const properties = _properties || [];
    properties.forEach(property => {
        url.searchParams.delete(property);
    });
    history.pushState({ time: new Date().getTime() }, null, url);
};

