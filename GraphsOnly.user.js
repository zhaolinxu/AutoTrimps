// ==UserScript==
// @name         AutoTrimpsV2+genBTC-GraphsOnly
// @namespace    https://github.com/genbtc/AutoTrimps
// @version      2.1.6.0-genbtc-12-23-2017+Mod+Uni+coderpatsy
// @description  Graphs Module (only) from AutoTrimps
// @author       zininzinin, spindrjr, belaith, ishakaru, genBTC
// @include      *trimps.github.io*
// @include      *kongregate.com/games/GreenSatellite/trimps
// @grant        none
// ==/UserScript==
var script = document.createElement('script');
script.id = 'AutoTrimps-script';
script.src = 'https://zhaolinxu.github.io/AutoTrimps/Graphs.js';
document.head.appendChild(script);