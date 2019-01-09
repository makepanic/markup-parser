var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("lib/rule/RuleProperty", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RuleProperty;
    (function (RuleProperty) {
        RuleProperty[RuleProperty["None"] = 0] = "None";
        RuleProperty[RuleProperty["Block"] = 1] = "Block";
    })(RuleProperty || (RuleProperty = {}));
    exports.default = RuleProperty;
});
define("lib/token/TokenKind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // NOTE: must be bitmask compatible (start at 1)
    /**
     * Enum that represents the kind of a token.
     * This means a token can be of kind Opens and Closes if Open | Closes is set as its kind
     */
    var TokenKind;
    (function (TokenKind) {
        TokenKind[TokenKind["Default"] = 1] = "Default";
        TokenKind[TokenKind["Opens"] = 2] = "Opens";
        TokenKind[TokenKind["Closes"] = 4] = "Closes";
    })(TokenKind || (TokenKind = {}));
    exports.default = TokenKind;
});
define("lib/token/TokenMeta", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/rule/Rule", ["require", "exports", "lib/token/TokenKind"], function (require, exports, TokenKind_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rule = /** @class */ (function () {
        function Rule(open, close, properties, display, openKind, closesKind, occludes) {
            if (openKind === void 0) { openKind = TokenKind_1.default.Default; }
            if (closesKind === void 0) { closesKind = TokenKind_1.default.Default; }
            if (occludes === void 0) { occludes = false; }
            this.occludes = false;
            this.properties = properties;
            this.display = display;
            this.open = open;
            this.close = close;
            this.openKind = openKind;
            this.closesKind = closesKind;
            this.occludes = occludes;
        }
        return Rule;
    }());
    exports.default = Rule;
});
define("lib/Grammar", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Grammar = /** @class */ (function () {
        function Grammar() {
            this.rules = [];
            this.ruleOpenLookup = {};
        }
        Grammar.prototype.add = function (rule) {
            this.rules.push(rule);
            this.ruleOpenLookup[+rule.open] = this.ruleOpenLookup[+rule.open] || [];
            this.ruleOpenLookup[+rule.open].push(rule);
            return this;
        };
        return Grammar;
    }());
    exports.default = Grammar;
});
define("lib/Node", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Class that represents a formatted node.
     * @class
     */
    var Node = /** @class */ (function () {
        function Node(rule, start, end, occluded, meta) {
            this.occluded = false;
            this.children = [];
            this.parentNode = undefined;
            this.rule = rule;
            this.start = start;
            this.end = end;
            this.occluded = occluded;
            this.meta = meta;
        }
        /**
         * Appends a node to this nodes children.
         * @param {Node<T extends number>} node
         * @return {number}
         */
        Node.prototype.appendChild = function (node) {
            node.parentNode = this;
            return this.children.push(node);
        };
        /**
         * Recursively expands a given string with all of the nodes rules display function.
         * @param {string} string
         * @return {string}
         */
        Node.prototype.expand = function (string) {
            var tree = this;
            if (!tree.children.length) {
                if (tree.rule) {
                    return tree.rule.display(string.substring(tree.start, tree.end), tree.occluded, tree.meta);
                }
                else {
                    return "";
                }
            }
            else {
                var childString = tree.children
                    .map(function (child) { return child.expand(string); })
                    .join("");
                if (tree.rule) {
                    return tree.rule.display(childString, tree.occluded, tree.meta);
                }
                else {
                    return childString;
                }
            }
        };
        return Node;
    }());
    exports.default = Node;
});
define("lib/token/Token", ["require", "exports", "lib/token/TokenKind"], function (require, exports, TokenKind_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Token = /** @class */ (function () {
        function Token(start, end, id, kind, meta) {
            if (kind === void 0) { kind = TokenKind_2.default.Default; }
            this.consumed = false;
            this.start = start;
            this.end = end;
            this.id = id;
            this.kind = kind;
            this.meta = meta;
        }
        return Token;
    }());
    exports.default = Token;
});
define("lib/Parser", ["require", "exports", "lib/rule/RuleProperty", "lib/Node"], function (require, exports, RuleProperty_1, Node_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Parser = /** @class */ (function () {
        function Parser(grammar, fallbackRule) {
            this.grammar = grammar;
            this.fallbackRule = fallbackRule;
        }
        /**
         * Find a token that matches type and kind in a given list of tokens
         * @param {T} type
         * @param {TokenKind} tokenKind
         * @param {Array<Token<T extends number>>} tokens
         * @return {PeekResult<T extends number>}
         */
        Parser.prototype.peek = function (type, tokenKind, tokens, from, until) {
            var idx = -1;
            var token;
            for (var i = from; i < until; i++) {
                var _a = tokens[i], id = _a.id, kind = _a.kind;
                if (type === id && (kind === tokenKind || kind & tokenKind)) {
                    idx = i - from;
                    token = tokens[i];
                    break;
                }
            }
            return idx !== -1 ? { idx: idx, token: token } : undefined;
        };
        /**
         * Method that returns all opening rules for a given token.
         * @param {Token<T extends number>} token
         * @return {Array<Rule<T extends number>>}
         */
        Parser.prototype.openRules = function (token) {
            return (this.grammar.ruleOpenLookup[+token.id] || []).filter(function (rule) { return rule.openKind & token.kind; });
        };
        /**
         * Method that creates a node, using the fallbackRule, based on a given token.
         * @param {Token<T extends number>} token
         * @return {Node<T extends number>}
         */
        Parser.prototype.fallbackNode = function (token) {
            return new Node_1.default(this.fallbackRule, token.start, token.end);
        };
        /**
         * Method that builds a tree out of a list of tokens.
         * @param {Array<Token<T extends number>>} tokens
         * @param {Node<T extends number>} parent
         * @return {Node<T extends number>}
         */
        Parser.prototype.parse = function (tokens, from, until, parent) {
            if (from === void 0) { from = 0; }
            if (until === void 0) { until = tokens.length; }
            if (parent === void 0) { parent = new Node_1.default(); }
            for (var index = from; index < until; index++) {
                var token = tokens[index];
                if (token.consumed) {
                    continue;
                }
                var rules = this.openRules(token);
                for (var ruleIndex = 0; ruleIndex < rules.length; ruleIndex++) {
                    var rule = rules[ruleIndex];
                    if (token.consumed) {
                        continue;
                    }
                    if (rule.properties === RuleProperty_1.default.Block) {
                        // block rule
                        var closing = this.peek(rule.close, rule.closesKind, tokens, index + 1, until);
                        if (closing === undefined) {
                            if (ruleIndex - 1 === rules.length) {
                                // TODO: check if this can be reached with terminator
                                // no closing rule, create text node
                                token.consumed = true;
                                parent.appendChild(this.fallbackNode(token));
                            }
                        }
                        else {
                            // create node from token start to closing end
                            token.consumed = true;
                            closing.token.consumed = true;
                            var node = new Node_1.default(rule, token.start, closing.token.end, false, token.meta);
                            if (rule.occludes) {
                                // occluded tokens create a fallback rule in range
                                tokens
                                    .slice(index + 1, index + 1 + closing.idx)
                                    .forEach(function (token) { return (token.consumed = true); });
                                node.appendChild(new Node_1.default(this.fallbackRule, token.end, closing.token.start, true));
                            }
                            else {
                                this.parse(tokens, index + 1, index + 1 + closing.idx, node);
                            }
                            parent.appendChild(node);
                        }
                    }
                    else {
                        // is tagRule
                        token.consumed = true;
                        var node = new Node_1.default(rule, token.start, token.end);
                        parent.appendChild(node);
                    }
                }
                if (!token.consumed) {
                    token.consumed = true;
                    var previousChild = parent.children[parent.children.length - 1];
                    if (previousChild && previousChild.rule === this.fallbackRule) {
                        // if previous node is fallbackRule, simply extend end to current token end to avoid additional node
                        previousChild.end = token.end;
                    }
                    else {
                        parent.appendChild(this.fallbackNode(token));
                    }
                }
            }
            return parent;
        };
        return Parser;
    }());
    exports.default = Parser;
});
define("lib/token/TokenKindConstraint", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("lib/token/TokenMatcher", ["require", "exports", "lib/token/TokenKind"], function (require, exports, TokenKind_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var returnTrue = function () { return true; };
    var TokenMatcher = /** @class */ (function () {
        function TokenMatcher(regex, id, constraints) {
            if (constraints === void 0) { constraints = [[returnTrue, TokenKind_3.default.Default]]; }
            this.regex = regex;
            this.id = id;
            this.constraints = constraints;
        }
        return TokenMatcher;
    }());
    exports.default = TokenMatcher;
});
define("lib/Tokenizer", ["require", "exports", "lib/token/Token", "lib/token/TokenKind"], function (require, exports, Token_1, TokenKind_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function fillArray(array, from, until) {
        for (var i = from; i < until; i++) {
            array[i] = true;
        }
    }
    function hasHole(array, from, until) {
        for (var i = from; i < until; i++) {
            if (array[i] === true) {
                return false;
            }
        }
        return true;
    }
    /**
     * Class that has the job to turn a given string into a list of tokens.
     * @class
     */
    var Tokenizer = /** @class */ (function () {
        function Tokenizer(filler, terminator, escaper) {
            if (escaper === void 0) { escaper = "\\"; }
            this.escaper = "\\";
            this.matcher = [];
            this.filler = filler;
            this.terminator = terminator;
            this.escaper = escaper;
        }
        Tokenizer.prototype.add = function (tokenMatcher) {
            this.matcher.push(tokenMatcher);
            return this;
        };
        /**
         * Find all match ranges for a given string
         * @param {string} string
         * @param {MatchRange[]} ranges list of already matched ranges
         * @return {MatchRange[]} list of all matched match ranges
         */
        Tokenizer.prototype.findMatchRanges = function (string, ranges) {
            var _this = this;
            if (ranges === void 0) { ranges = []; }
            var matchedRangesBuffer = [];
            //create list of tokens
            this.matcher.forEach(function (matcher) {
                var match;
                // go through all matchers and try to regex match
                while ((match = matcher.regex.exec(string)) !== null) {
                    var start = match.index;
                    var end = start + match[0].length;
                    if (string[start - 1] !== _this.escaper) {
                        if (hasHole(matchedRangesBuffer, start, end)) {
                            fillArray(matchedRangesBuffer, start, end);
                            ranges.push([start, end, matcher]);
                        }
                    }
                }
            });
            matchedRangesBuffer = null;
            return ranges;
        };
        /**
         * Converts a string and a list of match ranges to tokens
         * @param {string} string
         * @param {MatchRange[]} ranges
         * @return {Token[]}
         */
        Tokenizer.prototype.matchTokens = function (string, ranges) {
            var _this = this;
            var tokensWithText = [];
            var lastEnd = 0;
            ranges
                .sort(function (_a, _b) {
                var startA = _a[0];
                var startB = _b[0];
                return startA - startB;
            })
                .forEach(function (_a, index, tokens) {
                var start = _a[0], end = _a[1], matcher = _a[2], meta = _a[3];
                // find matching constraint
                var matchingConstraints = matcher.constraints.filter(function (_a) {
                    var constraint = _a[0];
                    return constraint(string, start, end, index, tokens);
                });
                if (matchingConstraints.length) {
                    var mergedKinds = matchingConstraints.reduce(function (all, _a) {
                        var kind = _a[1];
                        return all | kind;
                    }, TokenKind_4.default.Default);
                    // [n, m, Bold, Closes]
                    var token = [start, end, matcher.id, mergedKinds, meta];
                    tokensWithText.push([lastEnd, start, _this.filler, TokenKind_4.default.Default]);
                    tokensWithText.push(token);
                    lastEnd = end;
                }
            });
            if (lastEnd < string.length) {
                // avoid empty filler if there's nothing left
                tokensWithText.push([
                    lastEnd,
                    string.length,
                    this.filler,
                    TokenKind_4.default.Default
                ]);
            }
            var allTokens = tokensWithText
                .filter(function (_a) {
                var start = _a[0], end = _a[1];
                return start <= end;
            })
                .map(function (_a) {
                var start = _a[0], end = _a[1], format = _a[2], kind = _a[3], meta = _a[4];
                return new Token_1.default(start, end, format, kind, meta);
            });
            allTokens.push(new Token_1.default(string.length, string.length, this.terminator));
            return allTokens;
        };
        /**
         * Method to extract a list of tokens from a given string.
         * This happens by matching each tokenizer matching against the string.
         * @param {string} string
         * @return {Array<Token<T extends number>>}
         */
        Tokenizer.prototype.tokenize = function (string) {
            return this.matchTokens(string, this.findMatchRanges(string));
        };
        return Tokenizer;
    }());
    exports.default = Tokenizer;
});
define("lib/rule/BlockRule", ["require", "exports", "lib/rule/RuleProperty", "lib/rule/Rule", "lib/token/TokenKind"], function (require, exports, RuleProperty_2, Rule_1, TokenKind_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rule that wraps its children
     */
    var BlockRule = /** @class */ (function (_super) {
        __extends(BlockRule, _super);
        function BlockRule(open, close, display, kindOpen, kindClosed, occludes) {
            if (kindOpen === void 0) { kindOpen = TokenKind_5.default.Default; }
            if (kindClosed === void 0) { kindClosed = TokenKind_5.default.Default; }
            if (occludes === void 0) { occludes = false; }
            return _super.call(this, open, close, RuleProperty_2.default.Block, display, kindOpen, kindClosed, occludes) || this;
        }
        return BlockRule;
    }(Rule_1.default));
    exports.default = BlockRule;
});
define("lib/rule/ConstantRule", ["require", "exports", "lib/rule/RuleProperty", "lib/rule/Rule"], function (require, exports, RuleProperty_3, Rule_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rule that returns a constant value
     */
    var ConstantRule = /** @class */ (function (_super) {
        __extends(ConstantRule, _super);
        function ConstantRule(open, display) {
            return _super.call(this, open, undefined, RuleProperty_3.default.None, function () { return display; }) || this;
        }
        return ConstantRule;
    }(Rule_2.default));
    exports.default = ConstantRule;
});
define("lib/rule/TextRule", ["require", "exports", "lib/rule/Rule", "lib/rule/RuleProperty"], function (require, exports, Rule_3, RuleProperty_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rule that runs its content through a transforming function
     */
    var TextRule = /** @class */ (function (_super) {
        __extends(TextRule, _super);
        function TextRule(open, display) {
            return _super.call(this, open, undefined, RuleProperty_4.default.None, display) || this;
        }
        return TextRule;
    }(Rule_3.default));
    exports.default = TextRule;
});
define("lib/utils/Conditions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WHITEPSPACE_DELIMITER = /[\n :.,+&?!/()]/;
    var SPACE_OR_NEWLINE_BEFORE = /^[ \n]+$/;
    exports.and = function () {
        var fns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fns[_i] = arguments[_i];
        }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return fns.every(function (fn) { return fn.apply(void 0, args); });
        };
    };
    exports.or = function () {
        var fns = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            fns[_i] = arguments[_i];
        }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return fns.some(function (fn) { return fn.apply(void 0, args); });
        };
    };
    exports.not = function (fn) { return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return !fn.apply(void 0, args);
    }; };
    exports.startOfString = function (_str, start) {
        return start === 0;
    };
    exports.endOfString = function (str, _start, end) { return end === str.length; };
    exports.whitespaceBefore = function (str, start) {
        return WHITEPSPACE_DELIMITER.test(str[start - 1]);
    };
    exports.whitespaceAfter = function (str, _start, end) { return WHITEPSPACE_DELIMITER.test(str[end]); };
    exports.whitespaceBeforeOrAfter = exports.or(exports.whitespaceBefore, exports.whitespaceAfter, exports.startOfString, exports.endOfString);
    exports.opens = exports.or(exports.whitespaceBefore, exports.startOfString);
    exports.closes = exports.or(exports.whitespaceAfter, exports.endOfString);
    exports.newlineBefore = function (string, _start, _end, index, tokens) {
        var tStart = tokens[index][0];
        var stringBefore;
        if (index - 1 >= 0) {
            // has previous token
            var _a = tokens[index - 1], pTEnd = _a[1], matcher = _a[2];
            // previous token is newline
            if (matcher.id === 1) {
                // either newline end = current start
                return (pTEnd === tStart ||
                    // or string between newline end and current start is whitespace
                    SPACE_OR_NEWLINE_BEFORE.test(string.substring(pTEnd, tStart)));
            }
            stringBefore = string.substring(pTEnd, tStart);
        }
        else {
            stringBefore = string.substring(0, tStart);
        }
        return SPACE_OR_NEWLINE_BEFORE.test(stringBefore);
    };
    exports.otherTokenBefore = function (_string, start, _end, index, tokens) {
        if (index - 1 >= 0) {
            var _a = tokens[index - 1], tEnd = _a[1], prevMatcher = _a[2];
            var _b = tokens[index], currentMatcher = _b[2];
            if (prevMatcher.id !== currentMatcher.id) {
                return start === tEnd;
            }
            return false;
        }
        else {
            return false;
        }
    };
    exports.otherTokenAfter = function (_string, _start, end, index, tokens) {
        if (index + 1 < tokens.length) {
            var _a = tokens[index + 1], tStart = _a[0], nextMatcher = _a[2];
            var _b = tokens[index], currentMatcher = _b[2];
            if (nextMatcher.id !== currentMatcher.id) {
                return end === tStart;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    };
});
define("index", ["require", "exports", "lib/Grammar", "lib/Node", "lib/Parser", "lib/Tokenizer", "lib/rule/BlockRule", "lib/rule/ConstantRule", "lib/rule/Rule", "lib/rule/RuleProperty", "lib/rule/TextRule", "lib/token/Token", "lib/token/TokenKind", "lib/token/TokenMatcher", "lib/utils/Conditions"], function (require, exports, Grammar_1, Node_2, Parser_1, Tokenizer_1, BlockRule_1, ConstantRule_1, Rule_4, RuleProperty_5, TextRule_1, Token_2, TokenKind_6, TokenMatcher_1, Conditions) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Grammar = Grammar_1.default;
    exports.Node = Node_2.default;
    exports.Parser = Parser_1.default;
    exports.Tokenizer = Tokenizer_1.default;
    exports.BlockRule = BlockRule_1.default;
    exports.ConstantRule = ConstantRule_1.default;
    exports.Rule = Rule_4.default;
    exports.RuleProperty = RuleProperty_5.default;
    exports.TextRule = TextRule_1.default;
    exports.Token = Token_2.default;
    exports.TokenKind = TokenKind_6.default;
    exports.TokenMatcher = TokenMatcher_1.default;
    exports.Conditions = Conditions;
});
define("lib/debug/NodeDebugger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function nest(string, node, parentNode) {
        var wrapper = document.createElement("div");
        var content = document.createElement("div");
        if (!node.parentNode) {
            wrapper.classList.add("node--root");
        }
        wrapper.classList.add("node");
        content.className = "node__content";
        wrapper.appendChild(content);
        if (node.rule) {
            var opens = document.createElement("div");
            opens.className = "node__rule node__rule--open node__rule--" + node.rule.open;
            opens.innerText = node.start + "..";
            content.appendChild(opens);
        }
        if (node.children.length) {
            var children_1 = document.createElement("div");
            children_1.className = "node__children";
            node.children.forEach(function (childNode) {
                nest(string, childNode, children_1);
            });
            content.appendChild(children_1);
        }
        else {
            // create text
            var text = document.createElement("div");
            text.className = "node__text";
            text.innerText = string.substring(node.start, node.end);
            content.appendChild(text);
        }
        if (node.rule && node.rule.close >= 0) {
            var closes = document.createElement("div");
            closes.className = "node__rule node__rule--open node__rule--" + node.rule.close;
            closes.innerText = ".." + node.end;
            content.appendChild(closes);
        }
        parentNode.appendChild(wrapper);
    }
    var NodeDebugger = /** @class */ (function () {
        function NodeDebugger() {
        }
        NodeDebugger.toHTMLElement = function (string, node) {
            if (typeof document === "undefined") {
                console.warn("toHTMLElement requires document");
                return undefined;
            }
            var root = document.createElement("div");
            nest(string, node, root);
            return root;
        };
        return NodeDebugger;
    }());
    exports.default = NodeDebugger;
});
define("lib/debug/TokenizerDebugger", ["require", "exports", "lib/token/TokenKind"], function (require, exports, TokenKind_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TokenizerDebugger = /** @class */ (function () {
        function TokenizerDebugger() {
        }
        TokenizerDebugger.toHTMLElement = function (text, tokens) {
            if (typeof document === "undefined") {
                console.warn("toHTMLElement requires document");
                return undefined;
            }
            var p = document.createElement("div");
            p.className = "tokens";
            tokens.forEach(function (token) {
                var tokenDiv = document.createElement("div");
                tokenDiv.className = "token token--" + token.id + " token--kind-" + token.kind;
                var tokenHead = document.createElement("div");
                tokenHead.className = "token__head";
                var tokenKindStrings = [];
                tokenKindStrings.push(token.kind & TokenKind_7.default.Default ? "Default" : undefined);
                tokenKindStrings.push(token.kind & TokenKind_7.default.Opens ? "Opens" : undefined);
                tokenKindStrings.push(token.kind & TokenKind_7.default.Closes ? "Closes" : undefined);
                tokenHead.innerText = token.id + " " + tokenKindStrings
                    .filter(Boolean)
                    .join("|") + " (" + token.start + ".." + token.end + ")";
                tokenDiv.appendChild(tokenHead);
                var tokenText = document.createElement("div");
                tokenText.className = "token__text";
                tokenText.innerHTML = text.substring(token.start, token.end) + "&nbsp;";
                tokenDiv.appendChild(tokenText);
                p.appendChild(tokenDiv);
            });
            return p;
        };
        return TokenizerDebugger;
    }());
    exports.default = TokenizerDebugger;
});
define("markups/IMarkup", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("markups/SlackLike", ["require", "exports", "lib/Tokenizer", "lib/token/TokenMatcher", "lib/Grammar", "lib/rule/TextRule", "lib/rule/BlockRule", "lib/rule/ConstantRule", "lib/Parser", "lib/token/TokenKind", "lib/utils/Conditions"], function (require, exports, Tokenizer_2, TokenMatcher_2, Grammar_2, TextRule_2, BlockRule_2, ConstantRule_2, Parser_2, TokenKind_8, Conditions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Type = {
        Nul: 0,
        Newline: 1,
        Quote: 2,
        Escape: 3,
        Url: 4,
        PseudoUrl: 5,
        Email: 6,
        Preformatted: 7,
        Text: 8,
        Bold: 9,
        Italics: 10,
        Strike: 11,
        Code: 12,
        Highlight: 13,
        User: 14
    };
    var tokenizer = new Tokenizer_2.default(exports.Type.Text, exports.Type.Nul)
        .add(new TokenMatcher_2.default(/(\n)/g, exports.Type.Newline))
        .add(new TokenMatcher_2.default(/(>)/g, exports.Type.Quote, [
        [
            Conditions_1.and(Conditions_1.or(Conditions_1.startOfString, Conditions_1.newlineBefore), Conditions_1.whitespaceAfter),
            TokenKind_8.default.Default
        ]
    ]))
        .add(new TokenMatcher_2.default(/(\\)/g, exports.Type.Escape))
        .add(new TokenMatcher_2.default(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi, exports.Type.Url))
        .add(new TokenMatcher_2.default(/\bwww\.\S+\b/gi, exports.Type.PseudoUrl))
        .add(new TokenMatcher_2.default(/\b(([\w+\-.]+)@\w+?(?:\.[a-zA-Z]{2,6}))+\b/gi, exports.Type.Email))
        .add(new TokenMatcher_2.default(/\b\S+\.(com|org|de|fr|fi|uk|es|it|nl|br|net|cz|no|pl|ca|se|ru|eu|gov|jp|shop|at|ch|online|biz|io|berlin|info)(\/[a-z0-9-+&@#\/%=~_|]*)*\b/gi, exports.Type.PseudoUrl))
        .add(new TokenMatcher_2.default(/(\*)/g, exports.Type.Bold, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_8.default.Opens],
        [Conditions_1.and(Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), Conditions_1.not(Conditions_1.newlineBefore)), TokenKind_8.default.Closes]
    ]))
        .add(new TokenMatcher_2.default(/(_)/g, exports.Type.Italics, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_8.default.Opens],
        [Conditions_1.and(Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), Conditions_1.not(Conditions_1.newlineBefore)), TokenKind_8.default.Closes]
    ]))
        .add(new TokenMatcher_2.default(/(~)/g, exports.Type.Strike, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_8.default.Opens],
        [Conditions_1.and(Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), Conditions_1.not(Conditions_1.newlineBefore)), TokenKind_8.default.Closes]
    ]))
        .add(new TokenMatcher_2.default(/(```)/g, exports.Type.Preformatted, [
        [Conditions_1.and(Conditions_1.whitespaceBeforeOrAfter), TokenKind_8.default.Default]
    ]))
        .add(new TokenMatcher_2.default(/(`)/g, exports.Type.Code, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_8.default.Opens],
        [Conditions_1.and(Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), Conditions_1.not(Conditions_1.newlineBefore)), TokenKind_8.default.Closes]
    ]));
    var grammar = new Grammar_2.default()
        .add(new ConstantRule_2.default(exports.Type.Newline, "<br>"))
        .add(new ConstantRule_2.default(exports.Type.Escape, ""))
        .add(new TextRule_2.default(exports.Type.Url, function (text) {
        return "<a href=\"" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new TextRule_2.default(exports.Type.PseudoUrl, function (text) {
        return "<a href=\"http://" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new TextRule_2.default(exports.Type.Email, function (text) {
        return "<a href=\"mailto:" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new BlockRule_2.default(exports.Type.Quote, exports.Type.Newline, function (children) { return "<blockquote>" + children + "</blockquote>"; }))
        .add(new BlockRule_2.default(exports.Type.Highlight, exports.Type.Highlight, function (children) { return "<em>" + children + "</em>"; }, TokenKind_8.default.Opens, TokenKind_8.default.Closes))
        .add(new BlockRule_2.default(exports.Type.User, exports.Type.User, function (children, _occluded, meta) {
        return meta && meta.user
            ? "<span data-user=\"" + meta.user + "\">" + children + "</span>"
            : children;
    }, TokenKind_8.default.Opens, TokenKind_8.default.Closes))
        .add(new BlockRule_2.default(exports.Type.Quote, exports.Type.Nul, function (children) { return "<blockquote>" + children + "</blockquote>"; }))
        .add(new BlockRule_2.default(exports.Type.Bold, exports.Type.Bold, function (children) { return "<strong>" + children + "</strong>"; }, TokenKind_8.default.Opens, TokenKind_8.default.Closes))
        .add(new BlockRule_2.default(exports.Type.Italics, exports.Type.Italics, function (children) { return "<i>" + children + "</i>"; }, TokenKind_8.default.Opens, TokenKind_8.default.Closes))
        .add(new BlockRule_2.default(exports.Type.Strike, exports.Type.Strike, function (children) {
        return "<strike>" + children + "</strike>";
    }, TokenKind_8.default.Opens, TokenKind_8.default.Closes))
        .add(new BlockRule_2.default(exports.Type.Preformatted, exports.Type.Preformatted, function (children) {
        return "<pre>" + children + "</pre>";
    }, TokenKind_8.default.Default, TokenKind_8.default.Default, true))
        .add(new BlockRule_2.default(exports.Type.Code, exports.Type.Code, function (children) {
        return "<code>" + children + "</code>";
    }, TokenKind_8.default.Opens, TokenKind_8.default.Closes, true));
    var parser = new Parser_2.default(grammar, new TextRule_2.default(exports.Type.Text, function (text) { return text; }));
    var SlackLike = /** @class */ (function () {
        function SlackLike() {
            this.types = exports.Type;
        }
        SlackLike.prototype.findMatchRanges = function (string, ranges) {
            if (ranges === void 0) { ranges = []; }
            return tokenizer.findMatchRanges(string, ranges);
        };
        SlackLike.prototype.matchTokens = function (string, ranges) {
            return tokenizer.matchTokens(string, ranges);
        };
        SlackLike.prototype.tokenize = function (input) {
            return tokenizer.tokenize(input);
        };
        SlackLike.prototype.parse = function (tokens) {
            return parser.parse(tokens);
        };
        SlackLike.prototype.format = function (input) {
            return this.parse(this.tokenize(input)).expand(input);
        };
        return SlackLike;
    }());
    exports.default = SlackLike;
});
define("example", ["require", "exports", "markups/SlackLike", "lib/debug/TokenizerDebugger", "lib/debug/NodeDebugger"], function (require, exports, SlackLike_1, TokenizerDebugger_1, NodeDebugger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var input = document.querySelector("#example-input");
    var type = document.querySelector("#example-type");
    var output = document.querySelector("#output");
    var outputHTML = document.querySelector("#output-html");
    var outputTree = document.querySelector("#output-tree");
    var tokens = document.querySelector("#tokens");
    var visualize = document.querySelector('#visualize-input');
    var markups = {
        slacklike: new SlackLike_1.default()
    };
    function handleInput() {
        var exampleType = type.value;
        var exampleValue = input.value;
        var shouldVisualize = visualize.checked;
        var parsed = "";
        var visualizedTokens;
        var visualizedTree;
        if (markups[exampleType]) {
            var markup = markups[exampleType];
            var tokens_1 = markup.tokenize(exampleValue);
            var node = markup.parse(tokens_1);
            if (shouldVisualize) {
                visualizedTree = NodeDebugger_1.default.toHTMLElement(exampleValue, node);
                visualizedTokens = TokenizerDebugger_1.default.toHTMLElement(exampleValue, tokens_1);
            }
            parsed = node.expand(exampleValue);
        }
        if (shouldVisualize) {
            output.innerHTML = parsed;
            outputHTML.innerText = parsed;
            if (visualizedTokens) {
                tokens.innerHTML = "";
                tokens.appendChild(visualizedTokens);
            }
            if (visualizedTree) {
                outputTree.innerHTML = '';
                outputTree.appendChild(visualizedTree);
            }
        }
    }
    input.oninput = function () { return handleInput(); };
    input.value = "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote";
    handleInput();
    exports.default = true;
});
