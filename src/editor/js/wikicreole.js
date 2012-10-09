    /**
     * Plugin to convert from HTML to WikiCreole 1.0
     * @class Plugin.WikiCreole
     * @constructor
     * @extends Y.Plugin.Base
     * @module editor
     * @submodule wikicreole
     */

    var WikiCreole = function(config) {
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

    Y.extend(WikiCreole, Y.Plugin.Base, {
        /**
         * Injects "_convert" method to be executed after "getContent" method of the host object.
         * @method initializer
         * @param {Object} config Configuration object with property name/value pairs.
         */
        initializer: function () {
            this.afterHostMethod('getContent', this._convert, this);
        },

        /**
         * Appends given number of new line characters to the "_endResult" internal property.
         * @method _appendNewLines
         * @protected
         * @param {Number} total The total number of new line symbols which should be added to the result array.
         */
        _appendNewLines: function (total) {
            var
                count = 0,
                endResult = this._endResult,
                newLinesAtEnd = REGEX_LASTCHAR_NEWLINE.exec(endResult.slice(-2).join(STR_EMPTY));

            if (newLinesAtEnd) {
                count = newLinesAtEnd[1].length;
            }

            while (count++ < total) {
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
            var
                content = Y.Do.originalRetVal,
                node = document.createElement('div'),
                endResult;

            node.innerHTML = content;

            this._handle(node);

            endResult = this._endResult.join(STR_EMPTY);

            this._endResult = null;

            this._listsStack.length = 0;

            return new Y.Do.AlterReturn(null, endResult);
        },

        /**
         * Enumerates the chilren of given node and constructs an array with converted WikiCreole start and end tags.
         * @method _handle
         * @protected
         * @param {HTMLElement} node The element which should be handled
         */
        _handle: function (node) {
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

            if (!this._endResult) {
                this._endResult = [];
            }

            children = node.childNodes;
            length = children.length;
            pushTagList = this._pushTagList;

            for (i = 0; i < length; i++) {
                listTagsIn = [];
                listTagsOut = [];

                stylesTagsIn = [];
                stylesTagsOut = [];

                child = children[i];

                if (this._isIgnorable(child) && !this._skipParse) {
                    continue;
                }

                this._handleElementStart(child, listTagsIn, listTagsOut);
                this._handleStyles(child, stylesTagsIn, stylesTagsOut);

                pushTagList.call(this, listTagsIn);
                pushTagList.call(this, stylesTagsIn);

                this._handle(child);

                this._handleElementEnd(child, listTagsIn, listTagsOut);

                pushTagList.call(this, stylesTagsOut.reverse());
                pushTagList.call(this, listTagsOut);
            }

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
            var newLineCharacter = STR_LIST_ITEM_ESCAPE_CHARACTERS;

            if (this._skipParse) {
                newLineCharacter = NEW_LINE;
            }

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
            if (data) {
                if (!this._skipParse) {
                    data = data.replace(REGEX_NEWLINE, STR_EMPTY);
                }

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
            var tagName = element.tagName;

            if (tagName) {
                tagName = tagName.toLowerCase();
            }

            if (tagName === TAG_PARAGRAPH) {
                if (!this._isLastItemNewLine()) {
                    this._endResult.push(NEW_LINE);
                }
            } else if (tagName === TAG_UNORDERED_LIST || tagName === TAG_ORDERED_LIST) {
                this._listsStack.pop();

                var newLinesCount = 1;

                if (!this._hasParentNode(element, TAG_LIST_ITEM)) {
                    newLinesCount = 2;
                }

                this._appendNewLines(newLinesCount);
            } else if (tagName === TAG_PRE) {
                if (!this._isLastItemNewLine()) {
                    this._endResult.push(NEW_LINE);
                }

                this._skipParse = false;
            } else if (tagName === TAG_TELETYPETEXT) {
                this._skipParse = false;
            } else if (tagName === 'table') {
                listTagsOut.push(NEW_LINE);
            }
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
            var
                params,
                tagName = element.tagName;

            if (tagName) {
                tagName = tagName.toLowerCase();

                if (tagName === TAG_PARAGRAPH) {
                    this._handleParagraph(element, listTagsIn, listTagsOut);
                } else if (tagName === 'br') {
                    this._handleBreak(element, listTagsIn, listTagsOut);
                } else if (tagName === 'a') {
                    this._handleLink(element, listTagsIn, listTagsOut);
                } else if (tagName === 'span') {
                    this._handleSpan(element, listTagsIn, listTagsOut);
                } else if (tagName === 'strong' || tagName === 'b') {
                    this._handleStrong(element, listTagsIn, listTagsOut);
                } else if (tagName === 'em' || tagName === 'i') {
                    this._handleEm(element, listTagsIn, listTagsOut);
                } else if (tagName === 'img') {
                    this._handleImage(element, listTagsIn, listTagsOut);
                } else if (tagName === TAG_UNORDERED_LIST) {
                    this._handleUnorderedList(element, listTagsIn, listTagsOut);
                } else if (tagName === TAG_LIST_ITEM) {
                    this._handleListItem(element, listTagsIn, listTagsOut);
                } else if (tagName === TAG_ORDERED_LIST) {
                    this._handleOrderedList(element, listTagsIn, listTagsOut);
                } else if (tagName === 'hr') {
                    this._handleHr(element, listTagsIn, listTagsOut);
                } else if (tagName === TAG_PRE) {
                    this._handlePre(element, listTagsIn, listTagsOut);
                } else if (tagName === TAG_TELETYPETEXT) {
                    this._handleTT(element, listTagsIn, listTagsOut);
                } else if ((params = REGEX_HEADING.exec(tagName))) {
                    this._handleHeading(element, listTagsIn, listTagsOut, params);
                } else if (tagName === 'th') {
                    this._handleTableHeader(element, listTagsIn, listTagsOut);
                } else if (tagName === 'tr') {
                    this._handleTableRow(element, listTagsIn, listTagsOut);
                } else if (tagName === 'td') {
                    this._handleTableCell(element, listTagsIn, listTagsOut);
                }
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
            listTagsIn.push(TAG_EMPHASIZE);
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
            var res = new Array(parseInt(params[1], 10) + 1);

            res = res.join(STR_EQUALS);

            if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                listTagsIn.push(NEW_LINE);
            }

            listTagsIn.push(res, STR_SPACE);
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
            if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                listTagsIn.push(NEW_LINE);
            }

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
            var
                attrAlt = element.getAttribute('alt'),
                attrSrc = element.getAttribute('src');

            attrSrc = attrSrc.replace(this.get('ignoreImgPrefix'), STR_EMPTY);

            listTagsIn.push('{{', attrSrc);

            if (attrAlt) {
                attrAlt = attrAlt.replace(
                    REGEX_ESCAPE_ALT_IMAGE,
                    function(match, p1, p2, offset, string) {
                        var result;

                        if (p1) {
                            result = '}~}';
                        }
                        else if (p2) {
                            result = '~}';
                        }

                        return result;
                    }
                );

                listTagsIn.push(STR_PIPE, attrAlt);
            }

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
            var
                hostPrefix,
                hrefAttribute,
                location,
                protocolHostPathname;

                hrefAttribute = element.getAttribute('href');

            if (UA.ie <= 8) {
                location = window.location;

                protocolHostPathname = location.protocol + '//' + location.host + location.pathname;

                protocolHostPathname = protocolHostPathname.substr(0, protocolHostPathname.lastIndexOf('/') + 1);

                hostPrefix = hrefAttribute.indexOf(protocolHostPathname);

                if (hostPrefix === 0) {
                    hrefAttribute = hrefAttribute.substr(protocolHostPathname.length);
                }
            }

            if (!REGEX_URL_PREFIX.test(hrefAttribute)) {
                hrefAttribute = decodeURIComponent(hrefAttribute);
            }

            listTagsIn.push('[[', hrefAttribute, STR_PIPE);

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
            var
                listsStack,
                listsStackLength;

            if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                listTagsIn.push(NEW_LINE);
            }

            listsStack = this._listsStack;

            listsStackLength = listsStack.length;

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
            if (this._isDataAvailable()) {
                this._appendNewLines(2);
            }

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
            var
                endResult;

            this._skipParse = true;

            endResult = this._endResult;

            if (this._isDataAvailable() && !this._isLastItemNewLine()) {
                endResult.push(NEW_LINE);
            }

            listTagsIn.push('{{{', NEW_LINE);

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
            if (this._hasClass(element, CSS_ESCAPED)) {
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
            if (this._isParentNode(element, TAG_LIST_ITEM) &&
                (!element.previousSibling || this._isIgnorable(element.previousSibling))) {

                listTagsIn.push(STR_SPACE);
            }

            listTagsIn.push(TAG_BOLD);
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
            var style = element.style;

            if (style) {
                if (style.fontWeight.toLowerCase() === 'bold') {
                    stylesTagsIn.push(TAG_BOLD);
                    stylesTagsOut.push(TAG_BOLD);
                }

                if (style.fontStyle.toLowerCase() === 'italic') {
                    stylesTagsIn.push(TAG_EMPHASIZE);
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
            if (this._isDataAvailable()) {
                listTagsIn.push(NEW_LINE);
            }

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
            this._skipParse = true;

            listTagsIn.push('{{{');

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
            var
                i,
                length,
                parentNode,
                result,
                tagName;

            if (!Lang.isArray(tags)) {
                tags = [tags];
            }

            result = false;

            parentNode = element.parentNode;

            tagName = parentNode && parentNode.tagName && parentNode.tagName.toLowerCase();

            if (tagName) {
                for (i = 0, length = tags.length; i < length; i++) {
                    result = this._tagNameMatch(tagName, tags[i]);

                    if (result) {
                        break;
                    }
                }
            }

            if (!result && parentNode && (!isFinite(level) || --level)) {
                result = this._hasParentNode(parentNode, tags, level);
            }

            return result;
        },

        /**
         * Checks if the internal _endResult array variable has any elements
         * @method _isDataAvailable
         * @protected
         * @return {Boolean} True if the internal variable _endResult contains any elements, False otherwise
         */
        _isDataAvailable: function () {
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
            var nodeType = node.nodeType;

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
            var endResult = this._endResult;

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
            return node.isElementContentWhitespace || !(REGEX_NOT_WHITESPACE.test(node.data));
        },

        /**
         * Pushes Array of tags to the internal _endResult variable.
         * @method _pushTagList
         * @protected
         * @param {Array} tagsList Contains the tags which should be pushed to the result list.
         */
        _pushTagList: function (tagsList) {
            var
                endResult,
                i,
                length,
                tag;

            endResult = this._endResult;
            length = tagsList.length;

            for (i = 0; i < length; i++) {
                tag = tagsList[i];

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

    Y.namespace('Plugin');

    Y.Plugin.WikiCreole = WikiCreole;