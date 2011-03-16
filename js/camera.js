
define(["constants"], function(Constants) {

    var Camera = Class.extend({

        init: function(system) {
        	this.w = 0;
        	this.h = 0;
        	this.system = system;
        	this._focusedPlanet = this.system.getPlanet("mars");
        	this._focusPlanetIndex = 0;
        	this.currentView = Constants.VIEW.SYSTEM;

        	this.resize();
        },

        update: function() {
        	this.resize();

        	if (this.currentView === Constants.VIEW.PLANET) {
        		this.changeToPlanetView();
        	}
        	if (this.currentView === Constants.VIEW.SYSTEM) {
        		this.changeToSystemView();
        	}
        },

        resize: function() {
        	this.w = $(window).width();
        	this.h = $(window).height();
        },

        /**
         * Centers and zooms on a specific planet.
         * By scaling and moving the whole solar system we simulate a zooming effect and a camera movement.
         */
        focusPlanet: function(planetName) {
        	var planet = this.system.getPlanet(planetName),
        	    s = 1;

        	this._focusedPlanet = planet;
        	this._focusedPlanetIndex = this.system.getPlanetIndex(planetName);

        	if(this.w < 1100) {
        	    s = 0.6;
        	} else if(this.w < 1300) {
        	    s = 0.8;
        	} else if(this.w < 1500) {
        	    s = 0.9;
        	}

        	var m = (1 / planet.m) * s; // System scale factor when the focused planet is at scale 1
        	this.system.scale(m);

        	this.system.distance = this.w;
        	var distanceFromLeftToPlanet = this.system.getDistanceTo(planetName);

        	var x = -distanceFromLeftToPlanet - Constants.IMG_SIZE * s;
        	var y = (this.h / 2) - (Constants.IMG_SIZE / 2); // The focused planet must be in the center of the Y axis
        	this.system.move(x, y);

        	this.currentView = Constants.VIEW.PLANET;
        },

        focusPlanetIndex: function(index) {
        	var planet = this.system.getPlanetAt(index);
        	this.focusPlanet(planet.getName());
        },

        focusNextPlanet: function() {
        	var newIndex = this._focusedPlanetIndex + 1;
        	var lastPlanetIndex = this.system.getNbPlanets() - 1;
        	this.focusPlanetIndex(newIndex > lastPlanetIndex ? lastPlanetIndex : newIndex);
        },

        focusPreviousPlanet: function() {
        	var newIndex = this._focusedPlanetIndex - 1;
        	this.focusPlanetIndex(newIndex < 0 ? 0 : newIndex);
        },

        getFocusedPlanet: function() {
        	return this._focusedPlanet;
        },

        setFocusedPlanet: function(name) {
        	this._focusedPlanet = this.system.getPlanet(name);
        },

        changeToSystemView: function() {
        	this.currentView = Constants.VIEW.SYSTEM;
        	this.system.fit(this.w, this.h);
        },

        changeToPlanetView: function() {
        	this.currentView = Constants.VIEW.PLANET;
        	this.focusPlanet(this._focusedPlanet.getName());
        },

        getCurrentView: function() {
        	return this.currentView;
        }
    });
    
    return Camera;
});
