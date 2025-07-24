const { withMainApplication, AndroidConfig } = require('@expo/config-plugins');

module.exports = function withBackgroundTimer(config) {
  return withMainApplication(config, async (config) => {
    const mainApplication = config.modResults;
    const packageName = 'com.flowday.newbackgroundtimer.NewBackgroundTimerPackage';

    // Add the import statement
    if (!mainApplication.contents.includes(`import ${packageName}`)) {
      mainApplication.contents = mainApplication.contents.replace(
        'package com.anonymous.flowdaymobile',
        `package com.anonymous.flowdaymobile\n\nimport ${packageName}`
      );
    }

    // Add the package to the getPackages() method
    const getPackagesMethod = mainApplication.contents.match(
      /override fun getPackages\(\): List<ReactPackage> {[^}]+}/
    );
    if (getPackagesMethod) {
      const newGetPackagesMethod = getPackagesMethod[0].replace(
        'return packages',
        `packages.add(${packageName}())\n      return packages`
      );
      mainApplication.contents = mainApplication.contents.replace(
        getPackagesMethod[0],
        newGetPackagesMethod
      );
    }

    return config;
  });
};
