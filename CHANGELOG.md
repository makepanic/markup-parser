# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.0"></a>
# 0.2.0 (2018-10-08)


### Bug Fixes

* **example:** add support for urls that are matched by list of known tld ([dc80a45](https://github.com/makepanic/markup-parser/commit/dc80a45))
* **Parser:** expand previous fallbackNode if current token rule is the same ([fd2ca2a](https://github.com/makepanic/markup-parser/commit/fd2ca2a))
* **RuleProperty:** don't use bitmask for RuleProperty ([76aecef](https://github.com/makepanic/markup-parser/commit/76aecef))
* **SlackLike:** ensure quote has whitespace before ([6f17f9e](https://github.com/makepanic/markup-parser/commit/6f17f9e))
* allow example to not modify the DOM ([7eb0e60](https://github.com/makepanic/markup-parser/commit/7eb0e60))
* change token id to be a number ([e959420](https://github.com/makepanic/markup-parser/commit/e959420))
* imrove Parser and Tokenizer to properly parse in edge cases ([704b461](https://github.com/makepanic/markup-parser/commit/704b461))
* **SlackLike:** fix quote not getting triggered at start of string ([ca4319a](https://github.com/makepanic/markup-parser/commit/ca4319a))
* **SlackLike:** fix various slacklike formatting issues ([c93ee4a](https://github.com/makepanic/markup-parser/commit/c93ee4a))
* **tokenizer:** fix terminator start, end ([83f6489](https://github.com/makepanic/markup-parser/commit/83f6489))


### Features

* **Rule:** allow rules to occlude their children ([b6ce0ee](https://github.com/makepanic/markup-parser/commit/b6ce0ee))
* let display function know that it's occluded ([f0edf18](https://github.com/makepanic/markup-parser/commit/f0edf18))
* propagate token meta to nodes ([9dd6e07](https://github.com/makepanic/markup-parser/commit/9dd6e07))


### Performance Improvements

* reduce iteration counts ([2721a96](https://github.com/makepanic/markup-parser/commit/2721a96))
* **Parser:** create one fallbackNode for all occluded child tokens ([c07086e](https://github.com/makepanic/markup-parser/commit/c07086e))
* **Parser:** don't create a sliced array on peek ([6d63798](https://github.com/makepanic/markup-parser/commit/6d63798))
* **Parser:** don't peek to parse children ([b93a711](https://github.com/makepanic/markup-parser/commit/b93a711))
* **Tokenizer:** use brute force array filling approach to detect previously tokenized ranges ([a48277f](https://github.com/makepanic/markup-parser/commit/a48277f))
