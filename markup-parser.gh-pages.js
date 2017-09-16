var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("lib/rule/RuleProperty", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // NOTE: must be bitmask compatible (start at 1)
    var RuleProperty;
    (function (RuleProperty) {
        RuleProperty[RuleProperty["None"] = 1] = "None";
        RuleProperty[RuleProperty["Block"] = 2] = "Block";
    })(RuleProperty || (RuleProperty = {}));
    exports.default = RuleProperty;
});
define("lib/token/TokenKind", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // NOTE: must be bitmask compatible (start at 1)
    var TokenKind;
    (function (TokenKind) {
        TokenKind[TokenKind["Default"] = 1] = "Default";
        TokenKind[TokenKind["Opens"] = 2] = "Opens";
        TokenKind[TokenKind["Closes"] = 4] = "Closes";
    })(TokenKind || (TokenKind = {}));
    exports.default = TokenKind;
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
    var Node = /** @class */ (function () {
        function Node(rule, start, end) {
            this.children = [];
            this.parentNode = undefined;
            this.rule = rule;
            this.start = start;
            this.end = end;
        }
        Node.prototype.appendChild = function (node) {
            node.parentNode = this;
            return this.children.push(node);
        };
        Node.prototype.expand = function (string) {
            var tree = this;
            if (!tree.children.length) {
                if (tree.rule) {
                    return tree.rule.display(string.substring(tree.start, tree.end));
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
                    return tree.rule.display(childString);
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
        function Token(start, end, id, kind) {
            if (kind === void 0) { kind = TokenKind_2.default.Default; }
            this.consumed = false;
            this.start = start;
            this.end = end;
            this.id = id;
            this.kind = kind;
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
        Parser.prototype.peek = function (type, tokenKind, tokens) {
            var idx = -1;
            var token;
            for (var i = 0; i < tokens.length; i++) {
                var _a = tokens[i], id = _a.id, kind = _a.kind;
                if (type === id && (kind === tokenKind || kind & tokenKind)) {
                    idx = i;
                    token = tokens[i];
                    break;
                }
            }
            return idx !== -1 ? { idx: idx, token: token } : undefined;
        };
        Parser.prototype.openRules = function (token) {
            return (this.grammar.ruleOpenLookup[+token.id] || [])
                .filter(function (rule) { return rule.openKind & token.kind; });
        };
        Parser.prototype.fallbackNode = function (token) {
            return new Node_1.default(this.fallbackRule, token.start, token.end);
        };
        Parser.prototype.parse = function (tokens, parent) {
            if (parent === void 0) { parent = new Node_1.default(); }
            for (var index = 0; index < tokens.length; index++) {
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
                    if (rule.properties & RuleProperty_1.default.Block) {
                        // block rule
                        var closing = this.peek(rule.close, rule.closesKind, tokens.slice(index + 1));
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
                            var node = new Node_1.default(rule, token.start, closing.token.end);
                            if (rule.occludes) {
                                // occluded tokens create a fallback rule in range
                                tokens
                                    .slice(index + 1, index + 1 + closing.idx)
                                    .forEach(function (token) { return (token.consumed = true); });
                                node.appendChild(new Node_1.default(this.fallbackRule, token.end, closing.token.start));
                            }
                            else {
                                this.parse(tokens.slice(index + 1, index + 1 + closing.idx), node);
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
                    parent.appendChild(this.fallbackNode(token));
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
        Tokenizer.prototype.tokenize = function (string) {
            var _this = this;
            var tokens = [];
            var matchedRanges = [];
            var tokensWithText = [];
            //create list of tokens
            this.matcher.forEach(function (matcher) {
                var match;
                var _loop_1 = function () {
                    var start = match.index;
                    var end = start + match[0].length;
                    // TODO: build lookuptable for already matched
                    /*
                    {
                      2: true
            
                      [4]: look right, look left, look 2 right, look 2 left, ...
                      5: true
                    }
            
                    is 4 matched?
                     */
                    if (string[start - 1] !== _this.escaper) {
                        var rangeAlreadyTokenized = matchedRanges.some(function (_a) {
                            var rangeStart = _a[0], rangeEnd = _a[1];
                            return !(end <= rangeStart || start >= rangeEnd);
                        });
                        if (!rangeAlreadyTokenized) {
                            matchedRanges.push([start, end]);
                            tokens.push([start, end, matcher]);
                        }
                    }
                };
                // go through all matchers and try to regex match
                while ((match = matcher.regex.exec(string)) !== null) {
                    _loop_1();
                }
            });
            var lastEnd = 0;
            tokens
                .sort(function (_a, _b) {
                var startA = _a[0];
                var startB = _b[0];
                return startA - startB;
            })
                .forEach(function (_a, index, tokens) {
                var start = _a[0], end = _a[1], matcher = _a[2];
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
                    var token = [start, end, matcher.id, mergedKinds];
                    tokensWithText.push([lastEnd, start, _this.filler, TokenKind_4.default.Default]);
                    tokensWithText.push(token);
                    lastEnd = end;
                }
            });
            tokensWithText.push([
                lastEnd,
                string.length,
                this.filler,
                TokenKind_4.default.Default
            ]);
            var allTokens = tokensWithText
                .filter(function (_a) {
                var start = _a[0], end = _a[1];
                return start < end;
            })
                .map(function (_a) {
                var start = _a[0], end = _a[1], format = _a[2], kind = _a[3];
                return new Token_1.default(start, end, format, kind);
            });
            allTokens.push(new Token_1.default(string.length, string.length, this.terminator));
            return allTokens;
        };
        return Tokenizer;
    }());
    exports.default = Tokenizer;
});
define("lib/debug/NodeDebugger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function nest(string, node, parentNode) {
        var wrapper = document.createElement('div');
        var content = document.createElement('div');
        if (!node.parentNode) {
            wrapper.classList.add('node--root');
        }
        wrapper.classList.add('node');
        content.className = 'node__content';
        wrapper.appendChild(content);
        if (node.rule) {
            var opens = document.createElement('div');
            opens.className = "node__rule node__rule--open node__rule--" + node.rule.open;
            opens.innerText = "" + node.rule.open;
            content.appendChild(opens);
        }
        if (node.children.length) {
            var children_1 = document.createElement('div');
            children_1.className = 'node__children';
            node.children.forEach(function (childNode) {
                nest(string, childNode, children_1);
            });
            content.appendChild(children_1);
        }
        else {
            // create text
            var text = document.createElement('div');
            text.className = 'node__text';
            text.innerText = string.substring(node.start, node.end);
            content.appendChild(text);
        }
        if (node.rule && node.rule.close >= 0) {
            var closes = document.createElement('div');
            closes.className = "node__rule node__rule--open node__rule--" + node.rule.close;
            closes.innerText = "" + node.rule.close;
            content.appendChild(closes);
        }
        parentNode.appendChild(wrapper);
    }
    var NodeDebugger = /** @class */ (function () {
        function NodeDebugger() {
        }
        NodeDebugger.toHTMLElement = function (string, node, width, height) {
            if (typeof document === "undefined") {
                console.warn("toHTMLElement requires document");
                return;
            }
            var root = document.createElement('div');
            nest(string, node, root);
            return root;
        };
        return NodeDebugger;
    }());
    exports.default = NodeDebugger;
});
define("lib/debug/TokenizerDebugger", ["require", "exports", "lib/token/TokenKind"], function (require, exports, TokenKind_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TokenizerDebugger = /** @class */ (function () {
        function TokenizerDebugger() {
        }
        TokenizerDebugger.toHTMLElement = function (text, tokens) {
            if (typeof document === "undefined") {
                console.warn("toHTMLElement requires document");
                return;
            }
            var p = document.createElement("div");
            p.className = "tokens";
            tokens.forEach(function (token) {
                var tokenDiv = document.createElement("div");
                tokenDiv.className = "token token--" + token.id + " token--kind-" + token.kind;
                var tokenHead = document.createElement("div");
                tokenHead.className = "token__head";
                var tokenKindStrings = [];
                tokenKindStrings.push(token.kind & TokenKind_5.default.Default ? "Default" : undefined);
                tokenKindStrings.push(token.kind & TokenKind_5.default.Opens ? "Opens" : undefined);
                tokenKindStrings.push(token.kind & TokenKind_5.default.Closes ? "Closes" : undefined);
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
define("lib/rule/BlockRule", ["require", "exports", "lib/rule/RuleProperty", "lib/rule/Rule", "lib/token/TokenKind"], function (require, exports, RuleProperty_2, Rule_1, TokenKind_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Rule that wraps its children
     */
    var BlockRule = /** @class */ (function (_super) {
        __extends(BlockRule, _super);
        function BlockRule(open, close, display, kindOpen, kindClosed, occludes) {
            if (kindOpen === void 0) { kindOpen = TokenKind_6.default.Default; }
            if (kindClosed === void 0) { kindClosed = TokenKind_6.default.Default; }
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
            return _super.call(this, open, undefined, RuleProperty_4.default.None, function (text) { return display(text); }) || this;
        }
        return TextRule;
    }(Rule_3.default));
    exports.default = TextRule;
});
define("lib/utils/Conditions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WHITEPSPACE_DELIMITER = /[\n .,+&?!/-]/;
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
    exports.startOfString = function (str, start) {
        return start === 0;
    };
    exports.endOfString = function (str, start, end) { return end === str.length; };
    exports.whitespaceBefore = function (str, start) {
        return WHITEPSPACE_DELIMITER.test(str[start - 1]);
    };
    exports.whitespaceAfter = function (str, start, end) { return WHITEPSPACE_DELIMITER.test(str[end]); };
    exports.whitespaceBeforeOrAfter = exports.or(exports.whitespaceBefore, exports.whitespaceAfter, exports.startOfString, exports.endOfString);
    exports.opens = exports.or(exports.whitespaceBefore, exports.startOfString);
    exports.closes = exports.or(exports.whitespaceAfter, exports.endOfString);
    exports.otherTokenBefore = function (string, start, end, index, tokens) {
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
    exports.otherTokenAfter = function (string, start, end, index, tokens) {
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
var RangeType;
(function (RangeType) {
    RangeType[RangeType["start"] = 0] = "start";
    RangeType[RangeType["end"] = 1] = "end";
})(RangeType || (RangeType = {}));
/*

left smaller
right bigger

    7
  3   4
1 - 2

 */
// class RangeNode {
//   left: RangeNode;
//   right: RangeNode;
//   type: RangeType;
//   value: number;
//
//   insert(number: number, type: RangeType, parent: RangeNode = this) {
//     if (this.left.value > number) {
//        this.insert(number, type, this.left);
//     } else if(this.right.value < number) {
//       this.insert(number, type, this.right);
//     }
//   }
//
//   intersects(start: number, end: number) {
//
//   }
// }
//
// const tree = new RangeNode();
// tree.insert(2, RangeType.start);
// tree.insert(4, RangeType.end);
// tree.insert(6, RangeType.start);
// tree.insert(10, RangeType.end);
//
// if (tree.intersects(3, 7)) {
//
// }
define("markups/IMarkup", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("markups/SlackLike", ["require", "exports", "lib/Tokenizer", "lib/token/TokenMatcher", "lib/Grammar", "lib/rule/TextRule", "lib/rule/BlockRule", "lib/rule/ConstantRule", "lib/Parser", "lib/token/TokenKind", "lib/utils/Conditions"], function (require, exports, Tokenizer_1, TokenMatcher_1, Grammar_1, TextRule_1, BlockRule_1, ConstantRule_1, Parser_1, TokenKind_7, Conditions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Type;
    (function (Type) {
        Type[Type["Nul"] = 0] = "Nul";
        Type[Type["Newline"] = 1] = "Newline";
        Type[Type["Quote"] = 2] = "Quote";
        Type[Type["Escape"] = 3] = "Escape";
        Type[Type["Url"] = 4] = "Url";
        Type[Type["PseudoUrl"] = 5] = "PseudoUrl";
        Type[Type["Email"] = 6] = "Email";
        Type[Type["Preformatted"] = 7] = "Preformatted";
        Type[Type["Text"] = 8] = "Text";
        Type[Type["Bold"] = 9] = "Bold";
        Type[Type["Italics"] = 10] = "Italics";
        Type[Type["Strike"] = 11] = "Strike";
        Type[Type["Code"] = 12] = "Code";
    })(Type = exports.Type || (exports.Type = {}));
    var tokenizer = new Tokenizer_1.default(Type.Text, Type.Nul)
        .add(new TokenMatcher_1.default(/(\n)/g, Type.Newline))
        .add(new TokenMatcher_1.default(/(>)/g, Type.Quote, [
        [Conditions_1.whitespaceBefore, TokenKind_7.default.Default]
    ]))
        .add(new TokenMatcher_1.default(/(\\)/g, Type.Escape))
        .add(new TokenMatcher_1.default(/\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gi, Type.Url))
        .add(new TokenMatcher_1.default(/\bwww\.\S+\b/gi, Type.PseudoUrl))
        .add(new TokenMatcher_1.default(/\b(([\w+\-.]+)@\w+?(?:\.[a-zA-Z]{2,6}))+\b/gi, Type.Email))
        .add(new TokenMatcher_1.default(/\b\S+\.(com|org|de|fr|fi|uk|es|it|nl|br|net|cz|no|pl|ca|se|ru|eu|gov|jp|shop|at|ch|online|biz|io|berlin|info)\S*\b/gi, Type.PseudoUrl))
        .add(new TokenMatcher_1.default(/(\*)/g, Type.Bold, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_7.default.Opens],
        [Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), TokenKind_7.default.Closes]
    ]))
        .add(new TokenMatcher_1.default(/(_)/g, Type.Italics, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_7.default.Opens],
        [Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), TokenKind_7.default.Closes]
    ]))
        .add(new TokenMatcher_1.default(/(~)/g, Type.Strike, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_7.default.Opens],
        [Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), TokenKind_7.default.Closes]
    ]))
        .add(new TokenMatcher_1.default(/(```)/g, Type.Preformatted, [
        [Conditions_1.and(Conditions_1.whitespaceBeforeOrAfter), TokenKind_7.default.Default]
    ]))
        .add(new TokenMatcher_1.default(/(`)/g, Type.Code, [
        [Conditions_1.or(Conditions_1.opens, Conditions_1.otherTokenBefore), TokenKind_7.default.Opens],
        [Conditions_1.or(Conditions_1.closes, Conditions_1.otherTokenAfter), TokenKind_7.default.Closes]
    ]));
    var grammar = new Grammar_1.default()
        .add(new ConstantRule_1.default(Type.Newline, "<br>"))
        .add(new ConstantRule_1.default(Type.Escape, ""))
        .add(new TextRule_1.default(Type.Text, function (text) { return text; }))
        .add(new TextRule_1.default(Type.Url, function (text) {
        return "<a href=\"" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new TextRule_1.default(Type.PseudoUrl, function (text) {
        return "<a href=\"http://" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new TextRule_1.default(Type.Email, function (text) {
        return "<a href=\"mailto:" + text + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + text + "</a>";
    }))
        .add(new BlockRule_1.default(Type.Quote, Type.Newline, function (children) { return "<blockquote>" + children + "</blockquote>"; }))
        .add(new BlockRule_1.default(Type.Quote, Type.Nul, function (children) { return "<blockquote>" + children + "</blockquote>"; }))
        .add(new BlockRule_1.default(Type.Bold, Type.Bold, function (children) { return "<strong>" + children + "</strong>"; }, TokenKind_7.default.Opens, TokenKind_7.default.Closes))
        .add(new BlockRule_1.default(Type.Italics, Type.Italics, function (children) { return "<i>" + children + "</i>"; }, TokenKind_7.default.Opens, TokenKind_7.default.Closes))
        .add(new BlockRule_1.default(Type.Strike, Type.Strike, function (children) {
        return "<strike>" + children + "</strike>";
    }, TokenKind_7.default.Opens, TokenKind_7.default.Closes))
        .add(new BlockRule_1.default(Type.Preformatted, Type.Preformatted, function (children) {
        return "<pre>" + children + "</pre>";
    }, TokenKind_7.default.Default, TokenKind_7.default.Default, true))
        .add(new BlockRule_1.default(Type.Code, Type.Code, function (children) {
        return "<code>" + children + "</code>";
    }, TokenKind_7.default.Opens, TokenKind_7.default.Closes, true));
    var parser = new Parser_1.default(grammar, new TextRule_1.default(Type.Text, function (text) { return text; }));
    var SlackLike = /** @class */ (function () {
        function SlackLike() {
            this.types = Type;
        }
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
    var markups = {
        slacklike: new SlackLike_1.default()
    };
    function handleInput() {
        var exampleType = type.value;
        var exampleValue = input.value;
        var parsed = "";
        var visualizedTokens;
        var visualizedTree;
        if (markups[exampleType]) {
            var markup = markups[exampleType];
            var tokens_1 = markup.tokenize(exampleValue);
            var node = markup.parse(tokens_1);
            visualizedTree = NodeDebugger_1.default.toHTMLElement(exampleValue, node, outputTree.offsetWidth, 500);
            visualizedTokens = TokenizerDebugger_1.default.toHTMLElement(exampleValue, tokens_1);
            parsed = node.expand(exampleValue);
        }
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
    input.oninput = function () { return handleInput(); };
    input.value = "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote";
    handleInput();
    exports.default = true;
});
//# sourceMappingURL=markup-parser.gh-pages.js.map