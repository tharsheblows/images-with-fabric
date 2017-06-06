// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

// this probably should be teased out into different files but 


$(function() {
  console.log('hello you');
  
  var object, el;
  
  var canvas = new fabric.Canvas('playtime'),
  f = fabric.Image.filters;
  
  var chooseAnImage = new fabric.Text('No image yet. Choose one! 🐿', {selectable: false, top: 50, left: 10, fontSize: 20, fontFamily: 'Arial', textBackgroundColor: 'pink'});
  canvas.add(chooseAnImage);
  canvas.renderAll();
 
  // This adds the thumbnail to the canvas
  $('#image-list img.thumbnail').on('click', function(e){
    
      // make it fit on a phone screen
      if( $(window).width() < 550 ){
        console.log( 'hello' );
        var windowWidth = $(window).width();
        console.log(windowWidth);
        canvas.setWidth(windowWidth - 50);
        canvas.setHeight(windowWidth - 50); // it's still a square canvas
        canvas.calcOffset();
      }
      else{
        // otherwise it's a 500 x 500 canvas
        canvas.setHeight(500);
        canvas.setWidth(500);
      }
    
      // remove the text
      canvas.remove(chooseAnImage);

      var imgSrc = $(this).attr('src');
    
      // fill the canvas with the image
      fabric.Image.fromURL(imgSrc, function(oImg) {
        
        console.log( oImg );
    
        // remove the object currently on the canvas if there's one there
        if( object !== null ){
          canvas.remove( object );
          object = null;
        }
        // remove el (used for crop) if it's there
        if( el !== null ){
          canvas.remove(el);
          el = null;
        }
        // reset the crop button
        if( $('#buttons .crop') !== null ){
          $('#buttons .crop').removeClass('crop').addClass('start-crop').html('Crop');
        }
        // make the image fit
        if( oImg.height > oImg.width ){
          oImg.scaleToHeight(canvas.getHeight());
        } else {
          oImg.scaleToWidth(canvas.getWidth());
        }
        // it's not selectable
        oImg.set({'selectable' : false });
        // add it to the canvas
        canvas.add(oImg);
        // set the object variable ot oImg
        object = oImg;
        
      },  { crossOrigin: 'Anonymous' }); // thank you https://stackoverflow.com/questions/31038027/why-does-adding-crossorigin-break-fabric-image-fromurl 
       
  });
 
  // click the button to make it grayscale
  $( '#buttons' ).on( 'click', '.make-grayscale', function (e){
      e.preventDefault();
      // add filter
     applyFilter( 0, new f.Grayscale());
    $(this).removeClass('make-grayscale').addClass('unmake-grayscale').html('Ungrayscale');;
  });
  // click the button again to undo the grayscale
  $( '#buttons' ).on( 'click', '.unmake-grayscale', function (e){
      e.preventDefault();
      // add filter
     applyFilter( 0, 0 );
    $(this).removeClass('unmake-grayscale').addClass('make-grayscale').html('Grayscale');
  });
  
  // from filtertastic http://fabricjs.com/image-filter-webgl
  // this applies the filter chosen (currently only can be b&w but possible to extend, see link above)
  function applyFilter(index, filter) {
    object.filters[index] = filter;
    object.applyFilters(canvas.renderAll.bind(canvas));
  }

  // when the save image is clicked, load in the image in an image element so it can be saved. This is a little ugly but whatever.
  $( 'button.save-image' ).on( 'click', function (e){
      console.log( object );
      e.preventDefault();
      var savedImage = new Image();
      var savedImageSrc = canvas.toDataURL({'format' : 'png', 'quality' : 1, 'multiplier': 1 / object.scaleX }); // scale it back up
      savedImage.src = savedImageSrc;
      savedImage.addEventListener('load', function() { // https://stackoverflow.com/questions/15327959/get-height-and-width-dimensions-from-base64-png
        var savedImageWidth = savedImage.width;
        var savedImageHeight = savedImage.height;
        $( 'img#saved-image' ).attr( 'src', savedImage.src ).attr( 'width', savedImageWidth / 2 ); // I want it to look nice on my monitor
      }); 
  });
  
  // crop is a two step process:
  //   1 - add the el object as an overlay to choose the crop area
  //   2 - crop the image object
    
  // this makes the el overlay to choose crop area (step 1)
  $('#buttons').on('click', '.start-crop', function (e) {

    e.preventDefault();
    if( el === null ){
      
      // it can be a pretty small crop area
      var minScaleLimit = 0.001;
      if( fabric.isTouchSupported ){
        // but if it's a mobile or you're choosing the crop area with your fingers it can't be too small (I might have really fat fingers though, who knows)
        minScaleLimit = 0.04; // it'll get waaaaay too small otherwise
      }
      
      // make the el overlay to crop
      el = new fabric.Rect({
          fill: 'rgba(0,0,0,0.35)',
          originX: 'left',
          originY: 'top',
          stroke: '#ccc',
          strokeDashArray: [2, 2],
          opacity: 1,
          width: 1,
          height: 1,
          borderColor: '#FFFF00',
          cornerColor: '#FFFF00',
          hasRotatingPoint: false,
          minScaleLimit: minScaleLimit,
          lockRotation: true, // sorry, you can't make like really super cool tilty things right now because I'm not willing to put in the work
      });
  
      // el starts off completely covering the image
      el.left = object.left;
      el.top = object.top;
      el.width = object.width;
      el.height = object.height;
      el.scaleX = object.scaleX;
      el.scaleY = object.scaleY;
    }
    else{
      // wait what? I'm not sure why this is here
      el.left = 0;
      el.top = 0;
    }
  
    // add el to the canvas
    canvas.add(el);
    // it's the active object so it can be manipulated
    canvas.setActiveObject(el);
    
    // remove the "start-crop" class and change it into the button which will do the crop
    $(this).removeClass('start-crop').addClass('crop').html('Crop it now');
  });
  
  // click the crop button once you've selected the area you want to crop and it crops the image to the dimensions of el (step 2)
  $('#buttons').on('click', '.crop', function (e) {
    e.preventDefault();
    console.log( el );
    console.log( object );
  
      var eLeft = el.get('left'); // this is in the coordinate system of the canvas
      var eTop = el.get('top'); // coordinate system of the canvas
    
      var eLeftScaled = eLeft / object.get('scaleX'); // now it's back in the coordinate system of the object
      var eTopScaled = eTop / object.get('scaleY'); // now it's back in the coordinate system of the object
    
      var oWidth = object.get('width'); // this is the full width of the object
      var oHeight = object.get('height'); // full height of the object
    
      console.log( eLeftScaled ); 
      console.log( eTopScaled ); 
  
      console.log( oWidth ); // width of the object before scaling
      console.log( oHeight ); // height of the object scaling
  
      var width = el.get('width') * el.get('scaleX') / object.get('scaleX'); // the width of the entire element * the amount you've scaled it / the scale of the object to put it back into object coordinate system
      var height = el.get('height') * el.get('scaleY') / object.get('scaleY'); // same as above but for height
    
      console.log( width );
      console.log( height );
  
      object.clipTo = function (ctx) {
          // http://fabricjs.com/docs/fabric.Object.html
          // Function that determines clipping of an object (context is passed as a first argument) Note that context origin is at the object's center point (not left/top corner)
          ctx.rect( ( -oWidth / 2 ) + eLeftScaled, (-oHeight / 2 ) + eTopScaled, width, height ); // I have an image of this, it's in assets
      }
    
      canvas.setHeight( height * object.get('scaleY') );
      canvas.setWidth( width * object.get('scaleX') );
      object.setLeft(-eLeft);
      object.setTop(-eTop);
      object.setCoords();
      canvas.renderAll();
    
    // remove the crop el
    canvas.remove(el);
    console.log( object );
  
    // change the button back to "start crop"
    $(this).removeClass('crop').addClass('start-crop').html('Crop');
  
  });

  // BAIL! Reset it all
  $('#buttons').on('click', '.reset', function(e){
     canvas.remove(el);
     canvas.remove(object);
     canvas.setHeight(500);
     canvas.setWidth(500);
  });
  
  //alert('fabric.isTouchSupported=' + fabric.isTouchSupported);
  // this is the touchscreen stuff
  // wait, why didn't I put down where I got this? dammit.
  if( typeof canvas.getActiveObject() === 'object' ){
    canvas.on('touch:gesture',function(event){
      console.log( event );
      isGestureEvent = true;  
      var lPinchScale = event.self.scale;  
      //var scaleDiff = (lPinchScale -1)/10 + 1;  // Slow down zoom speed    
      canvas.setZoom(canvas.viewport.zoom);   
  
    });
  }
  
});
