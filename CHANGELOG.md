# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.5.0](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.4.0...v1.5.0) (2025-07-16)


### Features

* Add pause and resume for routine timers ([29399bb](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/29399bb61a1da4e882fa80ed3390dcf6846332d5))
* Display paused timer on routine block ([c1f2990](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/c1f2990106bfcbe1438eaf4b3c970a23d2d2e438))
* Improve progress bar for untimed routine actions ([9e83a49](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/9e83a495c59f6c855a0ff14cb88cc285a5939b16))
* Increase touch area for header buttons ([6a779d6](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/6a779d65bf1d66ac750270a40bef9edbad3da18c))
* **routines:** Redesign routine list edit mode ([b223640](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/b223640750522918562d73d54b66e24704de55dd))
* **runner:** Display total remaining time for routine block ([baa31cd](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/baa31cd6e9cd53a1566ecc6cb0c7a0144ac4d508))
* **timer:** Implement persistent pause and resume for actions ([3c6111e](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/3c6111ebec4fbb3f6a0344e60bbefcc742e7fcd5))
* **ux:** Increase tap targets on routine runner screen ([96ae52f](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/96ae52f8a16ec7e2a25eeb7680063a9a375a278e))

## [1.4.0](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.3.2...v1.4.0) (2025-07-16)


### Features

* Add confirmation modal for routine deletion and new action screens ([b73cfcb](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/b73cfcbf9ed0878b9d7f4339c3a5f229b114f0fe))
* Add linear gradient to progress bars in RoutineRunnerScreen for enhanced visual appeal ([854b12e](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/854b12ef38787be91737dc1ff154e19dc002a2c0))
* Disable interaction with completed routine blocks ([0eb2ba6](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/0eb2ba6ca922426f25f1c675b7fe92d7f8c5948c))
* Enhance AlertModal and ConfirmModal with icon buttons and layout adjustments ([a8e60d0](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/a8e60d035445ce0f98f64953a3f07c0e25bdd08a))
* Enhance CreateEditRoutineScreen and RoutineRunnerScreen with Pomodoro actions and breathing animation ([1179c05](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/1179c050dd40fd1ee576132d1c131776042f4df2))
* Implement AlertModal for routine title validation feedback ([7877b3f](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/7877b3f07e5bb4644c8c80a65e0b5b2477368b86))
* Refactor addRoutine to accept blocks and streamline routine creation ([fa3cef9](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/fa3cef997cdfd2edb44e1ae068437d19e268424d))
* Replace custom progress bar implementation with AnimatedProgressBar for improved code maintainability ([ae7e283](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/ae7e283116ff0962bb5938aa0eef55fce02e2e60))
* Replace Haptics with Vibration for timer notifications and update package versions ([3f4365a](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/3f4365a3b33e827bd27532404d2be2dd74f17367))
* Simplify AnimatedProgressBar by removing elapsedTime and totalDuration props, and update progress calculation ([80b7e01](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/80b7e0131f27f33a60ce33c061b8253814a7d789))
* Update AnimatedProgressBar to use elapsed time and total duration for improved accuracy ([1a0bd8f](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/1a0bd8fe16fbdd2dc61d8feac62772eada3869e5))


### Bug Fixes

*  vibration ([c6ee072](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/c6ee072d9d2714a10f7933be2f4ff068d28c3ab8))
* Adjust pointer events based on focus progress in RoutineRunnerScreen ([74ec45a](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/74ec45aef4b12de12a3134454f18917b8dc85314))
* Prevent vibration crash on devices without a vibrator ([c9fc1d3](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/c9fc1d34345e3ba68f4675b6760961c3fc06ac4b))
* Update timer color in CreateEditRoutineScreen to a new hex value ([de60591](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/de6059168660ddb43cb8c8706b0fda42a91bb929))

### [1.3.2](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.3.1...v1.3.2) (2025-07-16)

### [1.3.1](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.3.0...v1.3.1) (2025-07-15)

## [1.3.0](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.2.0...v1.3.0) (2025-07-15)


### Features

* Refactor completeAction to improve state update and save progress handling ([61de468](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/61de468f1cbb44e9ec60bbbc930b4b7b9d08fef5))

## [1.2.0](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/compare/v1.1.0...v1.2.0) (2025-07-15)


### Features

* Add splash screen asset and handle potential undefined task info in RoutineRunnerScreen ([7b5f8c8](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/7b5f8c8ee5e53d7a4157d3698bbf866322e557ec))

## 1.1.0 (2025-07-15)


### Features

* Add action library store for managing action templates and integrate haptics support ([e200b06](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/e200b0604239bf79e293458e7c99fda7dde30d22))
* Add ActionSheet component and calculate routine duration functionality ([0980c00](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/0980c00e3f79318abc21fcae9a603600bc6e8b3b))
* Add adaptive icon for Android and update app.json with package name ([6a4f3e6](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/6a4f3e6953eaf758229a4bb898069c6c33be1178))
* Add animated icons for action statuses in RoutineRunnerScreen and remove notification service ([d95440f](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/d95440fa1b8ab13797d0f1c7014208302ea66a30))
* Add block and action deletion functionality in CreateEditRoutineScreen ([56a7590](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/56a759056c7444fe2cca4905be5034d802e82875))
* Add color and icon selection for routines with a new ColorPicker component and animated IconPickerModal ([1d1ee35](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/1d1ee359fdd633bf7dfc068519b0733c2190f4a9))
* Add fade animation to StackNavigator and routine run screen ([9c255cb](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/9c255cbdca740b9a96b52aefe4400b8ce8a8bdaa))
* Add reorder functionality for blocks and actions in useRoutineStore ([6f8e979](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/6f8e979c22b6c43e6d7e7dacb5eb709e7249e455))
* Add step to create splash screen in build workflow ([2540a8c](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/2540a8cf35f6e0ba17b3fca3d223266c0fad8001))
* Add text action type and enhance routine duration calculations ([a50e631](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/a50e631ba565794758cd5d9c4821e91181480c5d))
* Enhance routine management by adding block icons and limiting displayed actions ([9460257](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/94602575340b05f77d0eb1005b57882226f59022))
* Enhance RoutineListScreen with FlatList for non-edit mode and update CustomDrawerContent to display icons with routines ([685f079](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/685f079f58906fc4b949c9238c098a15a7cee196))
* Enhance RoutineRunnerScreen layout and update icon representation for action status ([558cd63](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/558cd63de82c63ace8ae963f9cab3bf6ec0aac96))
* Enhance RoutineRunnerScreen with focus mode restrictions and improved block completion overlay ([c5f146d](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/c5f146d2df12edabc9ce1c1b6754bb1444249f7a))
* Enhance swipe gesture functionality for side menu and navigation ([da9c16e](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/da9c16ed3c31bf56e45fdebae18bb3786d2e61e0))
* Implement custom side drawer navigation ([4ce7e38](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/4ce7e38ea5250dbbe355dec3d9dbe852fc4221e3))
* Implement draggable functionality for routines in RoutineListScreen ([7c12dc3](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/7c12dc3d64990ea8ec02a0004fda8f1dad752917))
* Implement foreground and background notification services for workflow management ([d6bd071](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/d6bd071f87c968f8a75a997e63e2a1fb7ff09bbf))
* Implement new icon animations for improved user feedback in RoutineRunnerScreen ([a9e7770](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/a9e7770adc0571accb18162e4bc1c67d7ccf473c))
* Implement theme constants for consistent styling and update Header component to use theme values ([24f142d](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/24f142db18cb091d59c0a16dc1a7ad21b09511b0))
* Improve user feedback with enhanced icon animations in RoutineRunnerScreen ([808624c](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/808624c738197b107f4f91b4147c3c6d7c53f4dc))
* Initial implementation of Flow Day app ([019d298](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/019d29883583d22108a714dbb0365b661828d60f))
* Organize icons into categories in IconPickerModal for improved selection experience ([7b3b08d](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/7b3b08dbac7185b3025a9e49876058c67d8ede1f))
* Refactor CreateEditRoutineScreen and RoutineRow for improved drag-and-drop functionality and UI consistency ([ed5e50f](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/ed5e50f319548027d07f8a3fded92b5505ce6c11))
* Refactor CreateEditRoutineScreen to use FlatList and improve UI interactions ([00613b5](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/00613b55ab7378e264b512887fb771d8ede1a8f8))
* Refactor icon color and name logic in ActionBubbles component for better clarity ([b42750b](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/b42750bd64bd238b02bc1251add27b2b80e212d9))
* Refactor routine storage management to use indexed keys and improve persistence methods ([dc7bd51](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/dc7bd51b5334565db5c9bc9f6110cee2c76296e2))
* Refactor RoutineListScreen to support edit mode and improve styling with theme constants ([228eef1](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/228eef16fc865bef570ac65cded4316e1b80026f))
* Remove adaptive icon asset from project ([90d2f65](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/90d2f65a5d74845660ca64d189b0707519f8d106))
* Remove edit mode functionality from RoutineScreen and simplify navigation ([74b2824](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/74b2824819f582e2b69543a35e083bcb33f435a1))
* Update app.json with new app name, version, and configuration settings; add app icon ([578a30e](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/578a30e5067e62ada8e49b9bdc95dfe304fadc2e))
* Update button styling and add toast notifications in layout ([81c8cc3](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/81c8cc3ce965e6a91d60573542156817c815d30a))
* Update icon colors based on action status in ActionRow and ActionBubbles components ([207c9e6](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/207c9e6a2f8c61e91c33aeaeeaf6fd1a8a933d2f))
* Update RoutineRunnerScreen layout and replace back button text with icon ([9a6eac1](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/9a6eac1c9e2eefca249adaef5b9eb7116db6f99e))


### Bug Fixes

* Update .gitignore with more comprehensive rules ([82c9440](https://github.com/jon-garmilla-dev/jon-garmilla-dev-Flow-Day.apk/commit/82c9440886d08819c7775adfa216679acc2347ec))
