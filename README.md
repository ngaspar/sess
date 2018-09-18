# sess - simple EventSource subscription.

Lightweight (< 100 LOC) vanilla Javascript/DOM reactive mechanism proof of concept - text contents and inner HTML can be updated from server-side event stream messages, subscribing by element id or class name. The goal is to provide a fast mechanism whenever trivial updates to the DOM are required in small-footprint applications (watchdog sytems, embedded webservers, etc.) where the overhead/complexity of current reactive and stateful libraries would makes little sense or pose development/runtime obstacles.

Usage:
Import script in whatever pages you require reactive elements. Server-side methods or controllers accept one connection per page; whenever a content or HTML functionality update is in order, the server dispatches the element(s) update event message as a Json object, with the following fields:

**data:**
- _type_ - text - mandatory, indicates the type of update event (update value or HTML)
- _id_ - text - only required if updating an element by its id
- _className_ - text - only required if updating elements by a class name
- _value_ - text - only required if updating the text value/contents of elements
- _html_ - text - (escaped HTML string) only required if updating the HTML contents of elements
- _append_ - boolean or boolean text representation - mandatory, indicates whether to append the update to existing values/HTML or replace them

The 4 possible event message variations are as follows:

Update single element's text value/contents by id:
```json
{data: {
    "type": "updateValueById",
    "id": "<element id>",
    "value": "<value to update/append with>",
    "append": "<boolean>"
}}
```
Update elements text value/contents by class name:
```json
{data: {
    "type": "updateValueByClassName",
    "className": "<class name>",
    "value": "<value to update/append with>",
    "append": "<boolean>"
}}
```
Update single element's HTML contents by id:
```json
{data: {
    "type": "updateHTMLById",
    "id": "<element id>",
    "html": "<escaped HTML string>",
    "append": "<boolean>"
}}
```
Update elements HTML contents by class name:
```json
{data: {
    "type": "updateHTMLByClassName",
    "className": "<class name>",
    "html": "<escaped HTML string>",
    "append": "<boolean>"
}}
```

Server event message headers only need to declare the content type as text/event-stream, and no cache control.

PHP server example:
```php
<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
echo "data: {"type": "updateValueById", "id": "totalUsersLastMonth", "value": "3092287"}\n\n";
flush();
?>
```

If EventSource is not supported (IE and Opera browsers: I'm looking at you), it reverts to a less-than-ideal but working polling mechanism. The server endpoint will have to account for these situations and expose a(n alternative) path/method that actively listens for the polling Ajax GET requests and replies with messages in the format described above whenever element updates are in order.

Default values:
 - _eventSourceURL_, server-side URL for update events - default is the **current URL**
 - _pollingInterval_, used only when EventSource is not supported - default is **1000 milliseconds**
 - if polling, <server-side URL + **/getElementUpdates**> is the default URL it attempts to connect to

---
## TODO
- implement proper element adapter
- add minimal extensibility
- first production-ready version
- proper documentation and a few webapp examples
