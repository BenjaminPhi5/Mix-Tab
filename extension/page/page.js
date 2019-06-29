// page script to be injected
// at the moment it is injected into every single page upon the page being loaded.
// it does nothing so far.

document.addEventListener("DOMContentLoaded", function onLoad(){
    // so here i will
    // write to console saying page is loaded
    // send my external message thingy
    // see if it loads.
    console.log("new tab has loaded - should be for every single tab");
    // now I set every background page to green to see that my content script is working yay
    document.body.style.backgroundColor =  "#3aa757";
});