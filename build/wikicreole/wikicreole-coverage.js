if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/wikicreole/wikicreole.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/wikicreole/wikicreole.js",
    code: []
};
_yuitest_coverage["build/wikicreole/wikicreole.js"].code=["YUI.add('wikicreole', function (Y, NAME) {","","    /**","     * Plugin to convert from HTML to WikiCreole 1.0","     * @class Plugin.WikiCreole","     * @constructor","     * @extends Y.Plugin.Base","     * @module editor","     * @submodule wikicreole","     */","","    var WikiCreole = function(config) {","        WikiCreole.superclass.constructor.apply(this, arguments);","    },","","    Lang = Y.Lang,","    UA = Y.UA,","","    CSS_ESCAPED = 'escaped',","","    NEW_LINE = '\\n',","","    REGEX_HEADING = /^h([1-6])$/i,","","    REGEX_LASTCHAR_NEWLINE = /(\\r?\\n\\s*)$/,","","    REGEX_NEWLINE = /\\r?\\n/g,","","    REGEX_NOT_WHITESPACE = /[^\\t\\n\\r ]/,","","    REGEX_URL_PREFIX = /^(?:\\/|https?|ftp):\\/\\//i,","","    REGEX_ESCAPE_ALT_IMAGE = /(\\}\\})|(\\}$)/g,","","    STR_EMPTY = '',","","    STR_EQUALS = '=',","","    STR_LIST_ITEM_ESCAPE_CHARACTERS = '\\\\\\\\',","","    STR_PIPE = '|',","","    STR_SPACE = ' ',","","    STR_TILDE = '~',","","    TAG_BOLD = '**',","","    TAG_EMPHASIZE = '//',","","    TAG_LIST_ITEM = 'li',","","    TAG_ORDERED_LIST = 'ol',","","    TAG_ORDERED_LIST_ITEM = '#',","","    TAG_PARAGRAPH = 'p',","","    TAG_PRE = 'pre',","","    TAG_TELETYPETEXT = 'tt',","","    TAG_UNORDERED_LIST = 'ul',","","    TAG_UNORDERED_LIST_ITEM = '*';","","    Y.extend(WikiCreole, Y.Plugin.Base, {","        /**","         * Injects \"_convert\" method to be executed after \"getContent\" method of the host object.","         * @method initializer","         * @param {Object} config Configuration object with property name/value pairs.","         */","        initializer: function () {","            this.afterHostMethod('getContent', this._convert, this);","        },","","        /**","         * Appends given number of new line characters to the \"_endResult\" internal property.","         * @method _appendNewLines","         * @protected","         * @param {Number} total The total number of new line symbols which should be added to the result array.","         */","        _appendNewLines: function (total) {","            var","                count = 0,","                endResult = this._endResult,","                newLinesAtEnd = REGEX_LASTCHAR_NEWLINE.exec(endResult.slice(-2).join(STR_EMPTY));","","            if (newLinesAtEnd) {","                count = newLinesAtEnd[1].length;","            }","","            while (count++ < total) {","                endResult.push(NEW_LINE);","            }","        },","","        /**","         * Converts from HTML to WikiCreole 1.0 code. The function alters the returned result of \"getContent\" method.","         * @method _convert","         * @protected","         * @return The converted WikiCreole 1.0 code","         */","        _convert: function () {","            var","                content = Y.Do.originalRetVal,","                node = document.createElement('div'),","                endResult;","","            node.innerHTML = content;","","            this._handle(node);","","            endResult = this._endResult.join(STR_EMPTY);","","            this._endResult = null;","","            this._listsStack.length = 0;","","            return new Y.Do.AlterReturn(null, endResult);","        },","","        /**","         * Enumerates the chilren of given node and constructs an array with converted WikiCreole start and end tags.","         * @method _handle","         * @protected","         * @param {HTMLElement} node The element which should be handled","         */","        _handle: function (node) {","            var","                child,","                children,","                i,","                length,","                listTagsIn,","                listTagsOut,","                pushTagList,","                stylesTagsIn,","                stylesTagsOut;","","            if (!this._endResult) {","                this._endResult = [];","            }","","            children = node.childNodes;","            length = children.length;","            pushTagList = this._pushTagList;","","            for (i = 0; i < length; i++) {","                listTagsIn = [];","                listTagsOut = [];","","                stylesTagsIn = [];","                stylesTagsOut = [];","","                child = children[i];","","                if (this._isIgnorable(child) && !this._skipParse) {","                    continue;","                }","","                this._handleElementStart(child, listTagsIn, listTagsOut);","                this._handleStyles(child, stylesTagsIn, stylesTagsOut);","","                pushTagList.call(this, listTagsIn);","                pushTagList.call(this, stylesTagsIn);","","                this._handle(child);","","                this._handleElementEnd(child, listTagsIn, listTagsOut);","","                pushTagList.call(this, stylesTagsOut.reverse());","                pushTagList.call(this, listTagsOut);","            }","","            this._handleData(node.data, node);","        },","","        /**","         * Handles BR element and converts it to new line symbol.","         * @method _handleBreak","         * @protected","         * @param {HTMLElement} element The BR element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleBreak: function (element, listTagsIn, listTagsOut) {","            var newLineCharacter = STR_LIST_ITEM_ESCAPE_CHARACTERS;","","            if (this._skipParse) {","                newLineCharacter = NEW_LINE;","            }","","            listTagsIn.push(newLineCharacter);","        },","","        /**","         * Handles the value of the element. Removes all new line characters except when the data should'n be touched (in \"pre\" or \"tt\" elements)","         * @method _handleData","         * @protected","         * @param {String} data The data to be examined","         * @param {HTMLElement} element The element which contains the data to be handled","         */","        _handleData: function (data, element) {","            if (data) {","                if (!this._skipParse) {","                    data = data.replace(REGEX_NEWLINE, STR_EMPTY);","                }","","                this._endResult.push(data);","            }","        },","","        /**","         * Processes the end tag of given element.","         * @method _handleElementEnd","         * @protected","         * @param {HTMLElement} element The element which end tag should be processed","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleElementEnd: function (element, listTagsIn, listTagsOut) {","            var tagName = element.tagName;","","            if (tagName) {","                tagName = tagName.toLowerCase();","            }","","            if (tagName === TAG_PARAGRAPH) {","                if (!this._isLastItemNewLine()) {","                    this._endResult.push(NEW_LINE);","                }","            } else if (tagName === TAG_UNORDERED_LIST || tagName === TAG_ORDERED_LIST) {","                this._listsStack.pop();","","                var newLinesCount = 1;","","                if (!this._hasParentNode(element, TAG_LIST_ITEM)) {","                    newLinesCount = 2;","                }","","                this._appendNewLines(newLinesCount);","            } else if (tagName === TAG_PRE) {","                if (!this._isLastItemNewLine()) {","                    this._endResult.push(NEW_LINE);","                }","","                this._skipParse = false;","            } else if (tagName === TAG_TELETYPETEXT) {","                this._skipParse = false;","            } else if (tagName === 'table') {","                listTagsOut.push(NEW_LINE);","            }","        },","","        /**","         * Processes the start tag of given element.","         * @method _handleElementStart","         * @protected","         * @param {HTMLElement} element The element which start tag should be processed","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleElementStart: function (element, listTagsIn, listTagsOut) {","            var","                params,","                tagName = element.tagName;","","            if (tagName) {","                tagName = tagName.toLowerCase();","","                if (tagName === TAG_PARAGRAPH) {","                    this._handleParagraph(element, listTagsIn, listTagsOut);","                } else if (tagName === 'br') {","                    this._handleBreak(element, listTagsIn, listTagsOut);","                } else if (tagName === 'a') {","                    this._handleLink(element, listTagsIn, listTagsOut);","                } else if (tagName === 'span') {","                    this._handleSpan(element, listTagsIn, listTagsOut);","                } else if (tagName === 'strong' || tagName === 'b') {","                    this._handleStrong(element, listTagsIn, listTagsOut);","                } else if (tagName === 'em' || tagName === 'i') {","                    this._handleEm(element, listTagsIn, listTagsOut);","                } else if (tagName === 'img') {","                    this._handleImage(element, listTagsIn, listTagsOut);","                } else if (tagName === TAG_UNORDERED_LIST) {","                    this._handleUnorderedList(element, listTagsIn, listTagsOut);","                } else if (tagName === TAG_LIST_ITEM) {","                    this._handleListItem(element, listTagsIn, listTagsOut);","                } else if (tagName === TAG_ORDERED_LIST) {","                    this._handleOrderedList(element, listTagsIn, listTagsOut);","                } else if (tagName === 'hr') {","                    this._handleHr(element, listTagsIn, listTagsOut);","                } else if (tagName === TAG_PRE) {","                    this._handlePre(element, listTagsIn, listTagsOut);","                } else if (tagName === TAG_TELETYPETEXT) {","                    this._handleTT(element, listTagsIn, listTagsOut);","                } else if ((params = REGEX_HEADING.exec(tagName))) {","                    this._handleHeading(element, listTagsIn, listTagsOut, params);","                } else if (tagName === 'th') {","                    this._handleTableHeader(element, listTagsIn, listTagsOut);","                } else if (tagName === 'tr') {","                    this._handleTableRow(element, listTagsIn, listTagsOut);","                } else if (tagName === 'td') {","                    this._handleTableCell(element, listTagsIn, listTagsOut);","                }","            }","        },","","        /**","         * Handles \"EM\" or \"I\" elements and converts them to \"//\"","         * @method _handleEm","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleEm: function (element, listTagsIn, listTagsOut) {","            listTagsIn.push(TAG_EMPHASIZE);","            listTagsOut.push(TAG_EMPHASIZE);","        },","","        /**","         * Handles heading elements and converts them to WikiCreole 1.0 elements","         * @method _handleHeading","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleHeading: function (element, listTagsIn, listTagsOut, params) {","            var res = new Array(parseInt(params[1], 10) + 1);","","            res = res.join(STR_EQUALS);","","            if (this._isDataAvailable() && !this._isLastItemNewLine()) {","                listTagsIn.push(NEW_LINE);","            }","","            listTagsIn.push(res, STR_SPACE);","            listTagsOut.push(STR_SPACE, res, NEW_LINE);","        },","","        /**","         * Handles horizontal ruled line elements and converts them to WikiCreole 1.0 elements","         * @method _handleHr","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleHr: function (element, listTagsIn, listTagsOut) {","            if (this._isDataAvailable() && !this._isLastItemNewLine()) {","                listTagsIn.push(NEW_LINE);","            }","","            listTagsIn.push('----', NEW_LINE);","        },","","        /**","         * Handles img elements and converts them to WikiCreole 1.0 elements","         * @method _handleImage","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleImage: function (element, listTagsIn, listTagsOut) {","            var","                attrAlt = element.getAttribute('alt'),","                attrSrc = element.getAttribute('src');","","            attrSrc = attrSrc.replace(this.get('ignoreImgPrefix'), STR_EMPTY);","","            listTagsIn.push('{{', attrSrc);","","            if (attrAlt) {","                attrAlt = attrAlt.replace(","                    REGEX_ESCAPE_ALT_IMAGE,","                    function(match, p1, p2, offset, string) {","                        var result;","","                        if (p1) {","                            result = '}~}';","                        }","                        else if (p2) {","                            result = '~}';","                        }","","                        return result;","                    }","                );","","                listTagsIn.push(STR_PIPE, attrAlt);","            }","","            listTagsOut.push('}}');","        },","","        /**","         * Handles link elements and converts them to WikiCreole 1.0 elements","         * @method _handleLink","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleLink: function (element, listTagsIn, listTagsOut) {","            var","                hostPrefix,","                hrefAttribute,","                location,","                protocolHostPathname;","","                hrefAttribute = element.getAttribute('href');","","            if (UA.ie <= 8) {","                location = window.location;","","                protocolHostPathname = location.protocol + '//' + location.host + location.pathname;","","                protocolHostPathname = protocolHostPathname.substr(0, protocolHostPathname.lastIndexOf('/') + 1);","","                hostPrefix = hrefAttribute.indexOf(protocolHostPathname);","","                if (hostPrefix === 0) {","                    hrefAttribute = hrefAttribute.substr(protocolHostPathname.length);","                }","            }","","            if (!REGEX_URL_PREFIX.test(hrefAttribute)) {","                hrefAttribute = decodeURIComponent(hrefAttribute);","            }","","            listTagsIn.push('[[', hrefAttribute, STR_PIPE);","","            listTagsOut.push(']]');","        },","","        /**","         * Handles list elements and creates a stack which contains the list element levels.","         * @method _handleListItem","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleListItem: function (element, listTagsIn, listTagsOut) {","            var","                listsStack,","                listsStackLength;","","            if (this._isDataAvailable() && !this._isLastItemNewLine()) {","                listTagsIn.push(NEW_LINE);","            }","","            listsStack = this._listsStack;","","            listsStackLength = listsStack.length;","","            listTagsIn.push(new Array(listsStackLength + 1).join(listsStack[listsStackLength - 1]));","        },","","        /**","         * Handles ordered list element. Pushes ordered list element to list stack.","         * @method _handleOrderedList","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleOrderedList: function (element, listTagsIn, listTagsOut) {","            this._listsStack.push(TAG_ORDERED_LIST_ITEM);","        },","","        /**","         * Handles paragraph element and converts it to WikiCreole 1.0 element.","         * @method _handleParagraph","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleParagraph: function (element, listTagsIn, listTagsOut) {","            if (this._isDataAvailable()) {","                this._appendNewLines(2);","            }","","            listTagsOut.push(NEW_LINE);","        },","","        /**","         * Handles PRE element and converts it to WikiCreole 1.0.","         * @method _handlePre","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handlePre: function (element, listTagsIn, listTagsOut) {","            var","                endResult;","","            this._skipParse = true;","","            endResult = this._endResult;","","            if (this._isDataAvailable() && !this._isLastItemNewLine()) {","                endResult.push(NEW_LINE);","            }","","            listTagsIn.push('{{{', NEW_LINE);","","            listTagsOut.push('}}}', NEW_LINE);","        },","","        /**","         * Handles SPAN element which contains \"escaped\" class name and converts it to \"~\"","         * @method _handleSpan","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleSpan: function (element, listTagsIn, listTagsOut) {","            if (this._hasClass(element, CSS_ESCAPED)) {","                listTagsIn.push(STR_TILDE);","            }","        },","","        /**","         * Handles \"strong\" or \"b\" elements and converts them to WikiCreole 1.0 elements","         * @method _handleStrong","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleStrong: function (element, listTagsIn, listTagsOut) {","            if (this._isParentNode(element, TAG_LIST_ITEM) &&","                (!element.previousSibling || this._isIgnorable(element.previousSibling))) {","","                listTagsIn.push(STR_SPACE);","            }","","            listTagsIn.push(TAG_BOLD);","            listTagsOut.push(TAG_BOLD);","        },","","        /**","         * Handles element styles. Some browsers do not create special elements for handling bold or italic, they add classes instead","         * @method _handleStyles","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleStyles: function (element, stylesTagsIn, stylesTagsOut) {","            var style = element.style;","","            if (style) {","                if (style.fontWeight.toLowerCase() === 'bold') {","                    stylesTagsIn.push(TAG_BOLD);","                    stylesTagsOut.push(TAG_BOLD);","                }","","                if (style.fontStyle.toLowerCase() === 'italic') {","                    stylesTagsIn.push(TAG_EMPHASIZE);","                    stylesTagsOut.push(TAG_EMPHASIZE);","                }","            }","        },","","        /**","         * Handles table cell elements and converts them to WikiCreole 1.0 elements","         * @method _handleTableCell","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleTableCell: function (element, listTagsIn, listTagsOut) {","            listTagsIn.push(STR_PIPE);","        },","","        /**","         * Handles table header elements and converts them to WikiCreole 1.0 elements","         * @method _handleTableHeader","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleTableHeader: function (element, listTagsIn, listTagsOut) {","            listTagsIn.push(STR_PIPE, STR_EQUALS);","        },","","        /**","         * Handles table row elements and converts them to WikiCreole 1.0 elements","         * @method _handleTableRow","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleTableRow: function (element, listTagsIn, listTagsOut) {","            if (this._isDataAvailable()) {","                listTagsIn.push(NEW_LINE);","            }","","            listTagsOut.push(STR_PIPE);","        },","","        /**","         * Handles teletype elements and converts them to WikiCreole 1.0 elements","         * @method _handleTT","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleTT: function (element, listTagsIn, listTagsOut) {","            this._skipParse = true;","","            listTagsIn.push('{{{');","","            listTagsOut.push('}}}');","        },","","        /**","         * Handles unordered list element and pushes it to the stack with list items.","         * @method _handleUnorderedList","         * @protected","         * @param {HTMLElement} element The element to convert","         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children","         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children","         */","        _handleUnorderedList: function (element, listTagsIn, listTagsOut) {","            this._listsStack.push(TAG_UNORDERED_LIST_ITEM);","        },","","        /**","         * Checks for presence of given class name","         * @method _hasClass","         * @protected","         * @param {HTMLElement} element The element to check","         * @param {String} className The class name which should be checked for presence.","         * @return {Boolean} True if the element has the given class name, False otherwise","         */","        _hasClass: function (element, className) {","            return (STR_SPACE + element.className + STR_SPACE).indexOf(STR_SPACE + className + STR_SPACE) > -1;","        },","","        /**","         * Checks if given element has parent which tagName is present in \"tags\" param. If \"level\" is specified,","         * the function will stop checking when it reaches its value.","         * @method _hasParentNode","         * @protected","         * @param {HTMLElement} element The element to check","         * @param {Array|String|RegExp} tags May contain one or more tag names and these tags will be checked for presence. Each item inside this list may be String or Regular Expression.","         * @param {Number} level (optional) If specified, the function will stop checking the parent elements as soon as it reaches the value of this parameter.","         * @return {Boolean} True if any of the parent elements contains any of the tags specified in \"tags\" param, False otherwise","         */","        _hasParentNode: function (element, tags, level) {","            var","                i,","                length,","                parentNode,","                result,","                tagName;","","            if (!Lang.isArray(tags)) {","                tags = [tags];","            }","","            result = false;","","            parentNode = element.parentNode;","","            tagName = parentNode && parentNode.tagName && parentNode.tagName.toLowerCase();","","            if (tagName) {","                for (i = 0, length = tags.length; i < length; i++) {","                    result = this._tagNameMatch(tagName, tags[i]);","","                    if (result) {","                        break;","                    }","                }","            }","","            if (!result && parentNode && (!isFinite(level) || --level)) {","                result = this._hasParentNode(parentNode, tags, level);","            }","","            return result;","        },","","        /**","         * Checks if the internal _endResult array variable has any elements","         * @method _isDataAvailable","         * @protected","         * @return {Boolean} True if the internal variable _endResult contains any elements, False otherwise","         */","        _isDataAvailable: function () {","            return this._endResult && this._endResult.length;","        },","","        /**","         * Checks if the given node can be ignored because contains whitespace, is a comment or text node.","         * @method _isIgnorable","         * @protected","         * @param {HTMLElement} node The node which should be checked.","         * @return {Boolean} True if the node can be ignored.","         */","        _isIgnorable: function (node) {","            var nodeType = node.nodeType;","","            return (node.isElementContentWhitespace || nodeType === 8) ||","                ((nodeType === 3) && this._isWhitespace(node));","        },","","        /**","         * Checks if the last item in the internal variable _endResult is a new line character","         * @method _isLastItemNewLine","         * @protected","         * @param {HTMLElement} node The node which should be checked.","         * @return {Boolean} True if the last element in the internal variable _endResult is a new line character, False otherwise","         */","        _isLastItemNewLine: function (node) {","            var endResult = this._endResult;","","            return endResult && REGEX_LASTCHAR_NEWLINE.test(endResult.slice(-1));","        },","","        /**","         * Checks if given element has parent which tagName is the value specified in \"tagName\" param","         * @method _isParentNode","         * @protected","         * @param {HTMLElement} element The element to check","         * @param {String} tagName Contains the tag name which should match the tagName of any of the parents of the checked element.","         * @return {Boolean} True if any of the parent elements of the checked element has tagName specified in \"tagName\" param, False otherwise","         */","        _isParentNode: function (element, tagName) {","            return this._hasParentNode(element, tagName, 1);","        },","","        /**","         * Checks if the given node contains only whitespace","         * @method _isWhitespace","         * @protected","         * @param {HTMLElement} node The node which should be checked.","         * @return {Boolean} True if the node contains only whitespace, False othwerwise.","         */","        _isWhitespace: function (node) {","            return node.isElementContentWhitespace || !(REGEX_NOT_WHITESPACE.test(node.data));","        },","","        /**","         * Pushes Array of tags to the internal _endResult variable.","         * @method _pushTagList","         * @protected","         * @param {Array} tagsList Contains the tags which should be pushed to the result list.","         */","        _pushTagList: function (tagsList) {","            var","                endResult,","                i,","                length,","                tag;","","            endResult = this._endResult;","            length = tagsList.length;","","            for (i = 0; i < length; i++) {","                tag = tagsList[i];","","                endResult.push(tag);","            }","        },","","        /**","         * Checks if two tags match. The destination tag may be String or Regular Expression.","         * @method _tagNameMatch","         * @protected","         * @param {String} tagSrc The first tag which should be compared with the second one.","         * @param {String|RegExp} tagDest The second tag which should be compared with the first one. It may be String or Regular Expression.","         */","        _tagNameMatch: function (tagSrc, tagDest) {","            return (tagDest instanceof RegExp && tagDest.test(tagSrc)) || (tagSrc === tagDest);","        },","","        /**","         * Array which contains start tags, data and end tags. This Array is joined in order to produce the final WikiCreole 1.0 code.","         * @property {Array} _endResult","         */","        _endResult: null,","","        /**","         * Stack which contains the ordered and unordered list elements in the HTML code.","         * @property {Array} _listsStack","         */","        _listsStack: [],","","        /**","         * Property which flags when some elements should be converted to WikiCreole 1.0 or not. The elements which are in PRE or TT elements will be not converted.","         * @property {Boolean} _skipParse","         */","        _skipParse: false","    }, {","        ","        /**","         * The name of the plugin (wikicreole)","         * @static","         * @property NAME","         */","        NAME: 'wikicreole',","","        /**","         * The namespace of the plugin (wikicreole)","         * @static","         * @property NS","         */","        NS: 'wikicreole',","","        ATTRS: {","            /**","             * @attribute ignoreImgPrefix","             * @description Part of img path which should be ignored when converting to WikiCreole","             * @type String","             * @default ''","             */","            ignoreImgPrefix: {","                value: STR_EMPTY","            }","        }","    });","","    Y.namespace('Plugin');","","    Y.Plugin.WikiCreole = WikiCreole;","","}, '@VERSION@', {\"requires\": [\"editor-para\", \"event-custom-base\", \"plugin\"]});"];
_yuitest_coverage["build/wikicreole/wikicreole.js"].lines = {"1":0,"12":0,"13":0,"67":0,"74":0,"84":0,"89":0,"90":0,"93":0,"94":0,"105":0,"110":0,"112":0,"114":0,"116":0,"118":0,"120":0,"130":0,"141":0,"142":0,"145":0,"146":0,"147":0,"149":0,"150":0,"151":0,"153":0,"154":0,"156":0,"158":0,"159":0,"162":0,"163":0,"165":0,"166":0,"168":0,"170":0,"172":0,"173":0,"176":0,"188":0,"190":0,"191":0,"194":0,"205":0,"206":0,"207":0,"210":0,"223":0,"225":0,"226":0,"229":0,"230":0,"231":0,"233":0,"234":0,"236":0,"238":0,"239":0,"242":0,"243":0,"244":0,"245":0,"248":0,"249":0,"250":0,"251":0,"252":0,"265":0,"269":0,"270":0,"272":0,"273":0,"274":0,"275":0,"276":0,"277":0,"278":0,"279":0,"280":0,"281":0,"282":0,"283":0,"284":0,"285":0,"286":0,"287":0,"288":0,"289":0,"290":0,"291":0,"292":0,"293":0,"294":0,"295":0,"296":0,"297":0,"298":0,"299":0,"300":0,"301":0,"302":0,"303":0,"304":0,"305":0,"319":0,"320":0,"332":0,"334":0,"336":0,"337":0,"340":0,"341":0,"353":0,"354":0,"357":0,"369":0,"373":0,"375":0,"377":0,"378":0,"381":0,"383":0,"384":0,"386":0,"387":0,"390":0,"394":0,"397":0,"409":0,"415":0,"417":0,"418":0,"420":0,"422":0,"424":0,"426":0,"427":0,"431":0,"432":0,"435":0,"437":0,"449":0,"453":0,"454":0,"457":0,"459":0,"461":0,"473":0,"485":0,"486":0,"489":0,"501":0,"504":0,"506":0,"508":0,"509":0,"512":0,"514":0,"526":0,"527":0,"540":0,"543":0,"546":0,"547":0,"559":0,"561":0,"562":0,"563":0,"564":0,"567":0,"568":0,"569":0,"583":0,"595":0,"607":0,"608":0,"611":0,"623":0,"625":0,"627":0,"639":0,"651":0,"665":0,"672":0,"673":0,"676":0,"678":0,"680":0,"682":0,"683":0,"684":0,"686":0,"687":0,"692":0,"693":0,"696":0,"706":0,"717":0,"719":0,"731":0,"733":0,"745":0,"756":0,"766":0,"772":0,"773":0,"775":0,"776":0,"778":0,"790":0,"839":0,"841":0};
_yuitest_coverage["build/wikicreole/wikicreole.js"].functions = {"WikiCreole:12":0,"initializer:73":0,"_appendNewLines:83":0,"_convert:104":0,"_handle:129":0,"_handleBreak:187":0,"_handleData:204":0,"_handleElementEnd:222":0,"_handleElementStart:264":0,"_handleEm:318":0,"_handleHeading:331":0,"_handleHr:352":0,"(anonymous 2):380":0,"_handleImage:368":0,"_handleLink:408":0,"_handleListItem:448":0,"_handleOrderedList:472":0,"_handleParagraph:484":0,"_handlePre:500":0,"_handleSpan:525":0,"_handleStrong:539":0,"_handleStyles:558":0,"_handleTableCell:582":0,"_handleTableHeader:594":0,"_handleTableRow:606":0,"_handleTT:622":0,"_handleUnorderedList:638":0,"_hasClass:650":0,"_hasParentNode:664":0,"_isDataAvailable:705":0,"_isIgnorable:716":0,"_isLastItemNewLine:730":0,"_isParentNode:744":0,"_isWhitespace:755":0,"_pushTagList:765":0,"_tagNameMatch:789":0,"(anonymous 1):1":0};
_yuitest_coverage["build/wikicreole/wikicreole.js"].coveredLines = 213;
_yuitest_coverage["build/wikicreole/wikicreole.js"].coveredFunctions = 37;
_yuitest_coverline("build/wikicreole/wikicreole.js", 1);
YUI.add('wikicreole', function (Y, NAME) {

    /**
     * Plugin to convert from HTML to WikiCreole 1.0
     * @class Plugin.WikiCreole
     * @constructor
     * @extends Y.Plugin.Base
     * @module editor
     * @submodule wikicreole
     */

    _yuitest_coverfunc("build/wikicreole/wikicreole.js", "(anonymous 1)", 1);
_yuitest_coverline("build/wikicreole/wikicreole.js", 12);
var WikiCreole = function(config) {
        _yuitest_coverfunc("build/wikicreole/wikicreole.js", "WikiCreole", 12);
_yuitest_coverline("build/wikicreole/wikicreole.js", 13);
WikiCreole.superclass.constructor.apply(this, arguments);
    },

    Lang = Y.Lang,
    UA = Y.UA,

    CSS_ESCAPED = 'escaped',

    NEW_LINE = '\n',

    REGEX_HEADING = /^h([1-6])$/i,

    REGEX_LASTCHAR_NEWLINE = /(\r?\n\s*)$/,

    REGEX_NEWLINE = /\r?\n/g,

    REGEX_NOT_WHITESPACE = /[^\t\n\r ]/,

    REGEX_URL_PREFIX = /^(?:\/|https?|ftp):\/\//i,

    REGEX_ESCAPE_ALT_IMAGE = /(\}\})|(\}$)/g,

    STR_EMPTY = '',

    STR_EQUALS = '=',

    STR_LIST_ITEM_ESCAPE_CHARACTERS = '\\\\',

    STR_PIPE = '|',

    STR_SPACE = ' ',

    STR_TILDE = '~',

    TAG_BOLD = '**',

    TAG_EMPHASIZE = '//',

    TAG_LIST_ITEM = 'li',

    TAG_ORDERED_LIST = 'ol',

    TAG_ORDERED_LIST_ITEM = '#',

    TAG_PARAGRAPH = 'p',

    TAG_PRE = 'pre',

    TAG_TELETYPETEXT = 'tt',

    TAG_UNORDERED_LIST = 'ul',

    TAG_UNORDERED_LIST_ITEM = '*';

    _yuitest_coverline("build/wikicreole/wikicreole.js", 67);
Y.extend(WikiCreole, Y.Plugin.Base, {
        /**
         * Injects "_convert" method to be executed after "getContent" method of the host object.
         * @method initializer
         * @param {Object} config Configuration object with property name/value pairs.
         */
        initializer: function () {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "initializer", 73);
_yuitest_coverline("build/wikicreole/wikicreole.js", 74);
this.afterHostMethod('getContent', this._convert, this);
        },

        /**
         * Appends given number of new line characters to the "_endResult" internal property.
         * @method _appendNewLines
         * @protected
         * @param {Number} total The total number of new line symbols which should be added to the result array.
         */
        _appendNewLines: function (total) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_appendNewLines", 83);
_yuitest_coverline("build/wikicreole/wikicreole.js", 84);
var
                count = 0,
                endResult = this._endResult,
                newLinesAtEnd = REGEX_LASTCHAR_NEWLINE.exec(endResult.slice(-2).join(STR_EMPTY));

            _yuitest_coverline("build/wikicreole/wikicreole.js", 89);
if (newLinesAtEnd) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 90);
count = newLinesAtEnd[1].length;
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 93);
while (count++ < total) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 94);
endResult.push(NEW_LINE);
            }
        },

        /**
         * Converts from HTML to WikiCreole 1.0 code. The function alters the returned result of "getContent" method.
         * @method _convert
         * @protected
         * @return The converted WikiCreole 1.0 code
         */
        _convert: function () {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_convert", 104);
_yuitest_coverline("build/wikicreole/wikicreole.js", 105);
var
                content = Y.Do.originalRetVal,
                node = document.createElement('div'),
                endResult;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 110);
node.innerHTML = content;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 112);
this._handle(node);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 114);
endResult = this._endResult.join(STR_EMPTY);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 116);
this._endResult = null;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 118);
this._listsStack.length = 0;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 120);
return new Y.Do.AlterReturn(null, endResult);
        },

        /**
         * Enumerates the chilren of given node and constructs an array with converted WikiCreole start and end tags.
         * @method _handle
         * @protected
         * @param {HTMLElement} node The element which should be handled
         */
        _handle: function (node) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handle", 129);
_yuitest_coverline("build/wikicreole/wikicreole.js", 130);
var
                child,
                children,
                i,
                length,
                listTagsIn,
                listTagsOut,
                pushTagList,
                stylesTagsIn,
                stylesTagsOut;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 141);
if (!this._endResult) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 142);
this._endResult = [];
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 145);
children = node.childNodes;
            _yuitest_coverline("build/wikicreole/wikicreole.js", 146);
length = children.length;
            _yuitest_coverline("build/wikicreole/wikicreole.js", 147);
pushTagList = this._pushTagList;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 149);
for (i = 0; i < length; i++) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 150);
listTagsIn = [];
                _yuitest_coverline("build/wikicreole/wikicreole.js", 151);
listTagsOut = [];

                _yuitest_coverline("build/wikicreole/wikicreole.js", 153);
stylesTagsIn = [];
                _yuitest_coverline("build/wikicreole/wikicreole.js", 154);
stylesTagsOut = [];

                _yuitest_coverline("build/wikicreole/wikicreole.js", 156);
child = children[i];

                _yuitest_coverline("build/wikicreole/wikicreole.js", 158);
if (this._isIgnorable(child) && !this._skipParse) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 159);
continue;
                }

                _yuitest_coverline("build/wikicreole/wikicreole.js", 162);
this._handleElementStart(child, listTagsIn, listTagsOut);
                _yuitest_coverline("build/wikicreole/wikicreole.js", 163);
this._handleStyles(child, stylesTagsIn, stylesTagsOut);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 165);
pushTagList.call(this, listTagsIn);
                _yuitest_coverline("build/wikicreole/wikicreole.js", 166);
pushTagList.call(this, stylesTagsIn);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 168);
this._handle(child);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 170);
this._handleElementEnd(child, listTagsIn, listTagsOut);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 172);
pushTagList.call(this, stylesTagsOut.reverse());
                _yuitest_coverline("build/wikicreole/wikicreole.js", 173);
pushTagList.call(this, listTagsOut);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 176);
this._handleData(node.data, node);
        },

        /**
         * Handles BR element and converts it to new line symbol.
         * @method _handleBreak
         * @protected
         * @param {HTMLElement} element The BR element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleBreak: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleBreak", 187);
_yuitest_coverline("build/wikicreole/wikicreole.js", 188);
var newLineCharacter = STR_LIST_ITEM_ESCAPE_CHARACTERS;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 190);
if (this._skipParse) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 191);
newLineCharacter = NEW_LINE;
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 194);
listTagsIn.push(newLineCharacter);
        },

        /**
         * Handles the value of the element. Removes all new line characters except when the data should'n be touched (in "pre" or "tt" elements)
         * @method _handleData
         * @protected
         * @param {String} data The data to be examined
         * @param {HTMLElement} element The element which contains the data to be handled
         */
        _handleData: function (data, element) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleData", 204);
_yuitest_coverline("build/wikicreole/wikicreole.js", 205);
if (data) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 206);
if (!this._skipParse) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 207);
data = data.replace(REGEX_NEWLINE, STR_EMPTY);
                }

                _yuitest_coverline("build/wikicreole/wikicreole.js", 210);
this._endResult.push(data);
            }
        },

        /**
         * Processes the end tag of given element.
         * @method _handleElementEnd
         * @protected
         * @param {HTMLElement} element The element which end tag should be processed
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleElementEnd: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleElementEnd", 222);
_yuitest_coverline("build/wikicreole/wikicreole.js", 223);
var tagName = element.tagName;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 225);
if (tagName) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 226);
tagName = tagName.toLowerCase();
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 229);
if (tagName === TAG_PARAGRAPH) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 230);
if (!this._isLastItemNewLine()) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 231);
this._endResult.push(NEW_LINE);
                }
            } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 233);
if (tagName === TAG_UNORDERED_LIST || tagName === TAG_ORDERED_LIST) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 234);
this._listsStack.pop();

                _yuitest_coverline("build/wikicreole/wikicreole.js", 236);
var newLinesCount = 1;

                _yuitest_coverline("build/wikicreole/wikicreole.js", 238);
if (!this._hasParentNode(element, TAG_LIST_ITEM)) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 239);
newLinesCount = 2;
                }

                _yuitest_coverline("build/wikicreole/wikicreole.js", 242);
this._appendNewLines(newLinesCount);
            } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 243);
if (tagName === TAG_PRE) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 244);
if (!this._isLastItemNewLine()) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 245);
this._endResult.push(NEW_LINE);
                }

                _yuitest_coverline("build/wikicreole/wikicreole.js", 248);
this._skipParse = false;
            } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 249);
if (tagName === TAG_TELETYPETEXT) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 250);
this._skipParse = false;
            } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 251);
if (tagName === 'table') {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 252);
listTagsOut.push(NEW_LINE);
            }}}}}
        },

        /**
         * Processes the start tag of given element.
         * @method _handleElementStart
         * @protected
         * @param {HTMLElement} element The element which start tag should be processed
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleElementStart: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleElementStart", 264);
_yuitest_coverline("build/wikicreole/wikicreole.js", 265);
var
                params,
                tagName = element.tagName;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 269);
if (tagName) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 270);
tagName = tagName.toLowerCase();

                _yuitest_coverline("build/wikicreole/wikicreole.js", 272);
if (tagName === TAG_PARAGRAPH) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 273);
this._handleParagraph(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 274);
if (tagName === 'br') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 275);
this._handleBreak(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 276);
if (tagName === 'a') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 277);
this._handleLink(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 278);
if (tagName === 'span') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 279);
this._handleSpan(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 280);
if (tagName === 'strong' || tagName === 'b') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 281);
this._handleStrong(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 282);
if (tagName === 'em' || tagName === 'i') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 283);
this._handleEm(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 284);
if (tagName === 'img') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 285);
this._handleImage(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 286);
if (tagName === TAG_UNORDERED_LIST) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 287);
this._handleUnorderedList(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 288);
if (tagName === TAG_LIST_ITEM) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 289);
this._handleListItem(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 290);
if (tagName === TAG_ORDERED_LIST) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 291);
this._handleOrderedList(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 292);
if (tagName === 'hr') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 293);
this._handleHr(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 294);
if (tagName === TAG_PRE) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 295);
this._handlePre(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 296);
if (tagName === TAG_TELETYPETEXT) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 297);
this._handleTT(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 298);
if ((params = REGEX_HEADING.exec(tagName))) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 299);
this._handleHeading(element, listTagsIn, listTagsOut, params);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 300);
if (tagName === 'th') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 301);
this._handleTableHeader(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 302);
if (tagName === 'tr') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 303);
this._handleTableRow(element, listTagsIn, listTagsOut);
                } else {_yuitest_coverline("build/wikicreole/wikicreole.js", 304);
if (tagName === 'td') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 305);
this._handleTableCell(element, listTagsIn, listTagsOut);
                }}}}}}}}}}}}}}}}}
            }
        },

        /**
         * Handles "EM" or "I" elements and converts them to "//"
         * @method _handleEm
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleEm: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleEm", 318);
_yuitest_coverline("build/wikicreole/wikicreole.js", 319);
listTagsIn.push(TAG_EMPHASIZE);
            _yuitest_coverline("build/wikicreole/wikicreole.js", 320);
listTagsOut.push(TAG_EMPHASIZE);
        },

        /**
         * Handles heading elements and converts them to WikiCreole 1.0 elements
         * @method _handleHeading
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleHeading: function (element, listTagsIn, listTagsOut, params) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleHeading", 331);
_yuitest_coverline("build/wikicreole/wikicreole.js", 332);
var res = new Array(parseInt(params[1], 10) + 1);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 334);
res = res.join(STR_EQUALS);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 336);
if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 337);
listTagsIn.push(NEW_LINE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 340);
listTagsIn.push(res, STR_SPACE);
            _yuitest_coverline("build/wikicreole/wikicreole.js", 341);
listTagsOut.push(STR_SPACE, res, NEW_LINE);
        },

        /**
         * Handles horizontal ruled line elements and converts them to WikiCreole 1.0 elements
         * @method _handleHr
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleHr: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleHr", 352);
_yuitest_coverline("build/wikicreole/wikicreole.js", 353);
if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 354);
listTagsIn.push(NEW_LINE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 357);
listTagsIn.push('----', NEW_LINE);
        },

        /**
         * Handles img elements and converts them to WikiCreole 1.0 elements
         * @method _handleImage
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleImage: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleImage", 368);
_yuitest_coverline("build/wikicreole/wikicreole.js", 369);
var
                attrAlt = element.getAttribute('alt'),
                attrSrc = element.getAttribute('src');

            _yuitest_coverline("build/wikicreole/wikicreole.js", 373);
attrSrc = attrSrc.replace(this.get('ignoreImgPrefix'), STR_EMPTY);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 375);
listTagsIn.push('{{', attrSrc);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 377);
if (attrAlt) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 378);
attrAlt = attrAlt.replace(
                    REGEX_ESCAPE_ALT_IMAGE,
                    function(match, p1, p2, offset, string) {
                        _yuitest_coverfunc("build/wikicreole/wikicreole.js", "(anonymous 2)", 380);
_yuitest_coverline("build/wikicreole/wikicreole.js", 381);
var result;

                        _yuitest_coverline("build/wikicreole/wikicreole.js", 383);
if (p1) {
                            _yuitest_coverline("build/wikicreole/wikicreole.js", 384);
result = '}~}';
                        }
                        else {_yuitest_coverline("build/wikicreole/wikicreole.js", 386);
if (p2) {
                            _yuitest_coverline("build/wikicreole/wikicreole.js", 387);
result = '~}';
                        }}

                        _yuitest_coverline("build/wikicreole/wikicreole.js", 390);
return result;
                    }
                );

                _yuitest_coverline("build/wikicreole/wikicreole.js", 394);
listTagsIn.push(STR_PIPE, attrAlt);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 397);
listTagsOut.push('}}');
        },

        /**
         * Handles link elements and converts them to WikiCreole 1.0 elements
         * @method _handleLink
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleLink: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleLink", 408);
_yuitest_coverline("build/wikicreole/wikicreole.js", 409);
var
                hostPrefix,
                hrefAttribute,
                location,
                protocolHostPathname;

                _yuitest_coverline("build/wikicreole/wikicreole.js", 415);
hrefAttribute = element.getAttribute('href');

            _yuitest_coverline("build/wikicreole/wikicreole.js", 417);
if (UA.ie <= 8) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 418);
location = window.location;

                _yuitest_coverline("build/wikicreole/wikicreole.js", 420);
protocolHostPathname = location.protocol + '//' + location.host + location.pathname;

                _yuitest_coverline("build/wikicreole/wikicreole.js", 422);
protocolHostPathname = protocolHostPathname.substr(0, protocolHostPathname.lastIndexOf('/') + 1);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 424);
hostPrefix = hrefAttribute.indexOf(protocolHostPathname);

                _yuitest_coverline("build/wikicreole/wikicreole.js", 426);
if (hostPrefix === 0) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 427);
hrefAttribute = hrefAttribute.substr(protocolHostPathname.length);
                }
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 431);
if (!REGEX_URL_PREFIX.test(hrefAttribute)) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 432);
hrefAttribute = decodeURIComponent(hrefAttribute);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 435);
listTagsIn.push('[[', hrefAttribute, STR_PIPE);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 437);
listTagsOut.push(']]');
        },

        /**
         * Handles list elements and creates a stack which contains the list element levels.
         * @method _handleListItem
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleListItem: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleListItem", 448);
_yuitest_coverline("build/wikicreole/wikicreole.js", 449);
var
                listsStack,
                listsStackLength;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 453);
if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 454);
listTagsIn.push(NEW_LINE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 457);
listsStack = this._listsStack;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 459);
listsStackLength = listsStack.length;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 461);
listTagsIn.push(new Array(listsStackLength + 1).join(listsStack[listsStackLength - 1]));
        },

        /**
         * Handles ordered list element. Pushes ordered list element to list stack.
         * @method _handleOrderedList
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleOrderedList: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleOrderedList", 472);
_yuitest_coverline("build/wikicreole/wikicreole.js", 473);
this._listsStack.push(TAG_ORDERED_LIST_ITEM);
        },

        /**
         * Handles paragraph element and converts it to WikiCreole 1.0 element.
         * @method _handleParagraph
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleParagraph: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleParagraph", 484);
_yuitest_coverline("build/wikicreole/wikicreole.js", 485);
if (this._isDataAvailable()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 486);
this._appendNewLines(2);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 489);
listTagsOut.push(NEW_LINE);
        },

        /**
         * Handles PRE element and converts it to WikiCreole 1.0.
         * @method _handlePre
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handlePre: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handlePre", 500);
_yuitest_coverline("build/wikicreole/wikicreole.js", 501);
var
                endResult;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 504);
this._skipParse = true;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 506);
endResult = this._endResult;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 508);
if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 509);
endResult.push(NEW_LINE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 512);
listTagsIn.push('{{{', NEW_LINE);

            _yuitest_coverline("build/wikicreole/wikicreole.js", 514);
listTagsOut.push('}}}', NEW_LINE);
        },

        /**
         * Handles SPAN element which contains "escaped" class name and converts it to "~"
         * @method _handleSpan
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleSpan: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleSpan", 525);
_yuitest_coverline("build/wikicreole/wikicreole.js", 526);
if (this._hasClass(element, CSS_ESCAPED)) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 527);
listTagsIn.push(STR_TILDE);
            }
        },

        /**
         * Handles "strong" or "b" elements and converts them to WikiCreole 1.0 elements
         * @method _handleStrong
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleStrong: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleStrong", 539);
_yuitest_coverline("build/wikicreole/wikicreole.js", 540);
if (this._isParentNode(element, TAG_LIST_ITEM) &&
                (!element.previousSibling || this._isIgnorable(element.previousSibling))) {

                _yuitest_coverline("build/wikicreole/wikicreole.js", 543);
listTagsIn.push(STR_SPACE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 546);
listTagsIn.push(TAG_BOLD);
            _yuitest_coverline("build/wikicreole/wikicreole.js", 547);
listTagsOut.push(TAG_BOLD);
        },

        /**
         * Handles element styles. Some browsers do not create special elements for handling bold or italic, they add classes instead
         * @method _handleStyles
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleStyles: function (element, stylesTagsIn, stylesTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleStyles", 558);
_yuitest_coverline("build/wikicreole/wikicreole.js", 559);
var style = element.style;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 561);
if (style) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 562);
if (style.fontWeight.toLowerCase() === 'bold') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 563);
stylesTagsIn.push(TAG_BOLD);
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 564);
stylesTagsOut.push(TAG_BOLD);
                }

                _yuitest_coverline("build/wikicreole/wikicreole.js", 567);
if (style.fontStyle.toLowerCase() === 'italic') {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 568);
stylesTagsIn.push(TAG_EMPHASIZE);
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 569);
stylesTagsOut.push(TAG_EMPHASIZE);
                }
            }
        },

        /**
         * Handles table cell elements and converts them to WikiCreole 1.0 elements
         * @method _handleTableCell
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleTableCell: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleTableCell", 582);
_yuitest_coverline("build/wikicreole/wikicreole.js", 583);
listTagsIn.push(STR_PIPE);
        },

        /**
         * Handles table header elements and converts them to WikiCreole 1.0 elements
         * @method _handleTableHeader
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleTableHeader: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleTableHeader", 594);
_yuitest_coverline("build/wikicreole/wikicreole.js", 595);
listTagsIn.push(STR_PIPE, STR_EQUALS);
        },

        /**
         * Handles table row elements and converts them to WikiCreole 1.0 elements
         * @method _handleTableRow
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleTableRow: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleTableRow", 606);
_yuitest_coverline("build/wikicreole/wikicreole.js", 607);
if (this._isDataAvailable()) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 608);
listTagsIn.push(NEW_LINE);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 611);
listTagsOut.push(STR_PIPE);
        },

        /**
         * Handles teletype elements and converts them to WikiCreole 1.0 elements
         * @method _handleTT
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleTT: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleTT", 622);
_yuitest_coverline("build/wikicreole/wikicreole.js", 623);
this._skipParse = true;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 625);
listTagsIn.push('{{{');

            _yuitest_coverline("build/wikicreole/wikicreole.js", 627);
listTagsOut.push('}}}');
        },

        /**
         * Handles unordered list element and pushes it to the stack with list items.
         * @method _handleUnorderedList
         * @protected
         * @param {HTMLElement} element The element to convert
         * @param {Array} listTagsIn Contains list of tags to be pushed to the end result before handling element's children
         * @param {Array} listTagsOut Contains list of tags to be pushed to the end result after handling element's children
         */
        _handleUnorderedList: function (element, listTagsIn, listTagsOut) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_handleUnorderedList", 638);
_yuitest_coverline("build/wikicreole/wikicreole.js", 639);
this._listsStack.push(TAG_UNORDERED_LIST_ITEM);
        },

        /**
         * Checks for presence of given class name
         * @method _hasClass
         * @protected
         * @param {HTMLElement} element The element to check
         * @param {String} className The class name which should be checked for presence.
         * @return {Boolean} True if the element has the given class name, False otherwise
         */
        _hasClass: function (element, className) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_hasClass", 650);
_yuitest_coverline("build/wikicreole/wikicreole.js", 651);
return (STR_SPACE + element.className + STR_SPACE).indexOf(STR_SPACE + className + STR_SPACE) > -1;
        },

        /**
         * Checks if given element has parent which tagName is present in "tags" param. If "level" is specified,
         * the function will stop checking when it reaches its value.
         * @method _hasParentNode
         * @protected
         * @param {HTMLElement} element The element to check
         * @param {Array|String|RegExp} tags May contain one or more tag names and these tags will be checked for presence. Each item inside this list may be String or Regular Expression.
         * @param {Number} level (optional) If specified, the function will stop checking the parent elements as soon as it reaches the value of this parameter.
         * @return {Boolean} True if any of the parent elements contains any of the tags specified in "tags" param, False otherwise
         */
        _hasParentNode: function (element, tags, level) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_hasParentNode", 664);
_yuitest_coverline("build/wikicreole/wikicreole.js", 665);
var
                i,
                length,
                parentNode,
                result,
                tagName;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 672);
if (!Lang.isArray(tags)) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 673);
tags = [tags];
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 676);
result = false;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 678);
parentNode = element.parentNode;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 680);
tagName = parentNode && parentNode.tagName && parentNode.tagName.toLowerCase();

            _yuitest_coverline("build/wikicreole/wikicreole.js", 682);
if (tagName) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 683);
for (i = 0, length = tags.length; i < length; i++) {
                    _yuitest_coverline("build/wikicreole/wikicreole.js", 684);
result = this._tagNameMatch(tagName, tags[i]);

                    _yuitest_coverline("build/wikicreole/wikicreole.js", 686);
if (result) {
                        _yuitest_coverline("build/wikicreole/wikicreole.js", 687);
break;
                    }
                }
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 692);
if (!result && parentNode && (!isFinite(level) || --level)) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 693);
result = this._hasParentNode(parentNode, tags, level);
            }

            _yuitest_coverline("build/wikicreole/wikicreole.js", 696);
return result;
        },

        /**
         * Checks if the internal _endResult array variable has any elements
         * @method _isDataAvailable
         * @protected
         * @return {Boolean} True if the internal variable _endResult contains any elements, False otherwise
         */
        _isDataAvailable: function () {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_isDataAvailable", 705);
_yuitest_coverline("build/wikicreole/wikicreole.js", 706);
return this._endResult && this._endResult.length;
        },

        /**
         * Checks if the given node can be ignored because contains whitespace, is a comment or text node.
         * @method _isIgnorable
         * @protected
         * @param {HTMLElement} node The node which should be checked.
         * @return {Boolean} True if the node can be ignored.
         */
        _isIgnorable: function (node) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_isIgnorable", 716);
_yuitest_coverline("build/wikicreole/wikicreole.js", 717);
var nodeType = node.nodeType;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 719);
return (node.isElementContentWhitespace || nodeType === 8) ||
                ((nodeType === 3) && this._isWhitespace(node));
        },

        /**
         * Checks if the last item in the internal variable _endResult is a new line character
         * @method _isLastItemNewLine
         * @protected
         * @param {HTMLElement} node The node which should be checked.
         * @return {Boolean} True if the last element in the internal variable _endResult is a new line character, False otherwise
         */
        _isLastItemNewLine: function (node) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_isLastItemNewLine", 730);
_yuitest_coverline("build/wikicreole/wikicreole.js", 731);
var endResult = this._endResult;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 733);
return endResult && REGEX_LASTCHAR_NEWLINE.test(endResult.slice(-1));
        },

        /**
         * Checks if given element has parent which tagName is the value specified in "tagName" param
         * @method _isParentNode
         * @protected
         * @param {HTMLElement} element The element to check
         * @param {String} tagName Contains the tag name which should match the tagName of any of the parents of the checked element.
         * @return {Boolean} True if any of the parent elements of the checked element has tagName specified in "tagName" param, False otherwise
         */
        _isParentNode: function (element, tagName) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_isParentNode", 744);
_yuitest_coverline("build/wikicreole/wikicreole.js", 745);
return this._hasParentNode(element, tagName, 1);
        },

        /**
         * Checks if the given node contains only whitespace
         * @method _isWhitespace
         * @protected
         * @param {HTMLElement} node The node which should be checked.
         * @return {Boolean} True if the node contains only whitespace, False othwerwise.
         */
        _isWhitespace: function (node) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_isWhitespace", 755);
_yuitest_coverline("build/wikicreole/wikicreole.js", 756);
return node.isElementContentWhitespace || !(REGEX_NOT_WHITESPACE.test(node.data));
        },

        /**
         * Pushes Array of tags to the internal _endResult variable.
         * @method _pushTagList
         * @protected
         * @param {Array} tagsList Contains the tags which should be pushed to the result list.
         */
        _pushTagList: function (tagsList) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_pushTagList", 765);
_yuitest_coverline("build/wikicreole/wikicreole.js", 766);
var
                endResult,
                i,
                length,
                tag;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 772);
endResult = this._endResult;
            _yuitest_coverline("build/wikicreole/wikicreole.js", 773);
length = tagsList.length;

            _yuitest_coverline("build/wikicreole/wikicreole.js", 775);
for (i = 0; i < length; i++) {
                _yuitest_coverline("build/wikicreole/wikicreole.js", 776);
tag = tagsList[i];

                _yuitest_coverline("build/wikicreole/wikicreole.js", 778);
endResult.push(tag);
            }
        },

        /**
         * Checks if two tags match. The destination tag may be String or Regular Expression.
         * @method _tagNameMatch
         * @protected
         * @param {String} tagSrc The first tag which should be compared with the second one.
         * @param {String|RegExp} tagDest The second tag which should be compared with the first one. It may be String or Regular Expression.
         */
        _tagNameMatch: function (tagSrc, tagDest) {
            _yuitest_coverfunc("build/wikicreole/wikicreole.js", "_tagNameMatch", 789);
_yuitest_coverline("build/wikicreole/wikicreole.js", 790);
return (tagDest instanceof RegExp && tagDest.test(tagSrc)) || (tagSrc === tagDest);
        },

        /**
         * Array which contains start tags, data and end tags. This Array is joined in order to produce the final WikiCreole 1.0 code.
         * @property {Array} _endResult
         */
        _endResult: null,

        /**
         * Stack which contains the ordered and unordered list elements in the HTML code.
         * @property {Array} _listsStack
         */
        _listsStack: [],

        /**
         * Property which flags when some elements should be converted to WikiCreole 1.0 or not. The elements which are in PRE or TT elements will be not converted.
         * @property {Boolean} _skipParse
         */
        _skipParse: false
    }, {
        
        /**
         * The name of the plugin (wikicreole)
         * @static
         * @property NAME
         */
        NAME: 'wikicreole',

        /**
         * The namespace of the plugin (wikicreole)
         * @static
         * @property NS
         */
        NS: 'wikicreole',

        ATTRS: {
            /**
             * @attribute ignoreImgPrefix
             * @description Part of img path which should be ignored when converting to WikiCreole
             * @type String
             * @default ''
             */
            ignoreImgPrefix: {
                value: STR_EMPTY
            }
        }
    });

    _yuitest_coverline("build/wikicreole/wikicreole.js", 839);
Y.namespace('Plugin');

    _yuitest_coverline("build/wikicreole/wikicreole.js", 841);
Y.Plugin.WikiCreole = WikiCreole;

}, '@VERSION@', {"requires": ["editor-para", "event-custom-base", "plugin"]});
