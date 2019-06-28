// background script goes here, to inject content script eventually I imagine


// on install, eventually should setup settings, for now just write to console
chrome.runtime.onInstalled.addListener(function (){
    console.log("extension installed");
});