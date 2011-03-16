
define(["raphael", "constants", "solarsystem", "camera", "satellites", "counter"],
        function(R, Constants, SolarSystem, Camera, SatelliteSystem, Counter) {
    
    var Planetarium = Class.extend({

        init: function() {
    	    this.started = false;
        	this.moving = false;

            this.currentKm = 0;
	
        	var self = this;
        	var callback = function() {
        	    self.moving = false;
        	};
	
        	$("li.planet").bind(Constants.TRANSITION_END, callback);
        },

        run: function() {
        	this.started = true;
        	this.disableTransitions(); // Disable CSS3 transitions for initial solar system setup
	
        	this.system = new SolarSystem();
        	this.camera = new Camera(this.system);
    
            this.earthGraph = new EarthSystem("earth-moon", 130, 130, 1.06);
            this.jupiterGraph = new JupiterSystem("galilean-moons", 500, 330, 0.7);
    
            this.distanceCounter = null;

            this.earthGraph.draw();
            this.jupiterGraph.draw();
    
        	this.showSystemView();
        	this.removeHiddenContentForAllPlanets();
	
        	this.enableTransitions();
	
        	this.moving = false;
        	this.userHasZoomedOnce = false;
        },

        refresh: function() {
        	if(this.started) {
        		this.camera.update();
        	}
        },

        toggleBodyClass: function() {
            var view = this.camera.getCurrentView(),
                planetName = this.camera.getFocusedPlanet().getName();
    
            if(view === Constants.VIEW.SYSTEM) {
                $("body").removeClass(planetName).addClass("system");
            }
            else { // PLANET_VIEW
                $("body").addClass(planetName).removeClass("system");
            }
        },

        getCurrentView: function() {
            return this.camera.getCurrentView();
        },
        
        onCurrentPlanetTransitionOver: function(callback) {
            var name = this.camera.getFocusedPlanet().getName(),
                currentInfo = $("#"+name+"-info"),
                transitionEndWrapper = function() {
                    callback();
                    currentInfo.unbind(Constants.TRANSITION_END, transitionEndWrapper);
                };
	
        	currentInfo.bind(Constants.TRANSITION_END, transitionEndWrapper);
        },

        showSystemView: function() {
            var self = this;
            
            if(!this.moving) {
            	this.camera.changeToSystemView();
            	this.toggleBodyClass();
            	this.hidePlanetInfo();
            	this.resetAllOtherPlanets();
	
            	this.onCurrentPlanetTransitionOver(function() {
        	        self.removeHiddenContentForAllPlanets();
        	    });
	    
            	this.moving = true;
    	
            	this.updateGalleryUI();
            }
        },

        showPlanetView: function() {
            var self = this;
            
            if(!this.moving) {
                this.camera.changeToPlanetView();
        	    this.toggleBodyClass();
            	this.hidePlanetsContentOnLeft();
            	this.hidePlanetsContentOnRight();

            	this.showPlanetInfo();

        		this.onCurrentPlanetTransitionOver(function() {
    	    	    self.removeHiddenContentForAllPlanets();
        	    });
    	
            	this.moving = true;
    	
            	this.updateGalleryUI();
            	if(!this.userHasZoomedOnce) {
            	    this.userHasZoomedOnce = true;
            	}
            }
        },

        onChangeView: function(callback) {
            this.changeview_callback = callback;
        },

        updateGalleryUI: function() {
            if(this.userHasZoomedOnce) {
                this.changeview_callback(this.getCurrentView());
            }
        },

        isPreviousPlanet: function() {
            var current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);
    
            return index > 0;
        },

        isNextPlanet: function() {
            var current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);
    
            return index < 7;
        },

        getPreviousPlanetName: function() {
            var current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);
    
            return this.system.getPlanetNameAt(index - 1);
        },

        getNextPlanetName: function() {
            var current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);
        
            return this.system.getPlanetNameAt(index + 1);
        },

        nextPlanet: function() {
            var name = "",
                self = this,
                $body = $("body");

        	if(!this.moving && this.camera.getCurrentView() === Constants.VIEW.PLANET && this.isNextPlanet()) {
        		name = this.camera.getFocusedPlanet().getName();
        		$("#"+name+"-info").addClass("left");
        		$body.removeClass(name);
		
        		this.camera.focusNextPlanet();

        		name = this.camera.getFocusedPlanet().getName();
        		$("#"+name+"-info").removeClass("right");
        		$body.addClass(name);
		
        		this.showPlanetInfo();
		
            	this.moving = true;
        	}
        },

        previousPlanet: function() {
            var name = "",
                self = this,
                $body = $("body");
    
        	if(!this.moving && this.camera.getCurrentView() === Constants.VIEW.PLANET && this.isPreviousPlanet()) {
        		name = this.camera.getFocusedPlanet().getName();
        		$("#"+name+"-info").addClass("right");
        	    $body.removeClass(name);
		
        		this.camera.focusPreviousPlanet();
        
        		name = this.camera.getFocusedPlanet().getName();
        		$("#"+name+"-info").removeClass("left");
        		$body.addClass(name);
        
        		this.showPlanetInfo();
		
            	this.moving = true;
        	}
        },

        zoomOnPlanet: function(planetName) {
        	this.camera.setFocusedPlanet(planetName);
        	this.showPlanetView();
        },

        disableTransitions: function() {
        	function doDisable(prefix) {
        		$("li.planet").css(prefix + "transition-duration", "0s");
        	}
        	doDisable("-moz-");
        	doDisable("-webkit-");
        	doDisable("-o-");	
        },

        enableTransitions: function() {
            setTimeout(function() {
            	function doEnable(prefix) {
            		$("li.planet").css(prefix + "transition-duration", "0.5s").css("-moz-transition-timing-function", "ease");
            	}
            	doEnable("-moz-");
            	doEnable("-webkit-");
            	doEnable("-o-");
        	}, 100);
        },

        createCounter: function(start, end) {
            var self = this;
    
            if(this.distanceCounter) {
                this.distanceCounter.stop();
                this.distanceCounter = null;
            }
            this.distanceCounter = new Counter($("#counters").get(0), start, end);
    
            this.distanceCounter.onStep(function(value) {
                $("#kilometers").text(addCommas(value)+" KM");
            });
            this.distanceCounter.onStop(function() {
                self.distanceCounter = null;
            });
    
            this.distanceCounter.run();
        },

        showPlanetInfo: function() {
            var name = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(name),
                start = this.currentKm,
                end = this.system.getPlanetDistanceToSun(index),
                $gui = $("#gui");
	
        	$gui.addClass("visible");
            $gui.removeClass("shrink");

            this.createCounter(start, end);
            this.currentKm = end;
    
            this.updateGraphs();
    
            // Navigation buttons visiblity
            if(name === "neptune") {
        	    $("#moveright").hide();
        	} else if(name === "mercury") {
        	    $("#moveleft").hide();
        	} else {
        	    $("#moveleft").show();
        	    $("#moveright").show();
        	}
        },

        hidePlanetInfo: function() {
            var $gui = $("#gui"),
                $starfield = $("#starfield");
            
            $gui.addClass("shrink");
        	$gui.removeClass("visible");
        	$starfield.removeClass("reset");
        	$starfield.removeClass("zoom");
	
        	this.currentKm = 0;
            this.updateGraphs();
        },

        updateGraphs: function() {
            var planetName = this.camera.getFocusedPlanet().getName(),
                view = this.camera.getCurrentView(),
                pause = false;
    
            if(view === Constants.VIEW.PLANET) {
                if(planetName === "jupiter") {
                    this.jupiterGraph.play();
                } else if(planetName === "earth") {
                    this.earthGraph.play();
                } else {
                    pause = true;
                }
            } else {
                pause = true;
            }
    
            if(pause) {
                this.earthGraph.pause();
                this.jupiterGraph.pause();
            }
        },

        resetAllOtherPlanets: function() {
            var current = this.camera.getFocusedPlanet().getName();
    
            this.system.forEachPlanet(function(planet) {
                var $info = $("#"+planet.id+"-info");
                
                $info.removeClass("left").removeClass("right");
        
                if(planet.id !== current) {
                    $info.addClass("hidden");
                }
            });
        },

        removeHiddenContentForAllPlanets: function() {
            this.system.forEachPlanet(function(planet) {
                $("#"+planet.id+"-info").removeClass("hidden");
            });
        },
        
        forPlanetsOnLeft: function(callback) {
            var self = this,
        		current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);

            for(var i=index-1; i >= 0; i -= 1) {
                (function(j) {
        			var name = self.system.getPlanetNameAt(j);
        			callback(name);	
        		})(i);
            }
        },
        
        forPlanetsOnRight: function(callback) {
            var self = this,
        		current = this.camera.getFocusedPlanet().getName(),
                index = this.system.getPlanetIndex(current);

            for(var i=index+1; i < 8; i += 1) {
                (function(j) {
        			var name = self.system.getPlanetNameAt(j);
        			callback(name);
        		})(i);
            }
        },
        
        hidePlanetsContentOnLeft: function() {
            this.forPlanetsOnLeft(function(name) {
                $("#"+name+"-info").addClass("left").addClass("hidden");
            });
        },
        
        hidePlanetsContentOnRight: function() {
            this.forPlanetsOnRight(function(name) {
                $("#"+name+"-info").addClass("right").addClass("hidden");
            });
        },
        
        hidePlanetsImageOnLeft: function() {
            this.forPlanetsOnLeft(function(name) {
        	    $("#"+name).addClass("hidden");
            });
        },
        
        hidePlanetsImageOnRight: function() {
            this.forPlanetsOnRight(function(name) {
        	    $("#"+name).addClass("hidden");
            });
        },

        changeName: function(name) {
        	$(".content h1").html(name);
        }
    });

    var JupiterSystem = SatelliteSystem.extend({
        init: function(divId, width, height, scale) {
            this._super(divId, width, height, scale);
            this.planetRadius = 10;
            this.satellites = {"io":{o: 40, r: 5, a: 25, s: 0.8, c: "#fff075"},
                               "europa":{o: 60, r: 5, a: 60, s: 0.4, c: "#75d0ff"},
                               "ganymede":{o: 90, r: 5, a: 140, s: 0.2, c: "#4bfe86"},
                               "callisto":{o: 150, r: 5, a: 250, s: 0.1, c: "#ff7575"}};
        }
    });

    var EarthSystem = SatelliteSystem.extend({
        init: function(divId, width, height, scale) {
            this._super(divId, width, height, scale);

            this.satellites = {"moon":{o: 47, r: 4.5, a: -45, s: 0.5, c: "white"}};
        }
    });
    
    /**
     * @author http://www.mredkj.com/javascript/numberFormat.html#addcommas
     */
    var addCommas = function addCommas(str) {
    	str += '';
    	x = str.split('.');
    	x1 = x[0];
    	x2 = x.length > 1 ? '.' + x[1] : '';
    	var rgx = /(\d+)(\d{3})/;
    	while (rgx.test(x1)) {
    		x1 = x1.replace(rgx, '$1' + ',' + '$2');
    	}
    	return x1 + x2;
    };

    return Planetarium;
});
