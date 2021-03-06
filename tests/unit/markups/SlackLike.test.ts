// @ts-ignore
import Surku = require("surku");
import test from "ava";
import SlackLike, { Type } from "../../../markups/SlackLike";
import TokenMatcher from "../../../lib/token/TokenMatcher";
import TokenKind from "../../../lib/token/TokenKind";
import { MatchRange } from "../../../lib/Tokenizer";

const expectations = [
  ["> foo", "<blockquote> foo</blockquote>"],
  [
    "https://bbla.com/_hey_.pdf",
    '<a href="https://bbla.com/_hey_.pdf" target="_blank" rel="noopener noreferrer">https://bbla.com/_hey_.pdf</a>'
  ],
  [
    "test https://www.google.com/myAccountUpperCase/foo test",
    'test <a href="https://www.google.com/myAccountUpperCase/foo" target="_blank" rel="noopener noreferrer">https://www.google.com/myAccountUpperCase/foo</a> test'
  ],
  [
    "test user@goOgle.com test",
    'test <a href="mailto:user@goOgle.com" target="_blank" rel="noopener noreferrer">user@goOgle.com</a> test'
  ],
  ["a \\*a* a *a* a*", "a *a* a <strong>a</strong> a*"],
  [
    `
    > quote
    *bold*
    _italics_
    ~strike~
    \`code\`
    \`\`\`preformatted\`\`\`
  `,
    `<br>    <blockquote> quote</blockquote>    <strong>bold</strong><br>    <i>italics</i><br>    <strike>strike</strike><br>    <code>code</code><br>    <pre>preformatted</pre><br>  `
  ],
  [
    `
    > quote
    *bold*
    _italics_
    ~asdf~
    \`code asd asd\`
    \`\`\`
    var f = 2;
    \`\`\`
  `,
    `<br>    <blockquote> quote</blockquote>    <strong>bold</strong><br>    <i>italics</i><br>    <strike>asdf</strike><br>    <code>code asd asd</code><br>    <pre>
    var f = 2;
    </pre><br>  `
  ],
  [
    "wasd *wasd*,wasd\nwasd *wasd*!wasd\nwasd ,*wasd* wasd",
    "wasd <strong>wasd</strong>,wasd<br>wasd <strong>wasd</strong>!wasd<br>wasd ,<strong>wasd</strong> wasd"
  ],
  [
    "a *a* *a* a *a* a *a* a",
    "a <strong>a</strong> <strong>a</strong> a <strong>a</strong> a <strong>a</strong> a"
  ],
  ["a *a _a a a ~a* a", "a <strong>a _a a a ~a</strong> a"],
  [
    "a https://xkcd.com/ a",
    'a <a href="https://xkcd.com/" target="_blank" rel="noopener noreferrer">https://xkcd.com/</a> a'
  ],
  [
    "a https://xkcd.com/about/ a",
    'a <a href="https://xkcd.com/about/" target="_blank" rel="noopener noreferrer">https://xkcd.com/about/</a> a'
  ],
  [
    "a www.xkcd.com a",
    'a <a href="http://www.xkcd.com" target="_blank" rel="noopener noreferrer">www.xkcd.com</a> a'
  ],
  [
    "a www.xkcd.com/about a",
    'a <a href="http://www.xkcd.com/about" target="_blank" rel="noopener noreferrer">www.xkcd.com/about</a> a'
  ],
  [
    "a xkcd.com a",
    'a <a href="http://xkcd.com" target="_blank" rel="noopener noreferrer">xkcd.com</a> a'
  ],
  [
    "a xkcd.com/about a",
    'a <a href="http://xkcd.com/about" target="_blank" rel="noopener noreferrer">xkcd.com/about</a> a'
  ],
  [
    "a test_foo+spamblock@mail.de a",
    'a <a href="mailto:test_foo+spamblock@mail.de" target="_blank" rel="noopener noreferrer">test_foo+spamblock@mail.de</a> a'
  ],
  ["a *a _a a_ _a ~a* a", "a <strong>a <i>a a</i> _a ~a</strong> a"],
  [
    "wasd \\*wasd\\*, \\_wasd\\_\nwasd \\*wasd\\*!wasd\nwasd ,\\*wasd\\* wasd",
    "wasd *wasd*, _wasd_<br>wasd *wasd*!wasd<br>wasd ,*wasd* wasd"
  ],
  ["_test_", "<i>test</i>"],
  ["\n_test_", "<br><i>test</i>"],
  ["100_000_000", "100_000_000"],
  [
    "you have to type \\\\format to escape something",
    "you have to type \\format to escape something"
  ],
  ["~~~~~a~~~~~", "<strike>~~~~a~~~~</strike>"],
  ["__a__", "<i>_a_</i>"],
  ["___a___", "<i>__a__</i>"],
  ["``` const f = 2 *2* 3 ```", "<pre> const f = 2 *2* 3 </pre>"],
  [
    "a `@foo ||= bar` `foo = bar` a `|` `a|a` `a|` `|a` ` |a`",
    "a <code>@foo ||= bar</code> <code>foo = bar</code> a <code>|</code> <code>a|a</code> <code>a|</code> <code>|a</code> <code> |a</code>"
  ],
  [
    `
> lolwut
wasdf
`,
    "<br><blockquote> lolwut</blockquote>wasdf<br>"
  ],
  [
    `
> lolwut`,
    "<br><blockquote> lolwut</blockquote>"
  ],
  [
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius auctor eros, ac congue enim lacinia egestas. Nam gravida sem velit, sit amet eleifend dolor venenatis at. Aenean ut pellentesque ex, sed egestas neque. Sed ut ultrices ex, et maximus nunc. Fusce sed metus massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum non lacinia nisi, ut facilisis nisl. Praesent posuere massa ac dui vehicula condimentum. Donec ornare urna vel mattis ullamcorper. Morbi ex massa, dapibus sed ullamcorper at, luctus id nibh. Donec lobortis nunc sed convallis facilisis. Mauris vel tempor ipsum. Aenean interdum ullamcorper sapien, nec sollicitudin dui congue a.

Mauris ac ex pulvinar augue commodo laoreet. Maecenas laoreet diam lorem, sed placerat mauris euismod id. Vestibulum sed vehicula mauris. Proin elit ipsum, accumsan ac sagittis vel, imperdiet eget risus. Praesent ornare maximus nisl at varius. Morbi mi erat, convallis ut augue a, iaculis facilisis massa. Duis ultrices nibh imperdiet turpis blandit ornare. Vivamus ut leo ac purus iaculis convallis sit amet a sem. Vivamus vestibulum, nulla non efficitur fringilla, nibh lorem interdum tellus, volutpat dapibus eros mi porta neque. Morbi ultrices ac turpis interdum elementum. Integer commodo justo id hendrerit convallis. Curabitur efficitur aliquam pellentesque. Sed sed ex sit amet nisi rutrum malesuada. Vestibulum eget leo risus.

Nulla eu pharetra ipsum. Nullam non mollis neque. Mauris eu elit ullamcorper, accumsan nulla sed, vulputate neque. Integer faucibus nibh vel aliquam condimentum. Pellentesque eget urna justo. Nulla consectetur lectus rhoncus odio tempor fermentum. Nam luctus, lacus sit amet pulvinar mollis, purus sapien maximus lorem, vestibulum iaculis quam odio sit amet justo. Nam mollis nisi in luctus porta. Curabitur et massa nec ligula cursus pulvinar. Quisque et velit vehicula, tincidunt sem at, rhoncus nunc. Suspendisse commodo erat vitae ante consequat efficitur. Praesent ullamcorper nulla a nunc vulputate elementum. Quisque dui leo, accumsan eget risus nec, imperdiet tincidunt lorem. In accumsan massa nec augue egestas, at consequat augue accumsan.

Morbi cursus ante condimentum accumsan tempus. Aenean dapibus tellus ac sapien porta, non mollis est laoreet. Sed maximus nisl eu mi sollicitudin ultrices. Donec aliquam lorem eu dolor convallis ullamcorper. Nullam eu laoreet felis, at blandit nisi. In purus nisl, tincidunt in vehicula in, ultrices quis massa. Nulla non euismod nibh. Suspendisse facilisis malesuada diam, sit amet finibus lacus feugiat vel. Aliquam iaculis et ex in viverra. Etiam tincidunt, enim non ullamcorper fringilla, enim est varius justo, non viverra metus dolor cursus justo. Sed sit amet metus id neque efficitur convallis. Etiam ultrices, nulla vel pulvinar porta, augue mi pellentesque sem, id faucibus enim risus eu augue. Vivamus risus justo, tristique in rutrum sollicitudin, aliquam et metus. Nulla augue quam, interdum quis nulla ut, finibus ullamcorper turpis.

Mauris ipsum felis, gravida eget sodales viverra, sodales congue erat. Duis nec arcu nec nibh rhoncus dignissim a vel sapien. In consequat diam ut eleifend pellentesque. Sed pharetra dolor nibh, sit amet venenatis magna auctor ut. Aenean quis lacus iaculis, mattis nunc nec, consectetur nunc. Proin feugiat purus quis ultricies imperdiet. Nam nec nisi felis. Aliquam a nulla rhoncus elit placerat maximus et non quam. Suspendisse mattis erat id dolor tempor posuere a in neque. Ut ultricies sapien non malesuada rhoncus. Proin sit amet turpis vitae sem blandit dapibus. Sed hendrerit, lorem tempor aliquet consequat, felis leo iaculis eros, nec tincidunt lectus augue vel dui.`,
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius auctor eros, ac congue enim lacinia egestas. Nam gravida sem velit, sit amet eleifend dolor venenatis at. Aenean ut pellentesque ex, sed egestas neque. Sed ut ultrices ex, et maximus nunc. Fusce sed metus massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum non lacinia nisi, ut facilisis nisl. Praesent posuere massa ac dui vehicula condimentum. Donec ornare urna vel mattis ullamcorper. Morbi ex massa, dapibus sed ullamcorper at, luctus id nibh. Donec lobortis nunc sed convallis facilisis. Mauris vel tempor ipsum. Aenean interdum ullamcorper sapien, nec sollicitudin dui congue a.<br><br>Mauris ac ex pulvinar augue commodo laoreet. Maecenas laoreet diam lorem, sed placerat mauris euismod id. Vestibulum sed vehicula mauris. Proin elit ipsum, accumsan ac sagittis vel, imperdiet eget risus. Praesent ornare maximus nisl at varius. Morbi mi erat, convallis ut augue a, iaculis facilisis massa. Duis ultrices nibh imperdiet turpis blandit ornare. Vivamus ut leo ac purus iaculis convallis sit amet a sem. Vivamus vestibulum, nulla non efficitur fringilla, nibh lorem interdum tellus, volutpat dapibus eros mi porta neque. Morbi ultrices ac turpis interdum elementum. Integer commodo justo id hendrerit convallis. Curabitur efficitur aliquam pellentesque. Sed sed ex sit amet nisi rutrum malesuada. Vestibulum eget leo risus.<br><br>Nulla eu pharetra ipsum. Nullam non mollis neque. Mauris eu elit ullamcorper, accumsan nulla sed, vulputate neque. Integer faucibus nibh vel aliquam condimentum. Pellentesque eget urna justo. Nulla consectetur lectus rhoncus odio tempor fermentum. Nam luctus, lacus sit amet pulvinar mollis, purus sapien maximus lorem, vestibulum iaculis quam odio sit amet justo. Nam mollis nisi in luctus porta. Curabitur et massa nec ligula cursus pulvinar. Quisque et velit vehicula, tincidunt sem at, rhoncus nunc. Suspendisse commodo erat vitae ante consequat efficitur. Praesent ullamcorper nulla a nunc vulputate elementum. Quisque dui leo, accumsan eget risus nec, imperdiet tincidunt lorem. In accumsan massa nec augue egestas, at consequat augue accumsan.<br><br>Morbi cursus ante condimentum accumsan tempus. Aenean dapibus tellus ac sapien porta, non mollis est laoreet. Sed maximus nisl eu mi sollicitudin ultrices. Donec aliquam lorem eu dolor convallis ullamcorper. Nullam eu laoreet felis, at blandit nisi. In purus nisl, tincidunt in vehicula in, ultrices quis massa. Nulla non euismod nibh. Suspendisse facilisis malesuada diam, sit amet finibus lacus feugiat vel. Aliquam iaculis et ex in viverra. Etiam tincidunt, enim non ullamcorper fringilla, enim est varius justo, non viverra metus dolor cursus justo. Sed sit amet metus id neque efficitur convallis. Etiam ultrices, nulla vel pulvinar porta, augue mi pellentesque sem, id faucibus enim risus eu augue. Vivamus risus justo, tristique in rutrum sollicitudin, aliquam et metus. Nulla augue quam, interdum quis nulla ut, finibus ullamcorper turpis.<br><br>Mauris ipsum felis, gravida eget sodales viverra, sodales congue erat. Duis nec arcu nec nibh rhoncus dignissim a vel sapien. In consequat diam ut eleifend pellentesque. Sed pharetra dolor nibh, sit amet venenatis magna auctor ut. Aenean quis lacus iaculis, mattis nunc nec, consectetur nunc. Proin feugiat purus quis ultricies imperdiet. Nam nec nisi felis. Aliquam a nulla rhoncus elit placerat maximus et non quam. Suspendisse mattis erat id dolor tempor posuere a in neque. Ut ultricies sapien non malesuada rhoncus. Proin sit amet turpis vitae sem blandit dapibus. Sed hendrerit, lorem tempor aliquet consequat, felis leo iaculis eros, nec tincidunt lectus augue vel dui.`
  ],
  ["foo *bar _baz_* foo", "foo <strong>bar <i>baz</i></strong> foo"],
  [
    "~test from phone~_1 w rt,_ *yay* €*",
    "<strike>test from phone</strike><i>1 w rt,</i> <strong>yay</strong> €*"
  ],
  [
    "test from phone_1 w rt,_ *yay* ~€~",
    "test from phone_1 w rt,_ <strong>yay</strong> <strike>€</strike>"
  ],
  ["… <em>test</em> …", "… <em>test</em> …"],
  ["hi peter.jpg wat", "hi peter.jpg wat"],
  [
    "hi peter.jp wat",
    'hi <a href="http://peter.jp" target="_blank" rel="noopener noreferrer">peter.jp</a> wat'
  ],
  ["x -> x + 2", "x -> x + 2"],
  [
    "btw regarding the user type refactoring (`ANONYM` -> `CUSTOMER`) ... what about naming the 'system' user not `SYSTEM` but `BOT`? that's what those users actually are?",
    "btw regarding the user type refactoring (<code>ANONYM</code> -> <code>CUSTOMER</code>) ... what about naming the 'system' user not <code>SYSTEM</code> but <code>BOT</code>? that's what those users actually are?"
  ],
  ["test >1) bla", "test >1) bla"],
  [
    "there's a test in `EventsTest`: `fooBar()` which is run as admin",
    "there's a test in <code>EventsTest</code>: <code>fooBar()</code> which is run as admin"
  ],
  ["2 > 1", "2 > 1"],
  [
    "Do you want to know the truth?\n3 > 4\nfight me irl",
    "Do you want to know the truth?<br>3 > 4<br>fight me irl"
  ],
  [
    "* `upsert` is prone...\n* `getByCreator` ...",
    "* <code>upsert</code> is prone...<br>* <code>getByCreator</code> ..."
  ],
  [
    "_ `upsert` is prone...\n_ `getByCreator` ...",
    "_ <code>upsert</code> is prone...<br>_ <code>getByCreator</code> ..."
  ],
  [
    "~ `upsert` is prone...\n~ `getByCreator` ...",
    "~ <code>upsert</code> is prone...<br>~ <code>getByCreator</code> ..."
  ],
  [
    "` _upsert_ is prone...\n` _getByCreator_ ...",
    "` <i>upsert</i> is prone...<br>` <i>getByCreator</i> ..."
  ],
  ["**", "**"],
  ["__", "__"],
  ["~~", "~~"],
  ["``", "``"],
  ["~1 text ~1", "~1 text ~1"],
  [
    "some user (some.user@my-cool-mail.com) is cool",
    'some user (<a href="http://some.user@my-cool-mail.com" target="_blank" rel="noopener noreferrer">some.user@my-cool-mail.com</a>) is cool'
  ],
  ["```code``` > quote", "<pre>code</pre> > quote"],
  ["foo bar..com baz", "foo bar..com baz"],
  ["*hey \ncool*", "*hey <br>cool*"],
  ["* `/)\\b/gi`\n", "* <code>/)\\b/gi</code><br>"]
];

const markup = new SlackLike();

expectations.forEach(([input, expected]) => {
  test(input, t => {
    t.is(markup.format(input), expected);
  });
});

test("tokenMeta", function(t) {
  const openingMatcher = new TokenMatcher(undefined, Type.User, [
    [() => true, TokenKind.Opens]
  ]);
  const closingMatcher = new TokenMatcher(undefined, Type.User, [
    [() => true, TokenKind.Closes]
  ]);

  const text =
    "Hi @Hunter Two please read the rules and report to @Azure Diamond";
  const metaTokens: MatchRange[] = [
    [3, 14, openingMatcher, { user: "0x1" }],
    [3, 14, closingMatcher],
    [51, 65, openingMatcher, { user: "0x2" }],
    [51, 65, closingMatcher]
  ];

  const matchRanges = markup.findMatchRanges(text, metaTokens);
  const tokens = markup.matchTokens(text, matchRanges);
  const parsed = markup.parse(tokens).expand(text);

  t.is(
    parsed,
    'Hi <span data-user="0x1">@Hunter Two</span> please read the rules and report to <span data-user="0x2">@Azure Diamond</span>'
  );
});

test("fuzzer", t => {
  const newGenerator = new Surku();

  let sample =
    "*bold* _italics_ ~strike~ `code` ```preformatted``` >quote a `@foo ||= bar` `foo = bar` a `|` `a|a` `a|` `|a` ` |a`";
  let i = 100;

  while (i--) {
    t.notThrows(() => {
      t.is(typeof markup.format(sample), "string", sample);
    }, sample);
    sample = newGenerator.generateTestCase(sample);
  }
});
