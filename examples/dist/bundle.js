require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _inlineStylePrefixerStatic = require('inline-style-prefixer/static');

var _inlineStylePrefixerStatic2 = _interopRequireDefault(_inlineStylePrefixerStatic);

var _util = require('./util');

/**
 * Generate CSS for a selector and some styles.
 *
 * This function handles the media queries, pseudo selectors, and descendant
 * styles that can be used in aphrodite styles.
 *
 * @param {string} selector: A base CSS selector for the styles to be generated
 *     with.
 * @param {Object} styleTypes: A list of properties of the return type of
 *     StyleSheet.create, e.g. [styles.red, styles.blue].
 * @param stringHandlers: See `generateCSSRuleset`
 * @param useImportant: See `generateCSSRuleset`
 *
 * To actually generate the CSS special-construct-less styles are passed to
 * `generateCSSRuleset`.
 *
 * For instance, a call to
 *
 *     generateCSSInner(".foo", {
 *       color: "red",
 *       "@media screen": {
 *         height: 20,
 *         ":hover": {
 *           backgroundColor: "black"
 *         }
 *       },
 *       ":active": {
 *         fontWeight: "bold",
 *         ">>bar": {
 *           _names: { "foo_bar": true },
 *           height: 10,
 *         }
 *       }
 *     });
 *
 * will make 5 calls to `generateCSSRuleset`:
 *
 *     generateCSSRuleset(".foo", { color: "red" }, ...)
 *     generateCSSRuleset(".foo:active", { fontWeight: "bold" }, ...)
 *     generateCSSRuleset(".foo:active .foo_bar", { height: 10 }, ...)
 *     // These 2 will be wrapped in @media screen {}
 *     generateCSSRuleset(".foo", { height: 20 }, ...)
 *     generateCSSRuleset(".foo:hover", { backgroundColor: "black" }, ...)
 */
var generateCSS = function generateCSS(selector, styleTypes, stringHandlers, useImportant) {
    var merged = styleTypes.reduce(_util.recursiveMerge);

    var declarations = {};
    var mediaQueries = {};
    var pseudoStyles = {};

    Object.keys(merged).forEach(function (key) {
        if (key[0] === ':') {
            pseudoStyles[key] = merged[key];
        } else if (key[0] === '@') {
            mediaQueries[key] = merged[key];
        } else {
            declarations[key] = merged[key];
        }
    });

    return generateCSSRuleset(selector, declarations, stringHandlers, useImportant) + Object.keys(pseudoStyles).map(function (pseudoSelector) {
        return generateCSSRuleset(selector + pseudoSelector, pseudoStyles[pseudoSelector], stringHandlers, useImportant);
    }).join("") + Object.keys(mediaQueries).map(function (mediaQuery) {
        var ruleset = generateCSS(selector, [mediaQueries[mediaQuery]], stringHandlers, useImportant);
        return mediaQuery + '{' + ruleset + '}';
    }).join("");
};

exports.generateCSS = generateCSS;
/**
 * Helper method of generateCSSRuleset to facilitate custom handling of certain
 * CSS properties. Used for e.g. font families.
 *
 * See generateCSSRuleset for usage and documentation of paramater types.
 */
var runStringHandlers = function runStringHandlers(declarations, stringHandlers) {
    var result = {};

    Object.keys(declarations).forEach(function (key) {
        // If a handler exists for this particular key, let it interpret
        // that value first before continuing
        if (stringHandlers && stringHandlers.hasOwnProperty(key)) {
            result[key] = stringHandlers[key](declarations[key]);
        } else {
            result[key] = declarations[key];
        }
    });

    return result;
};

/**
 * Generate a CSS ruleset with the selector and containing the declarations.
 *
 * This function assumes that the given declarations don't contain any special
 * children (such as media queries, pseudo-selectors, or descendant styles).
 *
 * Note that this method does not deal with nesting used for e.g.
 * psuedo-selectors or media queries. That responsibility is left to  the
 * `generateCSS` function.
 *
 * @param {string} selector: the selector associated with the ruleset
 * @param {Object} declarations: a map from camelCased CSS property name to CSS
 *     property value.
 * @param {Object.<string, function>} stringHandlers: a map from camelCased CSS
 *     property name to a function which will map the given value to the value
 *     that is output.
 * @param {bool} useImportant: A boolean saying whether to append "!important"
 *     to each of the CSS declarations.
 * @returns {string} A string of raw CSS.
 *
 * Examples:
 *
 *    generateCSSRuleset(".blah", { color: "red" })
 *    -> ".blah{color: red !important;}"
 *    generateCSSRuleset(".blah", { color: "red" }, {}, false)
 *    -> ".blah{color: red}"
 *    generateCSSRuleset(".blah", { color: "red" }, {color: c => c.toUpperCase})
 *    -> ".blah{color: RED}"
 *    generateCSSRuleset(".blah:hover", { color: "red" })
 *    -> ".blah:hover{color: red}"
 */
var generateCSSRuleset = function generateCSSRuleset(selector, declarations, stringHandlers, useImportant) {
    var handledDeclarations = runStringHandlers(declarations, stringHandlers);

    var prefixedDeclarations = (0, _inlineStylePrefixerStatic2['default'])(handledDeclarations);

    var prefixedRules = (0, _util.flatten)((0, _util.objectToPairs)(prefixedDeclarations).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var key = _ref2[0];
        var value = _ref2[1];

        if (Array.isArray(value)) {
            var _ret = (function () {
                // inline-style-prefix-all returns an array when there should be
                // multiple rules, we will flatten to single rules

                var prefixedValues = [];
                var unprefixedValues = [];

                value.forEach(function (v) {
                    if (v.indexOf('-') === 0) {
                        prefixedValues.push(v);
                    } else {
                        unprefixedValues.push(v);
                    }
                });

                prefixedValues.sort();
                unprefixedValues.sort();

                return {
                    v: prefixedValues.concat(unprefixedValues).map(function (v) {
                        return [key, v];
                    })
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        }
        return [[key, value]];
    }));

    var rules = prefixedRules.map(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var key = _ref32[0];
        var value = _ref32[1];

        var stringValue = (0, _util.stringifyValue)(key, value);
        var ret = (0, _util.kebabifyStyleName)(key) + ':' + stringValue + ';';
        return useImportant === false ? ret : (0, _util.importantify)(ret);
    }).join("");

    if (rules) {
        return selector + '{' + rules + '}';
    } else {
        return "";
    }
};
exports.generateCSSRuleset = generateCSSRuleset;
},{"./util":5,"inline-style-prefixer/static":33}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _util = require('./util');

var _inject = require('./inject');

var StyleSheet = {
    create: function create(sheetDefinition) {
        return (0, _util.mapObj)(sheetDefinition, function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var key = _ref2[0];
            var val = _ref2[1];

            return [key, {
                // TODO(emily): Make a 'production' mode which doesn't prepend
                // the class name here, to make the generated CSS smaller.
                _name: key + '_' + (0, _util.hashObject)(val),
                _definition: val
            }];
        });
    },

    rehydrate: function rehydrate() {
        var renderedClassNames = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        (0, _inject.addRenderedClassNames)(renderedClassNames);
    }
};

/**
 * Utilities for using Aphrodite server-side.
 */
var StyleSheetServer = {
    renderStatic: function renderStatic(renderFunc) {
        (0, _inject.reset)();
        (0, _inject.startBuffering)();
        var html = renderFunc();
        var cssContent = (0, _inject.flushToString)();

        return {
            html: html,
            css: {
                content: cssContent,
                renderedClassNames: (0, _inject.getRenderedClassNames)()
            }
        };
    }
};

/**
 * Utilities for using Aphrodite in tests.
 *
 * Not meant to be used in production.
 */
var StyleSheetTestUtils = {
    /**
     * Prevent styles from being injected into the DOM.
     *
     * This is useful in situations where you'd like to test rendering UI
     * components which use Aphrodite without any of the side-effects of
     * Aphrodite happening. Particularly useful for testing the output of
     * components when you have no DOM, e.g. testing in Node without a fake DOM.
     *
     * Should be paired with a subsequent call to
     * clearBufferAndResumeStyleInjection.
     */
    suppressStyleInjection: function suppressStyleInjection() {
        (0, _inject.reset)();
        (0, _inject.startBuffering)();
    },

    /**
     * Opposite method of preventStyleInject.
     */
    clearBufferAndResumeStyleInjection: function clearBufferAndResumeStyleInjection() {
        (0, _inject.reset)();
    }
};

var css = function css() {
    for (var _len = arguments.length, styleDefinitions = Array(_len), _key = 0; _key < _len; _key++) {
        styleDefinitions[_key] = arguments[_key];
    }

    var useImportant = true; // Append !important to all style definitions
    return (0, _inject.injectAndGetClassName)(useImportant, styleDefinitions);
};

exports['default'] = {
    StyleSheet: StyleSheet,
    StyleSheetServer: StyleSheetServer,
    StyleSheetTestUtils: StyleSheetTestUtils,
    css: css
};
module.exports = exports['default'];
},{"./inject":3,"./util":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _asap = require('asap');

var _asap2 = _interopRequireDefault(_asap);

var _generate = require('./generate');

var _util = require('./util');

// The current <style> tag we are inserting into, or null if we haven't
// inserted anything yet. We could find this each time using
// `document.querySelector("style[data-aphrodite"])`, but holding onto it is
// faster.
var styleTag = null;

// Inject a string of styles into a <style> tag in the head of the document. This
// will automatically create a style tag and then continue to use it for
// multiple injections. It will also use a style tag with the `data-aphrodite`
// tag on it if that exists in the DOM. This could be used for e.g. reusing the
// same style tag that server-side rendering inserts.
var injectStyleTag = function injectStyleTag(cssContents) {
    if (styleTag == null) {
        // Try to find a style tag with the `data-aphrodite` attribute first.
        styleTag = document.querySelector("style[data-aphrodite]");

        // If that doesn't work, generate a new style tag.
        if (styleTag == null) {
            // Taken from
            // http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
            var head = document.head || document.getElementsByTagName('head')[0];
            styleTag = document.createElement('style');

            styleTag.type = 'text/css';
            styleTag.setAttribute("data-aphrodite", "");
            head.appendChild(styleTag);
        }
    }

    if (styleTag.styleSheet) {
        styleTag.styleSheet.cssText += cssContents;
    } else {
        styleTag.appendChild(document.createTextNode(cssContents));
    }
};

// Custom handlers for stringifying CSS values that have side effects
// (such as fontFamily, which can cause @font-face rules to be injected)
var stringHandlers = {
    // With fontFamily we look for objects that are passed in and interpret
    // them as @font-face rules that we need to inject. The value of fontFamily
    // can either be a string (as normal), an object (a single font face), or
    // an array of objects and strings.
    fontFamily: function fontFamily(val) {
        if (Array.isArray(val)) {
            return val.map(fontFamily).join(",");
        } else if (typeof val === "object") {
            injectStyleOnce(val.fontFamily, "@font-face", [val], false);
            return '"' + val.fontFamily + '"';
        } else {
            return val;
        }
    },

    // With animationName we look for an object that contains keyframes and
    // inject them as an `@keyframes` block, returning a uniquely generated
    // name. The keyframes object should look like
    //  animationName: {
    //    from: {
    //      left: 0,
    //      top: 0,
    //    },
    //    '50%': {
    //      left: 15,
    //      top: 5,
    //    },
    //    to: {
    //      left: 20,
    //      top: 20,
    //    }
    //  }
    // TODO(emily): `stringHandlers` doesn't let us rename the key, so I have
    // to use `animationName` here. Improve that so we can call this
    // `animation` instead of `animationName`.
    animationName: function animationName(val) {
        if (typeof val !== "object") {
            return val;
        }

        // Generate a unique name based on the hash of the object. We can't
        // just use the hash because the name can't start with a number.
        // TODO(emily): this probably makes debugging hard, allow a custom
        // name?
        var name = 'keyframe_' + (0, _util.hashObject)(val);

        // Since keyframes need 3 layers of nesting, we use `generateCSS` to
        // build the inner layers and wrap it in `@keyframes` ourselves.
        var finalVal = '@keyframes ' + name + '{';
        Object.keys(val).forEach(function (key) {
            finalVal += (0, _generate.generateCSS)(key, [val[key]], stringHandlers, false);
        });
        finalVal += '}';

        injectGeneratedCSSOnce(name, finalVal);

        return name;
    }
};

// This is a map from Aphrodite's generated class names to `true` (acting as a
// set of class names)
var alreadyInjected = {};

// This is the buffer of styles which have not yet been flushed.
var injectionBuffer = "";

// A flag to tell if we are already buffering styles. This could happen either
// because we scheduled a flush call already, so newly added styles will
// already be flushed, or because we are statically buffering on the server.
var isBuffering = false;

var injectGeneratedCSSOnce = function injectGeneratedCSSOnce(key, generatedCSS) {
    if (!alreadyInjected[key]) {
        if (!isBuffering) {
            // We should never be automatically buffering on the server (or any
            // place without a document), so guard against that.
            if (typeof document === "undefined") {
                throw new Error("Cannot automatically buffer without a document");
            }

            // If we're not already buffering, schedule a call to flush the
            // current styles.
            isBuffering = true;
            (0, _asap2['default'])(flushToStyleTag);
        }

        injectionBuffer += generatedCSS;
        alreadyInjected[key] = true;
    }
};

var injectStyleOnce = function injectStyleOnce(key, selector, definitions, useImportant) {
    if (!alreadyInjected[key]) {
        var generated = (0, _generate.generateCSS)(selector, definitions, stringHandlers, useImportant);

        injectGeneratedCSSOnce(key, generated);
    }
};

exports.injectStyleOnce = injectStyleOnce;
var reset = function reset() {
    injectionBuffer = "";
    alreadyInjected = {};
    isBuffering = false;
    styleTag = null;
};

exports.reset = reset;
var startBuffering = function startBuffering() {
    if (isBuffering) {
        throw new Error("Cannot buffer while already buffering");
    }
    isBuffering = true;
};

exports.startBuffering = startBuffering;
var flushToString = function flushToString() {
    isBuffering = false;
    var ret = injectionBuffer;
    injectionBuffer = "";
    return ret;
};

exports.flushToString = flushToString;
var flushToStyleTag = function flushToStyleTag() {
    var cssContent = flushToString();
    if (cssContent.length > 0) {
        injectStyleTag(cssContent);
    }
};

exports.flushToStyleTag = flushToStyleTag;
var getRenderedClassNames = function getRenderedClassNames() {
    return Object.keys(alreadyInjected);
};

exports.getRenderedClassNames = getRenderedClassNames;
var addRenderedClassNames = function addRenderedClassNames(classNames) {
    classNames.forEach(function (className) {
        alreadyInjected[className] = true;
    });
};

exports.addRenderedClassNames = addRenderedClassNames;
/**
 * Inject styles associated with the passed style definition objects, and return
 * an associated CSS class name.
 *
 * @param {boolean} useImportant If true, will append !important to generated
 *     CSS output. e.g. {color: red} -> "color: red !important".
 * @param {Object[]} styleDefinitions style definition objects as returned as
 *     properties of the return value of StyleSheet.create().
 */
var injectAndGetClassName = function injectAndGetClassName(useImportant, styleDefinitions) {
    // Filter out falsy values from the input, to allow for
    // `css(a, test && c)`
    var validDefinitions = styleDefinitions.filter(function (def) {
        return def;
    });

    // Break if there aren't any valid styles.
    if (validDefinitions.length === 0) {
        return "";
    }

    var className = validDefinitions.map(function (s) {
        return s._name;
    }).join("-o_O-");
    injectStyleOnce(className, '.' + className, validDefinitions.map(function (d) {
        return d._definition;
    }), useImportant);

    return className;
};
exports.injectAndGetClassName = injectAndGetClassName;
},{"./generate":1,"./util":5,"asap":7}],4:[function(require,module,exports){
// Module with the same interface as the core aphrodite module,
// except that styles injected do not automatically have !important
// appended to them.
//
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _inject = require('./inject');

var _indexJs = require('./index.js');

var css = function css() {
    for (var _len = arguments.length, styleDefinitions = Array(_len), _key = 0; _key < _len; _key++) {
        styleDefinitions[_key] = arguments[_key];
    }

    var useImportant = false; // Don't append !important to style definitions
    return (0, _inject.injectAndGetClassName)(useImportant, styleDefinitions);
};

exports.StyleSheet = _indexJs.StyleSheet;
exports.StyleSheetServer = _indexJs.StyleSheetServer;
exports.StyleSheetTestUtils = _indexJs.StyleSheetTestUtils;
exports.css = css;
},{"./index.js":2,"./inject":3}],5:[function(require,module,exports){
// {K1: V1, K2: V2, ...} -> [[K1, V1], [K2, V2]]
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var objectToPairs = function objectToPairs(obj) {
    return Object.keys(obj).map(function (key) {
        return [key, obj[key]];
    });
};

exports.objectToPairs = objectToPairs;
// [[K1, V1], [K2, V2]] -> {K1: V1, K2: V2, ...}
var pairsToObject = function pairsToObject(pairs) {
    var result = {};
    pairs.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var key = _ref2[0];
        var val = _ref2[1];

        result[key] = val;
    });
    return result;
};

var mapObj = function mapObj(obj, fn) {
    return pairsToObject(objectToPairs(obj).map(fn));
};

exports.mapObj = mapObj;
// Flattens an array one level
// [[A], [B, C, [D]]] -> [A, B, C, [D]]
var flatten = function flatten(list) {
    return list.reduce(function (memo, x) {
        return memo.concat(x);
    }, []);
};

exports.flatten = flatten;
var UPPERCASE_RE = /([A-Z])/g;
var MS_RE = /^ms-/;

var kebabify = function kebabify(string) {
    return string.replace(UPPERCASE_RE, '-$1').toLowerCase();
};
var kebabifyStyleName = function kebabifyStyleName(string) {
    return kebabify(string).replace(MS_RE, '-ms-');
};

exports.kebabifyStyleName = kebabifyStyleName;
var recursiveMerge = function recursiveMerge(a, b) {
    // TODO(jlfwong): Handle malformed input where a and b are not the same
    // type.

    if (typeof a !== 'object') {
        return b;
    }

    var ret = _extends({}, a);

    Object.keys(b).forEach(function (key) {
        if (ret.hasOwnProperty(key)) {
            ret[key] = recursiveMerge(a[key], b[key]);
        } else {
            ret[key] = b[key];
        }
    });

    return ret;
};

exports.recursiveMerge = recursiveMerge;
/**
 * CSS properties which accept numbers but are not in units of "px".
 * Taken from React's CSSProperty.js
 */
var isUnitlessNumber = {
    animationIterationCount: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG-related properties
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
};

/**
 * Taken from React's CSSProperty.js
 *
 * @param {string} prefix vendor-specific prefix, eg: Webkit
 * @param {string} key style name, eg: transitionDuration
 * @return {string} style name prefixed with `prefix`, properly camelCased, eg:
 * WebkitTransitionDuration
 */
function prefixKey(prefix, key) {
    return prefix + key.charAt(0).toUpperCase() + key.substring(1);
}

/**
 * Support style names that may come passed in prefixed by adding permutations
 * of vendor prefixes.
 * Taken from React's CSSProperty.js
 */
var prefixes = ['Webkit', 'ms', 'Moz', 'O'];

// Using Object.keys here, or else the vanilla for-in loop makes IE8 go into an
// infinite loop, because it iterates over the newly added props too.
// Taken from React's CSSProperty.js
Object.keys(isUnitlessNumber).forEach(function (prop) {
    prefixes.forEach(function (prefix) {
        isUnitlessNumber[prefixKey(prefix, prop)] = isUnitlessNumber[prop];
    });
});

var stringifyValue = function stringifyValue(key, prop) {
    if (typeof prop === "number") {
        if (isUnitlessNumber[key]) {
            return "" + prop;
        } else {
            return prop + "px";
        }
    } else {
        return prop;
    }
};

exports.stringifyValue = stringifyValue;
/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @return {string} Base 36 encoded hash result
 */
function murmurhash2_32_gc(str) {
    var l = str.length;
    var h = l;
    var i = 0;
    var k = undefined;

    while (l >= 4) {
        k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;

        k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
        k ^= k >>> 24;
        k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);

        h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;

        l -= 4;
        ++i;
    }

    switch (l) {
        case 3:
            h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
        case 2:
            h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
        case 1:
            h ^= str.charCodeAt(i) & 0xff;
            h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    }

    h ^= h >>> 13;
    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    h ^= h >>> 15;

    return (h >>> 0).toString(36);
}

// Hash a javascript object using JSON.stringify. This is very fast, about 3
// microseconds on my computer for a sample object:
// http://jsperf.com/test-hashfnv32a-hash/5
//
// Note that this uses JSON.stringify to stringify the objects so in order for
// this to produce consistent hashes browsers need to have a consistent
// ordering of objects. Ben Alpert says that Facebook depends on this, so we
// can probably depend on this too.
var hashObject = function hashObject(object) {
    return murmurhash2_32_gc(JSON.stringify(object));
};

exports.hashObject = hashObject;
var IMPORTANT_RE = /^([^:]+:.*?)( !important)?;$/;

// Given a single style rule string like "a: b;", adds !important to generate
// "a: b !important;".
var importantify = function importantify(string) {
    return string.replace(IMPORTANT_RE, function (_, base, important) {
        return base + " !important;";
    });
};
exports.importantify = importantify;
},{}],6:[function(require,module,exports){
module.exports = require('./lib/no-important.js');

},{"./lib/no-important.js":4}],7:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":8}],8:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],9:[function(require,module,exports){

module.exports = function chain(){
  var len = arguments.length
  var args = [];

  for (var i = 0; i < len; i++)
    args[i] = arguments[i]

  args = args.filter(function(fn){ return fn != null })

  if (args.length === 0) return undefined
  if (args.length === 1) return args[0]

  return args.reduce(function(current, next){
    return function chainedFunction() {
      current.apply(this, arguments);
      next.apply(this, arguments);
    };
  })
}

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = addClass;

var _hasClass = require('./hasClass');

var _hasClass2 = _interopRequireDefault(_hasClass);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addClass(element, className) {
  if (element.classList) element.classList.add(className);else if (!(0, _hasClass2.default)(element)) element.className = element.className + ' ' + className;
}
module.exports = exports['default'];
},{"./hasClass":11}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasClass;
function hasClass(element, className) {
  if (element.classList) return !!className && element.classList.contains(className);else return (" " + element.className + " ").indexOf(" " + className + " ") !== -1;
}
module.exports = exports["default"];
},{}],12:[function(require,module,exports){
'use strict';

module.exports = function removeClass(element, className) {
  if (element.classList) element.classList.remove(className);else element.className = element.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
};
},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.animationEnd = exports.animationDelay = exports.animationTiming = exports.animationDuration = exports.animationName = exports.transitionEnd = exports.transitionDuration = exports.transitionDelay = exports.transitionTiming = exports.transitionProperty = exports.transform = undefined;

var _inDOM = require('../util/inDOM');

var _inDOM2 = _interopRequireDefault(_inDOM);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var transform = 'transform';
var prefix = void 0,
    transitionEnd = void 0,
    animationEnd = void 0;
var transitionProperty = void 0,
    transitionDuration = void 0,
    transitionTiming = void 0,
    transitionDelay = void 0;
var animationName = void 0,
    animationDuration = void 0,
    animationTiming = void 0,
    animationDelay = void 0;

if (_inDOM2.default) {
  var _getTransitionPropert = getTransitionProperties();

  prefix = _getTransitionPropert.prefix;
  exports.transitionEnd = transitionEnd = _getTransitionPropert.transitionEnd;
  exports.animationEnd = animationEnd = _getTransitionPropert.animationEnd;


  exports.transform = transform = prefix + '-' + transform;
  exports.transitionProperty = transitionProperty = prefix + '-transition-property';
  exports.transitionDuration = transitionDuration = prefix + '-transition-duration';
  exports.transitionDelay = transitionDelay = prefix + '-transition-delay';
  exports.transitionTiming = transitionTiming = prefix + '-transition-timing-function';

  exports.animationName = animationName = prefix + '-animation-name';
  exports.animationDuration = animationDuration = prefix + '-animation-duration';
  exports.animationTiming = animationTiming = prefix + '-animation-delay';
  exports.animationDelay = animationDelay = prefix + '-animation-timing-function';
}

exports.transform = transform;
exports.transitionProperty = transitionProperty;
exports.transitionTiming = transitionTiming;
exports.transitionDelay = transitionDelay;
exports.transitionDuration = transitionDuration;
exports.transitionEnd = transitionEnd;
exports.animationName = animationName;
exports.animationDuration = animationDuration;
exports.animationTiming = animationTiming;
exports.animationDelay = animationDelay;
exports.animationEnd = animationEnd;
exports.default = {
  transform: transform,
  end: transitionEnd,
  property: transitionProperty,
  timing: transitionTiming,
  delay: transitionDelay,
  duration: transitionDuration
};


function getTransitionProperties() {
  var style = document.createElement('div').style;

  var vendorMap = {
    O: function O(e) {
      return 'o' + e.toLowerCase();
    },
    Moz: function Moz(e) {
      return e.toLowerCase();
    },
    Webkit: function Webkit(e) {
      return 'webkit' + e;
    },
    ms: function ms(e) {
      return 'MS' + e;
    }
  };

  var vendors = Object.keys(vendorMap);

  var transitionEnd = void 0,
      animationEnd = void 0;
  var prefix = '';

  for (var i = 0; i < vendors.length; i++) {
    var vendor = vendors[i];

    if (vendor + 'TransitionProperty' in style) {
      prefix = '-' + vendor.toLowerCase();
      transitionEnd = vendorMap[vendor]('TransitionEnd');
      animationEnd = vendorMap[vendor]('AnimationEnd');
      break;
    }
  }

  if (!transitionEnd && 'transitionProperty' in style) transitionEnd = 'transitionend';

  if (!animationEnd && 'animationName' in style) animationEnd = 'animationend';

  style = null;

  return { animationEnd: animationEnd, transitionEnd: transitionEnd, prefix: prefix };
}
},{"../util/inDOM":14}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
module.exports = exports['default'];
},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inDOM = require('./inDOM');

var _inDOM2 = _interopRequireDefault(_inDOM);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var vendors = ['', 'webkit', 'moz', 'o', 'ms'];
var cancel = 'clearTimeout';
var raf = fallback;
var compatRaf = void 0;

var getKey = function getKey(vendor, k) {
  return vendor + (!vendor ? k : k[0].toUpperCase() + k.substr(1)) + 'AnimationFrame';
};

if (_inDOM2.default) {
  vendors.some(function (vendor) {
    var rafKey = getKey(vendor, 'request');

    if (rafKey in window) {
      cancel = getKey(vendor, 'cancel');
      return raf = function raf(cb) {
        return window[rafKey](cb);
      };
    }
  });
}

/* https://github.com/component/raf */
var prev = new Date().getTime();
function fallback(fn) {
  var curr = new Date().getTime(),
      ms = Math.max(0, 16 - (curr - prev)),
      req = setTimeout(fn, ms);

  prev = curr;
  return req;
}

compatRaf = function compatRaf(cb) {
  return raf(cb);
};
compatRaf.cancel = function (id) {
  window[cancel] && typeof window[cancel] === 'function' && window[cancel](id);
};
exports.default = compatRaf;
module.exports = exports['default'];
},{"./inDOM":14}],16:[function(require,module,exports){
'use strict';

var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache = {};

function hyphenateStyleName(string) {
    return string in cache
    ? cache[string]
    : cache[string] = string
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calc;

var _joinPrefixedValue = require('../../utils/joinPrefixedValue');

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

var _isPrefixedValue = require('../../utils/isPrefixedValue');

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function calc(property, value) {
  if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && value.indexOf('calc(') > -1) {
    return (0, _joinPrefixedValue2.default)(property, value, function (prefix, value) {
      return value.replace(/calc\(/g, prefix + 'calc(');
    });
  }
}
module.exports = exports['default'];
},{"../../utils/isPrefixedValue":30,"../../utils/joinPrefixedValue":31}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cursor;

var _joinPrefixedValue = require('../../utils/joinPrefixedValue');

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var values = {
  'zoom-in': true,
  'zoom-out': true,
  grab: true,
  grabbing: true
};

function cursor(property, value) {
  if (property === 'cursor' && values[value]) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];
},{"../../utils/joinPrefixedValue":31}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flex;
var values = { flex: true, 'inline-flex': true };

function flex(property, value) {
  if (property === 'display' && values[value]) {
    return {
      display: ['-webkit-box', '-moz-box', '-ms-' + value + 'box', '-webkit-' + value, value]
    };
  }
}
module.exports = exports['default'];
},{}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxIE;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var alternativeValues = {
  'space-around': 'distribute',
  'space-between': 'justify',
  'flex-start': 'start',
  'flex-end': 'end'
};
var alternativeProps = {
  alignContent: 'msFlexLinePack',
  alignSelf: 'msFlexItemAlign',
  alignItems: 'msFlexAlign',
  justifyContent: 'msFlexPack',
  order: 'msFlexOrder',
  flexGrow: 'msFlexPositive',
  flexShrink: 'msFlexNegative',
  flexBasis: 'msPreferredSize'
};

function flexboxIE(property, value) {
  if (alternativeProps[property]) {
    return _defineProperty({}, alternativeProps[property], alternativeValues[value] || value);
  }
}
module.exports = exports['default'];
},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxOld;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var alternativeValues = {
  'space-around': 'justify',
  'space-between': 'justify',
  'flex-start': 'start',
  'flex-end': 'end',
  'wrap-reverse': 'multiple',
  wrap: 'multiple'
};

var alternativeProps = {
  alignItems: 'WebkitBoxAlign',
  justifyContent: 'WebkitBoxPack',
  flexWrap: 'WebkitBoxLines'
};

function flexboxOld(property, value) {
  if (property === 'flexDirection' && typeof value === 'string') {
    return {
      WebkitBoxOrient: value.indexOf('column') > -1 ? 'vertical' : 'horizontal',
      WebkitBoxDirection: value.indexOf('reverse') > -1 ? 'reverse' : 'normal'
    };
  }
  if (alternativeProps[property]) {
    return _defineProperty({}, alternativeProps[property], alternativeValues[value] || value);
  }
}
module.exports = exports['default'];
},{}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gradient;

var _joinPrefixedValue = require('../../utils/joinPrefixedValue');

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

var _isPrefixedValue = require('../../utils/isPrefixedValue');

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var values = /linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient/;

function gradient(property, value) {
  if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && value.match(values) !== null) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];
},{"../../utils/isPrefixedValue":30,"../../utils/joinPrefixedValue":31}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = position;
function position(property, value) {
  if (property === 'position' && value === 'sticky') {
    return { position: ['-webkit-sticky', 'sticky'] };
  }
}
module.exports = exports['default'];
},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sizing;

var _joinPrefixedValue = require('../../utils/joinPrefixedValue');

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var properties = {
  maxHeight: true,
  maxWidth: true,
  width: true,
  height: true,
  columnWidth: true,
  minWidth: true,
  minHeight: true
};
var values = {
  'min-content': true,
  'max-content': true,
  'fill-available': true,
  'fit-content': true,
  'contain-floats': true
};

function sizing(property, value) {
  if (properties[property] && values[value]) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];
},{"../../utils/joinPrefixedValue":31}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transition;

var _hyphenateStyleName = require('hyphenate-style-name');

var _hyphenateStyleName2 = _interopRequireDefault(_hyphenateStyleName);

var _capitalizeString = require('../../utils/capitalizeString');

var _capitalizeString2 = _interopRequireDefault(_capitalizeString);

var _isPrefixedValue = require('../../utils/isPrefixedValue');

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

var _prefixProps = require('../prefixProps');

var _prefixProps2 = _interopRequireDefault(_prefixProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var properties = {
  transition: true,
  transitionProperty: true,
  WebkitTransition: true,
  WebkitTransitionProperty: true
};

function transition(property, value) {
  // also check for already prefixed transitions
  if (typeof value === 'string' && properties[property]) {
    var _ref2;

    var outputValue = prefixValue(value);
    var webkitOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (value) {
      return value.match(/-moz-|-ms-/) === null;
    }).join(',');

    // if the property is already prefixed
    if (property.indexOf('Webkit') > -1) {
      return _defineProperty({}, property, webkitOutput);
    }

    return _ref2 = {}, _defineProperty(_ref2, 'Webkit' + (0, _capitalizeString2.default)(property), webkitOutput), _defineProperty(_ref2, property, outputValue), _ref2;
  }
}

function prefixValue(value) {
  if ((0, _isPrefixedValue2.default)(value)) {
    return value;
  }

  // only split multi values, not cubic beziers
  var multipleValues = value.split(/,(?![^()]*(?:\([^()]*\))?\))/g);

  // iterate each single value and check for transitioned properties
  // that need to be prefixed as well
  multipleValues.forEach(function (val, index) {
    multipleValues[index] = Object.keys(_prefixProps2.default).reduce(function (out, prefix) {
      var dashCasePrefix = '-' + prefix.toLowerCase() + '-';

      Object.keys(_prefixProps2.default[prefix]).forEach(function (prop) {
        var dashCaseProperty = (0, _hyphenateStyleName2.default)(prop);

        if (val.indexOf(dashCaseProperty) > -1 && dashCaseProperty !== 'order') {
          // join all prefixes and create a new value
          out = val.replace(dashCaseProperty, dashCasePrefix + dashCaseProperty) + ',' + out;
        }
      });
      return out;
    }, val);
  });

  return multipleValues.join(',');
}
module.exports = exports['default'];
},{"../../utils/capitalizeString":28,"../../utils/isPrefixedValue":30,"../prefixProps":27,"hyphenate-style-name":16}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prefixAll;

var _prefixProps = require('./prefixProps');

var _prefixProps2 = _interopRequireDefault(_prefixProps);

var _capitalizeString = require('../utils/capitalizeString');

var _capitalizeString2 = _interopRequireDefault(_capitalizeString);

var _sortPrefixedStyle = require('../utils/sortPrefixedStyle');

var _sortPrefixedStyle2 = _interopRequireDefault(_sortPrefixedStyle);

var _position = require('./plugins/position');

var _position2 = _interopRequireDefault(_position);

var _calc = require('./plugins/calc');

var _calc2 = _interopRequireDefault(_calc);

var _cursor = require('./plugins/cursor');

var _cursor2 = _interopRequireDefault(_cursor);

var _flex = require('./plugins/flex');

var _flex2 = _interopRequireDefault(_flex);

var _sizing = require('./plugins/sizing');

var _sizing2 = _interopRequireDefault(_sizing);

var _gradient = require('./plugins/gradient');

var _gradient2 = _interopRequireDefault(_gradient);

var _transition = require('./plugins/transition');

var _transition2 = _interopRequireDefault(_transition);

var _flexboxIE = require('./plugins/flexboxIE');

var _flexboxIE2 = _interopRequireDefault(_flexboxIE);

var _flexboxOld = require('./plugins/flexboxOld');

var _flexboxOld2 = _interopRequireDefault(_flexboxOld);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// special flexbox specifications


var plugins = [_position2.default, _calc2.default, _cursor2.default, _sizing2.default, _gradient2.default, _transition2.default, _flexboxIE2.default, _flexboxOld2.default, _flex2.default];

/**
 * Returns a prefixed version of the style object using all vendor prefixes
 * @param {Object} styles - Style object that gets prefixed properties added
 * @returns {Object} - Style object with prefixed properties and values
 */
function prefixAll(styles) {
  Object.keys(styles).forEach(function (property) {
    var value = styles[property];
    if (value instanceof Object && !Array.isArray(value)) {
      // recurse through nested style objects
      styles[property] = prefixAll(value);
    } else {
      Object.keys(_prefixProps2.default).forEach(function (prefix) {
        var properties = _prefixProps2.default[prefix];
        // add prefixes if needed
        if (properties[property]) {
          styles[prefix + (0, _capitalizeString2.default)(property)] = value;
        }
      });
    }
  });

  Object.keys(styles).forEach(function (property) {
    [].concat(styles[property]).forEach(function (value, index) {
      // resolve every special plugins
      plugins.forEach(function (plugin) {
        return assignStyles(styles, plugin(property, value));
      });
    });
  });

  return (0, _sortPrefixedStyle2.default)(styles);
}

function assignStyles(base) {
  var extend = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  Object.keys(extend).forEach(function (property) {
    var baseValue = base[property];
    if (Array.isArray(baseValue)) {
      [].concat(extend[property]).forEach(function (value) {
        var valueIndex = baseValue.indexOf(value);
        if (valueIndex > -1) {
          base[property].splice(valueIndex, 1);
        }
        base[property].push(value);
      });
    } else {
      base[property] = extend[property];
    }
  });
}
module.exports = exports['default'];
},{"../utils/capitalizeString":28,"../utils/sortPrefixedStyle":32,"./plugins/calc":17,"./plugins/cursor":18,"./plugins/flex":19,"./plugins/flexboxIE":20,"./plugins/flexboxOld":21,"./plugins/gradient":22,"./plugins/position":23,"./plugins/sizing":24,"./plugins/transition":25,"./prefixProps":27}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = { "Webkit": { "transform": true, "transformOrigin": true, "transformOriginX": true, "transformOriginY": true, "backfaceVisibility": true, "perspective": true, "perspectiveOrigin": true, "transformStyle": true, "transformOriginZ": true, "animation": true, "animationDelay": true, "animationDirection": true, "animationFillMode": true, "animationDuration": true, "animationIterationCount": true, "animationName": true, "animationPlayState": true, "animationTimingFunction": true, "appearance": true, "userSelect": true, "fontKerning": true, "textEmphasisPosition": true, "textEmphasis": true, "textEmphasisStyle": true, "textEmphasisColor": true, "boxDecorationBreak": true, "clipPath": true, "maskImage": true, "maskMode": true, "maskRepeat": true, "maskPosition": true, "maskClip": true, "maskOrigin": true, "maskSize": true, "maskComposite": true, "mask": true, "maskBorderSource": true, "maskBorderMode": true, "maskBorderSlice": true, "maskBorderWidth": true, "maskBorderOutset": true, "maskBorderRepeat": true, "maskBorder": true, "maskType": true, "textDecorationStyle": true, "textDecorationSkip": true, "textDecorationLine": true, "textDecorationColor": true, "filter": true, "fontFeatureSettings": true, "breakAfter": true, "breakBefore": true, "breakInside": true, "columnCount": true, "columnFill": true, "columnGap": true, "columnRule": true, "columnRuleColor": true, "columnRuleStyle": true, "columnRuleWidth": true, "columns": true, "columnSpan": true, "columnWidth": true, "flex": true, "flexBasis": true, "flexDirection": true, "flexGrow": true, "flexFlow": true, "flexShrink": true, "flexWrap": true, "alignContent": true, "alignItems": true, "alignSelf": true, "justifyContent": true, "order": true, "transition": true, "transitionDelay": true, "transitionDuration": true, "transitionProperty": true, "transitionTimingFunction": true, "backdropFilter": true, "scrollSnapType": true, "scrollSnapPointsX": true, "scrollSnapPointsY": true, "scrollSnapDestination": true, "scrollSnapCoordinate": true, "shapeImageThreshold": true, "shapeImageMargin": true, "shapeImageOutside": true, "hyphens": true, "flowInto": true, "flowFrom": true, "regionFragment": true, "textSizeAdjust": true }, "Moz": { "appearance": true, "userSelect": true, "boxSizing": true, "textAlignLast": true, "textDecorationStyle": true, "textDecorationSkip": true, "textDecorationLine": true, "textDecorationColor": true, "tabSize": true, "hyphens": true, "fontFeatureSettings": true, "breakAfter": true, "breakBefore": true, "breakInside": true, "columnCount": true, "columnFill": true, "columnGap": true, "columnRule": true, "columnRuleColor": true, "columnRuleStyle": true, "columnRuleWidth": true, "columns": true, "columnSpan": true, "columnWidth": true }, "ms": { "flex": true, "flexBasis": false, "flexDirection": true, "flexGrow": false, "flexFlow": true, "flexShrink": false, "flexWrap": true, "alignContent": false, "alignItems": false, "alignSelf": false, "justifyContent": false, "order": false, "transform": true, "transformOrigin": true, "transformOriginX": true, "transformOriginY": true, "userSelect": true, "wrapFlow": true, "wrapThrough": true, "wrapMargin": true, "scrollSnapType": true, "scrollSnapPointsX": true, "scrollSnapPointsY": true, "scrollSnapDestination": true, "scrollSnapCoordinate": true, "touchAction": true, "hyphens": true, "flowInto": true, "flowFrom": true, "breakBefore": true, "breakAfter": true, "breakInside": true, "regionFragment": true, "gridTemplateColumns": true, "gridTemplateRows": true, "gridTemplateAreas": true, "gridTemplate": true, "gridAutoColumns": true, "gridAutoRows": true, "gridAutoFlow": true, "grid": true, "gridRowStart": true, "gridColumnStart": true, "gridRowEnd": true, "gridRow": true, "gridColumn": true, "gridColumnEnd": true, "gridColumnGap": true, "gridRowGap": true, "gridArea": true, "gridGap": true, "textSizeAdjust": true } };
module.exports = exports["default"];
},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
// helper to capitalize strings

exports.default = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = exports["default"];
},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (property) {
  return property.match(/^(Webkit|Moz|O|ms)/) !== null;
};

module.exports = exports["default"];
},{}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  if (Array.isArray(value)) value = value.join(',');

  return value.match(/-webkit-|-moz-|-ms-/) !== null;
};

module.exports = exports['default'];
},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// returns a style object with a single concated prefixed value string

exports.default = function (property, value) {
  var replacer = arguments.length <= 2 || arguments[2] === undefined ? function (prefix, value) {
    return prefix + value;
  } : arguments[2];
  return _defineProperty({}, property, ['-webkit-', '-moz-', ''].map(function (prefix) {
    return replacer(prefix, value);
  }));
};

module.exports = exports['default'];
},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sortPrefixedStyle;

var _isPrefixedProperty = require('./isPrefixedProperty');

var _isPrefixedProperty2 = _interopRequireDefault(_isPrefixedProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sortPrefixedStyle(style) {
  return Object.keys(style).sort(function (left, right) {
    if ((0, _isPrefixedProperty2.default)(left) && !(0, _isPrefixedProperty2.default)(right)) {
      return -1;
    } else if (!(0, _isPrefixedProperty2.default)(left) && (0, _isPrefixedProperty2.default)(right)) {
      return 1;
    }
    return 0;
  }).reduce(function (sortedStyle, prop) {
    sortedStyle[prop] = style[prop];
    return sortedStyle;
  }, {});
}
module.exports = exports['default'];
},{"./isPrefixedProperty":29}],33:[function(require,module,exports){
module.exports = require('./lib/static/prefixAll')

},{"./lib/static/prefixAll":26}],34:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],35:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _TransitionGroup = require('./TransitionGroup');

var _TransitionGroup2 = _interopRequireDefault(_TransitionGroup);

var _CSSTransitionGroupChild = require('./CSSTransitionGroupChild');

var _CSSTransitionGroupChild2 = _interopRequireDefault(_CSSTransitionGroupChild);

var _PropTypes = require('./utils/PropTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  transitionName: _PropTypes.nameShape.isRequired,

  transitionAppear: _propTypes2.default.bool,
  transitionEnter: _propTypes2.default.bool,
  transitionLeave: _propTypes2.default.bool,
  transitionAppearTimeout: (0, _PropTypes.transitionTimeout)('Appear'),
  transitionEnterTimeout: (0, _PropTypes.transitionTimeout)('Enter'),
  transitionLeaveTimeout: (0, _PropTypes.transitionTimeout)('Leave')
};

var defaultProps = {
  transitionAppear: false,
  transitionEnter: true,
  transitionLeave: true
};

var CSSTransitionGroup = function (_React$Component) {
  _inherits(CSSTransitionGroup, _React$Component);

  function CSSTransitionGroup() {
    var _temp, _this, _ret;

    _classCallCheck(this, CSSTransitionGroup);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this._wrapChild = function (child) {
      return _react2.default.createElement(_CSSTransitionGroupChild2.default, {
        name: _this.props.transitionName,
        appear: _this.props.transitionAppear,
        enter: _this.props.transitionEnter,
        leave: _this.props.transitionLeave,
        appearTimeout: _this.props.transitionAppearTimeout,
        enterTimeout: _this.props.transitionEnterTimeout,
        leaveTimeout: _this.props.transitionLeaveTimeout
      }, child);
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  // We need to provide this childFactory so that
  // ReactCSSTransitionGroupChild can receive updates to name, enter, and
  // leave while it is leaving.


  CSSTransitionGroup.prototype.render = function render() {
    return _react2.default.createElement(_TransitionGroup2.default, _extends({}, this.props, { childFactory: this._wrapChild }));
  };

  return CSSTransitionGroup;
}(_react2.default.Component);

CSSTransitionGroup.displayName = 'CSSTransitionGroup';


CSSTransitionGroup.propTypes = process.env.NODE_ENV !== "production" ? propTypes : {};
CSSTransitionGroup.defaultProps = defaultProps;

exports.default = CSSTransitionGroup;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./CSSTransitionGroupChild":36,"./TransitionGroup":37,"./utils/PropTypes":39,"_process":34,"prop-types":undefined,"react":undefined}],36:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _addClass = require('dom-helpers/class/addClass');

var _addClass2 = _interopRequireDefault(_addClass);

var _removeClass = require('dom-helpers/class/removeClass');

var _removeClass2 = _interopRequireDefault(_removeClass);

var _requestAnimationFrame = require('dom-helpers/util/requestAnimationFrame');

var _requestAnimationFrame2 = _interopRequireDefault(_requestAnimationFrame);

var _properties = require('dom-helpers/transition/properties');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _PropTypes = require('./utils/PropTypes');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var events = [];
if (_properties.transitionEnd) events.push(_properties.transitionEnd);
if (_properties.animationEnd) events.push(_properties.animationEnd);

function addEndListener(node, listener) {
  if (events.length) {
    events.forEach(function (e) {
      return node.addEventListener(e, listener, false);
    });
  } else {
    setTimeout(listener, 0);
  }

  return function () {
    if (!events.length) return;
    events.forEach(function (e) {
      return node.removeEventListener(e, listener, false);
    });
  };
}

var propTypes = {
  children: _propTypes2.default.node,
  name: _PropTypes.nameShape.isRequired,

  // Once we require timeouts to be specified, we can remove the
  // boolean flags (appear etc.) and just accept a number
  // or a bool for the timeout flags (appearTimeout etc.)
  appear: _propTypes2.default.bool,
  enter: _propTypes2.default.bool,
  leave: _propTypes2.default.bool,
  appearTimeout: _propTypes2.default.number,
  enterTimeout: _propTypes2.default.number,
  leaveTimeout: _propTypes2.default.number
};

var CSSTransitionGroupChild = function (_React$Component) {
  _inherits(CSSTransitionGroupChild, _React$Component);

  function CSSTransitionGroupChild() {
    var _temp, _this, _ret;

    _classCallCheck(this, CSSTransitionGroupChild);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _React$Component.call.apply(_React$Component, [this].concat(args))), _this), _this.componentWillAppear = function (done) {
      if (_this.props.appear) {
        _this.transition('appear', done, _this.props.appearTimeout);
      } else {
        done();
      }
    }, _this.componentWillEnter = function (done) {
      if (_this.props.enter) {
        _this.transition('enter', done, _this.props.enterTimeout);
      } else {
        done();
      }
    }, _this.componentWillLeave = function (done) {
      if (_this.props.leave) {
        _this.transition('leave', done, _this.props.leaveTimeout);
      } else {
        done();
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  CSSTransitionGroupChild.prototype.componentWillMount = function componentWillMount() {
    this.classNameAndNodeQueue = [];
    this.transitionTimeouts = [];
  };

  CSSTransitionGroupChild.prototype.componentWillUnmount = function componentWillUnmount() {
    this.unmounted = true;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.transitionTimeouts.forEach(function (timeout) {
      clearTimeout(timeout);
    });

    this.classNameAndNodeQueue.length = 0;
  };

  CSSTransitionGroupChild.prototype.transition = function transition(animationType, finishCallback, timeout) {
    var node = (0, _reactDom.findDOMNode)(this);

    if (!node) {
      if (finishCallback) {
        finishCallback();
      }
      return;
    }

    var className = this.props.name[animationType] || this.props.name + '-' + animationType;
    var activeClassName = this.props.name[animationType + 'Active'] || className + '-active';
    var timer = null;
    var removeListeners = void 0;

    (0, _addClass2.default)(node, className);

    // Need to do this to actually trigger a transition.
    this.queueClassAndNode(activeClassName, node);

    // Clean-up the animation after the specified delay
    var finish = function finish(e) {
      if (e && e.target !== node) {
        return;
      }

      clearTimeout(timer);
      if (removeListeners) removeListeners();

      (0, _removeClass2.default)(node, className);
      (0, _removeClass2.default)(node, activeClassName);

      if (removeListeners) removeListeners();

      // Usually this optional callback is used for informing an owner of
      // a leave animation and telling it to remove the child.
      if (finishCallback) {
        finishCallback();
      }
    };

    if (timeout) {
      timer = setTimeout(finish, timeout);
      this.transitionTimeouts.push(timer);
    } else if (_properties.transitionEnd) {
      removeListeners = addEndListener(node, finish);
    }
  };

  CSSTransitionGroupChild.prototype.queueClassAndNode = function queueClassAndNode(className, node) {
    var _this2 = this;

    this.classNameAndNodeQueue.push({
      className: className,
      node: node
    });

    if (!this.rafHandle) {
      this.rafHandle = (0, _requestAnimationFrame2.default)(function () {
        return _this2.flushClassNameAndNodeQueue();
      });
    }
  };

  CSSTransitionGroupChild.prototype.flushClassNameAndNodeQueue = function flushClassNameAndNodeQueue() {
    if (!this.unmounted) {
      this.classNameAndNodeQueue.forEach(function (obj) {
        // This is for to force a repaint,
        // which is necessary in order to transition styles when adding a class name.
        /* eslint-disable no-unused-expressions */
        obj.node.scrollTop;
        /* eslint-enable no-unused-expressions */
        (0, _addClass2.default)(obj.node, obj.className);
      });
    }
    this.classNameAndNodeQueue.length = 0;
    this.rafHandle = null;
  };

  CSSTransitionGroupChild.prototype.render = function render() {
    var props = _extends({}, this.props);
    delete props.name;
    delete props.appear;
    delete props.enter;
    delete props.leave;
    delete props.appearTimeout;
    delete props.enterTimeout;
    delete props.leaveTimeout;
    delete props.children;
    return _react2.default.cloneElement(_react2.default.Children.only(this.props.children), props);
  };

  return CSSTransitionGroupChild;
}(_react2.default.Component);

CSSTransitionGroupChild.displayName = 'CSSTransitionGroupChild';


CSSTransitionGroupChild.propTypes = process.env.NODE_ENV !== "production" ? propTypes : {};

exports.default = CSSTransitionGroupChild;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./utils/PropTypes":39,"_process":34,"dom-helpers/class/addClass":10,"dom-helpers/class/removeClass":12,"dom-helpers/transition/properties":13,"dom-helpers/util/requestAnimationFrame":15,"prop-types":undefined,"react":undefined,"react-dom":undefined}],37:[function(require,module,exports){
(function (process){
'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _chainFunction = require('chain-function');

var _chainFunction2 = _interopRequireDefault(_chainFunction);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _ChildMapping = require('./utils/ChildMapping');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var propTypes = {
  component: _propTypes2.default.any,
  childFactory: _propTypes2.default.func,
  children: _propTypes2.default.node
};

var defaultProps = {
  component: 'span',
  childFactory: function childFactory(child) {
    return child;
  }
};

var TransitionGroup = function (_React$Component) {
  _inherits(TransitionGroup, _React$Component);

  function TransitionGroup(props, context) {
    _classCallCheck(this, TransitionGroup);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _this.performAppear = function (key, component) {
      _this.currentlyTransitioningKeys[key] = true;

      if (component.componentWillAppear) {
        component.componentWillAppear(_this._handleDoneAppearing.bind(_this, key, component));
      } else {
        _this._handleDoneAppearing(key, component);
      }
    };

    _this._handleDoneAppearing = function (key, component) {
      if (component.componentDidAppear) {
        component.componentDidAppear();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = (0, _ChildMapping.getChildMapping)(_this.props.children);

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully appeared. Remove it.
        _this.performLeave(key, component);
      }
    };

    _this.performEnter = function (key, component) {
      _this.currentlyTransitioningKeys[key] = true;

      if (component.componentWillEnter) {
        component.componentWillEnter(_this._handleDoneEntering.bind(_this, key, component));
      } else {
        _this._handleDoneEntering(key, component);
      }
    };

    _this._handleDoneEntering = function (key, component) {
      if (component.componentDidEnter) {
        component.componentDidEnter();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = (0, _ChildMapping.getChildMapping)(_this.props.children);

      if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
        // This was removed before it had fully entered. Remove it.
        _this.performLeave(key, component);
      }
    };

    _this.performLeave = function (key, component) {
      _this.currentlyTransitioningKeys[key] = true;

      if (component.componentWillLeave) {
        component.componentWillLeave(_this._handleDoneLeaving.bind(_this, key, component));
      } else {
        // Note that this is somewhat dangerous b/c it calls setState()
        // again, effectively mutating the component before all the work
        // is done.
        _this._handleDoneLeaving(key, component);
      }
    };

    _this._handleDoneLeaving = function (key, component) {
      if (component.componentDidLeave) {
        component.componentDidLeave();
      }

      delete _this.currentlyTransitioningKeys[key];

      var currentChildMapping = (0, _ChildMapping.getChildMapping)(_this.props.children);

      if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
        // This entered again before it fully left. Add it again.
        _this.keysToEnter.push(key);
      } else {
        _this.setState(function (state) {
          var newChildren = _extends({}, state.children);
          delete newChildren[key];
          return { children: newChildren };
        });
      }
    };

    _this.childRefs = Object.create(null);

    _this.state = {
      children: (0, _ChildMapping.getChildMapping)(props.children)
    };
    return _this;
  }

  TransitionGroup.prototype.componentWillMount = function componentWillMount() {
    this.currentlyTransitioningKeys = {};
    this.keysToEnter = [];
    this.keysToLeave = [];
  };

  TransitionGroup.prototype.componentDidMount = function componentDidMount() {
    var initialChildMapping = this.state.children;
    for (var key in initialChildMapping) {
      if (initialChildMapping[key]) {
        this.performAppear(key, this.childRefs[key]);
      }
    }
  };

  TransitionGroup.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var nextChildMapping = (0, _ChildMapping.getChildMapping)(nextProps.children);
    var prevChildMapping = this.state.children;

    this.setState({
      children: (0, _ChildMapping.mergeChildMappings)(prevChildMapping, nextChildMapping)
    });

    for (var key in nextChildMapping) {
      var hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
        this.keysToEnter.push(key);
      }
    }

    for (var _key in prevChildMapping) {
      var hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(_key);
      if (prevChildMapping[_key] && !hasNext && !this.currentlyTransitioningKeys[_key]) {
        this.keysToLeave.push(_key);
      }
    }

    // If we want to someday check for reordering, we could do it here.
  };

  TransitionGroup.prototype.componentDidUpdate = function componentDidUpdate() {
    var _this2 = this;

    var keysToEnter = this.keysToEnter;
    this.keysToEnter = [];
    keysToEnter.forEach(function (key) {
      return _this2.performEnter(key, _this2.childRefs[key]);
    });

    var keysToLeave = this.keysToLeave;
    this.keysToLeave = [];
    keysToLeave.forEach(function (key) {
      return _this2.performLeave(key, _this2.childRefs[key]);
    });
  };

  TransitionGroup.prototype.render = function render() {
    var _this3 = this;

    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    var childrenToRender = [];

    var _loop = function _loop(key) {
      var child = _this3.state.children[key];
      if (child) {
        var isCallbackRef = typeof child.ref !== 'string';
        var factoryChild = _this3.props.childFactory(child);
        var ref = function ref(r) {
          _this3.childRefs[key] = r;
        };

        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(isCallbackRef, 'string refs are not supported on children of TransitionGroup and will be ignored. ' + 'Please use a callback ref instead: https://facebook.github.io/react/docs/refs-and-the-dom.html#the-ref-callback-attribute') : void 0;

        // Always chaining the refs leads to problems when the childFactory
        // wraps the child. The child ref callback gets called twice with the
        // wrapper and the child. So we only need to chain the ref if the
        // factoryChild is not different from child.
        if (factoryChild === child && isCallbackRef) {
          ref = (0, _chainFunction2.default)(child.ref, ref);
        }

        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        childrenToRender.push(_react2.default.cloneElement(factoryChild, {
          key: key,
          ref: ref
        }));
      }
    };

    for (var key in this.state.children) {
      _loop(key);
    }

    // Do not forward TransitionGroup props to primitive DOM nodes
    var props = _extends({}, this.props);
    delete props.transitionLeave;
    delete props.transitionName;
    delete props.transitionAppear;
    delete props.transitionEnter;
    delete props.childFactory;
    delete props.transitionLeaveTimeout;
    delete props.transitionEnterTimeout;
    delete props.transitionAppearTimeout;
    delete props.component;

    return _react2.default.createElement(this.props.component, props, childrenToRender);
  };

  return TransitionGroup;
}(_react2.default.Component);

TransitionGroup.displayName = 'TransitionGroup';


TransitionGroup.propTypes = process.env.NODE_ENV !== "production" ? propTypes : {};
TransitionGroup.defaultProps = defaultProps;

exports.default = TransitionGroup;
module.exports = exports['default'];
}).call(this,require('_process'))

},{"./utils/ChildMapping":38,"_process":34,"chain-function":9,"prop-types":undefined,"react":undefined,"warning":40}],38:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.getChildMapping = getChildMapping;
exports.mergeChildMappings = mergeChildMappings;

var _react = require('react');

/**
 * Given `this.props.children`, return an object mapping key to child.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to child
 */
function getChildMapping(children) {
  if (!children) {
    return children;
  }
  var result = {};
  _react.Children.map(children, function (child) {
    return child;
  }).forEach(function (child) {
    result[child.key] = child;
  });
  return result;
}

/**
 * When you're adding or removing children some may be added or removed in the
 * same render pass. We want to show *both* since we want to simultaneously
 * animate elements in and out. This function takes a previous set of keys
 * and a new set of keys and merges them with its best guess of the correct
 * ordering. In the future we may expose some of the utilities in
 * ReactMultiChild to make this easy, but for now React itself does not
 * directly have this concept of the union of prevChildren and nextChildren
 * so we implement it here.
 *
 * @param {object} prev prev children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @return {object} a key set that contains all keys in `prev` and all keys
 * in `next` in a reasonable order.
 */
function mergeChildMappings(prev, next) {
  prev = prev || {};
  next = next || {};

  function getValueForKey(key) {
    if (next.hasOwnProperty(key)) {
      return next[key];
    }

    return prev[key];
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  var nextKeysPending = {};

  var pendingKeys = [];
  for (var prevKey in prev) {
    if (next.hasOwnProperty(prevKey)) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  var i = void 0;
  var childMapping = {};
  for (var nextKey in next) {
    if (nextKeysPending.hasOwnProperty(nextKey)) {
      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
        var pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
      }
    }
    childMapping[nextKey] = getValueForKey(nextKey);
  }

  // Finally, add the keys which didn't appear before any key in `next`
  for (i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }

  return childMapping;
}
},{"react":undefined}],39:[function(require,module,exports){
'use strict';

exports.__esModule = true;
exports.nameShape = undefined;
exports.transitionTimeout = transitionTimeout;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function transitionTimeout(transitionType) {
  var timeoutPropName = 'transition' + transitionType + 'Timeout';
  var enabledPropName = 'transition' + transitionType;

  return function (props) {
    // If the transition is enabled
    if (props[enabledPropName]) {
      // If no timeout duration is provided
      if (props[timeoutPropName] == null) {
        return new Error(timeoutPropName + ' wasn\'t supplied to CSSTransitionGroup: ' + 'this can cause unreliable animations and won\'t be supported in ' + 'a future version of React. See ' + 'https://fb.me/react-animation-transition-group-timeout for more ' + 'information.');

        // If the duration isn't a number
      } else if (typeof props[timeoutPropName] !== 'number') {
        return new Error(timeoutPropName + ' must be a number (in milliseconds)');
      }
    }

    return null;
  };
}

var nameShape = exports.nameShape = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
  enter: _propTypes2.default.string,
  leave: _propTypes2.default.string,
  active: _propTypes2.default.string
}), _propTypes2.default.shape({
  enter: _propTypes2.default.string,
  enterActive: _propTypes2.default.string,
  leave: _propTypes2.default.string,
  leaveActive: _propTypes2.default.string,
  appear: _propTypes2.default.string,
  appearActive: _propTypes2.default.string
})]);
},{"prop-types":undefined,"react":undefined}],40:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (process.env.NODE_ENV !== 'production') {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;

}).call(this,require('_process'))

},{"_process":34}],41:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var _utils = require('../utils');

var _Icon = require('./Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function Arrow(_ref, _ref2) {
	var direction = _ref.direction;
	var icon = _ref.icon;
	var onClick = _ref.onClick;
	var size = _ref.size;

	var props = _objectWithoutProperties(_ref, ['direction', 'icon', 'onClick', 'size']);

	var theme = _ref2.theme;

	var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));

	return _react2['default'].createElement(
		'button',
		_extends({
			type: 'button',
			className: (0, _aphroditeNoImportant.css)(classes.arrow, classes['arrow__direction__' + direction], size && classes['arrow__size__' + size]),
			onClick: onClick,
			onTouchEnd: onClick
		}, props),
		_react2['default'].createElement(_Icon2['default'], { fill: !!theme.arrow && theme.arrow.fill || _theme2['default'].arrow.fill, type: icon })
	);
}

Arrow.propTypes = {
	direction: _propTypes2['default'].oneOf(['left', 'right']),
	icon: _propTypes2['default'].string,
	onClick: _propTypes2['default'].func.isRequired,
	size: _propTypes2['default'].oneOf(['medium', 'small']).isRequired
};
Arrow.defaultProps = {
	size: 'medium'
};
Arrow.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var defaultStyles = {
	arrow: {
		background: 'none',
		border: 'none',
		borderRadius: 4,
		cursor: 'pointer',
		outline: 'none',
		padding: 10, // increase hit area
		position: 'absolute',
		top: '50%',

		// disable user select
		WebkitTouchCallout: 'none',
		userSelect: 'none'
	},

	// sizees
	arrow__size__medium: {
		height: _theme2['default'].arrow.height,
		marginTop: (_theme2['default'].arrow.height + 20 * 2) / -2,
		width: 40,

		'@media (min-width: 768px)': {
			width: 70
		}
	},
	arrow__size__small: {
		height: _theme2['default'].thumbnail.size,
		marginTop: (_theme2['default'].thumbnail.size + 20 * 2) / -2,
		width: 30,

		'@media (min-width: 500px)': {
			width: 40
		}
	},

	// direction
	arrow__direction__right: {
		right: _theme2['default'].container.gutter.horizontal
	},
	arrow__direction__left: {
		left: _theme2['default'].container.gutter.horizontal
	}
};

module.exports = Arrow;

},{"../theme":59,"../utils":63,"./Icon":45,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],42:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var _utils = require('../utils');

function Container(_ref, _ref2) {
	var props = _objectWithoutProperties(_ref, []);

	var theme = _ref2.theme;

	var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));

	return _react2['default'].createElement('div', _extends({ id: 'lightboxBackdrop',
		className: (0, _aphroditeNoImportant.css)(classes.container)
	}, props));
}

Container.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var defaultStyles = {
	container: {
		alignItems: 'center',
		backgroundColor: _theme2['default'].container.background,
		boxSizing: 'border-box',
		display: 'flex',
		height: '100vh',
		justifyContent: 'center',
		left: 0,
		paddingBottom: _theme2['default'].container.gutter.vertical,
		paddingLeft: _theme2['default'].container.gutter.horizontal,
		paddingRight: _theme2['default'].container.gutter.horizontal,
		paddingTop: _theme2['default'].container.gutter.vertical,
		position: 'fixed',
		top: 0,
		width: '100vw',
		margin: 0,
		zIndex: _theme2['default'].container.zIndex
	}
};

module.exports = Container;

},{"../theme":59,"../utils":63,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],43:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var _utils = require('../utils');

function Footer(_ref, _ref2) {
	var caption = _ref.caption;
	var countCurrent = _ref.countCurrent;
	var countSeparator = _ref.countSeparator;
	var countTotal = _ref.countTotal;
	var showCount = _ref.showCount;

	var props = _objectWithoutProperties(_ref, ['caption', 'countCurrent', 'countSeparator', 'countTotal', 'showCount']);

	var theme = _ref2.theme;

	if (!caption && !showCount) return null;

	var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));

	var imageCount = showCount ? _react2['default'].createElement(
		'div',
		{ className: (0, _aphroditeNoImportant.css)(classes.footerCount) },
		countCurrent,
		countSeparator,
		countTotal
	) : _react2['default'].createElement('span', null);

	return _react2['default'].createElement(
		'div',
		_extends({ className: (0, _aphroditeNoImportant.css)(classes.footer) }, props),
		caption ? _react2['default'].createElement(
			'figcaption',
			{ className: (0, _aphroditeNoImportant.css)(classes.footerCaption) },
			caption
		) : _react2['default'].createElement('span', null),
		imageCount
	);
}

Footer.propTypes = {
	caption: _propTypes2['default'].oneOfType([_propTypes2['default'].string, _propTypes2['default'].element]),
	countCurrent: _propTypes2['default'].number,
	countSeparator: _propTypes2['default'].string,
	countTotal: _propTypes2['default'].number,
	showCount: _propTypes2['default'].bool
};
Footer.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var defaultStyles = {
	footer: {
		boxSizing: 'border-box',
		color: _theme2['default'].footer.color,
		cursor: 'auto',
		display: 'flex',
		justifyContent: 'space-between',
		left: 0,
		lineHeight: 1.3,
		paddingBottom: _theme2['default'].footer.gutter.vertical,
		paddingLeft: _theme2['default'].footer.gutter.horizontal,
		paddingRight: _theme2['default'].footer.gutter.horizontal,
		paddingTop: _theme2['default'].footer.gutter.vertical
	},
	footerCount: {
		color: _theme2['default'].footer.count.color,
		fontSize: _theme2['default'].footer.count.fontSize,
		paddingLeft: '1em' },
	// add a small gutter for the caption
	footerCaption: {
		flex: '1 1 0'
	}
};

module.exports = Footer;

},{"../theme":59,"../utils":63,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],44:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var _utils = require('../utils');

var _Icon = require('./Icon');

var _Icon2 = _interopRequireDefault(_Icon);

function Header(_ref, _ref2) {
	var customControls = _ref.customControls;
	var onClose = _ref.onClose;
	var showCloseButton = _ref.showCloseButton;
	var closeButtonTitle = _ref.closeButtonTitle;

	var props = _objectWithoutProperties(_ref, ['customControls', 'onClose', 'showCloseButton', 'closeButtonTitle']);

	var theme = _ref2.theme;

	var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));

	return _react2['default'].createElement(
		'div',
		_extends({ className: (0, _aphroditeNoImportant.css)(classes.header) }, props),
		customControls ? customControls : _react2['default'].createElement('span', null),
		!!showCloseButton && _react2['default'].createElement(
			'button',
			{
				title: closeButtonTitle,
				className: (0, _aphroditeNoImportant.css)(classes.close),
				onClick: onClose
			},
			_react2['default'].createElement(_Icon2['default'], { fill: !!theme.close && theme.close.fill || _theme2['default'].close.fill, type: 'close' })
		)
	);
}

Header.propTypes = {
	customControls: _propTypes2['default'].array,
	onClose: _propTypes2['default'].func.isRequired,
	showCloseButton: _propTypes2['default'].bool
};
Header.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var defaultStyles = {
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		height: 10 },
	/*defaults.header.height,*/
	close: {
		backgroundColor: 'rgba(0,0,0,0.5)',
		border: 'none',
		borderRadius: 4,
		cursor: 'pointer',
		outline: 'none',
		position: 'fixed',
		zIndex: 1000,
		top: 10,
		right: 10,
		verticalAlign: 'bottom',

		// increase hit area
		height: 20,
		width: 20,
		marginRight: 0,
		padding: 0
	}
};

module.exports = Header;

},{"../theme":59,"../utils":63,"./Icon":45,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],45:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _icons = require('../icons');

var _icons2 = _interopRequireDefault(_icons);

var Icon = function Icon(_ref) {
	var fill = _ref.fill;
	var type = _ref.type;

	var props = _objectWithoutProperties(_ref, ['fill', 'type']);

	var icon = _icons2['default'][type];

	return _react2['default'].createElement('span', _extends({
		dangerouslySetInnerHTML: { __html: icon(fill) }
	}, props));
};

Icon.propTypes = {
	fill: _propTypes2['default'].string,
	type: _propTypes2['default'].oneOf(Object.keys(_icons2['default']))
};
Icon.defaultProps = {
	fill: 'white'
};

exports['default'] = Icon;
module.exports = exports['default'];

},{"../icons":55,"prop-types":undefined,"react":undefined}],46:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _iconsMinus = require('../icons/minus');

var _iconsMinus2 = _interopRequireDefault(_iconsMinus);

var _iconsPlus = require('../icons/plus');

var _iconsPlus2 = _interopRequireDefault(_iconsPlus);

var MIN_SCALE = 1.0;
var MAX_SCALE = 4.0;
var SCALE_MULTER = 2.0;

var MIN_SWIPE_LENGTH = 40.0;

var Image = (function (_Component) {
  _inherits(Image, _Component);

  function Image(props) {
    _classCallCheck(this, Image);

    _get(Object.getPrototypeOf(Image.prototype), 'constructor', this).call(this, props);
  }

  _createClass(Image, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.setState({
        scale: MIN_SCALE,
        imageLoaded: false,
        imageStyle: {
          maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)'
        },
        wrapperStyle: {},
        secondWrapper: { maxHeight: '100vh' }
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var image = this.refs.lightbox_image_node;
      image.addEventListener('load', function () {
        _this.setState({ imageLoaded: true });
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if (this.zoomed) {
        this.zoomed = false;

        if (this.state.scale > MIN_SCALE) {
          var imageNode = this.refs.lightbox_image_node,
              wrapperNode = this.refs.image_wrapper;

          var hw = wrapperNode.offsetHeight,
              hi = imageNode.offsetHeight,
              ww = wrapperNode.offsetWidth,
              wi = imageNode.offsetWidth,
              centerX = 0.5,
              centerY = 0.5;

          if (this.touchRelativePos) {
            centerX = this.touchRelativePos.x;
            centerY = this.touchRelativePos.y;
            console.log('this.touchPos', { centerX: centerX, centerY: centerY });
            this.touchRelativePos = null;
          }

          wrapperNode.scrollTop = hi * centerY - hw / 2;
          wrapperNode.scrollLeft = wi * centerX - ww / 2;
        }
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.src !== nextProps.src) {
        this.tabPos = null;
        this.setState({
          scale: MIN_SCALE,
          imageLoaded: false,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + nextProps.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: { maxHeight: '100vh' }
        });
      }
    }
  }, {
    key: 'onZoomIn',
    value: function onZoomIn(e) {
      var multer = arguments.length <= 1 || arguments[1] === undefined ? SCALE_MULTER : arguments[1];

      if (this.state.scale >= MAX_SCALE) return;

      if (e !== null) {
        console.log('clear touchPos');
        this.touchRelativePos = null;
      } // if click on + clear tabPos info

      var wrapHeight = this.refs.image_wrapper.offsetHeight;
      var wrapWidth = this.refs.image_wrapper.offsetWidth;
      var newScale = this.state.scale * multer;
      this.setState({
        scale: newScale,
        wrapperStyle: {
          overflow: 'scroll',
          width: wrapWidth,
          height: wrapHeight
        },
        secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
        imageStyle: { width: '100%', height: '100%' }
      });

      this.zoomed = true;
    }
  }, {
    key: 'onZoomOut',
    value: function onZoomOut(e) {
      var multer = arguments.length <= 1 || arguments[1] === undefined ? SCALE_MULTER : arguments[1];

      if (this.state.scale <= MIN_SCALE) return;

      if (e !== null) {
        console.log('clear touchPos');
        this.touchRelativePos = null;
      } // if click on - clear tabPos info

      var newScale = this.state.scale / multer;
      if (newScale === MIN_SCALE) {
        this.setState({
          scale: MIN_SCALE,
          imageStyle: {
            maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)'
          },
          wrapperStyle: {},
          secondWrapper: { maxHeight: '100vh' }
        });
      } else {
        var wrapHeight = this.refs.image_wrapper.offsetHeight;
        var wrapWidth = this.refs.image_wrapper.offsetWidth;
        this.setState({
          scale: newScale,
          wrapperStyle: {
            overflow: 'scroll',
            width: wrapWidth,
            height: wrapHeight
          },
          secondWrapper: { width: wrapWidth * newScale, height: wrapHeight * newScale, position: 'static' },
          imageStyle: { width: '100%', height: '100%' }
        });
      }

      this.zoomed = true;
    }
  }, {
    key: 'onImageMouseDown',
    value: function onImageMouseDown(e) {
      var _this2 = this;

      if (!this.panStarted) {
        (function () {
          var self = _this2;
          _this2.panStarted = true;
          _this2.scrollPos = { x: e.clientX, y: e.clientY };

          var onMouseMove = function onMouseMove(e) {
            var offsetX = self.scrollPos.x - e.clientX;
            var offsetY = self.scrollPos.y - e.clientY;

            self.refs.image_wrapper.scrollLeft += offsetX;
            self.refs.image_wrapper.scrollTop += offsetY;

            self.scrollPos = { x: e.clientX, y: e.clientY };
          };

          var onMouseUp = function onMouseUp(e) {
            self.panStarted = false;
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };

          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        })();
      }
    }
  }, {
    key: 'onImageTouch',
    value: function onImageTouch(e) {
      var _this3 = this;

      if (!this.panStarted) {
        var _ret2 = (function () {
          var self = _this3;
          _this3.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          // console.log('e.touches[0]', e.touches[0]);
          // console.log('ClientSize', {w: this.refs.lightbox_image_node.clientWidth, h: this.refs.lightbox_image_node.clientHeight});
          var imageRect = _this3.refs.lightbox_image_node.getClientRects()[0];
          _this3.touchRelativePos = {
            x: (e.touches[0].clientX - imageRect.x) / _this3.refs.lightbox_image_node.clientWidth,
            y: (e.touches[0].clientY - imageRect.y) / _this3.refs.lightbox_image_node.clientHeight
          };
          // console.log('touchRelativePos', this.touchRelativePos);
          if (_this3.state.scale > MIN_SCALE) {
            var _ret3 = (function () {

              if (_this3.lastTouchTime && Date.now() - _this3.lastTouchTime < 300) {
                // time beetween touches is less than 300ms - double tap
                if (_this3.state.scale < MAX_SCALE) {
                  self.onZoomIn(null, SCALE_MULTER);
                } else {
                  self.onZoomOut(null, MAX_SCALE);
                }
                return {
                  v: {
                    v: undefined
                  }
                };
              }

              _this3.lastTouchTime = Date.now();
              _this3.panStarted = true;

              var onTouchMove = function onTouchMove(e) {
                var offsetX = self.touchPos.x - e.changedTouches[0].clientX;
                var offsetY = self.touchPos.y - e.changedTouches[0].clientY;

                self.refs.image_wrapper.scrollLeft += offsetX;
                self.refs.image_wrapper.scrollTop += offsetY;

                self.touchPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
              };

              var onTouchEnd = function onTouchEnd(e) {
                self.panStarted = false;
                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchEnd);
              };

              window.addEventListener("touchmove", onTouchMove);
              window.addEventListener("touchend", onTouchEnd);
            })();

            if (typeof _ret3 === 'object') return _ret3.v;
          } else {
            var _ret4 = (function () {
              /**
               * track touch swipes
               */
              if (_this3.lastTouchTime && Date.now() - _this3.lastTouchTime < 300) {
                // time beetween touches is less than 300ms - double tap
                self.onZoomIn(null, SCALE_MULTER);
                return {
                  v: {
                    v: undefined
                  }
                };
              }

              _this3.lastTouchTime = Date.now();
              _this3.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

              var onTouchEnd = function onTouchEnd(e) {
                self.swipeStarted = false;

                var offsetX = self.touchPos.x - e.changedTouches[0].clientX;
                var offsetY = self.touchPos.y - e.changedTouches[0].clientY;

                if (Math.abs(offsetX) > 3.0 * Math.abs(offsetY) && Math.abs(offsetX) > MIN_SWIPE_LENGTH) {
                  if (offsetX < 0) {
                    // swipe left
                    if (self.props.onSwipeLeft) self.props.onSwipeLeft();
                  } else {
                    // swipe right
                    if (self.props.onSwipeRight) self.props.onSwipeRight();
                  }
                }

                window.removeEventListener("touchend", onTouchEnd);
              };

              window.addEventListener("touchend", onTouchEnd);
            })();

            if (typeof _ret4 === 'object') return _ret4.v;
          }
        })();

        if (typeof _ret2 === 'object') return _ret2.v;
      }
    }
  }, {
    key: 'onImageDoubleClick',
    value: function onImageDoubleClick(e) {

      var imageRect = this.refs.lightbox_image_node.getClientRects()[0];

      this.touchRelativePos = {
        x: (e.clientX - imageRect.x) / this.refs.lightbox_image_node.clientWidth,
        y: (e.clientY - imageRect.y) / this.refs.lightbox_image_node.clientHeight
      };

      if (this.state.scale < MAX_SCALE) {
        this.onZoomIn(null, SCALE_MULTER);
      } else {
        this.onZoomOut(null, MAX_SCALE);
      }
    }
  }, {
    key: 'render',
    value: function render() {

      var imgSize = {};
      if (this.state.scale > MIN_SCALE) {
        imgSize.width = this.state.imageStyle.width;
        imgSize.height = this.state.imageStyle.height;
      }

      var imageStyle = _extends({}, this.state.imageStyle);
      imageStyle.visibility = this.state.imageLoaded ? 'visible' : 'hidden';

      if (this.state.scale > MIN_SCALE) {
        imageStyle.cursor = 'all-scroll';
      }

      return _react2['default'].createElement(
        'div',
        { style: { textAlign: 'center' } },
        _react2['default'].createElement(
          'div',
          { style: { position: 'relative', display: 'inline-block', maxWidth: '100vw', margin: 'auto', backgroundColor: 'black' } },
          !this.state.imageLoaded && _react2['default'].createElement('i', { className: 'fa fa-circle-o-notch fa-spin fa-fw', style: {
              position: 'absolute',
              bottom: 0,
              top: 0,
              left: 0,
              right: 0,
              margin: 'auto',
              zIndex: 100,
              width: 30,
              height: 30,
              opacity: 1,
              color: '#AAA',
              fontSize: '2em'
            } }),
          _react2['default'].createElement(_iconsMinus2['default'], {
            color: '#FFF',
            title: 'Zoom out',
            onClick: this.onZoomOut.bind(this),
            style: {
              position: 'absolute',
              bottom: 10,
              right: 40,
              cursor: this.state.scale > MIN_SCALE ? 'pointer' : 'auto',
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? this.state.scale > MIN_SCALE ? 0.8 : 0.4 : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
            } }),
          _react2['default'].createElement(_iconsPlus2['default'], {
            color: '#FFF',
            title: 'Zoom in',
            onClick: this.onZoomIn.bind(this),
            style: {
              position: 'absolute',
              bottom: 10,
              right: 10,
              cursor: this.state.scale < MAX_SCALE ? 'pointer' : 'auto',
              zIndex: 100,
              width: 20,
              height: 20,
              opacity: this.state.imageLoaded ? this.state.scale < MAX_SCALE ? 0.8 : 0.4 : 0,
              filter: 'drop-shadow(2px 2px 1px rgba(0,0,0,0.8))'
            } }),
          _react2['default'].createElement(
            'div',
            { style: this.state.wrapperStyle, ref: 'image_wrapper' },
            _react2['default'].createElement(
              'div',
              { style: this.state.secondWrapper },
              _react2['default'].createElement('img', _extends({
                ref: 'lightbox_image_node',
                className: this.state.scale === MIN_SCALE ? this.props.className + ' not_scaled_image' : this.props.className,
                sizes: this.state.scale === MIN_SCALE ? this.props.sizes : undefined,
                alt: this.props.alt,
                src: this.props.src
              }, imgSize, {
                srcSet: this.props.srcset,
                style: imageStyle,
                draggable: 'false',
                onClick: this.props.onClickImage,
                onDoubleClick: this.onImageDoubleClick.bind(this),
                onMouseDown: this.onImageMouseDown.bind(this),
                onTouchStart: this.onImageTouch.bind(this)
              }))
            )
          )
        )
      );
    }
  }]);

  return Image;
})(_react.Component);

exports['default'] = Image;

Image.propTypes = {
  alt: _react.PropTypes.func,
  className: _react.PropTypes.string.isRequired,
  heightOffset: _react.PropTypes.number.isRequired,
  onClick: _react.PropTypes.func,
  onSwipeLeft: _react.PropTypes.func,
  onSwipeRight: _react.PropTypes.func,
  sizes: _react.PropTypes.string.isRequired,
  src: _react.PropTypes.string.isRequired,
  srcset: _react.PropTypes.array,
  style: _react.PropTypes.object.isRequired
};
module.exports = exports['default'];

},{"../icons/minus":56,"../icons/plus":58,"react":undefined}],47:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _Thumbnail = require('./Thumbnail');

var _Thumbnail2 = _interopRequireDefault(_Thumbnail);

var _Arrow = require('./Arrow');

var _Arrow2 = _interopRequireDefault(_Arrow);

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var classes = _aphroditeNoImportant.StyleSheet.create({
	paginatedThumbnails: {
		bottom: _theme2['default'].container.gutter.vertical,
		height: _theme2['default'].thumbnail.size,
		padding: '0 50px',
		position: 'absolute',
		textAlign: 'center',
		whiteSpace: 'nowrap'
	}
});

var arrowStyles = {
	height: _theme2['default'].thumbnail.size + _theme2['default'].thumbnail.gutter * 2,
	width: 40
};

var PaginatedThumbnails = (function (_Component) {
	_inherits(PaginatedThumbnails, _Component);

	function PaginatedThumbnails(props) {
		_classCallCheck(this, PaginatedThumbnails);

		_get(Object.getPrototypeOf(PaginatedThumbnails.prototype), 'constructor', this).call(this, props);

		this.state = {
			hasCustomPage: false
		};

		this.gotoPrev = this.gotoPrev.bind(this);
		this.gotoNext = this.gotoNext.bind(this);
	}

	_createClass(PaginatedThumbnails, [{
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			// Component should be controlled, flush state when currentImage changes
			if (nextProps.currentImage !== this.props.currentImage) {
				this.setState({
					hasCustomPage: false
				});
			}
		}

		// ==============================
		// METHODS
		// ==============================

	}, {
		key: 'getFirst',
		value: function getFirst() {
			var _props = this.props;
			var currentImage = _props.currentImage;
			var offset = _props.offset;

			if (this.state.hasCustomPage) {
				return this.clampFirst(this.state.first);
			}
			return this.clampFirst(currentImage - offset);
		}
	}, {
		key: 'setFirst',
		value: function setFirst(event, newFirst) {
			var first = this.state.first;

			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}

			if (first === newFirst) return;

			this.setState({
				hasCustomPage: true,
				first: newFirst
			});
		}
	}, {
		key: 'gotoPrev',
		value: function gotoPrev(event) {
			this.setFirst(event, this.getFirst() - this.props.offset);
		}
	}, {
		key: 'gotoNext',
		value: function gotoNext(event) {
			this.setFirst(event, this.getFirst() + this.props.offset);
		}
	}, {
		key: 'clampFirst',
		value: function clampFirst(value) {
			var _props2 = this.props;
			var images = _props2.images;
			var offset = _props2.offset;

			var totalCount = 2 * offset + 1; // show $offset extra thumbnails on each side

			if (value < 0) {
				return 0;
			} else if (value + totalCount > images.length) {
				// Too far
				return images.length - totalCount;
			} else {
				return value;
			}
		}

		// ==============================
		// RENDERERS
		// ==============================

	}, {
		key: 'renderArrowPrev',
		value: function renderArrowPrev() {
			if (this.getFirst() <= 0) return null;

			return _react2['default'].createElement(_Arrow2['default'], {
				direction: 'left',
				size: 'small',
				icon: 'arrowLeft',
				onClick: this.gotoPrev,
				style: arrowStyles,
				title: 'Previous (Left arrow key)',
				type: 'button'
			});
		}
	}, {
		key: 'renderArrowNext',
		value: function renderArrowNext() {
			var _props3 = this.props;
			var offset = _props3.offset;
			var images = _props3.images;

			var totalCount = 2 * offset + 1;
			if (this.getFirst() + totalCount >= images.length) return null;

			return _react2['default'].createElement(_Arrow2['default'], {
				direction: 'right',
				size: 'small',
				icon: 'arrowRight',
				onClick: this.gotoNext,
				style: arrowStyles,
				title: 'Next (Right arrow key)',
				type: 'button'
			});
		}
	}, {
		key: 'render',
		value: function render() {
			var _props4 = this.props;
			var images = _props4.images;
			var currentImage = _props4.currentImage;
			var onClickThumbnail = _props4.onClickThumbnail;
			var offset = _props4.offset;

			var totalCount = 2 * offset + 1; // show $offset extra thumbnails on each side
			var thumbnails = [];
			var baseOffset = 0;
			if (images.length <= totalCount) {
				thumbnails = images;
			} else {
				// Try to center current image in list
				baseOffset = this.getFirst();
				thumbnails = images.slice(baseOffset, baseOffset + totalCount);
			}

			return _react2['default'].createElement(
				'div',
				{ className: (0, _aphroditeNoImportant.css)(classes.paginatedThumbnails) },
				this.renderArrowPrev(),
				thumbnails.map(function (img, idx) {
					return _react2['default'].createElement(_Thumbnail2['default'], _extends({ key: baseOffset + idx
					}, img, {
						index: baseOffset + idx,
						onClick: onClickThumbnail,
						active: baseOffset + idx === currentImage }));
				}),
				this.renderArrowNext()
			);
		}
	}]);

	return PaginatedThumbnails;
})(_react.Component);

exports['default'] = PaginatedThumbnails;

PaginatedThumbnails.propTypes = {
	currentImage: _propTypes2['default'].number,
	images: _propTypes2['default'].array,
	offset: _propTypes2['default'].number,
	onClickThumbnail: _propTypes2['default'].func.isRequired
};
module.exports = exports['default'];

},{"../theme":59,"./Arrow":41,"./Thumbnail":50,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],48:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

// Pass the Lightbox context through to the Portal's descendents
// StackOverflow discussion http://goo.gl/oclrJ9

var PassContext = (function (_Component) {
	_inherits(PassContext, _Component);

	function PassContext() {
		_classCallCheck(this, PassContext);

		_get(Object.getPrototypeOf(PassContext.prototype), 'constructor', this).apply(this, arguments);
	}

	_createClass(PassContext, [{
		key: 'getChildContext',
		value: function getChildContext() {
			return this.props.context;
		}
	}, {
		key: 'render',
		value: function render() {
			return _react.Children.only(this.props.children);
		}
	}]);

	return PassContext;
})(_react.Component);

PassContext.propTypes = {
	context: _propTypes2['default'].object.isRequired
};
PassContext.childContextTypes = {
	theme: _propTypes2['default'].object
};

exports['default'] = PassContext;
module.exports = exports['default'];

},{"prop-types":undefined,"react":undefined}],49:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTransitionGroupCSSTransitionGroup = require('react-transition-group/CSSTransitionGroup');

var _reactTransitionGroupCSSTransitionGroup2 = _interopRequireDefault(_reactTransitionGroupCSSTransitionGroup);

var _reactDom = require('react-dom');

var _PassContext = require('./PassContext');

var _PassContext2 = _interopRequireDefault(_PassContext);

var Portal = (function (_Component) {
	_inherits(Portal, _Component);

	function Portal() {
		_classCallCheck(this, Portal);

		_get(Object.getPrototypeOf(Portal.prototype), 'constructor', this).call(this);
		this.portalElement = null;
	}

	_createClass(Portal, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			var p = document.createElement('div');
			document.body.appendChild(p);
			this.portalElement = p;
			this.componentDidUpdate();
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			// Animate fade on mount/unmount
			var duration = 200;
			var styles = '\n\t\t\t\t.fade-enter { opacity: 0.01; }\n\t\t\t\t.fade-enter.fade-enter-active { opacity: 1; transition: opacity ' + duration + 'ms; }\n\t\t\t\t.fade-leave { opacity: 1; }\n\t\t\t\t.fade-leave.fade-leave-active { opacity: 0.01; transition: opacity ' + duration + 'ms; }\n\t\t';

			(0, _reactDom.render)(_react2['default'].createElement(
				_PassContext2['default'],
				{ context: this.context },
				_react2['default'].createElement(
					'div',
					null,
					_react2['default'].createElement(
						'style',
						null,
						styles
					),
					_react2['default'].createElement(_reactTransitionGroupCSSTransitionGroup2['default'], _extends({
						component: 'div',
						transitionName: 'fade',
						transitionEnterTimeout: duration,
						transitionLeaveTimeout: duration
					}, this.props))
				)
			), this.portalElement);
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			document.body.removeChild(this.portalElement);
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}]);

	return Portal;
})(_react.Component);

exports['default'] = Portal;

Portal.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};
module.exports = exports['default'];

},{"./PassContext":48,"prop-types":undefined,"react":undefined,"react-dom":undefined,"react-transition-group/CSSTransitionGroup":35}],50:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _theme = require('../theme');

var _theme2 = _interopRequireDefault(_theme);

var _utils = require('../utils');

function Thumbnail(_ref, _ref2) {
	var index = _ref.index;
	var src = _ref.src;
	var thumbnail = _ref.thumbnail;
	var active = _ref.active;
	var onClick = _ref.onClick;
	var theme = _ref2.theme;

	var url = thumbnail ? thumbnail : src;
	var classes = _aphroditeNoImportant.StyleSheet.create((0, _utils.deepMerge)(defaultStyles, theme));

	return _react2['default'].createElement('div', {
		className: (0, _aphroditeNoImportant.css)(classes.thumbnail, active && classes.thumbnail__active),
		onClick: function (e) {
			e.preventDefault();
			e.stopPropagation();
			onClick(index);
		},
		style: { backgroundImage: 'url("' + url + '")' }
	});
}

Thumbnail.propTypes = {
	active: _propTypes2['default'].bool,
	index: _propTypes2['default'].number,
	onClick: _propTypes2['default'].func.isRequired,
	src: _propTypes2['default'].string,
	thumbnail: _propTypes2['default'].string
};

Thumbnail.contextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var defaultStyles = {
	thumbnail: {
		backgroundPosition: 'center',
		backgroundSize: 'cover',
		borderRadius: 2,
		boxShadow: 'inset 0 0 0 1px hsla(0,0%,100%,.2)',
		cursor: 'pointer',
		display: 'inline-block',
		height: _theme2['default'].thumbnail.size,
		margin: _theme2['default'].thumbnail.gutter,
		overflow: 'hidden',
		width: _theme2['default'].thumbnail.size
	},
	thumbnail__active: {
		boxShadow: 'inset 0 0 0 2px ' + _theme2['default'].thumbnail.activeBorderColor
	}
};

exports['default'] = Thumbnail;
module.exports = exports['default'];

},{"../theme":59,"../utils":63,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _iconsPlayButton = require('../icons/playButton');

var _iconsPlayButton2 = _interopRequireDefault(_iconsPlayButton);

var MIN_SWIPE_LENGTH = 40.0;

var Video = (function (_Component) {
  _inherits(Video, _Component);

  function Video(props) {
    _classCallCheck(this, Video);

    _get(Object.getPrototypeOf(Video.prototype), 'constructor', this).call(this, props);
    this.state = { play: false };
  }

  _createClass(Video, [{
    key: 'onWrapperClick',
    value: function onWrapperClick(e) {
      e.stopPropagation();
      if (this.state.play) {
        this.refs.video_player.pause();
      } else {
        this.refs.video_player.play();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var self = this;
      var video = this.refs.video_player;

      video.addEventListener("play", function () {
        self.setState({ play: true });
      }, false);

      video.addEventListener("pause", function () {
        self.setState({ play: false });
      }, false);
    }
  }, {
    key: 'onVideoTouch',
    value: function onVideoTouch(e) {
      /**
       * track touch swipes
       */

      var self = this;

      this.touchPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      var onTouchEnd = function onTouchEnd(e) {
        self.swipeStarted = false;

        var offsetX = self.touchPos.x - e.changedTouches[0].clientX;
        var offsetY = self.touchPos.y - e.changedTouches[0].clientY;

        if (Math.abs(offsetX) > 3.0 * Math.abs(offsetY) && Math.abs(offsetX) > MIN_SWIPE_LENGTH) {
          if (offsetX < 0) {
            // swipe left
            if (self.props.onSwipeLeft) self.props.onSwipeLeft();
          } else {
            // swipe right
            if (self.props.onSwipeRight) self.props.onSwipeRight();
          }
        }

        window.removeEventListener("touchend", onTouchEnd);
      };
      window.addEventListener("touchend", onTouchEnd);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2['default'].createElement(
        'div',
        { style: { textAlign: 'center' } },
        _react2['default'].createElement(
          'div',
          { style: { position: 'relative', display: 'inline-block', maxWidth: '100vw', pointerEvents: 'auto', backgroundColor: 'black', maxHeight: 'calc(100vh - ' + this.props.heightOffset + 'px)' } },
          _react2['default'].createElement(
            'div',
            { onClick: this.onWrapperClick.bind(this),
              onTouchStart: this.onVideoTouch.bind(this),
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '90%', zIndex: 100, cursor: this.props.style.cursor ? this.props.style.cursor : 'auto' } },
            _react2['default'].createElement(_iconsPlayButton2['default'], {
              fill: '#FFFFFF',
              className: (0, _aphroditeNoImportant.css)(classes.play),
              style: { opacity: this.state.play ? 0 : 0.8 }
            })
          ),
          _react2['default'].createElement(
            'video',
            {
              ref: 'video_player',
              src: this.props.src,
              preload: this.props.preload,
              controls: true,
              className: this.props.className,
              poster: this.props.poster,
              style: this.props.style },
            _react2['default'].createElement('source', { key: this.props.src, src: this.props.src }),
            this.props.srcset.map(function (src) {
              return _react2['default'].createElement('source', { key: src, src: src });
            })
          )
        )
      );
    }
  }]);

  return Video;
})(_react.Component);

exports['default'] = Video;

Video.propTypes = {
  className: _react.PropTypes.string.isRequired,
  heightOffset: _react.PropTypes.number.isRequired,
  onSwipeLeft: _react.PropTypes.func,
  onSwipeRight: _react.PropTypes.func,
  poster: _react.PropTypes.string.isRequired,
  preload: _react.PropTypes.string,
  src: _react.PropTypes.string.isRequired,
  srcset: _react.PropTypes.array.isRequired,
  style: _react.PropTypes.object.isRequired
};

Video.defaultProps = {
  preload: "auto"
};

var classes = _aphroditeNoImportant.StyleSheet.create({
  play: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '18%',
    height: '18%',
    minWidth: 20,
    minHeight: 20,
    margin: 'auto',
    cursor: 'pointer',
    transition: 'opacity 0.3s'
  }
});
module.exports = exports['default'];

},{"../icons/playButton":57,"aphrodite/no-important":6,"react":undefined}],52:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (fill) {
	return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n\t\t<path d=\"M213.7,256L213.7,256L213.7,256L380.9,81.9c4.2-4.3,4.1-11.4-0.2-15.8l-29.9-30.6c-4.3-4.4-11.3-4.5-15.5-0.2L131.1,247.9 c-2.2,2.2-3.2,5.2-3,8.1c-0.1,3,0.9,5.9,3,8.1l204.2,212.7c4.2,4.3,11.2,4.2,15.5-0.2l29.9-30.6c4.3-4.4,4.4-11.5,0.2-15.8 L213.7,256z\"/>\n\t</svg>";
};

module.exports = exports["default"];

},{}],53:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (fill) {
	return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" xml:space=\"preserve\">\n\t\t<path d=\"M298.3,256L298.3,256L298.3,256L131.1,81.9c-4.2-4.3-4.1-11.4,0.2-15.8l29.9-30.6c4.3-4.4,11.3-4.5,15.5-0.2l204.2,212.7 c2.2,2.2,3.2,5.2,3,8.1c0.1,3-0.9,5.9-3,8.1L176.7,476.8c-4.2,4.3-11.2,4.2-15.5-0.2L131.3,446c-4.3-4.4-4.4-11.5-0.2-15.8 L298.3,256z\"/>\n\t</svg>";
};

module.exports = exports["default"];

},{}],54:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports["default"] = function (fill) {
	return "<svg fill=\"" + fill + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" width=\"100%\" height=\"100%\" viewBox=\"0 0 512 512\" style=\"enable-background:new 0 0 512 512;\" xml:space=\"preserve\">\n\t\t<path d=\"M443.6,387.1L312.4,255.4l131.5-130c5.4-5.4,5.4-14.2,0-19.6l-37.4-37.6c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4 L256,197.8L124.9,68.3c-2.6-2.6-6.1-4-9.8-4c-3.7,0-7.2,1.5-9.8,4L68,105.9c-5.4,5.4-5.4,14.2,0,19.6l131.5,130L68.4,387.1 c-2.6,2.6-4.1,6.1-4.1,9.8c0,3.7,1.4,7.2,4.1,9.8l37.4,37.6c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1L256,313.1l130.7,131.1 c2.7,2.7,6.2,4.1,9.8,4.1c3.5,0,7.1-1.3,9.8-4.1l37.4-37.6c2.6-2.6,4.1-6.1,4.1-9.8C447.7,393.2,446.2,389.7,443.6,387.1z\"/>\n\t</svg>";
};

module.exports = exports["default"];

},{}],55:[function(require,module,exports){
'use strict';

module.exports = {
	arrowLeft: require('./arrowLeft'),
	arrowRight: require('./arrowRight'),
	close: require('./close')
};

},{"./arrowLeft":52,"./arrowRight":53,"./close":54}],56:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var MinusIcon = function MinusIcon(props) {
	return _react2["default"].createElement(
		"svg",
		{
			style: props.style,
			onClick: function (e) {
				props.onClick(e);
			},
			version: "1.1",
			xmlns: "http://www.w3.org/2000/svg",
			xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", width: "100%", height: "100%", viewBox: "0 0 22 22", xmlSpace: "preserve" },
		_react2["default"].createElement(
			"title",
			null,
			props.title
		),
		_react2["default"].createElement("line", { strokeLinecap: "square", y2: "10", x2: "2", y1: "10", x1: "20", strokeWidth: "4", stroke: props.color, fill: "none" })
	);
};

MinusIcon.propTypes = {
	color: _react.PropTypes.string.isRequired,
	onClick: _react.PropTypes.func.isRequired,
	style: _react.PropTypes.object.isRequired,
	title: _react.PropTypes.string.isRequired
};

exports["default"] = MinusIcon;
module.exports = exports["default"];

},{"react":undefined}],57:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var PlayButton = function PlayButton(props) {
	return _react2["default"].createElement(
		"svg",
		{
			className: props.className,
			fill: props.fill,
			style: props.style,
			version: "1.1",
			xmlns: "http://www.w3.org/2000/svg",
			xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", viewBox: "0 0 32 32", xmlSpace: "preserve" },
		_react2["default"].createElement("path", { d: "M6 4l20 12-20 12z" })
	);
};

PlayButton.propTypes = {
	className: _react.PropTypes.string.isRequired,
	fill: _react.PropTypes.string.isRequired,
	style: _react.PropTypes.object.isRequired
};

exports["default"] = PlayButton;
module.exports = exports["default"];

},{"react":undefined}],58:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var PlusIcon = function PlusIcon(props) {
	return _react2["default"].createElement(
		"svg",
		{
			style: props.style,
			onClick: function (e) {
				props.onClick(e);
			},
			version: "1.1",
			xmlns: "http://www.w3.org/2000/svg",
			xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", width: "100%", height: "100%", viewBox: "0 0 22 22", xmlSpace: "preserve" },
		_react2["default"].createElement(
			"title",
			null,
			props.title
		),
		_react2["default"].createElement(
			"g",
			null,
			_react2["default"].createElement("line", { strokeLinecap: "square", y2: "10", x2: "3", y1: "10", x1: "20", strokeWidth: "4", stroke: props.color, fill: "none" }),
			_react2["default"].createElement("line", { strokeLinecap: "square", y2: "0", x2: "11.5", y1: "18", x1: "11.5", strokeWidth: "4", stroke: props.color, fill: "none" })
		)
	);
};

PlusIcon.propTypes = {
	color: _react.PropTypes.string.isRequired,
	onClick: _react.PropTypes.func.isRequired,
	style: _react.PropTypes.object.isRequired,
	title: _react.PropTypes.string.isRequired
};

exports["default"] = PlusIcon;
module.exports = exports["default"];

},{"react":undefined}],59:[function(require,module,exports){
// ==============================
// THEME
// ==============================

'use strict';

var theme = {};

// container
theme.container = {
	background: 'rgba(0, 0, 0, 0.8)',
	gutter: {
		horizontal: 10,
		vertical: 10
	},
	zIndex: 2001
};

// header
theme.header = {
	height: 10
};
theme.close = {
	fill: 'white'
};

// footer
theme.footer = {
	color: 'white',
	count: {
		color: 'rgba(255, 255, 255, 0.75)',
		fontSize: '0.85em'
	},
	height: 40,
	gutter: {
		horizontal: 0,
		vertical: 5
	}
};

// thumbnails
theme.thumbnail = {
	activeBorderColor: 'white',
	size: 50,
	gutter: 2
};

// arrow
theme.arrow = {
	background: 'rgba(0,0,0,0.2)',
	fill: 'white',
	height: 80,
	zIndex: 200
};

module.exports = theme;

},{}],60:[function(require,module,exports){
/**
	Bind multiple component methods:

	* @param {this} context
	* @param {Array} functions

	constructor() {
		...
		bindFunctions.call(this, ['handleClick', 'handleOther']);
	}
*/

"use strict";

module.exports = function bindFunctions(functions) {
	var _this = this;

	functions.forEach(function (f) {
		return _this[f] = _this[f].bind(_this);
	});
};

},{}],61:[function(require,module,exports){
// Return true if window + document

'use strict';

module.exports = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

},{}],62:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function deepMerge(target) {
	var source = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	var extended = _extends({}, target);

	Object.keys(source).forEach(function (key) {
		if (typeof source[key] !== 'object' || !source[key]) {
			extended[key] = source[key];
		} else {
			if (!target[key]) {
				extended[key] = source[key];
			} else {
				extended[key] = deepMerge(target[key], source[key]);
			}
		}
	});

	return extended;
}

module.exports = deepMerge;

},{}],63:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bindFunctions = require('./bindFunctions');

var _bindFunctions2 = _interopRequireDefault(_bindFunctions);

var _canUseDom = require('./canUseDom');

var _canUseDom2 = _interopRequireDefault(_canUseDom);

var _deepMerge = require('./deepMerge');

var _deepMerge2 = _interopRequireDefault(_deepMerge);

module.exports = {
	bindFunctions: _bindFunctions2['default'],
	canUseDom: _canUseDom2['default'],
	deepMerge: _deepMerge2['default']
};

},{"./bindFunctions":60,"./canUseDom":61,"./deepMerge":62}],"react-images":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _aphroditeNoImportant = require('aphrodite/no-important');

var _reactScrolllock = require('react-scrolllock');

var _reactScrolllock2 = _interopRequireDefault(_reactScrolllock);

var _theme = require('./theme');

var _theme2 = _interopRequireDefault(_theme);

var _componentsArrow = require('./components/Arrow');

var _componentsArrow2 = _interopRequireDefault(_componentsArrow);

var _componentsContainer = require('./components/Container');

var _componentsContainer2 = _interopRequireDefault(_componentsContainer);

var _componentsFooter = require('./components/Footer');

var _componentsFooter2 = _interopRequireDefault(_componentsFooter);

var _componentsHeader = require('./components/Header');

var _componentsHeader2 = _interopRequireDefault(_componentsHeader);

var _componentsPaginatedThumbnails = require('./components/PaginatedThumbnails');

var _componentsPaginatedThumbnails2 = _interopRequireDefault(_componentsPaginatedThumbnails);

var _componentsPortal = require('./components/Portal');

var _componentsPortal2 = _interopRequireDefault(_componentsPortal);

var _componentsVideo = require('./components/Video');

var _componentsVideo2 = _interopRequireDefault(_componentsVideo);

var _componentsImage = require('./components/Image');

var _componentsImage2 = _interopRequireDefault(_componentsImage);

var _utils = require('./utils');

var Lightbox = (function (_Component) {
	_inherits(Lightbox, _Component);

	function Lightbox(props) {
		_classCallCheck(this, Lightbox);

		_get(Object.getPrototypeOf(Lightbox.prototype), 'constructor', this).call(this, props);
		this.theme = (0, _utils.deepMerge)(_theme2['default'], props.theme);
		_utils.bindFunctions.call(this, ['gotoNext', 'gotoPrev', 'closeBackdrop', 'handleKeyboardInput']);
	}

	_createClass(Lightbox, [{
		key: 'getChildContext',
		value: function getChildContext() {
			return {
				theme: this.theme
			};
		}
	}, {
		key: 'componentDidMount',
		value: function componentDidMount() {
			var _this = this;

			if (this.props.isOpen && this.props.enableKeyboardInput) {
				window.addEventListener('keydown', this.handleKeyboardInput);
			}

			if (this.props.onLightboxReady) {
				setTimeout(function () {
					_this.props.onLightboxReady();
				}, 0);
			}
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (!_utils.canUseDom) return;

			// preload images
			if (nextProps.preloadNextImage) {
				var currentIndex = this.props.currentImage;
				var nextIndex = nextProps.currentImage + 1;
				var prevIndex = nextProps.currentImage - 1;
				var preloadIndex = undefined;

				if (currentIndex && nextProps.currentImage > currentIndex) {
					preloadIndex = nextIndex;
				} else if (currentIndex && nextProps.currentImage < currentIndex) {
					preloadIndex = prevIndex;
				}

				// if we know the user's direction just get one image
				// otherwise, to be safe, we need to grab one in each direction
				if (preloadIndex) {
					this.preloadImage(preloadIndex);
				} else {
					this.preloadImage(prevIndex);
					this.preloadImage(nextIndex);
				}
			}

			// add/remove event listeners
			if (!this.props.isOpen && nextProps.isOpen && nextProps.enableKeyboardInput) {
				window.addEventListener('keydown', this.handleKeyboardInput);
			}
			if (!nextProps.isOpen && nextProps.enableKeyboardInput) {
				window.removeEventListener('keydown', this.handleKeyboardInput);
			}
		}
	}, {
		key: 'componentDidUpdate',
		value: function componentDidUpdate() {
			var _this2 = this;

			if (this.props.onLightboxReady) {
				setTimeout(function () {
					_this2.props.onLightboxReady();
				}, 0);
			}
		}
	}, {
		key: 'componentWillUnmount',
		value: function componentWillUnmount() {
			if (this.props.enableKeyboardInput) {
				window.removeEventListener('keydown', this.handleKeyboardInput);
			}
		}

		// ==============================
		// METHODS
		// ==============================

	}, {
		key: 'preloadImage',
		value: function preloadImage(idx) {
			var image = this.props.images[idx];

			if (!image) return;

			var img = new _componentsImage2['default']();

			img.src = image.src;

			if (image.srcset) {
				img.srcset = image.srcset.join();
			}
		}
	}, {
		key: 'gotoNext',
		value: function gotoNext(event) {
			// console.log('gotoNext');
			if (this.props.currentImage === this.props.images.length - 1) return;
			if (event) {
				// console.log('eeee', event);
				event.preventDefault();
				event.stopPropagation();
			}
			this.props.onClickNext();
		}
	}, {
		key: 'gotoPrev',
		value: function gotoPrev(event) {
			if (this.props.currentImage === 0) return;
			if (event) {
				event.preventDefault();
				event.stopPropagation();
			}
			this.props.onClickPrev();
		}
	}, {
		key: 'closeBackdrop',
		value: function closeBackdrop(event) {
			if (event.target.id === 'lightboxBackdrop') {
				this.props.onClose();
			}
		}
	}, {
		key: 'handleKeyboardInput',
		value: function handleKeyboardInput(event) {
			if (event.keyCode === 37) {
				// left
				this.gotoPrev(event);
				return true;
			} else if (event.keyCode === 39) {
				// right
				this.gotoNext(event);
				return true;
			} else if (event.keyCode === 27) {
				// esc
				this.props.onClose();
				return true;
			}
			return false;
		}

		// ==============================
		// RENDERERS
		// ==============================

	}, {
		key: 'renderArrowPrev',
		value: function renderArrowPrev() {
			if (this.props.currentImage === 0) return null;

			return _react2['default'].createElement(_componentsArrow2['default'], {
				direction: 'left',
				icon: 'arrowLeft',
				onClick: this.gotoPrev,
				title: this.props.leftArrowTitle,
				type: 'button'
			});
		}
	}, {
		key: 'renderArrowNext',
		value: function renderArrowNext() {
			if (this.props.currentImage === this.props.images.length - 1) return null;

			return _react2['default'].createElement(_componentsArrow2['default'], {
				direction: 'right',
				icon: 'arrowRight',
				onClick: this.gotoNext,
				title: this.props.rightArrowTitle,
				type: 'button'
			});
		}
	}, {
		key: 'renderDialog',
		value: function renderDialog() {
			var _props = this.props;
			var backdropClosesModal = _props.backdropClosesModal;
			var customControls = _props.customControls;
			var isOpen = _props.isOpen;
			var onClose = _props.onClose;
			var showCloseButton = _props.showCloseButton;
			var showThumbnails = _props.showThumbnails;
			var width = _props.width;

			if (!isOpen) return _react2['default'].createElement('span', { key: 'closed' });

			var offsetThumbnails = 0;
			if (showThumbnails) {
				offsetThumbnails = this.theme.thumbnail.size + this.theme.container.gutter.vertical;
			}

			return _react2['default'].createElement(
				_componentsContainer2['default'],
				{
					key: 'open',
					onClick: !!backdropClosesModal && this.closeBackdrop,
					onTouchEnd: !!backdropClosesModal && this.closeBackdrop
				},
				_react2['default'].createElement(
					'div',
					{ className: (0, _aphroditeNoImportant.css)(classes.content), style: { marginBottom: offsetThumbnails, maxWidth: width } },
					_react2['default'].createElement(_componentsHeader2['default'], {
						customControls: customControls,
						onClose: onClose,
						showCloseButton: showCloseButton,
						closeButtonTitle: this.props.closeButtonTitle
					}),
					this.renderImages(),
					this.renderArrowPrev(),
					this.renderArrowNext()
				),
				_react2['default'].createElement(_reactScrolllock2['default'], null)
			);
		}
	}, {
		key: 'renderImages',
		value: function renderImages() {
			var _props2 = this.props;
			var currentImage = _props2.currentImage;
			var images = _props2.images;
			var imageCountSeparator = _props2.imageCountSeparator;
			var onClickImage = _props2.onClickImage;
			var showImageCount = _props2.showImageCount;
			var showThumbnails = _props2.showThumbnails;

			if (!images || !images.length) return null;

			var image = images[currentImage];

			var thumbnailsSize = showThumbnails ? this.theme.thumbnail.size : 0;
			var heightOffset = this.theme.header.height + this.theme.footer.height + thumbnailsSize + this.theme.container.gutter.vertical;
			var renderImageOrVideo = undefined;

			if (!image.srcset) image.srcset = [];

			if (image.src && image.src.toLowerCase().lastIndexOf('.mp4') > -1) {
				renderImageOrVideo = _react2['default'].createElement(_componentsVideo2['default'], {
					src: image.src,
					className: (0, _aphroditeNoImportant.css)(classes.image),
					poster: image.thumbnail,
					heightOffset: heightOffset,
					onSwipeLeft: this.gotoPrev.bind(this),
					onSwipeRight: this.gotoNext.bind(this),
					style: {
						cursor: 'pointer',
						maxHeight: 'calc(100vh - ' + heightOffset + 'px)'
					},
					srcset: image.srcset });
			} else {
				var srcset = undefined;
				var sizes = undefined;

				if (image.srcset) {
					srcset = image.srcset.join();
					sizes = '100vw';
				}
				renderImageOrVideo = _react2['default'].createElement(_componentsImage2['default'], {
					className: (0, _aphroditeNoImportant.css)(classes.image),
					onClick: !!onClickImage && onClickImage,
					sizes: sizes,
					alt: image.alt,
					src: image.src,
					srcSet: srcset,
					heightOffset: heightOffset,
					onSwipeLeft: this.gotoPrev.bind(this),
					onSwipeRight: this.gotoNext.bind(this),
					style: {
						cursor: this.props.onClickImage ? 'pointer' : 'auto',
						maxHeight: 'calc(100vh - ' + heightOffset + 'px)'
					}
				});
			}
			return _react2['default'].createElement(
				'figure',
				{ className: (0, _aphroditeNoImportant.css)(classes.figure) },
				renderImageOrVideo,
				_react2['default'].createElement(_componentsFooter2['default'], {
					caption: images[currentImage].caption,
					countCurrent: currentImage + 1,
					countSeparator: imageCountSeparator,
					countTotal: images.length,
					showCount: showImageCount
				}),
				this.props.bottomControls ? this.props.bottomControls : null
			);
		}

		/*renderThumbnails () {
  	const { images, currentImage, onClickThumbnail, showThumbnails, thumbnailOffset } = this.props;
  		if (!showThumbnails) return;
  		return (
  		<PaginatedThumbnails
  			currentImage={currentImage}
  			images={images}
  			offset={thumbnailOffset}
  			onClickThumbnail={onClickThumbnail}
  		/>
  	);
  }*/
	}, {
		key: 'render',
		value: function render() {
			return _react2['default'].createElement(
				_componentsPortal2['default'],
				null,
				this.renderDialog()
			);
		}
	}]);

	return Lightbox;
})(_react.Component);

Lightbox.propTypes = {
	backdropClosesModal: _propTypes2['default'].bool,
	bottomControls: _propTypes2['default'].arrayOf(_propTypes2['default'].node),
	closeButtonTitle: _propTypes2['default'].string,
	currentImage: _propTypes2['default'].number,
	customControls: _propTypes2['default'].arrayOf(_propTypes2['default'].node),
	enableKeyboardInput: _propTypes2['default'].bool,
	imageCountSeparator: _propTypes2['default'].string,
	images: _propTypes2['default'].arrayOf(_propTypes2['default'].shape({
		src: _propTypes2['default'].string.isRequired,
		srcset: _propTypes2['default'].array,
		caption: _propTypes2['default'].oneOfType([_propTypes2['default'].string, _propTypes2['default'].element]),
		thumbnail: _propTypes2['default'].string
	})).isRequired,
	isOpen: _propTypes2['default'].bool,
	leftArrowTitle: _propTypes2['default'].string,
	onClickImage: _propTypes2['default'].func,
	onClickNext: _propTypes2['default'].func,
	onClickPrev: _propTypes2['default'].func,
	onClose: _propTypes2['default'].func.isRequired,
	onLightboxReady: _propTypes2['default'].func,
	preloadNextImage: _propTypes2['default'].bool,
	rightArrowTitle: _propTypes2['default'].string,
	showCloseButton: _propTypes2['default'].bool,
	showImageCount: _propTypes2['default'].bool,
	showThumbnails: _propTypes2['default'].bool,
	theme: _propTypes2['default'].object,
	thumbnailOffset: _propTypes2['default'].number,
	width: _propTypes2['default'].number
};
Lightbox.defaultProps = {
	closeButtonTitle: 'Close (Esc)',
	currentImage: 0,
	enableKeyboardInput: true,
	imageCountSeparator: ' of ',
	leftArrowTitle: 'Previous (Left arrow key)',
	onClickShowNextImage: true,
	preloadNextImage: true,
	rightArrowTitle: 'Next (Right arrow key)',
	showCloseButton: true,
	showImageCount: true,
	theme: {},
	thumbnailOffset: 2,
	width: 1024
};
Lightbox.childContextTypes = {
	theme: _propTypes2['default'].object.isRequired
};

var classes = _aphroditeNoImportant.StyleSheet.create({
	content: {
		position: 'relative'
	},
	figure: {
		margin: 0, // remove browser default
		maxWidth: '100vw'
	},
	image: {
		display: 'block', // removes browser default gutter
		height: 'auto',
		margin: '0 auto', // maintain center on very short screens OR very narrow image
		maxWidth: '100%',

		// disable user select
		WebkitTouchCallout: 'none',
		userSelect: 'none'
	}
});

exports['default'] = Lightbox;
module.exports = exports['default'];

},{"./components/Arrow":41,"./components/Container":42,"./components/Footer":43,"./components/Header":44,"./components/Image":46,"./components/PaginatedThumbnails":47,"./components/Portal":49,"./components/Video":51,"./theme":59,"./utils":63,"aphrodite/no-important":6,"prop-types":undefined,"react":undefined,"react-scrolllock":undefined}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXBocm9kaXRlL2xpYi9nZW5lcmF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9hcGhyb2RpdGUvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2FwaHJvZGl0ZS9saWIvaW5qZWN0LmpzIiwibm9kZV9tb2R1bGVzL2FwaHJvZGl0ZS9saWIvbm8taW1wb3J0YW50LmpzIiwibm9kZV9tb2R1bGVzL2FwaHJvZGl0ZS9saWIvdXRpbC5qcyIsIm5vZGVfbW9kdWxlcy9hcGhyb2RpdGUvbm8taW1wb3J0YW50LmpzIiwibm9kZV9tb2R1bGVzL2FzYXAvYnJvd3Nlci1hc2FwLmpzIiwibm9kZV9tb2R1bGVzL2FzYXAvYnJvd3Nlci1yYXcuanMiLCJub2RlX21vZHVsZXMvY2hhaW4tZnVuY3Rpb24vaW5kZXguanMiLCJub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvY2xhc3MvYWRkQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvY2xhc3MvaGFzQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvY2xhc3MvcmVtb3ZlQ2xhc3MuanMiLCJub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvdHJhbnNpdGlvbi9wcm9wZXJ0aWVzLmpzIiwibm9kZV9tb2R1bGVzL2RvbS1oZWxwZXJzL3V0aWwvaW5ET00uanMiLCJub2RlX21vZHVsZXMvZG9tLWhlbHBlcnMvdXRpbC9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuanMiLCJub2RlX21vZHVsZXMvaHlwaGVuYXRlLXN0eWxlLW5hbWUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXByZWZpeGVyL2xpYi9zdGF0aWMvcGx1Z2lucy9jYWxjLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvc3RhdGljL3BsdWdpbnMvY3Vyc29yLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvc3RhdGljL3BsdWdpbnMvZmxleC5qcyIsIm5vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcHJlZml4ZXIvbGliL3N0YXRpYy9wbHVnaW5zL2ZsZXhib3hJRS5qcyIsIm5vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcHJlZml4ZXIvbGliL3N0YXRpYy9wbHVnaW5zL2ZsZXhib3hPbGQuanMiLCJub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXByZWZpeGVyL2xpYi9zdGF0aWMvcGx1Z2lucy9ncmFkaWVudC5qcyIsIm5vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcHJlZml4ZXIvbGliL3N0YXRpYy9wbHVnaW5zL3Bvc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvc3RhdGljL3BsdWdpbnMvc2l6aW5nLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvc3RhdGljL3BsdWdpbnMvdHJhbnNpdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcHJlZml4ZXIvbGliL3N0YXRpYy9wcmVmaXhBbGwuanMiLCJub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXByZWZpeGVyL2xpYi9zdGF0aWMvcHJlZml4UHJvcHMuanMiLCJub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXByZWZpeGVyL2xpYi91dGlscy9jYXBpdGFsaXplU3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvdXRpbHMvaXNQcmVmaXhlZFByb3BlcnR5LmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvdXRpbHMvaXNQcmVmaXhlZFZhbHVlLmpzIiwibm9kZV9tb2R1bGVzL2lubGluZS1zdHlsZS1wcmVmaXhlci9saWIvdXRpbHMvam9pblByZWZpeGVkVmFsdWUuanMiLCJub2RlX21vZHVsZXMvaW5saW5lLXN0eWxlLXByZWZpeGVyL2xpYi91dGlscy9zb3J0UHJlZml4ZWRTdHlsZS5qcyIsIm5vZGVfbW9kdWxlcy9pbmxpbmUtc3R5bGUtcHJlZml4ZXIvc3RhdGljLmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC10cmFuc2l0aW9uLWdyb3VwL0NTU1RyYW5zaXRpb25Hcm91cC5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC10cmFuc2l0aW9uLWdyb3VwL0NTU1RyYW5zaXRpb25Hcm91cENoaWxkLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LXRyYW5zaXRpb24tZ3JvdXAvVHJhbnNpdGlvbkdyb3VwLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LXRyYW5zaXRpb24tZ3JvdXAvdXRpbHMvQ2hpbGRNYXBwaW5nLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0LXRyYW5zaXRpb24tZ3JvdXAvdXRpbHMvUHJvcFR5cGVzLmpzIiwibm9kZV9tb2R1bGVzL3dhcm5pbmcvYnJvd3Nlci5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy9jb21wb25lbnRzL0Fycm93LmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvQ29udGFpbmVyLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvRm9vdGVyLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvSGVhZGVyLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvSWNvbi5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy9jb21wb25lbnRzL0ltYWdlLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvUGFnaW5hdGVkVGh1bWJuYWlscy5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy9jb21wb25lbnRzL1Bhc3NDb250ZXh0LmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvUG9ydGFsLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvVGh1bWJuYWlsLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2NvbXBvbmVudHMvVmlkZW8uanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvaWNvbnMvYXJyb3dMZWZ0LmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL2ljb25zL2Fycm93UmlnaHQuanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvaWNvbnMvY2xvc2UuanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvaWNvbnMvaW5kZXguanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvaWNvbnMvbWludXMuanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvaWNvbnMvcGxheUJ1dHRvbi5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy9pY29ucy9wbHVzLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL3RoZW1lLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL3V0aWxzL2JpbmRGdW5jdGlvbnMuanMiLCIvVXNlcnMvQWxleE1DL2lzLXByb2plY3RzL3hvZXllL3JlYWN0LWltYWdlcy9zcmMvdXRpbHMvY2FuVXNlRG9tLmpzIiwiL1VzZXJzL0FsZXhNQy9pcy1wcm9qZWN0cy94b2V5ZS9yZWFjdC1pbWFnZXMvc3JjL3V0aWxzL2RlZXBNZXJnZS5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy91dGlscy9pbmRleC5qcyIsIi9Vc2Vycy9BbGV4TUMvaXMtcHJvamVjdHMveG9leWUvcmVhY3QtaW1hZ2VzL3NyYy9MaWdodGJveC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hPQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDVCxVQUFRLEVBQUUsT0FBTztFQUNqQjtBQUNELE1BQUssRUFBRTtBQUNOLFNBQU8sRUFBRSxPQUFPO0FBQ2hCLFFBQU0sRUFBRSxNQUFNO0FBQ2QsUUFBTSxFQUFFLFFBQVE7QUFDaEIsVUFBUSxFQUFFLE1BQU07OztBQUdoQixvQkFBa0IsRUFBRSxNQUFNO0FBQzFCLFlBQVUsRUFBRSxNQUFNO0VBQ2xCO0NBQ0QsQ0FBQyxDQUFDOztxQkFHWSxRQUFRIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbJ3JldHVybiddKSBfaVsncmV0dXJuJ10oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZScpOyB9IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9pbmxpbmVTdHlsZVByZWZpeGVyU3RhdGljID0gcmVxdWlyZSgnaW5saW5lLXN0eWxlLXByZWZpeGVyL3N0YXRpYycpO1xuXG52YXIgX2lubGluZVN0eWxlUHJlZml4ZXJTdGF0aWMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaW5saW5lU3R5bGVQcmVmaXhlclN0YXRpYyk7XG5cbnZhciBfdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4vKipcbiAqIEdlbmVyYXRlIENTUyBmb3IgYSBzZWxlY3RvciBhbmQgc29tZSBzdHlsZXMuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBoYW5kbGVzIHRoZSBtZWRpYSBxdWVyaWVzLCBwc2V1ZG8gc2VsZWN0b3JzLCBhbmQgZGVzY2VuZGFudFxuICogc3R5bGVzIHRoYXQgY2FuIGJlIHVzZWQgaW4gYXBocm9kaXRlIHN0eWxlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3I6IEEgYmFzZSBDU1Mgc2VsZWN0b3IgZm9yIHRoZSBzdHlsZXMgdG8gYmUgZ2VuZXJhdGVkXG4gKiAgICAgd2l0aC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzdHlsZVR5cGVzOiBBIGxpc3Qgb2YgcHJvcGVydGllcyBvZiB0aGUgcmV0dXJuIHR5cGUgb2ZcbiAqICAgICBTdHlsZVNoZWV0LmNyZWF0ZSwgZS5nLiBbc3R5bGVzLnJlZCwgc3R5bGVzLmJsdWVdLlxuICogQHBhcmFtIHN0cmluZ0hhbmRsZXJzOiBTZWUgYGdlbmVyYXRlQ1NTUnVsZXNldGBcbiAqIEBwYXJhbSB1c2VJbXBvcnRhbnQ6IFNlZSBgZ2VuZXJhdGVDU1NSdWxlc2V0YFxuICpcbiAqIFRvIGFjdHVhbGx5IGdlbmVyYXRlIHRoZSBDU1Mgc3BlY2lhbC1jb25zdHJ1Y3QtbGVzcyBzdHlsZXMgYXJlIHBhc3NlZCB0b1xuICogYGdlbmVyYXRlQ1NTUnVsZXNldGAuXG4gKlxuICogRm9yIGluc3RhbmNlLCBhIGNhbGwgdG9cbiAqXG4gKiAgICAgZ2VuZXJhdGVDU1NJbm5lcihcIi5mb29cIiwge1xuICogICAgICAgY29sb3I6IFwicmVkXCIsXG4gKiAgICAgICBcIkBtZWRpYSBzY3JlZW5cIjoge1xuICogICAgICAgICBoZWlnaHQ6IDIwLFxuICogICAgICAgICBcIjpob3ZlclwiOiB7XG4gKiAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcImJsYWNrXCJcbiAqICAgICAgICAgfVxuICogICAgICAgfSxcbiAqICAgICAgIFwiOmFjdGl2ZVwiOiB7XG4gKiAgICAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICogICAgICAgICBcIj4+YmFyXCI6IHtcbiAqICAgICAgICAgICBfbmFtZXM6IHsgXCJmb29fYmFyXCI6IHRydWUgfSxcbiAqICAgICAgICAgICBoZWlnaHQ6IDEwLFxuICogICAgICAgICB9XG4gKiAgICAgICB9XG4gKiAgICAgfSk7XG4gKlxuICogd2lsbCBtYWtlIDUgY2FsbHMgdG8gYGdlbmVyYXRlQ1NTUnVsZXNldGA6XG4gKlxuICogICAgIGdlbmVyYXRlQ1NTUnVsZXNldChcIi5mb29cIiwgeyBjb2xvcjogXCJyZWRcIiB9LCAuLi4pXG4gKiAgICAgZ2VuZXJhdGVDU1NSdWxlc2V0KFwiLmZvbzphY3RpdmVcIiwgeyBmb250V2VpZ2h0OiBcImJvbGRcIiB9LCAuLi4pXG4gKiAgICAgZ2VuZXJhdGVDU1NSdWxlc2V0KFwiLmZvbzphY3RpdmUgLmZvb19iYXJcIiwgeyBoZWlnaHQ6IDEwIH0sIC4uLilcbiAqICAgICAvLyBUaGVzZSAyIHdpbGwgYmUgd3JhcHBlZCBpbiBAbWVkaWEgc2NyZWVuIHt9XG4gKiAgICAgZ2VuZXJhdGVDU1NSdWxlc2V0KFwiLmZvb1wiLCB7IGhlaWdodDogMjAgfSwgLi4uKVxuICogICAgIGdlbmVyYXRlQ1NTUnVsZXNldChcIi5mb286aG92ZXJcIiwgeyBiYWNrZ3JvdW5kQ29sb3I6IFwiYmxhY2tcIiB9LCAuLi4pXG4gKi9cbnZhciBnZW5lcmF0ZUNTUyA9IGZ1bmN0aW9uIGdlbmVyYXRlQ1NTKHNlbGVjdG9yLCBzdHlsZVR5cGVzLCBzdHJpbmdIYW5kbGVycywgdXNlSW1wb3J0YW50KSB7XG4gICAgdmFyIG1lcmdlZCA9IHN0eWxlVHlwZXMucmVkdWNlKF91dGlsLnJlY3Vyc2l2ZU1lcmdlKTtcblxuICAgIHZhciBkZWNsYXJhdGlvbnMgPSB7fTtcbiAgICB2YXIgbWVkaWFRdWVyaWVzID0ge307XG4gICAgdmFyIHBzZXVkb1N0eWxlcyA9IHt9O1xuXG4gICAgT2JqZWN0LmtleXMobWVyZ2VkKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaWYgKGtleVswXSA9PT0gJzonKSB7XG4gICAgICAgICAgICBwc2V1ZG9TdHlsZXNba2V5XSA9IG1lcmdlZFtrZXldO1xuICAgICAgICB9IGVsc2UgaWYgKGtleVswXSA9PT0gJ0AnKSB7XG4gICAgICAgICAgICBtZWRpYVF1ZXJpZXNba2V5XSA9IG1lcmdlZFtrZXldO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVjbGFyYXRpb25zW2tleV0gPSBtZXJnZWRba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGdlbmVyYXRlQ1NTUnVsZXNldChzZWxlY3RvciwgZGVjbGFyYXRpb25zLCBzdHJpbmdIYW5kbGVycywgdXNlSW1wb3J0YW50KSArIE9iamVjdC5rZXlzKHBzZXVkb1N0eWxlcykubWFwKGZ1bmN0aW9uIChwc2V1ZG9TZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVDU1NSdWxlc2V0KHNlbGVjdG9yICsgcHNldWRvU2VsZWN0b3IsIHBzZXVkb1N0eWxlc1twc2V1ZG9TZWxlY3Rvcl0sIHN0cmluZ0hhbmRsZXJzLCB1c2VJbXBvcnRhbnQpO1xuICAgIH0pLmpvaW4oXCJcIikgKyBPYmplY3Qua2V5cyhtZWRpYVF1ZXJpZXMpLm1hcChmdW5jdGlvbiAobWVkaWFRdWVyeSkge1xuICAgICAgICB2YXIgcnVsZXNldCA9IGdlbmVyYXRlQ1NTKHNlbGVjdG9yLCBbbWVkaWFRdWVyaWVzW21lZGlhUXVlcnldXSwgc3RyaW5nSGFuZGxlcnMsIHVzZUltcG9ydGFudCk7XG4gICAgICAgIHJldHVybiBtZWRpYVF1ZXJ5ICsgJ3snICsgcnVsZXNldCArICd9JztcbiAgICB9KS5qb2luKFwiXCIpO1xufTtcblxuZXhwb3J0cy5nZW5lcmF0ZUNTUyA9IGdlbmVyYXRlQ1NTO1xuLyoqXG4gKiBIZWxwZXIgbWV0aG9kIG9mIGdlbmVyYXRlQ1NTUnVsZXNldCB0byBmYWNpbGl0YXRlIGN1c3RvbSBoYW5kbGluZyBvZiBjZXJ0YWluXG4gKiBDU1MgcHJvcGVydGllcy4gVXNlZCBmb3IgZS5nLiBmb250IGZhbWlsaWVzLlxuICpcbiAqIFNlZSBnZW5lcmF0ZUNTU1J1bGVzZXQgZm9yIHVzYWdlIGFuZCBkb2N1bWVudGF0aW9uIG9mIHBhcmFtYXRlciB0eXBlcy5cbiAqL1xudmFyIHJ1blN0cmluZ0hhbmRsZXJzID0gZnVuY3Rpb24gcnVuU3RyaW5nSGFuZGxlcnMoZGVjbGFyYXRpb25zLCBzdHJpbmdIYW5kbGVycykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKGRlY2xhcmF0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIC8vIElmIGEgaGFuZGxlciBleGlzdHMgZm9yIHRoaXMgcGFydGljdWxhciBrZXksIGxldCBpdCBpbnRlcnByZXRcbiAgICAgICAgLy8gdGhhdCB2YWx1ZSBmaXJzdCBiZWZvcmUgY29udGludWluZ1xuICAgICAgICBpZiAoc3RyaW5nSGFuZGxlcnMgJiYgc3RyaW5nSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBzdHJpbmdIYW5kbGVyc1trZXldKGRlY2xhcmF0aW9uc1trZXldKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gZGVjbGFyYXRpb25zW2tleV07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgQ1NTIHJ1bGVzZXQgd2l0aCB0aGUgc2VsZWN0b3IgYW5kIGNvbnRhaW5pbmcgdGhlIGRlY2xhcmF0aW9ucy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGFzc3VtZXMgdGhhdCB0aGUgZ2l2ZW4gZGVjbGFyYXRpb25zIGRvbid0IGNvbnRhaW4gYW55IHNwZWNpYWxcbiAqIGNoaWxkcmVuIChzdWNoIGFzIG1lZGlhIHF1ZXJpZXMsIHBzZXVkby1zZWxlY3RvcnMsIG9yIGRlc2NlbmRhbnQgc3R5bGVzKS5cbiAqXG4gKiBOb3RlIHRoYXQgdGhpcyBtZXRob2QgZG9lcyBub3QgZGVhbCB3aXRoIG5lc3RpbmcgdXNlZCBmb3IgZS5nLlxuICogcHN1ZWRvLXNlbGVjdG9ycyBvciBtZWRpYSBxdWVyaWVzLiBUaGF0IHJlc3BvbnNpYmlsaXR5IGlzIGxlZnQgdG8gIHRoZVxuICogYGdlbmVyYXRlQ1NTYCBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3I6IHRoZSBzZWxlY3RvciBhc3NvY2lhdGVkIHdpdGggdGhlIHJ1bGVzZXRcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZWNsYXJhdGlvbnM6IGEgbWFwIGZyb20gY2FtZWxDYXNlZCBDU1MgcHJvcGVydHkgbmFtZSB0byBDU1NcbiAqICAgICBwcm9wZXJ0eSB2YWx1ZS5cbiAqIEBwYXJhbSB7T2JqZWN0LjxzdHJpbmcsIGZ1bmN0aW9uPn0gc3RyaW5nSGFuZGxlcnM6IGEgbWFwIGZyb20gY2FtZWxDYXNlZCBDU1NcbiAqICAgICBwcm9wZXJ0eSBuYW1lIHRvIGEgZnVuY3Rpb24gd2hpY2ggd2lsbCBtYXAgdGhlIGdpdmVuIHZhbHVlIHRvIHRoZSB2YWx1ZVxuICogICAgIHRoYXQgaXMgb3V0cHV0LlxuICogQHBhcmFtIHtib29sfSB1c2VJbXBvcnRhbnQ6IEEgYm9vbGVhbiBzYXlpbmcgd2hldGhlciB0byBhcHBlbmQgXCIhaW1wb3J0YW50XCJcbiAqICAgICB0byBlYWNoIG9mIHRoZSBDU1MgZGVjbGFyYXRpb25zLlxuICogQHJldHVybnMge3N0cmluZ30gQSBzdHJpbmcgb2YgcmF3IENTUy5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICBnZW5lcmF0ZUNTU1J1bGVzZXQoXCIuYmxhaFwiLCB7IGNvbG9yOiBcInJlZFwiIH0pXG4gKiAgICAtPiBcIi5ibGFoe2NvbG9yOiByZWQgIWltcG9ydGFudDt9XCJcbiAqICAgIGdlbmVyYXRlQ1NTUnVsZXNldChcIi5ibGFoXCIsIHsgY29sb3I6IFwicmVkXCIgfSwge30sIGZhbHNlKVxuICogICAgLT4gXCIuYmxhaHtjb2xvcjogcmVkfVwiXG4gKiAgICBnZW5lcmF0ZUNTU1J1bGVzZXQoXCIuYmxhaFwiLCB7IGNvbG9yOiBcInJlZFwiIH0sIHtjb2xvcjogYyA9PiBjLnRvVXBwZXJDYXNlfSlcbiAqICAgIC0+IFwiLmJsYWh7Y29sb3I6IFJFRH1cIlxuICogICAgZ2VuZXJhdGVDU1NSdWxlc2V0KFwiLmJsYWg6aG92ZXJcIiwgeyBjb2xvcjogXCJyZWRcIiB9KVxuICogICAgLT4gXCIuYmxhaDpob3Zlcntjb2xvcjogcmVkfVwiXG4gKi9cbnZhciBnZW5lcmF0ZUNTU1J1bGVzZXQgPSBmdW5jdGlvbiBnZW5lcmF0ZUNTU1J1bGVzZXQoc2VsZWN0b3IsIGRlY2xhcmF0aW9ucywgc3RyaW5nSGFuZGxlcnMsIHVzZUltcG9ydGFudCkge1xuICAgIHZhciBoYW5kbGVkRGVjbGFyYXRpb25zID0gcnVuU3RyaW5nSGFuZGxlcnMoZGVjbGFyYXRpb25zLCBzdHJpbmdIYW5kbGVycyk7XG5cbiAgICB2YXIgcHJlZml4ZWREZWNsYXJhdGlvbnMgPSAoMCwgX2lubGluZVN0eWxlUHJlZml4ZXJTdGF0aWMyWydkZWZhdWx0J10pKGhhbmRsZWREZWNsYXJhdGlvbnMpO1xuXG4gICAgdmFyIHByZWZpeGVkUnVsZXMgPSAoMCwgX3V0aWwuZmxhdHRlbikoKDAsIF91dGlsLm9iamVjdFRvUGFpcnMpKHByZWZpeGVkRGVjbGFyYXRpb25zKS5tYXAoZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMik7XG5cbiAgICAgICAgdmFyIGtleSA9IF9yZWYyWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcmVmMlsxXTtcblxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhciBfcmV0ID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBpbmxpbmUtc3R5bGUtcHJlZml4LWFsbCByZXR1cm5zIGFuIGFycmF5IHdoZW4gdGhlcmUgc2hvdWxkIGJlXG4gICAgICAgICAgICAgICAgLy8gbXVsdGlwbGUgcnVsZXMsIHdlIHdpbGwgZmxhdHRlbiB0byBzaW5nbGUgcnVsZXNcblxuICAgICAgICAgICAgICAgIHZhciBwcmVmaXhlZFZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciB1bnByZWZpeGVkVmFsdWVzID0gW107XG5cbiAgICAgICAgICAgICAgICB2YWx1ZS5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2LmluZGV4T2YoJy0nKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4ZWRWYWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVucHJlZml4ZWRWYWx1ZXMucHVzaCh2KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcHJlZml4ZWRWYWx1ZXMuc29ydCgpO1xuICAgICAgICAgICAgICAgIHVucHJlZml4ZWRWYWx1ZXMuc29ydCgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdjogcHJlZml4ZWRWYWx1ZXMuY29uY2F0KHVucHJlZml4ZWRWYWx1ZXMpLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtrZXksIHZdO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIF9yZXQgPT09ICdvYmplY3QnKSByZXR1cm4gX3JldC52O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbW2tleSwgdmFsdWVdXTtcbiAgICB9KSk7XG5cbiAgICB2YXIgcnVsZXMgPSBwcmVmaXhlZFJ1bGVzLm1hcChmdW5jdGlvbiAoX3JlZjMpIHtcbiAgICAgICAgdmFyIF9yZWYzMiA9IF9zbGljZWRUb0FycmF5KF9yZWYzLCAyKTtcblxuICAgICAgICB2YXIga2V5ID0gX3JlZjMyWzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSBfcmVmMzJbMV07XG5cbiAgICAgICAgdmFyIHN0cmluZ1ZhbHVlID0gKDAsIF91dGlsLnN0cmluZ2lmeVZhbHVlKShrZXksIHZhbHVlKTtcbiAgICAgICAgdmFyIHJldCA9ICgwLCBfdXRpbC5rZWJhYmlmeVN0eWxlTmFtZSkoa2V5KSArICc6JyArIHN0cmluZ1ZhbHVlICsgJzsnO1xuICAgICAgICByZXR1cm4gdXNlSW1wb3J0YW50ID09PSBmYWxzZSA/IHJldCA6ICgwLCBfdXRpbC5pbXBvcnRhbnRpZnkpKHJldCk7XG4gICAgfSkuam9pbihcIlwiKTtcblxuICAgIGlmIChydWxlcykge1xuICAgICAgICByZXR1cm4gc2VsZWN0b3IgKyAneycgKyBydWxlcyArICd9JztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG59O1xuZXhwb3J0cy5nZW5lcmF0ZUNTU1J1bGVzZXQgPSBnZW5lcmF0ZUNTU1J1bGVzZXQ7IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX3NsaWNlZFRvQXJyYXkgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkgeyB2YXIgX2FyciA9IFtdOyB2YXIgX24gPSB0cnVlOyB2YXIgX2QgPSBmYWxzZTsgdmFyIF9lID0gdW5kZWZpbmVkOyB0cnkgeyBmb3IgKHZhciBfaSA9IGFycltTeW1ib2wuaXRlcmF0b3JdKCksIF9zOyAhKF9uID0gKF9zID0gX2kubmV4dCgpKS5kb25lKTsgX24gPSB0cnVlKSB7IF9hcnIucHVzaChfcy52YWx1ZSk7IGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhazsgfSB9IGNhdGNoIChlcnIpIHsgX2QgPSB0cnVlOyBfZSA9IGVycjsgfSBmaW5hbGx5IHsgdHJ5IHsgaWYgKCFfbiAmJiBfaVsncmV0dXJuJ10pIF9pWydyZXR1cm4nXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlJyk7IH0gfTsgfSkoKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbnZhciBfaW5qZWN0ID0gcmVxdWlyZSgnLi9pbmplY3QnKTtcblxudmFyIFN0eWxlU2hlZXQgPSB7XG4gICAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoc2hlZXREZWZpbml0aW9uKSB7XG4gICAgICAgIHJldHVybiAoMCwgX3V0aWwubWFwT2JqKShzaGVldERlZmluaXRpb24sIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgICAgICB2YXIgX3JlZjIgPSBfc2xpY2VkVG9BcnJheShfcmVmLCAyKTtcblxuICAgICAgICAgICAgdmFyIGtleSA9IF9yZWYyWzBdO1xuICAgICAgICAgICAgdmFyIHZhbCA9IF9yZWYyWzFdO1xuXG4gICAgICAgICAgICByZXR1cm4gW2tleSwge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8oZW1pbHkpOiBNYWtlIGEgJ3Byb2R1Y3Rpb24nIG1vZGUgd2hpY2ggZG9lc24ndCBwcmVwZW5kXG4gICAgICAgICAgICAgICAgLy8gdGhlIGNsYXNzIG5hbWUgaGVyZSwgdG8gbWFrZSB0aGUgZ2VuZXJhdGVkIENTUyBzbWFsbGVyLlxuICAgICAgICAgICAgICAgIF9uYW1lOiBrZXkgKyAnXycgKyAoMCwgX3V0aWwuaGFzaE9iamVjdCkodmFsKSxcbiAgICAgICAgICAgICAgICBfZGVmaW5pdGlvbjogdmFsXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlaHlkcmF0ZTogZnVuY3Rpb24gcmVoeWRyYXRlKCkge1xuICAgICAgICB2YXIgcmVuZGVyZWRDbGFzc05hbWVzID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gW10gOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgKDAsIF9pbmplY3QuYWRkUmVuZGVyZWRDbGFzc05hbWVzKShyZW5kZXJlZENsYXNzTmFtZXMpO1xuICAgIH1cbn07XG5cbi8qKlxuICogVXRpbGl0aWVzIGZvciB1c2luZyBBcGhyb2RpdGUgc2VydmVyLXNpZGUuXG4gKi9cbnZhciBTdHlsZVNoZWV0U2VydmVyID0ge1xuICAgIHJlbmRlclN0YXRpYzogZnVuY3Rpb24gcmVuZGVyU3RhdGljKHJlbmRlckZ1bmMpIHtcbiAgICAgICAgKDAsIF9pbmplY3QucmVzZXQpKCk7XG4gICAgICAgICgwLCBfaW5qZWN0LnN0YXJ0QnVmZmVyaW5nKSgpO1xuICAgICAgICB2YXIgaHRtbCA9IHJlbmRlckZ1bmMoKTtcbiAgICAgICAgdmFyIGNzc0NvbnRlbnQgPSAoMCwgX2luamVjdC5mbHVzaFRvU3RyaW5nKSgpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBodG1sOiBodG1sLFxuICAgICAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICAgICAgY29udGVudDogY3NzQ29udGVudCxcbiAgICAgICAgICAgICAgICByZW5kZXJlZENsYXNzTmFtZXM6ICgwLCBfaW5qZWN0LmdldFJlbmRlcmVkQ2xhc3NOYW1lcykoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbi8qKlxuICogVXRpbGl0aWVzIGZvciB1c2luZyBBcGhyb2RpdGUgaW4gdGVzdHMuXG4gKlxuICogTm90IG1lYW50IHRvIGJlIHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAqL1xudmFyIFN0eWxlU2hlZXRUZXN0VXRpbHMgPSB7XG4gICAgLyoqXG4gICAgICogUHJldmVudCBzdHlsZXMgZnJvbSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBET00uXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBpbiBzaXR1YXRpb25zIHdoZXJlIHlvdSdkIGxpa2UgdG8gdGVzdCByZW5kZXJpbmcgVUlcbiAgICAgKiBjb21wb25lbnRzIHdoaWNoIHVzZSBBcGhyb2RpdGUgd2l0aG91dCBhbnkgb2YgdGhlIHNpZGUtZWZmZWN0cyBvZlxuICAgICAqIEFwaHJvZGl0ZSBoYXBwZW5pbmcuIFBhcnRpY3VsYXJseSB1c2VmdWwgZm9yIHRlc3RpbmcgdGhlIG91dHB1dCBvZlxuICAgICAqIGNvbXBvbmVudHMgd2hlbiB5b3UgaGF2ZSBubyBET00sIGUuZy4gdGVzdGluZyBpbiBOb2RlIHdpdGhvdXQgYSBmYWtlIERPTS5cbiAgICAgKlxuICAgICAqIFNob3VsZCBiZSBwYWlyZWQgd2l0aCBhIHN1YnNlcXVlbnQgY2FsbCB0b1xuICAgICAqIGNsZWFyQnVmZmVyQW5kUmVzdW1lU3R5bGVJbmplY3Rpb24uXG4gICAgICovXG4gICAgc3VwcHJlc3NTdHlsZUluamVjdGlvbjogZnVuY3Rpb24gc3VwcHJlc3NTdHlsZUluamVjdGlvbigpIHtcbiAgICAgICAgKDAsIF9pbmplY3QucmVzZXQpKCk7XG4gICAgICAgICgwLCBfaW5qZWN0LnN0YXJ0QnVmZmVyaW5nKSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBPcHBvc2l0ZSBtZXRob2Qgb2YgcHJldmVudFN0eWxlSW5qZWN0LlxuICAgICAqL1xuICAgIGNsZWFyQnVmZmVyQW5kUmVzdW1lU3R5bGVJbmplY3Rpb246IGZ1bmN0aW9uIGNsZWFyQnVmZmVyQW5kUmVzdW1lU3R5bGVJbmplY3Rpb24oKSB7XG4gICAgICAgICgwLCBfaW5qZWN0LnJlc2V0KSgpO1xuICAgIH1cbn07XG5cbnZhciBjc3MgPSBmdW5jdGlvbiBjc3MoKSB7XG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIHN0eWxlRGVmaW5pdGlvbnMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgc3R5bGVEZWZpbml0aW9uc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICB2YXIgdXNlSW1wb3J0YW50ID0gdHJ1ZTsgLy8gQXBwZW5kICFpbXBvcnRhbnQgdG8gYWxsIHN0eWxlIGRlZmluaXRpb25zXG4gICAgcmV0dXJuICgwLCBfaW5qZWN0LmluamVjdEFuZEdldENsYXNzTmFtZSkodXNlSW1wb3J0YW50LCBzdHlsZURlZmluaXRpb25zKTtcbn07XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IHtcbiAgICBTdHlsZVNoZWV0OiBTdHlsZVNoZWV0LFxuICAgIFN0eWxlU2hlZXRTZXJ2ZXI6IFN0eWxlU2hlZXRTZXJ2ZXIsXG4gICAgU3R5bGVTaGVldFRlc3RVdGlsczogU3R5bGVTaGVldFRlc3RVdGlscyxcbiAgICBjc3M6IGNzc1xufTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2FzYXAgPSByZXF1aXJlKCdhc2FwJyk7XG5cbnZhciBfYXNhcDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hc2FwKTtcblxudmFyIF9nZW5lcmF0ZSA9IHJlcXVpcmUoJy4vZ2VuZXJhdGUnKTtcblxudmFyIF91dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbi8vIFRoZSBjdXJyZW50IDxzdHlsZT4gdGFnIHdlIGFyZSBpbnNlcnRpbmcgaW50bywgb3IgbnVsbCBpZiB3ZSBoYXZlbid0XG4vLyBpbnNlcnRlZCBhbnl0aGluZyB5ZXQuIFdlIGNvdWxkIGZpbmQgdGhpcyBlYWNoIHRpbWUgdXNpbmdcbi8vIGBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3R5bGVbZGF0YS1hcGhyb2RpdGVcIl0pYCwgYnV0IGhvbGRpbmcgb250byBpdCBpc1xuLy8gZmFzdGVyLlxudmFyIHN0eWxlVGFnID0gbnVsbDtcblxuLy8gSW5qZWN0IGEgc3RyaW5nIG9mIHN0eWxlcyBpbnRvIGEgPHN0eWxlPiB0YWcgaW4gdGhlIGhlYWQgb2YgdGhlIGRvY3VtZW50LiBUaGlzXG4vLyB3aWxsIGF1dG9tYXRpY2FsbHkgY3JlYXRlIGEgc3R5bGUgdGFnIGFuZCB0aGVuIGNvbnRpbnVlIHRvIHVzZSBpdCBmb3Jcbi8vIG11bHRpcGxlIGluamVjdGlvbnMuIEl0IHdpbGwgYWxzbyB1c2UgYSBzdHlsZSB0YWcgd2l0aCB0aGUgYGRhdGEtYXBocm9kaXRlYFxuLy8gdGFnIG9uIGl0IGlmIHRoYXQgZXhpc3RzIGluIHRoZSBET00uIFRoaXMgY291bGQgYmUgdXNlZCBmb3IgZS5nLiByZXVzaW5nIHRoZVxuLy8gc2FtZSBzdHlsZSB0YWcgdGhhdCBzZXJ2ZXItc2lkZSByZW5kZXJpbmcgaW5zZXJ0cy5cbnZhciBpbmplY3RTdHlsZVRhZyA9IGZ1bmN0aW9uIGluamVjdFN0eWxlVGFnKGNzc0NvbnRlbnRzKSB7XG4gICAgaWYgKHN0eWxlVGFnID09IG51bGwpIHtcbiAgICAgICAgLy8gVHJ5IHRvIGZpbmQgYSBzdHlsZSB0YWcgd2l0aCB0aGUgYGRhdGEtYXBocm9kaXRlYCBhdHRyaWJ1dGUgZmlyc3QuXG4gICAgICAgIHN0eWxlVGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN0eWxlW2RhdGEtYXBocm9kaXRlXVwiKTtcblxuICAgICAgICAvLyBJZiB0aGF0IGRvZXNuJ3Qgd29yaywgZ2VuZXJhdGUgYSBuZXcgc3R5bGUgdGFnLlxuICAgICAgICBpZiAoc3R5bGVUYWcgPT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gVGFrZW4gZnJvbVxuICAgICAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81MjQ2OTYvaG93LXRvLWNyZWF0ZS1hLXN0eWxlLXRhZy13aXRoLWphdmFzY3JpcHRcbiAgICAgICAgICAgIHZhciBoZWFkID0gZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuICAgICAgICAgICAgc3R5bGVUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xuXG4gICAgICAgICAgICBzdHlsZVRhZy50eXBlID0gJ3RleHQvY3NzJztcbiAgICAgICAgICAgIHN0eWxlVGFnLnNldEF0dHJpYnV0ZShcImRhdGEtYXBocm9kaXRlXCIsIFwiXCIpO1xuICAgICAgICAgICAgaGVhZC5hcHBlbmRDaGlsZChzdHlsZVRhZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3R5bGVUYWcuc3R5bGVTaGVldCkge1xuICAgICAgICBzdHlsZVRhZy5zdHlsZVNoZWV0LmNzc1RleHQgKz0gY3NzQ29udGVudHM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3R5bGVUYWcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY3NzQ29udGVudHMpKTtcbiAgICB9XG59O1xuXG4vLyBDdXN0b20gaGFuZGxlcnMgZm9yIHN0cmluZ2lmeWluZyBDU1MgdmFsdWVzIHRoYXQgaGF2ZSBzaWRlIGVmZmVjdHNcbi8vIChzdWNoIGFzIGZvbnRGYW1pbHksIHdoaWNoIGNhbiBjYXVzZSBAZm9udC1mYWNlIHJ1bGVzIHRvIGJlIGluamVjdGVkKVxudmFyIHN0cmluZ0hhbmRsZXJzID0ge1xuICAgIC8vIFdpdGggZm9udEZhbWlseSB3ZSBsb29rIGZvciBvYmplY3RzIHRoYXQgYXJlIHBhc3NlZCBpbiBhbmQgaW50ZXJwcmV0XG4gICAgLy8gdGhlbSBhcyBAZm9udC1mYWNlIHJ1bGVzIHRoYXQgd2UgbmVlZCB0byBpbmplY3QuIFRoZSB2YWx1ZSBvZiBmb250RmFtaWx5XG4gICAgLy8gY2FuIGVpdGhlciBiZSBhIHN0cmluZyAoYXMgbm9ybWFsKSwgYW4gb2JqZWN0IChhIHNpbmdsZSBmb250IGZhY2UpLCBvclxuICAgIC8vIGFuIGFycmF5IG9mIG9iamVjdHMgYW5kIHN0cmluZ3MuXG4gICAgZm9udEZhbWlseTogZnVuY3Rpb24gZm9udEZhbWlseSh2YWwpIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5tYXAoZm9udEZhbWlseSkuam9pbihcIixcIik7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgaW5qZWN0U3R5bGVPbmNlKHZhbC5mb250RmFtaWx5LCBcIkBmb250LWZhY2VcIiwgW3ZhbF0sIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiAnXCInICsgdmFsLmZvbnRGYW1pbHkgKyAnXCInO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyBXaXRoIGFuaW1hdGlvbk5hbWUgd2UgbG9vayBmb3IgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMga2V5ZnJhbWVzIGFuZFxuICAgIC8vIGluamVjdCB0aGVtIGFzIGFuIGBAa2V5ZnJhbWVzYCBibG9jaywgcmV0dXJuaW5nIGEgdW5pcXVlbHkgZ2VuZXJhdGVkXG4gICAgLy8gbmFtZS4gVGhlIGtleWZyYW1lcyBvYmplY3Qgc2hvdWxkIGxvb2sgbGlrZVxuICAgIC8vICBhbmltYXRpb25OYW1lOiB7XG4gICAgLy8gICAgZnJvbToge1xuICAgIC8vICAgICAgbGVmdDogMCxcbiAgICAvLyAgICAgIHRvcDogMCxcbiAgICAvLyAgICB9LFxuICAgIC8vICAgICc1MCUnOiB7XG4gICAgLy8gICAgICBsZWZ0OiAxNSxcbiAgICAvLyAgICAgIHRvcDogNSxcbiAgICAvLyAgICB9LFxuICAgIC8vICAgIHRvOiB7XG4gICAgLy8gICAgICBsZWZ0OiAyMCxcbiAgICAvLyAgICAgIHRvcDogMjAsXG4gICAgLy8gICAgfVxuICAgIC8vICB9XG4gICAgLy8gVE9ETyhlbWlseSk6IGBzdHJpbmdIYW5kbGVyc2AgZG9lc24ndCBsZXQgdXMgcmVuYW1lIHRoZSBrZXksIHNvIEkgaGF2ZVxuICAgIC8vIHRvIHVzZSBgYW5pbWF0aW9uTmFtZWAgaGVyZS4gSW1wcm92ZSB0aGF0IHNvIHdlIGNhbiBjYWxsIHRoaXNcbiAgICAvLyBgYW5pbWF0aW9uYCBpbnN0ZWFkIG9mIGBhbmltYXRpb25OYW1lYC5cbiAgICBhbmltYXRpb25OYW1lOiBmdW5jdGlvbiBhbmltYXRpb25OYW1lKHZhbCkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdlbmVyYXRlIGEgdW5pcXVlIG5hbWUgYmFzZWQgb24gdGhlIGhhc2ggb2YgdGhlIG9iamVjdC4gV2UgY2FuJ3RcbiAgICAgICAgLy8ganVzdCB1c2UgdGhlIGhhc2ggYmVjYXVzZSB0aGUgbmFtZSBjYW4ndCBzdGFydCB3aXRoIGEgbnVtYmVyLlxuICAgICAgICAvLyBUT0RPKGVtaWx5KTogdGhpcyBwcm9iYWJseSBtYWtlcyBkZWJ1Z2dpbmcgaGFyZCwgYWxsb3cgYSBjdXN0b21cbiAgICAgICAgLy8gbmFtZT9cbiAgICAgICAgdmFyIG5hbWUgPSAna2V5ZnJhbWVfJyArICgwLCBfdXRpbC5oYXNoT2JqZWN0KSh2YWwpO1xuXG4gICAgICAgIC8vIFNpbmNlIGtleWZyYW1lcyBuZWVkIDMgbGF5ZXJzIG9mIG5lc3RpbmcsIHdlIHVzZSBgZ2VuZXJhdGVDU1NgIHRvXG4gICAgICAgIC8vIGJ1aWxkIHRoZSBpbm5lciBsYXllcnMgYW5kIHdyYXAgaXQgaW4gYEBrZXlmcmFtZXNgIG91cnNlbHZlcy5cbiAgICAgICAgdmFyIGZpbmFsVmFsID0gJ0BrZXlmcmFtZXMgJyArIG5hbWUgKyAneyc7XG4gICAgICAgIE9iamVjdC5rZXlzKHZhbCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBmaW5hbFZhbCArPSAoMCwgX2dlbmVyYXRlLmdlbmVyYXRlQ1NTKShrZXksIFt2YWxba2V5XV0sIHN0cmluZ0hhbmRsZXJzLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBmaW5hbFZhbCArPSAnfSc7XG5cbiAgICAgICAgaW5qZWN0R2VuZXJhdGVkQ1NTT25jZShuYW1lLCBmaW5hbFZhbCk7XG5cbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxufTtcblxuLy8gVGhpcyBpcyBhIG1hcCBmcm9tIEFwaHJvZGl0ZSdzIGdlbmVyYXRlZCBjbGFzcyBuYW1lcyB0byBgdHJ1ZWAgKGFjdGluZyBhcyBhXG4vLyBzZXQgb2YgY2xhc3MgbmFtZXMpXG52YXIgYWxyZWFkeUluamVjdGVkID0ge307XG5cbi8vIFRoaXMgaXMgdGhlIGJ1ZmZlciBvZiBzdHlsZXMgd2hpY2ggaGF2ZSBub3QgeWV0IGJlZW4gZmx1c2hlZC5cbnZhciBpbmplY3Rpb25CdWZmZXIgPSBcIlwiO1xuXG4vLyBBIGZsYWcgdG8gdGVsbCBpZiB3ZSBhcmUgYWxyZWFkeSBidWZmZXJpbmcgc3R5bGVzLiBUaGlzIGNvdWxkIGhhcHBlbiBlaXRoZXJcbi8vIGJlY2F1c2Ugd2Ugc2NoZWR1bGVkIGEgZmx1c2ggY2FsbCBhbHJlYWR5LCBzbyBuZXdseSBhZGRlZCBzdHlsZXMgd2lsbFxuLy8gYWxyZWFkeSBiZSBmbHVzaGVkLCBvciBiZWNhdXNlIHdlIGFyZSBzdGF0aWNhbGx5IGJ1ZmZlcmluZyBvbiB0aGUgc2VydmVyLlxudmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cbnZhciBpbmplY3RHZW5lcmF0ZWRDU1NPbmNlID0gZnVuY3Rpb24gaW5qZWN0R2VuZXJhdGVkQ1NTT25jZShrZXksIGdlbmVyYXRlZENTUykge1xuICAgIGlmICghYWxyZWFkeUluamVjdGVkW2tleV0pIHtcbiAgICAgICAgaWYgKCFpc0J1ZmZlcmluZykge1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGJlIGF1dG9tYXRpY2FsbHkgYnVmZmVyaW5nIG9uIHRoZSBzZXJ2ZXIgKG9yIGFueVxuICAgICAgICAgICAgLy8gcGxhY2Ugd2l0aG91dCBhIGRvY3VtZW50KSwgc28gZ3VhcmQgYWdhaW5zdCB0aGF0LlxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBhdXRvbWF0aWNhbGx5IGJ1ZmZlciB3aXRob3V0IGEgZG9jdW1lbnRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIG5vdCBhbHJlYWR5IGJ1ZmZlcmluZywgc2NoZWR1bGUgYSBjYWxsIHRvIGZsdXNoIHRoZVxuICAgICAgICAgICAgLy8gY3VycmVudCBzdHlsZXMuXG4gICAgICAgICAgICBpc0J1ZmZlcmluZyA9IHRydWU7XG4gICAgICAgICAgICAoMCwgX2FzYXAyWydkZWZhdWx0J10pKGZsdXNoVG9TdHlsZVRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpbmplY3Rpb25CdWZmZXIgKz0gZ2VuZXJhdGVkQ1NTO1xuICAgICAgICBhbHJlYWR5SW5qZWN0ZWRba2V5XSA9IHRydWU7XG4gICAgfVxufTtcblxudmFyIGluamVjdFN0eWxlT25jZSA9IGZ1bmN0aW9uIGluamVjdFN0eWxlT25jZShrZXksIHNlbGVjdG9yLCBkZWZpbml0aW9ucywgdXNlSW1wb3J0YW50KSB7XG4gICAgaWYgKCFhbHJlYWR5SW5qZWN0ZWRba2V5XSkge1xuICAgICAgICB2YXIgZ2VuZXJhdGVkID0gKDAsIF9nZW5lcmF0ZS5nZW5lcmF0ZUNTUykoc2VsZWN0b3IsIGRlZmluaXRpb25zLCBzdHJpbmdIYW5kbGVycywgdXNlSW1wb3J0YW50KTtcblxuICAgICAgICBpbmplY3RHZW5lcmF0ZWRDU1NPbmNlKGtleSwgZ2VuZXJhdGVkKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLmluamVjdFN0eWxlT25jZSA9IGluamVjdFN0eWxlT25jZTtcbnZhciByZXNldCA9IGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGluamVjdGlvbkJ1ZmZlciA9IFwiXCI7XG4gICAgYWxyZWFkeUluamVjdGVkID0ge307XG4gICAgaXNCdWZmZXJpbmcgPSBmYWxzZTtcbiAgICBzdHlsZVRhZyA9IG51bGw7XG59O1xuXG5leHBvcnRzLnJlc2V0ID0gcmVzZXQ7XG52YXIgc3RhcnRCdWZmZXJpbmcgPSBmdW5jdGlvbiBzdGFydEJ1ZmZlcmluZygpIHtcbiAgICBpZiAoaXNCdWZmZXJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGJ1ZmZlciB3aGlsZSBhbHJlYWR5IGJ1ZmZlcmluZ1wiKTtcbiAgICB9XG4gICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xufTtcblxuZXhwb3J0cy5zdGFydEJ1ZmZlcmluZyA9IHN0YXJ0QnVmZmVyaW5nO1xudmFyIGZsdXNoVG9TdHJpbmcgPSBmdW5jdGlvbiBmbHVzaFRvU3RyaW5nKCkge1xuICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG4gICAgdmFyIHJldCA9IGluamVjdGlvbkJ1ZmZlcjtcbiAgICBpbmplY3Rpb25CdWZmZXIgPSBcIlwiO1xuICAgIHJldHVybiByZXQ7XG59O1xuXG5leHBvcnRzLmZsdXNoVG9TdHJpbmcgPSBmbHVzaFRvU3RyaW5nO1xudmFyIGZsdXNoVG9TdHlsZVRhZyA9IGZ1bmN0aW9uIGZsdXNoVG9TdHlsZVRhZygpIHtcbiAgICB2YXIgY3NzQ29udGVudCA9IGZsdXNoVG9TdHJpbmcoKTtcbiAgICBpZiAoY3NzQ29udGVudC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGluamVjdFN0eWxlVGFnKGNzc0NvbnRlbnQpO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuZmx1c2hUb1N0eWxlVGFnID0gZmx1c2hUb1N0eWxlVGFnO1xudmFyIGdldFJlbmRlcmVkQ2xhc3NOYW1lcyA9IGZ1bmN0aW9uIGdldFJlbmRlcmVkQ2xhc3NOYW1lcygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoYWxyZWFkeUluamVjdGVkKTtcbn07XG5cbmV4cG9ydHMuZ2V0UmVuZGVyZWRDbGFzc05hbWVzID0gZ2V0UmVuZGVyZWRDbGFzc05hbWVzO1xudmFyIGFkZFJlbmRlcmVkQ2xhc3NOYW1lcyA9IGZ1bmN0aW9uIGFkZFJlbmRlcmVkQ2xhc3NOYW1lcyhjbGFzc05hbWVzKSB7XG4gICAgY2xhc3NOYW1lcy5mb3JFYWNoKGZ1bmN0aW9uIChjbGFzc05hbWUpIHtcbiAgICAgICAgYWxyZWFkeUluamVjdGVkW2NsYXNzTmFtZV0gPSB0cnVlO1xuICAgIH0pO1xufTtcblxuZXhwb3J0cy5hZGRSZW5kZXJlZENsYXNzTmFtZXMgPSBhZGRSZW5kZXJlZENsYXNzTmFtZXM7XG4vKipcbiAqIEluamVjdCBzdHlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBwYXNzZWQgc3R5bGUgZGVmaW5pdGlvbiBvYmplY3RzLCBhbmQgcmV0dXJuXG4gKiBhbiBhc3NvY2lhdGVkIENTUyBjbGFzcyBuYW1lLlxuICpcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlSW1wb3J0YW50IElmIHRydWUsIHdpbGwgYXBwZW5kICFpbXBvcnRhbnQgdG8gZ2VuZXJhdGVkXG4gKiAgICAgQ1NTIG91dHB1dC4gZS5nLiB7Y29sb3I6IHJlZH0gLT4gXCJjb2xvcjogcmVkICFpbXBvcnRhbnRcIi5cbiAqIEBwYXJhbSB7T2JqZWN0W119IHN0eWxlRGVmaW5pdGlvbnMgc3R5bGUgZGVmaW5pdGlvbiBvYmplY3RzIGFzIHJldHVybmVkIGFzXG4gKiAgICAgcHJvcGVydGllcyBvZiB0aGUgcmV0dXJuIHZhbHVlIG9mIFN0eWxlU2hlZXQuY3JlYXRlKCkuXG4gKi9cbnZhciBpbmplY3RBbmRHZXRDbGFzc05hbWUgPSBmdW5jdGlvbiBpbmplY3RBbmRHZXRDbGFzc05hbWUodXNlSW1wb3J0YW50LCBzdHlsZURlZmluaXRpb25zKSB7XG4gICAgLy8gRmlsdGVyIG91dCBmYWxzeSB2YWx1ZXMgZnJvbSB0aGUgaW5wdXQsIHRvIGFsbG93IGZvclxuICAgIC8vIGBjc3MoYSwgdGVzdCAmJiBjKWBcbiAgICB2YXIgdmFsaWREZWZpbml0aW9ucyA9IHN0eWxlRGVmaW5pdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChkZWYpIHtcbiAgICAgICAgcmV0dXJuIGRlZjtcbiAgICB9KTtcblxuICAgIC8vIEJyZWFrIGlmIHRoZXJlIGFyZW4ndCBhbnkgdmFsaWQgc3R5bGVzLlxuICAgIGlmICh2YWxpZERlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gXCJcIjtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3NOYW1lID0gdmFsaWREZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgcmV0dXJuIHMuX25hbWU7XG4gICAgfSkuam9pbihcIi1vX08tXCIpO1xuICAgIGluamVjdFN0eWxlT25jZShjbGFzc05hbWUsICcuJyArIGNsYXNzTmFtZSwgdmFsaWREZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuX2RlZmluaXRpb247XG4gICAgfSksIHVzZUltcG9ydGFudCk7XG5cbiAgICByZXR1cm4gY2xhc3NOYW1lO1xufTtcbmV4cG9ydHMuaW5qZWN0QW5kR2V0Q2xhc3NOYW1lID0gaW5qZWN0QW5kR2V0Q2xhc3NOYW1lOyIsIi8vIE1vZHVsZSB3aXRoIHRoZSBzYW1lIGludGVyZmFjZSBhcyB0aGUgY29yZSBhcGhyb2RpdGUgbW9kdWxlLFxuLy8gZXhjZXB0IHRoYXQgc3R5bGVzIGluamVjdGVkIGRvIG5vdCBhdXRvbWF0aWNhbGx5IGhhdmUgIWltcG9ydGFudFxuLy8gYXBwZW5kZWQgdG8gdGhlbS5cbi8vXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfaW5qZWN0ID0gcmVxdWlyZSgnLi9pbmplY3QnKTtcblxudmFyIF9pbmRleEpzID0gcmVxdWlyZSgnLi9pbmRleC5qcycpO1xuXG52YXIgY3NzID0gZnVuY3Rpb24gY3NzKCkge1xuICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBzdHlsZURlZmluaXRpb25zID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIHN0eWxlRGVmaW5pdGlvbnNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgdmFyIHVzZUltcG9ydGFudCA9IGZhbHNlOyAvLyBEb24ndCBhcHBlbmQgIWltcG9ydGFudCB0byBzdHlsZSBkZWZpbml0aW9uc1xuICAgIHJldHVybiAoMCwgX2luamVjdC5pbmplY3RBbmRHZXRDbGFzc05hbWUpKHVzZUltcG9ydGFudCwgc3R5bGVEZWZpbml0aW9ucyk7XG59O1xuXG5leHBvcnRzLlN0eWxlU2hlZXQgPSBfaW5kZXhKcy5TdHlsZVNoZWV0O1xuZXhwb3J0cy5TdHlsZVNoZWV0U2VydmVyID0gX2luZGV4SnMuU3R5bGVTaGVldFNlcnZlcjtcbmV4cG9ydHMuU3R5bGVTaGVldFRlc3RVdGlscyA9IF9pbmRleEpzLlN0eWxlU2hlZXRUZXN0VXRpbHM7XG5leHBvcnRzLmNzcyA9IGNzczsiLCIvLyB7SzE6IFYxLCBLMjogVjIsIC4uLn0gLT4gW1tLMSwgVjFdLCBbSzIsIFYyXV1cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9zbGljZWRUb0FycmF5ID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbJ3JldHVybiddKSBfaVsncmV0dXJuJ10oKTsgfSBmaW5hbGx5IHsgaWYgKF9kKSB0aHJvdyBfZTsgfSB9IHJldHVybiBfYXJyOyB9IHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgcmV0dXJuIGFycjsgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHsgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTsgfSBlbHNlIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZScpOyB9IH07IH0pKCk7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBvYmplY3RUb1BhaXJzID0gZnVuY3Rpb24gb2JqZWN0VG9QYWlycyhvYmopIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gW2tleSwgb2JqW2tleV1dO1xuICAgIH0pO1xufTtcblxuZXhwb3J0cy5vYmplY3RUb1BhaXJzID0gb2JqZWN0VG9QYWlycztcbi8vIFtbSzEsIFYxXSwgW0syLCBWMl1dIC0+IHtLMTogVjEsIEsyOiBWMiwgLi4ufVxudmFyIHBhaXJzVG9PYmplY3QgPSBmdW5jdGlvbiBwYWlyc1RvT2JqZWN0KHBhaXJzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24gKF9yZWYpIHtcbiAgICAgICAgdmFyIF9yZWYyID0gX3NsaWNlZFRvQXJyYXkoX3JlZiwgMik7XG5cbiAgICAgICAgdmFyIGtleSA9IF9yZWYyWzBdO1xuICAgICAgICB2YXIgdmFsID0gX3JlZjJbMV07XG5cbiAgICAgICAgcmVzdWx0W2tleV0gPSB2YWw7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBtYXBPYmogPSBmdW5jdGlvbiBtYXBPYmoob2JqLCBmbikge1xuICAgIHJldHVybiBwYWlyc1RvT2JqZWN0KG9iamVjdFRvUGFpcnMob2JqKS5tYXAoZm4pKTtcbn07XG5cbmV4cG9ydHMubWFwT2JqID0gbWFwT2JqO1xuLy8gRmxhdHRlbnMgYW4gYXJyYXkgb25lIGxldmVsXG4vLyBbW0FdLCBbQiwgQywgW0RdXV0gLT4gW0EsIEIsIEMsIFtEXV1cbnZhciBmbGF0dGVuID0gZnVuY3Rpb24gZmxhdHRlbihsaXN0KSB7XG4gICAgcmV0dXJuIGxpc3QucmVkdWNlKGZ1bmN0aW9uIChtZW1vLCB4KSB7XG4gICAgICAgIHJldHVybiBtZW1vLmNvbmNhdCh4KTtcbiAgICB9LCBbXSk7XG59O1xuXG5leHBvcnRzLmZsYXR0ZW4gPSBmbGF0dGVuO1xudmFyIFVQUEVSQ0FTRV9SRSA9IC8oW0EtWl0pL2c7XG52YXIgTVNfUkUgPSAvXm1zLS87XG5cbnZhciBrZWJhYmlmeSA9IGZ1bmN0aW9uIGtlYmFiaWZ5KHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShVUFBFUkNBU0VfUkUsICctJDEnKS50b0xvd2VyQ2FzZSgpO1xufTtcbnZhciBrZWJhYmlmeVN0eWxlTmFtZSA9IGZ1bmN0aW9uIGtlYmFiaWZ5U3R5bGVOYW1lKHN0cmluZykge1xuICAgIHJldHVybiBrZWJhYmlmeShzdHJpbmcpLnJlcGxhY2UoTVNfUkUsICctbXMtJyk7XG59O1xuXG5leHBvcnRzLmtlYmFiaWZ5U3R5bGVOYW1lID0ga2ViYWJpZnlTdHlsZU5hbWU7XG52YXIgcmVjdXJzaXZlTWVyZ2UgPSBmdW5jdGlvbiByZWN1cnNpdmVNZXJnZShhLCBiKSB7XG4gICAgLy8gVE9ETyhqbGZ3b25nKTogSGFuZGxlIG1hbGZvcm1lZCBpbnB1dCB3aGVyZSBhIGFuZCBiIGFyZSBub3QgdGhlIHNhbWVcbiAgICAvLyB0eXBlLlxuXG4gICAgaWYgKHR5cGVvZiBhICE9PSAnb2JqZWN0Jykge1xuICAgICAgICByZXR1cm4gYjtcbiAgICB9XG5cbiAgICB2YXIgcmV0ID0gX2V4dGVuZHMoe30sIGEpO1xuXG4gICAgT2JqZWN0LmtleXMoYikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlmIChyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgcmV0W2tleV0gPSByZWN1cnNpdmVNZXJnZShhW2tleV0sIGJba2V5XSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXRba2V5XSA9IGJba2V5XTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbmV4cG9ydHMucmVjdXJzaXZlTWVyZ2UgPSByZWN1cnNpdmVNZXJnZTtcbi8qKlxuICogQ1NTIHByb3BlcnRpZXMgd2hpY2ggYWNjZXB0IG51bWJlcnMgYnV0IGFyZSBub3QgaW4gdW5pdHMgb2YgXCJweFwiLlxuICogVGFrZW4gZnJvbSBSZWFjdCdzIENTU1Byb3BlcnR5LmpzXG4gKi9cbnZhciBpc1VuaXRsZXNzTnVtYmVyID0ge1xuICAgIGFuaW1hdGlvbkl0ZXJhdGlvbkNvdW50OiB0cnVlLFxuICAgIGJvcmRlckltYWdlT3V0c2V0OiB0cnVlLFxuICAgIGJvcmRlckltYWdlU2xpY2U6IHRydWUsXG4gICAgYm9yZGVySW1hZ2VXaWR0aDogdHJ1ZSxcbiAgICBib3hGbGV4OiB0cnVlLFxuICAgIGJveEZsZXhHcm91cDogdHJ1ZSxcbiAgICBib3hPcmRpbmFsR3JvdXA6IHRydWUsXG4gICAgY29sdW1uQ291bnQ6IHRydWUsXG4gICAgZmxleDogdHJ1ZSxcbiAgICBmbGV4R3JvdzogdHJ1ZSxcbiAgICBmbGV4UG9zaXRpdmU6IHRydWUsXG4gICAgZmxleFNocmluazogdHJ1ZSxcbiAgICBmbGV4TmVnYXRpdmU6IHRydWUsXG4gICAgZmxleE9yZGVyOiB0cnVlLFxuICAgIGdyaWRSb3c6IHRydWUsXG4gICAgZ3JpZENvbHVtbjogdHJ1ZSxcbiAgICBmb250V2VpZ2h0OiB0cnVlLFxuICAgIGxpbmVDbGFtcDogdHJ1ZSxcbiAgICBsaW5lSGVpZ2h0OiB0cnVlLFxuICAgIG9wYWNpdHk6IHRydWUsXG4gICAgb3JkZXI6IHRydWUsXG4gICAgb3JwaGFuczogdHJ1ZSxcbiAgICB0YWJTaXplOiB0cnVlLFxuICAgIHdpZG93czogdHJ1ZSxcbiAgICB6SW5kZXg6IHRydWUsXG4gICAgem9vbTogdHJ1ZSxcblxuICAgIC8vIFNWRy1yZWxhdGVkIHByb3BlcnRpZXNcbiAgICBmaWxsT3BhY2l0eTogdHJ1ZSxcbiAgICBmbG9vZE9wYWNpdHk6IHRydWUsXG4gICAgc3RvcE9wYWNpdHk6IHRydWUsXG4gICAgc3Ryb2tlRGFzaGFycmF5OiB0cnVlLFxuICAgIHN0cm9rZURhc2hvZmZzZXQ6IHRydWUsXG4gICAgc3Ryb2tlTWl0ZXJsaW1pdDogdHJ1ZSxcbiAgICBzdHJva2VPcGFjaXR5OiB0cnVlLFxuICAgIHN0cm9rZVdpZHRoOiB0cnVlXG59O1xuXG4vKipcbiAqIFRha2VuIGZyb20gUmVhY3QncyBDU1NQcm9wZXJ0eS5qc1xuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdmVuZG9yLXNwZWNpZmljIHByZWZpeCwgZWc6IFdlYmtpdFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBzdHlsZSBuYW1lLCBlZzogdHJhbnNpdGlvbkR1cmF0aW9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHN0eWxlIG5hbWUgcHJlZml4ZWQgd2l0aCBgcHJlZml4YCwgcHJvcGVybHkgY2FtZWxDYXNlZCwgZWc6XG4gKiBXZWJraXRUcmFuc2l0aW9uRHVyYXRpb25cbiAqL1xuZnVuY3Rpb24gcHJlZml4S2V5KHByZWZpeCwga2V5KSB7XG4gICAgcmV0dXJuIHByZWZpeCArIGtleS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGtleS5zdWJzdHJpbmcoMSk7XG59XG5cbi8qKlxuICogU3VwcG9ydCBzdHlsZSBuYW1lcyB0aGF0IG1heSBjb21lIHBhc3NlZCBpbiBwcmVmaXhlZCBieSBhZGRpbmcgcGVybXV0YXRpb25zXG4gKiBvZiB2ZW5kb3IgcHJlZml4ZXMuXG4gKiBUYWtlbiBmcm9tIFJlYWN0J3MgQ1NTUHJvcGVydHkuanNcbiAqL1xudmFyIHByZWZpeGVzID0gWydXZWJraXQnLCAnbXMnLCAnTW96JywgJ08nXTtcblxuLy8gVXNpbmcgT2JqZWN0LmtleXMgaGVyZSwgb3IgZWxzZSB0aGUgdmFuaWxsYSBmb3ItaW4gbG9vcCBtYWtlcyBJRTggZ28gaW50byBhblxuLy8gaW5maW5pdGUgbG9vcCwgYmVjYXVzZSBpdCBpdGVyYXRlcyBvdmVyIHRoZSBuZXdseSBhZGRlZCBwcm9wcyB0b28uXG4vLyBUYWtlbiBmcm9tIFJlYWN0J3MgQ1NTUHJvcGVydHkuanNcbk9iamVjdC5rZXlzKGlzVW5pdGxlc3NOdW1iZXIpLmZvckVhY2goZnVuY3Rpb24gKHByb3ApIHtcbiAgICBwcmVmaXhlcy5mb3JFYWNoKGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgaXNVbml0bGVzc051bWJlcltwcmVmaXhLZXkocHJlZml4LCBwcm9wKV0gPSBpc1VuaXRsZXNzTnVtYmVyW3Byb3BdO1xuICAgIH0pO1xufSk7XG5cbnZhciBzdHJpbmdpZnlWYWx1ZSA9IGZ1bmN0aW9uIHN0cmluZ2lmeVZhbHVlKGtleSwgcHJvcCkge1xuICAgIGlmICh0eXBlb2YgcHJvcCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICBpZiAoaXNVbml0bGVzc051bWJlcltrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIiArIHByb3A7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcCArIFwicHhcIjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwcm9wO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuc3RyaW5naWZ5VmFsdWUgPSBzdHJpbmdpZnlWYWx1ZTtcbi8qKlxuICogSlMgSW1wbGVtZW50YXRpb24gb2YgTXVybXVySGFzaDJcbiAqXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86Z2FyeS5jb3VydEBnbWFpbC5jb21cIj5HYXJ5IENvdXJ0PC9hPlxuICogQHNlZSBodHRwOi8vZ2l0aHViLmNvbS9nYXJ5Y291cnQvbXVybXVyaGFzaC1qc1xuICogQGF1dGhvciA8YSBocmVmPVwibWFpbHRvOmFhcHBsZWJ5QGdtYWlsLmNvbVwiPkF1c3RpbiBBcHBsZWJ5PC9hPlxuICogQHNlZSBodHRwOi8vc2l0ZXMuZ29vZ2xlLmNvbS9zaXRlL211cm11cmhhc2gvXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0ciBBU0NJSSBvbmx5XG4gKiBAcmV0dXJuIHtzdHJpbmd9IEJhc2UgMzYgZW5jb2RlZCBoYXNoIHJlc3VsdFxuICovXG5mdW5jdGlvbiBtdXJtdXJoYXNoMl8zMl9nYyhzdHIpIHtcbiAgICB2YXIgbCA9IHN0ci5sZW5ndGg7XG4gICAgdmFyIGggPSBsO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgayA9IHVuZGVmaW5lZDtcblxuICAgIHdoaWxlIChsID49IDQpIHtcbiAgICAgICAgayA9IHN0ci5jaGFyQ29kZUF0KGkpICYgMHhmZiB8IChzdHIuY2hhckNvZGVBdCgrK2kpICYgMHhmZikgPDwgOCB8IChzdHIuY2hhckNvZGVBdCgrK2kpICYgMHhmZikgPDwgMTYgfCAoc3RyLmNoYXJDb2RlQXQoKytpKSAmIDB4ZmYpIDw8IDI0O1xuXG4gICAgICAgIGsgPSAoayAmIDB4ZmZmZikgKiAweDViZDFlOTk1ICsgKCgoayA+Pj4gMTYpICogMHg1YmQxZTk5NSAmIDB4ZmZmZikgPDwgMTYpO1xuICAgICAgICBrIF49IGsgPj4+IDI0O1xuICAgICAgICBrID0gKGsgJiAweGZmZmYpICogMHg1YmQxZTk5NSArICgoKGsgPj4+IDE2KSAqIDB4NWJkMWU5OTUgJiAweGZmZmYpIDw8IDE2KTtcblxuICAgICAgICBoID0gKGggJiAweGZmZmYpICogMHg1YmQxZTk5NSArICgoKGggPj4+IDE2KSAqIDB4NWJkMWU5OTUgJiAweGZmZmYpIDw8IDE2KSBeIGs7XG5cbiAgICAgICAgbCAtPSA0O1xuICAgICAgICArK2k7XG4gICAgfVxuXG4gICAgc3dpdGNoIChsKSB7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIGggXj0gKHN0ci5jaGFyQ29kZUF0KGkgKyAyKSAmIDB4ZmYpIDw8IDE2O1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBoIF49IChzdHIuY2hhckNvZGVBdChpICsgMSkgJiAweGZmKSA8PCA4O1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICBoIF49IHN0ci5jaGFyQ29kZUF0KGkpICYgMHhmZjtcbiAgICAgICAgICAgIGggPSAoaCAmIDB4ZmZmZikgKiAweDViZDFlOTk1ICsgKCgoaCA+Pj4gMTYpICogMHg1YmQxZTk5NSAmIDB4ZmZmZikgPDwgMTYpO1xuICAgIH1cblxuICAgIGggXj0gaCA+Pj4gMTM7XG4gICAgaCA9IChoICYgMHhmZmZmKSAqIDB4NWJkMWU5OTUgKyAoKChoID4+PiAxNikgKiAweDViZDFlOTk1ICYgMHhmZmZmKSA8PCAxNik7XG4gICAgaCBePSBoID4+PiAxNTtcblxuICAgIHJldHVybiAoaCA+Pj4gMCkudG9TdHJpbmcoMzYpO1xufVxuXG4vLyBIYXNoIGEgamF2YXNjcmlwdCBvYmplY3QgdXNpbmcgSlNPTi5zdHJpbmdpZnkuIFRoaXMgaXMgdmVyeSBmYXN0LCBhYm91dCAzXG4vLyBtaWNyb3NlY29uZHMgb24gbXkgY29tcHV0ZXIgZm9yIGEgc2FtcGxlIG9iamVjdDpcbi8vIGh0dHA6Ly9qc3BlcmYuY29tL3Rlc3QtaGFzaGZudjMyYS1oYXNoLzVcbi8vXG4vLyBOb3RlIHRoYXQgdGhpcyB1c2VzIEpTT04uc3RyaW5naWZ5IHRvIHN0cmluZ2lmeSB0aGUgb2JqZWN0cyBzbyBpbiBvcmRlciBmb3Jcbi8vIHRoaXMgdG8gcHJvZHVjZSBjb25zaXN0ZW50IGhhc2hlcyBicm93c2VycyBuZWVkIHRvIGhhdmUgYSBjb25zaXN0ZW50XG4vLyBvcmRlcmluZyBvZiBvYmplY3RzLiBCZW4gQWxwZXJ0IHNheXMgdGhhdCBGYWNlYm9vayBkZXBlbmRzIG9uIHRoaXMsIHNvIHdlXG4vLyBjYW4gcHJvYmFibHkgZGVwZW5kIG9uIHRoaXMgdG9vLlxudmFyIGhhc2hPYmplY3QgPSBmdW5jdGlvbiBoYXNoT2JqZWN0KG9iamVjdCkge1xuICAgIHJldHVybiBtdXJtdXJoYXNoMl8zMl9nYyhKU09OLnN0cmluZ2lmeShvYmplY3QpKTtcbn07XG5cbmV4cG9ydHMuaGFzaE9iamVjdCA9IGhhc2hPYmplY3Q7XG52YXIgSU1QT1JUQU5UX1JFID0gL14oW146XSs6Lio/KSggIWltcG9ydGFudCk/OyQvO1xuXG4vLyBHaXZlbiBhIHNpbmdsZSBzdHlsZSBydWxlIHN0cmluZyBsaWtlIFwiYTogYjtcIiwgYWRkcyAhaW1wb3J0YW50IHRvIGdlbmVyYXRlXG4vLyBcImE6IGIgIWltcG9ydGFudDtcIi5cbnZhciBpbXBvcnRhbnRpZnkgPSBmdW5jdGlvbiBpbXBvcnRhbnRpZnkoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKElNUE9SVEFOVF9SRSwgZnVuY3Rpb24gKF8sIGJhc2UsIGltcG9ydGFudCkge1xuICAgICAgICByZXR1cm4gYmFzZSArIFwiICFpbXBvcnRhbnQ7XCI7XG4gICAgfSk7XG59O1xuZXhwb3J0cy5pbXBvcnRhbnRpZnkgPSBpbXBvcnRhbnRpZnk7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9uby1pbXBvcnRhbnQuanMnKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyByYXdBc2FwIHByb3ZpZGVzIGV2ZXJ5dGhpbmcgd2UgbmVlZCBleGNlcHQgZXhjZXB0aW9uIG1hbmFnZW1lbnQuXG52YXIgcmF3QXNhcCA9IHJlcXVpcmUoXCIuL3Jhd1wiKTtcbi8vIFJhd1Rhc2tzIGFyZSByZWN5Y2xlZCB0byByZWR1Y2UgR0MgY2h1cm4uXG52YXIgZnJlZVRhc2tzID0gW107XG4vLyBXZSBxdWV1ZSBlcnJvcnMgdG8gZW5zdXJlIHRoZXkgYXJlIHRocm93biBpbiByaWdodCBvcmRlciAoRklGTykuXG4vLyBBcnJheS1hcy1xdWV1ZSBpcyBnb29kIGVub3VnaCBoZXJlLCBzaW5jZSB3ZSBhcmUganVzdCBkZWFsaW5nIHdpdGggZXhjZXB0aW9ucy5cbnZhciBwZW5kaW5nRXJyb3JzID0gW107XG52YXIgcmVxdWVzdEVycm9yVGhyb3cgPSByYXdBc2FwLm1ha2VSZXF1ZXN0Q2FsbEZyb21UaW1lcih0aHJvd0ZpcnN0RXJyb3IpO1xuXG5mdW5jdGlvbiB0aHJvd0ZpcnN0RXJyb3IoKSB7XG4gICAgaWYgKHBlbmRpbmdFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IHBlbmRpbmdFcnJvcnMuc2hpZnQoKTtcbiAgICB9XG59XG5cbi8qKlxuICogQ2FsbHMgYSB0YXNrIGFzIHNvb24gYXMgcG9zc2libGUgYWZ0ZXIgcmV0dXJuaW5nLCBpbiBpdHMgb3duIGV2ZW50LCB3aXRoIHByaW9yaXR5XG4gKiBvdmVyIG90aGVyIGV2ZW50cyBsaWtlIGFuaW1hdGlvbiwgcmVmbG93LCBhbmQgcmVwYWludC4gQW4gZXJyb3IgdGhyb3duIGZyb20gYW5cbiAqIGV2ZW50IHdpbGwgbm90IGludGVycnVwdCwgbm9yIGV2ZW4gc3Vic3RhbnRpYWxseSBzbG93IGRvd24gdGhlIHByb2Nlc3Npbmcgb2ZcbiAqIG90aGVyIGV2ZW50cywgYnV0IHdpbGwgYmUgcmF0aGVyIHBvc3Rwb25lZCB0byBhIGxvd2VyIHByaW9yaXR5IGV2ZW50LlxuICogQHBhcmFtIHt7Y2FsbH19IHRhc2sgQSBjYWxsYWJsZSBvYmplY3QsIHR5cGljYWxseSBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgbm9cbiAqIGFyZ3VtZW50cy5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBhc2FwO1xuZnVuY3Rpb24gYXNhcCh0YXNrKSB7XG4gICAgdmFyIHJhd1Rhc2s7XG4gICAgaWYgKGZyZWVUYXNrcy5sZW5ndGgpIHtcbiAgICAgICAgcmF3VGFzayA9IGZyZWVUYXNrcy5wb3AoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByYXdUYXNrID0gbmV3IFJhd1Rhc2soKTtcbiAgICB9XG4gICAgcmF3VGFzay50YXNrID0gdGFzaztcbiAgICByYXdBc2FwKHJhd1Rhc2spO1xufVxuXG4vLyBXZSB3cmFwIHRhc2tzIHdpdGggcmVjeWNsYWJsZSB0YXNrIG9iamVjdHMuICBBIHRhc2sgb2JqZWN0IGltcGxlbWVudHNcbi8vIGBjYWxsYCwganVzdCBsaWtlIGEgZnVuY3Rpb24uXG5mdW5jdGlvbiBSYXdUYXNrKCkge1xuICAgIHRoaXMudGFzayA9IG51bGw7XG59XG5cbi8vIFRoZSBzb2xlIHB1cnBvc2Ugb2Ygd3JhcHBpbmcgdGhlIHRhc2sgaXMgdG8gY2F0Y2ggdGhlIGV4Y2VwdGlvbiBhbmQgcmVjeWNsZVxuLy8gdGhlIHRhc2sgb2JqZWN0IGFmdGVyIGl0cyBzaW5nbGUgdXNlLlxuUmF3VGFzay5wcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICB0aGlzLnRhc2suY2FsbCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGlmIChhc2FwLm9uZXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaG9vayBleGlzdHMgcHVyZWx5IGZvciB0ZXN0aW5nIHB1cnBvc2VzLlxuICAgICAgICAgICAgLy8gSXRzIG5hbWUgd2lsbCBiZSBwZXJpb2RpY2FsbHkgcmFuZG9taXplZCB0byBicmVhayBhbnkgY29kZSB0aGF0XG4gICAgICAgICAgICAvLyBkZXBlbmRzIG9uIGl0cyBleGlzdGVuY2UuXG4gICAgICAgICAgICBhc2FwLm9uZXJyb3IoZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSW4gYSB3ZWIgYnJvd3NlciwgZXhjZXB0aW9ucyBhcmUgbm90IGZhdGFsLiBIb3dldmVyLCB0byBhdm9pZFxuICAgICAgICAgICAgLy8gc2xvd2luZyBkb3duIHRoZSBxdWV1ZSBvZiBwZW5kaW5nIHRhc2tzLCB3ZSByZXRocm93IHRoZSBlcnJvciBpbiBhXG4gICAgICAgICAgICAvLyBsb3dlciBwcmlvcml0eSB0dXJuLlxuICAgICAgICAgICAgcGVuZGluZ0Vycm9ycy5wdXNoKGVycm9yKTtcbiAgICAgICAgICAgIHJlcXVlc3RFcnJvclRocm93KCk7XG4gICAgICAgIH1cbiAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLnRhc2sgPSBudWxsO1xuICAgICAgICBmcmVlVGFza3NbZnJlZVRhc2tzLmxlbmd0aF0gPSB0aGlzO1xuICAgIH1cbn07XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8gVXNlIHRoZSBmYXN0ZXN0IG1lYW5zIHBvc3NpYmxlIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGl0cyBvd24gdHVybiwgd2l0aFxuLy8gcHJpb3JpdHkgb3ZlciBvdGhlciBldmVudHMgaW5jbHVkaW5nIElPLCBhbmltYXRpb24sIHJlZmxvdywgYW5kIHJlZHJhd1xuLy8gZXZlbnRzIGluIGJyb3dzZXJzLlxuLy9cbi8vIEFuIGV4Y2VwdGlvbiB0aHJvd24gYnkgYSB0YXNrIHdpbGwgcGVybWFuZW50bHkgaW50ZXJydXB0IHRoZSBwcm9jZXNzaW5nIG9mXG4vLyBzdWJzZXF1ZW50IHRhc2tzLiBUaGUgaGlnaGVyIGxldmVsIGBhc2FwYCBmdW5jdGlvbiBlbnN1cmVzIHRoYXQgaWYgYW5cbi8vIGV4Y2VwdGlvbiBpcyB0aHJvd24gYnkgYSB0YXNrLCB0aGF0IHRoZSB0YXNrIHF1ZXVlIHdpbGwgY29udGludWUgZmx1c2hpbmcgYXNcbi8vIHNvb24gYXMgcG9zc2libGUsIGJ1dCBpZiB5b3UgdXNlIGByYXdBc2FwYCBkaXJlY3RseSwgeW91IGFyZSByZXNwb25zaWJsZSB0b1xuLy8gZWl0aGVyIGVuc3VyZSB0aGF0IG5vIGV4Y2VwdGlvbnMgYXJlIHRocm93biBmcm9tIHlvdXIgdGFzaywgb3IgdG8gbWFudWFsbHlcbi8vIGNhbGwgYHJhd0FzYXAucmVxdWVzdEZsdXNoYCBpZiBhbiBleGNlcHRpb24gaXMgdGhyb3duLlxubW9kdWxlLmV4cG9ydHMgPSByYXdBc2FwO1xuZnVuY3Rpb24gcmF3QXNhcCh0YXNrKSB7XG4gICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcmVxdWVzdEZsdXNoKCk7XG4gICAgICAgIGZsdXNoaW5nID0gdHJ1ZTtcbiAgICB9XG4gICAgLy8gRXF1aXZhbGVudCB0byBwdXNoLCBidXQgYXZvaWRzIGEgZnVuY3Rpb24gY2FsbC5cbiAgICBxdWV1ZVtxdWV1ZS5sZW5ndGhdID0gdGFzaztcbn1cblxudmFyIHF1ZXVlID0gW107XG4vLyBPbmNlIGEgZmx1c2ggaGFzIGJlZW4gcmVxdWVzdGVkLCBubyBmdXJ0aGVyIGNhbGxzIHRvIGByZXF1ZXN0Rmx1c2hgIGFyZVxuLy8gbmVjZXNzYXJ5IHVudGlsIHRoZSBuZXh0IGBmbHVzaGAgY29tcGxldGVzLlxudmFyIGZsdXNoaW5nID0gZmFsc2U7XG4vLyBgcmVxdWVzdEZsdXNoYCBpcyBhbiBpbXBsZW1lbnRhdGlvbi1zcGVjaWZpYyBtZXRob2QgdGhhdCBhdHRlbXB0cyB0byBraWNrXG4vLyBvZmYgYSBgZmx1c2hgIGV2ZW50IGFzIHF1aWNrbHkgYXMgcG9zc2libGUuIGBmbHVzaGAgd2lsbCBhdHRlbXB0IHRvIGV4aGF1c3Rcbi8vIHRoZSBldmVudCBxdWV1ZSBiZWZvcmUgeWllbGRpbmcgdG8gdGhlIGJyb3dzZXIncyBvd24gZXZlbnQgbG9vcC5cbnZhciByZXF1ZXN0Rmx1c2g7XG4vLyBUaGUgcG9zaXRpb24gb2YgdGhlIG5leHQgdGFzayB0byBleGVjdXRlIGluIHRoZSB0YXNrIHF1ZXVlLiBUaGlzIGlzXG4vLyBwcmVzZXJ2ZWQgYmV0d2VlbiBjYWxscyB0byBgZmx1c2hgIHNvIHRoYXQgaXQgY2FuIGJlIHJlc3VtZWQgaWZcbi8vIGEgdGFzayB0aHJvd3MgYW4gZXhjZXB0aW9uLlxudmFyIGluZGV4ID0gMDtcbi8vIElmIGEgdGFzayBzY2hlZHVsZXMgYWRkaXRpb25hbCB0YXNrcyByZWN1cnNpdmVseSwgdGhlIHRhc2sgcXVldWUgY2FuIGdyb3dcbi8vIHVuYm91bmRlZC4gVG8gcHJldmVudCBtZW1vcnkgZXhoYXVzdGlvbiwgdGhlIHRhc2sgcXVldWUgd2lsbCBwZXJpb2RpY2FsbHlcbi8vIHRydW5jYXRlIGFscmVhZHktY29tcGxldGVkIHRhc2tzLlxudmFyIGNhcGFjaXR5ID0gMTAyNDtcblxuLy8gVGhlIGZsdXNoIGZ1bmN0aW9uIHByb2Nlc3NlcyBhbGwgdGFza3MgdGhhdCBoYXZlIGJlZW4gc2NoZWR1bGVkIHdpdGhcbi8vIGByYXdBc2FwYCB1bmxlc3MgYW5kIHVudGlsIG9uZSBvZiB0aG9zZSB0YXNrcyB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuLy8gSWYgYSB0YXNrIHRocm93cyBhbiBleGNlcHRpb24sIGBmbHVzaGAgZW5zdXJlcyB0aGF0IGl0cyBzdGF0ZSB3aWxsIHJlbWFpblxuLy8gY29uc2lzdGVudCBhbmQgd2lsbCByZXN1bWUgd2hlcmUgaXQgbGVmdCBvZmYgd2hlbiBjYWxsZWQgYWdhaW4uXG4vLyBIb3dldmVyLCBgZmx1c2hgIGRvZXMgbm90IG1ha2UgYW55IGFycmFuZ2VtZW50cyB0byBiZSBjYWxsZWQgYWdhaW4gaWYgYW5cbi8vIGV4Y2VwdGlvbiBpcyB0aHJvd24uXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICB3aGlsZSAoaW5kZXggPCBxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRJbmRleCA9IGluZGV4O1xuICAgICAgICAvLyBBZHZhbmNlIHRoZSBpbmRleCBiZWZvcmUgY2FsbGluZyB0aGUgdGFzay4gVGhpcyBlbnN1cmVzIHRoYXQgd2Ugd2lsbFxuICAgICAgICAvLyBiZWdpbiBmbHVzaGluZyBvbiB0aGUgbmV4dCB0YXNrIHRoZSB0YXNrIHRocm93cyBhbiBlcnJvci5cbiAgICAgICAgaW5kZXggPSBpbmRleCArIDE7XG4gICAgICAgIHF1ZXVlW2N1cnJlbnRJbmRleF0uY2FsbCgpO1xuICAgICAgICAvLyBQcmV2ZW50IGxlYWtpbmcgbWVtb3J5IGZvciBsb25nIGNoYWlucyBvZiByZWN1cnNpdmUgY2FsbHMgdG8gYGFzYXBgLlxuICAgICAgICAvLyBJZiB3ZSBjYWxsIGBhc2FwYCB3aXRoaW4gdGFza3Mgc2NoZWR1bGVkIGJ5IGBhc2FwYCwgdGhlIHF1ZXVlIHdpbGxcbiAgICAgICAgLy8gZ3JvdywgYnV0IHRvIGF2b2lkIGFuIE8obikgd2FsayBmb3IgZXZlcnkgdGFzayB3ZSBleGVjdXRlLCB3ZSBkb24ndFxuICAgICAgICAvLyBzaGlmdCB0YXNrcyBvZmYgdGhlIHF1ZXVlIGFmdGVyIHRoZXkgaGF2ZSBiZWVuIGV4ZWN1dGVkLlxuICAgICAgICAvLyBJbnN0ZWFkLCB3ZSBwZXJpb2RpY2FsbHkgc2hpZnQgMTAyNCB0YXNrcyBvZmYgdGhlIHF1ZXVlLlxuICAgICAgICBpZiAoaW5kZXggPiBjYXBhY2l0eSkge1xuICAgICAgICAgICAgLy8gTWFudWFsbHkgc2hpZnQgYWxsIHZhbHVlcyBzdGFydGluZyBhdCB0aGUgaW5kZXggYmFjayB0byB0aGVcbiAgICAgICAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgcXVldWUuXG4gICAgICAgICAgICBmb3IgKHZhciBzY2FuID0gMCwgbmV3TGVuZ3RoID0gcXVldWUubGVuZ3RoIC0gaW5kZXg7IHNjYW4gPCBuZXdMZW5ndGg7IHNjYW4rKykge1xuICAgICAgICAgICAgICAgIHF1ZXVlW3NjYW5dID0gcXVldWVbc2NhbiArIGluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCAtPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgIGluZGV4ID0gMDtcbiAgICBmbHVzaGluZyA9IGZhbHNlO1xufVxuXG4vLyBgcmVxdWVzdEZsdXNoYCBpcyBpbXBsZW1lbnRlZCB1c2luZyBhIHN0cmF0ZWd5IGJhc2VkIG9uIGRhdGEgY29sbGVjdGVkIGZyb21cbi8vIGV2ZXJ5IGF2YWlsYWJsZSBTYXVjZUxhYnMgU2VsZW5pdW0gd2ViIGRyaXZlciB3b3JrZXIgYXQgdGltZSBvZiB3cml0aW5nLlxuLy8gaHR0cHM6Ly9kb2NzLmdvb2dsZS5jb20vc3ByZWFkc2hlZXRzL2QvMW1HLTVVWUd1cDVxeEdkRU1Xa2hQNkJXQ3owNTNOVWIyRTFRb1VUVTE2dUEvZWRpdCNnaWQ9NzgzNzI0NTkzXG5cbi8vIFNhZmFyaSA2IGFuZCA2LjEgZm9yIGRlc2t0b3AsIGlQYWQsIGFuZCBpUGhvbmUgYXJlIHRoZSBvbmx5IGJyb3dzZXJzIHRoYXRcbi8vIGhhdmUgV2ViS2l0TXV0YXRpb25PYnNlcnZlciBidXQgbm90IHVuLXByZWZpeGVkIE11dGF0aW9uT2JzZXJ2ZXIuXG4vLyBNdXN0IHVzZSBgZ2xvYmFsYCBvciBgc2VsZmAgaW5zdGVhZCBvZiBgd2luZG93YCB0byB3b3JrIGluIGJvdGggZnJhbWVzIGFuZCB3ZWJcbi8vIHdvcmtlcnMuIGBnbG9iYWxgIGlzIGEgcHJvdmlzaW9uIG9mIEJyb3dzZXJpZnksIE1yLCBNcnMsIG9yIE1vcC5cblxuLyogZ2xvYmFscyBzZWxmICovXG52YXIgc2NvcGUgPSB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogc2VsZjtcbnZhciBCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IHNjb3BlLk11dGF0aW9uT2JzZXJ2ZXIgfHwgc2NvcGUuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcblxuLy8gTXV0YXRpb25PYnNlcnZlcnMgYXJlIGRlc2lyYWJsZSBiZWNhdXNlIHRoZXkgaGF2ZSBoaWdoIHByaW9yaXR5IGFuZCB3b3JrXG4vLyByZWxpYWJseSBldmVyeXdoZXJlIHRoZXkgYXJlIGltcGxlbWVudGVkLlxuLy8gVGhleSBhcmUgaW1wbGVtZW50ZWQgaW4gYWxsIG1vZGVybiBicm93c2Vycy5cbi8vXG4vLyAtIEFuZHJvaWQgNC00LjNcbi8vIC0gQ2hyb21lIDI2LTM0XG4vLyAtIEZpcmVmb3ggMTQtMjlcbi8vIC0gSW50ZXJuZXQgRXhwbG9yZXIgMTFcbi8vIC0gaVBhZCBTYWZhcmkgNi03LjFcbi8vIC0gaVBob25lIFNhZmFyaSA3LTcuMVxuLy8gLSBTYWZhcmkgNi03XG5pZiAodHlwZW9mIEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICByZXF1ZXN0Rmx1c2ggPSBtYWtlUmVxdWVzdENhbGxGcm9tTXV0YXRpb25PYnNlcnZlcihmbHVzaCk7XG5cbi8vIE1lc3NhZ2VDaGFubmVscyBhcmUgZGVzaXJhYmxlIGJlY2F1c2UgdGhleSBnaXZlIGRpcmVjdCBhY2Nlc3MgdG8gdGhlIEhUTUxcbi8vIHRhc2sgcXVldWUsIGFyZSBpbXBsZW1lbnRlZCBpbiBJbnRlcm5ldCBFeHBsb3JlciAxMCwgU2FmYXJpIDUuMC0xLCBhbmQgT3BlcmFcbi8vIDExLTEyLCBhbmQgaW4gd2ViIHdvcmtlcnMgaW4gbWFueSBlbmdpbmVzLlxuLy8gQWx0aG91Z2ggbWVzc2FnZSBjaGFubmVscyB5aWVsZCB0byBhbnkgcXVldWVkIHJlbmRlcmluZyBhbmQgSU8gdGFza3MsIHRoZXlcbi8vIHdvdWxkIGJlIGJldHRlciB0aGFuIGltcG9zaW5nIHRoZSA0bXMgZGVsYXkgb2YgdGltZXJzLlxuLy8gSG93ZXZlciwgdGhleSBkbyBub3Qgd29yayByZWxpYWJseSBpbiBJbnRlcm5ldCBFeHBsb3JlciBvciBTYWZhcmkuXG5cbi8vIEludGVybmV0IEV4cGxvcmVyIDEwIGlzIHRoZSBvbmx5IGJyb3dzZXIgdGhhdCBoYXMgc2V0SW1tZWRpYXRlIGJ1dCBkb2VzXG4vLyBub3QgaGF2ZSBNdXRhdGlvbk9ic2VydmVycy5cbi8vIEFsdGhvdWdoIHNldEltbWVkaWF0ZSB5aWVsZHMgdG8gdGhlIGJyb3dzZXIncyByZW5kZXJlciwgaXQgd291bGQgYmVcbi8vIHByZWZlcnJhYmxlIHRvIGZhbGxpbmcgYmFjayB0byBzZXRUaW1lb3V0IHNpbmNlIGl0IGRvZXMgbm90IGhhdmVcbi8vIHRoZSBtaW5pbXVtIDRtcyBwZW5hbHR5LlxuLy8gVW5mb3J0dW5hdGVseSB0aGVyZSBhcHBlYXJzIHRvIGJlIGEgYnVnIGluIEludGVybmV0IEV4cGxvcmVyIDEwIE1vYmlsZSAoYW5kXG4vLyBEZXNrdG9wIHRvIGEgbGVzc2VyIGV4dGVudCkgdGhhdCByZW5kZXJzIGJvdGggc2V0SW1tZWRpYXRlIGFuZFxuLy8gTWVzc2FnZUNoYW5uZWwgdXNlbGVzcyBmb3IgdGhlIHB1cnBvc2VzIG9mIEFTQVAuXG4vLyBodHRwczovL2dpdGh1Yi5jb20va3Jpc2tvd2FsL3EvaXNzdWVzLzM5NlxuXG4vLyBUaW1lcnMgYXJlIGltcGxlbWVudGVkIHVuaXZlcnNhbGx5LlxuLy8gV2UgZmFsbCBiYWNrIHRvIHRpbWVycyBpbiB3b3JrZXJzIGluIG1vc3QgZW5naW5lcywgYW5kIGluIGZvcmVncm91bmRcbi8vIGNvbnRleHRzIGluIHRoZSBmb2xsb3dpbmcgYnJvd3NlcnMuXG4vLyBIb3dldmVyLCBub3RlIHRoYXQgZXZlbiB0aGlzIHNpbXBsZSBjYXNlIHJlcXVpcmVzIG51YW5jZXMgdG8gb3BlcmF0ZSBpbiBhXG4vLyBicm9hZCBzcGVjdHJ1bSBvZiBicm93c2Vycy5cbi8vXG4vLyAtIEZpcmVmb3ggMy0xM1xuLy8gLSBJbnRlcm5ldCBFeHBsb3JlciA2LTlcbi8vIC0gaVBhZCBTYWZhcmkgNC4zXG4vLyAtIEx5bnggMi44Ljdcbn0gZWxzZSB7XG4gICAgcmVxdWVzdEZsdXNoID0gbWFrZVJlcXVlc3RDYWxsRnJvbVRpbWVyKGZsdXNoKTtcbn1cblxuLy8gYHJlcXVlc3RGbHVzaGAgcmVxdWVzdHMgdGhhdCB0aGUgaGlnaCBwcmlvcml0eSBldmVudCBxdWV1ZSBiZSBmbHVzaGVkIGFzXG4vLyBzb29uIGFzIHBvc3NpYmxlLlxuLy8gVGhpcyBpcyB1c2VmdWwgdG8gcHJldmVudCBhbiBlcnJvciB0aHJvd24gaW4gYSB0YXNrIGZyb20gc3RhbGxpbmcgdGhlIGV2ZW50XG4vLyBxdWV1ZSBpZiB0aGUgZXhjZXB0aW9uIGhhbmRsZWQgYnkgTm9kZS5qc+KAmXNcbi8vIGBwcm9jZXNzLm9uKFwidW5jYXVnaHRFeGNlcHRpb25cIilgIG9yIGJ5IGEgZG9tYWluLlxucmF3QXNhcC5yZXF1ZXN0Rmx1c2ggPSByZXF1ZXN0Rmx1c2g7XG5cbi8vIFRvIHJlcXVlc3QgYSBoaWdoIHByaW9yaXR5IGV2ZW50LCB3ZSBpbmR1Y2UgYSBtdXRhdGlvbiBvYnNlcnZlciBieSB0b2dnbGluZ1xuLy8gdGhlIHRleHQgb2YgYSB0ZXh0IG5vZGUgYmV0d2VlbiBcIjFcIiBhbmQgXCItMVwiLlxuZnVuY3Rpb24gbWFrZVJlcXVlc3RDYWxsRnJvbU11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgdG9nZ2xlID0gMTtcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIoY2FsbGJhY2spO1xuICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7XG4gICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pO1xuICAgIHJldHVybiBmdW5jdGlvbiByZXF1ZXN0Q2FsbCgpIHtcbiAgICAgICAgdG9nZ2xlID0gLXRvZ2dsZTtcbiAgICAgICAgbm9kZS5kYXRhID0gdG9nZ2xlO1xuICAgIH07XG59XG5cbi8vIFRoZSBtZXNzYWdlIGNoYW5uZWwgdGVjaG5pcXVlIHdhcyBkaXNjb3ZlcmVkIGJ5IE1hbHRlIFVibCBhbmQgd2FzIHRoZVxuLy8gb3JpZ2luYWwgZm91bmRhdGlvbiBmb3IgdGhpcyBsaWJyYXJ5LlxuLy8gaHR0cDovL3d3dy5ub25ibG9ja2luZy5pby8yMDExLzA2L3dpbmRvd25leHR0aWNrLmh0bWxcblxuLy8gU2FmYXJpIDYuMC41IChhdCBsZWFzdCkgaW50ZXJtaXR0ZW50bHkgZmFpbHMgdG8gY3JlYXRlIG1lc3NhZ2UgcG9ydHMgb24gYVxuLy8gcGFnZSdzIGZpcnN0IGxvYWQuIFRoYW5rZnVsbHksIHRoaXMgdmVyc2lvbiBvZiBTYWZhcmkgc3VwcG9ydHNcbi8vIE11dGF0aW9uT2JzZXJ2ZXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRvIGZhbGwgYmFjayBpbiB0aGF0IGNhc2UuXG5cbi8vIGZ1bmN0aW9uIG1ha2VSZXF1ZXN0Q2FsbEZyb21NZXNzYWdlQ2hhbm5lbChjYWxsYmFjaykge1xuLy8gICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4vLyAgICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBjYWxsYmFjaztcbi8vICAgICByZXR1cm4gZnVuY3Rpb24gcmVxdWVzdENhbGwoKSB7XG4vLyAgICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4vLyAgICAgfTtcbi8vIH1cblxuLy8gRm9yIHJlYXNvbnMgZXhwbGFpbmVkIGFib3ZlLCB3ZSBhcmUgYWxzbyB1bmFibGUgdG8gdXNlIGBzZXRJbW1lZGlhdGVgXG4vLyB1bmRlciBhbnkgY2lyY3Vtc3RhbmNlcy5cbi8vIEV2ZW4gaWYgd2Ugd2VyZSwgdGhlcmUgaXMgYW5vdGhlciBidWcgaW4gSW50ZXJuZXQgRXhwbG9yZXIgMTAuXG4vLyBJdCBpcyBub3Qgc3VmZmljaWVudCB0byBhc3NpZ24gYHNldEltbWVkaWF0ZWAgdG8gYHJlcXVlc3RGbHVzaGAgYmVjYXVzZVxuLy8gYHNldEltbWVkaWF0ZWAgbXVzdCBiZSBjYWxsZWQgKmJ5IG5hbWUqIGFuZCB0aGVyZWZvcmUgbXVzdCBiZSB3cmFwcGVkIGluIGFcbi8vIGNsb3N1cmUuXG4vLyBOZXZlciBmb3JnZXQuXG5cbi8vIGZ1bmN0aW9uIG1ha2VSZXF1ZXN0Q2FsbEZyb21TZXRJbW1lZGlhdGUoY2FsbGJhY2spIHtcbi8vICAgICByZXR1cm4gZnVuY3Rpb24gcmVxdWVzdENhbGwoKSB7XG4vLyAgICAgICAgIHNldEltbWVkaWF0ZShjYWxsYmFjayk7XG4vLyAgICAgfTtcbi8vIH1cblxuLy8gU2FmYXJpIDYuMCBoYXMgYSBwcm9ibGVtIHdoZXJlIHRpbWVycyB3aWxsIGdldCBsb3N0IHdoaWxlIHRoZSB1c2VyIGlzXG4vLyBzY3JvbGxpbmcuIFRoaXMgcHJvYmxlbSBkb2VzIG5vdCBpbXBhY3QgQVNBUCBiZWNhdXNlIFNhZmFyaSA2LjAgc3VwcG9ydHNcbi8vIG11dGF0aW9uIG9ic2VydmVycywgc28gdGhhdCBpbXBsZW1lbnRhdGlvbiBpcyB1c2VkIGluc3RlYWQuXG4vLyBIb3dldmVyLCBpZiB3ZSBldmVyIGVsZWN0IHRvIHVzZSB0aW1lcnMgaW4gU2FmYXJpLCB0aGUgcHJldmFsZW50IHdvcmstYXJvdW5kXG4vLyBpcyB0byBhZGQgYSBzY3JvbGwgZXZlbnQgbGlzdGVuZXIgdGhhdCBjYWxscyBmb3IgYSBmbHVzaC5cblxuLy8gYHNldFRpbWVvdXRgIGRvZXMgbm90IGNhbGwgdGhlIHBhc3NlZCBjYWxsYmFjayBpZiB0aGUgZGVsYXkgaXMgbGVzcyB0aGFuXG4vLyBhcHByb3hpbWF0ZWx5IDcgaW4gd2ViIHdvcmtlcnMgaW4gRmlyZWZveCA4IHRocm91Z2ggMTgsIGFuZCBzb21ldGltZXMgbm90XG4vLyBldmVuIHRoZW4uXG5cbmZ1bmN0aW9uIG1ha2VSZXF1ZXN0Q2FsbEZyb21UaW1lcihjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiByZXF1ZXN0Q2FsbCgpIHtcbiAgICAgICAgLy8gV2UgZGlzcGF0Y2ggYSB0aW1lb3V0IHdpdGggYSBzcGVjaWZpZWQgZGVsYXkgb2YgMCBmb3IgZW5naW5lcyB0aGF0XG4gICAgICAgIC8vIGNhbiByZWxpYWJseSBhY2NvbW1vZGF0ZSB0aGF0IHJlcXVlc3QuIFRoaXMgd2lsbCB1c3VhbGx5IGJlIHNuYXBwZWRcbiAgICAgICAgLy8gdG8gYSA0IG1pbGlzZWNvbmQgZGVsYXksIGJ1dCBvbmNlIHdlJ3JlIGZsdXNoaW5nLCB0aGVyZSdzIG5vIGRlbGF5XG4gICAgICAgIC8vIGJldHdlZW4gZXZlbnRzLlxuICAgICAgICB2YXIgdGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQoaGFuZGxlVGltZXIsIDApO1xuICAgICAgICAvLyBIb3dldmVyLCBzaW5jZSB0aGlzIHRpbWVyIGdldHMgZnJlcXVlbnRseSBkcm9wcGVkIGluIEZpcmVmb3hcbiAgICAgICAgLy8gd29ya2Vycywgd2UgZW5saXN0IGFuIGludGVydmFsIGhhbmRsZSB0aGF0IHdpbGwgdHJ5IHRvIGZpcmVcbiAgICAgICAgLy8gYW4gZXZlbnQgMjAgdGltZXMgcGVyIHNlY29uZCB1bnRpbCBpdCBzdWNjZWVkcy5cbiAgICAgICAgdmFyIGludGVydmFsSGFuZGxlID0gc2V0SW50ZXJ2YWwoaGFuZGxlVGltZXIsIDUwKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVUaW1lcigpIHtcbiAgICAgICAgICAgIC8vIFdoaWNoZXZlciB0aW1lciBzdWNjZWVkcyB3aWxsIGNhbmNlbCBib3RoIHRpbWVycyBhbmRcbiAgICAgICAgICAgIC8vIGV4ZWN1dGUgdGhlIGNhbGxiYWNrLlxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXRIYW5kbGUpO1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZSk7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLy8gVGhpcyBpcyBmb3IgYGFzYXAuanNgIG9ubHkuXG4vLyBJdHMgbmFtZSB3aWxsIGJlIHBlcmlvZGljYWxseSByYW5kb21pemVkIHRvIGJyZWFrIGFueSBjb2RlIHRoYXQgZGVwZW5kcyBvblxuLy8gaXRzIGV4aXN0ZW5jZS5cbnJhd0FzYXAubWFrZVJlcXVlc3RDYWxsRnJvbVRpbWVyID0gbWFrZVJlcXVlc3RDYWxsRnJvbVRpbWVyO1xuXG4vLyBBU0FQIHdhcyBvcmlnaW5hbGx5IGEgbmV4dFRpY2sgc2hpbSBpbmNsdWRlZCBpbiBRLiBUaGlzIHdhcyBmYWN0b3JlZCBvdXRcbi8vIGludG8gdGhpcyBBU0FQIHBhY2thZ2UuIEl0IHdhcyBsYXRlciBhZGFwdGVkIHRvIFJTVlAgd2hpY2ggbWFkZSBmdXJ0aGVyXG4vLyBhbWVuZG1lbnRzLiBUaGVzZSBkZWNpc2lvbnMsIHBhcnRpY3VsYXJseSB0byBtYXJnaW5hbGl6ZSBNZXNzYWdlQ2hhbm5lbCBhbmRcbi8vIHRvIGNhcHR1cmUgdGhlIE11dGF0aW9uT2JzZXJ2ZXIgaW1wbGVtZW50YXRpb24gaW4gYSBjbG9zdXJlLCB3ZXJlIGludGVncmF0ZWRcbi8vIGJhY2sgaW50byBBU0FQIHByb3Blci5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS90aWxkZWlvL3JzdnAuanMvYmxvYi9jZGRmNzIzMjU0NmE5Y2Y4NTg1MjRiNzVjZGU2ZjllZGY3MjYyMGE3L2xpYi9yc3ZwL2FzYXAuanNcbiIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNoYWluKCl7XHJcbiAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICB2YXIgYXJncyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxyXG4gICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXVxyXG5cclxuICBhcmdzID0gYXJncy5maWx0ZXIoZnVuY3Rpb24oZm4peyByZXR1cm4gZm4gIT0gbnVsbCB9KVxyXG5cclxuICBpZiAoYXJncy5sZW5ndGggPT09IDApIHJldHVybiB1bmRlZmluZWRcclxuICBpZiAoYXJncy5sZW5ndGggPT09IDEpIHJldHVybiBhcmdzWzBdXHJcblxyXG4gIHJldHVybiBhcmdzLnJlZHVjZShmdW5jdGlvbihjdXJyZW50LCBuZXh0KXtcclxuICAgIHJldHVybiBmdW5jdGlvbiBjaGFpbmVkRnVuY3Rpb24oKSB7XHJcbiAgICAgIGN1cnJlbnQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxuICAgICAgbmV4dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxuICB9KVxyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGFkZENsYXNzO1xuXG52YXIgX2hhc0NsYXNzID0gcmVxdWlyZSgnLi9oYXNDbGFzcycpO1xuXG52YXIgX2hhc0NsYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hhc0NsYXNzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7ZWxzZSBpZiAoISgwLCBfaGFzQ2xhc3MyLmRlZmF1bHQpKGVsZW1lbnQpKSBlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lICsgJyAnICsgY2xhc3NOYW1lO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBoYXNDbGFzcztcbmZ1bmN0aW9uIGhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSkge1xuICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHJldHVybiAhIWNsYXNzTmFtZSAmJiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO2Vsc2UgcmV0dXJuIChcIiBcIiArIGVsZW1lbnQuY2xhc3NOYW1lICsgXCIgXCIpLmluZGV4T2YoXCIgXCIgKyBjbGFzc05hbWUgKyBcIiBcIikgIT09IC0xO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gIGlmIChlbGVtZW50LmNsYXNzTGlzdCkgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7ZWxzZSBlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIGNsYXNzTmFtZSArICcoPzpcXFxcc3wkKScsICdnJyksICckMScpLnJlcGxhY2UoL1xccysvZywgJyAnKS5yZXBsYWNlKC9eXFxzKnxcXHMqJC9nLCAnJyk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuYW5pbWF0aW9uRW5kID0gZXhwb3J0cy5hbmltYXRpb25EZWxheSA9IGV4cG9ydHMuYW5pbWF0aW9uVGltaW5nID0gZXhwb3J0cy5hbmltYXRpb25EdXJhdGlvbiA9IGV4cG9ydHMuYW5pbWF0aW9uTmFtZSA9IGV4cG9ydHMudHJhbnNpdGlvbkVuZCA9IGV4cG9ydHMudHJhbnNpdGlvbkR1cmF0aW9uID0gZXhwb3J0cy50cmFuc2l0aW9uRGVsYXkgPSBleHBvcnRzLnRyYW5zaXRpb25UaW1pbmcgPSBleHBvcnRzLnRyYW5zaXRpb25Qcm9wZXJ0eSA9IGV4cG9ydHMudHJhbnNmb3JtID0gdW5kZWZpbmVkO1xuXG52YXIgX2luRE9NID0gcmVxdWlyZSgnLi4vdXRpbC9pbkRPTScpO1xuXG52YXIgX2luRE9NMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2luRE9NKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHRyYW5zZm9ybSA9ICd0cmFuc2Zvcm0nO1xudmFyIHByZWZpeCA9IHZvaWQgMCxcbiAgICB0cmFuc2l0aW9uRW5kID0gdm9pZCAwLFxuICAgIGFuaW1hdGlvbkVuZCA9IHZvaWQgMDtcbnZhciB0cmFuc2l0aW9uUHJvcGVydHkgPSB2b2lkIDAsXG4gICAgdHJhbnNpdGlvbkR1cmF0aW9uID0gdm9pZCAwLFxuICAgIHRyYW5zaXRpb25UaW1pbmcgPSB2b2lkIDAsXG4gICAgdHJhbnNpdGlvbkRlbGF5ID0gdm9pZCAwO1xudmFyIGFuaW1hdGlvbk5hbWUgPSB2b2lkIDAsXG4gICAgYW5pbWF0aW9uRHVyYXRpb24gPSB2b2lkIDAsXG4gICAgYW5pbWF0aW9uVGltaW5nID0gdm9pZCAwLFxuICAgIGFuaW1hdGlvbkRlbGF5ID0gdm9pZCAwO1xuXG5pZiAoX2luRE9NMi5kZWZhdWx0KSB7XG4gIHZhciBfZ2V0VHJhbnNpdGlvblByb3BlcnQgPSBnZXRUcmFuc2l0aW9uUHJvcGVydGllcygpO1xuXG4gIHByZWZpeCA9IF9nZXRUcmFuc2l0aW9uUHJvcGVydC5wcmVmaXg7XG4gIGV4cG9ydHMudHJhbnNpdGlvbkVuZCA9IHRyYW5zaXRpb25FbmQgPSBfZ2V0VHJhbnNpdGlvblByb3BlcnQudHJhbnNpdGlvbkVuZDtcbiAgZXhwb3J0cy5hbmltYXRpb25FbmQgPSBhbmltYXRpb25FbmQgPSBfZ2V0VHJhbnNpdGlvblByb3BlcnQuYW5pbWF0aW9uRW5kO1xuXG5cbiAgZXhwb3J0cy50cmFuc2Zvcm0gPSB0cmFuc2Zvcm0gPSBwcmVmaXggKyAnLScgKyB0cmFuc2Zvcm07XG4gIGV4cG9ydHMudHJhbnNpdGlvblByb3BlcnR5ID0gdHJhbnNpdGlvblByb3BlcnR5ID0gcHJlZml4ICsgJy10cmFuc2l0aW9uLXByb3BlcnR5JztcbiAgZXhwb3J0cy50cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gPSBwcmVmaXggKyAnLXRyYW5zaXRpb24tZHVyYXRpb24nO1xuICBleHBvcnRzLnRyYW5zaXRpb25EZWxheSA9IHRyYW5zaXRpb25EZWxheSA9IHByZWZpeCArICctdHJhbnNpdGlvbi1kZWxheSc7XG4gIGV4cG9ydHMudHJhbnNpdGlvblRpbWluZyA9IHRyYW5zaXRpb25UaW1pbmcgPSBwcmVmaXggKyAnLXRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uJztcblxuICBleHBvcnRzLmFuaW1hdGlvbk5hbWUgPSBhbmltYXRpb25OYW1lID0gcHJlZml4ICsgJy1hbmltYXRpb24tbmFtZSc7XG4gIGV4cG9ydHMuYW5pbWF0aW9uRHVyYXRpb24gPSBhbmltYXRpb25EdXJhdGlvbiA9IHByZWZpeCArICctYW5pbWF0aW9uLWR1cmF0aW9uJztcbiAgZXhwb3J0cy5hbmltYXRpb25UaW1pbmcgPSBhbmltYXRpb25UaW1pbmcgPSBwcmVmaXggKyAnLWFuaW1hdGlvbi1kZWxheSc7XG4gIGV4cG9ydHMuYW5pbWF0aW9uRGVsYXkgPSBhbmltYXRpb25EZWxheSA9IHByZWZpeCArICctYW5pbWF0aW9uLXRpbWluZy1mdW5jdGlvbic7XG59XG5cbmV4cG9ydHMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuZXhwb3J0cy50cmFuc2l0aW9uUHJvcGVydHkgPSB0cmFuc2l0aW9uUHJvcGVydHk7XG5leHBvcnRzLnRyYW5zaXRpb25UaW1pbmcgPSB0cmFuc2l0aW9uVGltaW5nO1xuZXhwb3J0cy50cmFuc2l0aW9uRGVsYXkgPSB0cmFuc2l0aW9uRGVsYXk7XG5leHBvcnRzLnRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcbmV4cG9ydHMudHJhbnNpdGlvbkVuZCA9IHRyYW5zaXRpb25FbmQ7XG5leHBvcnRzLmFuaW1hdGlvbk5hbWUgPSBhbmltYXRpb25OYW1lO1xuZXhwb3J0cy5hbmltYXRpb25EdXJhdGlvbiA9IGFuaW1hdGlvbkR1cmF0aW9uO1xuZXhwb3J0cy5hbmltYXRpb25UaW1pbmcgPSBhbmltYXRpb25UaW1pbmc7XG5leHBvcnRzLmFuaW1hdGlvbkRlbGF5ID0gYW5pbWF0aW9uRGVsYXk7XG5leHBvcnRzLmFuaW1hdGlvbkVuZCA9IGFuaW1hdGlvbkVuZDtcbmV4cG9ydHMuZGVmYXVsdCA9IHtcbiAgdHJhbnNmb3JtOiB0cmFuc2Zvcm0sXG4gIGVuZDogdHJhbnNpdGlvbkVuZCxcbiAgcHJvcGVydHk6IHRyYW5zaXRpb25Qcm9wZXJ0eSxcbiAgdGltaW5nOiB0cmFuc2l0aW9uVGltaW5nLFxuICBkZWxheTogdHJhbnNpdGlvbkRlbGF5LFxuICBkdXJhdGlvbjogdHJhbnNpdGlvbkR1cmF0aW9uXG59O1xuXG5cbmZ1bmN0aW9uIGdldFRyYW5zaXRpb25Qcm9wZXJ0aWVzKCkge1xuICB2YXIgc3R5bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKS5zdHlsZTtcblxuICB2YXIgdmVuZG9yTWFwID0ge1xuICAgIE86IGZ1bmN0aW9uIE8oZSkge1xuICAgICAgcmV0dXJuICdvJyArIGUudG9Mb3dlckNhc2UoKTtcbiAgICB9LFxuICAgIE1vejogZnVuY3Rpb24gTW96KGUpIHtcbiAgICAgIHJldHVybiBlLnRvTG93ZXJDYXNlKCk7XG4gICAgfSxcbiAgICBXZWJraXQ6IGZ1bmN0aW9uIFdlYmtpdChlKSB7XG4gICAgICByZXR1cm4gJ3dlYmtpdCcgKyBlO1xuICAgIH0sXG4gICAgbXM6IGZ1bmN0aW9uIG1zKGUpIHtcbiAgICAgIHJldHVybiAnTVMnICsgZTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIHZlbmRvcnMgPSBPYmplY3Qua2V5cyh2ZW5kb3JNYXApO1xuXG4gIHZhciB0cmFuc2l0aW9uRW5kID0gdm9pZCAwLFxuICAgICAgYW5pbWF0aW9uRW5kID0gdm9pZCAwO1xuICB2YXIgcHJlZml4ID0gJyc7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHZlbmRvciA9IHZlbmRvcnNbaV07XG5cbiAgICBpZiAodmVuZG9yICsgJ1RyYW5zaXRpb25Qcm9wZXJ0eScgaW4gc3R5bGUpIHtcbiAgICAgIHByZWZpeCA9ICctJyArIHZlbmRvci50b0xvd2VyQ2FzZSgpO1xuICAgICAgdHJhbnNpdGlvbkVuZCA9IHZlbmRvck1hcFt2ZW5kb3JdKCdUcmFuc2l0aW9uRW5kJyk7XG4gICAgICBhbmltYXRpb25FbmQgPSB2ZW5kb3JNYXBbdmVuZG9yXSgnQW5pbWF0aW9uRW5kJyk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZiAoIXRyYW5zaXRpb25FbmQgJiYgJ3RyYW5zaXRpb25Qcm9wZXJ0eScgaW4gc3R5bGUpIHRyYW5zaXRpb25FbmQgPSAndHJhbnNpdGlvbmVuZCc7XG5cbiAgaWYgKCFhbmltYXRpb25FbmQgJiYgJ2FuaW1hdGlvbk5hbWUnIGluIHN0eWxlKSBhbmltYXRpb25FbmQgPSAnYW5pbWF0aW9uZW5kJztcblxuICBzdHlsZSA9IG51bGw7XG5cbiAgcmV0dXJuIHsgYW5pbWF0aW9uRW5kOiBhbmltYXRpb25FbmQsIHRyYW5zaXRpb25FbmQ6IHRyYW5zaXRpb25FbmQsIHByZWZpeDogcHJlZml4IH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gISEodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50ICYmIHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9pbkRPTSA9IHJlcXVpcmUoJy4vaW5ET00nKTtcblxudmFyIF9pbkRPTTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pbkRPTSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbnZhciB2ZW5kb3JzID0gWycnLCAnd2Via2l0JywgJ21veicsICdvJywgJ21zJ107XG52YXIgY2FuY2VsID0gJ2NsZWFyVGltZW91dCc7XG52YXIgcmFmID0gZmFsbGJhY2s7XG52YXIgY29tcGF0UmFmID0gdm9pZCAwO1xuXG52YXIgZ2V0S2V5ID0gZnVuY3Rpb24gZ2V0S2V5KHZlbmRvciwgaykge1xuICByZXR1cm4gdmVuZG9yICsgKCF2ZW5kb3IgPyBrIDoga1swXS50b1VwcGVyQ2FzZSgpICsgay5zdWJzdHIoMSkpICsgJ0FuaW1hdGlvbkZyYW1lJztcbn07XG5cbmlmIChfaW5ET00yLmRlZmF1bHQpIHtcbiAgdmVuZG9ycy5zb21lKGZ1bmN0aW9uICh2ZW5kb3IpIHtcbiAgICB2YXIgcmFmS2V5ID0gZ2V0S2V5KHZlbmRvciwgJ3JlcXVlc3QnKTtcblxuICAgIGlmIChyYWZLZXkgaW4gd2luZG93KSB7XG4gICAgICBjYW5jZWwgPSBnZXRLZXkodmVuZG9yLCAnY2FuY2VsJyk7XG4gICAgICByZXR1cm4gcmFmID0gZnVuY3Rpb24gcmFmKGNiKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3dbcmFmS2V5XShjYik7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbi8qIGh0dHBzOi8vZ2l0aHViLmNvbS9jb21wb25lbnQvcmFmICovXG52YXIgcHJldiA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuZnVuY3Rpb24gZmFsbGJhY2soZm4pIHtcbiAgdmFyIGN1cnIgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcbiAgICAgIG1zID0gTWF0aC5tYXgoMCwgMTYgLSAoY3VyciAtIHByZXYpKSxcbiAgICAgIHJlcSA9IHNldFRpbWVvdXQoZm4sIG1zKTtcblxuICBwcmV2ID0gY3VycjtcbiAgcmV0dXJuIHJlcTtcbn1cblxuY29tcGF0UmFmID0gZnVuY3Rpb24gY29tcGF0UmFmKGNiKSB7XG4gIHJldHVybiByYWYoY2IpO1xufTtcbmNvbXBhdFJhZi5jYW5jZWwgPSBmdW5jdGlvbiAoaWQpIHtcbiAgd2luZG93W2NhbmNlbF0gJiYgdHlwZW9mIHdpbmRvd1tjYW5jZWxdID09PSAnZnVuY3Rpb24nICYmIHdpbmRvd1tjYW5jZWxdKGlkKTtcbn07XG5leHBvcnRzLmRlZmF1bHQgPSBjb21wYXRSYWY7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciB1cHBlcmNhc2VQYXR0ZXJuID0gL1tBLVpdL2c7XG52YXIgbXNQYXR0ZXJuID0gL15tcy0vO1xudmFyIGNhY2hlID0ge307XG5cbmZ1bmN0aW9uIGh5cGhlbmF0ZVN0eWxlTmFtZShzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nIGluIGNhY2hlXG4gICAgPyBjYWNoZVtzdHJpbmddXG4gICAgOiBjYWNoZVtzdHJpbmddID0gc3RyaW5nXG4gICAgICAucmVwbGFjZSh1cHBlcmNhc2VQYXR0ZXJuLCAnLSQmJylcbiAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAucmVwbGFjZShtc1BhdHRlcm4sICctbXMtJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaHlwaGVuYXRlU3R5bGVOYW1lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gY2FsYztcblxudmFyIF9qb2luUHJlZml4ZWRWYWx1ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2pvaW5QcmVmaXhlZFZhbHVlJyk7XG5cbnZhciBfam9pblByZWZpeGVkVmFsdWUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfam9pblByZWZpeGVkVmFsdWUpO1xuXG52YXIgX2lzUHJlZml4ZWRWYWx1ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2lzUHJlZml4ZWRWYWx1ZScpO1xuXG52YXIgX2lzUHJlZml4ZWRWYWx1ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1ByZWZpeGVkVmFsdWUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBjYWxjKHByb3BlcnR5LCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhKDAsIF9pc1ByZWZpeGVkVmFsdWUyLmRlZmF1bHQpKHZhbHVlKSAmJiB2YWx1ZS5pbmRleE9mKCdjYWxjKCcpID4gLTEpIHtcbiAgICByZXR1cm4gKDAsIF9qb2luUHJlZml4ZWRWYWx1ZTIuZGVmYXVsdCkocHJvcGVydHksIHZhbHVlLCBmdW5jdGlvbiAocHJlZml4LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL2NhbGNcXCgvZywgcHJlZml4ICsgJ2NhbGMoJyk7XG4gICAgfSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGN1cnNvcjtcblxudmFyIF9qb2luUHJlZml4ZWRWYWx1ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2pvaW5QcmVmaXhlZFZhbHVlJyk7XG5cbnZhciBfam9pblByZWZpeGVkVmFsdWUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfam9pblByZWZpeGVkVmFsdWUpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG52YXIgdmFsdWVzID0ge1xuICAnem9vbS1pbic6IHRydWUsXG4gICd6b29tLW91dCc6IHRydWUsXG4gIGdyYWI6IHRydWUsXG4gIGdyYWJiaW5nOiB0cnVlXG59O1xuXG5mdW5jdGlvbiBjdXJzb3IocHJvcGVydHksIHZhbHVlKSB7XG4gIGlmIChwcm9wZXJ0eSA9PT0gJ2N1cnNvcicgJiYgdmFsdWVzW3ZhbHVlXSkge1xuICAgIHJldHVybiAoMCwgX2pvaW5QcmVmaXhlZFZhbHVlMi5kZWZhdWx0KShwcm9wZXJ0eSwgdmFsdWUpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBmbGV4O1xudmFyIHZhbHVlcyA9IHsgZmxleDogdHJ1ZSwgJ2lubGluZS1mbGV4JzogdHJ1ZSB9O1xuXG5mdW5jdGlvbiBmbGV4KHByb3BlcnR5LCB2YWx1ZSkge1xuICBpZiAocHJvcGVydHkgPT09ICdkaXNwbGF5JyAmJiB2YWx1ZXNbdmFsdWVdKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGRpc3BsYXk6IFsnLXdlYmtpdC1ib3gnLCAnLW1vei1ib3gnLCAnLW1zLScgKyB2YWx1ZSArICdib3gnLCAnLXdlYmtpdC0nICsgdmFsdWUsIHZhbHVlXVxuICAgIH07XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IGZsZXhib3hJRTtcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIGFsdGVybmF0aXZlVmFsdWVzID0ge1xuICAnc3BhY2UtYXJvdW5kJzogJ2Rpc3RyaWJ1dGUnLFxuICAnc3BhY2UtYmV0d2Vlbic6ICdqdXN0aWZ5JyxcbiAgJ2ZsZXgtc3RhcnQnOiAnc3RhcnQnLFxuICAnZmxleC1lbmQnOiAnZW5kJ1xufTtcbnZhciBhbHRlcm5hdGl2ZVByb3BzID0ge1xuICBhbGlnbkNvbnRlbnQ6ICdtc0ZsZXhMaW5lUGFjaycsXG4gIGFsaWduU2VsZjogJ21zRmxleEl0ZW1BbGlnbicsXG4gIGFsaWduSXRlbXM6ICdtc0ZsZXhBbGlnbicsXG4gIGp1c3RpZnlDb250ZW50OiAnbXNGbGV4UGFjaycsXG4gIG9yZGVyOiAnbXNGbGV4T3JkZXInLFxuICBmbGV4R3JvdzogJ21zRmxleFBvc2l0aXZlJyxcbiAgZmxleFNocmluazogJ21zRmxleE5lZ2F0aXZlJyxcbiAgZmxleEJhc2lzOiAnbXNQcmVmZXJyZWRTaXplJ1xufTtcblxuZnVuY3Rpb24gZmxleGJveElFKHByb3BlcnR5LCB2YWx1ZSkge1xuICBpZiAoYWx0ZXJuYXRpdmVQcm9wc1twcm9wZXJ0eV0pIHtcbiAgICByZXR1cm4gX2RlZmluZVByb3BlcnR5KHt9LCBhbHRlcm5hdGl2ZVByb3BzW3Byb3BlcnR5XSwgYWx0ZXJuYXRpdmVWYWx1ZXNbdmFsdWVdIHx8IHZhbHVlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZmxleGJveE9sZDtcblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaiwga2V5LCB2YWx1ZSkgeyBpZiAoa2V5IGluIG9iaikgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHsgdmFsdWU6IHZhbHVlLCBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlIH0pOyB9IGVsc2UgeyBvYmpba2V5XSA9IHZhbHVlOyB9IHJldHVybiBvYmo7IH1cblxudmFyIGFsdGVybmF0aXZlVmFsdWVzID0ge1xuICAnc3BhY2UtYXJvdW5kJzogJ2p1c3RpZnknLFxuICAnc3BhY2UtYmV0d2Vlbic6ICdqdXN0aWZ5JyxcbiAgJ2ZsZXgtc3RhcnQnOiAnc3RhcnQnLFxuICAnZmxleC1lbmQnOiAnZW5kJyxcbiAgJ3dyYXAtcmV2ZXJzZSc6ICdtdWx0aXBsZScsXG4gIHdyYXA6ICdtdWx0aXBsZSdcbn07XG5cbnZhciBhbHRlcm5hdGl2ZVByb3BzID0ge1xuICBhbGlnbkl0ZW1zOiAnV2Via2l0Qm94QWxpZ24nLFxuICBqdXN0aWZ5Q29udGVudDogJ1dlYmtpdEJveFBhY2snLFxuICBmbGV4V3JhcDogJ1dlYmtpdEJveExpbmVzJ1xufTtcblxuZnVuY3Rpb24gZmxleGJveE9sZChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgaWYgKHByb3BlcnR5ID09PSAnZmxleERpcmVjdGlvbicgJiYgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB7XG4gICAgICBXZWJraXRCb3hPcmllbnQ6IHZhbHVlLmluZGV4T2YoJ2NvbHVtbicpID4gLTEgPyAndmVydGljYWwnIDogJ2hvcml6b250YWwnLFxuICAgICAgV2Via2l0Qm94RGlyZWN0aW9uOiB2YWx1ZS5pbmRleE9mKCdyZXZlcnNlJykgPiAtMSA/ICdyZXZlcnNlJyA6ICdub3JtYWwnXG4gICAgfTtcbiAgfVxuICBpZiAoYWx0ZXJuYXRpdmVQcm9wc1twcm9wZXJ0eV0pIHtcbiAgICByZXR1cm4gX2RlZmluZVByb3BlcnR5KHt9LCBhbHRlcm5hdGl2ZVByb3BzW3Byb3BlcnR5XSwgYWx0ZXJuYXRpdmVWYWx1ZXNbdmFsdWVdIHx8IHZhbHVlKTtcbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZ3JhZGllbnQ7XG5cbnZhciBfam9pblByZWZpeGVkVmFsdWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9qb2luUHJlZml4ZWRWYWx1ZScpO1xuXG52YXIgX2pvaW5QcmVmaXhlZFZhbHVlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5QcmVmaXhlZFZhbHVlKTtcblxudmFyIF9pc1ByZWZpeGVkVmFsdWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9pc1ByZWZpeGVkVmFsdWUnKTtcblxudmFyIF9pc1ByZWZpeGVkVmFsdWUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQcmVmaXhlZFZhbHVlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHZhbHVlcyA9IC9saW5lYXItZ3JhZGllbnR8cmFkaWFsLWdyYWRpZW50fHJlcGVhdGluZy1saW5lYXItZ3JhZGllbnR8cmVwZWF0aW5nLXJhZGlhbC1ncmFkaWVudC87XG5cbmZ1bmN0aW9uIGdyYWRpZW50KHByb3BlcnR5LCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiAhKDAsIF9pc1ByZWZpeGVkVmFsdWUyLmRlZmF1bHQpKHZhbHVlKSAmJiB2YWx1ZS5tYXRjaCh2YWx1ZXMpICE9PSBudWxsKSB7XG4gICAgcmV0dXJuICgwLCBfam9pblByZWZpeGVkVmFsdWUyLmRlZmF1bHQpKHByb3BlcnR5LCB2YWx1ZSk7XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHBvc2l0aW9uO1xuZnVuY3Rpb24gcG9zaXRpb24ocHJvcGVydHksIHZhbHVlKSB7XG4gIGlmIChwcm9wZXJ0eSA9PT0gJ3Bvc2l0aW9uJyAmJiB2YWx1ZSA9PT0gJ3N0aWNreScpIHtcbiAgICByZXR1cm4geyBwb3NpdGlvbjogWyctd2Via2l0LXN0aWNreScsICdzdGlja3knXSB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBzaXppbmc7XG5cbnZhciBfam9pblByZWZpeGVkVmFsdWUgPSByZXF1aXJlKCcuLi8uLi91dGlscy9qb2luUHJlZml4ZWRWYWx1ZScpO1xuXG52YXIgX2pvaW5QcmVmaXhlZFZhbHVlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2pvaW5QcmVmaXhlZFZhbHVlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIHByb3BlcnRpZXMgPSB7XG4gIG1heEhlaWdodDogdHJ1ZSxcbiAgbWF4V2lkdGg6IHRydWUsXG4gIHdpZHRoOiB0cnVlLFxuICBoZWlnaHQ6IHRydWUsXG4gIGNvbHVtbldpZHRoOiB0cnVlLFxuICBtaW5XaWR0aDogdHJ1ZSxcbiAgbWluSGVpZ2h0OiB0cnVlXG59O1xudmFyIHZhbHVlcyA9IHtcbiAgJ21pbi1jb250ZW50JzogdHJ1ZSxcbiAgJ21heC1jb250ZW50JzogdHJ1ZSxcbiAgJ2ZpbGwtYXZhaWxhYmxlJzogdHJ1ZSxcbiAgJ2ZpdC1jb250ZW50JzogdHJ1ZSxcbiAgJ2NvbnRhaW4tZmxvYXRzJzogdHJ1ZVxufTtcblxuZnVuY3Rpb24gc2l6aW5nKHByb3BlcnR5LCB2YWx1ZSkge1xuICBpZiAocHJvcGVydGllc1twcm9wZXJ0eV0gJiYgdmFsdWVzW3ZhbHVlXSkge1xuICAgIHJldHVybiAoMCwgX2pvaW5QcmVmaXhlZFZhbHVlMi5kZWZhdWx0KShwcm9wZXJ0eSwgdmFsdWUpO1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB0cmFuc2l0aW9uO1xuXG52YXIgX2h5cGhlbmF0ZVN0eWxlTmFtZSA9IHJlcXVpcmUoJ2h5cGhlbmF0ZS1zdHlsZS1uYW1lJyk7XG5cbnZhciBfaHlwaGVuYXRlU3R5bGVOYW1lMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2h5cGhlbmF0ZVN0eWxlTmFtZSk7XG5cbnZhciBfY2FwaXRhbGl6ZVN0cmluZyA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2NhcGl0YWxpemVTdHJpbmcnKTtcblxudmFyIF9jYXBpdGFsaXplU3RyaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NhcGl0YWxpemVTdHJpbmcpO1xuXG52YXIgX2lzUHJlZml4ZWRWYWx1ZSA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL2lzUHJlZml4ZWRWYWx1ZScpO1xuXG52YXIgX2lzUHJlZml4ZWRWYWx1ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1ByZWZpeGVkVmFsdWUpO1xuXG52YXIgX3ByZWZpeFByb3BzID0gcmVxdWlyZSgnLi4vcHJlZml4UHJvcHMnKTtcblxudmFyIF9wcmVmaXhQcm9wczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9wcmVmaXhQcm9wcyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHsgaWYgKGtleSBpbiBvYmopIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwga2V5LCB7IHZhbHVlOiB2YWx1ZSwgZW51bWVyYWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZSB9KTsgfSBlbHNlIHsgb2JqW2tleV0gPSB2YWx1ZTsgfSByZXR1cm4gb2JqOyB9XG5cbnZhciBwcm9wZXJ0aWVzID0ge1xuICB0cmFuc2l0aW9uOiB0cnVlLFxuICB0cmFuc2l0aW9uUHJvcGVydHk6IHRydWUsXG4gIFdlYmtpdFRyYW5zaXRpb246IHRydWUsXG4gIFdlYmtpdFRyYW5zaXRpb25Qcm9wZXJ0eTogdHJ1ZVxufTtcblxuZnVuY3Rpb24gdHJhbnNpdGlvbihwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgLy8gYWxzbyBjaGVjayBmb3IgYWxyZWFkeSBwcmVmaXhlZCB0cmFuc2l0aW9uc1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyAmJiBwcm9wZXJ0aWVzW3Byb3BlcnR5XSkge1xuICAgIHZhciBfcmVmMjtcblxuICAgIHZhciBvdXRwdXRWYWx1ZSA9IHByZWZpeFZhbHVlKHZhbHVlKTtcbiAgICB2YXIgd2Via2l0T3V0cHV0ID0gb3V0cHV0VmFsdWUuc3BsaXQoLywoPyFbXigpXSooPzpcXChbXigpXSpcXCkpP1xcKSkvZykuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlLm1hdGNoKC8tbW96LXwtbXMtLykgPT09IG51bGw7XG4gICAgfSkuam9pbignLCcpO1xuXG4gICAgLy8gaWYgdGhlIHByb3BlcnR5IGlzIGFscmVhZHkgcHJlZml4ZWRcbiAgICBpZiAocHJvcGVydHkuaW5kZXhPZignV2Via2l0JykgPiAtMSkge1xuICAgICAgcmV0dXJuIF9kZWZpbmVQcm9wZXJ0eSh7fSwgcHJvcGVydHksIHdlYmtpdE91dHB1dCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZWYyID0ge30sIF9kZWZpbmVQcm9wZXJ0eShfcmVmMiwgJ1dlYmtpdCcgKyAoMCwgX2NhcGl0YWxpemVTdHJpbmcyLmRlZmF1bHQpKHByb3BlcnR5KSwgd2Via2l0T3V0cHV0KSwgX2RlZmluZVByb3BlcnR5KF9yZWYyLCBwcm9wZXJ0eSwgb3V0cHV0VmFsdWUpLCBfcmVmMjtcbiAgfVxufVxuXG5mdW5jdGlvbiBwcmVmaXhWYWx1ZSh2YWx1ZSkge1xuICBpZiAoKDAsIF9pc1ByZWZpeGVkVmFsdWUyLmRlZmF1bHQpKHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIC8vIG9ubHkgc3BsaXQgbXVsdGkgdmFsdWVzLCBub3QgY3ViaWMgYmV6aWVyc1xuICB2YXIgbXVsdGlwbGVWYWx1ZXMgPSB2YWx1ZS5zcGxpdCgvLCg/IVteKCldKig/OlxcKFteKCldKlxcKSk/XFwpKS9nKTtcblxuICAvLyBpdGVyYXRlIGVhY2ggc2luZ2xlIHZhbHVlIGFuZCBjaGVjayBmb3IgdHJhbnNpdGlvbmVkIHByb3BlcnRpZXNcbiAgLy8gdGhhdCBuZWVkIHRvIGJlIHByZWZpeGVkIGFzIHdlbGxcbiAgbXVsdGlwbGVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAodmFsLCBpbmRleCkge1xuICAgIG11bHRpcGxlVmFsdWVzW2luZGV4XSA9IE9iamVjdC5rZXlzKF9wcmVmaXhQcm9wczIuZGVmYXVsdCkucmVkdWNlKGZ1bmN0aW9uIChvdXQsIHByZWZpeCkge1xuICAgICAgdmFyIGRhc2hDYXNlUHJlZml4ID0gJy0nICsgcHJlZml4LnRvTG93ZXJDYXNlKCkgKyAnLSc7XG5cbiAgICAgIE9iamVjdC5rZXlzKF9wcmVmaXhQcm9wczIuZGVmYXVsdFtwcmVmaXhdKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgIHZhciBkYXNoQ2FzZVByb3BlcnR5ID0gKDAsIF9oeXBoZW5hdGVTdHlsZU5hbWUyLmRlZmF1bHQpKHByb3ApO1xuXG4gICAgICAgIGlmICh2YWwuaW5kZXhPZihkYXNoQ2FzZVByb3BlcnR5KSA+IC0xICYmIGRhc2hDYXNlUHJvcGVydHkgIT09ICdvcmRlcicpIHtcbiAgICAgICAgICAvLyBqb2luIGFsbCBwcmVmaXhlcyBhbmQgY3JlYXRlIGEgbmV3IHZhbHVlXG4gICAgICAgICAgb3V0ID0gdmFsLnJlcGxhY2UoZGFzaENhc2VQcm9wZXJ0eSwgZGFzaENhc2VQcmVmaXggKyBkYXNoQ2FzZVByb3BlcnR5KSArICcsJyArIG91dDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0sIHZhbCk7XG4gIH0pO1xuXG4gIHJldHVybiBtdWx0aXBsZVZhbHVlcy5qb2luKCcsJyk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBwcmVmaXhBbGw7XG5cbnZhciBfcHJlZml4UHJvcHMgPSByZXF1aXJlKCcuL3ByZWZpeFByb3BzJyk7XG5cbnZhciBfcHJlZml4UHJvcHMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJlZml4UHJvcHMpO1xuXG52YXIgX2NhcGl0YWxpemVTdHJpbmcgPSByZXF1aXJlKCcuLi91dGlscy9jYXBpdGFsaXplU3RyaW5nJyk7XG5cbnZhciBfY2FwaXRhbGl6ZVN0cmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jYXBpdGFsaXplU3RyaW5nKTtcblxudmFyIF9zb3J0UHJlZml4ZWRTdHlsZSA9IHJlcXVpcmUoJy4uL3V0aWxzL3NvcnRQcmVmaXhlZFN0eWxlJyk7XG5cbnZhciBfc29ydFByZWZpeGVkU3R5bGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc29ydFByZWZpeGVkU3R5bGUpO1xuXG52YXIgX3Bvc2l0aW9uID0gcmVxdWlyZSgnLi9wbHVnaW5zL3Bvc2l0aW9uJyk7XG5cbnZhciBfcG9zaXRpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcG9zaXRpb24pO1xuXG52YXIgX2NhbGMgPSByZXF1aXJlKCcuL3BsdWdpbnMvY2FsYycpO1xuXG52YXIgX2NhbGMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2FsYyk7XG5cbnZhciBfY3Vyc29yID0gcmVxdWlyZSgnLi9wbHVnaW5zL2N1cnNvcicpO1xuXG52YXIgX2N1cnNvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jdXJzb3IpO1xuXG52YXIgX2ZsZXggPSByZXF1aXJlKCcuL3BsdWdpbnMvZmxleCcpO1xuXG52YXIgX2ZsZXgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmxleCk7XG5cbnZhciBfc2l6aW5nID0gcmVxdWlyZSgnLi9wbHVnaW5zL3NpemluZycpO1xuXG52YXIgX3NpemluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zaXppbmcpO1xuXG52YXIgX2dyYWRpZW50ID0gcmVxdWlyZSgnLi9wbHVnaW5zL2dyYWRpZW50Jyk7XG5cbnZhciBfZ3JhZGllbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ3JhZGllbnQpO1xuXG52YXIgX3RyYW5zaXRpb24gPSByZXF1aXJlKCcuL3BsdWdpbnMvdHJhbnNpdGlvbicpO1xuXG52YXIgX3RyYW5zaXRpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdHJhbnNpdGlvbik7XG5cbnZhciBfZmxleGJveElFID0gcmVxdWlyZSgnLi9wbHVnaW5zL2ZsZXhib3hJRScpO1xuXG52YXIgX2ZsZXhib3hJRTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9mbGV4Ym94SUUpO1xuXG52YXIgX2ZsZXhib3hPbGQgPSByZXF1aXJlKCcuL3BsdWdpbnMvZmxleGJveE9sZCcpO1xuXG52YXIgX2ZsZXhib3hPbGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZmxleGJveE9sZCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbi8vIHNwZWNpYWwgZmxleGJveCBzcGVjaWZpY2F0aW9uc1xuXG5cbnZhciBwbHVnaW5zID0gW19wb3NpdGlvbjIuZGVmYXVsdCwgX2NhbGMyLmRlZmF1bHQsIF9jdXJzb3IyLmRlZmF1bHQsIF9zaXppbmcyLmRlZmF1bHQsIF9ncmFkaWVudDIuZGVmYXVsdCwgX3RyYW5zaXRpb24yLmRlZmF1bHQsIF9mbGV4Ym94SUUyLmRlZmF1bHQsIF9mbGV4Ym94T2xkMi5kZWZhdWx0LCBfZmxleDIuZGVmYXVsdF07XG5cbi8qKlxuICogUmV0dXJucyBhIHByZWZpeGVkIHZlcnNpb24gb2YgdGhlIHN0eWxlIG9iamVjdCB1c2luZyBhbGwgdmVuZG9yIHByZWZpeGVzXG4gKiBAcGFyYW0ge09iamVjdH0gc3R5bGVzIC0gU3R5bGUgb2JqZWN0IHRoYXQgZ2V0cyBwcmVmaXhlZCBwcm9wZXJ0aWVzIGFkZGVkXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIFN0eWxlIG9iamVjdCB3aXRoIHByZWZpeGVkIHByb3BlcnRpZXMgYW5kIHZhbHVlc1xuICovXG5mdW5jdGlvbiBwcmVmaXhBbGwoc3R5bGVzKSB7XG4gIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICB2YXIgdmFsdWUgPSBzdHlsZXNbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCAmJiAhQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIC8vIHJlY3Vyc2UgdGhyb3VnaCBuZXN0ZWQgc3R5bGUgb2JqZWN0c1xuICAgICAgc3R5bGVzW3Byb3BlcnR5XSA9IHByZWZpeEFsbCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE9iamVjdC5rZXlzKF9wcmVmaXhQcm9wczIuZGVmYXVsdCkuZm9yRWFjaChmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gX3ByZWZpeFByb3BzMi5kZWZhdWx0W3ByZWZpeF07XG4gICAgICAgIC8vIGFkZCBwcmVmaXhlcyBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHByb3BlcnRpZXNbcHJvcGVydHldKSB7XG4gICAgICAgICAgc3R5bGVzW3ByZWZpeCArICgwLCBfY2FwaXRhbGl6ZVN0cmluZzIuZGVmYXVsdCkocHJvcGVydHkpXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHN0eWxlcykuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICBbXS5jb25jYXQoc3R5bGVzW3Byb3BlcnR5XSkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4KSB7XG4gICAgICAvLyByZXNvbHZlIGV2ZXJ5IHNwZWNpYWwgcGx1Z2luc1xuICAgICAgcGx1Z2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgICAgcmV0dXJuIGFzc2lnblN0eWxlcyhzdHlsZXMsIHBsdWdpbihwcm9wZXJ0eSwgdmFsdWUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICByZXR1cm4gKDAsIF9zb3J0UHJlZml4ZWRTdHlsZTIuZGVmYXVsdCkoc3R5bGVzKTtcbn1cblxuZnVuY3Rpb24gYXNzaWduU3R5bGVzKGJhc2UpIHtcbiAgdmFyIGV4dGVuZCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gIE9iamVjdC5rZXlzKGV4dGVuZCkuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHkpIHtcbiAgICB2YXIgYmFzZVZhbHVlID0gYmFzZVtwcm9wZXJ0eV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYmFzZVZhbHVlKSkge1xuICAgICAgW10uY29uY2F0KGV4dGVuZFtwcm9wZXJ0eV0pLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciB2YWx1ZUluZGV4ID0gYmFzZVZhbHVlLmluZGV4T2YodmFsdWUpO1xuICAgICAgICBpZiAodmFsdWVJbmRleCA+IC0xKSB7XG4gICAgICAgICAgYmFzZVtwcm9wZXJ0eV0uc3BsaWNlKHZhbHVlSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIGJhc2VbcHJvcGVydHldLnB1c2godmFsdWUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VbcHJvcGVydHldID0gZXh0ZW5kW3Byb3BlcnR5XTtcbiAgICB9XG4gIH0pO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB7IFwiV2Via2l0XCI6IHsgXCJ0cmFuc2Zvcm1cIjogdHJ1ZSwgXCJ0cmFuc2Zvcm1PcmlnaW5cIjogdHJ1ZSwgXCJ0cmFuc2Zvcm1PcmlnaW5YXCI6IHRydWUsIFwidHJhbnNmb3JtT3JpZ2luWVwiOiB0cnVlLCBcImJhY2tmYWNlVmlzaWJpbGl0eVwiOiB0cnVlLCBcInBlcnNwZWN0aXZlXCI6IHRydWUsIFwicGVyc3BlY3RpdmVPcmlnaW5cIjogdHJ1ZSwgXCJ0cmFuc2Zvcm1TdHlsZVwiOiB0cnVlLCBcInRyYW5zZm9ybU9yaWdpblpcIjogdHJ1ZSwgXCJhbmltYXRpb25cIjogdHJ1ZSwgXCJhbmltYXRpb25EZWxheVwiOiB0cnVlLCBcImFuaW1hdGlvbkRpcmVjdGlvblwiOiB0cnVlLCBcImFuaW1hdGlvbkZpbGxNb2RlXCI6IHRydWUsIFwiYW5pbWF0aW9uRHVyYXRpb25cIjogdHJ1ZSwgXCJhbmltYXRpb25JdGVyYXRpb25Db3VudFwiOiB0cnVlLCBcImFuaW1hdGlvbk5hbWVcIjogdHJ1ZSwgXCJhbmltYXRpb25QbGF5U3RhdGVcIjogdHJ1ZSwgXCJhbmltYXRpb25UaW1pbmdGdW5jdGlvblwiOiB0cnVlLCBcImFwcGVhcmFuY2VcIjogdHJ1ZSwgXCJ1c2VyU2VsZWN0XCI6IHRydWUsIFwiZm9udEtlcm5pbmdcIjogdHJ1ZSwgXCJ0ZXh0RW1waGFzaXNQb3NpdGlvblwiOiB0cnVlLCBcInRleHRFbXBoYXNpc1wiOiB0cnVlLCBcInRleHRFbXBoYXNpc1N0eWxlXCI6IHRydWUsIFwidGV4dEVtcGhhc2lzQ29sb3JcIjogdHJ1ZSwgXCJib3hEZWNvcmF0aW9uQnJlYWtcIjogdHJ1ZSwgXCJjbGlwUGF0aFwiOiB0cnVlLCBcIm1hc2tJbWFnZVwiOiB0cnVlLCBcIm1hc2tNb2RlXCI6IHRydWUsIFwibWFza1JlcGVhdFwiOiB0cnVlLCBcIm1hc2tQb3NpdGlvblwiOiB0cnVlLCBcIm1hc2tDbGlwXCI6IHRydWUsIFwibWFza09yaWdpblwiOiB0cnVlLCBcIm1hc2tTaXplXCI6IHRydWUsIFwibWFza0NvbXBvc2l0ZVwiOiB0cnVlLCBcIm1hc2tcIjogdHJ1ZSwgXCJtYXNrQm9yZGVyU291cmNlXCI6IHRydWUsIFwibWFza0JvcmRlck1vZGVcIjogdHJ1ZSwgXCJtYXNrQm9yZGVyU2xpY2VcIjogdHJ1ZSwgXCJtYXNrQm9yZGVyV2lkdGhcIjogdHJ1ZSwgXCJtYXNrQm9yZGVyT3V0c2V0XCI6IHRydWUsIFwibWFza0JvcmRlclJlcGVhdFwiOiB0cnVlLCBcIm1hc2tCb3JkZXJcIjogdHJ1ZSwgXCJtYXNrVHlwZVwiOiB0cnVlLCBcInRleHREZWNvcmF0aW9uU3R5bGVcIjogdHJ1ZSwgXCJ0ZXh0RGVjb3JhdGlvblNraXBcIjogdHJ1ZSwgXCJ0ZXh0RGVjb3JhdGlvbkxpbmVcIjogdHJ1ZSwgXCJ0ZXh0RGVjb3JhdGlvbkNvbG9yXCI6IHRydWUsIFwiZmlsdGVyXCI6IHRydWUsIFwiZm9udEZlYXR1cmVTZXR0aW5nc1wiOiB0cnVlLCBcImJyZWFrQWZ0ZXJcIjogdHJ1ZSwgXCJicmVha0JlZm9yZVwiOiB0cnVlLCBcImJyZWFrSW5zaWRlXCI6IHRydWUsIFwiY29sdW1uQ291bnRcIjogdHJ1ZSwgXCJjb2x1bW5GaWxsXCI6IHRydWUsIFwiY29sdW1uR2FwXCI6IHRydWUsIFwiY29sdW1uUnVsZVwiOiB0cnVlLCBcImNvbHVtblJ1bGVDb2xvclwiOiB0cnVlLCBcImNvbHVtblJ1bGVTdHlsZVwiOiB0cnVlLCBcImNvbHVtblJ1bGVXaWR0aFwiOiB0cnVlLCBcImNvbHVtbnNcIjogdHJ1ZSwgXCJjb2x1bW5TcGFuXCI6IHRydWUsIFwiY29sdW1uV2lkdGhcIjogdHJ1ZSwgXCJmbGV4XCI6IHRydWUsIFwiZmxleEJhc2lzXCI6IHRydWUsIFwiZmxleERpcmVjdGlvblwiOiB0cnVlLCBcImZsZXhHcm93XCI6IHRydWUsIFwiZmxleEZsb3dcIjogdHJ1ZSwgXCJmbGV4U2hyaW5rXCI6IHRydWUsIFwiZmxleFdyYXBcIjogdHJ1ZSwgXCJhbGlnbkNvbnRlbnRcIjogdHJ1ZSwgXCJhbGlnbkl0ZW1zXCI6IHRydWUsIFwiYWxpZ25TZWxmXCI6IHRydWUsIFwianVzdGlmeUNvbnRlbnRcIjogdHJ1ZSwgXCJvcmRlclwiOiB0cnVlLCBcInRyYW5zaXRpb25cIjogdHJ1ZSwgXCJ0cmFuc2l0aW9uRGVsYXlcIjogdHJ1ZSwgXCJ0cmFuc2l0aW9uRHVyYXRpb25cIjogdHJ1ZSwgXCJ0cmFuc2l0aW9uUHJvcGVydHlcIjogdHJ1ZSwgXCJ0cmFuc2l0aW9uVGltaW5nRnVuY3Rpb25cIjogdHJ1ZSwgXCJiYWNrZHJvcEZpbHRlclwiOiB0cnVlLCBcInNjcm9sbFNuYXBUeXBlXCI6IHRydWUsIFwic2Nyb2xsU25hcFBvaW50c1hcIjogdHJ1ZSwgXCJzY3JvbGxTbmFwUG9pbnRzWVwiOiB0cnVlLCBcInNjcm9sbFNuYXBEZXN0aW5hdGlvblwiOiB0cnVlLCBcInNjcm9sbFNuYXBDb29yZGluYXRlXCI6IHRydWUsIFwic2hhcGVJbWFnZVRocmVzaG9sZFwiOiB0cnVlLCBcInNoYXBlSW1hZ2VNYXJnaW5cIjogdHJ1ZSwgXCJzaGFwZUltYWdlT3V0c2lkZVwiOiB0cnVlLCBcImh5cGhlbnNcIjogdHJ1ZSwgXCJmbG93SW50b1wiOiB0cnVlLCBcImZsb3dGcm9tXCI6IHRydWUsIFwicmVnaW9uRnJhZ21lbnRcIjogdHJ1ZSwgXCJ0ZXh0U2l6ZUFkanVzdFwiOiB0cnVlIH0sIFwiTW96XCI6IHsgXCJhcHBlYXJhbmNlXCI6IHRydWUsIFwidXNlclNlbGVjdFwiOiB0cnVlLCBcImJveFNpemluZ1wiOiB0cnVlLCBcInRleHRBbGlnbkxhc3RcIjogdHJ1ZSwgXCJ0ZXh0RGVjb3JhdGlvblN0eWxlXCI6IHRydWUsIFwidGV4dERlY29yYXRpb25Ta2lwXCI6IHRydWUsIFwidGV4dERlY29yYXRpb25MaW5lXCI6IHRydWUsIFwidGV4dERlY29yYXRpb25Db2xvclwiOiB0cnVlLCBcInRhYlNpemVcIjogdHJ1ZSwgXCJoeXBoZW5zXCI6IHRydWUsIFwiZm9udEZlYXR1cmVTZXR0aW5nc1wiOiB0cnVlLCBcImJyZWFrQWZ0ZXJcIjogdHJ1ZSwgXCJicmVha0JlZm9yZVwiOiB0cnVlLCBcImJyZWFrSW5zaWRlXCI6IHRydWUsIFwiY29sdW1uQ291bnRcIjogdHJ1ZSwgXCJjb2x1bW5GaWxsXCI6IHRydWUsIFwiY29sdW1uR2FwXCI6IHRydWUsIFwiY29sdW1uUnVsZVwiOiB0cnVlLCBcImNvbHVtblJ1bGVDb2xvclwiOiB0cnVlLCBcImNvbHVtblJ1bGVTdHlsZVwiOiB0cnVlLCBcImNvbHVtblJ1bGVXaWR0aFwiOiB0cnVlLCBcImNvbHVtbnNcIjogdHJ1ZSwgXCJjb2x1bW5TcGFuXCI6IHRydWUsIFwiY29sdW1uV2lkdGhcIjogdHJ1ZSB9LCBcIm1zXCI6IHsgXCJmbGV4XCI6IHRydWUsIFwiZmxleEJhc2lzXCI6IGZhbHNlLCBcImZsZXhEaXJlY3Rpb25cIjogdHJ1ZSwgXCJmbGV4R3Jvd1wiOiBmYWxzZSwgXCJmbGV4Rmxvd1wiOiB0cnVlLCBcImZsZXhTaHJpbmtcIjogZmFsc2UsIFwiZmxleFdyYXBcIjogdHJ1ZSwgXCJhbGlnbkNvbnRlbnRcIjogZmFsc2UsIFwiYWxpZ25JdGVtc1wiOiBmYWxzZSwgXCJhbGlnblNlbGZcIjogZmFsc2UsIFwianVzdGlmeUNvbnRlbnRcIjogZmFsc2UsIFwib3JkZXJcIjogZmFsc2UsIFwidHJhbnNmb3JtXCI6IHRydWUsIFwidHJhbnNmb3JtT3JpZ2luXCI6IHRydWUsIFwidHJhbnNmb3JtT3JpZ2luWFwiOiB0cnVlLCBcInRyYW5zZm9ybU9yaWdpbllcIjogdHJ1ZSwgXCJ1c2VyU2VsZWN0XCI6IHRydWUsIFwid3JhcEZsb3dcIjogdHJ1ZSwgXCJ3cmFwVGhyb3VnaFwiOiB0cnVlLCBcIndyYXBNYXJnaW5cIjogdHJ1ZSwgXCJzY3JvbGxTbmFwVHlwZVwiOiB0cnVlLCBcInNjcm9sbFNuYXBQb2ludHNYXCI6IHRydWUsIFwic2Nyb2xsU25hcFBvaW50c1lcIjogdHJ1ZSwgXCJzY3JvbGxTbmFwRGVzdGluYXRpb25cIjogdHJ1ZSwgXCJzY3JvbGxTbmFwQ29vcmRpbmF0ZVwiOiB0cnVlLCBcInRvdWNoQWN0aW9uXCI6IHRydWUsIFwiaHlwaGVuc1wiOiB0cnVlLCBcImZsb3dJbnRvXCI6IHRydWUsIFwiZmxvd0Zyb21cIjogdHJ1ZSwgXCJicmVha0JlZm9yZVwiOiB0cnVlLCBcImJyZWFrQWZ0ZXJcIjogdHJ1ZSwgXCJicmVha0luc2lkZVwiOiB0cnVlLCBcInJlZ2lvbkZyYWdtZW50XCI6IHRydWUsIFwiZ3JpZFRlbXBsYXRlQ29sdW1uc1wiOiB0cnVlLCBcImdyaWRUZW1wbGF0ZVJvd3NcIjogdHJ1ZSwgXCJncmlkVGVtcGxhdGVBcmVhc1wiOiB0cnVlLCBcImdyaWRUZW1wbGF0ZVwiOiB0cnVlLCBcImdyaWRBdXRvQ29sdW1uc1wiOiB0cnVlLCBcImdyaWRBdXRvUm93c1wiOiB0cnVlLCBcImdyaWRBdXRvRmxvd1wiOiB0cnVlLCBcImdyaWRcIjogdHJ1ZSwgXCJncmlkUm93U3RhcnRcIjogdHJ1ZSwgXCJncmlkQ29sdW1uU3RhcnRcIjogdHJ1ZSwgXCJncmlkUm93RW5kXCI6IHRydWUsIFwiZ3JpZFJvd1wiOiB0cnVlLCBcImdyaWRDb2x1bW5cIjogdHJ1ZSwgXCJncmlkQ29sdW1uRW5kXCI6IHRydWUsIFwiZ3JpZENvbHVtbkdhcFwiOiB0cnVlLCBcImdyaWRSb3dHYXBcIjogdHJ1ZSwgXCJncmlkQXJlYVwiOiB0cnVlLCBcImdyaWRHYXBcIjogdHJ1ZSwgXCJ0ZXh0U2l6ZUFkanVzdFwiOiB0cnVlIH0gfTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG4vLyBoZWxwZXIgdG8gY2FwaXRhbGl6ZSBzdHJpbmdzXG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1tcImRlZmF1bHRcIl07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICByZXR1cm4gcHJvcGVydHkubWF0Y2goL14oV2Via2l0fE1venxPfG1zKS8pICE9PSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHZhbHVlID0gdmFsdWUuam9pbignLCcpO1xuXG4gIHJldHVybiB2YWx1ZS5tYXRjaCgvLXdlYmtpdC18LW1vei18LW1zLS8pICE9PSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHZhbHVlKSB7IGlmIChrZXkgaW4gb2JqKSB7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgeyB2YWx1ZTogdmFsdWUsIGVudW1lcmFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWUgfSk7IH0gZWxzZSB7IG9ialtrZXldID0gdmFsdWU7IH0gcmV0dXJuIG9iajsgfVxuXG4vLyByZXR1cm5zIGEgc3R5bGUgb2JqZWN0IHdpdGggYSBzaW5nbGUgY29uY2F0ZWQgcHJlZml4ZWQgdmFsdWUgc3RyaW5nXG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgdmFyIHJlcGxhY2VyID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKHByZWZpeCwgdmFsdWUpIHtcbiAgICByZXR1cm4gcHJlZml4ICsgdmFsdWU7XG4gIH0gOiBhcmd1bWVudHNbMl07XG4gIHJldHVybiBfZGVmaW5lUHJvcGVydHkoe30sIHByb3BlcnR5LCBbJy13ZWJraXQtJywgJy1tb3otJywgJyddLm1hcChmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgcmV0dXJuIHJlcGxhY2VyKHByZWZpeCwgdmFsdWUpO1xuICB9KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBzb3J0UHJlZml4ZWRTdHlsZTtcblxudmFyIF9pc1ByZWZpeGVkUHJvcGVydHkgPSByZXF1aXJlKCcuL2lzUHJlZml4ZWRQcm9wZXJ0eScpO1xuXG52YXIgX2lzUHJlZml4ZWRQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1ByZWZpeGVkUHJvcGVydHkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBzb3J0UHJlZml4ZWRTdHlsZShzdHlsZSkge1xuICByZXR1cm4gT2JqZWN0LmtleXMoc3R5bGUpLnNvcnQoZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XG4gICAgaWYgKCgwLCBfaXNQcmVmaXhlZFByb3BlcnR5Mi5kZWZhdWx0KShsZWZ0KSAmJiAhKDAsIF9pc1ByZWZpeGVkUHJvcGVydHkyLmRlZmF1bHQpKHJpZ2h0KSkge1xuICAgICAgcmV0dXJuIC0xO1xuICAgIH0gZWxzZSBpZiAoISgwLCBfaXNQcmVmaXhlZFByb3BlcnR5Mi5kZWZhdWx0KShsZWZ0KSAmJiAoMCwgX2lzUHJlZml4ZWRQcm9wZXJ0eTIuZGVmYXVsdCkocmlnaHQpKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH0pLnJlZHVjZShmdW5jdGlvbiAoc29ydGVkU3R5bGUsIHByb3ApIHtcbiAgICBzb3J0ZWRTdHlsZVtwcm9wXSA9IHN0eWxlW3Byb3BdO1xuICAgIHJldHVybiBzb3J0ZWRTdHlsZTtcbiAgfSwge30pO1xufVxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9zdGF0aWMvcHJlZml4QWxsJylcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfVHJhbnNpdGlvbkdyb3VwID0gcmVxdWlyZSgnLi9UcmFuc2l0aW9uR3JvdXAnKTtcblxudmFyIF9UcmFuc2l0aW9uR3JvdXAyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVHJhbnNpdGlvbkdyb3VwKTtcblxudmFyIF9DU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCA9IHJlcXVpcmUoJy4vQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQnKTtcblxudmFyIF9DU1NUcmFuc2l0aW9uR3JvdXBDaGlsZDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9DU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCk7XG5cbnZhciBfUHJvcFR5cGVzID0gcmVxdWlyZSgnLi91dGlscy9Qcm9wVHlwZXMnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkgeyBpZiAoIXNlbGYpIHsgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpOyB9IHJldHVybiBjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSA/IGNhbGwgOiBzZWxmOyB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgcHJvcFR5cGVzID0ge1xuICB0cmFuc2l0aW9uTmFtZTogX1Byb3BUeXBlcy5uYW1lU2hhcGUuaXNSZXF1aXJlZCxcblxuICB0cmFuc2l0aW9uQXBwZWFyOiBfcHJvcFR5cGVzMi5kZWZhdWx0LmJvb2wsXG4gIHRyYW5zaXRpb25FbnRlcjogX3Byb3BUeXBlczIuZGVmYXVsdC5ib29sLFxuICB0cmFuc2l0aW9uTGVhdmU6IF9wcm9wVHlwZXMyLmRlZmF1bHQuYm9vbCxcbiAgdHJhbnNpdGlvbkFwcGVhclRpbWVvdXQ6ICgwLCBfUHJvcFR5cGVzLnRyYW5zaXRpb25UaW1lb3V0KSgnQXBwZWFyJyksXG4gIHRyYW5zaXRpb25FbnRlclRpbWVvdXQ6ICgwLCBfUHJvcFR5cGVzLnRyYW5zaXRpb25UaW1lb3V0KSgnRW50ZXInKSxcbiAgdHJhbnNpdGlvbkxlYXZlVGltZW91dDogKDAsIF9Qcm9wVHlwZXMudHJhbnNpdGlvblRpbWVvdXQpKCdMZWF2ZScpXG59O1xuXG52YXIgZGVmYXVsdFByb3BzID0ge1xuICB0cmFuc2l0aW9uQXBwZWFyOiBmYWxzZSxcbiAgdHJhbnNpdGlvbkVudGVyOiB0cnVlLFxuICB0cmFuc2l0aW9uTGVhdmU6IHRydWVcbn07XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXAgPSBmdW5jdGlvbiAoX1JlYWN0JENvbXBvbmVudCkge1xuICBfaW5oZXJpdHMoQ1NTVHJhbnNpdGlvbkdyb3VwLCBfUmVhY3QkQ29tcG9uZW50KTtcblxuICBmdW5jdGlvbiBDU1NUcmFuc2l0aW9uR3JvdXAoKSB7XG4gICAgdmFyIF90ZW1wLCBfdGhpcywgX3JldDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDU1NUcmFuc2l0aW9uR3JvdXApO1xuXG4gICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgIGFyZ3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgfVxuXG4gICAgcmV0dXJuIF9yZXQgPSAoX3RlbXAgPSAoX3RoaXMgPSBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCBfUmVhY3QkQ29tcG9uZW50LmNhbGwuYXBwbHkoX1JlYWN0JENvbXBvbmVudCwgW3RoaXNdLmNvbmNhdChhcmdzKSkpLCBfdGhpcyksIF90aGlzLl93cmFwQ2hpbGQgPSBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIHJldHVybiBfcmVhY3QyLmRlZmF1bHQuY3JlYXRlRWxlbWVudChfQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQyLmRlZmF1bHQsIHtcbiAgICAgICAgbmFtZTogX3RoaXMucHJvcHMudHJhbnNpdGlvbk5hbWUsXG4gICAgICAgIGFwcGVhcjogX3RoaXMucHJvcHMudHJhbnNpdGlvbkFwcGVhcixcbiAgICAgICAgZW50ZXI6IF90aGlzLnByb3BzLnRyYW5zaXRpb25FbnRlcixcbiAgICAgICAgbGVhdmU6IF90aGlzLnByb3BzLnRyYW5zaXRpb25MZWF2ZSxcbiAgICAgICAgYXBwZWFyVGltZW91dDogX3RoaXMucHJvcHMudHJhbnNpdGlvbkFwcGVhclRpbWVvdXQsXG4gICAgICAgIGVudGVyVGltZW91dDogX3RoaXMucHJvcHMudHJhbnNpdGlvbkVudGVyVGltZW91dCxcbiAgICAgICAgbGVhdmVUaW1lb3V0OiBfdGhpcy5wcm9wcy50cmFuc2l0aW9uTGVhdmVUaW1lb3V0XG4gICAgICB9LCBjaGlsZCk7XG4gICAgfSwgX3RlbXApLCBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihfdGhpcywgX3JldCk7XG4gIH1cblxuICAvLyBXZSBuZWVkIHRvIHByb3ZpZGUgdGhpcyBjaGlsZEZhY3Rvcnkgc28gdGhhdFxuICAvLyBSZWFjdENTU1RyYW5zaXRpb25Hcm91cENoaWxkIGNhbiByZWNlaXZlIHVwZGF0ZXMgdG8gbmFtZSwgZW50ZXIsIGFuZFxuICAvLyBsZWF2ZSB3aGlsZSBpdCBpcyBsZWF2aW5nLlxuXG5cbiAgQ1NTVHJhbnNpdGlvbkdyb3VwLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KF9UcmFuc2l0aW9uR3JvdXAyLmRlZmF1bHQsIF9leHRlbmRzKHt9LCB0aGlzLnByb3BzLCB7IGNoaWxkRmFjdG9yeTogdGhpcy5fd3JhcENoaWxkIH0pKTtcbiAgfTtcblxuICByZXR1cm4gQ1NTVHJhbnNpdGlvbkdyb3VwO1xufShfcmVhY3QyLmRlZmF1bHQuQ29tcG9uZW50KTtcblxuQ1NTVHJhbnNpdGlvbkdyb3VwLmRpc3BsYXlOYW1lID0gJ0NTU1RyYW5zaXRpb25Hcm91cCc7XG5cblxuQ1NTVHJhbnNpdGlvbkdyb3VwLnByb3BUeXBlcyA9IHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSBcInByb2R1Y3Rpb25cIiA/IHByb3BUeXBlcyA6IHt9O1xuQ1NTVHJhbnNpdGlvbkdyb3VwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcblxuZXhwb3J0cy5kZWZhdWx0ID0gQ1NTVHJhbnNpdGlvbkdyb3VwO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2FkZENsYXNzID0gcmVxdWlyZSgnZG9tLWhlbHBlcnMvY2xhc3MvYWRkQ2xhc3MnKTtcblxudmFyIF9hZGRDbGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hZGRDbGFzcyk7XG5cbnZhciBfcmVtb3ZlQ2xhc3MgPSByZXF1aXJlKCdkb20taGVscGVycy9jbGFzcy9yZW1vdmVDbGFzcycpO1xuXG52YXIgX3JlbW92ZUNsYXNzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlbW92ZUNsYXNzKTtcblxudmFyIF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1aXJlKCdkb20taGVscGVycy91dGlsL3JlcXVlc3RBbmltYXRpb25GcmFtZScpO1xuXG52YXIgX3JlcXVlc3RBbmltYXRpb25GcmFtZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpO1xuXG52YXIgX3Byb3BlcnRpZXMgPSByZXF1aXJlKCdkb20taGVscGVycy90cmFuc2l0aW9uL3Byb3BlcnRpZXMnKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9yZWFjdERvbSA9IHJlcXVpcmUoJ3JlYWN0LWRvbScpO1xuXG52YXIgX1Byb3BUeXBlcyA9IHJlcXVpcmUoJy4vdXRpbHMvUHJvcFR5cGVzJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIGV2ZW50cyA9IFtdO1xuaWYgKF9wcm9wZXJ0aWVzLnRyYW5zaXRpb25FbmQpIGV2ZW50cy5wdXNoKF9wcm9wZXJ0aWVzLnRyYW5zaXRpb25FbmQpO1xuaWYgKF9wcm9wZXJ0aWVzLmFuaW1hdGlvbkVuZCkgZXZlbnRzLnB1c2goX3Byb3BlcnRpZXMuYW5pbWF0aW9uRW5kKTtcblxuZnVuY3Rpb24gYWRkRW5kTGlzdGVuZXIobm9kZSwgbGlzdGVuZXIpIHtcbiAgaWYgKGV2ZW50cy5sZW5ndGgpIHtcbiAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihlLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQobGlzdGVuZXIsIDApO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIWV2ZW50cy5sZW5ndGgpIHJldHVybjtcbiAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgIH0pO1xuICB9O1xufVxuXG52YXIgcHJvcFR5cGVzID0ge1xuICBjaGlsZHJlbjogX3Byb3BUeXBlczIuZGVmYXVsdC5ub2RlLFxuICBuYW1lOiBfUHJvcFR5cGVzLm5hbWVTaGFwZS5pc1JlcXVpcmVkLFxuXG4gIC8vIE9uY2Ugd2UgcmVxdWlyZSB0aW1lb3V0cyB0byBiZSBzcGVjaWZpZWQsIHdlIGNhbiByZW1vdmUgdGhlXG4gIC8vIGJvb2xlYW4gZmxhZ3MgKGFwcGVhciBldGMuKSBhbmQganVzdCBhY2NlcHQgYSBudW1iZXJcbiAgLy8gb3IgYSBib29sIGZvciB0aGUgdGltZW91dCBmbGFncyAoYXBwZWFyVGltZW91dCBldGMuKVxuICBhcHBlYXI6IF9wcm9wVHlwZXMyLmRlZmF1bHQuYm9vbCxcbiAgZW50ZXI6IF9wcm9wVHlwZXMyLmRlZmF1bHQuYm9vbCxcbiAgbGVhdmU6IF9wcm9wVHlwZXMyLmRlZmF1bHQuYm9vbCxcbiAgYXBwZWFyVGltZW91dDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIGVudGVyVGltZW91dDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXIsXG4gIGxlYXZlVGltZW91dDogX3Byb3BUeXBlczIuZGVmYXVsdC5udW1iZXJcbn07XG5cbnZhciBDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0cyhDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCwgX1JlYWN0JENvbXBvbmVudCk7XG5cbiAgZnVuY3Rpb24gQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQoKSB7XG4gICAgdmFyIF90ZW1wLCBfdGhpcywgX3JldDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCk7XG5cbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgYXJnc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3JldCA9IChfdGVtcCA9IChfdGhpcyA9IF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHRoaXMsIF9SZWFjdCRDb21wb25lbnQuY2FsbC5hcHBseShfUmVhY3QkQ29tcG9uZW50LCBbdGhpc10uY29uY2F0KGFyZ3MpKSksIF90aGlzKSwgX3RoaXMuY29tcG9uZW50V2lsbEFwcGVhciA9IGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICBpZiAoX3RoaXMucHJvcHMuYXBwZWFyKSB7XG4gICAgICAgIF90aGlzLnRyYW5zaXRpb24oJ2FwcGVhcicsIGRvbmUsIF90aGlzLnByb3BzLmFwcGVhclRpbWVvdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIF90aGlzLmNvbXBvbmVudFdpbGxFbnRlciA9IGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICBpZiAoX3RoaXMucHJvcHMuZW50ZXIpIHtcbiAgICAgICAgX3RoaXMudHJhbnNpdGlvbignZW50ZXInLCBkb25lLCBfdGhpcy5wcm9wcy5lbnRlclRpbWVvdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIF90aGlzLmNvbXBvbmVudFdpbGxMZWF2ZSA9IGZ1bmN0aW9uIChkb25lKSB7XG4gICAgICBpZiAoX3RoaXMucHJvcHMubGVhdmUpIHtcbiAgICAgICAgX3RoaXMudHJhbnNpdGlvbignbGVhdmUnLCBkb25lLCBfdGhpcy5wcm9wcy5sZWF2ZVRpbWVvdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuICAgIH0sIF90ZW1wKSwgX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oX3RoaXMsIF9yZXQpO1xuICB9XG5cbiAgQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQucHJvdG90eXBlLmNvbXBvbmVudFdpbGxNb3VudCA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICB0aGlzLmNsYXNzTmFtZUFuZE5vZGVRdWV1ZSA9IFtdO1xuICAgIHRoaXMudHJhbnNpdGlvblRpbWVvdXRzID0gW107XG4gIH07XG5cbiAgQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQucHJvdG90eXBlLmNvbXBvbmVudFdpbGxVbm1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMudGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XG4gICAgfVxuICAgIHRoaXMudHJhbnNpdGlvblRpbWVvdXRzLmZvckVhY2goZnVuY3Rpb24gKHRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY2xhc3NOYW1lQW5kTm9kZVF1ZXVlLmxlbmd0aCA9IDA7XG4gIH07XG5cbiAgQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQucHJvdG90eXBlLnRyYW5zaXRpb24gPSBmdW5jdGlvbiB0cmFuc2l0aW9uKGFuaW1hdGlvblR5cGUsIGZpbmlzaENhbGxiYWNrLCB0aW1lb3V0KSB7XG4gICAgdmFyIG5vZGUgPSAoMCwgX3JlYWN0RG9tLmZpbmRET01Ob2RlKSh0aGlzKTtcblxuICAgIGlmICghbm9kZSkge1xuICAgICAgaWYgKGZpbmlzaENhbGxiYWNrKSB7XG4gICAgICAgIGZpbmlzaENhbGxiYWNrKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRoaXMucHJvcHMubmFtZVthbmltYXRpb25UeXBlXSB8fCB0aGlzLnByb3BzLm5hbWUgKyAnLScgKyBhbmltYXRpb25UeXBlO1xuICAgIHZhciBhY3RpdmVDbGFzc05hbWUgPSB0aGlzLnByb3BzLm5hbWVbYW5pbWF0aW9uVHlwZSArICdBY3RpdmUnXSB8fCBjbGFzc05hbWUgKyAnLWFjdGl2ZSc7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcbiAgICB2YXIgcmVtb3ZlTGlzdGVuZXJzID0gdm9pZCAwO1xuXG4gICAgKDAsIF9hZGRDbGFzczIuZGVmYXVsdCkobm9kZSwgY2xhc3NOYW1lKTtcblxuICAgIC8vIE5lZWQgdG8gZG8gdGhpcyB0byBhY3R1YWxseSB0cmlnZ2VyIGEgdHJhbnNpdGlvbi5cbiAgICB0aGlzLnF1ZXVlQ2xhc3NBbmROb2RlKGFjdGl2ZUNsYXNzTmFtZSwgbm9kZSk7XG5cbiAgICAvLyBDbGVhbi11cCB0aGUgYW5pbWF0aW9uIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXlcbiAgICB2YXIgZmluaXNoID0gZnVuY3Rpb24gZmluaXNoKGUpIHtcbiAgICAgIGlmIChlICYmIGUudGFyZ2V0ICE9PSBub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICAgIGlmIChyZW1vdmVMaXN0ZW5lcnMpIHJlbW92ZUxpc3RlbmVycygpO1xuXG4gICAgICAoMCwgX3JlbW92ZUNsYXNzMi5kZWZhdWx0KShub2RlLCBjbGFzc05hbWUpO1xuICAgICAgKDAsIF9yZW1vdmVDbGFzczIuZGVmYXVsdCkobm9kZSwgYWN0aXZlQ2xhc3NOYW1lKTtcblxuICAgICAgaWYgKHJlbW92ZUxpc3RlbmVycykgcmVtb3ZlTGlzdGVuZXJzKCk7XG5cbiAgICAgIC8vIFVzdWFsbHkgdGhpcyBvcHRpb25hbCBjYWxsYmFjayBpcyB1c2VkIGZvciBpbmZvcm1pbmcgYW4gb3duZXIgb2ZcbiAgICAgIC8vIGEgbGVhdmUgYW5pbWF0aW9uIGFuZCB0ZWxsaW5nIGl0IHRvIHJlbW92ZSB0aGUgY2hpbGQuXG4gICAgICBpZiAoZmluaXNoQ2FsbGJhY2spIHtcbiAgICAgICAgZmluaXNoQ2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmaW5pc2gsIHRpbWVvdXQpO1xuICAgICAgdGhpcy50cmFuc2l0aW9uVGltZW91dHMucHVzaCh0aW1lcik7XG4gICAgfSBlbHNlIGlmIChfcHJvcGVydGllcy50cmFuc2l0aW9uRW5kKSB7XG4gICAgICByZW1vdmVMaXN0ZW5lcnMgPSBhZGRFbmRMaXN0ZW5lcihub2RlLCBmaW5pc2gpO1xuICAgIH1cbiAgfTtcblxuICBDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZC5wcm90b3R5cGUucXVldWVDbGFzc0FuZE5vZGUgPSBmdW5jdGlvbiBxdWV1ZUNsYXNzQW5kTm9kZShjbGFzc05hbWUsIG5vZGUpIHtcbiAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgIHRoaXMuY2xhc3NOYW1lQW5kTm9kZVF1ZXVlLnB1c2goe1xuICAgICAgY2xhc3NOYW1lOiBjbGFzc05hbWUsXG4gICAgICBub2RlOiBub2RlXG4gICAgfSk7XG5cbiAgICBpZiAoIXRoaXMucmFmSGFuZGxlKSB7XG4gICAgICB0aGlzLnJhZkhhbmRsZSA9ICgwLCBfcmVxdWVzdEFuaW1hdGlvbkZyYW1lMi5kZWZhdWx0KShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczIuZmx1c2hDbGFzc05hbWVBbmROb2RlUXVldWUoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZC5wcm90b3R5cGUuZmx1c2hDbGFzc05hbWVBbmROb2RlUXVldWUgPSBmdW5jdGlvbiBmbHVzaENsYXNzTmFtZUFuZE5vZGVRdWV1ZSgpIHtcbiAgICBpZiAoIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICB0aGlzLmNsYXNzTmFtZUFuZE5vZGVRdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgLy8gVGhpcyBpcyBmb3IgdG8gZm9yY2UgYSByZXBhaW50LFxuICAgICAgICAvLyB3aGljaCBpcyBuZWNlc3NhcnkgaW4gb3JkZXIgdG8gdHJhbnNpdGlvbiBzdHlsZXMgd2hlbiBhZGRpbmcgYSBjbGFzcyBuYW1lLlxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtZXhwcmVzc2lvbnMgKi9cbiAgICAgICAgb2JqLm5vZGUuc2Nyb2xsVG9wO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLXVudXNlZC1leHByZXNzaW9ucyAqL1xuICAgICAgICAoMCwgX2FkZENsYXNzMi5kZWZhdWx0KShvYmoubm9kZSwgb2JqLmNsYXNzTmFtZSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5jbGFzc05hbWVBbmROb2RlUXVldWUubGVuZ3RoID0gMDtcbiAgICB0aGlzLnJhZkhhbmRsZSA9IG51bGw7XG4gIH07XG5cbiAgQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICB2YXIgcHJvcHMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcyk7XG4gICAgZGVsZXRlIHByb3BzLm5hbWU7XG4gICAgZGVsZXRlIHByb3BzLmFwcGVhcjtcbiAgICBkZWxldGUgcHJvcHMuZW50ZXI7XG4gICAgZGVsZXRlIHByb3BzLmxlYXZlO1xuICAgIGRlbGV0ZSBwcm9wcy5hcHBlYXJUaW1lb3V0O1xuICAgIGRlbGV0ZSBwcm9wcy5lbnRlclRpbWVvdXQ7XG4gICAgZGVsZXRlIHByb3BzLmxlYXZlVGltZW91dDtcbiAgICBkZWxldGUgcHJvcHMuY2hpbGRyZW47XG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jbG9uZUVsZW1lbnQoX3JlYWN0Mi5kZWZhdWx0LkNoaWxkcmVuLm9ubHkodGhpcy5wcm9wcy5jaGlsZHJlbiksIHByb3BzKTtcbiAgfTtcblxuICByZXR1cm4gQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQ7XG59KF9yZWFjdDIuZGVmYXVsdC5Db21wb25lbnQpO1xuXG5DU1NUcmFuc2l0aW9uR3JvdXBDaGlsZC5kaXNwbGF5TmFtZSA9ICdDU1NUcmFuc2l0aW9uR3JvdXBDaGlsZCc7XG5cblxuQ1NTVHJhbnNpdGlvbkdyb3VwQ2hpbGQucHJvcFR5cGVzID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiID8gcHJvcFR5cGVzIDoge307XG5cbmV4cG9ydHMuZGVmYXVsdCA9IENTU1RyYW5zaXRpb25Hcm91cENoaWxkO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX2NoYWluRnVuY3Rpb24gPSByZXF1aXJlKCdjaGFpbi1mdW5jdGlvbicpO1xuXG52YXIgX2NoYWluRnVuY3Rpb24yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY2hhaW5GdW5jdGlvbik7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJ3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG52YXIgX0NoaWxkTWFwcGluZyA9IHJlcXVpcmUoJy4vdXRpbHMvQ2hpbGRNYXBwaW5nJyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9XG5cbmZ1bmN0aW9uIF9wb3NzaWJsZUNvbnN0cnVjdG9yUmV0dXJuKHNlbGYsIGNhbGwpIHsgaWYgKCFzZWxmKSB7IHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTsgfSByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjsgfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIHByb3BUeXBlcyA9IHtcbiAgY29tcG9uZW50OiBfcHJvcFR5cGVzMi5kZWZhdWx0LmFueSxcbiAgY2hpbGRGYWN0b3J5OiBfcHJvcFR5cGVzMi5kZWZhdWx0LmZ1bmMsXG4gIGNoaWxkcmVuOiBfcHJvcFR5cGVzMi5kZWZhdWx0Lm5vZGVcbn07XG5cbnZhciBkZWZhdWx0UHJvcHMgPSB7XG4gIGNvbXBvbmVudDogJ3NwYW4nLFxuICBjaGlsZEZhY3Rvcnk6IGZ1bmN0aW9uIGNoaWxkRmFjdG9yeShjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZDtcbiAgfVxufTtcblxudmFyIFRyYW5zaXRpb25Hcm91cCA9IGZ1bmN0aW9uIChfUmVhY3QkQ29tcG9uZW50KSB7XG4gIF9pbmhlcml0cyhUcmFuc2l0aW9uR3JvdXAsIF9SZWFjdCRDb21wb25lbnQpO1xuXG4gIGZ1bmN0aW9uIFRyYW5zaXRpb25Hcm91cChwcm9wcywgY29udGV4dCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBUcmFuc2l0aW9uR3JvdXApO1xuXG4gICAgdmFyIF90aGlzID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX1JlYWN0JENvbXBvbmVudC5jYWxsKHRoaXMsIHByb3BzLCBjb250ZXh0KSk7XG5cbiAgICBfdGhpcy5wZXJmb3JtQXBwZWFyID0gZnVuY3Rpb24gKGtleSwgY29tcG9uZW50KSB7XG4gICAgICBfdGhpcy5jdXJyZW50bHlUcmFuc2l0aW9uaW5nS2V5c1trZXldID0gdHJ1ZTtcblxuICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsQXBwZWFyKSB7XG4gICAgICAgIGNvbXBvbmVudC5jb21wb25lbnRXaWxsQXBwZWFyKF90aGlzLl9oYW5kbGVEb25lQXBwZWFyaW5nLmJpbmQoX3RoaXMsIGtleSwgY29tcG9uZW50KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5faGFuZGxlRG9uZUFwcGVhcmluZyhrZXksIGNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLl9oYW5kbGVEb25lQXBwZWFyaW5nID0gZnVuY3Rpb24gKGtleSwgY29tcG9uZW50KSB7XG4gICAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudERpZEFwcGVhcikge1xuICAgICAgICBjb21wb25lbnQuY29tcG9uZW50RGlkQXBwZWFyKCk7XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSBfdGhpcy5jdXJyZW50bHlUcmFuc2l0aW9uaW5nS2V5c1trZXldO1xuXG4gICAgICB2YXIgY3VycmVudENoaWxkTWFwcGluZyA9ICgwLCBfQ2hpbGRNYXBwaW5nLmdldENoaWxkTWFwcGluZykoX3RoaXMucHJvcHMuY2hpbGRyZW4pO1xuXG4gICAgICBpZiAoIWN1cnJlbnRDaGlsZE1hcHBpbmcgfHwgIWN1cnJlbnRDaGlsZE1hcHBpbmcuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAvLyBUaGlzIHdhcyByZW1vdmVkIGJlZm9yZSBpdCBoYWQgZnVsbHkgYXBwZWFyZWQuIFJlbW92ZSBpdC5cbiAgICAgICAgX3RoaXMucGVyZm9ybUxlYXZlKGtleSwgY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMucGVyZm9ybUVudGVyID0gZnVuY3Rpb24gKGtleSwgY29tcG9uZW50KSB7XG4gICAgICBfdGhpcy5jdXJyZW50bHlUcmFuc2l0aW9uaW5nS2V5c1trZXldID0gdHJ1ZTtcblxuICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRXaWxsRW50ZXIpIHtcbiAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudFdpbGxFbnRlcihfdGhpcy5faGFuZGxlRG9uZUVudGVyaW5nLmJpbmQoX3RoaXMsIGtleSwgY29tcG9uZW50KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfdGhpcy5faGFuZGxlRG9uZUVudGVyaW5nKGtleSwgY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX3RoaXMuX2hhbmRsZURvbmVFbnRlcmluZyA9IGZ1bmN0aW9uIChrZXksIGNvbXBvbmVudCkge1xuICAgICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnREaWRFbnRlcikge1xuICAgICAgICBjb21wb25lbnQuY29tcG9uZW50RGlkRW50ZXIoKTtcbiAgICAgIH1cblxuICAgICAgZGVsZXRlIF90aGlzLmN1cnJlbnRseVRyYW5zaXRpb25pbmdLZXlzW2tleV07XG5cbiAgICAgIHZhciBjdXJyZW50Q2hpbGRNYXBwaW5nID0gKDAsIF9DaGlsZE1hcHBpbmcuZ2V0Q2hpbGRNYXBwaW5nKShfdGhpcy5wcm9wcy5jaGlsZHJlbik7XG5cbiAgICAgIGlmICghY3VycmVudENoaWxkTWFwcGluZyB8fCAhY3VycmVudENoaWxkTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIC8vIFRoaXMgd2FzIHJlbW92ZWQgYmVmb3JlIGl0IGhhZCBmdWxseSBlbnRlcmVkLiBSZW1vdmUgaXQuXG4gICAgICAgIF90aGlzLnBlcmZvcm1MZWF2ZShrZXksIGNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIF90aGlzLnBlcmZvcm1MZWF2ZSA9IGZ1bmN0aW9uIChrZXksIGNvbXBvbmVudCkge1xuICAgICAgX3RoaXMuY3VycmVudGx5VHJhbnNpdGlvbmluZ0tleXNba2V5XSA9IHRydWU7XG5cbiAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50V2lsbExlYXZlKSB7XG4gICAgICAgIGNvbXBvbmVudC5jb21wb25lbnRXaWxsTGVhdmUoX3RoaXMuX2hhbmRsZURvbmVMZWF2aW5nLmJpbmQoX3RoaXMsIGtleSwgY29tcG9uZW50KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBpcyBzb21ld2hhdCBkYW5nZXJvdXMgYi9jIGl0IGNhbGxzIHNldFN0YXRlKClcbiAgICAgICAgLy8gYWdhaW4sIGVmZmVjdGl2ZWx5IG11dGF0aW5nIHRoZSBjb21wb25lbnQgYmVmb3JlIGFsbCB0aGUgd29ya1xuICAgICAgICAvLyBpcyBkb25lLlxuICAgICAgICBfdGhpcy5faGFuZGxlRG9uZUxlYXZpbmcoa2V5LCBjb21wb25lbnQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5faGFuZGxlRG9uZUxlYXZpbmcgPSBmdW5jdGlvbiAoa2V5LCBjb21wb25lbnQpIHtcbiAgICAgIGlmIChjb21wb25lbnQuY29tcG9uZW50RGlkTGVhdmUpIHtcbiAgICAgICAgY29tcG9uZW50LmNvbXBvbmVudERpZExlYXZlKCk7XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSBfdGhpcy5jdXJyZW50bHlUcmFuc2l0aW9uaW5nS2V5c1trZXldO1xuXG4gICAgICB2YXIgY3VycmVudENoaWxkTWFwcGluZyA9ICgwLCBfQ2hpbGRNYXBwaW5nLmdldENoaWxkTWFwcGluZykoX3RoaXMucHJvcHMuY2hpbGRyZW4pO1xuXG4gICAgICBpZiAoY3VycmVudENoaWxkTWFwcGluZyAmJiBjdXJyZW50Q2hpbGRNYXBwaW5nLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgLy8gVGhpcyBlbnRlcmVkIGFnYWluIGJlZm9yZSBpdCBmdWxseSBsZWZ0LiBBZGQgaXQgYWdhaW4uXG4gICAgICAgIF90aGlzLmtleXNUb0VudGVyLnB1c2goa2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF90aGlzLnNldFN0YXRlKGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICAgIHZhciBuZXdDaGlsZHJlbiA9IF9leHRlbmRzKHt9LCBzdGF0ZS5jaGlsZHJlbik7XG4gICAgICAgICAgZGVsZXRlIG5ld0NoaWxkcmVuW2tleV07XG4gICAgICAgICAgcmV0dXJuIHsgY2hpbGRyZW46IG5ld0NoaWxkcmVuIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfdGhpcy5jaGlsZFJlZnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgX3RoaXMuc3RhdGUgPSB7XG4gICAgICBjaGlsZHJlbjogKDAsIF9DaGlsZE1hcHBpbmcuZ2V0Q2hpbGRNYXBwaW5nKShwcm9wcy5jaGlsZHJlbilcbiAgICB9O1xuICAgIHJldHVybiBfdGhpcztcbiAgfVxuXG4gIFRyYW5zaXRpb25Hcm91cC5wcm90b3R5cGUuY29tcG9uZW50V2lsbE1vdW50ID0gZnVuY3Rpb24gY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMuY3VycmVudGx5VHJhbnNpdGlvbmluZ0tleXMgPSB7fTtcbiAgICB0aGlzLmtleXNUb0VudGVyID0gW107XG4gICAgdGhpcy5rZXlzVG9MZWF2ZSA9IFtdO1xuICB9O1xuXG4gIFRyYW5zaXRpb25Hcm91cC5wcm90b3R5cGUuY29tcG9uZW50RGlkTW91bnQgPSBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICB2YXIgaW5pdGlhbENoaWxkTWFwcGluZyA9IHRoaXMuc3RhdGUuY2hpbGRyZW47XG4gICAgZm9yICh2YXIga2V5IGluIGluaXRpYWxDaGlsZE1hcHBpbmcpIHtcbiAgICAgIGlmIChpbml0aWFsQ2hpbGRNYXBwaW5nW2tleV0pIHtcbiAgICAgICAgdGhpcy5wZXJmb3JtQXBwZWFyKGtleSwgdGhpcy5jaGlsZFJlZnNba2V5XSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIFRyYW5zaXRpb25Hcm91cC5wcm90b3R5cGUuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgdmFyIG5leHRDaGlsZE1hcHBpbmcgPSAoMCwgX0NoaWxkTWFwcGluZy5nZXRDaGlsZE1hcHBpbmcpKG5leHRQcm9wcy5jaGlsZHJlbik7XG4gICAgdmFyIHByZXZDaGlsZE1hcHBpbmcgPSB0aGlzLnN0YXRlLmNoaWxkcmVuO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjaGlsZHJlbjogKDAsIF9DaGlsZE1hcHBpbmcubWVyZ2VDaGlsZE1hcHBpbmdzKShwcmV2Q2hpbGRNYXBwaW5nLCBuZXh0Q2hpbGRNYXBwaW5nKVxuICAgIH0pO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5leHRDaGlsZE1hcHBpbmcpIHtcbiAgICAgIHZhciBoYXNQcmV2ID0gcHJldkNoaWxkTWFwcGluZyAmJiBwcmV2Q2hpbGRNYXBwaW5nLmhhc093blByb3BlcnR5KGtleSk7XG4gICAgICBpZiAobmV4dENoaWxkTWFwcGluZ1trZXldICYmICFoYXNQcmV2ICYmICF0aGlzLmN1cnJlbnRseVRyYW5zaXRpb25pbmdLZXlzW2tleV0pIHtcbiAgICAgICAgdGhpcy5rZXlzVG9FbnRlci5wdXNoKGtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yICh2YXIgX2tleSBpbiBwcmV2Q2hpbGRNYXBwaW5nKSB7XG4gICAgICB2YXIgaGFzTmV4dCA9IG5leHRDaGlsZE1hcHBpbmcgJiYgbmV4dENoaWxkTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShfa2V5KTtcbiAgICAgIGlmIChwcmV2Q2hpbGRNYXBwaW5nW19rZXldICYmICFoYXNOZXh0ICYmICF0aGlzLmN1cnJlbnRseVRyYW5zaXRpb25pbmdLZXlzW19rZXldKSB7XG4gICAgICAgIHRoaXMua2V5c1RvTGVhdmUucHVzaChfa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSB3YW50IHRvIHNvbWVkYXkgY2hlY2sgZm9yIHJlb3JkZXJpbmcsIHdlIGNvdWxkIGRvIGl0IGhlcmUuXG4gIH07XG5cbiAgVHJhbnNpdGlvbkdyb3VwLnByb3RvdHlwZS5jb21wb25lbnREaWRVcGRhdGUgPSBmdW5jdGlvbiBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdmFyIF90aGlzMiA9IHRoaXM7XG5cbiAgICB2YXIga2V5c1RvRW50ZXIgPSB0aGlzLmtleXNUb0VudGVyO1xuICAgIHRoaXMua2V5c1RvRW50ZXIgPSBbXTtcbiAgICBrZXlzVG9FbnRlci5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHJldHVybiBfdGhpczIucGVyZm9ybUVudGVyKGtleSwgX3RoaXMyLmNoaWxkUmVmc1trZXldKTtcbiAgICB9KTtcblxuICAgIHZhciBrZXlzVG9MZWF2ZSA9IHRoaXMua2V5c1RvTGVhdmU7XG4gICAgdGhpcy5rZXlzVG9MZWF2ZSA9IFtdO1xuICAgIGtleXNUb0xlYXZlLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgcmV0dXJuIF90aGlzMi5wZXJmb3JtTGVhdmUoa2V5LCBfdGhpczIuY2hpbGRSZWZzW2tleV0pO1xuICAgIH0pO1xuICB9O1xuXG4gIFRyYW5zaXRpb25Hcm91cC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgLy8gVE9ETzogd2UgY291bGQgZ2V0IHJpZCBvZiB0aGUgbmVlZCBmb3IgdGhlIHdyYXBwZXIgbm9kZVxuICAgIC8vIGJ5IGNsb25pbmcgYSBzaW5nbGUgY2hpbGRcbiAgICB2YXIgY2hpbGRyZW5Ub1JlbmRlciA9IFtdO1xuXG4gICAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3Aoa2V5KSB7XG4gICAgICB2YXIgY2hpbGQgPSBfdGhpczMuc3RhdGUuY2hpbGRyZW5ba2V5XTtcbiAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICB2YXIgaXNDYWxsYmFja1JlZiA9IHR5cGVvZiBjaGlsZC5yZWYgIT09ICdzdHJpbmcnO1xuICAgICAgICB2YXIgZmFjdG9yeUNoaWxkID0gX3RoaXMzLnByb3BzLmNoaWxkRmFjdG9yeShjaGlsZCk7XG4gICAgICAgIHZhciByZWYgPSBmdW5jdGlvbiByZWYocikge1xuICAgICAgICAgIF90aGlzMy5jaGlsZFJlZnNba2V5XSA9IHI7XG4gICAgICAgIH07XG5cbiAgICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/ICgwLCBfd2FybmluZzIuZGVmYXVsdCkoaXNDYWxsYmFja1JlZiwgJ3N0cmluZyByZWZzIGFyZSBub3Qgc3VwcG9ydGVkIG9uIGNoaWxkcmVuIG9mIFRyYW5zaXRpb25Hcm91cCBhbmQgd2lsbCBiZSBpZ25vcmVkLiAnICsgJ1BsZWFzZSB1c2UgYSBjYWxsYmFjayByZWYgaW5zdGVhZDogaHR0cHM6Ly9mYWNlYm9vay5naXRodWIuaW8vcmVhY3QvZG9jcy9yZWZzLWFuZC10aGUtZG9tLmh0bWwjdGhlLXJlZi1jYWxsYmFjay1hdHRyaWJ1dGUnKSA6IHZvaWQgMDtcblxuICAgICAgICAvLyBBbHdheXMgY2hhaW5pbmcgdGhlIHJlZnMgbGVhZHMgdG8gcHJvYmxlbXMgd2hlbiB0aGUgY2hpbGRGYWN0b3J5XG4gICAgICAgIC8vIHdyYXBzIHRoZSBjaGlsZC4gVGhlIGNoaWxkIHJlZiBjYWxsYmFjayBnZXRzIGNhbGxlZCB0d2ljZSB3aXRoIHRoZVxuICAgICAgICAvLyB3cmFwcGVyIGFuZCB0aGUgY2hpbGQuIFNvIHdlIG9ubHkgbmVlZCB0byBjaGFpbiB0aGUgcmVmIGlmIHRoZVxuICAgICAgICAvLyBmYWN0b3J5Q2hpbGQgaXMgbm90IGRpZmZlcmVudCBmcm9tIGNoaWxkLlxuICAgICAgICBpZiAoZmFjdG9yeUNoaWxkID09PSBjaGlsZCAmJiBpc0NhbGxiYWNrUmVmKSB7XG4gICAgICAgICAgcmVmID0gKDAsIF9jaGFpbkZ1bmN0aW9uMi5kZWZhdWx0KShjaGlsZC5yZWYsIHJlZik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBZb3UgbWF5IG5lZWQgdG8gYXBwbHkgcmVhY3RpdmUgdXBkYXRlcyB0byBhIGNoaWxkIGFzIGl0IGlzIGxlYXZpbmcuXG4gICAgICAgIC8vIFRoZSBub3JtYWwgUmVhY3Qgd2F5IHRvIGRvIGl0IHdvbid0IHdvcmsgc2luY2UgdGhlIGNoaWxkIHdpbGwgaGF2ZVxuICAgICAgICAvLyBhbHJlYWR5IGJlZW4gcmVtb3ZlZC4gSW4gY2FzZSB5b3UgbmVlZCB0aGlzIGJlaGF2aW9yIHlvdSBjYW4gcHJvdmlkZVxuICAgICAgICAvLyBhIGNoaWxkRmFjdG9yeSBmdW5jdGlvbiB0byB3cmFwIGV2ZXJ5IGNoaWxkLCBldmVuIHRoZSBvbmVzIHRoYXQgYXJlXG4gICAgICAgIC8vIGxlYXZpbmcuXG4gICAgICAgIGNoaWxkcmVuVG9SZW5kZXIucHVzaChfcmVhY3QyLmRlZmF1bHQuY2xvbmVFbGVtZW50KGZhY3RvcnlDaGlsZCwge1xuICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgIHJlZjogcmVmXG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuc3RhdGUuY2hpbGRyZW4pIHtcbiAgICAgIF9sb29wKGtleSk7XG4gICAgfVxuXG4gICAgLy8gRG8gbm90IGZvcndhcmQgVHJhbnNpdGlvbkdyb3VwIHByb3BzIHRvIHByaW1pdGl2ZSBET00gbm9kZXNcbiAgICB2YXIgcHJvcHMgPSBfZXh0ZW5kcyh7fSwgdGhpcy5wcm9wcyk7XG4gICAgZGVsZXRlIHByb3BzLnRyYW5zaXRpb25MZWF2ZTtcbiAgICBkZWxldGUgcHJvcHMudHJhbnNpdGlvbk5hbWU7XG4gICAgZGVsZXRlIHByb3BzLnRyYW5zaXRpb25BcHBlYXI7XG4gICAgZGVsZXRlIHByb3BzLnRyYW5zaXRpb25FbnRlcjtcbiAgICBkZWxldGUgcHJvcHMuY2hpbGRGYWN0b3J5O1xuICAgIGRlbGV0ZSBwcm9wcy50cmFuc2l0aW9uTGVhdmVUaW1lb3V0O1xuICAgIGRlbGV0ZSBwcm9wcy50cmFuc2l0aW9uRW50ZXJUaW1lb3V0O1xuICAgIGRlbGV0ZSBwcm9wcy50cmFuc2l0aW9uQXBwZWFyVGltZW91dDtcbiAgICBkZWxldGUgcHJvcHMuY29tcG9uZW50O1xuXG4gICAgcmV0dXJuIF9yZWFjdDIuZGVmYXVsdC5jcmVhdGVFbGVtZW50KHRoaXMucHJvcHMuY29tcG9uZW50LCBwcm9wcywgY2hpbGRyZW5Ub1JlbmRlcik7XG4gIH07XG5cbiAgcmV0dXJuIFRyYW5zaXRpb25Hcm91cDtcbn0oX3JlYWN0Mi5kZWZhdWx0LkNvbXBvbmVudCk7XG5cblRyYW5zaXRpb25Hcm91cC5kaXNwbGF5TmFtZSA9ICdUcmFuc2l0aW9uR3JvdXAnO1xuXG5cblRyYW5zaXRpb25Hcm91cC5wcm9wVHlwZXMgPSBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gXCJwcm9kdWN0aW9uXCIgPyBwcm9wVHlwZXMgOiB7fTtcblRyYW5zaXRpb25Hcm91cC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFRyYW5zaXRpb25Hcm91cDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuZ2V0Q2hpbGRNYXBwaW5nID0gZ2V0Q2hpbGRNYXBwaW5nO1xuZXhwb3J0cy5tZXJnZUNoaWxkTWFwcGluZ3MgPSBtZXJnZUNoaWxkTWFwcGluZ3M7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG4vKipcbiAqIEdpdmVuIGB0aGlzLnByb3BzLmNoaWxkcmVuYCwgcmV0dXJuIGFuIG9iamVjdCBtYXBwaW5nIGtleSB0byBjaGlsZC5cbiAqXG4gKiBAcGFyYW0geyp9IGNoaWxkcmVuIGB0aGlzLnByb3BzLmNoaWxkcmVuYFxuICogQHJldHVybiB7b2JqZWN0fSBNYXBwaW5nIG9mIGtleSB0byBjaGlsZFxuICovXG5mdW5jdGlvbiBnZXRDaGlsZE1hcHBpbmcoY2hpbGRyZW4pIHtcbiAgaWYgKCFjaGlsZHJlbikge1xuICAgIHJldHVybiBjaGlsZHJlbjtcbiAgfVxuICB2YXIgcmVzdWx0ID0ge307XG4gIF9yZWFjdC5DaGlsZHJlbi5tYXAoY2hpbGRyZW4sIGZ1bmN0aW9uIChjaGlsZCkge1xuICAgIHJldHVybiBjaGlsZDtcbiAgfSkuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXN1bHRbY2hpbGQua2V5XSA9IGNoaWxkO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBXaGVuIHlvdSdyZSBhZGRpbmcgb3IgcmVtb3ZpbmcgY2hpbGRyZW4gc29tZSBtYXkgYmUgYWRkZWQgb3IgcmVtb3ZlZCBpbiB0aGVcbiAqIHNhbWUgcmVuZGVyIHBhc3MuIFdlIHdhbnQgdG8gc2hvdyAqYm90aCogc2luY2Ugd2Ugd2FudCB0byBzaW11bHRhbmVvdXNseVxuICogYW5pbWF0ZSBlbGVtZW50cyBpbiBhbmQgb3V0LiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgcHJldmlvdXMgc2V0IG9mIGtleXNcbiAqIGFuZCBhIG5ldyBzZXQgb2Yga2V5cyBhbmQgbWVyZ2VzIHRoZW0gd2l0aCBpdHMgYmVzdCBndWVzcyBvZiB0aGUgY29ycmVjdFxuICogb3JkZXJpbmcuIEluIHRoZSBmdXR1cmUgd2UgbWF5IGV4cG9zZSBzb21lIG9mIHRoZSB1dGlsaXRpZXMgaW5cbiAqIFJlYWN0TXVsdGlDaGlsZCB0byBtYWtlIHRoaXMgZWFzeSwgYnV0IGZvciBub3cgUmVhY3QgaXRzZWxmIGRvZXMgbm90XG4gKiBkaXJlY3RseSBoYXZlIHRoaXMgY29uY2VwdCBvZiB0aGUgdW5pb24gb2YgcHJldkNoaWxkcmVuIGFuZCBuZXh0Q2hpbGRyZW5cbiAqIHNvIHdlIGltcGxlbWVudCBpdCBoZXJlLlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBwcmV2IHByZXYgY2hpbGRyZW4gYXMgcmV0dXJuZWQgZnJvbVxuICogYFJlYWN0VHJhbnNpdGlvbkNoaWxkTWFwcGluZy5nZXRDaGlsZE1hcHBpbmcoKWAuXG4gKiBAcGFyYW0ge29iamVjdH0gbmV4dCBuZXh0IGNoaWxkcmVuIGFzIHJldHVybmVkIGZyb21cbiAqIGBSZWFjdFRyYW5zaXRpb25DaGlsZE1hcHBpbmcuZ2V0Q2hpbGRNYXBwaW5nKClgLlxuICogQHJldHVybiB7b2JqZWN0fSBhIGtleSBzZXQgdGhhdCBjb250YWlucyBhbGwga2V5cyBpbiBgcHJldmAgYW5kIGFsbCBrZXlzXG4gKiBpbiBgbmV4dGAgaW4gYSByZWFzb25hYmxlIG9yZGVyLlxuICovXG5mdW5jdGlvbiBtZXJnZUNoaWxkTWFwcGluZ3MocHJldiwgbmV4dCkge1xuICBwcmV2ID0gcHJldiB8fCB7fTtcbiAgbmV4dCA9IG5leHQgfHwge307XG5cbiAgZnVuY3Rpb24gZ2V0VmFsdWVGb3JLZXkoa2V5KSB7XG4gICAgaWYgKG5leHQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0dXJuIG5leHRba2V5XTtcbiAgICB9XG5cbiAgICByZXR1cm4gcHJldltrZXldO1xuICB9XG5cbiAgLy8gRm9yIGVhY2gga2V5IG9mIGBuZXh0YCwgdGhlIGxpc3Qgb2Yga2V5cyB0byBpbnNlcnQgYmVmb3JlIHRoYXQga2V5IGluXG4gIC8vIHRoZSBjb21iaW5lZCBsaXN0XG4gIHZhciBuZXh0S2V5c1BlbmRpbmcgPSB7fTtcblxuICB2YXIgcGVuZGluZ0tleXMgPSBbXTtcbiAgZm9yICh2YXIgcHJldktleSBpbiBwcmV2KSB7XG4gICAgaWYgKG5leHQuaGFzT3duUHJvcGVydHkocHJldktleSkpIHtcbiAgICAgIGlmIChwZW5kaW5nS2V5cy5sZW5ndGgpIHtcbiAgICAgICAgbmV4dEtleXNQZW5kaW5nW3ByZXZLZXldID0gcGVuZGluZ0tleXM7XG4gICAgICAgIHBlbmRpbmdLZXlzID0gW107XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHBlbmRpbmdLZXlzLnB1c2gocHJldktleSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGkgPSB2b2lkIDA7XG4gIHZhciBjaGlsZE1hcHBpbmcgPSB7fTtcbiAgZm9yICh2YXIgbmV4dEtleSBpbiBuZXh0KSB7XG4gICAgaWYgKG5leHRLZXlzUGVuZGluZy5oYXNPd25Qcm9wZXJ0eShuZXh0S2V5KSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IG5leHRLZXlzUGVuZGluZ1tuZXh0S2V5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcGVuZGluZ05leHRLZXkgPSBuZXh0S2V5c1BlbmRpbmdbbmV4dEtleV1baV07XG4gICAgICAgIGNoaWxkTWFwcGluZ1tuZXh0S2V5c1BlbmRpbmdbbmV4dEtleV1baV1dID0gZ2V0VmFsdWVGb3JLZXkocGVuZGluZ05leHRLZXkpO1xuICAgICAgfVxuICAgIH1cbiAgICBjaGlsZE1hcHBpbmdbbmV4dEtleV0gPSBnZXRWYWx1ZUZvcktleShuZXh0S2V5KTtcbiAgfVxuXG4gIC8vIEZpbmFsbHksIGFkZCB0aGUga2V5cyB3aGljaCBkaWRuJ3QgYXBwZWFyIGJlZm9yZSBhbnkga2V5IGluIGBuZXh0YFxuICBmb3IgKGkgPSAwOyBpIDwgcGVuZGluZ0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICBjaGlsZE1hcHBpbmdbcGVuZGluZ0tleXNbaV1dID0gZ2V0VmFsdWVGb3JLZXkocGVuZGluZ0tleXNbaV0pO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkTWFwcGluZztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLm5hbWVTaGFwZSA9IHVuZGVmaW5lZDtcbmV4cG9ydHMudHJhbnNpdGlvblRpbWVvdXQgPSB0cmFuc2l0aW9uVGltZW91dDtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gdHJhbnNpdGlvblRpbWVvdXQodHJhbnNpdGlvblR5cGUpIHtcbiAgdmFyIHRpbWVvdXRQcm9wTmFtZSA9ICd0cmFuc2l0aW9uJyArIHRyYW5zaXRpb25UeXBlICsgJ1RpbWVvdXQnO1xuICB2YXIgZW5hYmxlZFByb3BOYW1lID0gJ3RyYW5zaXRpb24nICsgdHJhbnNpdGlvblR5cGU7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wcykge1xuICAgIC8vIElmIHRoZSB0cmFuc2l0aW9uIGlzIGVuYWJsZWRcbiAgICBpZiAocHJvcHNbZW5hYmxlZFByb3BOYW1lXSkge1xuICAgICAgLy8gSWYgbm8gdGltZW91dCBkdXJhdGlvbiBpcyBwcm92aWRlZFxuICAgICAgaWYgKHByb3BzW3RpbWVvdXRQcm9wTmFtZV0gPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yKHRpbWVvdXRQcm9wTmFtZSArICcgd2FzblxcJ3Qgc3VwcGxpZWQgdG8gQ1NTVHJhbnNpdGlvbkdyb3VwOiAnICsgJ3RoaXMgY2FuIGNhdXNlIHVucmVsaWFibGUgYW5pbWF0aW9ucyBhbmQgd29uXFwndCBiZSBzdXBwb3J0ZWQgaW4gJyArICdhIGZ1dHVyZSB2ZXJzaW9uIG9mIFJlYWN0LiBTZWUgJyArICdodHRwczovL2ZiLm1lL3JlYWN0LWFuaW1hdGlvbi10cmFuc2l0aW9uLWdyb3VwLXRpbWVvdXQgZm9yIG1vcmUgJyArICdpbmZvcm1hdGlvbi4nKTtcblxuICAgICAgICAvLyBJZiB0aGUgZHVyYXRpb24gaXNuJ3QgYSBudW1iZXJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3BzW3RpbWVvdXRQcm9wTmFtZV0gIT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXJyb3IodGltZW91dFByb3BOYW1lICsgJyBtdXN0IGJlIGEgbnVtYmVyIChpbiBtaWxsaXNlY29uZHMpJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG59XG5cbnZhciBuYW1lU2hhcGUgPSBleHBvcnRzLm5hbWVTaGFwZSA9IF9wcm9wVHlwZXMyLmRlZmF1bHQub25lT2ZUeXBlKFtfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZywgX3Byb3BUeXBlczIuZGVmYXVsdC5zaGFwZSh7XG4gIGVudGVyOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZyxcbiAgbGVhdmU6IF9wcm9wVHlwZXMyLmRlZmF1bHQuc3RyaW5nLFxuICBhY3RpdmU6IF9wcm9wVHlwZXMyLmRlZmF1bHQuc3RyaW5nXG59KSwgX3Byb3BUeXBlczIuZGVmYXVsdC5zaGFwZSh7XG4gIGVudGVyOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZyxcbiAgZW50ZXJBY3RpdmU6IF9wcm9wVHlwZXMyLmRlZmF1bHQuc3RyaW5nLFxuICBsZWF2ZTogX3Byb3BUeXBlczIuZGVmYXVsdC5zdHJpbmcsXG4gIGxlYXZlQWN0aXZlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZyxcbiAgYXBwZWFyOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZyxcbiAgYXBwZWFyQWN0aXZlOiBfcHJvcFR5cGVzMi5kZWZhdWx0LnN0cmluZ1xufSldKTsiLCIvKipcbiAqIENvcHlyaWdodCAyMDE0LTIwMTUsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogU2ltaWxhciB0byBpbnZhcmlhbnQgYnV0IG9ubHkgbG9ncyBhIHdhcm5pbmcgaWYgdGhlIGNvbmRpdGlvbiBpcyBub3QgbWV0LlxuICogVGhpcyBjYW4gYmUgdXNlZCB0byBsb2cgaXNzdWVzIGluIGRldmVsb3BtZW50IGVudmlyb25tZW50cyBpbiBjcml0aWNhbFxuICogcGF0aHMuIFJlbW92aW5nIHRoZSBsb2dnaW5nIGNvZGUgZm9yIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRzIHdpbGwga2VlcCB0aGVcbiAqIHNhbWUgbG9naWMgYW5kIGZvbGxvdyB0aGUgc2FtZSBjb2RlIHBhdGhzLlxuICovXG5cbnZhciB3YXJuaW5nID0gZnVuY3Rpb24oKSB7fTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgd2FybmluZyA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhcmdzKSB7XG4gICAgdmFyIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gPiAyID8gbGVuIC0gMiA6IDApO1xuICAgIGZvciAodmFyIGtleSA9IDI7IGtleSA8IGxlbjsga2V5KyspIHtcbiAgICAgIGFyZ3Nba2V5IC0gMl0gPSBhcmd1bWVudHNba2V5XTtcbiAgICB9XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdgd2FybmluZyhjb25kaXRpb24sIGZvcm1hdCwgLi4uYXJncylgIHJlcXVpcmVzIGEgd2FybmluZyAnICtcbiAgICAgICAgJ21lc3NhZ2UgYXJndW1lbnQnXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChmb3JtYXQubGVuZ3RoIDwgMTAgfHwgKC9eW3NcXFddKiQvKS50ZXN0KGZvcm1hdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1RoZSB3YXJuaW5nIGZvcm1hdCBzaG91bGQgYmUgYWJsZSB0byB1bmlxdWVseSBpZGVudGlmeSB0aGlzICcgK1xuICAgICAgICAnd2FybmluZy4gUGxlYXNlLCB1c2UgYSBtb3JlIGRlc2NyaXB0aXZlIGZvcm1hdCB0aGFuOiAnICsgZm9ybWF0XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgdmFyIG1lc3NhZ2UgPSAnV2FybmluZzogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gYXJnc1thcmdJbmRleCsrXTtcbiAgICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAgICAgLy8gdG8gZmluZCB0aGUgY2FsbHNpdGUgdGhhdCBjYXVzZWQgdGhpcyB3YXJuaW5nIHRvIGZpcmUuXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgIH0gY2F0Y2goeCkge31cbiAgICB9XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2FybmluZztcbiIsImltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3NzLCBTdHlsZVNoZWV0IH0gZnJvbSAnYXBocm9kaXRlL25vLWltcG9ydGFudCc7XG5cbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuLi90aGVtZSc7XG5pbXBvcnQgeyBkZWVwTWVyZ2UgfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQgSWNvbiBmcm9tICcuL0ljb24nO1xuXG5mdW5jdGlvbiBBcnJvdyAoe1xuXHRkaXJlY3Rpb24sXG5cdGljb24sXG5cdG9uQ2xpY2ssXG5cdHNpemUsXG5cdC4uLnByb3BzLFxufSxcbntcblx0dGhlbWUsXG59KSB7XG5cdGNvbnN0IGNsYXNzZXMgPSBTdHlsZVNoZWV0LmNyZWF0ZShkZWVwTWVyZ2UoZGVmYXVsdFN0eWxlcywgdGhlbWUpKTtcblxuXHRyZXR1cm4gKFxuXHRcdDxidXR0b25cblx0XHRcdHR5cGU9XCJidXR0b25cIlxuXHRcdFx0Y2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy5hcnJvdywgY2xhc3Nlc1snYXJyb3dfX2RpcmVjdGlvbl9fJyArIGRpcmVjdGlvbl0sIHNpemUgJiYgY2xhc3Nlc1snYXJyb3dfX3NpemVfXycgKyBzaXplXSl9XG5cdFx0XHRvbkNsaWNrPXtvbkNsaWNrfVxuXHRcdFx0b25Ub3VjaEVuZD17b25DbGlja31cblx0XHRcdHsuLi5wcm9wc31cblx0XHQ+XG5cdFx0XHQ8SWNvbiBmaWxsPXshIXRoZW1lLmFycm93ICYmIHRoZW1lLmFycm93LmZpbGwgfHwgZGVmYXVsdHMuYXJyb3cuZmlsbH0gdHlwZT17aWNvbn0gLz5cblx0XHQ8L2J1dHRvbj5cblx0KTtcbn1cblxuQXJyb3cucHJvcFR5cGVzID0ge1xuXHRkaXJlY3Rpb246IFByb3BUeXBlcy5vbmVPZihbJ2xlZnQnLCAncmlnaHQnXSksXG5cdGljb246IFByb3BUeXBlcy5zdHJpbmcsXG5cdG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ21lZGl1bScsICdzbWFsbCddKS5pc1JlcXVpcmVkLFxufTtcbkFycm93LmRlZmF1bHRQcm9wcyA9IHtcblx0c2l6ZTogJ21lZGl1bScsXG59O1xuQXJyb3cuY29udGV4dFR5cGVzID0ge1xuXHR0aGVtZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcblxuY29uc3QgZGVmYXVsdFN0eWxlcyA9IHtcblx0YXJyb3c6IHtcblx0XHRiYWNrZ3JvdW5kOiAnbm9uZScsXG5cdFx0Ym9yZGVyOiAnbm9uZScsXG5cdFx0Ym9yZGVyUmFkaXVzOiA0LFxuXHRcdGN1cnNvcjogJ3BvaW50ZXInLFxuXHRcdG91dGxpbmU6ICdub25lJyxcblx0XHRwYWRkaW5nOiAxMCwgLy8gaW5jcmVhc2UgaGl0IGFyZWFcblx0XHRwb3NpdGlvbjogJ2Fic29sdXRlJyxcblx0XHR0b3A6ICc1MCUnLFxuXG5cdFx0Ly8gZGlzYWJsZSB1c2VyIHNlbGVjdFxuXHRcdFdlYmtpdFRvdWNoQ2FsbG91dDogJ25vbmUnLFxuXHRcdHVzZXJTZWxlY3Q6ICdub25lJyxcblx0fSxcblxuXHQvLyBzaXplZXNcblx0YXJyb3dfX3NpemVfX21lZGl1bToge1xuXHRcdGhlaWdodDogZGVmYXVsdHMuYXJyb3cuaGVpZ2h0LFxuXHRcdG1hcmdpblRvcDogKGRlZmF1bHRzLmFycm93LmhlaWdodCArIDIwKjIpIC8gLTIsXG5cdFx0d2lkdGg6IDQwLFxuXG5cdFx0J0BtZWRpYSAobWluLXdpZHRoOiA3NjhweCknOiB7XG5cdFx0XHR3aWR0aDogNzAsXG5cdFx0fSxcblx0fSxcblx0YXJyb3dfX3NpemVfX3NtYWxsOiB7XG5cdFx0aGVpZ2h0OiBkZWZhdWx0cy50aHVtYm5haWwuc2l6ZSxcblx0XHRtYXJnaW5Ub3A6IChkZWZhdWx0cy50aHVtYm5haWwuc2l6ZSArIDIwKjIpIC8gLTIsXG5cdFx0d2lkdGg6IDMwLFxuXG5cdFx0J0BtZWRpYSAobWluLXdpZHRoOiA1MDBweCknOiB7XG5cdFx0XHR3aWR0aDogNDAsXG5cdFx0fSxcblx0fSxcblxuXHQvLyBkaXJlY3Rpb25cblx0YXJyb3dfX2RpcmVjdGlvbl9fcmlnaHQ6IHtcblx0XHRyaWdodDogZGVmYXVsdHMuY29udGFpbmVyLmd1dHRlci5ob3Jpem9udGFsLFxuXHR9LFxuXHRhcnJvd19fZGlyZWN0aW9uX19sZWZ0OiB7XG5cdFx0bGVmdDogZGVmYXVsdHMuY29udGFpbmVyLmd1dHRlci5ob3Jpem9udGFsLFxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJvdztcbiIsImltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3NzLCBTdHlsZVNoZWV0IH0gZnJvbSAnYXBocm9kaXRlL25vLWltcG9ydGFudCc7XG5cbmltcG9ydCBkZWZhdWx0cyBmcm9tICcuLi90aGVtZSc7XG5pbXBvcnQgeyBkZWVwTWVyZ2UgfSBmcm9tICcuLi91dGlscyc7XG5cbmZ1bmN0aW9uIENvbnRhaW5lciAoeyAuLi5wcm9wcyB9LCB7IHRoZW1lIH0pIHtcblx0Y29uc3QgY2xhc3NlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKGRlZXBNZXJnZShkZWZhdWx0U3R5bGVzLCB0aGVtZSkpO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBpZD1cImxpZ2h0Ym94QmFja2Ryb3BcIlxuXHRcdFx0Y2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy5jb250YWluZXIpfVxuXHRcdFx0ey4uLnByb3BzfVxuXHRcdC8+XG5cdCk7XG59XG5cbkNvbnRhaW5lci5jb250ZXh0VHlwZXMgPSB7XG5cdHRoZW1lOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuXG5jb25zdCBkZWZhdWx0U3R5bGVzID0ge1xuXHRjb250YWluZXI6IHtcblx0XHRhbGlnbkl0ZW1zOiAnY2VudGVyJyxcblx0XHRiYWNrZ3JvdW5kQ29sb3I6IGRlZmF1bHRzLmNvbnRhaW5lci5iYWNrZ3JvdW5kLFxuXHRcdGJveFNpemluZzogJ2JvcmRlci1ib3gnLFxuXHRcdGRpc3BsYXk6ICdmbGV4Jyxcblx0XHRoZWlnaHQ6ICcxMDB2aCcsXG5cdFx0anVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxuXHRcdGxlZnQ6IDAsXG5cdFx0cGFkZGluZ0JvdHRvbTogZGVmYXVsdHMuY29udGFpbmVyLmd1dHRlci52ZXJ0aWNhbCxcblx0XHRwYWRkaW5nTGVmdDogZGVmYXVsdHMuY29udGFpbmVyLmd1dHRlci5ob3Jpem9udGFsLFxuXHRcdHBhZGRpbmdSaWdodDogZGVmYXVsdHMuY29udGFpbmVyLmd1dHRlci5ob3Jpem9udGFsLFxuXHRcdHBhZGRpbmdUb3A6IGRlZmF1bHRzLmNvbnRhaW5lci5ndXR0ZXIudmVydGljYWwsXG5cdFx0cG9zaXRpb246ICdmaXhlZCcsXG5cdFx0dG9wOiAwLFxuXHRcdHdpZHRoOiAnMTAwdncnLFxuXHRcdG1hcmdpbjogMCxcblx0XHR6SW5kZXg6IGRlZmF1bHRzLmNvbnRhaW5lci56SW5kZXgsXG5cdH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRhaW5lcjtcbiIsImltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3NzLCBTdHlsZVNoZWV0IH0gZnJvbSAnYXBocm9kaXRlL25vLWltcG9ydGFudCc7XG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi4vdGhlbWUnO1xuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5mdW5jdGlvbiBGb290ZXIgKHtcblx0Y2FwdGlvbixcblx0Y291bnRDdXJyZW50LFxuXHRjb3VudFNlcGFyYXRvcixcblx0Y291bnRUb3RhbCxcblx0c2hvd0NvdW50LFxuXHQuLi5wcm9wcyxcbn0sIHtcblx0dGhlbWUsXG59KSB7XG5cdGlmICghY2FwdGlvbiAmJiAhc2hvd0NvdW50KSByZXR1cm4gbnVsbDtcblxuXHRjb25zdCBjbGFzc2VzID0gU3R5bGVTaGVldC5jcmVhdGUoZGVlcE1lcmdlKGRlZmF1bHRTdHlsZXMsIHRoZW1lKSk7XG5cblx0Y29uc3QgaW1hZ2VDb3VudCA9IHNob3dDb3VudCA/IChcblx0XHQ8ZGl2IGNsYXNzTmFtZT17Y3NzKGNsYXNzZXMuZm9vdGVyQ291bnQpfT5cblx0XHRcdHtjb3VudEN1cnJlbnR9XG5cdFx0XHR7Y291bnRTZXBhcmF0b3J9XG5cdFx0XHR7Y291bnRUb3RhbH1cblx0XHQ8L2Rpdj4pXG5cdFx0OiA8c3BhbiAvPjtcblxuXHRyZXR1cm4gKFxuXHRcdDxkaXYgY2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy5mb290ZXIpfSB7Li4ucHJvcHN9PlxuXHRcdFx0e2NhcHRpb24gPyAoXG5cdFx0XHRcdDxmaWdjYXB0aW9uIGNsYXNzTmFtZT17Y3NzKGNsYXNzZXMuZm9vdGVyQ2FwdGlvbil9PlxuXHRcdFx0XHRcdHtjYXB0aW9ufVxuXHRcdFx0XHQ8L2ZpZ2NhcHRpb24+XG5cdFx0XHQpIDogPHNwYW4gLz59XG5cdFx0XHR7aW1hZ2VDb3VudH1cblx0XHQ8L2Rpdj5cblx0KTtcbn1cblxuRm9vdGVyLnByb3BUeXBlcyA9IHtcblx0Y2FwdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmVsZW1lbnRdKSxcblx0Y291bnRDdXJyZW50OiBQcm9wVHlwZXMubnVtYmVyLFxuXHRjb3VudFNlcGFyYXRvcjogUHJvcFR5cGVzLnN0cmluZyxcblx0Y291bnRUb3RhbDogUHJvcFR5cGVzLm51bWJlcixcblx0c2hvd0NvdW50OiBQcm9wVHlwZXMuYm9vbCxcbn07XG5Gb290ZXIuY29udGV4dFR5cGVzID0ge1xuXHR0aGVtZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcblxuY29uc3QgZGVmYXVsdFN0eWxlcyA9IHtcblx0Zm9vdGVyOiB7XG5cdFx0Ym94U2l6aW5nOiAnYm9yZGVyLWJveCcsXG5cdFx0Y29sb3I6IGRlZmF1bHRzLmZvb3Rlci5jb2xvcixcblx0XHRjdXJzb3I6ICdhdXRvJyxcblx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0anVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyxcblx0XHRsZWZ0OiAwLFxuXHRcdGxpbmVIZWlnaHQ6IDEuMyxcblx0XHRwYWRkaW5nQm90dG9tOiBkZWZhdWx0cy5mb290ZXIuZ3V0dGVyLnZlcnRpY2FsLFxuXHRcdHBhZGRpbmdMZWZ0OiBkZWZhdWx0cy5mb290ZXIuZ3V0dGVyLmhvcml6b250YWwsXG5cdFx0cGFkZGluZ1JpZ2h0OiBkZWZhdWx0cy5mb290ZXIuZ3V0dGVyLmhvcml6b250YWwsXG5cdFx0cGFkZGluZ1RvcDogZGVmYXVsdHMuZm9vdGVyLmd1dHRlci52ZXJ0aWNhbCxcblx0fSxcblx0Zm9vdGVyQ291bnQ6IHtcblx0XHRjb2xvcjogZGVmYXVsdHMuZm9vdGVyLmNvdW50LmNvbG9yLFxuXHRcdGZvbnRTaXplOiBkZWZhdWx0cy5mb290ZXIuY291bnQuZm9udFNpemUsXG5cdFx0cGFkZGluZ0xlZnQ6ICcxZW0nLCAvLyBhZGQgYSBzbWFsbCBndXR0ZXIgZm9yIHRoZSBjYXB0aW9uXG5cdH0sXG5cdGZvb3RlckNhcHRpb246IHtcblx0XHRmbGV4OiAnMSAxIDAnLFxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb290ZXI7XG4iLCJpbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNzcywgU3R5bGVTaGVldCB9IGZyb20gJ2FwaHJvZGl0ZS9uby1pbXBvcnRhbnQnO1xuXG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi4vdGhlbWUnO1xuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IEljb24gZnJvbSAnLi9JY29uJztcblxuZnVuY3Rpb24gSGVhZGVyICh7XG5cdGN1c3RvbUNvbnRyb2xzLFxuXHRvbkNsb3NlLFxuXHRzaG93Q2xvc2VCdXR0b24sXG5cdGNsb3NlQnV0dG9uVGl0bGUsXG5cdC4uLnByb3BzLFxufSwge1xuXHR0aGVtZSxcbn0pIHtcblx0Y29uc3QgY2xhc3NlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKGRlZXBNZXJnZShkZWZhdWx0U3R5bGVzLCB0aGVtZSkpO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdiBjbGFzc05hbWU9e2NzcyhjbGFzc2VzLmhlYWRlcil9IHsuLi5wcm9wc30+XG5cdFx0XHR7Y3VzdG9tQ29udHJvbHMgPyBjdXN0b21Db250cm9scyA6IDxzcGFuIC8+fVxuXHRcdFx0eyEhc2hvd0Nsb3NlQnV0dG9uICYmIChcblx0XHRcdFx0PGJ1dHRvblxuXHRcdFx0XHRcdHRpdGxlPXtjbG9zZUJ1dHRvblRpdGxlfVxuXHRcdFx0XHRcdGNsYXNzTmFtZT17Y3NzKGNsYXNzZXMuY2xvc2UpfVxuXHRcdFx0XHRcdG9uQ2xpY2s9e29uQ2xvc2V9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8SWNvbiBmaWxsPXshIXRoZW1lLmNsb3NlICYmIHRoZW1lLmNsb3NlLmZpbGwgfHwgZGVmYXVsdHMuY2xvc2UuZmlsbH0gdHlwZT1cImNsb3NlXCIgLz5cblx0XHRcdFx0PC9idXR0b24+XG5cdFx0XHQpfVxuXHRcdDwvZGl2PlxuXHQpO1xufVxuXG5IZWFkZXIucHJvcFR5cGVzID0ge1xuXHRjdXN0b21Db250cm9sczogUHJvcFR5cGVzLmFycmF5LFxuXHRvbkNsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXHRzaG93Q2xvc2VCdXR0b246IFByb3BUeXBlcy5ib29sLFxufTtcbkhlYWRlci5jb250ZXh0VHlwZXMgPSB7XG5cdHRoZW1lOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuXG5jb25zdCBkZWZhdWx0U3R5bGVzID0ge1xuXHRoZWFkZXI6IHtcblx0XHRkaXNwbGF5OiAnZmxleCcsXG5cdFx0anVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJyxcblx0XHRoZWlnaHQ6IDEwLCAvKmRlZmF1bHRzLmhlYWRlci5oZWlnaHQsKi9cblx0fSxcblx0Y2xvc2U6IHtcblx0XHRiYWNrZ3JvdW5kQ29sb3I6ICdyZ2JhKDAsMCwwLDAuNSknLFxuXHRcdGJvcmRlcjogJ25vbmUnLFxuXHRcdGJvcmRlclJhZGl1czogNCxcblx0XHRjdXJzb3I6ICdwb2ludGVyJyxcblx0XHRvdXRsaW5lOiAnbm9uZScsXG5cdFx0cG9zaXRpb246ICdmaXhlZCcsXG5cdFx0ekluZGV4OiAxMDAwLFxuXHRcdHRvcDogMTAsXG5cdFx0cmlnaHQ6IDEwLFxuXHRcdHZlcnRpY2FsQWxpZ246ICdib3R0b20nLFxuXG5cdFx0Ly8gaW5jcmVhc2UgaGl0IGFyZWFcblx0XHRoZWlnaHQ6IDIwLFxuXHRcdHdpZHRoOiAyMCxcblx0XHRtYXJnaW5SaWdodDogMCxcblx0XHRwYWRkaW5nOiAwLFxuXHR9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7XG4iLCJpbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBpY29ucyBmcm9tICcuLi9pY29ucyc7XG5cbmNvbnN0IEljb24gPSAoeyBmaWxsLCB0eXBlLCAuLi5wcm9wcyB9KSA9PiB7XG5cdGNvbnN0IGljb24gPSBpY29uc1t0eXBlXTtcblxuXHRyZXR1cm4gKFxuXHRcdDxzcGFuXG5cdFx0XHRkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IGljb24oZmlsbCkgfX1cblx0XHRcdHsuLi5wcm9wc31cblx0XHQvPlxuXHQpO1xufTtcblxuSWNvbi5wcm9wVHlwZXMgPSB7XG5cdGZpbGw6IFByb3BUeXBlcy5zdHJpbmcsXG5cdHR5cGU6IFByb3BUeXBlcy5vbmVPZihPYmplY3Qua2V5cyhpY29ucykpLFxufTtcbkljb24uZGVmYXVsdFByb3BzID0ge1xuXHRmaWxsOiAnd2hpdGUnLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgSWNvbjtcbiIsImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQsIFByb3BUeXBlcyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBNaW51c0ljb24gZnJvbSAnLi4vaWNvbnMvbWludXMnO1xuaW1wb3J0IFBsdXNJY29uIGZyb20gJy4uL2ljb25zL3BsdXMnO1xuXG5jb25zdCBNSU5fU0NBTEUgPSAxLjA7XG5jb25zdCBNQVhfU0NBTEUgPSA0LjA7XG5jb25zdCBTQ0FMRV9NVUxURVIgPSAyLjA7XG5cbmNvbnN0IE1JTl9TV0lQRV9MRU5HVEggPSA0MC4wO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbWFnZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2NhbGU6IE1JTl9TQ0FMRSxcbiAgICAgIGltYWdlTG9hZGVkOiBmYWxzZSxcbiAgICAgIGltYWdlU3R5bGU6IHtcbiAgICAgICAgbWF4SGVpZ2h0OiBgY2FsYygxMDB2aCAtICR7dGhpcy5wcm9wcy5oZWlnaHRPZmZzZXR9cHgpYCxcbiAgICAgIH0sXG4gICAgICB3cmFwcGVyU3R5bGU6IHt9LFxuICAgICAgc2Vjb25kV3JhcHBlcjogeyBtYXhIZWlnaHQ6ICcxMDB2aCcgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGxldCBpbWFnZSA9IHRoaXMucmVmcy5saWdodGJveF9pbWFnZV9ub2RlO1xuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtpbWFnZUxvYWRlZDogdHJ1ZX0pO1xuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIGlmICh0aGlzLnpvb21lZCkge1xuICAgICAgdGhpcy56b29tZWQgPSBmYWxzZTtcblxuICAgICAgaWYgKHRoaXMuc3RhdGUuc2NhbGUgPiBNSU5fU0NBTEUpIHtcbiAgICAgICAgbGV0IGltYWdlTm9kZSA9IHRoaXMucmVmcy5saWdodGJveF9pbWFnZV9ub2RlLFxuICAgICAgICAgIHdyYXBwZXJOb2RlID0gdGhpcy5yZWZzLmltYWdlX3dyYXBwZXI7XG5cbiAgICAgICAgbGV0IGh3ID0gd3JhcHBlck5vZGUub2Zmc2V0SGVpZ2h0LFxuICAgICAgICAgIGhpID0gaW1hZ2VOb2RlLm9mZnNldEhlaWdodCxcbiAgICAgICAgICB3dyA9IHdyYXBwZXJOb2RlLm9mZnNldFdpZHRoLFxuICAgICAgICAgIHdpID0gaW1hZ2VOb2RlLm9mZnNldFdpZHRoLFxuICAgICAgICAgIGNlbnRlclggPSAwLjUsIGNlbnRlclkgPSAwLjU7XG5cbiAgICAgICAgaWYgKHRoaXMudG91Y2hSZWxhdGl2ZVBvcykge1xuICAgICAgICAgIGNlbnRlclggPSB0aGlzLnRvdWNoUmVsYXRpdmVQb3MueDtcbiAgICAgICAgICBjZW50ZXJZID0gdGhpcy50b3VjaFJlbGF0aXZlUG9zLnk7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMudG91Y2hQb3MnLCB7IGNlbnRlclgsIGNlbnRlclkgfSk7XG4gICAgICAgICAgdGhpcy50b3VjaFJlbGF0aXZlUG9zID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHdyYXBwZXJOb2RlLnNjcm9sbFRvcCA9IChoaSAqIGNlbnRlclkpIC0gaHcgLyAyO1xuICAgICAgICB3cmFwcGVyTm9kZS5zY3JvbGxMZWZ0ID0gKHdpICogY2VudGVyWCkgLSB3dyAvIDI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5zcmMgIT09IG5leHRQcm9wcy5zcmMpIHtcbiAgICAgIHRoaXMudGFiUG9zID0gbnVsbDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2FsZTogTUlOX1NDQUxFLFxuICAgICAgICBpbWFnZUxvYWRlZDogZmFsc2UsXG4gICAgICAgIGltYWdlU3R5bGU6IHtcbiAgICAgICAgICBtYXhIZWlnaHQ6IGBjYWxjKDEwMHZoIC0gJHtuZXh0UHJvcHMuaGVpZ2h0T2Zmc2V0fXB4KWAsXG4gICAgICAgIH0sXG4gICAgICAgIHdyYXBwZXJTdHlsZToge30sXG4gICAgICAgIHNlY29uZFdyYXBwZXI6IHsgbWF4SGVpZ2h0OiAnMTAwdmgnIH0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBvblpvb21JbihlLCBtdWx0ZXIgPSBTQ0FMRV9NVUxURVIpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5zY2FsZSA+PSBNQVhfU0NBTEUpIHJldHVybjtcblxuICAgIGlmIChlICE9PSBudWxsKSB7XG4gICAgICBjb25zb2xlLmxvZygnY2xlYXIgdG91Y2hQb3MnKTtcbiAgICAgIHRoaXMudG91Y2hSZWxhdGl2ZVBvcyA9IG51bGw7XG4gICAgfSAvLyBpZiBjbGljayBvbiArIGNsZWFyIHRhYlBvcyBpbmZvXG5cbiAgICBsZXQgd3JhcEhlaWdodCA9IHRoaXMucmVmcy5pbWFnZV93cmFwcGVyLm9mZnNldEhlaWdodDtcbiAgICBsZXQgd3JhcFdpZHRoID0gdGhpcy5yZWZzLmltYWdlX3dyYXBwZXIub2Zmc2V0V2lkdGg7XG4gICAgbGV0IG5ld1NjYWxlICA9IHRoaXMuc3RhdGUuc2NhbGUgKiBtdWx0ZXI7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzY2FsZTogbmV3U2NhbGUsXG4gICAgICB3cmFwcGVyU3R5bGU6IHtcbiAgICAgICAgb3ZlcmZsb3c6ICdzY3JvbGwnLFxuICAgICAgICB3aWR0aDogd3JhcFdpZHRoLFxuICAgICAgICBoZWlnaHQ6IHdyYXBIZWlnaHQsXG4gICAgICB9LFxuICAgICAgc2Vjb25kV3JhcHBlcjogeyB3aWR0aDogd3JhcFdpZHRoICogbmV3U2NhbGUsIGhlaWdodDogd3JhcEhlaWdodCAqIG5ld1NjYWxlLCBwb3NpdGlvbjogJ3N0YXRpYycgfSxcbiAgICAgIGltYWdlU3R5bGU6IHsgd2lkdGg6JzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy56b29tZWQgPSB0cnVlO1xuICB9XG5cbiAgb25ab29tT3V0KGUsIG11bHRlciA9IFNDQUxFX01VTFRFUikge1xuICAgIGlmICh0aGlzLnN0YXRlLnNjYWxlIDw9IE1JTl9TQ0FMRSkgcmV0dXJuO1xuXG4gICAgaWYgKGUgIT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdjbGVhciB0b3VjaFBvcycpO1xuICAgICAgdGhpcy50b3VjaFJlbGF0aXZlUG9zID0gbnVsbDtcbiAgICB9IC8vIGlmIGNsaWNrIG9uIC0gY2xlYXIgdGFiUG9zIGluZm9cblxuICAgIGxldCBuZXdTY2FsZSA9IHRoaXMuc3RhdGUuc2NhbGUgLyBtdWx0ZXI7XG4gICAgaWYgKG5ld1NjYWxlID09PSBNSU5fU0NBTEUpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2FsZTogTUlOX1NDQUxFLFxuICAgICAgICBpbWFnZVN0eWxlOiB7XG4gICAgICAgICAgbWF4SGVpZ2h0OiBgY2FsYygxMDB2aCAtICR7dGhpcy5wcm9wcy5oZWlnaHRPZmZzZXR9cHgpYCxcbiAgICAgICAgfSxcbiAgICAgICAgd3JhcHBlclN0eWxlOiB7fSxcbiAgICAgICAgc2Vjb25kV3JhcHBlcjogeyBtYXhIZWlnaHQ6ICcxMDB2aCcgfSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgd3JhcEhlaWdodCA9IHRoaXMucmVmcy5pbWFnZV93cmFwcGVyLm9mZnNldEhlaWdodDtcbiAgICAgIGxldCB3cmFwV2lkdGggPSB0aGlzLnJlZnMuaW1hZ2Vfd3JhcHBlci5vZmZzZXRXaWR0aDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBzY2FsZTogbmV3U2NhbGUsXG4gICAgICAgIHdyYXBwZXJTdHlsZToge1xuICAgICAgICAgIG92ZXJmbG93OiAnc2Nyb2xsJyxcbiAgICAgICAgICB3aWR0aDogd3JhcFdpZHRoLFxuICAgICAgICAgIGhlaWdodDogd3JhcEhlaWdodCxcbiAgICAgICAgfSxcbiAgICAgICAgc2Vjb25kV3JhcHBlcjogeyB3aWR0aDogd3JhcFdpZHRoICogbmV3U2NhbGUsIGhlaWdodDogd3JhcEhlaWdodCAqIG5ld1NjYWxlLCBwb3NpdGlvbjogJ3N0YXRpYycgfSxcbiAgICAgICAgaW1hZ2VTdHlsZTogeyB3aWR0aDonMTAwJScsIGhlaWdodDogJzEwMCUnIH0sXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLnpvb21lZCA9IHRydWU7XG4gIH1cblxuICBvbkltYWdlTW91c2VEb3duKGUpIHtcbiAgICBpZiAoIXRoaXMucGFuU3RhcnRlZCkge1xuICAgICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgICAgdGhpcy5wYW5TdGFydGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuc2Nyb2xsUG9zID0geyB4OiBlLmNsaWVudFgsIHk6IGUuY2xpZW50WSB9O1xuXG4gICAgICBsZXQgb25Nb3VzZU1vdmUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGxldCBvZmZzZXRYID0gc2VsZi5zY3JvbGxQb3MueCAtIGUuY2xpZW50WDtcbiAgICAgICAgbGV0IG9mZnNldFkgPSBzZWxmLnNjcm9sbFBvcy55IC0gZS5jbGllbnRZO1xuXG4gICAgICAgIHNlbGYucmVmcy5pbWFnZV93cmFwcGVyLnNjcm9sbExlZnQgKz0gb2Zmc2V0WDtcbiAgICAgICAgc2VsZi5yZWZzLmltYWdlX3dyYXBwZXIuc2Nyb2xsVG9wICs9IG9mZnNldFk7XG5cbiAgICAgICAgc2VsZi5zY3JvbGxQb3MgPSB7IHg6IGUuY2xpZW50WCwgeTogZS5jbGllbnRZIH07XG4gICAgICB9O1xuXG4gICAgICBsZXQgb25Nb3VzZVVwID0gZnVuY3Rpb24oZSkge1xuICAgICAgICBzZWxmLnBhblN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgb25Nb3VzZU1vdmUpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgb25Nb3VzZVVwKTtcbiAgICAgIH07XG5cbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG9uTW91c2VNb3ZlKTtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCBvbk1vdXNlVXApO1xuICAgIH1cbiAgfVxuXG4gIG9uSW1hZ2VUb3VjaChlKSB7XG4gICAgaWYgKCF0aGlzLnBhblN0YXJ0ZWQpIHtcbiAgICAgIGxldCBzZWxmID0gdGhpcztcbiAgICAgIHRoaXMudG91Y2hQb3MgPSB7IHg6IGUudG91Y2hlc1swXS5jbGllbnRYLCB5OiBlLnRvdWNoZXNbMF0uY2xpZW50WSB9O1xuICAgICAgLy8gY29uc29sZS5sb2coJ2UudG91Y2hlc1swXScsIGUudG91Y2hlc1swXSk7XG4gICAgICAvLyBjb25zb2xlLmxvZygnQ2xpZW50U2l6ZScsIHt3OiB0aGlzLnJlZnMubGlnaHRib3hfaW1hZ2Vfbm9kZS5jbGllbnRXaWR0aCwgaDogdGhpcy5yZWZzLmxpZ2h0Ym94X2ltYWdlX25vZGUuY2xpZW50SGVpZ2h0fSk7XG4gICAgICBsZXQgaW1hZ2VSZWN0ID0gdGhpcy5yZWZzLmxpZ2h0Ym94X2ltYWdlX25vZGUuZ2V0Q2xpZW50UmVjdHMoKVswXTtcbiAgICAgIHRoaXMudG91Y2hSZWxhdGl2ZVBvcyA9IHtcbiAgICAgICAgeDogKGUudG91Y2hlc1swXS5jbGllbnRYIC0gaW1hZ2VSZWN0LngpIC8gdGhpcy5yZWZzLmxpZ2h0Ym94X2ltYWdlX25vZGUuY2xpZW50V2lkdGgsXG4gICAgICAgIHk6IChlLnRvdWNoZXNbMF0uY2xpZW50WSAtIGltYWdlUmVjdC55KSAvIHRoaXMucmVmcy5saWdodGJveF9pbWFnZV9ub2RlLmNsaWVudEhlaWdodCxcbiAgICAgIH07XG4gICAgICAvLyBjb25zb2xlLmxvZygndG91Y2hSZWxhdGl2ZVBvcycsIHRoaXMudG91Y2hSZWxhdGl2ZVBvcyk7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5zY2FsZSA+IE1JTl9TQ0FMRSkge1xuXG4gICAgICAgIGlmICh0aGlzLmxhc3RUb3VjaFRpbWUgJiYgKERhdGUubm93KCkgLSB0aGlzLmxhc3RUb3VjaFRpbWUpIDwgMzAwKSB7XG4gICAgICAgICAgLy8gdGltZSBiZWV0d2VlbiB0b3VjaGVzIGlzIGxlc3MgdGhhbiAzMDBtcyAtIGRvdWJsZSB0YXBcbiAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5zY2FsZSA8IE1BWF9TQ0FMRSkge1xuICAgICAgICAgICAgc2VsZi5vblpvb21JbihudWxsLCBTQ0FMRV9NVUxURVIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYub25ab29tT3V0KG51bGwsIE1BWF9TQ0FMRSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIHRoaXMucGFuU3RhcnRlZCA9IHRydWU7XG5cbiAgICAgICAgbGV0IG9uVG91Y2hNb3ZlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGxldCBvZmZzZXRYID0gc2VsZi50b3VjaFBvcy54IC0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgIGxldCBvZmZzZXRZID0gc2VsZi50b3VjaFBvcy55IC0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICAgICAgc2VsZi5yZWZzLmltYWdlX3dyYXBwZXIuc2Nyb2xsTGVmdCArPSBvZmZzZXRYO1xuICAgICAgICAgIHNlbGYucmVmcy5pbWFnZV93cmFwcGVyLnNjcm9sbFRvcCArPSBvZmZzZXRZO1xuXG4gICAgICAgICAgc2VsZi50b3VjaFBvcyA9IHsgeDogZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYLCB5OiBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgfTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgb25Ub3VjaEVuZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBzZWxmLnBhblN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBvblRvdWNoTW92ZSk7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBvblRvdWNoRW5kKTtcbiAgICAgICAgfTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLCBvblRvdWNoTW92ZSk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgb25Ub3VjaEVuZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKipcbiAgICAgICAgICogdHJhY2sgdG91Y2ggc3dpcGVzXG4gICAgICAgICAqL1xuICAgICAgICAgIGlmICh0aGlzLmxhc3RUb3VjaFRpbWUgJiYgKERhdGUubm93KCkgLSB0aGlzLmxhc3RUb3VjaFRpbWUpIDwgMzAwKSB7XG4gICAgICAgICAgICAvLyB0aW1lIGJlZXR3ZWVuIHRvdWNoZXMgaXMgbGVzcyB0aGFuIDMwMG1zIC0gZG91YmxlIHRhcFxuICAgICAgICAgICAgc2VsZi5vblpvb21JbihudWxsLCBTQ0FMRV9NVUxURVIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMubGFzdFRvdWNoVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgICAgdGhpcy50b3VjaFBvcyA9IHsgeDogZS50b3VjaGVzWzBdLmNsaWVudFgsIHk6IGUudG91Y2hlc1swXS5jbGllbnRZIH07XG5cbiAgICAgICAgICBsZXQgb25Ub3VjaEVuZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHNlbGYuc3dpcGVTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGxldCBvZmZzZXRYID0gc2VsZi50b3VjaFBvcy54IC0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgbGV0IG9mZnNldFkgPSBzZWxmLnRvdWNoUG9zLnkgLSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFk7XG5cbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhvZmZzZXRYKSA+ICgzLjAgKiBNYXRoLmFicyhvZmZzZXRZKSkgJiYgTWF0aC5hYnMob2Zmc2V0WCkgPiBNSU5fU1dJUEVfTEVOR1RIKSB7XG4gICAgICAgICAgICAgIGlmIChvZmZzZXRYIDwgMCkge1xuICAgICAgICAgICAgICAgIC8vIHN3aXBlIGxlZnRcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5wcm9wcy5vblN3aXBlTGVmdCkgc2VsZi5wcm9wcy5vblN3aXBlTGVmdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHN3aXBlIHJpZ2h0XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYucHJvcHMub25Td2lwZVJpZ2h0KSBzZWxmLnByb3BzLm9uU3dpcGVSaWdodCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgb25Ub3VjaEVuZCk7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hlbmRcIiwgb25Ub3VjaEVuZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25JbWFnZURvdWJsZUNsaWNrKGUpIHtcblxuICAgIGxldCBpbWFnZVJlY3QgPSB0aGlzLnJlZnMubGlnaHRib3hfaW1hZ2Vfbm9kZS5nZXRDbGllbnRSZWN0cygpWzBdO1xuXG4gICAgdGhpcy50b3VjaFJlbGF0aXZlUG9zID0ge1xuICAgICAgeDogKGUuY2xpZW50WCAtIGltYWdlUmVjdC54KSAvIHRoaXMucmVmcy5saWdodGJveF9pbWFnZV9ub2RlLmNsaWVudFdpZHRoLFxuICAgICAgeTogKGUuY2xpZW50WSAtIGltYWdlUmVjdC55KSAvIHRoaXMucmVmcy5saWdodGJveF9pbWFnZV9ub2RlLmNsaWVudEhlaWdodCxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2NhbGUgPCBNQVhfU0NBTEUpIHtcbiAgICAgIHRoaXMub25ab29tSW4obnVsbCwgU0NBTEVfTVVMVEVSKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLm9uWm9vbU91dChudWxsLCBNQVhfU0NBTEUpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpXG4gIHtcblxuICAgIGxldCBpbWdTaXplID0ge307XG4gICAgaWYgKHRoaXMuc3RhdGUuc2NhbGUgPiBNSU5fU0NBTEUpIHtcbiAgICAgIGltZ1NpemUud2lkdGggPSB0aGlzLnN0YXRlLmltYWdlU3R5bGUud2lkdGg7XG4gICAgICBpbWdTaXplLmhlaWdodCA9ICB0aGlzLnN0YXRlLmltYWdlU3R5bGUuaGVpZ2h0O1xuICAgIH1cblxuICAgIGxldCBpbWFnZVN0eWxlID0gey4uLnRoaXMuc3RhdGUuaW1hZ2VTdHlsZX07XG4gICAgaW1hZ2VTdHlsZS52aXNpYmlsaXR5ID0gdGhpcy5zdGF0ZS5pbWFnZUxvYWRlZCA/ICd2aXNpYmxlJyA6ICdoaWRkZW4nO1xuXG4gICAgaWYgKHRoaXMuc3RhdGUuc2NhbGUgPiBNSU5fU0NBTEUpIHtcbiAgICAgIGltYWdlU3R5bGUuY3Vyc29yID0gJ2FsbC1zY3JvbGwnO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IHN0eWxlPXt7dGV4dEFsaWduOiAnY2VudGVyJ319PlxuICAgICAgICA8ZGl2IHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXhXaWR0aDogJzEwMHZ3JywgbWFyZ2luOiAnYXV0bycsIGJhY2tncm91bmRDb2xvcjogJ2JsYWNrJ319PlxuICAgICAgICAgIHshdGhpcy5zdGF0ZS5pbWFnZUxvYWRlZCAmJiA8aSBjbGFzc05hbWU9XCJmYSBmYS1jaXJjbGUtby1ub3RjaCBmYS1zcGluIGZhLWZ3XCIgc3R5bGU9e3tcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgYm90dG9tOiAwLFxuICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHJpZ2h0OiAwLFxuICAgICAgICAgICAgbWFyZ2luOiAnYXV0bycsXG4gICAgICAgICAgICB6SW5kZXg6IDEwMCxcbiAgICAgICAgICAgIHdpZHRoOiAzMCxcbiAgICAgICAgICAgIGhlaWdodDogMzAsXG4gICAgICAgICAgICBvcGFjaXR5OiAgMSxcbiAgICAgICAgICAgIGNvbG9yOiAnI0FBQScsXG4gICAgICAgICAgICBmb250U2l6ZTogJzJlbScsXG4gICAgICAgICAgfX0gLz59XG4gICAgICAgICAgPE1pbnVzSWNvblxuICAgICAgICAgICAgY29sb3I9XCIjRkZGXCJcbiAgICAgICAgICAgIHRpdGxlPVwiWm9vbSBvdXRcIlxuICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblpvb21PdXQuYmluZCh0aGlzKX1cbiAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgICAgICAgICBib3R0b206IDEwLFxuICAgICAgICAgICAgICByaWdodDogNDAsXG4gICAgICAgICAgICAgIGN1cnNvcjogKCB0aGlzLnN0YXRlLnNjYWxlID4gTUlOX1NDQUxFID8gJ3BvaW50ZXInIDogJ2F1dG8nICksXG4gICAgICAgICAgICAgIHpJbmRleDogMTAwLFxuICAgICAgICAgICAgICB3aWR0aDogMjAsXG4gICAgICAgICAgICAgIGhlaWdodDogMjAsXG4gICAgICAgICAgICAgIG9wYWNpdHk6IHRoaXMuc3RhdGUuaW1hZ2VMb2FkZWQgPyAoIHRoaXMuc3RhdGUuc2NhbGUgPiBNSU5fU0NBTEUgPyAwLjggOiAwLjQgKSA6IDAsXG4gICAgICAgICAgICAgIGZpbHRlcjogJ2Ryb3Atc2hhZG93KDJweCAycHggMXB4IHJnYmEoMCwwLDAsMC44KSknLFxuICAgICAgICAgICAgfX0vPlxuICAgICAgICAgIDxQbHVzSWNvblxuICAgICAgICAgICAgY29sb3I9XCIjRkZGXCJcbiAgICAgICAgICAgIHRpdGxlPVwiWm9vbSBpblwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uWm9vbUluLmJpbmQodGhpcyl9XG4gICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgICAgYm90dG9tOiAxMCxcbiAgICAgICAgICAgICAgcmlnaHQ6IDEwLFxuICAgICAgICAgICAgICBjdXJzb3I6ICggdGhpcy5zdGF0ZS5zY2FsZSA8IE1BWF9TQ0FMRSA/ICdwb2ludGVyJyA6ICdhdXRvJyApLFxuICAgICAgICAgICAgICB6SW5kZXg6IDEwMCxcbiAgICAgICAgICAgICAgd2lkdGg6IDIwLFxuICAgICAgICAgICAgICBoZWlnaHQ6IDIwLFxuICAgICAgICAgICAgICBvcGFjaXR5OiB0aGlzLnN0YXRlLmltYWdlTG9hZGVkID8gKCB0aGlzLnN0YXRlLnNjYWxlIDwgTUFYX1NDQUxFID8gMC44IDogMC40ICkgOiAwLFxuICAgICAgICAgICAgICBmaWx0ZXI6ICdkcm9wLXNoYWRvdygycHggMnB4IDFweCByZ2JhKDAsMCwwLDAuOCkpJyxcbiAgICAgICAgICAgIH19IC8+XG4gICAgICAgICAgPGRpdiBzdHlsZT17dGhpcy5zdGF0ZS53cmFwcGVyU3R5bGV9IHJlZj1cImltYWdlX3dyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3RoaXMuc3RhdGUuc2Vjb25kV3JhcHBlcn0+XG4gICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICByZWY9XCJsaWdodGJveF9pbWFnZV9ub2RlXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3RoaXMuc3RhdGUuc2NhbGUgPT09IE1JTl9TQ0FMRSA/IGAke3RoaXMucHJvcHMuY2xhc3NOYW1lfSBub3Rfc2NhbGVkX2ltYWdlYCA6IHRoaXMucHJvcHMuY2xhc3NOYW1lfVxuICAgICAgICAgICAgICAgIHNpemVzPXt0aGlzLnN0YXRlLnNjYWxlID09PSBNSU5fU0NBTEUgPyB0aGlzLnByb3BzLnNpemVzIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIGFsdD17dGhpcy5wcm9wcy5hbHR9XG4gICAgICAgICAgICAgICAgc3JjPXt0aGlzLnByb3BzLnNyY31cbiAgICAgICAgICAgICAgICB7Li4uaW1nU2l6ZX1cbiAgICAgICAgICAgICAgICBzcmNTZXQ9e3RoaXMucHJvcHMuc3Jjc2V0fVxuICAgICAgICAgICAgICAgIHN0eWxlPXtpbWFnZVN0eWxlfVxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZT1cImZhbHNlXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2tJbWFnZX1cbiAgICAgICAgICAgICAgICBvbkRvdWJsZUNsaWNrPXt0aGlzLm9uSW1hZ2VEb3VibGVDbGljay5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgIG9uTW91c2VEb3duPXt0aGlzLm9uSW1hZ2VNb3VzZURvd24uYmluZCh0aGlzKX1cbiAgICAgICAgICAgICAgICBvblRvdWNoU3RhcnQ9e3RoaXMub25JbWFnZVRvdWNoLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj4pO1xuICB9XG5cbn1cblxuSW1hZ2UucHJvcFR5cGVzID0ge1xuICBhbHQ6IFByb3BUeXBlcy5mdW5jLFxuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0T2Zmc2V0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICBvblN3aXBlTGVmdDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uU3dpcGVSaWdodDogUHJvcFR5cGVzLmZ1bmMsXG4gIHNpemVzOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIHNyYzogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBzcmNzZXQ6IFByb3BUeXBlcy5hcnJheSxcbiAgc3R5bGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbn07IiwiaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjc3MsIFN0eWxlU2hlZXQgfSBmcm9tICdhcGhyb2RpdGUvbm8taW1wb3J0YW50JztcblxuaW1wb3J0IFRodW1ibmFpbCBmcm9tICcuL1RodW1ibmFpbCc7XG5pbXBvcnQgQXJyb3cgZnJvbSAnLi9BcnJvdyc7XG5pbXBvcnQgdGhlbWUgZnJvbSAnLi4vdGhlbWUnO1xuXG5jb25zdCBjbGFzc2VzID0gU3R5bGVTaGVldC5jcmVhdGUoe1xuXHRwYWdpbmF0ZWRUaHVtYm5haWxzOiB7XG5cdFx0Ym90dG9tOiB0aGVtZS5jb250YWluZXIuZ3V0dGVyLnZlcnRpY2FsLFxuXHRcdGhlaWdodDogdGhlbWUudGh1bWJuYWlsLnNpemUsXG5cdFx0cGFkZGluZzogJzAgNTBweCcsXG5cdFx0cG9zaXRpb246ICdhYnNvbHV0ZScsXG5cdFx0dGV4dEFsaWduOiAnY2VudGVyJyxcblx0XHR3aGl0ZVNwYWNlOiAnbm93cmFwJyxcblx0fSxcbn0pO1xuXG5jb25zdCBhcnJvd1N0eWxlcyA9IHtcblx0aGVpZ2h0OiB0aGVtZS50aHVtYm5haWwuc2l6ZSArICh0aGVtZS50aHVtYm5haWwuZ3V0dGVyICogMiksXG5cdHdpZHRoOiA0MCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhZ2luYXRlZFRodW1ibmFpbHMgZXh0ZW5kcyBDb21wb25lbnQge1xuXHRjb25zdHJ1Y3RvciAocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0aGFzQ3VzdG9tUGFnZTogZmFsc2UsXG5cdFx0fTtcblxuXHRcdHRoaXMuZ290b1ByZXYgPSB0aGlzLmdvdG9QcmV2LmJpbmQodGhpcyk7XG5cdFx0dGhpcy5nb3RvTmV4dCA9IHRoaXMuZ290b05leHQuYmluZCh0aGlzKTtcblx0fVxuXHRjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIChuZXh0UHJvcHMpIHtcblx0XHQvLyBDb21wb25lbnQgc2hvdWxkIGJlIGNvbnRyb2xsZWQsIGZsdXNoIHN0YXRlIHdoZW4gY3VycmVudEltYWdlIGNoYW5nZXNcblx0XHRpZiAobmV4dFByb3BzLmN1cnJlbnRJbWFnZSAhPT0gdGhpcy5wcm9wcy5jdXJyZW50SW1hZ2UpIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRoYXNDdXN0b21QYWdlOiBmYWxzZSxcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXHQvLyBNRVRIT0RTXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdGdldEZpcnN0ICgpIHtcblx0XHRjb25zdCB7IGN1cnJlbnRJbWFnZSwgb2Zmc2V0IH0gPSB0aGlzLnByb3BzO1xuXHRcdGlmICh0aGlzLnN0YXRlLmhhc0N1c3RvbVBhZ2UpIHtcblx0XHRcdHJldHVybiB0aGlzLmNsYW1wRmlyc3QodGhpcy5zdGF0ZS5maXJzdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmNsYW1wRmlyc3QoY3VycmVudEltYWdlIC0gb2Zmc2V0KTtcblx0fVxuXHRzZXRGaXJzdCAoZXZlbnQsIG5ld0ZpcnN0KSB7XG5cdFx0Y29uc3QgeyBmaXJzdCB9ID0gdGhpcy5zdGF0ZTtcblxuXHRcdGlmIChldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdH1cblxuXHRcdGlmIChmaXJzdCA9PT0gbmV3Rmlyc3QpIHJldHVybjtcblxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0aGFzQ3VzdG9tUGFnZTogdHJ1ZSxcblx0XHRcdGZpcnN0OiBuZXdGaXJzdCxcblx0XHR9KTtcblx0fVxuXHRnb3RvUHJldiAoZXZlbnQpIHtcblx0XHR0aGlzLnNldEZpcnN0KGV2ZW50LCB0aGlzLmdldEZpcnN0KCkgLSB0aGlzLnByb3BzLm9mZnNldCk7XG5cdH1cblx0Z290b05leHQgKGV2ZW50KSB7XG5cdFx0dGhpcy5zZXRGaXJzdChldmVudCwgdGhpcy5nZXRGaXJzdCgpICsgdGhpcy5wcm9wcy5vZmZzZXQpO1xuXHR9XG5cdGNsYW1wRmlyc3QgKHZhbHVlKSB7XG5cdFx0Y29uc3QgeyBpbWFnZXMsIG9mZnNldCB9ID0gdGhpcy5wcm9wcztcblxuXHRcdGNvbnN0IHRvdGFsQ291bnQgPSAyICogb2Zmc2V0ICsgMTsgLy8gc2hvdyAkb2Zmc2V0IGV4dHJhIHRodW1ibmFpbHMgb24gZWFjaCBzaWRlXG5cblx0XHRpZiAodmFsdWUgPCAwKSB7XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9IGVsc2UgaWYgKHZhbHVlICsgdG90YWxDb3VudCA+IGltYWdlcy5sZW5ndGgpIHsgLy8gVG9vIGZhclxuXHRcdFx0cmV0dXJuIGltYWdlcy5sZW5ndGggLSB0b3RhbENvdW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9XG5cblx0Ly8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdC8vIFJFTkRFUkVSU1xuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuXHRyZW5kZXJBcnJvd1ByZXYgKCkge1xuXHRcdGlmICh0aGlzLmdldEZpcnN0KCkgPD0gMCkgcmV0dXJuIG51bGw7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PEFycm93XG5cdFx0XHRcdGRpcmVjdGlvbj1cImxlZnRcIlxuXHRcdFx0XHRzaXplPVwic21hbGxcIlxuXHRcdFx0XHRpY29uPVwiYXJyb3dMZWZ0XCJcblx0XHRcdFx0b25DbGljaz17dGhpcy5nb3RvUHJldn1cblx0XHRcdFx0c3R5bGU9e2Fycm93U3R5bGVzfVxuXHRcdFx0XHR0aXRsZT1cIlByZXZpb3VzIChMZWZ0IGFycm93IGtleSlcIlxuXHRcdFx0XHR0eXBlPVwiYnV0dG9uXCJcblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXHRyZW5kZXJBcnJvd05leHQgKCkge1xuXHRcdGNvbnN0IHsgb2Zmc2V0LCBpbWFnZXMgfSA9IHRoaXMucHJvcHM7XG5cdFx0Y29uc3QgdG90YWxDb3VudCA9IDIgKiBvZmZzZXQgKyAxO1xuXHRcdGlmICh0aGlzLmdldEZpcnN0KCkgKyB0b3RhbENvdW50ID49IGltYWdlcy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxBcnJvd1xuXHRcdFx0XHRkaXJlY3Rpb249XCJyaWdodFwiXG5cdFx0XHRcdHNpemU9XCJzbWFsbFwiXG5cdFx0XHRcdGljb249XCJhcnJvd1JpZ2h0XCJcblx0XHRcdFx0b25DbGljaz17dGhpcy5nb3RvTmV4dH1cblx0XHRcdFx0c3R5bGU9e2Fycm93U3R5bGVzfVxuXHRcdFx0XHR0aXRsZT1cIk5leHQgKFJpZ2h0IGFycm93IGtleSlcIlxuXHRcdFx0XHR0eXBlPVwiYnV0dG9uXCJcblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXHRyZW5kZXIgKCkge1xuXHRcdGNvbnN0IHsgaW1hZ2VzLCBjdXJyZW50SW1hZ2UsIG9uQ2xpY2tUaHVtYm5haWwsIG9mZnNldCB9ID0gdGhpcy5wcm9wcztcblxuXHRcdGNvbnN0IHRvdGFsQ291bnQgPSAyICogb2Zmc2V0ICsgMTsgLy8gc2hvdyAkb2Zmc2V0IGV4dHJhIHRodW1ibmFpbHMgb24gZWFjaCBzaWRlXG5cdFx0bGV0IHRodW1ibmFpbHMgPSBbXTtcblx0XHRsZXQgYmFzZU9mZnNldCA9IDA7XG5cdFx0aWYgKGltYWdlcy5sZW5ndGggPD0gdG90YWxDb3VudCkge1xuXHRcdFx0dGh1bWJuYWlscyA9IGltYWdlcztcblx0XHR9IGVsc2UgeyAvLyBUcnkgdG8gY2VudGVyIGN1cnJlbnQgaW1hZ2UgaW4gbGlzdFxuXHRcdFx0YmFzZU9mZnNldCA9IHRoaXMuZ2V0Rmlyc3QoKTtcblx0XHRcdHRodW1ibmFpbHMgPSBpbWFnZXMuc2xpY2UoYmFzZU9mZnNldCwgYmFzZU9mZnNldCArIHRvdGFsQ291bnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZGl2IGNsYXNzTmFtZT17Y3NzKGNsYXNzZXMucGFnaW5hdGVkVGh1bWJuYWlscyl9PlxuXHRcdFx0XHR7dGhpcy5yZW5kZXJBcnJvd1ByZXYoKX1cblx0XHRcdFx0e3RodW1ibmFpbHMubWFwKChpbWcsIGlkeCkgPT4gKFxuXHRcdFx0XHRcdDxUaHVtYm5haWwga2V5PXtiYXNlT2Zmc2V0ICsgaWR4fVxuXHRcdFx0XHRcdFx0ey4uLmltZ31cblx0XHRcdFx0XHRcdGluZGV4PXtiYXNlT2Zmc2V0ICsgaWR4fVxuXHRcdFx0XHRcdFx0b25DbGljaz17b25DbGlja1RodW1ibmFpbH1cblx0XHRcdFx0XHRcdGFjdGl2ZT17YmFzZU9mZnNldCArIGlkeCA9PT0gY3VycmVudEltYWdlfSAvPlxuXHRcdFx0XHQpKX1cblx0XHRcdFx0e3RoaXMucmVuZGVyQXJyb3dOZXh0KCl9XG5cdFx0XHQ8L2Rpdj5cblx0XHQpO1xuXHR9XG59XG5cblBhZ2luYXRlZFRodW1ibmFpbHMucHJvcFR5cGVzID0ge1xuXHRjdXJyZW50SW1hZ2U6IFByb3BUeXBlcy5udW1iZXIsXG5cdGltYWdlczogUHJvcFR5cGVzLmFycmF5LFxuXHRvZmZzZXQ6IFByb3BUeXBlcy5udW1iZXIsXG5cdG9uQ2xpY2tUaHVtYm5haWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG59O1xuIiwiaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IENoaWxkcmVuLCBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7XG5cbi8vIFBhc3MgdGhlIExpZ2h0Ym94IGNvbnRleHQgdGhyb3VnaCB0byB0aGUgUG9ydGFsJ3MgZGVzY2VuZGVudHNcbi8vIFN0YWNrT3ZlcmZsb3cgZGlzY3Vzc2lvbiBodHRwOi8vZ29vLmdsL29jbHJKOVxuXG5jbGFzcyBQYXNzQ29udGV4dCBleHRlbmRzIENvbXBvbmVudCB7XG5cdGdldENoaWxkQ29udGV4dCAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucHJvcHMuY29udGV4dDtcblx0fVxuXHRyZW5kZXIgKCkge1xuXHRcdHJldHVybiBDaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pO1xuXHR9XG59XG5cblBhc3NDb250ZXh0LnByb3BUeXBlcyA9IHtcblx0Y29udGV4dDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcblBhc3NDb250ZXh0LmNoaWxkQ29udGV4dFR5cGVzID0ge1xuXHR0aGVtZTogUHJvcFR5cGVzLm9iamVjdCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhc3NDb250ZXh0O1xuIiwiaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQ1NTVHJhbnNpdGlvbkdyb3VwIGZyb20gJ3JlYWN0LXRyYW5zaXRpb24tZ3JvdXAvQ1NTVHJhbnNpdGlvbkdyb3VwJztcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgUGFzc0NvbnRleHQgZnJvbSAnLi9QYXNzQ29udGV4dCc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9ydGFsIGV4dGVuZHMgQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IgKCkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5wb3J0YWxFbGVtZW50ID0gbnVsbDtcblx0fVxuXHRjb21wb25lbnREaWRNb3VudCAoKSB7XG5cdFx0Y29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocCk7XG5cdFx0dGhpcy5wb3J0YWxFbGVtZW50ID0gcDtcblx0XHR0aGlzLmNvbXBvbmVudERpZFVwZGF0ZSgpO1xuXHR9XG5cdGNvbXBvbmVudERpZFVwZGF0ZSAoKSB7XG5cdFx0Ly8gQW5pbWF0ZSBmYWRlIG9uIG1vdW50L3VubW91bnRcblx0XHRjb25zdCBkdXJhdGlvbiA9IDIwMDtcblx0XHRjb25zdCBzdHlsZXMgPSBgXG5cdFx0XHRcdC5mYWRlLWVudGVyIHsgb3BhY2l0eTogMC4wMTsgfVxuXHRcdFx0XHQuZmFkZS1lbnRlci5mYWRlLWVudGVyLWFjdGl2ZSB7IG9wYWNpdHk6IDE7IHRyYW5zaXRpb246IG9wYWNpdHkgJHtkdXJhdGlvbn1tczsgfVxuXHRcdFx0XHQuZmFkZS1sZWF2ZSB7IG9wYWNpdHk6IDE7IH1cblx0XHRcdFx0LmZhZGUtbGVhdmUuZmFkZS1sZWF2ZS1hY3RpdmUgeyBvcGFjaXR5OiAwLjAxOyB0cmFuc2l0aW9uOiBvcGFjaXR5ICR7ZHVyYXRpb259bXM7IH1cblx0XHRgO1xuXG5cdFx0cmVuZGVyKFxuXHRcdFx0PFBhc3NDb250ZXh0IGNvbnRleHQ9e3RoaXMuY29udGV4dH0+XG5cdFx0XHRcdDxkaXY+XG5cdFx0XHRcdFx0PHN0eWxlPntzdHlsZXN9PC9zdHlsZT5cblx0XHRcdFx0XHQ8Q1NTVHJhbnNpdGlvbkdyb3VwXG5cdFx0XHRcdFx0XHRjb21wb25lbnQ9XCJkaXZcIlxuXHRcdFx0XHRcdFx0dHJhbnNpdGlvbk5hbWU9XCJmYWRlXCJcblx0XHRcdFx0XHRcdHRyYW5zaXRpb25FbnRlclRpbWVvdXQ9e2R1cmF0aW9ufVxuXHRcdFx0XHRcdFx0dHJhbnNpdGlvbkxlYXZlVGltZW91dD17ZHVyYXRpb259XG5cdFx0XHRcdFx0XHR7Li4udGhpcy5wcm9wc31cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdDwvUGFzc0NvbnRleHQ+LFxuXHRcdFx0dGhpcy5wb3J0YWxFbGVtZW50XG5cdFx0KTtcblx0fVxuXHRjb21wb25lbnRXaWxsVW5tb3VudCAoKSB7XG5cdFx0ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLnBvcnRhbEVsZW1lbnQpO1xuXHR9XG5cdHJlbmRlciAoKSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cbn1cblxuUG9ydGFsLmNvbnRleHRUeXBlcyA9IHtcblx0dGhlbWU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbn07XG4iLCJpbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGNzcywgU3R5bGVTaGVldCB9IGZyb20gJ2FwaHJvZGl0ZS9uby1pbXBvcnRhbnQnO1xuXG5pbXBvcnQgZGVmYXVsdHMgZnJvbSAnLi4vdGhlbWUnO1xuaW1wb3J0IHsgZGVlcE1lcmdlIH0gZnJvbSAnLi4vdXRpbHMnO1xuXG5mdW5jdGlvbiBUaHVtYm5haWwgKHsgaW5kZXgsIHNyYywgdGh1bWJuYWlsLCBhY3RpdmUsIG9uQ2xpY2sgfSwgeyB0aGVtZSB9KSB7XG5cdGNvbnN0IHVybCA9IHRodW1ibmFpbCA/IHRodW1ibmFpbCA6IHNyYztcblx0Y29uc3QgY2xhc3NlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKGRlZXBNZXJnZShkZWZhdWx0U3R5bGVzLCB0aGVtZSkpO1xuXG5cdHJldHVybiAoXG5cdFx0PGRpdlxuXHRcdFx0Y2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy50aHVtYm5haWwsIGFjdGl2ZSAmJiBjbGFzc2VzLnRodW1ibmFpbF9fYWN0aXZlKX1cblx0XHRcdG9uQ2xpY2s9eyhlKSA9PiB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0b25DbGljayhpbmRleCk7XG5cdFx0XHR9fVxuXHRcdFx0c3R5bGU9e3sgYmFja2dyb3VuZEltYWdlOiAndXJsKFwiJyArIHVybCArICdcIiknIH19XG5cdFx0Lz5cblx0KTtcbn1cblxuVGh1bWJuYWlsLnByb3BUeXBlcyA9IHtcblx0YWN0aXZlOiBQcm9wVHlwZXMuYm9vbCxcblx0aW5kZXg6IFByb3BUeXBlcy5udW1iZXIsXG5cdG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG5cdHNyYzogUHJvcFR5cGVzLnN0cmluZyxcblx0dGh1bWJuYWlsOiBQcm9wVHlwZXMuc3RyaW5nLFxufTtcblxuVGh1bWJuYWlsLmNvbnRleHRUeXBlcyA9IHtcblx0dGhlbWU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbn07XG5cbmNvbnN0IGRlZmF1bHRTdHlsZXMgPSB7XG5cdHRodW1ibmFpbDoge1xuXHRcdGJhY2tncm91bmRQb3NpdGlvbjogJ2NlbnRlcicsXG5cdFx0YmFja2dyb3VuZFNpemU6ICdjb3ZlcicsXG5cdFx0Ym9yZGVyUmFkaXVzOiAyLFxuXHRcdGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDFweCBoc2xhKDAsMCUsMTAwJSwuMiknLFxuXHRcdGN1cnNvcjogJ3BvaW50ZXInLFxuXHRcdGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxuXHRcdGhlaWdodDogZGVmYXVsdHMudGh1bWJuYWlsLnNpemUsXG5cdFx0bWFyZ2luOiBkZWZhdWx0cy50aHVtYm5haWwuZ3V0dGVyLFxuXHRcdG92ZXJmbG93OiAnaGlkZGVuJyxcblx0XHR3aWR0aDogZGVmYXVsdHMudGh1bWJuYWlsLnNpemUsXG5cdH0sXG5cdHRodW1ibmFpbF9fYWN0aXZlOiB7XG5cdFx0Ym94U2hhZG93OiBgaW5zZXQgMCAwIDAgMnB4ICR7ZGVmYXVsdHMudGh1bWJuYWlsLmFjdGl2ZUJvcmRlckNvbG9yfWAsXG5cdH0sXG59O1xuXG5leHBvcnQgZGVmYXVsdCBUaHVtYm5haWw7XG4iLCJpbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50LCBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBjc3MsIFN0eWxlU2hlZXQgfSBmcm9tICdhcGhyb2RpdGUvbm8taW1wb3J0YW50JztcbmltcG9ydCBQbGF5QnV0dG9uIGZyb20gJy4uL2ljb25zL3BsYXlCdXR0b24nO1xuXG5jb25zdCBNSU5fU1dJUEVfTEVOR1RIID0gNDAuMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlkZW8gZXh0ZW5kcyBDb21wb25lbnQge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge3BsYXk6IGZhbHNlfTtcbiAgfVxuXG4gIG9uV3JhcHBlckNsaWNrKGUpXG4gIHtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGlmICh0aGlzLnN0YXRlLnBsYXkpIHtcbiAgICAgIHRoaXMucmVmcy52aWRlb19wbGF5ZXIucGF1c2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWZzLnZpZGVvX3BsYXllci5wbGF5KCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKVxuICB7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGxldCB2aWRlbyA9IHRoaXMucmVmcy52aWRlb19wbGF5ZXI7XG5cbiAgICB2aWRlby5hZGRFdmVudExpc3RlbmVyKFwicGxheVwiLCAoKSA9PiB7XG4gICAgICBzZWxmLnNldFN0YXRlKHtwbGF5OiB0cnVlfSk7XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgdmlkZW8uYWRkRXZlbnRMaXN0ZW5lcihcInBhdXNlXCIsICgpID0+IHtcbiAgICAgIHNlbGYuc2V0U3RhdGUoe3BsYXk6IGZhbHNlfSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAgb25WaWRlb1RvdWNoKGUpIHtcbiAgICAvKipcbiAgICAgKiB0cmFjayB0b3VjaCBzd2lwZXNcbiAgICAgKi9cblxuICAgIGxldCBzZWxmID0gdGhpcztcblxuICAgIHRoaXMudG91Y2hQb3MgPSB7IHg6IGUudG91Y2hlc1swXS5jbGllbnRYLCB5OiBlLnRvdWNoZXNbMF0uY2xpZW50WSB9O1xuXG4gICAgbGV0IG9uVG91Y2hFbmQgPSBmdW5jdGlvbihlKSB7XG4gICAgICBzZWxmLnN3aXBlU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICBsZXQgb2Zmc2V0WCA9IHNlbGYudG91Y2hQb3MueCAtIGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgIGxldCBvZmZzZXRZID0gc2VsZi50b3VjaFBvcy55IC0gZS5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuXG4gICAgICBpZiAoTWF0aC5hYnMob2Zmc2V0WCkgPiAoMy4wICogTWF0aC5hYnMob2Zmc2V0WSkpICYmIE1hdGguYWJzKG9mZnNldFgpID4gTUlOX1NXSVBFX0xFTkdUSCkge1xuICAgICAgICBpZiAob2Zmc2V0WCA8IDApIHtcbiAgICAgICAgICAvLyBzd2lwZSBsZWZ0XG4gICAgICAgICAgaWYgKHNlbGYucHJvcHMub25Td2lwZUxlZnQpIHNlbGYucHJvcHMub25Td2lwZUxlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzd2lwZSByaWdodFxuICAgICAgICAgIGlmIChzZWxmLnByb3BzLm9uU3dpcGVSaWdodCkgc2VsZi5wcm9wcy5vblN3aXBlUmlnaHQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsIG9uVG91Y2hFbmQpO1xuICAgIH07XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLCBvblRvdWNoRW5kKTtcbiAgfVxuXG4gIHJlbmRlcigpXG4gIHtcbiAgICByZXR1cm4gKDxkaXYgc3R5bGU9e3t0ZXh0QWxpZ246ICdjZW50ZXInfX0+XG4gICAgICA8ZGl2IHN0eWxlPXt7cG9zaXRpb246ICdyZWxhdGl2ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBtYXhXaWR0aDogJzEwMHZ3JywgcG9pbnRlckV2ZW50czogJ2F1dG8nLCBiYWNrZ3JvdW5kQ29sb3I6ICdibGFjaycsIG1heEhlaWdodDogYGNhbGMoMTAwdmggLSAke3RoaXMucHJvcHMuaGVpZ2h0T2Zmc2V0fXB4KWB9fT5cbiAgICAgICAgPGRpdiBvbkNsaWNrPXt0aGlzLm9uV3JhcHBlckNsaWNrLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgb25Ub3VjaFN0YXJ0PXt0aGlzLm9uVmlkZW9Ub3VjaC5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgIHN0eWxlPXt7cG9zaXRpb246ICdhYnNvbHV0ZScsIHRvcDogMCwgbGVmdDogMCwgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnOTAlJywgekluZGV4OiAxMDAsIGN1cnNvcjogdGhpcy5wcm9wcy5zdHlsZS5jdXJzb3IgPyB0aGlzLnByb3BzLnN0eWxlLmN1cnNvciA6ICdhdXRvJ319PlxuICAgICAgICAgIDxQbGF5QnV0dG9uXG4gICAgICAgICAgICBmaWxsPVwiI0ZGRkZGRlwiXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NzcyhjbGFzc2VzLnBsYXkpfVxuICAgICAgICAgICAgc3R5bGU9e3tvcGFjaXR5OiB0aGlzLnN0YXRlLnBsYXkgPyAwIDogMC44IH19XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHZpZGVvXG4gICAgICAgICAgcmVmPVwidmlkZW9fcGxheWVyXCJcbiAgICAgICAgICBzcmM9e3RoaXMucHJvcHMuc3JjfVxuICAgICAgICAgIHByZWxvYWQ9e3RoaXMucHJvcHMucHJlbG9hZH1cbiAgICAgICAgICBjb250cm9sc1xuICAgICAgICAgIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9XG4gICAgICAgICAgcG9zdGVyPXt0aGlzLnByb3BzLnBvc3Rlcn1cbiAgICAgICAgICBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX0+XG4gICAgICAgIDxzb3VyY2Uga2V5PXt0aGlzLnByb3BzLnNyY30gc3JjPXt0aGlzLnByb3BzLnNyY30vPlxuICAgICAgICB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5zcmNzZXQubWFwKChzcmMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiA8c291cmNlIGtleT17c3JjfSBzcmM9e3NyY30vPlxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgPC92aWRlbz5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pik7XG4gIH1cblxufVxuXG5WaWRlby5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBoZWlnaHRPZmZzZXQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgb25Td2lwZUxlZnQ6IFByb3BUeXBlcy5mdW5jLFxuICBvblN3aXBlUmlnaHQ6IFByb3BUeXBlcy5mdW5jLFxuICBwb3N0ZXI6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgcHJlbG9hZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgc3JjOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gIHNyY3NldDogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsXG4gIHN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuXG5WaWRlby5kZWZhdWx0UHJvcHMgPSB7XG4gIHByZWxvYWQ6IFwiYXV0b1wiLFxufTtcblxuY29uc3QgY2xhc3NlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKHtcbiAgcGxheToge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIHRvcDogMCxcbiAgICBib3R0b206IDAsXG4gICAgbGVmdDogMCxcbiAgICByaWdodDogMCxcbiAgICB3aWR0aDogJzE4JScsXG4gICAgaGVpZ2h0OiAnMTglJyxcbiAgICBtaW5XaWR0aDogMjAsXG4gICAgbWluSGVpZ2h0OiAyMCxcbiAgICBtYXJnaW46ICdhdXRvJyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICB0cmFuc2l0aW9uOiAnb3BhY2l0eSAwLjNzJyxcbiAgfSxcbn0pOyIsImV4cG9ydCBkZWZhdWx0IChmaWxsKSA9PiAoXG5cdGA8c3ZnIGZpbGw9XCIke2ZpbGx9XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDUxMiA1MTJcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuXHRcdDxwYXRoIGQ9XCJNMjEzLjcsMjU2TDIxMy43LDI1NkwyMTMuNywyNTZMMzgwLjksODEuOWM0LjItNC4zLDQuMS0xMS40LTAuMi0xNS44bC0yOS45LTMwLjZjLTQuMy00LjQtMTEuMy00LjUtMTUuNS0wLjJMMTMxLjEsMjQ3LjkgYy0yLjIsMi4yLTMuMiw1LjItMyw4LjFjLTAuMSwzLDAuOSw1LjksMyw4LjFsMjA0LjIsMjEyLjdjNC4yLDQuMywxMS4yLDQuMiwxNS41LTAuMmwyOS45LTMwLjZjNC4zLTQuNCw0LjQtMTEuNSwwLjItMTUuOCBMMjEzLjcsMjU2elwiLz5cblx0PC9zdmc+YFxuKTtcbiIsImV4cG9ydCBkZWZhdWx0IChmaWxsKSA9PiAoXG5cdGA8c3ZnIGZpbGw9XCIke2ZpbGx9XCIgdmVyc2lvbj1cIjEuMVwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB4bWxuczp4bGluaz1cImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIiB4PVwiMHB4XCIgeT1cIjBweFwiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDUxMiA1MTJcIiB4bWw6c3BhY2U9XCJwcmVzZXJ2ZVwiPlxuXHRcdDxwYXRoIGQ9XCJNMjk4LjMsMjU2TDI5OC4zLDI1NkwyOTguMywyNTZMMTMxLjEsODEuOWMtNC4yLTQuMy00LjEtMTEuNCwwLjItMTUuOGwyOS45LTMwLjZjNC4zLTQuNCwxMS4zLTQuNSwxNS41LTAuMmwyMDQuMiwyMTIuNyBjMi4yLDIuMiwzLjIsNS4yLDMsOC4xYzAuMSwzLTAuOSw1LjktMyw4LjFMMTc2LjcsNDc2LjhjLTQuMiw0LjMtMTEuMiw0LjItMTUuNS0wLjJMMTMxLjMsNDQ2Yy00LjMtNC40LTQuNC0xMS41LTAuMi0xNS44IEwyOTguMywyNTZ6XCIvPlxuXHQ8L3N2Zz5gXG4pO1xuIiwiZXhwb3J0IGRlZmF1bHQgKGZpbGwpID0+IChcblx0YDxzdmcgZmlsbD1cIiR7ZmlsbH1cIiB2ZXJzaW9uPVwiMS4xXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHhtbG5zOnhsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCIwIDAgNTEyIDUxMlwiIHN0eWxlPVwiZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyO1wiIHhtbDpzcGFjZT1cInByZXNlcnZlXCI+XG5cdFx0PHBhdGggZD1cIk00NDMuNiwzODcuMUwzMTIuNCwyNTUuNGwxMzEuNS0xMzBjNS40LTUuNCw1LjQtMTQuMiwwLTE5LjZsLTM3LjQtMzcuNmMtMi42LTIuNi02LjEtNC05LjgtNGMtMy43LDAtNy4yLDEuNS05LjgsNCBMMjU2LDE5Ny44TDEyNC45LDY4LjNjLTIuNi0yLjYtNi4xLTQtOS44LTRjLTMuNywwLTcuMiwxLjUtOS44LDRMNjgsMTA1LjljLTUuNCw1LjQtNS40LDE0LjIsMCwxOS42bDEzMS41LDEzMEw2OC40LDM4Ny4xIGMtMi42LDIuNi00LjEsNi4xLTQuMSw5LjhjMCwzLjcsMS40LDcuMiw0LjEsOS44bDM3LjQsMzcuNmMyLjcsMi43LDYuMiw0LjEsOS44LDQuMWMzLjUsMCw3LjEtMS4zLDkuOC00LjFMMjU2LDMxMy4xbDEzMC43LDEzMS4xIGMyLjcsMi43LDYuMiw0LjEsOS44LDQuMWMzLjUsMCw3LjEtMS4zLDkuOC00LjFsMzcuNC0zNy42YzIuNi0yLjYsNC4xLTYuMSw0LjEtOS44QzQ0Ny43LDM5My4yLDQ0Ni4yLDM4OS43LDQ0My42LDM4Ny4xelwiLz5cblx0PC9zdmc+YFxuKTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRhcnJvd0xlZnQ6IHJlcXVpcmUoJy4vYXJyb3dMZWZ0JyksXG5cdGFycm93UmlnaHQ6IHJlcXVpcmUoJy4vYXJyb3dSaWdodCcpLFxuXHRjbG9zZTogcmVxdWlyZSgnLi9jbG9zZScpLFxufTtcbiIsImltcG9ydCBSZWFjdCwgeyBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IE1pbnVzSWNvbiA9IChwcm9wcykgPT4ge1xuXHRyZXR1cm4gPHN2Z1xuXHRcdHN0eWxlPXtwcm9wcy5zdHlsZX1cblx0XHRvbkNsaWNrPXsoZSkgPT4ge3Byb3BzLm9uQ2xpY2soZSl9fVxuXHRcdHZlcnNpb249XCIxLjFcIlxuXHRcdHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXHRcdHhtbG5zWGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCAyMiAyMlwiIHhtbFNwYWNlPVwicHJlc2VydmVcIj5cblx0XHQ8dGl0bGU+e3Byb3BzLnRpdGxlfTwvdGl0bGU+XG5cdFx0PGxpbmUgc3Ryb2tlTGluZWNhcD1cInNxdWFyZVwiIHkyPVwiMTBcIiB4Mj1cIjJcIiB5MT1cIjEwXCIgeDE9XCIyMFwiIHN0cm9rZVdpZHRoPVwiNFwiIHN0cm9rZT17cHJvcHMuY29sb3J9IGZpbGw9XCJub25lXCIgLz5cblx0PC9zdmc+O1xufTtcblxuXG5NaW51c0ljb24ucHJvcFR5cGVzID0ge1xuXHRjb2xvcjogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuXHRzdHlsZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgTWludXNJY29uOyIsImltcG9ydCBSZWFjdCwgeyBQcm9wVHlwZXMgfSBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFBsYXlCdXR0b24gPSAocHJvcHMpID0+IHtcblx0cmV0dXJuIDxzdmdcblx0XHRjbGFzc05hbWU9e3Byb3BzLmNsYXNzTmFtZX1cblx0XHRmaWxsPXtwcm9wcy5maWxsfVxuXHRcdHN0eWxlPXtwcm9wcy5zdHlsZX1cblx0XHR2ZXJzaW9uPVwiMS4xXCJcblx0XHR4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCJcblx0XHR4bWxuc1hsaW5rPVwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiIHg9XCIwcHhcIiB5PVwiMHB4XCIgdmlld0JveD1cIjAgMCAzMiAzMlwiIHhtbFNwYWNlPVwicHJlc2VydmVcIj5cblx0XHQ8cGF0aCBkPVwiTTYgNGwyMCAxMi0yMCAxMnpcIiAvPlxuXHQ8L3N2Zz47XG59O1xuXG5cblBsYXlCdXR0b24ucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0ZmlsbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuXHRzdHlsZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgUGxheUJ1dHRvbjsiLCJpbXBvcnQgUmVhY3QsIHsgUHJvcFR5cGVzIH0gZnJvbSAncmVhY3QnO1xuXG5jb25zdCBQbHVzSWNvbiA9IChwcm9wcykgPT4ge1xuXHRyZXR1cm4gPHN2Z1xuXHRcdHN0eWxlPXtwcm9wcy5zdHlsZX1cblx0XHRvbkNsaWNrPXsoZSkgPT4ge3Byb3BzLm9uQ2xpY2soZSl9fVxuXHRcdHZlcnNpb249XCIxLjFcIlxuXHRcdHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIlxuXHRcdHhtbG5zWGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgeD1cIjBweFwiIHk9XCIwcHhcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCAyMiAyMlwiIHhtbFNwYWNlPVwicHJlc2VydmVcIj5cblx0XHQ8dGl0bGU+e3Byb3BzLnRpdGxlfTwvdGl0bGU+XG5cdFx0PGc+XG5cdFx0XHQ8bGluZSBzdHJva2VMaW5lY2FwPVwic3F1YXJlXCIgeTI9XCIxMFwiIHgyPVwiM1wiIHkxPVwiMTBcIiB4MT1cIjIwXCIgc3Ryb2tlV2lkdGg9XCI0XCIgc3Ryb2tlPXtwcm9wcy5jb2xvcn0gZmlsbD1cIm5vbmVcIiAvPlxuXHRcdFx0PGxpbmUgc3Ryb2tlTGluZWNhcD1cInNxdWFyZVwiIHkyPVwiMFwiIHgyPVwiMTEuNVwiIHkxPVwiMThcIiB4MT1cIjExLjVcIiBzdHJva2VXaWR0aD1cIjRcIiBzdHJva2U9e3Byb3BzLmNvbG9yfSBmaWxsPVwibm9uZVwiIC8+XG5cdFx0PC9nPlxuXHQ8L3N2Zz47XG59O1xuXG5cblBsdXNJY29uLnByb3BUeXBlcyA9IHtcblx0Y29sb3I6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0b25DbGljazogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0c3R5bGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblx0dGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBsdXNJY29uOyIsIi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuLy8gVEhFTUVcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jb25zdCB0aGVtZSA9IHt9O1xuXG4vLyBjb250YWluZXJcbnRoZW1lLmNvbnRhaW5lciA9IHtcblx0YmFja2dyb3VuZDogJ3JnYmEoMCwgMCwgMCwgMC44KScsXG5cdGd1dHRlcjoge1xuXHRcdGhvcml6b250YWw6IDEwLFxuXHRcdHZlcnRpY2FsOiAxMCxcblx0fSxcblx0ekluZGV4OiAyMDAxLFxufTtcblxuLy8gaGVhZGVyXG50aGVtZS5oZWFkZXIgPSB7XG5cdGhlaWdodDogMTAsXG59O1xudGhlbWUuY2xvc2UgPSB7XG5cdGZpbGw6ICd3aGl0ZScsXG59O1xuXG4vLyBmb290ZXJcbnRoZW1lLmZvb3RlciA9IHtcblx0Y29sb3I6ICd3aGl0ZScsXG5cdGNvdW50OiB7XG5cdFx0Y29sb3I6ICdyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNzUpJyxcblx0XHRmb250U2l6ZTogJzAuODVlbScsXG5cdH0sXG5cdGhlaWdodDogNDAsXG5cdGd1dHRlcjoge1xuXHRcdGhvcml6b250YWw6IDAsXG5cdFx0dmVydGljYWw6IDUsXG5cdH0sXG59O1xuXG4vLyB0aHVtYm5haWxzXG50aGVtZS50aHVtYm5haWwgPSB7XG5cdGFjdGl2ZUJvcmRlckNvbG9yOiAnd2hpdGUnLFxuXHRzaXplOiA1MCxcblx0Z3V0dGVyOiAyLFxufTtcblxuLy8gYXJyb3dcbnRoZW1lLmFycm93ID0ge1xuXHRiYWNrZ3JvdW5kOiAncmdiYSgwLDAsMCwwLjIpJyxcblx0ZmlsbDogJ3doaXRlJyxcblx0aGVpZ2h0OiA4MCxcblx0ekluZGV4OiAyMDAsXG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gdGhlbWU7XG4iLCIvKipcblx0QmluZCBtdWx0aXBsZSBjb21wb25lbnQgbWV0aG9kczpcblxuXHQqIEBwYXJhbSB7dGhpc30gY29udGV4dFxuXHQqIEBwYXJhbSB7QXJyYXl9IGZ1bmN0aW9uc1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdC4uLlxuXHRcdGJpbmRGdW5jdGlvbnMuY2FsbCh0aGlzLCBbJ2hhbmRsZUNsaWNrJywgJ2hhbmRsZU90aGVyJ10pO1xuXHR9XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGJpbmRGdW5jdGlvbnMgKGZ1bmN0aW9ucykge1xuXHRmdW5jdGlvbnMuZm9yRWFjaChmID0+ICh0aGlzW2ZdID0gdGhpc1tmXS5iaW5kKHRoaXMpKSk7XG59O1xuIiwiLy8gUmV0dXJuIHRydWUgaWYgd2luZG93ICsgZG9jdW1lbnRcblxubW9kdWxlLmV4cG9ydHMgPSAhIShcblx0dHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcblx0JiYgd2luZG93LmRvY3VtZW50XG5cdCYmIHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50XG4pO1xuIiwiZnVuY3Rpb24gZGVlcE1lcmdlICh0YXJnZXQsIHNvdXJjZSA9IHt9KSB7XG5cdGNvbnN0IGV4dGVuZGVkID0gT2JqZWN0LmFzc2lnbih7fSwgdGFyZ2V0KTtcblxuXHRPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goKGtleSkgPT4ge1xuXHRcdGlmICh0eXBlb2Ygc291cmNlW2tleV0gIT09ICdvYmplY3QnIHx8ICFzb3VyY2Vba2V5XSkge1xuXHRcdFx0ZXh0ZW5kZWRba2V5XSA9IHNvdXJjZVtrZXldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIXRhcmdldFtrZXldKSB7XG5cdFx0XHRcdGV4dGVuZGVkW2tleV0gPSBzb3VyY2Vba2V5XTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGV4dGVuZGVkW2tleV0gPSBkZWVwTWVyZ2UodGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBleHRlbmRlZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWVwTWVyZ2U7XG4iLCJpbXBvcnQgYmluZEZ1bmN0aW9ucyBmcm9tICcuL2JpbmRGdW5jdGlvbnMnO1xuaW1wb3J0IGNhblVzZURvbSBmcm9tICcuL2NhblVzZURvbSc7XG5pbXBvcnQgZGVlcE1lcmdlIGZyb20gJy4vZGVlcE1lcmdlJztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGJpbmRGdW5jdGlvbnMsXG5cdGNhblVzZURvbSxcblx0ZGVlcE1lcmdlLFxufTtcbiIsImltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgY3NzLCBTdHlsZVNoZWV0IH0gZnJvbSAnYXBocm9kaXRlL25vLWltcG9ydGFudCc7XG5pbXBvcnQgU2Nyb2xsTG9jayBmcm9tICdyZWFjdC1zY3JvbGxsb2NrJztcblxuaW1wb3J0IGRlZmF1bHRUaGVtZSBmcm9tICcuL3RoZW1lJztcbmltcG9ydCBBcnJvdyBmcm9tICcuL2NvbXBvbmVudHMvQXJyb3cnO1xuaW1wb3J0IENvbnRhaW5lciBmcm9tICcuL2NvbXBvbmVudHMvQ29udGFpbmVyJztcbmltcG9ydCBGb290ZXIgZnJvbSAnLi9jb21wb25lbnRzL0Zvb3Rlcic7XG5pbXBvcnQgSGVhZGVyIGZyb20gJy4vY29tcG9uZW50cy9IZWFkZXInO1xuaW1wb3J0IFBhZ2luYXRlZFRodW1ibmFpbHMgZnJvbSAnLi9jb21wb25lbnRzL1BhZ2luYXRlZFRodW1ibmFpbHMnO1xuaW1wb3J0IFBvcnRhbCBmcm9tICcuL2NvbXBvbmVudHMvUG9ydGFsJztcbmltcG9ydCBWaWRlbyBmcm9tICcuL2NvbXBvbmVudHMvVmlkZW8nO1xuaW1wb3J0IEltYWdlIGZyb20gJy4vY29tcG9uZW50cy9JbWFnZSc7XG5cbmltcG9ydCB7IGJpbmRGdW5jdGlvbnMsIGNhblVzZURvbSwgZGVlcE1lcmdlIH0gZnJvbSAnLi91dGlscyc7XG5cbmNsYXNzIExpZ2h0Ym94IGV4dGVuZHMgQ29tcG9uZW50IHtcblx0Y29uc3RydWN0b3IgKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdHRoaXMudGhlbWUgPSBkZWVwTWVyZ2UoZGVmYXVsdFRoZW1lLCBwcm9wcy50aGVtZSk7XG5cdFx0YmluZEZ1bmN0aW9ucy5jYWxsKHRoaXMsIFtcblx0XHRcdCdnb3RvTmV4dCcsXG5cdFx0XHQnZ290b1ByZXYnLFxuXHRcdFx0J2Nsb3NlQmFja2Ryb3AnLFxuXHRcdFx0J2hhbmRsZUtleWJvYXJkSW5wdXQnLFxuXHRcdF0pO1xuXHR9XG5cdGdldENoaWxkQ29udGV4dCAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRoZW1lOiB0aGlzLnRoZW1lLFxuXHRcdH07XG5cdH1cblx0Y29tcG9uZW50RGlkTW91bnQgKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmlzT3BlbiAmJiB0aGlzLnByb3BzLmVuYWJsZUtleWJvYXJkSW5wdXQpIHtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlib2FyZElucHV0KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5wcm9wcy5vbkxpZ2h0Ym94UmVhZHkpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uTGlnaHRib3hSZWFkeSgpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyAobmV4dFByb3BzKSB7XG5cdFx0aWYgKCFjYW5Vc2VEb20pIHJldHVybjtcblxuXHRcdC8vIHByZWxvYWQgaW1hZ2VzXG5cdFx0aWYgKG5leHRQcm9wcy5wcmVsb2FkTmV4dEltYWdlKSB7XG5cdFx0XHRjb25zdCBjdXJyZW50SW5kZXggPSB0aGlzLnByb3BzLmN1cnJlbnRJbWFnZTtcblx0XHRcdGNvbnN0IG5leHRJbmRleCA9IG5leHRQcm9wcy5jdXJyZW50SW1hZ2UgKyAxO1xuXHRcdFx0Y29uc3QgcHJldkluZGV4ID0gbmV4dFByb3BzLmN1cnJlbnRJbWFnZSAtIDE7XG5cdFx0XHRsZXQgcHJlbG9hZEluZGV4O1xuXG5cdFx0XHRpZiAoY3VycmVudEluZGV4ICYmIG5leHRQcm9wcy5jdXJyZW50SW1hZ2UgPiBjdXJyZW50SW5kZXgpIHtcblx0XHRcdFx0cHJlbG9hZEluZGV4ID0gbmV4dEluZGV4O1xuXHRcdFx0fSBlbHNlIGlmIChjdXJyZW50SW5kZXggJiYgbmV4dFByb3BzLmN1cnJlbnRJbWFnZSA8IGN1cnJlbnRJbmRleCkge1xuXHRcdFx0XHRwcmVsb2FkSW5kZXggPSBwcmV2SW5kZXg7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGlmIHdlIGtub3cgdGhlIHVzZXIncyBkaXJlY3Rpb24ganVzdCBnZXQgb25lIGltYWdlXG5cdFx0XHQvLyBvdGhlcndpc2UsIHRvIGJlIHNhZmUsIHdlIG5lZWQgdG8gZ3JhYiBvbmUgaW4gZWFjaCBkaXJlY3Rpb25cblx0XHRcdGlmIChwcmVsb2FkSW5kZXgpIHtcblx0XHRcdFx0dGhpcy5wcmVsb2FkSW1hZ2UocHJlbG9hZEluZGV4KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMucHJlbG9hZEltYWdlKHByZXZJbmRleCk7XG5cdFx0XHRcdHRoaXMucHJlbG9hZEltYWdlKG5leHRJbmRleCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gYWRkL3JlbW92ZSBldmVudCBsaXN0ZW5lcnNcblx0XHRpZiAoIXRoaXMucHJvcHMuaXNPcGVuICYmIG5leHRQcm9wcy5pc09wZW4gJiYgbmV4dFByb3BzLmVuYWJsZUtleWJvYXJkSW5wdXQpIHtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlib2FyZElucHV0KTtcblx0XHR9XG5cdFx0aWYgKCFuZXh0UHJvcHMuaXNPcGVuICYmIG5leHRQcm9wcy5lbmFibGVLZXlib2FyZElucHV0KSB7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuaGFuZGxlS2V5Ym9hcmRJbnB1dCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50RGlkVXBkYXRlICgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5vbkxpZ2h0Ym94UmVhZHkpIHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLnByb3BzLm9uTGlnaHRib3hSZWFkeSgpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fVxuXHR9XG5cblx0Y29tcG9uZW50V2lsbFVubW91bnQgKCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmVuYWJsZUtleWJvYXJkSW5wdXQpIHtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlib2FyZElucHV0KTtcblx0XHR9XG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gTUVUSE9EU1xuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuXHRwcmVsb2FkSW1hZ2UgKGlkeCkge1xuXHRcdGNvbnN0IGltYWdlID0gdGhpcy5wcm9wcy5pbWFnZXNbaWR4XTtcblxuXHRcdGlmICghaW1hZ2UpIHJldHVybjtcblxuXHRcdGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuXG5cdFx0aW1nLnNyYyA9IGltYWdlLnNyYztcblxuXHRcdGlmIChpbWFnZS5zcmNzZXQpIHtcblx0XHRcdGltZy5zcmNzZXQgPSBpbWFnZS5zcmNzZXQuam9pbigpO1xuXHRcdH1cblx0fVxuXHRnb3RvTmV4dCAoZXZlbnQpIHtcblx0XHQvLyBjb25zb2xlLmxvZygnZ290b05leHQnKTtcblx0XHRpZiAodGhpcy5wcm9wcy5jdXJyZW50SW1hZ2UgPT09ICh0aGlzLnByb3BzLmltYWdlcy5sZW5ndGggLSAxKSkgcmV0dXJuO1xuXHRcdGlmIChldmVudCkge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coJ2VlZWUnLCBldmVudCk7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0ZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0fVxuXHRcdHRoaXMucHJvcHMub25DbGlja05leHQoKTtcblxuXHR9XG5cdGdvdG9QcmV2IChldmVudCkge1xuXHRcdGlmICh0aGlzLnByb3BzLmN1cnJlbnRJbWFnZSA9PT0gMCkgcmV0dXJuO1xuXHRcdGlmIChldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdH1cblx0XHR0aGlzLnByb3BzLm9uQ2xpY2tQcmV2KCk7XG5cblx0fVxuXHRjbG9zZUJhY2tkcm9wIChldmVudCkge1xuXHRcdGlmIChldmVudC50YXJnZXQuaWQgPT09ICdsaWdodGJveEJhY2tkcm9wJykge1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNsb3NlKCk7XG5cdFx0fVxuXHR9XG5cdGhhbmRsZUtleWJvYXJkSW5wdXQgKGV2ZW50KSB7XG5cdFx0aWYgKGV2ZW50LmtleUNvZGUgPT09IDM3KSB7IC8vIGxlZnRcblx0XHRcdHRoaXMuZ290b1ByZXYoZXZlbnQpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIGlmIChldmVudC5rZXlDb2RlID09PSAzOSkgeyAvLyByaWdodFxuXHRcdFx0dGhpcy5nb3RvTmV4dChldmVudCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7IC8vIGVzY1xuXHRcdFx0dGhpcy5wcm9wcy5vbkNsb3NlKCk7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH1cblxuXHQvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblx0Ly8gUkVOREVSRVJTXG5cdC8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5cdHJlbmRlckFycm93UHJldiAoKSB7XG5cdFx0aWYgKHRoaXMucHJvcHMuY3VycmVudEltYWdlID09PSAwKSByZXR1cm4gbnVsbDtcblxuXHRcdHJldHVybiAoXG5cdFx0XHQ8QXJyb3dcblx0XHRcdFx0ZGlyZWN0aW9uPVwibGVmdFwiXG5cdFx0XHRcdGljb249XCJhcnJvd0xlZnRcIlxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLmdvdG9QcmV2fVxuXHRcdFx0XHR0aXRsZT17dGhpcy5wcm9wcy5sZWZ0QXJyb3dUaXRsZX1cblx0XHRcdFx0dHlwZT1cImJ1dHRvblwiXG5cdFx0XHQvPlxuXHRcdCk7XG5cdH1cblx0cmVuZGVyQXJyb3dOZXh0ICgpIHtcblx0XHRpZiAodGhpcy5wcm9wcy5jdXJyZW50SW1hZ2UgPT09ICh0aGlzLnByb3BzLmltYWdlcy5sZW5ndGggLSAxKSkgcmV0dXJuIG51bGw7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PEFycm93XG5cdFx0XHRcdGRpcmVjdGlvbj1cInJpZ2h0XCJcblx0XHRcdFx0aWNvbj1cImFycm93UmlnaHRcIlxuXHRcdFx0XHRvbkNsaWNrPXt0aGlzLmdvdG9OZXh0fVxuXHRcdFx0XHR0aXRsZT17dGhpcy5wcm9wcy5yaWdodEFycm93VGl0bGV9XG5cdFx0XHRcdHR5cGU9XCJidXR0b25cIlxuXHRcdFx0Lz5cblx0XHQpO1xuXHR9XG5cdHJlbmRlckRpYWxvZyAoKSB7XG5cdFx0Y29uc3Qge1xuXHRcdFx0YmFja2Ryb3BDbG9zZXNNb2RhbCxcblx0XHRcdGN1c3RvbUNvbnRyb2xzLFxuXHRcdFx0aXNPcGVuLFxuXHRcdFx0b25DbG9zZSxcblx0XHRcdHNob3dDbG9zZUJ1dHRvbixcblx0XHRcdHNob3dUaHVtYm5haWxzLFxuXHRcdFx0d2lkdGgsXG5cdFx0fSA9IHRoaXMucHJvcHM7XG5cblx0XHRpZiAoIWlzT3BlbikgcmV0dXJuIDxzcGFuIGtleT1cImNsb3NlZFwiIC8+O1xuXG5cdFx0bGV0IG9mZnNldFRodW1ibmFpbHMgPSAwO1xuXHRcdGlmIChzaG93VGh1bWJuYWlscykge1xuXHRcdFx0b2Zmc2V0VGh1bWJuYWlscyA9IHRoaXMudGhlbWUudGh1bWJuYWlsLnNpemUgKyB0aGlzLnRoZW1lLmNvbnRhaW5lci5ndXR0ZXIudmVydGljYWw7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIChcblx0XHRcdDxDb250YWluZXJcblx0XHRcdFx0a2V5PVwib3BlblwiXG5cdFx0XHRcdG9uQ2xpY2s9eyEhYmFja2Ryb3BDbG9zZXNNb2RhbCAmJiB0aGlzLmNsb3NlQmFja2Ryb3B9XG5cdFx0XHRcdG9uVG91Y2hFbmQ9eyEhYmFja2Ryb3BDbG9zZXNNb2RhbCAmJiB0aGlzLmNsb3NlQmFja2Ryb3B9XG5cdFx0XHQ+XG5cdFx0XHRcdDxkaXYgY2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy5jb250ZW50KX0gc3R5bGU9e3sgbWFyZ2luQm90dG9tOiBvZmZzZXRUaHVtYm5haWxzLCBtYXhXaWR0aDogd2lkdGggfX0+XG5cdFx0XHRcdFx0PEhlYWRlclxuXHRcdFx0XHRcdFx0Y3VzdG9tQ29udHJvbHM9e2N1c3RvbUNvbnRyb2xzfVxuXHRcdFx0XHRcdFx0b25DbG9zZT17b25DbG9zZX1cblx0XHRcdFx0XHRcdHNob3dDbG9zZUJ1dHRvbj17c2hvd0Nsb3NlQnV0dG9ufVxuXHRcdFx0XHRcdFx0Y2xvc2VCdXR0b25UaXRsZT17dGhpcy5wcm9wcy5jbG9zZUJ1dHRvblRpdGxlfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0e3RoaXMucmVuZGVySW1hZ2VzKCl9XG4gICAgICAgICAge3RoaXMucmVuZGVyQXJyb3dQcmV2KCl9XG4gICAgICAgICAge3RoaXMucmVuZGVyQXJyb3dOZXh0KCl9XG5cdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8U2Nyb2xsTG9jayAvPlxuXHRcdFx0PC9Db250YWluZXI+XG5cdFx0KTtcblx0fVxuXHRyZW5kZXJJbWFnZXMgKCkge1xuXHRcdGNvbnN0IHtcblx0XHRcdGN1cnJlbnRJbWFnZSxcblx0XHRcdGltYWdlcyxcblx0XHRcdGltYWdlQ291bnRTZXBhcmF0b3IsXG5cdFx0XHRvbkNsaWNrSW1hZ2UsXG5cdFx0XHRzaG93SW1hZ2VDb3VudCxcblx0XHRcdHNob3dUaHVtYm5haWxzLFxuXHRcdH0gPSB0aGlzLnByb3BzO1xuXG5cdFx0aWYgKCFpbWFnZXMgfHwgIWltYWdlcy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG5cdFx0Y29uc3QgaW1hZ2UgPSBpbWFnZXNbY3VycmVudEltYWdlXTtcblxuXHRcdGNvbnN0IHRodW1ibmFpbHNTaXplID0gc2hvd1RodW1ibmFpbHMgPyB0aGlzLnRoZW1lLnRodW1ibmFpbC5zaXplIDogMDtcblx0XHRjb25zdCBoZWlnaHRPZmZzZXQgPSB0aGlzLnRoZW1lLmhlYWRlci5oZWlnaHQgKyB0aGlzLnRoZW1lLmZvb3Rlci5oZWlnaHQgKyB0aHVtYm5haWxzU2l6ZSArICh0aGlzLnRoZW1lLmNvbnRhaW5lci5ndXR0ZXIudmVydGljYWwpO1xuXHRcdGxldCByZW5kZXJJbWFnZU9yVmlkZW87XG5cblx0XHRpZiAoIWltYWdlLnNyY3NldClcblx0XHRcdGltYWdlLnNyY3NldCA9IFtdO1xuXG5cdFx0aWYoaW1hZ2Uuc3JjICYmIGltYWdlLnNyYy50b0xvd2VyQ2FzZSgpLmxhc3RJbmRleE9mKCcubXA0JykgPiAtMSkge1xuXHRcdFx0cmVuZGVySW1hZ2VPclZpZGVvID0gKFxuXHRcdFx0XHQ8VmlkZW9cblx0XHRcdFx0XHRzcmM9e2ltYWdlLnNyY31cblx0XHRcdFx0XHRjbGFzc05hbWU9e2NzcyhjbGFzc2VzLmltYWdlKX1cblx0XHRcdFx0XHRwb3N0ZXI9e2ltYWdlLnRodW1ibmFpbH1cblx0XHRcdFx0XHRoZWlnaHRPZmZzZXQ9e2hlaWdodE9mZnNldH1cblx0XHRcdFx0XHRvblN3aXBlTGVmdD17dGhpcy5nb3RvUHJldi5iaW5kKHRoaXMpfVxuXHRcdFx0XHRcdG9uU3dpcGVSaWdodD17dGhpcy5nb3RvTmV4dC5iaW5kKHRoaXMpfVxuXHRcdFx0XHRcdHN0eWxlPXt7XG5cdFx0XHRcdFx0XHRjdXJzb3I6ICdwb2ludGVyJyxcblx0XHRcdFx0XHRcdG1heEhlaWdodDogYGNhbGMoMTAwdmggLSAke2hlaWdodE9mZnNldH1weClgXG5cdFx0XHRcdFx0fX1cblx0XHRcdFx0XHRzcmNzZXQ9e2ltYWdlLnNyY3NldH0gLz4pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgc3Jjc2V0O1xuXHRcdFx0bGV0IHNpemVzO1xuXG4gICAgICAgICAgICBpZiAoaW1hZ2Uuc3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgc3Jjc2V0ID0gaW1hZ2Uuc3Jjc2V0LmpvaW4oKTtcbiAgICAgICAgICAgICAgICBzaXplcyA9ICcxMDB2dyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZW5kZXJJbWFnZU9yVmlkZW8gPSAoPEltYWdlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjc3MoY2xhc3Nlcy5pbWFnZSl9XG4gICAgICAgICAgICAgICAgb25DbGljaz17ISFvbkNsaWNrSW1hZ2UgJiYgb25DbGlja0ltYWdlfVxuICAgICAgICAgICAgICAgIHNpemVzPXtzaXplc31cbiAgICAgICAgICAgICAgICBhbHQ9e2ltYWdlLmFsdH1cbiAgICAgICAgICAgICAgICBzcmM9e2ltYWdlLnNyY31cbiAgICAgICAgICAgICAgICBzcmNTZXQ9e3NyY3NldH1cblx0XHRcdFx0XHRcdFx0XHRoZWlnaHRPZmZzZXQ9e2hlaWdodE9mZnNldH1cbiAgICAgICAgICAgICAgICBvblN3aXBlTGVmdD17dGhpcy5nb3RvUHJldi5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgIG9uU3dpcGVSaWdodD17dGhpcy5nb3RvTmV4dC5iaW5kKHRoaXMpfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogdGhpcy5wcm9wcy5vbkNsaWNrSW1hZ2UgPyAncG9pbnRlcicgOiAnYXV0bycsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1heEhlaWdodDogYGNhbGMoMTAwdmggLSAke2hlaWdodE9mZnNldH1weClgLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPik7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHQ8ZmlndXJlIGNsYXNzTmFtZT17Y3NzKGNsYXNzZXMuZmlndXJlKX0+XG5cdFx0XHRcdHsgcmVuZGVySW1hZ2VPclZpZGVvIH1cblx0XHRcdFx0PEZvb3RlclxuXHRcdFx0XHRcdGNhcHRpb249e2ltYWdlc1tjdXJyZW50SW1hZ2VdLmNhcHRpb259XG5cdFx0XHRcdFx0Y291bnRDdXJyZW50PXtjdXJyZW50SW1hZ2UgKyAxfVxuXHRcdFx0XHRcdGNvdW50U2VwYXJhdG9yPXtpbWFnZUNvdW50U2VwYXJhdG9yfVxuXHRcdFx0XHRcdGNvdW50VG90YWw9e2ltYWdlcy5sZW5ndGh9XG5cdFx0XHRcdFx0c2hvd0NvdW50PXtzaG93SW1hZ2VDb3VudH1cblx0XHRcdFx0Lz5cblx0XHRcdFx0eyB0aGlzLnByb3BzLmJvdHRvbUNvbnRyb2xzID8gdGhpcy5wcm9wcy5ib3R0b21Db250cm9scyA6IG51bGwgfVxuXHRcdFx0PC9maWd1cmU+XG5cdFx0KTtcblx0fVxuXHQvKnJlbmRlclRodW1ibmFpbHMgKCkge1xuXHRcdGNvbnN0IHsgaW1hZ2VzLCBjdXJyZW50SW1hZ2UsIG9uQ2xpY2tUaHVtYm5haWwsIHNob3dUaHVtYm5haWxzLCB0aHVtYm5haWxPZmZzZXQgfSA9IHRoaXMucHJvcHM7XG5cblx0XHRpZiAoIXNob3dUaHVtYm5haWxzKSByZXR1cm47XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0PFBhZ2luYXRlZFRodW1ibmFpbHNcblx0XHRcdFx0Y3VycmVudEltYWdlPXtjdXJyZW50SW1hZ2V9XG5cdFx0XHRcdGltYWdlcz17aW1hZ2VzfVxuXHRcdFx0XHRvZmZzZXQ9e3RodW1ibmFpbE9mZnNldH1cblx0XHRcdFx0b25DbGlja1RodW1ibmFpbD17b25DbGlja1RodW1ibmFpbH1cblx0XHRcdC8+XG5cdFx0KTtcblx0fSovXG5cdHJlbmRlciAoKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxQb3J0YWw+XG5cdFx0XHRcdHt0aGlzLnJlbmRlckRpYWxvZygpfVxuXHRcdFx0PC9Qb3J0YWw+XG5cdFx0KTtcblx0fVxufVxuXG5MaWdodGJveC5wcm9wVHlwZXMgPSB7XG5cdGJhY2tkcm9wQ2xvc2VzTW9kYWw6IFByb3BUeXBlcy5ib29sLFxuXHRib3R0b21Db250cm9sczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm5vZGUpLFxuXHRjbG9zZUJ1dHRvblRpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRjdXJyZW50SW1hZ2U6IFByb3BUeXBlcy5udW1iZXIsXG5cdGN1c3RvbUNvbnRyb2xzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubm9kZSksXG5cdGVuYWJsZUtleWJvYXJkSW5wdXQ6IFByb3BUeXBlcy5ib29sLFxuXHRpbWFnZUNvdW50U2VwYXJhdG9yOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRpbWFnZXM6IFByb3BUeXBlcy5hcnJheU9mKFxuXHRcdFByb3BUeXBlcy5zaGFwZSh7XG5cdFx0XHRzcmM6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcblx0XHRcdHNyY3NldDogUHJvcFR5cGVzLmFycmF5LFxuXHRcdFx0Y2FwdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLmVsZW1lbnRdKSxcblx0XHRcdHRodW1ibmFpbDogUHJvcFR5cGVzLnN0cmluZyxcblx0XHR9KVxuXHQpLmlzUmVxdWlyZWQsXG5cdGlzT3BlbjogUHJvcFR5cGVzLmJvb2wsXG5cdGxlZnRBcnJvd1RpdGxlOiBQcm9wVHlwZXMuc3RyaW5nLFxuXHRvbkNsaWNrSW1hZ2U6IFByb3BUeXBlcy5mdW5jLFxuXHRvbkNsaWNrTmV4dDogUHJvcFR5cGVzLmZ1bmMsXG5cdG9uQ2xpY2tQcmV2OiBQcm9wVHlwZXMuZnVuYyxcblx0b25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcblx0b25MaWdodGJveFJlYWR5OiBQcm9wVHlwZXMuZnVuYyxcblx0cHJlbG9hZE5leHRJbWFnZTogUHJvcFR5cGVzLmJvb2wsXG5cdHJpZ2h0QXJyb3dUaXRsZTogUHJvcFR5cGVzLnN0cmluZyxcblx0c2hvd0Nsb3NlQnV0dG9uOiBQcm9wVHlwZXMuYm9vbCxcblx0c2hvd0ltYWdlQ291bnQ6IFByb3BUeXBlcy5ib29sLFxuXHRzaG93VGh1bWJuYWlsczogUHJvcFR5cGVzLmJvb2wsXG5cdHRoZW1lOiBQcm9wVHlwZXMub2JqZWN0LFxuXHR0aHVtYm5haWxPZmZzZXQ6IFByb3BUeXBlcy5udW1iZXIsXG5cdHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxufTtcbkxpZ2h0Ym94LmRlZmF1bHRQcm9wcyA9IHtcblx0Y2xvc2VCdXR0b25UaXRsZTogJ0Nsb3NlIChFc2MpJyxcblx0Y3VycmVudEltYWdlOiAwLFxuXHRlbmFibGVLZXlib2FyZElucHV0OiB0cnVlLFxuXHRpbWFnZUNvdW50U2VwYXJhdG9yOiAnIG9mICcsXG5cdGxlZnRBcnJvd1RpdGxlOiAnUHJldmlvdXMgKExlZnQgYXJyb3cga2V5KScsXG5cdG9uQ2xpY2tTaG93TmV4dEltYWdlOiB0cnVlLFxuXHRwcmVsb2FkTmV4dEltYWdlOiB0cnVlLFxuXHRyaWdodEFycm93VGl0bGU6ICdOZXh0IChSaWdodCBhcnJvdyBrZXkpJyxcblx0c2hvd0Nsb3NlQnV0dG9uOiB0cnVlLFxuXHRzaG93SW1hZ2VDb3VudDogdHJ1ZSxcblx0dGhlbWU6IHt9LFxuXHR0aHVtYm5haWxPZmZzZXQ6IDIsXG5cdHdpZHRoOiAxMDI0LFxufTtcbkxpZ2h0Ym94LmNoaWxkQ29udGV4dFR5cGVzID0ge1xuXHR0aGVtZTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxufTtcblxuY29uc3QgY2xhc3NlcyA9IFN0eWxlU2hlZXQuY3JlYXRlKHtcblx0Y29udGVudDoge1xuXHRcdHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuXHR9LFxuXHRmaWd1cmU6IHtcblx0XHRtYXJnaW46IDAsIC8vIHJlbW92ZSBicm93c2VyIGRlZmF1bHRcblx0XHRtYXhXaWR0aDogJzEwMHZ3Jyxcblx0fSxcblx0aW1hZ2U6IHtcblx0XHRkaXNwbGF5OiAnYmxvY2snLCAvLyByZW1vdmVzIGJyb3dzZXIgZGVmYXVsdCBndXR0ZXJcblx0XHRoZWlnaHQ6ICdhdXRvJyxcblx0XHRtYXJnaW46ICcwIGF1dG8nLCAvLyBtYWludGFpbiBjZW50ZXIgb24gdmVyeSBzaG9ydCBzY3JlZW5zIE9SIHZlcnkgbmFycm93IGltYWdlXG5cdFx0bWF4V2lkdGg6ICcxMDAlJyxcblxuXHRcdC8vIGRpc2FibGUgdXNlciBzZWxlY3Rcblx0XHRXZWJraXRUb3VjaENhbGxvdXQ6ICdub25lJyxcblx0XHR1c2VyU2VsZWN0OiAnbm9uZScsXG5cdH0sXG59KTtcblxuXG5leHBvcnQgZGVmYXVsdCBMaWdodGJveDtcbiJdfQ==
