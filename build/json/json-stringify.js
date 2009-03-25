YUI.add('json-stringify', function(Y) {

/**
 * Provides Y.JSON.stringify method for converting objects to JSON strings.
 * @module json
 * @submodule json-stringify
 * @for JSON
 * @static
 */
var _toString = Object.prototype.toString,
    STRING    = 'string',
    NUMBER    = 'number',
    BOOLEAN   = 'boolean',
    OBJECT    = 'object',
    ARRAY     = 'array',
    REGEXP    = 'regexp',
    NULL      = 'null',
    DATE      = 'date',
    EMPTY     = '',
    OPEN_O    = '{',
    CLOSE_O   = '}',
    OPEN_A    = '[',
    CLOSE_A   = ']',
    COMMA     = ',',
    COLON     = ':',
    QUOTE     = '"';

Y.mix(Y.namespace('JSON'),{
    /**
     * Regex used to capture characters that need escaping before enclosing
     * their containing string in quotes.
     * @property _SPECIAL_CHARS
     * @type {RegExp}
     * @private
     */
    _SPECIAL_CHARS : /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,

    /**
     * Character substitution map for common escapes and special characters.
     * @property _CHARS
     * @type {Object}
     * @static
     * @private
     */
    _CHARS : {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    },

    /**
     * Serializes a Date instance as a UTC date string.  Used internally by
     * stringify.  Override this method if you need Dates serialized in a
     * different format.
     * @method dateToString
     * @param d {Date} The Date to serialize
     * @return {String} stringified Date in UTC format YYYY-MM-DDTHH:mm:SSZ
     * @static
     */
    dateToString : function (d) {
        function _zeroPad(v) {
            return v < 10 ? '0' + v : v;
        }

        return QUOTE + d.getUTCFullYear()   + '-' +
              _zeroPad(d.getUTCMonth() + 1) + '-' +
              _zeroPad(d.getUTCDate())      + 'T' +
              _zeroPad(d.getUTCHours())     + COLON +
              _zeroPad(d.getUTCMinutes())   + COLON +
              _zeroPad(d.getUTCSeconds())   + 'Z' + QUOTE;
    },

    /**
     * Converts an arbitrary value to a JSON string representation.
     * Cyclical object or array references are replaced with null.
     * If a whitelist is provided, only matching object keys will be included.
     * If a depth limit is provided, objects and arrays at that depth will
     * be stringified as empty.
     * @method stringify
     * @param o {MIXED} any arbitrary object to convert to JSON string
     * @param w {Array|Function} (optional) whitelist of acceptable object
     *                  keys to include, or a replacer function to modify the
     *                  raw value before serialization
     * @param d {number} (optional) depth limit to recurse objects/arrays
     *                   (practical minimum 1)
     * @return {string} JSON string representation of the input
     * @static
     * @public
     */
    stringify : function (o,w,d) {

        var m      = Y.JSON._CHARS,
            str_re = Y.JSON._SPECIAL_CHARS,
            rep    = Y.Lang.isFunction(w) ? w : null,
            pstack = [], // Processing stack used for cyclical ref protection
            _date = Y.JSON.dateToString; // Use configured date serialization

        if (rep || typeof w !== 'object') {
            w = undefined;
        }

        // escape encode special characters
        function _char(c) {
            if (!m[c]) {
                m[c]='\\u'+('0000'+(+(c.charCodeAt(0))).toString(16)).slice(-4);
            }
            return m[c];
        }

        // Enclose the escaped string in double quotes
        function _string(s) {
            return QUOTE + s.replace(str_re, _char) + QUOTE;
        }

        // Check for cyclical references
        function _cyclical(o) {
            for (var i = pstack.length - 1; i >= 0; --i) {
                if (pstack[i] === o) {
                    return true;
                }
            }
            return false;
        }

        function _object(o,d,arr) {
            // Add the object to the processing stack
            pstack.push(o);

            var a = [], i, j, len, k, v;

            // Only recurse if we're above depth config
            if (d > 0) {
                if (arr) { // Array
                    for (i = o.length - 1; i >= 0; --i) {
                        a[i] = _stringify(o,i,d-1) || NULL;
                    }
                } else {   // Object

                    // If whitelist provided, take only those keys
                    k = Y.Lang.isArray(w) ? w : Y.Object.keys(w || o);

                    for (i = 0, j = 0, len = k.length; i < len; ++i) {
                        if (typeof k[i] === STRING) {
                            v = _stringify(o,k[i],d-1);
                            if (v) {
                                a[j++] = _string(k[i]) + COLON + v;
                            }
                        }
                    }

                    a.sort();
                }
            }

            // remove the array from the stack
            pstack.pop();

            return arr ?
                OPEN_A + a.join(COMMA) + CLOSE_A :
                OPEN_O + a.join(COMMA) + CLOSE_O;
        }

        // Worker function.  Fork behavior on data type and recurse objects and
        // arrays per the configured depth.
        function _stringify(h,key,d) {
            var o = Y.Lang.isFunction(rep) ? rep.call(h,key,h[key]) : h[key],
                t = Y.Lang.type(o);

            if (t === OBJECT) {
                if (/String|Number|Boolean/.test(_toString.call(o))) {
                    o = o.valueOf();
                    t = Y.Lang.type(o);
                }
            }

            switch (t) {
                case STRING  : return _string(o);
                case NUMBER  : return isFinite(o) ? o+EMPTY : NULL;
                case BOOLEAN : return o+EMPTY;
                case DATE    : return _date(o);
                case NULL    : return NULL;
                case ARRAY   : return _cyclical(o) ? NULL : _object(o,d,true);
                case REGEXP  : // intentional fall through
                case OBJECT  : return _cyclical(o) ? NULL : _object(o,d);
                default      : return undefined;
            }
        }

        // Default depth to POSITIVE_INFINITY
        d = d >= 0 ? d : 1/0;

        // process the input
        return _stringify({'':o},EMPTY,d);
    }
});


}, '@VERSION@' );
