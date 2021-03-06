import { _getProvider, getApp, _registerComponent, registerVersion } from 'https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __spreadArray(to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

    var p = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        }
        else if (c < 2048) {
            out[p++] = (c >> 6) | 192;
            out[p++] = (c & 63) | 128;
        }
        else if ((c & 0xfc00) === 0xd800 &&
            i + 1 < str.length &&
            (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            out[p++] = (c >> 18) | 240;
            out[p++] = ((c >> 12) & 63) | 128;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
        else {
            out[p++] = (c >> 12) | 224;
            out[p++] = ((c >> 6) & 63) | 128;
            out[p++] = (c & 63) | 128;
        }
    }
    return out;
};
/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param bytes Array of numbers representing characters.
 * @return Stringification of the array.
 */
var byteArrayToString = function (bytes) {
    // TODO(user): Use native implementations if/when available
    var out = [];
    var pos = 0, c = 0;
    while (pos < bytes.length) {
        var c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        }
        else if (c1 > 191 && c1 < 224) {
            var c2 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        }
        else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            var c4 = bytes[pos++];
            var u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) -
                0x10000;
            out[c++] = String.fromCharCode(0xd800 + (u >> 10));
            out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
        }
        else {
            var c2 = bytes[pos++];
            var c3 = bytes[pos++];
            out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        }
    }
    return out.join('');
};
// We define it as an object literal instead of a class because a class compiled down to es5 can't
// be treeshaked. https://github.com/rollup/rollup/issues/1691
// Static lookup maps, lazily populated by init_()
var base64 = {
    /**
     * Maps bytes to characters.
     */
    byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */
    charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */
    byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */
    charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */
    ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */
    get ENCODED_VALS() {
        return this.ENCODED_VALS_BASE + '+/=';
    },
    /**
     * Our websafe alphabet.
     */
    get ENCODED_VALS_WEBSAFE() {
        return this.ENCODED_VALS_BASE + '-_.';
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */
    HAS_NATIVE_SUPPORT: typeof atob === 'function',
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeByteArray: function (input, webSafe) {
        if (!Array.isArray(input)) {
            throw Error('encodeByteArray takes an array as a parameter');
        }
        this.init_();
        var byteToCharMap = webSafe
            ? this.byteToCharMapWebSafe_
            : this.byteToCharMap_;
        var output = [];
        for (var i = 0; i < input.length; i += 3) {
            var byte1 = input[i];
            var haveByte2 = i + 1 < input.length;
            var byte2 = haveByte2 ? input[i + 1] : 0;
            var haveByte3 = i + 2 < input.length;
            var byte3 = haveByte3 ? input[i + 2] : 0;
            var outByte1 = byte1 >> 2;
            var outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
            var outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
            var outByte4 = byte3 & 0x3f;
            if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                    outByte3 = 64;
                }
            }
            output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
        }
        return output.join('');
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */
    encodeString: function (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return btoa(input);
        }
        return this.encodeByteArray(stringToByteArray$1(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */
    decodeString: function (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return atob(input);
        }
        return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */
    decodeStringToByteArray: function (input, webSafe) {
        this.init_();
        var charToByteMap = webSafe
            ? this.charToByteMapWebSafe_
            : this.charToByteMap_;
        var output = [];
        for (var i = 0; i < input.length;) {
            var byte1 = charToByteMap[input.charAt(i++)];
            var haveByte2 = i < input.length;
            var byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
            ++i;
            var haveByte3 = i < input.length;
            var byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            var haveByte4 = i < input.length;
            var byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                throw Error();
            }
            var outByte1 = (byte1 << 2) | (byte2 >> 4);
            output.push(outByte1);
            if (byte3 !== 64) {
                var outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                output.push(outByte2);
                if (byte4 !== 64) {
                    var outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                    output.push(outByte3);
                }
            }
        }
        return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */
    init_: function () {
        if (!this.byteToCharMap_) {
            this.byteToCharMap_ = {};
            this.charToByteMap_ = {};
            this.byteToCharMapWebSafe_ = {};
            this.charToByteMapWebSafe_ = {};
            // We want quick mappings back and forth, so we precompute two maps.
            for (var i = 0; i < this.ENCODED_VALS.length; i++) {
                this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                this.charToByteMap_[this.byteToCharMap_[i]] = i;
                this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                // Be forgiving when decoding and correctly decode both encodings.
                if (i >= this.ENCODED_VALS_BASE.length) {
                    this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                    this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                }
            }
        }
    }
};
/**
 * URL-safe base64 decoding
 *
 * NOTE: DO NOT use the global atob() function - it does NOT support the
 * base64Url variant encoding.
 *
 * @param str To be decoded
 * @return Decoded result, if possible
 */
var base64Decode = function (str) {
    try {
        return base64.decodeString(str, true);
    }
    catch (e) {
        console.error('base64Decode failed: ', e);
    }
    return null;
};

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
var Deferred = /** @class */ (function () {
    function Deferred() {
ve;
            _this.reject = reject;
        });
    }
    /**
     * Our API internals are not promiseified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */
    Deferred.prototype.wrapCallback = function (callback) {
        var _this = this;
        return function (error, value) {
            if (error) {
                _this.reject(error);
            }
            else {
                _this.resolve(value);
            }
            if (typeof callback === 'function') {
                // Attaching noop handler just in case developer wasn't expecting
                // promises
                _this.promise.catch(function () { });
                // Some of our callbacks don't expect a value and our own tests
                // assert that the parameter length is 1
                if (callback.length === 1) {
                    callback(error);
                }
                else {
                    callback(error, value);
                }
            }
        };
    };
    return Deferred;
}());
/**
 * This method checks if indexedDB is supported by current browser/service worker context
 * @return true if indexedDB is supported by current browser/service worker context
 */
function isIndexedDBAvailable() {
    return 'indexedDB' in self && indexedDB != null;
}
/**
 * Polyfill for `globalThis` object.
 * @returns the `globalThis` object for the given environment.
 */
function getGlobal() {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('Unable to locate global object.');
}

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
var ERROR_NAME = 'FirebaseError';
// Based on code from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
var FirebaseError = /** @class */ (function (_super) {
    __extends(FirebaseError, _super);
    function FirebaseError(code, message, customData) {

        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(_this, FirebaseError.prototype);
        // Maintains proper stack trace for where our error was thrown.
        // Only available on V8.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, ErrorFactory.prototype.create);
        }
        return _this;
    }
    return FirebaseError;
}(Error));
var ErrorFactory = /** @class */ (function () {
    function ErrorFactory(service, serviceName, errors) {
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    ErrorFactory.prototype.create = function (code) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        var customData = data[0] || {};
        var fullCode = this.service + "/" + code;
        var template = this.errors[code];
        var message = template ? replaceTemplate(template, customData) : 'Error';
        // Service Name: Error message (service/code).
        var fullMessage = this.serviceName + ": " + message + " (" + fullCode + ").";
        var error = new FirebaseError(fullCode, fullMessage, customData);
        return error;
    };
    return ErrorFactory;
}());
function replaceTemplate(template, data) {
    return template.replace(PATTERN, function (_, key) {
        var value = data[key];
        return value != null ? String(value) : "<" + key + "?>";
    });
}
var PATTERN = /\{\$([^}]+)}/g;

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * Evaluates a JSON string into a javascript object.
 *
 * @param {string} str A string containing JSON.
 * @return {*} The javascript object representing the specified JSON.
 */
function jsonEval(str) {
    return JSON.parse(str);
}

nse, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * Decodes a Firebase auth. token into constituent parts.
 *
 * Notes:
 * - May return with invalid / incomplete claims if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var decode = function (token) {
    var header = {}, claims = {}, data = {}, signature = '';
    try {
        var parts = token.split('.');
        header = jsonEval(base64Decode(parts[0]) || '');
        claims = jsonEval(base64Decode(parts[1]) || '');
        signature = parts[2];

        header: header,
        claims: claims,
        data: data,
        signature: signature
    };
};
/**
 * Decodes a Firebase auth. token and returns its issued at time if valid, null otherwise.
 *
 * Notes:
 * - May return null if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */
var issuedAtTime = function (token) {
    var claims = decode(token).claims;
    if (typeof claims === 'object' && claims.hasOwnProperty('iat')) {
        return claims['iat'];
    }
    return null;
};

/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
function getModularInstance(service) {
    if (service && service._delegate) {
        return service._delegate;
    }
    else {
        return service;
    }
}

/**
 * Component for service name T, e.g. `auth`, `auth-internal`
 */
var Component = /** @class */ (function () {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private

        this.multipleInstances = false;
        /**
         * Properties to be added to the service namespace
         */
        this.serviceProps = {};
        this.instantiationMode = "LAZY" /* LAZY */;
        this.onInstanceCreated = null;
    }
    Component.prototype.setInstantiationMode = function (mode) {
        this.instantiationMode = mode;
        return this;
    };
    Component.prototype.setMultipleInstances = function (multipleInstances) {
        this.multipleInstances = multipleInstances;
        return this;
    };
    Component.prototype.setServiceProps = function (props) {
        this.serviceProps = props;
        return this;
    };
    Component.prototype.setInstanceCreatedCallback = function (callback) {
        this.onInstanceCreated = callback;
        return this;
    };
    return Component;
}());

/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
var _a;
/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
var levelStringToEnum = {

    'silent': LogLevel.SILENT
};
/**
 * The default log level
 */
var defaultLogLevel = LogLevel.INFO;
/**
 * By default, `console.debug` is not displayed in the developer console (in
 * chrome). To avoid forcing users to have to opt-in to these logs twice
 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
 * logs to the `console.log` function.
 */
var ConsoleMethod = (_a = {},
    _a[LogLevel.DEBUG] = 'log',
    _a[LogLevel.VERBOSE] = 'log',
    _a[LogLevel.INFO] = 'info',
    _a[LogLevel.WARN] = 'warn',
    _a[LogLevel.ERROR] = 'error',
    _a);
/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 */
var defaultLogHandler = function (instance, logType) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (logType < instance.logLevel) {
        return;
    }
    var now = new Date().toISOString();
    var method = ConsoleMethod[logType];
    if (method) {
        console[method].apply(console, __spreadArray(["[" + now + "]  " + instance.name + ":"], args));
    }
    else {
        throw new Error("Attempted to log a message with an invalid logType (value: " + logType + ")");
    }
};
var Logger = /** @class */ (function () {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */
    function Logger(name) {
        this.name = name;
        /**
         * The log level of the given Logger instance.
         */
        this._logLevel = defaultLogLevel;
        /**
         * The main (internal) log handler for the Logger instance.
         * Can be set to a new function in internal package code but not by user.
         */
        this._logHandler = defaultLogHandler;
        /**
         * The optional, additional, user-defined log handler for the Logger instance.
         */
        this._userLogHandler = null;
    }
    Object.defineProperty(Logger.prototype, "logLevel", {
        get: function () {
            return this._logLevel;
        },
        set: function (val) {
            if (!(val in LogLevel)) {
                throw new TypeError("Invalid value \"" + val + "\" assigned to `logLevel`");
            }
            this._logLevel = val;
        },
        enumerable: false,
        configurable: true
    });
    // Workaround for setter/getter having to be the same type.
    Logger.prototype.setLogLevel = function (val) {
        this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
    };
    Object.defineProperty(Logger.prototype, "logHandler", {
        get: function () {
            return this._logHandler;
        },
        set: function (val) {
            if (typeof val !== 'function') {
                throw new TypeError('Value assigned to `logHandler` must be a function');
            }
            this._logHandler = val;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Logger.prototype, "userLogHandler", {
        get: function () {
            return this._userLogHandler;
        },
        set: function (val) {
            this._userLogHandler = val;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The functions below are all based on the `console` interface
     */
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._userLogHandler && this._userLogHandler.apply(this, __spreadArray([this, LogLevel.DEBUG], args));
        this._logHandler.apply(this, __spreadArray([this, LogLevel.DEBUG], args));
    };
    Logger.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._userLogHandler && this._userLogHandler.apply(this, __spreadArray([this, LogLevel.VERBOSE], args));
        this._logHandler.apply(this, __spreadArray([this, LogLevel.VERBOSE], args));
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._userLogHandler && this._userLogHandler.apply(this, __spreadArray([this, LogLevel.INFO], args));
        this._logHandler.apply(this, __spreadArray([this, LogLevel.INFO], args));
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._userLogHandler && this._userLogHandler.apply(this, __spreadArray([this, LogLevel.WARN], args));
        this._logHandler.apply(this, __spreadArray([this, LogLevel.WARN], args));
    };
    Logger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._userLogHandler && this._userLogHandler.apply(this, __spreadArray([this, LogLevel.ERROR], args));
        this._logHandler.apply(this, __spreadArray([this, LogLevel.ERROR], args));
    };
    return Logger;
}());

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
const APP_CHECK_STATES = new Map();
const DEFAULT_STATE = {
    activated: false,
    tokenObservers: []
};
const DEBUG_STATE = {
    enabled: false
};
function getState(app) {
    return APP_CHECK_STATES.get(app) || DEFAULT_STATE;
}
function setState(app, state) {
    APP_CHECK_STATES.set(app, state);
}
function getDebugState() {
    return DEBUG_STATE;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
ntent-firebaseappcheck.googleapis.com/v1beta';
const EXCHANGE_RECAPTCHA_TOKEN_METHOD = 'exchangeRecaptchaToken';
const EXCHANGE_DEBUG_TOKEN_METHOD = 'exchangeDebugToken';
const TOKEN_REFRESH_TIME = {
    /**
     * The offset time before token natural expiration to run the refresh.
     * This is currently 5 minutes.
     */
    OFFSET_DURATION: 5 * 60 * 1000,
    /**
     * This is the first retrial wait after an error. This is currently
     * 30 seconds.
     */
    RETRIAL_MIN_WAIT: 30 * 1000,
    /**
     * This is the maximum retrial wait, currently 16 minutes.
     */
    RETRIAL_MAX_WAIT: 16 * 60 * 1000
};

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
// TODO: move it to @firebase/util?
// TODO: allow to config whether refresh should happen in the background
class Refresher {
    constructor(operation, retryPolicy, getWaitDuration, lowerBound, upperBound) {
        this.operation = operation;
        this.retryPolicy = retryPolicy;
        this.getWaitDuration = getWaitDuration;
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.pending = null;
        this.nextErrorWaitInterval = lowerBound;
        if (lowerBound > upperBound) {
            throw new Error('Proactive refresh lower bound greater than upper bound!');
        }
    }
    start() {
        this.nextErrorWaitInterval = this.lowerBound;
        this.process(true).catch(() => {
            /* we don't care about the result */
        });
    }
    stop() {
        if (this.pending) {
            this.pending.reject('cancelled');
            this.pending = null;
        }
    }
    isRunning() {
        return !!this.pending;
    }
extRun(hasSucceeded));
            // Why do we resolve a promise, then immediate wait for it?
            // We do it to make the promise chain cancellable.
            // We can call stop() which rejects the promise before the following line execute, which makes
            // the code jump to the catch block.
            // TODO: unit test this
            this.pending.resolve();
            await this.pending.promise;
            this.pending = new Deferred();
            await this.operation();
            this.pending.resolve();
            await this.pending.promise;
            this.process(true).catch(() => {
                /* we don't care about the result */
            });
        }
        catch (error) {
            if (this.retryPolicy(error)) {
                this.process(false).catch(() => {
                    /* we don't care about the result */
                });
            }
            else {
                this.stop();
            }
        }
    }
    getNextRun(hasSucceeded) {
        if (hasSucceeded) {
            // If last operation succeeded, reset next error wait interval and return
            // the default wait duration.
            this.nextErrorWaitInterval = this.lowerBound;
            // Return typical wait duration interval after a successful operation.
            return this.getWaitDuration();
        }
        else {
            // Get next error wait interval.
            const currentErrorWaitInterval = this.nextErrorWaitInterval;
            // Double interval for next consecutive error.
            this.nextErrorWaitInterval *= 2;
            // Make sure next wait interval does not exceed the maximum upper bound.
            if (this.nextErrorWaitInterval > this.upperBound) {
                this.nextErrorWaitInterval = this.upperBound;
            }
            return currentErrorWaitInterval;
        }
    }
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
const ERRORS = {
    ["already-initialized" /* ALREADY_INITIALIZED */]: 'You have already called initializeAppCheck() for FirebaseApp {$appName} with ' +
        'different options. To avoid this error, call initializeAppCheck() with the ' +
        'same options as when it was originally called. This will return the ' +
        'already initialized instance.',
    ["use-before-activation" /* USE_BEFORE_ACTIVATION */]: 'App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. ' +
        'Call initializeAppCheck() before instantiating other Firebase services.',
    ["fetch-network-error" /* FETCH_NETWORK_ERROR */]: 'Fetch failed to connect to a network. Check Internet connection. ' +
        'Original error: {$originalErrorMessage}.',
    ["fetch-parse-error" /* FETCH_PARSE_ERROR */]: 'Fetch client could not parse response.' +
        ' Original error: {$originalErrorMessage}.',
    ["fetch-status-error" /* FETCH_STATUS_ERROR */]: 'Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.',
    ["storage-open" /* STORAGE_OPEN */]: 'Error thrown when opening storage. Original error: {$originalErrorMessage}.',
    ["storage-get" /* STORAGE_GET */]: 'Error thrown when reading from storage. Original error: {$originalErrorMessage}.',
    ["storage-set" /* STORAGE_WRITE */]: 'Error thrown when writing to storage. Original error: {$originalErrorMessage}.',
    ["recaptcha-error" /* RECAPTCHA_ERROR */]: 'ReCAPTCHA error.'
};
const ERROR_FACTORY = new ErrorFactory('appCheck', 'AppCheck', ERRORS);

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
function getRecaptcha() {
    return self.grecaptcha;
}
function ensureActivated(app) {
    if (!getState(app).activated) {
        throw ERROR_FACTORY.create("use-before-activation" /* USE_BEFORE_ACTIVATION */, {
            appName: app.name
low.com/a/2117523
 */
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
async function exchangeToken({ url, body }, platformLoggerProvider) {
    const headers = {
        'Content-Type': 'application/json'
    };
    // If platform logger exists, add the platform info string to the header.
    const platformLogger = platformLoggerProvider.getImmediate({
        optional: true
    });
    if (platformLogger) {
        headers['X-Firebase-Client'] = platformLogger.getPlatformInfoString();

    };
    let response;
    try {
        response = await fetch(url, options);
    }
    catch (originalError) {
        throw ERROR_FACTORY.create("fetch-network-error" /* FETCH_NETWORK_ERROR */, {
            originalErrorMessage: originalError.message
        });
    }
    if (response.status !== 200) {
        throw ERROR_FACTORY.create("fetch-status-error" /* FETCH_STATUS_ERROR */, {
            httpStatus: response.status
        });
    }
    let responseBody;
    try {
        // JSON parsing throws SyntaxError if the response body isn't a JSON string.
        responseBody = await response.json();
    }
    catch (originalError) {
        throw ERROR_FACTORY.create("fetch-parse-error" /* FETCH_PARSE_ERROR */, {
            originalErrorMessage: originalError.message
        });
    }
    // Protobuf duration format.
    // https://developers.google.com/protocol-buffers/docs/reference/java/com/google/protobuf/Duration
    const match = responseBody.ttl.match(/^([\d.]+)(s)$/);
    if (!match || !match[2] || isNaN(Number(match[1]))) {
        throw ERROR_FACTORY.create("fetch-parse-error" /* FETCH_PARSE_ERROR */, {
            originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration ` +

    return {
        token: responseBody.attestationToken,
        expireTimeMillis: now + timeToLiveAsNumber,
        issuedAtTimeMillis: now
    };
}
function getExchangeRecaptchaTokenRequest(app, reCAPTCHAToken) {
    const { projectId, appId, apiKey } = app.options;
    return {
        url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_RECAPTCHA_TOKEN_METHOD}?key=${apiKey}`,
        body: {
            // eslint-disable-next-line
            recaptcha_token: reCAPTCHAToken
        }
    };
}
function getExchangeDebugTokenRequest(app, debugToken) {
    const { projectId, appId, apiKey } = app.options;
    return {
        url: `${BASE_ENDPOINT}/projects/${projectId}/apps/${appId}:${EXCHANGE_DEBUG_TOKEN_METHOD}?key=${apiKey}`,
        body: {
            // eslint-disable-next-line
            debug_token: debugToken
        }
    };
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
const DB_NAME = 'firebase-app-check-database';
const DB_VERSION = 1;
const STORE_NAME = 'firebase-app-check-store';
const DEBUG_TOKEN_KEY = 'debug-token';
let dbPromise = null;
function getDBPromise() {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        try {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onsuccess = event => {
                resolve(event.target.result);
            };
            request.onerror = event => {
                var _a;
                reject(ERROR_FACTORY.create("storage-open" /* STORAGE_OPEN */, {
                    originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
                }));
            };
            request.onupgradeneeded = event => {
                const db = event.target.result;
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch (event.oldVersion) {
                    case 0:
                        db.createObjectStore(STORE_NAME, {
                            keyPath: 'compositeKey'
                        });
                }
            };
        }
        catch (e) {
            reject(ERROR_FACTORY.create("storage-open" /* STORAGE_OPEN */, {
                originalErrorMessage: e.message
            }));
        }
    });
    return dbPromise;
}
function readTokenFromIndexedDB(app) {
    return read(computeKey(app));
}
function writeTokenToIndexedDB(app, token) {
    return write(computeKey(app), token);
}

}
async function write(key, value) {
    const db = await getDBPromise();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
        compositeKey: key,
        value
    });
    return new Promise((resolve, reject) => {
        request.onsuccess = _event => {
            resolve();
        };
        transaction.onerror = event => {
            var _a;
            reject(ERROR_FACTORY.create("storage-set" /* STORAGE_WRITE */, {
                originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
            }));
        };
    });
}
async function read(key) {
    const db = await getDBPromise();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    return new Promise((resolve, reject) => {
        request.onsuccess = event => {
            const result = event.target.result;
            if (result) {
                resolve(result.value);
            }
            else {
                resolve(undefined);
            }
        };
        transaction.onerror = event => {
            var _a;
            reject(ERROR_FACTORY.create("storage-get" /* STORAGE_GET */, {
                originalErrorMessage: (_a = event.target.error) === null || _a === void 0 ? void 0 : _a.message
            }));
        };
    });
}
function computeKey(app) {
    return `${app.options.appId}-${app.name}`;
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
const logger = new Logger('https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js-check');

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * Always resolves. In case of an error reading from indexeddb, resolve with undefined
 */
async function readTokenFromStorage(app) {
    if (isIndexedDBAvailable()) {
        let token = undefined;
        try {
            token = await readTokenFromIndexedDB(app);
        }
        catch (e) {
            // swallow the error and return undefined
            logger.warn(`Failed to read token from IndexedDB. Error: ${e}`);
        }
        return token;
    }
    return undefined;
}
/**
 * Always resolves. In case of an error writing to indexeddb, print a warning and resolve the promise
 */
function writeTokenToStorage(app, token) {
    if (isIndexedDBAvailable()) {
        return writeTokenToIndexedDB(app, token).catch(e => {
            // swallow the error and resolve the promise
            logger.warn(`Failed to write token to IndexedDB. Error: ${e}`);
        });
    }
    return Promise.resolve();
}
async function readOrCreateDebugTokenFromStorage() {
    /**
     * Theoretically race condition can happen if we read, then write in 2 separate transactions.
     * But it won't happen here, because this function will be called exactly once.
     */
    let existingDebugToken = undefined;
    try {
        existingDebugToken = await readDebugTokenFromIndexedDB();
    }
    catch (_e) {
        // failed to read from indexeddb. We assume there is no existing debug token, and generate a new one.
 on writing to indexeddb
        // In case persistence failed, a new debug token will be generated everytime the page is refreshed.
        // It renders the debug token useless because you have to manually register(whitelist) the new token in the firebase console again and again.
        // If you see this error trying to use debug token, it probably means you are using a browser that doesn't support indexeddb.
        // You should switch to a different browser that supports indexeddb
        writeDebugTokenToIndexedDB(newToken).catch(e => logger.warn(`Failed to persist debug token to IndexedDB. Error: ${e}`));
        // Not using logger because I don't think we ever want this accidentally hidden?
        console.log(`App Check debug token: ${newToken}. You will need to add it to your app's App Check settings in the Firebase console for it to work`);
        return newToken;
    }
    else {
        return existingDebugToken;
    }
}

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
function isDebugMode() {
    const debugState = getDebugState();
    return debugState.enabled;
}
async function getDebugToken() {
    const state = getDebugState();
    if (state.enabled && state.token) {
        return state.token.promise;
    }
    else {
        // should not happen!
        throw Error(`
            Can't get debug token in production mode.
        `);
    }
}
function initializeDebugMode() {
    const globals = getGlobal();
    if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== 'string' &&
        globals.FIREBASE_APPCHECK_DEBUG_TOKEN !== true) {
        return;
    }
    const debugState = getDebugState();
    debugState.enabled = true;
    const deferredToken = new Deferred();
    debugState.token = deferredToken;
    if (typeof globals.FIREBASE_APPCHECK_DEBUG_TOKEN === 'string') {
        deferredToken.resolve(globals.FIREBASE_APPCHECK_DEBUG_TOKEN);
    }
    else {
        deferredToken.resolve(readOrCreateDebugTokenFromStorage());
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
// Initial hardcoded value agreed upon across platforms for initial launch.
// Format left open for possible dynamic error values and other fields in the future.
const defaultTokenErrorData = { error: 'UNKNOWN_ERROR' };
/**
 * Stringify and base64 encode token error data.
 *
 * @param tokenError Error data, currently hardcoded.
 */
function formatDummyToken(tokenErrorData) {
    return base64.encodeString(JSON.stringify(tokenErrorData), 
    /* webSafe= */ false);
}
/**
 * This function always resolves.
 * The result will contain an error field if there is any error.
 * In case there is an error, the token field in the result will be populated with a dummy value

    /**
     * First check if there is a token in memory from a previous `getToken()` call.
     */
    let token = state.token;
    let error = undefined;
    /**
     * If there is no token in memory, try to load token from indexedDB.
     */
    if (!token) {
        // cachedTokenPromise contains the token found in IndexedDB or undefined if not found.
        const cachedToken = await state.cachedTokenPromise;
        if (cachedToken && isValid(cachedToken)) {
            token = cachedToken;
            setState(app, Object.assign(Object.assign({}, state), { token }));
            // notify all listeners with the cached token
            notifyTokenListeners(app, { token: token.token });
        }
    }
    // Return the cached token (from either memory or indexedDB) if it's valid
    if (!forceRefresh && token && isValid(token)) {
        return {
            token: token.token
        };
    }
    /**
     * DEBUG MODE
     * If debug mode is set, and there is no cached token, fetch a new App
     * Check token using the debug token, and return it directly.
     */
    if (isDebugMode()) {
        const tokenFromDebugExchange = await exchangeToken(getExchangeDebugTokenRequest(app, await getDebugToken()), appCheck.platformLoggerProvider);
        // Write debug token to indexedDB.
        await writeTokenToStorage(app, tokenFromDebugExchange);
        // Write debug token to state.
        setState(app, Object.assign(Object.assign({}, state), { token: tokenFromDebugExchange }));
        return { token: tokenFromDebugExchange.token };
    }
    /**
     * request a new token
     */
    try {
        // state.provider is populated in initializeAppCheck()
        // ensureActivated() at the top of this function checks that
        // initializeAppCheck() has been called.
        token = await state.provider.getToken();

    }
    let interopTokenResult;
    if (!token) {
        // if token is undefined, there must be an error.
        // we return a dummy token along with the error
        interopTokenResult = makeDummyTokenResult(error);
    }
    else {
        interopTokenResult = {
            token: token.token
        };
        // write the new token to the memory state as well as the persistent storage.
        // Only do it if we got a valid new token
        setState(app, Object.assign(Object.assign({}, state), { token }));
        await writeTokenToStorage(app, token);
    }
    notifyTokenListeners(app, interopTokenResult);
    return interopTokenResult;
}
function addTokenListener(appCheck, type, listener, onError) {
    const { app } = appCheck;
    const state = getState(app);
    const tokenObserver = {
        next: listener,
        error: onError,
        type
    };
    const newState = Object.assign(Object.assign({}, state), { tokenObservers: [...state.tokenObservers, tokenObserver] });
    /**
     * Invoke the listener with the valid token, then start the token refresher
     */
    if (!newState.tokenRefresher) {
        const tokenRefresher = createTokenRefresher(appCheck);
        newState.tokenRefresher = tokenRefresher;
    }
    // Create the refresher but don't start it if `isTokenAutoRefreshEnabled`
    // is not true.
    if (!newState.tokenRefresher.isRunning() && state.isTokenAutoRefreshEnabled) {
        newState.tokenRefresher.start();
    }
    // Invoke the listener async immediately if there is a valid token
    // in memory.
    if (state.token && isValid(state.token)) {
        const validToken = state.token;
        Promise.resolve()
            .then(() => listener({ token: validToken.token }))
            .catch(() => {
            /* we don't care about exceptions thrown in listeners */
        });
    }
    else if (state.token == null) {
        // Only check cache if there was no token. If the token was invalid,
        // skip this and rely on exchange endpoint.
        void state
            .cachedTokenPromise // Storage token promise. Always populated in `activate()`.
            .then(cachedToken => {
            if (cachedToken && isValid(cachedToken)) {
                listener({ token: cachedToken.token });
            }
        })
            .catch(() => {
            /** Ignore errors in listeners. */
        });
    }
    setState(app, newState);
}
function removeTokenListener(app, listener) {
    const state = getState(app);
    const newObservers = state.tokenObservers.filter(tokenObserver => tokenObserver.next !== listener);
    if (newObservers.length === 0 &&
        state.tokenRefresher &&
        state.tokenRefresher.isRunning()) {
        state.tokenRefresher.stop();
    }
    setState(app, Object.assign(Object.assign({}, state), { tokenObservers: newObservers }));
}
function createTokenRefresher(appCheck) {
    const { app } = appCheck;
    return new Refresher(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    async () => {
        const state = getState(app);
        // If there is no token, we will try to load it from storage and use it
        // If there is a token, we force refresh it because we know it's going to expire soon
        let result;
        if (!state.token) {
            result = await getToken$2(appCheck);
        }
        else {
            result = await getToken$2(appCheck, true);
        }
        // getToken() always resolves. In case the result has an error field defined, it means the operation failed, and we should retry.
        if (result.error) {
            throw result.error;
        }
    }, () => {
        // TODO: when should we retry?
        return true;
    }, () => {
        const state = getState(app);
        if (state.token) {
            // issuedAtTime + (50% * total TTL) + 5 minutes
            let nextRefreshTimeMillis = state.token.issuedAtTimeMillis +
                (state.token.expireTimeMillis - state.token.issuedAtTimeMillis) *
                    0.5 +
                5 * 60 * 1000;
            // Do not allow refresh time to be past (expireTime - 5 minutes)
            const latestAllowableRefresh = state.token.expireTimeMillis - 5 * 60 * 1000;
            nextRefreshTimeMillis = Math.min(nextRefreshTimeMillis, latestAllowableRefresh);
            return Math.max(0, nextRefreshTimeMillis - Date.now());
        }
        else {
            return 0;
        }
    }, TOKEN_REFRESH_TIME.RETRIAL_MIN_WAIT, TOKEN_REFRESH_TIME.RETRIAL_MAX_WAIT);
}
function notifyTokenListeners(app, token) {
    const observers = getState(app).tokenObservers;
    for (const observer of observers) {
        try {
            if (observer.type === "EXTERNAL" /* EXTERNAL */ && token.error != null) {
                // If this listener was added by a 3P call, send any token error to
                // the supplied error handler. A 3P observer always has an error
                // handler.
                observer.error(token.error);
            }
            else {
                // If the token has no error field, always return the token.
                // If this is a 2P listener, return the token, whether or not it
                // has an error field.
                observer.next(token);
            }
        }
        catch (e) {
            // Errors in the listener function itself are always ignored.
        }
    }
}
function isValid(token) {
    return token.expireTimeMillis - Date.now() > 0;
}
function makeDummyTokenResult(error) {
    return {
        token: formatDummyToken(defaultTokenErrorData),
        error
    };
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * AppCheck Service class.
 */
class AppCheckService {
    constructor(app, platformLoggerProvider) {
        this.app = app;
        this.platformLoggerProvider = platformLoggerProvider;
    }
    _delete() {
        const { tokenObservers } = getState(this.app);
        for (const tokenObserver of tokenObservers) {
            removeTokenListener(this.app, tokenObserver.next);
        }
        return Promise.resolve();
    }
}
function factory(app, platformLoggerProvider) {
    return new AppCheckService(app, platformLoggerProvider);
}
function internalFactory(appCheck) {
    return {
        getToken: forceRefresh => getToken$2(appCheck, forceRefresh),
        addTokenListener: listener => addTokenListener(appCheck, "INTERNAL" /* INTERNAL */, listener),
        removeTokenListener: listener => removeTokenListener(appCheck.app, listener)
    };
}

const name = "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js-check";
const version = "0.4.0";

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
const RECAPTCHA_URL = 'https://www.google.com/recaptcha/api.js';
function initialize(app, siteKey) {
    const state = getState(app);
    const initialized = new Deferred();
    setState(app, Object.assign(Object.assign({}, state), { reCAPTCHAState: { initialized } }));
    const divId = `fire_app_check_${app.name}`;
    const invisibleDiv = document.createElement('div');
    invisibleDiv.id = divId;
    invisibleDiv.style.display = 'none';
    document.body.appendChild(invisibleDiv);
    const grecaptcha = getRecaptcha();
    if (!grecaptcha) {
        loadReCAPTCHAScript(() => {
            const grecaptcha = getRecaptcha();
            if (!grecaptcha) {
                // it shouldn't happen.
                throw new Error('no recaptcha');
            }
            grecaptcha.ready(() => {
                // Invisible widgets allow us to set a different siteKey for each widget, so we use them to support multiple apps
                renderInvisibleWidget(app, siteKey, grecaptcha, divId);
                initialized.resolve(grecaptcha);
            });
        });
    }
    else {
        grecaptcha.ready(() => {
            renderInvisibleWidget(app, siteKey, grecaptcha, divId);

async function getToken$1(app) {
    ensureActivated(app);
    // ensureActivated() guarantees that reCAPTCHAState is set
    const reCAPTCHAState = getState(app).reCAPTCHAState;
    const recaptcha = await reCAPTCHAState.initialized.promise;
    return new Promise((resolve, _reject) => {
        // Updated after initialization is complete.
        const reCAPTCHAState = getState(app).reCAPTCHAState;
        recaptcha.ready(() => {
            resolve(
            // widgetId is guaranteed to be available if reCAPTCHAState.initialized.promise resolved.
            recaptcha.execute(reCAPTCHAState.widgetId, {
                action: 'fire_app_check'
            }));
        });
    });
}
/**
 *
 * @param app
 * @param container - Id of a HTML element.
 */
function renderInvisibleWidget(app, siteKey, grecaptcha, container) {
    const widgetId = grecaptcha.render(container, {
        sitekey: siteKey,
        size: 'invisible'
    });
    const state = getState(app);
    setState(app, Object.assign(Object.assign({}, state), { reCAPTCHAState: Object.assign(Object.assign({}, state.reCAPTCHAState), { // state.reCAPTCHAState is set in the initialize()
            widgetId }) }));
}
function loadReCAPTCHAScript(onload) {
    const script = document.createElement('script');
    script.src = `${RECAPTCHA_URL}`;
    script.onload = onload;
    document.head.appendChild(script);
}

/**
 * @license
 * Copyright 2021 Google LLC

 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * App Check provider that can obtain a reCAPTCHA V3 token and exchange it
 * for an App Check token.
 *
 * @public
 */
class ReCaptchaV3Provider {
    /**
     * Create a ReCaptchaV3Provider instance.
     * @param siteKey - ReCAPTCHA V3 siteKey.
     */
    constructor(_siteKey) {
        this._siteKey = _siteKey;
    }
    /**
     * Returns an App Check token.
     * @internal
     */
    async getToken() {
        if (!this._app || !this._platformLoggerProvider) {
            // This should only occur if user has not called initializeAppCheck().
            // We don't have an appName to provide if so.
            // This should already be caught in the top level `getToken()` function.
            throw ERROR_FACTORY.create("use-before-activation" /* USE_BEFORE_ACTIVATION */, {
                appName: ''
            });
        }
        const attestedClaimsToken = await getToken$1(this._app).catch(_e => {
            // reCaptcha.execute() throws null which is not very descriptive.
            throw ERROR_FACTORY.create("recaptcha-error" /* RECAPTCHA_ERROR */);
        });
        return exchangeToken(getExchangeRecaptchaTokenRequest(this._app, attestedClaimsToken), this._platformLoggerProvider);
    }
    /**
     * @internal
     */
    initialize(app) {
        this._app = app;
        this._platformLoggerProvider = _getProvider(app, 'platform-logger');
        initialize(app, this._siteKey).catch(() => {
            /* we don't care about the initialization result */
        });
    }
    /**
     * @internal
     */
    isEqual(otherProvider) {
        if (otherProvider instanceof ReCaptchaV3Provider) {
            return this._siteKey === otherProvider._siteKey;
        }
        else {
            return false;
        }
    }
}
/**
 * Custom provider class.
 * @public
 */
class CustomProvider {
    constructor(_customProviderOptions) {
        this._customProviderOptions = _customProviderOptions;
    }
    /**
     * @internal
     */
    async getToken() {
        if (!this._app) {
            // This should only occur if user has not called initializeAppCheck().
            // We don't have an appName to provide if so.
            // This should already be caught in the top level `getToken()` function.
            throw ERROR_FACTORY.create("use-before-activation" /* USE_BEFORE_ACTIVATION */, {
                appName: ''
            });
        }
        // custom provider
        const customToken = await this._customProviderOptions.getToken();
        // Try to extract IAT from custom token, in case this token is not
= issuedAtTimeSeconds !== null &&
            issuedAtTimeSeconds < Date.now() &&
            issuedAtTimeSeconds > 0
            ? issuedAtTimeSeconds * 1000
            : Date.now();
        return Object.assign(Object.assign({}, customToken), { issuedAtTimeMillis });
    }
    /**
     * @internal
     */
    initialize(app) {
        this._app = app;
    }
    /**
     * @internal
     */
    isEqual(otherProvider) {
        if (otherProvider instanceof CustomProvider) {
            return (this._customProviderOptions.getToken.toString() ===
                otherProvider._customProviderOptions.getToken.toString());
        }
        else {
            return false;
        }
    }
}

/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

 */
/**
 * Activate App Check for the given app. Can be called only once per app.
 * @param app - the {@link https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js#FirebaseApp} to activate App Check for
 * @param options - App Check initialization options
 * @public
 */
function initializeAppCheck(app = getApp(), options) {
    app = getModularInstance(app);
    const provider = _getProvider(app, 'app-check');
    if (provider.isInitialized()) {
        const existingInstance = provider.getImmediate();
        const initialOptions = provider.getOptions();
        if (initialOptions.isTokenAutoRefreshEnabled ===
            options.isTokenAutoRefreshEnabled &&
            initialOptions.provider.isEqual(options.provider)) {
            return existingInstance;
        }
        else {
            throw ERROR_FACTORY.create("already-initialized" /* ALREADY_INITIALIZED */, {
                appName: app.name
            });
        }
    }
    const appCheck = provider.initialize({ options });
    _activate(app, options.provider, options.isTokenAutoRefreshEnabled);
    return appCheck;
}
/**
 * Activate App Check
 * @param app - Firebase app to activate App Check for.
 * @param provider - reCAPTCHA v3 provider or
 * custom token provider.
 * @param isTokenAutoRefreshEnabled - If true, the SDK automatically
 * refreshes App Check tokens as needed. If undefined, defaults to the
 * value of `app.automaticDataCollectionEnabled`, which defaults to
 * false and can be set in the app config.
 */
function _activate(app, provider, isTokenAutoRefreshEnabled) {
    const state = getState(app);
    const newState = Object.assign(Object.assign({}, state), { activated: true });
    newState.provider = provider; // Read cached token from storage if it exists and store it in memory.
    newState.cachedTokenPromise = readTokenFromStorage(app).then(cachedToken => {
        if (cachedToken && isValid(cachedToken)) {
            setState(app, Object.assign(Object.assign({}, getState(app)), { token: cachedToken }));
        }
        return cachedToken;
    });
    // Use value of global `automaticDataCollectionEnabled` (which
    // itself defaults to false if not specified in config) if
    // `isTokenAutoRefreshEnabled` param was not provided by user.
    newState.isTokenAutoRefreshEnabled =
        isTokenAutoRefreshEnabled === undefined
            ? app.automaticDataCollectionEnabled
            : isTokenAutoRefreshEnabled;
    setState(app, newState);
    newState.provider.initialize(app);
}
/**
 * Set whether App Check will automatically refresh tokens as needed.
 *
 * @param appCheckInstance - The App Check service instance.
 * @param isTokenAutoRefreshEnabled - If true, the SDK automatically
 * refreshes App Check tokens as needed. This overrides any value set
 * during `initializeAppCheck()`.
 * @public
 */
function setTokenAutoRefreshEnabled(appCheckInstance, isTokenAutoRefreshEnabled) {
    const app = appCheckInstance.app;
    const state = getState(app);
    // This will exist if any product libraries have called
    // `addTokenListener()`
    if (state.tokenRefresher) {
        if (isTokenAutoRefreshEnabled === true) {
            state.tokenRefresher.start();
        }
        else {
            state.tokenRefresher.stop();
        }
    }
    setState(app, Object.assign(Object.assign({}, state), { isTokenAutoRefreshEnabled }));
}
/**
App Check service instance.
 * @param forceRefresh - If true, will always try to fetch a fresh token.
 * If false, will use a cached token if found in storage.
 * @public
 */
async function getToken(appCheckInstance, forceRefresh) {
    const result = await getToken$2(appCheckInstance, forceRefresh);
    if (result.error) {
        throw result.error;
    }
    return { token: result.token };
}
/**
 * Wraps `addTokenListener`/`removeTokenListener` methods in an `Observer`
 * pattern for public use.
 */
function onTokenChanged(appCheckInstance, onNextOrObserver, onError, 
/**
 * NOTE: Although an `onCompletion` callback can be provided, it will
 * never be called because the token stream is never-ending.
 * It is added only for API consistency with the observer pattern, which
 * we follow in JS APIs.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
onCompletion) {
    let nextFn = () => { };
    let errorFn = () => { };
    if (onNextOrObserver.next != null) {
        nextFn = onNextOrObserver.next.bind(onNextOrObserver);
    }
    else {
        nextFn = onNextOrObserver;
    }
    if (onNextOrObserver.error != null) {
        errorFn = onNextOrObserver.error.bind(onNextOrObserver);
    }
    else if (onError) {
        errorFn = onError;
    }
    addTokenListener(appCheckInstance, "EXTERNAL" /* EXTERNAL */, nextFn, errorFn);
    return () => removeTokenListener(appCheckInstance.app, nextFn);
}

/**
 * Firebase App Check
 *
 * @packageDocumentation
 */
const APP_CHECK_NAME = 'app-check';
const APP_CHECK_NAME_INTERNAL = 'app-check-internal';
function registerAppCheck() {
    // The public interface
    _registerComponent(new Component(APP_CHECK_NAME, container => {
        // getImmediate for FirebaseApp will always succeed
        const app = container.getProvider('app').getImmediate();
        const platformLoggerProvider = container.getProvider('platform-logger');
        return factory(app, platformLoggerProvider);
    }, "PUBLIC" /* PUBLIC */)
        .setInstantiationMode("EXPLICIT" /* EXPLICIT */)
        /**
         * Initialize app-check-internal after app-check is initialized to make AppCheck available to
         * other Firebase SDKs
         */
        .setInstanceCreatedCallback((container, _identifier, _appcheckService) => {
        container.getProvider(APP_CHECK_NAME_INTERNAL).initialize();
    }));
    // The internal interface used by other Firebase products
    _registerComponent(new Component(APP_CHECK_NAME_INTERNAL, container => {
        const appCheck = container.getProvider('app-check').getImmediate();
        return internalFactory(appCheck);
    }, "PUBLIC" /* PUBLIC */).setInstantiationMode("EXPLICIT" /* EXPLICIT */));
    registerVersion(name, version);
}
registerAppCheck();
initializeDebugMode();

export { CustomProvider, ReCaptchaV3Provider, getToken, initializeAppCheck, onTokenChanged, setTokenAutoRefreshEnabled };

//# sourceMappingURL=firebase-app-check.js.map
