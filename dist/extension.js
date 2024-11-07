/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = void 0;
const vscode = __webpack_require__(1);
const skipWorktree_1 = __webpack_require__(2);
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        context.subscriptions.push(vscode.commands.registerCommand('extension.HammerDressing.git.skip-worktree', (...args) => {
            const filePaths = args[1];
            handleToggleSkipWorktree(filePaths, true).then(() => {
                skipWorktreeProvider.refresh();
            });
        }), vscode.commands.registerCommand('extension.HammerDressing.git.no-skip-worktree', (...args) => {
            const filePaths = args[1];
            handleToggleSkipWorktree(filePaths, false).then(() => {
                skipWorktreeProvider.refresh();
            });
        }));
        const skipWorktreeProvider = new skipWorktree_1.SkipWorktreeProvider();
        vscode.window.registerTreeDataProvider('SkipWorktreeFiles', skipWorktreeProvider);
        context.subscriptions.push(vscode.commands.registerCommand('extension.HammerDressing.git.skip-worktree-refresh', () => skipWorktreeProvider.refresh()), vscode.commands.registerCommand('extension.HammerDressing.git.no-skip-worktree-in-treeview', (treeItem) => {
            handleNoSkipWorktree(treeItem).then(() => {
                skipWorktreeProvider.refresh();
            });
        }));
    });
}
exports.activate = activate;
function handleToggleSkipWorktree(filePaths, isSkip) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const ext = vscode.extensions.getExtension('vscode.git');
        yield (ext === null || ext === void 0 ? void 0 : ext.activate());
        const gitExtension = ext === null || ext === void 0 ? void 0 : ext.exports;
        const git = (_a = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.model) === null || _a === void 0 ? void 0 : _a.git;
        const gitApi = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.getAPI(1);
        const repositoryRoot = (_c = (_b = gitApi === null || gitApi === void 0 ? void 0 : gitApi.repositories[0]) === null || _b === void 0 ? void 0 : _b.rootUri) === null || _c === void 0 ? void 0 : _c.fsPath;
        if (Array.isArray(filePaths)) {
            const execArr = filePaths.map((filePath) => {
                const folder = vscode.workspace.getWorkspaceFolder(filePath);
                if (!folder || !folder.uri) {
                    return;
                }
                const path = filePath.path.replace(folder.uri.path, '.');
                const command = `update-index ${isSkip ? '--skip-worktree' : '--no-skip-worktree'} ${path}`;
                return git.exec(repositoryRoot, command.split(' '));
            });
            yield Promise.all(execArr);
        }
    });
}
function handleNoSkipWorktree(treeItem) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const ext = vscode.extensions.getExtension('vscode.git');
        yield (ext === null || ext === void 0 ? void 0 : ext.activate());
        const gitExtension = ext === null || ext === void 0 ? void 0 : ext.exports;
        const git = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.model.git;
        const gitApi = gitExtension === null || gitExtension === void 0 ? void 0 : gitExtension.getAPI(1);
        const repositoryRoot = (_b = (_a = gitApi === null || gitApi === void 0 ? void 0 : gitApi.repositories[0]) === null || _a === void 0 ? void 0 : _a.rootUri) === null || _b === void 0 ? void 0 : _b.fsPath;
        const command = `update-index --no-skip-worktree ${treeItem.label}`;
        yield git.exec(repositoryRoot, command.split(' '));
    });
}


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SkipWorktreeProvider = void 0;
const vscode = __webpack_require__(1);
const vscode_1 = __webpack_require__(1);
class SkipWorktreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.data = [];
        this.parseTree().then(() => {
            this._onDidChangeTreeData.fire();
        });
    }
    get gitExtension() {
        const ext = vscode.extensions.getExtension('vscode.git');
        const gitExtension = ext === null || ext === void 0 ? void 0 : ext.exports;
        return gitExtension;
    }
    get git() {
        var _a, _b;
        const git = (_b = (_a = this.gitExtension) === null || _a === void 0 ? void 0 : _a.model) === null || _b === void 0 ? void 0 : _b.git;
        return git;
    }
    get repositoryRoot() {
        var _a, _b, _c, _d;
        return (_d = (_c = (_b = (_a = this.gitExtension) === null || _a === void 0 ? void 0 : _a.getAPI(1)) === null || _b === void 0 ? void 0 : _b.repositories[0]) === null || _c === void 0 ? void 0 : _c.rootUri) === null || _d === void 0 ? void 0 : _d.fsPath;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.parseTree();
            this._onDidChangeTreeData.fire();
        });
    }
    parseTree() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.repositoryRoot)
                return;
            this.data = [];
            const lsFiles = yield this.git.exec(this.repositoryRoot, 'ls-files -v'.split(' '));
            const stdoutStr = lsFiles.stdout;
            const skipFiles = stdoutStr.split('\n').filter((file) => file.startsWith('S ') || file.startsWith('s ')).map((file) => file.replace(/s /i, ''));
            this.data = skipFiles.map((item) => {
                return new vscode_1.TreeItem(item);
            });
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren() {
        return this.data;
    }
}
exports.SkipWorktreeProvider = SkipWorktreeProvider;


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map