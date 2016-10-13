import test from 'ava';
import format from '../../example';

const expecations = [
  ['a \\*a* a *a* a*', 'a *a* a <strong>a</strong> a*'],
  [`
    > quote
    *bold*
    _italics_
    ~strike~
    \`code\`
    \`\`\`preformatted\`\`\`
  `, `<br>    <blockquote> quote</blockquote>    <strong>bold</strong><br>    <i>italics</i><br>    <strike>strike</strike><br>    <code>code</code><br>    <pre>preformatted</pre><br>  `
  ],
  [`
    > quote
    *bold*
    _italics_
    ~asdf~
    \`code asd asd\`
    \`\`\`
    var f = 2;
    \`\`\`
  `, `<br>    <blockquote> quote</blockquote>    <strong>bold</strong><br>    <i>italics</i><br>    <strike>asdf</strike><br>    <code>code asd asd</code><br>    <pre><br>    var f = 2;<br>    </pre><br>  `
  ],
  ['wasd *wasd*,wasd\nwasd *wasd*!wasd\nwasd ,*wasd* wasd', 'wasd <strong>wasd</strong>,wasd<br>wasd <strong>wasd</strong>!wasd<br>wasd ,<strong>wasd</strong> wasd'],
  ['a *a* *a* a *a* a *a* a', 'a <strong>a</strong> <strong>a</strong> a <strong>a</strong> a <strong>a</strong> a'],
  ['a *a _a a a ~a* a', 'a <strong>a _a a a ~a</strong> a'],
  ['a https://xkcd.com/ a', 'a <a href="https://xkcd.com/" target="_blank">https://xkcd.com/</a> a'],
  ['a https://xkcd.com/about/ a', 'a <a href="https://xkcd.com/about/" target="_blank">https://xkcd.com/about/</a> a'],
  ['a www.xkcd.com a', 'a <a href="http://www.xkcd.com" target="_blank">www.xkcd.com</a> a'],
  ['a www.xkcd.com/about a', 'a <a href="http://www.xkcd.com/about" target="_blank">www.xkcd.com/about</a> a'],
  ['a test_foo+spamblock@mail.de a', 'a <a href="mailto:test_foo+spamblock@mail.de" target="_blank">test_foo+spamblock@mail.de</a> a'],
  ['a *a _a a_ _a ~a* a', 'a <strong>a <i>a a</i> _a ~a</strong> a'],
  ['wasd \\*wasd\\*, \\_wasd\\_\nwasd \\*wasd\\*!wasd\nwasd ,\\*wasd\\* wasd', 'wasd *wasd*, _wasd_<br>wasd *wasd*!wasd<br>wasd ,*wasd* wasd'],
  ['_test_', '<i>test</i>'],
  ['\n_test_', '<br><i>test</i>'],
  ['100_000_000', '100_000_000'],
  ['you have to type \\\\format to escape something', 'you have to type \\format to escape something'],
  ['~~~~~a~~~~~', '<strike>~~~~a~~~~</strike>'],
  ['__a__', '<i>_a_</i>'],
  ['___a___', '<i>__a__</i>'],
  ['a `@foo ||= bar` `foo = bar` a `|` `a|a` `a|` `|a` ` |a`', 'a <code>@foo ||= bar</code> <code>foo = bar</code> a <code>|</code> <code>a|a</code> <code>a|</code> <code>|a</code> <code> |a</code>'],
  [`
> lolwut
wasdf
`,'<br><blockquote> lolwut</blockquote>wasdf<br>'],
  [
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius auctor eros, ac congue enim lacinia egestas. Nam gravida sem velit, sit amet eleifend dolor venenatis at. Aenean ut pellentesque ex, sed egestas neque. Sed ut ultrices ex, et maximus nunc. Fusce sed metus massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum non lacinia nisi, ut facilisis nisl. Praesent posuere massa ac dui vehicula condimentum. Donec ornare urna vel mattis ullamcorper. Morbi ex massa, dapibus sed ullamcorper at, luctus id nibh. Donec lobortis nunc sed convallis facilisis. Mauris vel tempor ipsum. Aenean interdum ullamcorper sapien, nec sollicitudin dui congue a.

Mauris ac ex pulvinar augue commodo laoreet. Maecenas laoreet diam lorem, sed placerat mauris euismod id. Vestibulum sed vehicula mauris. Proin elit ipsum, accumsan ac sagittis vel, imperdiet eget risus. Praesent ornare maximus nisl at varius. Morbi mi erat, convallis ut augue a, iaculis facilisis massa. Duis ultrices nibh imperdiet turpis blandit ornare. Vivamus ut leo ac purus iaculis convallis sit amet a sem. Vivamus vestibulum, nulla non efficitur fringilla, nibh lorem interdum tellus, volutpat dapibus eros mi porta neque. Morbi ultrices ac turpis interdum elementum. Integer commodo justo id hendrerit convallis. Curabitur efficitur aliquam pellentesque. Sed sed ex sit amet nisi rutrum malesuada. Vestibulum eget leo risus.

Nulla eu pharetra ipsum. Nullam non mollis neque. Mauris eu elit ullamcorper, accumsan nulla sed, vulputate neque. Integer faucibus nibh vel aliquam condimentum. Pellentesque eget urna justo. Nulla consectetur lectus rhoncus odio tempor fermentum. Nam luctus, lacus sit amet pulvinar mollis, purus sapien maximus lorem, vestibulum iaculis quam odio sit amet justo. Nam mollis nisi in luctus porta. Curabitur et massa nec ligula cursus pulvinar. Quisque et velit vehicula, tincidunt sem at, rhoncus nunc. Suspendisse commodo erat vitae ante consequat efficitur. Praesent ullamcorper nulla a nunc vulputate elementum. Quisque dui leo, accumsan eget risus nec, imperdiet tincidunt lorem. In accumsan massa nec augue egestas, at consequat augue accumsan.

Morbi cursus ante condimentum accumsan tempus. Aenean dapibus tellus ac sapien porta, non mollis est laoreet. Sed maximus nisl eu mi sollicitudin ultrices. Donec aliquam lorem eu dolor convallis ullamcorper. Nullam eu laoreet felis, at blandit nisi. In purus nisl, tincidunt in vehicula in, ultrices quis massa. Nulla non euismod nibh. Suspendisse facilisis malesuada diam, sit amet finibus lacus feugiat vel. Aliquam iaculis et ex in viverra. Etiam tincidunt, enim non ullamcorper fringilla, enim est varius justo, non viverra metus dolor cursus justo. Sed sit amet metus id neque efficitur convallis. Etiam ultrices, nulla vel pulvinar porta, augue mi pellentesque sem, id faucibus enim risus eu augue. Vivamus risus justo, tristique in rutrum sollicitudin, aliquam et metus. Nulla augue quam, interdum quis nulla ut, finibus ullamcorper turpis.

Mauris ipsum felis, gravida eget sodales viverra, sodales congue erat. Duis nec arcu nec nibh rhoncus dignissim a vel sapien. In consequat diam ut eleifend pellentesque. Sed pharetra dolor nibh, sit amet venenatis magna auctor ut. Aenean quis lacus iaculis, mattis nunc nec, consectetur nunc. Proin feugiat purus quis ultricies imperdiet. Nam nec nisi felis. Aliquam a nulla rhoncus elit placerat maximus et non quam. Suspendisse mattis erat id dolor tempor posuere a in neque. Ut ultricies sapien non malesuada rhoncus. Proin sit amet turpis vitae sem blandit dapibus. Sed hendrerit, lorem tempor aliquet consequat, felis leo iaculis eros, nec tincidunt lectus augue vel dui.`,
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean varius auctor eros, ac congue enim lacinia egestas. Nam gravida sem velit, sit amet eleifend dolor venenatis at. Aenean ut pellentesque ex, sed egestas neque. Sed ut ultrices ex, et maximus nunc. Fusce sed metus massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum non lacinia nisi, ut facilisis nisl. Praesent posuere massa ac dui vehicula condimentum. Donec ornare urna vel mattis ullamcorper. Morbi ex massa, dapibus sed ullamcorper at, luctus id nibh. Donec lobortis nunc sed convallis facilisis. Mauris vel tempor ipsum. Aenean interdum ullamcorper sapien, nec sollicitudin dui congue a.<br><br>Mauris ac ex pulvinar augue commodo laoreet. Maecenas laoreet diam lorem, sed placerat mauris euismod id. Vestibulum sed vehicula mauris. Proin elit ipsum, accumsan ac sagittis vel, imperdiet eget risus. Praesent ornare maximus nisl at varius. Morbi mi erat, convallis ut augue a, iaculis facilisis massa. Duis ultrices nibh imperdiet turpis blandit ornare. Vivamus ut leo ac purus iaculis convallis sit amet a sem. Vivamus vestibulum, nulla non efficitur fringilla, nibh lorem interdum tellus, volutpat dapibus eros mi porta neque. Morbi ultrices ac turpis interdum elementum. Integer commodo justo id hendrerit convallis. Curabitur efficitur aliquam pellentesque. Sed sed ex sit amet nisi rutrum malesuada. Vestibulum eget leo risus.<br><br>Nulla eu pharetra ipsum. Nullam non mollis neque. Mauris eu elit ullamcorper, accumsan nulla sed, vulputate neque. Integer faucibus nibh vel aliquam condimentum. Pellentesque eget urna justo. Nulla consectetur lectus rhoncus odio tempor fermentum. Nam luctus, lacus sit amet pulvinar mollis, purus sapien maximus lorem, vestibulum iaculis quam odio sit amet justo. Nam mollis nisi in luctus porta. Curabitur et massa nec ligula cursus pulvinar. Quisque et velit vehicula, tincidunt sem at, rhoncus nunc. Suspendisse commodo erat vitae ante consequat efficitur. Praesent ullamcorper nulla a nunc vulputate elementum. Quisque dui leo, accumsan eget risus nec, imperdiet tincidunt lorem. In accumsan massa nec augue egestas, at consequat augue accumsan.<br><br>Morbi cursus ante condimentum accumsan tempus. Aenean dapibus tellus ac sapien porta, non mollis est laoreet. Sed maximus nisl eu mi sollicitudin ultrices. Donec aliquam lorem eu dolor convallis ullamcorper. Nullam eu laoreet felis, at blandit nisi. In purus nisl, tincidunt in vehicula in, ultrices quis massa. Nulla non euismod nibh. Suspendisse facilisis malesuada diam, sit amet finibus lacus feugiat vel. Aliquam iaculis et ex in viverra. Etiam tincidunt, enim non ullamcorper fringilla, enim est varius justo, non viverra metus dolor cursus justo. Sed sit amet metus id neque efficitur convallis. Etiam ultrices, nulla vel pulvinar porta, augue mi pellentesque sem, id faucibus enim risus eu augue. Vivamus risus justo, tristique in rutrum sollicitudin, aliquam et metus. Nulla augue quam, interdum quis nulla ut, finibus ullamcorper turpis.<br><br>Mauris ipsum felis, gravida eget sodales viverra, sodales congue erat. Duis nec arcu nec nibh rhoncus dignissim a vel sapien. In consequat diam ut eleifend pellentesque. Sed pharetra dolor nibh, sit amet venenatis magna auctor ut. Aenean quis lacus iaculis, mattis nunc nec, consectetur nunc. Proin feugiat purus quis ultricies imperdiet. Nam nec nisi felis. Aliquam a nulla rhoncus elit placerat maximus et non quam. Suspendisse mattis erat id dolor tempor posuere a in neque. Ut ultricies sapien non malesuada rhoncus. Proin sit amet turpis vitae sem blandit dapibus. Sed hendrerit, lorem tempor aliquet consequat, felis leo iaculis eros, nec tincidunt lectus augue vel dui.`
  ]
];

expecations.forEach(([input, expected]) => {
  test(input, t => {
    t.is(format(input), expected);
  });
});
