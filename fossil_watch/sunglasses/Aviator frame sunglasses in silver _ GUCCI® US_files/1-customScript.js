var _insideCustomConfig = {
    "videoChatCompany": "GucciUS",
    "videoSurveyId": 0,
    "videoChatLocation": {
        "G9publicUS": "*",
        "G9privateUS": "/st/video-appointment"
    },
    "videoChannels": [
        "Video Chat",
        "Video Chat 2",
        "z - Video Chat",
        "z - managed test"
    ],
    "csChannels": [
        "Gucci OSA - Chat (Salesforce)",
        "OSA Mexico Chat Channel",
        "z - OSA Chat Channel",
        "Mixed Channel",
        "Inside Mixed Channel",
        "Test europe mixed channel"
    ],
    "translations": {
      "Chat with an Advisor": {
        "es": "Hable con un Asesor de Clientes"
      },
      "Discover how to reach an Advisor live": {
        "es": "Descubre cómo contactar un Asesor de Clientes en vivo"
      }
    }
};

_insideGraph.defer(function () {
    const _insideWebsiteId = insideFrontInterface.chat.userid.split(':')[1];
    if (insideFrontInterface.chatSettings.name.includes('V3')) {
      _insideGraph.loadCSS(`${_insideCDN}custom/${_insideWebsiteId}-customChatTab.css?v=${_insideScriptVersion}`);
      _insideGraph.loadJS(`${_insideCDN}custom/${_insideWebsiteId}-customChatTab.js?v=${_insideScriptVersion}`);
    } else {
      _insideGraph.loadCSS(`${_insideCDN}custom/${_insideWebsiteId}-customGeneralInside-v2.css?v=${_insideScriptVersion}`);
      _insideGraph.loadJS(`${_insideCDN}custom/${_insideWebsiteId}-customScript-v2.js?v=${_insideScriptVersion}`);
    }
  }, function () {
    return typeof insideFrontInterface != "undefined" && insideFrontInterface.chat && insideFrontInterface.chat.userid;
  });
  
  _insideGraph.defer(() => {
    if(insideFrontInterface.chatLinkVisitor) {
      insideChatPane.chatPane.classList.add('chatlink-visitor');
    }
  }, () => {
    return typeof insideChatPane !== 'undefined' && insideChatPane.chatPane;
  });