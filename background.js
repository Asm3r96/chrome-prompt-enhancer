/* global chrome */
chrome.commands.onCommand.addListener(command => {
  if (command === 'open_prompt_overlay') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tab = tabs[0];
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { type: 'OPEN_OVERLAY' });
      }
    });
  }
});
