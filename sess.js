var SESS = {
  eventSourceURL : null,
  pollingInterval : null
};
function sessInit() {
  var esURL = window.location.href;
  if (SESS.eventSourceURL !== undefined && SESS.eventSourceURL != null) {
    esURL = SESS.eventSourceURL;
  }
  if (!!window.EventSource) {
    initEs(esURL);
  } else { // Use polling :(
    var pI = 1000;
    if (SESS.pollingInterval !== undefined && SESS.eventSourceURL != null) {
      pI = SESS.pollingInterval;
    }
    setTimeout(function() {
      poll(esURL, pI);
    }, pI);
  }
}
function initEs(esURL) {
  if (SESS.es === undefined || SESS.es === null || SESS.es.readyState === 2) {
    SESS.es = new EventSource(esURL);
    SESS.es.addEventListener("message", function(e) {
      if(!!e.data) {
        handleMessage(JSON.parse(e.data));
      }
    }, false);
    SESS.es.addEventListener("error", function(e) {
      if (e.readyState === 2) { // Connection closed
        setTimeout(function() {
          initES(esURL);
        }, 5000);
      }
    }, false);
  }
}
function poll(urlWithParams, pollInterval) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", urlWithParams, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200 && !!xhr.responseText) {
      var responseObj = JSON.parse(xhr.responseText);
      if(!!responseObj && !!responseObj.data) {
        handleMessage(responseObj.data);
      }
    }
  };
  xhr.send();
  setTimeout(function() {
    poll(urlWithParams, pollInterval);
  }, pollInterval);
}
function handleMessage(data) {
  var id = data.elementId !== undefined ? data.elementId : null;
  var className = !!data.className ? data.className : null;
  var attributeName = data.attributeName !== undefined ? data.attributeName : null;
  var attributeValue = data.attributeValue !== undefined ? unescape(data.attributeValue) : null;
  var text = data.text !== undefined ? unescape(data.text) : null;
  var html = data.html !== undefined ? unescape(data.html) : null;
  var appendAttrValue = data.appendAttrValue !== undefined && data.appendAttrValue.toLowerCase() === "true";
  var appendText = data.appendText !== undefined && data.appendText.toLowerCase() === "true";
  var appendHtml = data.appendHtml !== undefined && data.appendHtml.toLowerCase() === "true";
  if (id) {
    var element = document.getElementById(id);
    if(element) {
      updateElement(element, attributeName, attributeValue, text, html, appendAttrValue, appendText, appendHtml);
    }
  } if (className) {
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; i += 1) {
      updateElement(elements[i], attributeName, attributeValue, text, html, appendAttrValue, appendText, appendHtml);
    }
  }
}
function updateElement(element, attributeName, attributeValue, text, html, appendAttrValue, appendText, appendHtml) {
  if (html) {
    element.innerHTML = appendHtml ? (element.innerHTML + html) : html;
    return;
  }
  if(text){
    element.innerHTML = appendText ? (element.innerText + text) : text;
    return;
  }
  if(attributeName && attributeValue) {
    var currentAttrValue = element.getAttribute(attributeName);
    element.setAttribute(attributeName, appendAttrValue && !!currentAttrValue ? (currentAttrValue + attributeValue) : attributeValue);
    return;
  }
}
