# Death from above game

## Steps to run

1. Install [Node.js](https://nodejs.org/en/) and [Visual Studio Code](https://code.visualstudio.com/).
2. Open this lab folder in Visual Studio Code.
3. Open a terminal (Terminal > New Terminal).
4. run `npm install` . If it failed for any reason, try again.
5. run `npm run watch` .
6. Ctrl + click the link shown in the terminal (usually it will be http://localhost:1234).

**Note:** you can use yarn to enable caching so that you don't download all the packages with project. You can download yarn from [yarnpkg.com](https://yarnpkg.com/lang/en/). Then replace `npm install` with `yarn install` and `npm run watch` with `yarn watch`.

**Debugging:** You will need the extension [Debugger for Chrome](https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome). After running till Step 5 from [Steps to run](#steps-to-run), press F5 or click the Debug icon on the left bar then choose *"Launch Chrome against"* localhost" and click the *"Start Debugging"* button (play button). Now you can use breakpoints, watch, etc. The required configuration for the debugger is written in `.vscode/launch.json`.

#Thanks to Eng. Yehia Etman supervising
https://github.com/yahiaetman