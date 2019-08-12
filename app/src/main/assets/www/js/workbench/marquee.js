  var marqueeSpawned = [];
  
  function marqueeObj (newElement) {
    this.el = newElement;
    this.counter = 0;
    this.getPosition = getCurrentPosition;
    this.name = "";
    this.timeLeft = 0;
    this.currentPos = 0;
    this.distanceLeft = 0;
    this.totalLength = 0;
    this.contentWidth = 0;
    this.endPoint = 0;
    this.duration = 0;
    this.hovered = false;
  }


  function getCurrentPosition() {
    this.currentPos = parseInt($(this.name).css('margin-left'));
    return this.currentPos;
  }

  function createMarquee(settings) {

      var defaults = {
        duration: 20000,
        padding: 10,
        marquee_class: '.notice',
        container_class: '.NoticeDiv',
        sibling_class: 0,
        hover: true
      };

      var config = $.extend({}, defaults, settings);


      if($(config.marquee_class).width() == 0){
        console.error('FATAL: marquee css or children css not correct. Width is either set to 0 or the element is collapsing. Make sure overflow is set on the marquee, and the children are postitioned relatively');
        return;
      }

      if(typeof $(config.marquee_class) === 'undefined'){
        console.error('FATAL: marquee class not valid');
        return;
      }

      if(typeof $(config.container_class) === 'undefined'){
        console.error('FATAL: marquee container class not valid');
        return;
      }

      if(config.sibling_class != 0 && typeof $(config.sibling_class) === 'undefined'){
        console.error('FATAL: sibling class container class not valid');
        return;
      }


      var marqueeContent =  $(config.marquee_class).html()
      var containerWidth = $(config.container_class).width();
      var contentWidth = $(config.marquee_class).width();

      var widthToIgnore = 0;
      if (config.sibling_class == 0) { 
        var widthToIgnore = 0;
      } else {
        var widthToIgnore = $(config.sibling_class).width();
      }

      var endPoint = -(contentWidth - widthToIgnore);
      var totalLength =  containerWidth - endPoint;

      var spawnAmount = Math.ceil(containerWidth / contentWidth);
      //init vars from input


//      console.log(config);

      $(config.marquee_class).remove();

//      if(spawnAmount<2){
//          spawnAmount =2;
//      }
      //initialise positions counters, content 

      for (var i = 0; i < spawnAmount; i++) {

    	  var newElement;
    	  //--------------------------------------
          if(config.hover == true){

            newElement = $('<div class="notice-' + (i+1) + '">' + marqueeContent + '</div>');             
            
            newElement.mouseenter(function() {

                for (var key in marqueeSpawned){
                  marqueeSpawned[key].el.clearQueue().stop();
                  marqueeSpawned[key].hovered = true;
                }

            })
            .mouseleave(function() {

                for (var key in marqueeSpawned){
                  marqueeManager(marqueeSpawned[key]);   
                } 

            });

            
          } else {

            newElement = $('<div class="notice-' + (i+1) + '">' + marqueeContent + '</div>') ;   

          }
          //--------------------------------------------------
          var marqueeLi = newElement.find(".goto_notice_detail_id");
          for (var j = 0; j < marqueeLi.length; j++){   
          	var li = marqueeLi[j];
          	$(li).bind("tap",function() {
        		var noticeId = $(this).attr("rel");
        		session.set("noticeId", noticeId);
        		goto_page("notice_detail_page");
            });
          }
          
          marqueeSpawned[i] = new marqueeObj(newElement);

          $(config.container_class).append(newElement);

          marqueeSpawned[i].currentPos = (widthToIgnore + (contentWidth*i))+(config.padding*i);  //initial positioning
          marqueeSpawned[i].name = '.notice-'+(i+1); 

          marqueeSpawned[i].totalLength = totalLength;  
          marqueeSpawned[i].containerWidth = containerWidth;  
          marqueeSpawned[i].contentWidth = contentWidth;  
          marqueeSpawned[i].endPoint = endPoint;  
          marqueeSpawned[i].duration = config.duration;  

          $(marqueeSpawned[i].name).css('margin-left', marqueeSpawned[i].currentPos+config.padding +'px'); //setting margin according to postition

          
          marqueeManager(marqueeSpawned[i]);
          
          return marqueeSpawned;
      }

  }

  function marqueeManager(marqueed_el) {
        
        if (marqueed_el.hovered == false) { 

            if (marqueed_el.counter > 0) {  //this is not the first loop
              
                marqueed_el.timeLeft = marqueed_el.duration;
                marqueed_el.el.css('margin-left', marqueed_el.containerWidth +'px'); //setting margin according to postition
                marqueed_el.currentPos = marqueed_el.containerWidth; //setting margin according to postition

            } else {    // this is the first loop
              marqueed_el.timeLeft = (((marqueed_el.totalLength - (marqueed_el.containerWidth - marqueed_el.getPosition()))/ marqueed_el.totalLength)) * marqueed_el.duration;
            }

        } else {
              marqueed_el.hovered = false;
              marqueed_el.currentPos = parseInt(marqueed_el.el.css('margin-left'));
              marqueed_el.distanceLeft = marqueed_el.totalLength - (marqueed_el.containerWidth - marqueed_el.getPosition());
              marqueed_el.timeLeft = (((marqueed_el.totalLength - (marqueed_el.containerWidth - marqueed_el.currentPos))/ marqueed_el.totalLength)) * marqueed_el.duration;
        }

    marqueeAnim(marqueed_el);
  }

  function marqueeAnim (marqueeObject){
    marqueeObject.counter++;
    marqueeObject.el.clearQueue().animate({'marginLeft': marqueeObject.endPoint+'px'}, marqueeObject.timeLeft, 'linear', function(){marqueeManager(marqueeObject)});
  }



