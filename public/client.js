// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

// this probably should be teased out into different files but 


$(function() {
  console.log('hello you');
  
    // from filtertastic http://fabricjs.com/image-filter-webgl
  function applyFilter(index, filter) {
    object.filters[index] = filter;
    object.applyFilters(canvas.renderAll.bind(canvas));
  }
  
  var object, el;
  
  if( $(window).width() < 550 ){
    console.log( 'hello' );
    var windowWidth = $(window).width();
    console.log(windowWidth);
    $('#playtime').width(windowWidth);
    $('#playtime').height(windowWidth); // it's still a square canvas
  }
  
  var canvas = new fabric.Canvas('playtime'),
  f = fabric.Image.filters;
  
  $('#image-list img.thumbnail').on('click', function(e){
    
      if( $(window).width() < 550 ){
        console.log( 'hello' );
        var windowWidth = $(window).width();
        console.log(windowWidth);
        canvas.setWidth(windowWidth - 50);
        canvas.setHeight(windowWidth - 50); // it's still a square canvas
        canvas.calcOffset();
      }
    
      var imgSrc = $(this).attr('src');
      fabric.Image.fromURL(imgSrc, function(oImg) {
        
        console.log( oImg );
    
      if( object !== null ){
        canvas.remove( object );
        object = null;
      }
      if( el !== null ){
        canvas.remove(el);
        el = null;
      }
      if( $('#buttons .crop') !== null ){
        $('#buttons .crop').removeClass('crop').addClass('start-crop').html('Crop');
      }
      // make it fit
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

 
  $( '#buttons' ).on( 'click', '.make-grayscale', function (e){
      e.preventDefault();
      // add filter
     applyFilter( 0, new f.Grayscale());
    $(this).removeClass('make-grayscale').addClass('unmake-grayscale').html('B&W is not cool');;
  });
  
  $( '#buttons' ).on( 'click', '.unmake-grayscale', function (e){
      e.preventDefault();
      // add filter
     applyFilter( 0, 0 );
    $(this).removeClass('unmake-grayscale').addClass('make-grayscale').html('B&W is so cool');
  });

  $( 'button.save-image' ).on( 'click', function (e){
      e.preventDefault();
      var savedImage = new Image();
      var savedImageSrc = canvas.toDataURL({'format' : 'jpeg', 'quality' : 1});
      savedImage.src = savedImageSrc;
      savedImage.addEventListener('load', function() { // https://stackoverflow.com/questions/15327959/get-height-and-width-dimensions-from-base64-png
        var savedImageWidth = savedImage.width;
        var savedImageHeight = savedImage.height;
        $( 'img#saved-image' ).attr( 'src', savedImage.src ).attr( 'width', savedImageWidth / 2 ); // I want it to look nice on my monitor
        console.log('saved image:');
        console.log(savedImage);
      }); 
  });
  

  

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
  
  canvas.remove(el);
  console.log( object );

  $(this).removeClass('crop').addClass('start-crop').html('Crop');

});
  
  $('#buttons').on('click', '.start-crop', function (e) {

    e.preventDefault();
    if( el === null ){

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
          minScaleLimit: 0.001,
      });
  
      el.left = object.left;
      el.top = object.top;
      el.width = object.width;
      el.height = object.height;
      el.scaleX = object.scaleX;
      el.scaleY = object.scaleY;
    }
    else{
      el.left = 0;
      el.top = 0;
    }
  
    canvas.add(el);
    canvas.setActiveObject(el);
    $(this).removeClass('start-crop').addClass('crop').html('Crop it now');
  });
  
 $('#buttons').on('click', '.reset', function(e){
    canvas.remove(el);
    canvas.remove(object);
    canvas.setHeight(500);
    canvas.setWidth(500);
 });
  
});
