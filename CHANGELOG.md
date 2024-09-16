# Changelog

## [2.1.0](https://github.com/Th1nkK1D/sheethuahua/compare/2.0.0...2.1.0) (2024-09-16)

### Features

- add early missing column in header row validation ([e1e568f](https://github.com/Th1nkK1D/sheethuahua/commit/e1e568f95e2b6b5c494257bb1be9d10db686c15a))

## [2.0.0](https://github.com/Th1nkK1D/sheethuahua/compare/1.0.0...2.0.0) (2024-05-17)

### ⚠ BREAKING CHANGES

- parseCSVFromString now return a promise
- remove sheets uncompatible custom header and body row number options

### Features

- add TSDoc for exported variables, functions and types ([26af842](https://github.com/Th1nkK1D/sheethuahua/commit/26af8425e18318e91c8a381fe82c0ca3f90a8a92))
- parseCSVFromString now return a promise ([0f951e4](https://github.com/Th1nkK1D/sheethuahua/commit/0f951e44e8f883c11c589509fade40102bd76167))
- remove sheets uncompatible custom header and body row number options ([07721c1](https://github.com/Th1nkK1D/sheethuahua/commit/07721c14ab1129ca7d0cdb62bb5d08e2e0bf8c57))
- support sheets API query params ([7c91207](https://github.com/Th1nkK1D/sheethuahua/commit/7c91207758589ff256bf8af0d00193077d73484e))

## 1.0.0 (2024-05-08)

### Features

- add basic table and spreadsheet type interface ([c6ae100](https://github.com/Th1nkK1D/sheethuahua/commit/c6ae1005c2fbbf7d94ea28f499d022817ca4f4ef))
- add column type ([96bf619](https://github.com/Th1nkK1D/sheethuahua/commit/96bf6193d6dbd925787f7b193f816b65e6ec89e1))
- add exclude unknown columns with options ([0b158d4](https://github.com/Th1nkK1D/sheethuahua/commit/0b158d4c662cf5ea95d62bbade8b643b6da6bccf))
- add nullable column type ([6ca61d3](https://github.com/Th1nkK1D/sheethuahua/commit/6ca61d3009f9876c27a4116b6fb8c3355a2515cc))
- add one of column type and rename optional ([cf09f65](https://github.com/Th1nkK1D/sheethuahua/commit/cf09f657201197f8aa019cfb1041c48272c7ad56))
- add row generic type infer from table ([486fa63](https://github.com/Th1nkK1D/sheethuahua/commit/486fa632d2b5afbb46e385cb78e59cdb0a50664d))
- add trim option and parse empty cell as null ([23cc22d](https://github.com/Th1nkK1D/sheethuahua/commit/23cc22d45f5d412bd3d81bae568a382f169e3dec))
- add twin optional variant to all column types ([6e8ebfc](https://github.com/Th1nkK1D/sheethuahua/commit/6e8ebfcc9f8d67d992b93c4600837c6eed2b670e))
- allow passing fetch init config ([0be368c](https://github.com/Th1nkK1D/sheethuahua/commit/0be368c1495ccb3f6682494d54bf3e2ddb823277))
- config package building ([295517c](https://github.com/Th1nkK1D/sheethuahua/commit/295517c1c242f8f931ae923d333a2ba1be346376))
- extract parser out of spreadsheet ([925ffd2](https://github.com/Th1nkK1D/sheethuahua/commit/925ffd2bc3ee79c9b37d340f03b0f98ce0f31568))
- fetch, parse, and validate data in get function ([9761c6d](https://github.com/Th1nkK1D/sheethuahua/commit/9761c6d9194e57b4b854126655c9e830fc17f08c))
- improve error messages ([527ce1f](https://github.com/Th1nkK1D/sheethuahua/commit/527ce1f2356e933ea2e7a17259c7b1cfc5631c71))
- make parseCSVFromString synchronous ([d9ec2ea](https://github.com/Th1nkK1D/sheethuahua/commit/d9ec2ea30f60ba87794046fe66702d1920cdcd66))
- spreadsheets can specify global options ([6851961](https://github.com/Th1nkK1D/sheethuahua/commit/685196128d1118c59c4c6c04e73fc4ef0deea2aa))
- support anonymous table for csv parser ([ce62a34](https://github.com/Th1nkK1D/sheethuahua/commit/ce62a34c34e021878b2405ce51a1cb37b2e1ab39))
- support custom header and body row number ([9b840ff](https://github.com/Th1nkK1D/sheethuahua/commit/9b840ffcf0741d0977ffbd765eb2ceb3a901668c))
- use includeUnknownColumns option instead of exclude ([7fc0785](https://github.com/Th1nkK1D/sheethuahua/commit/7fc0785ad0ab3fac477d1dbd800e9325b7f15ac4))
- use typebox convert in csv parser ([e0757b3](https://github.com/Th1nkK1D/sheethuahua/commit/e0757b3445103410b66d9ae59f1bef6b2fc42cc5))
- validate table name and narrow down parser schema type ([274cf4b](https://github.com/Th1nkK1D/sheethuahua/commit/274cf4b5eb8ceae1d9c176733e96caa2b826c218))
