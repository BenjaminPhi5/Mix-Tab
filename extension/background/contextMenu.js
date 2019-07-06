// this is for the menu that you see when you right click in a page, and see all those right click options.
// the 16 by 16 icon is loaded and an arrow pointing to a side menu
// you can mute a tab or solo it

// also add some commands to the extension

const contextMenuFuncs = {
    'cmMute': 'Mute',
    'cmSolo': 'Solo'
}

chrome.runtime.onInstalled.addListener(function(){
    for(let key of Object.keys(contextMenuFuncs)){
        chrome.contextMenus.create({
            id: key,
            title: contextMenuFuncs[key],
            type: 'normal',
            contexts: ['selection']
        });
    }
});

