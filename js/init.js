
define(["jquery", "constants", "planetarium"], function($, Constants, Planetarium) {
    
    $(document).ready(function() {
        var demo = null,
            readyToFadeIn = false,
            
            messageHandlers = {
                start_demo: function() {
                    var waiting = setInterval(function() {
                        if(readyToFadeIn) {
                            playFadeInIntro();
                            clearInterval(waiting);
                        } else {
                            log.debug("Loading assets...");
                        }
                    }, 100);
                },
                stop_demo: function() {
                    postToParent("finished_exit");
                }
            },
            
            postToParent = function(message) {
                window.parent.postMessage(message, '*');
                log.debug("Sent : "+message);
            },

            initDemo = function() {
                window.addEventListener("message", function(event) {
                    var message = event.data;
                    if(message in messageHandlers) {
                        log.debug("Received : " + message);
                        messageHandlers[message]();
                    }
                }, false);
                
                $(document).bind("keydown", function() { return false; }); // Prevent any keyboard interaction while the demo is loading
                
                postToParent("loaded"); // Tell the demo gallery we're ready to go
                loadImages(onImagesLoaded);
            
                if(window === window.top) {
                    // If we're not in a iframe, fake an incoming message from the demo gallery
                    window.postMessage("start_demo", '*');
                }
            },
        
            loadImages = function(onload_callback) {
                var images = ["mercury.jpg", "venus.jpg", "earth.jpg", "mars.jpg", "jupiter.jpg", "saturn.png", "uranus.png", "neptune.jpg"],
                    loadedCount = 0;
            
                for(var i=0, nb=images.length; i < nb; i += 1) {
                    var filename = images[i],
                        name = filename.split('.')[0],
                        filetype = filename.split('.')[1],
                        $li = $("#"+ name),
                        $div = $("<div class=\"clipmask\"></div>"),
                        $img = $("<img src=\"img/"+ filename +"\" alt=\"\">");
                
                    if(filetype === "png") { // PNGs don't need a clipmask
                        $li.append($img);
                    } else {
                        $div.append($img);
                        $li.append($div);
                    }
                
                    $img.bind("load", function () {
                        loadedCount += 1;
                        if(loadedCount === nb) {
                            setTimeout(function() {
                                onload_callback();
                            }, 1000); // Fake loading time
                        }
                    });
                }
            },
        
            startDemo = function(ready_callback) {
                demo = new Planetarium();
            	demo.onChangeView(function(view) {
            	    if(view === Constants.VIEW.SYSTEM) {
           	            postToParent("show_exit_ui");
            	    } else {
            	        postToParent("hide_exit_ui");
            	    }
            	});
            	demo.run();

                $("#previous").click(function() {
                	demo.previousPlanet();
                });

                $("#next").click(function() {
                	demo.nextPlanet();
                });

                $("#back").click(function() {
                	if(demo.getCurrentView() === Constants.VIEW.PLANET) {
                	    demo.showSystemView();
                    }
                });

                $("li.planet").click(function() {
                    if(demo.getCurrentView() === Constants.VIEW.SYSTEM) {
                	    demo.zoomOnPlanet(this.id);
                	}
                });

                $("#moveleft").mousemove(function(e){
                    var y = e.pageY;
                    $("#previous").css("top" , y + "px"); 
                });

                $("#moveleft").mouseleave(function() {
                    $("#previous").css("top" , "50%"); 
                });

                $("#moveright").mousemove(function(e){
                    var y = e.pageY;
                    $("#next").css("top" , y + "px"); 
                });

                $("#moveright").mouseleave(function() {
                    $("#next").css("top" , "50%"); 
                });

                var toggleCredits = function() {				
                	var $togglespan = $("#toggle-credits span");
				
                	if($("body").hasClass("showcredits")) {
                		$togglespan.html("back to demo");					
                	} else {
                		$togglespan.html("view credits");
                	}
                };

                $("#toggle-credits").click(function() {	
                	var $body = $("body");

                	if($body.hasClass("showcredits")) {
                		$("ul#planets").addClass("delayed");
                		$("#instructions").addClass("delayed");
                		$("#credits").removeClass("alwaysontop");
                		$body.removeClass("showcredits");
	
                		setTimeout(function() {
                			$("ul#planets").removeClass("delayed");
                			$("#instructions").removeClass("delayed");
                		}, 1000);					
	
                	} else {
                		$body.addClass("showcredits");
	
                		setTimeout(function() {
                			$("#credits").addClass("alwaysontop");						
                		}, 1000);
                	}

                	toggleCredits();
                });

                $("#title").click(function() {
                	var $body = $("body");

                	if($body.hasClass("showcredits")) {
                		$("ul#planets").addClass("delayed");
                		$("#instructions").addClass("delayed");
                		$("#credits").removeClass("alwaysontop");					
                		$body.removeClass("showcredits");					
	
                		setTimeout(function() {
                			$("#instructions").removeClass("delayed");
                			$("ul#planets").removeClass("delayed");
                		}, 1000);					
                	}
	
                	toggleCredits();
                });

                $(window).resize(function() {
                	demo.refresh();
                });

                $(document).unbind("keydown").bind("keydown", function(e) {
                	var key = e.which;
                    var keys = [32, 37, 38, 39, 40];

                    if(keys.indexOf(key) !== -1) {
                        switch(key) {
                            case 32: // Spacebar
                                break;
                            case 37: // Left
                        		demo.previousPlanet();
                        		break;
                            case 39: // Right
                        	    demo.nextPlanet();
                        	    break;
                        	case 38: // Up
                        	    if(demo.getCurrentView() === Constants.VIEW.SYSTEM) {
                           	        demo.showPlanetView();
                        	    }
                        	    break;
                        	case 40: // Down
                        	    if(demo.getCurrentView() === Constants.VIEW.PLANET) {
                           	        demo.showSystemView();
                        	    }
                        	    break;
                        }
                	    return false;
                    }
                });
            
            	ready_callback();
            },
        
            onImagesLoaded = function() {
                startDemo(function() {
                    readyToFadeIn = true;
                });
            },
            
            playFadeInIntro = function() {
                $("#spinner").remove();
                $("#planets").removeClass("loading");
                setTimeout(function() {
                	$("#instructions").removeClass("loading");
						setTimeout(function() {
                			$("#toggle-credits").removeClass("loading");
						}, 800);
				}, 1000);
            };
            
        initDemo();
    });

    $(window).mousedown(function(e) {
        if(e.which === 2) {
            e.preventDefault();
        }
    });
});
