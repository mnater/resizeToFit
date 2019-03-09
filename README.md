# resizeToFit
Resize text until it fits to its container.

## What problem does this script solve?
Under some circumstances it is difficult to set an optimal font size in CSS:

__Example1:__
You want a title to be sized in a way that it fits to the with of the screen. In CSS you'll choose to use `vw` as the unit for `font-size` and, depending on the length of the title, use a "magic number" with it. Now the title fits the line in all viewport-widths - even if you rotate your mobile device...
````html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>example1</title>
        <style type="text/css">
            h1 {
                font-size: 16vw;
                text-align: center;
            }
        </style>
    </head>

    <body>
        <h1>Wortgeflüster</h1>
    </body>
</html>
````
But you eventually decide to change this title. Then you'll have to change its `font-size`, too.

__Example2:__
You dynamically read data from a source and render it in a beautiful table. Eventually the words read from your data source are long and they overflow your table-cells. Again, you could experiment with `vw` but this is a repetitive task and repetitive tasks should be automated (there are funnier things to to).

__Example3:__
You have this table of ridiculous long german words. Again, they overflow the table-cells on small screens. OK, you could use `hyphens: auto` to enable hyphenation, but then the long words won't look so long anymore…

## How does it solve the problem?
With `resizeToFit` you'll don't have to find a magic number for `vw` or to fiddle about the font-size of your table content. `resizeToFit` scans your document for the selectors you provide and resizes text until it fits it's container.

Unlike other tools like [FitText](http://fittextjs.com) or [Fitty](https://rikschennink.github.io/fitty/), `resizeToFit` doesn't add `style="font-size: XYpx;"` to each element but rather manages the font-sizes in a site-wide stylesheet. This ensures that elements with the same selector will have the same font-size (wich is great ;-).

## Installation and usage
````html
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>example</title>
        <script src="../resizeToFit.js"></script>
        <script>
            window.addEventListener("load", function () {
                resizeToFit.init([
                    "h1"
                ]);
            });

            window.addEventListener("resize", function () {
                resizeToFit.resize();
            });

        </script>
        <style type="text/css">
            h1 {
                font-size: 16vw;
                text-align: center;
            }
        </style>
    </head>

    <body>
        <h1>Wortflüstereien</h1>
    </body>
</html>
````

`resizeToFit.init()` takes an array of CSS-selectors as input parameter and then automatically resizes the content of the selected elements.

It is very important to carefully choose the selectors. `resizeToFit` calculates the sizes per selector, thus all elements with the same selector will be resized to the same size (the smallest font-size necessary to fit all elements with this selector to their container). Therefor, if there are different elements (with different sizes) you'll need different selectors.

Also make sure to use the selector with the highest specifity (otherwise your CSS may overwrite the settings from resizeToFit).

## Listen to resizing
If the viewport-width changes font-sizes need to be recalculatet. Thus you can listen to `resize-events` and call `resizeToFit.resize()` when the event is fired:

````javascript
window.addEventListener("resize", function () {
    resizeToFit.resize();
});
````

## Caveats
*   `resizeToFit.js` isn't tested very well, yet. The font-sizes are calculated using `clientWidth` and `scrollWidth` which, depending on other CSS-properties (e.g. `padding`), may not behave the same on different browsers. Please [report any issues](https://github.com/mnater/resizeToFit/issues).