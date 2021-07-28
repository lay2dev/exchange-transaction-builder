"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignFlag = void 0;
__exportStar(require("./ckb-exchange-lock"), exports);
__exportStar(require("./ckb-exchange-timelock"), exports);
var SignFlag;
(function (SignFlag) {
    SignFlag[SignFlag["SingleSign"] = 0] = "SingleSign";
    SignFlag[SignFlag["MultiSign"] = 1] = "MultiSign";
})(SignFlag = exports.SignFlag || (exports.SignFlag = {}));
//# sourceMappingURL=index.js.map