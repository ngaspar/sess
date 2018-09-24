var SESS = {
  eventSourceURL : null,
  pollingURLPath : null,
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
    var uP = "getElementUpdates";
    if (SESS.pollingURLPath !== undefined) {
      uP = SESS.pollingURLPath.replace(/^\/+/g, "").replace(/\/$/, "");
    }
    var urlWithParams = esURL + "/" + uP;
    setTimeout(function() {
      poll(urlWithParams, pI);
    }, pI);
  }
}
function initEs(esURL) {
  if (SESS.es === undefined || SESS.es === null || SESS.es.readyState === 2) {
    SESS.es = new EventSource(esURL);
    SESS.es.addEventListener("message", function(e) {
      handleMessage(JSON.parse(e.data));
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
    if (xhr.readyState == 4 && xhr.status == 200) {
      handleMessage(JSON.parse(xhr.responseText).data);
    }
  };
  xhr.send();
  setTimeout(function() {
    poll(urlWithParams, pollInterval);
  }, pollInterval);
}
function handleMessage(data) {
  var append = data.append.toLowerCase() === "true";
  var isValue = !!data.value && !data.html;
  var content = isValue ? unescape(data.value) : unescape(data.html);
  if (data.type.endsWith("ById")) {
    var element = document.getElementById(data.id);
    updateElement(element, content, isValue, append);
  } else if (data.type.endsWith("ByClassName")) {
    var elements = document.getElementsByClassName(data.className);
    var i;
    for (i = 0; i < elements.length; i += 1) {
      updateElement(elements[i], content, isValue, append);
    }
  }
}
function updateElement(element, content, isValue, append) {
  if (!isValue) {
    element.innerHTML = append ? (element.innerHTML + content) : content;
    return;
  }
  var nodeName = element.nodeName.toLowerCase();
  if (nodeName == "input" && element.type !== "checkbox") {
    element.value = append ? (element.value + content) : content;
  } else if (nodeName === "a" || nodeName === "img") {
    element.src = append ? (element.src + content) : content;
  } else {
    element.innerText = append ? (element.innerText + content) : content;
  }
}
