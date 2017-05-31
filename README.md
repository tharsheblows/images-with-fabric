A test image cropper with Fabric.js
===================================

"How hard can a js image cropper be?" 

Well. This isn't working quite right but it's getting there. I like the filters.

One bit I had trouble with was calculating the object.clipTo rectangle path. The docs say this: 
>clipTo :function
>Function that determines clipping of an object (context is passed as a first >argument) Note that context origin is at the object's center point (not >left/top corner)"

I got turned around with the initial coordinates but this derivation helped immensely:
![derivation of initial coordinates for object.clipTo function ](https://cdn.glitch.com/3628bf52-fdb4-427c-81e0-bfdb061820bd%2FIMG_4481.jpg?1496221812557)


To do
------------

- add touch events
- see list in index.html

🐿
