# sess - simple EventSource subscription.

Lightweight (< 100 LOC) vanilla Javascript/DOM reactive mechanism proof of concept - text contents and inner HTML can be updated from server-side event stream messages, subscribing by element id or class name. The goal is to provide a fast mechanism whenever trivial updates to the DOM are required in small-footprint applications (watchdog sytems, embedded webservers, etc.), where the overhead and complexity of current reactive/stateful RIA frameworks (with many layers of components and functionality) is unjustified or even poses development/runtime obstacles.

Usage:
Import script in whatever pages you require reactive elements and subscribe by invoking the _sessInit_ method. Server-side methods or controllers should accept one connection per open page or session (initializing the EventSource URL with a unique id per page is a simple way to keep track, for example); whenever an attribute, content or HTML functionality update is in order, the server dispatches the element(s) update event message as a plain Json (root) _data_ object, with the following fields:

**data:**
- _id_ - text - required if updating an element by its id
- _className_ - text - required if updating elements by a class name
- _attributeName_ - text - required if updating a specific attribute value/contents of the element(s)
- _attributeValue_ - text - required if updating a specific attribute value/contents of the element(s)
- _appendAttrValue_ - text - indicates whether to append the update to existing attribute values or replace them
- _html_ - text - (escaped HTML string) required if updating the HTML contents of the element(s)
- _appendHtml_ - text - indicates whether to append the update to existing HTML contents or replace them
- _text_ - text - (escaped HTML string) required if updating the text contents of the element(s)
- _appendText_ - text - indicates whether to append the update to existing text values or replace them

Some event message example variations:

Update single element's specific attribute by id and attribute name:
```json
{data: {
    "id": "<element id>",
    "attributeName": "<value to update/append with>",
    "attributeValue": "<value to update/append with>",
    "appendAttrValue": "<boolean>"
}}
```
Update elements text value/contents by class name:
```json
{data: {
    "className": "<class name>",
    "text": "<value to update/append with>",
    "appendText": "<boolean>"
}}
```
Update single element's HTML contents and a specific attribute, by id and attribute name:
```json
{data: {
    "id": "<element id>",
    "html": "<escaped HTML string>",
    "appendHtml": "<boolean>",
    "attributeName": "<value to update/append with>",
    "attributeValue": "<value to update/append with>"
}}
```

Server event message headers only need to declare the content type as text/event-stream and no cache control. An optional connection _retry_ timeout in milliseconds can also be included in the message.

PHP server example:
```php
<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$time = date('r');
echo "retry: 2000\n";
echo "data: {"id": "emailInput", "attributeName": "class", "attributeValue": "inputMissingError"}\n\n";
flush();
?>
```

If EventSource is not supported (IE and Opera browsers: I'm looking at you), it reverts to a less-than-ideal but working polling mechanism. The server endpoint will have to account for these situations and expose a(n alternative) path/method that actively listens for the polling Ajax GET requests and replies with messages in the format described above whenever element updates are in order.

Default values:
 - _eventSourceURL_, server-side URL for update events - default is the **current URL**
  (if polling, the same URL will be used for the server calls)
 - _pollingInterval_, used only when EventSource is not supported - default is **1000 milliseconds**

---
## TODO
- implement proper element adapter
- add minimal extensibility
- first production-ready version
- proper documentation and a few webapp examples
