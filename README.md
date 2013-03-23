# HTMLsketch
This is a drawing tool I created for LADS, a project I was working on with the Brown University Graphics Group. LADS is a artwork gallery built completely on HTML/JavaScript which allows people to easily zoom in/out large artworks. I needed to create a drawing tool to allow curators to annotate the artworks but at the same time zoom in without losing quality. And therefore, a vector-graphics paint application was born!

## Features
 - Uses Raphaël SVG libraries to draw the objects
 - Uses JQuery libraries to makes things easier
 - Can do rudimetnary 'layers' and shapes drawn can be moved around
 - Eraser tool allowing paths to be erased ala mspaint  (a tool similar to this was only added to Adobe Illustrator in 2007 in CS3!)
 - Should support all modern browsers

## Todo
 - Allow resizing of shapes
 - Better layer manipulation
 - More drawing options
 
 # alt.html README
 =================
 The alt.html file contains modified drawing tools. Drawing is not done in layers, so arbitrary numbers
 of rectangles and ellipses are allowed. Shapes can be dragged and resized (by dragging the lower right corner
 of the shape). Similar to the marquee.html file, there is a marquee tool. Marquees can be manipulated in the
 same way as rectangles and ellipses. Multiple marquees can be applied, but since marquees completely cover
 the canvas, it is impossible to manipulate any but the most recent. The settings for the drawing tools are
 provided by the user.