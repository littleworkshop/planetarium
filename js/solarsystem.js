
define(["constants", "planet"], function(Constants, Planet) {

    var SolarSystem = Class.extend({
        DEFAULT_HEIGHT: 300, // Default distance from the top of the screen (in pixels)
    
        /**
         * Creates the solar system
         */
        init: function() {
            this.planets = {
        		mercury: new Planet("mercury", 0.4, 0),
        		venus: new Planet("venus", 0.9, 0),
        		earth: new Planet("earth", 1, 0),
        		mars: new Planet("mars", 0.53, 0),
        		jupiter: new Planet("jupiter", 11.2, 0),	
        		saturn: new Planet("saturn", 9.4, 90),
        		uranus: new Planet("uranus", 4, 0),	
        		neptune: new Planet("neptune", 3.8, 0)
        	};

        	this.planetPositions = {};
        	this.planetsOrder = ["mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune"];
        	this.planetsDistance = [46001200, 107476259, 147098290, 206669000, 740573600, 1353572956, 2748938461, 4452940833];

        	this.distance = 100; // Default distance between planets
        	this.multiplier = 1; // Default planet scale multiplier
        },

        getPlanet: function(name) {
    	    return this.planets[name];
        },

        getNbPlanets: function() {
    	    return this.planetsOrder.length;
        },

        getPlanetIndex: function(name) {
        	for(var i=0; i<this.planetsOrder.length; i++) {
        		if(this.planetsOrder[i] === name)
        			return i;
        	}
        	return -1;
        },

        getPlanetNameAt: function(index) {
        	if(index < 0 || index > this.planetsOrder.length-1) {
        		throw Error("This planet index is out of bounds");
        	}

        	return this.planetsOrder[index];
        },

        getPlanetAt: function(index) {
    	    return this.planets[this.getPlanetNameAt(index)];
        },

        forEachPlanet: function(f) {
        	for(var i=0; i<this.planetsOrder.length; i++) {
        		var name = this.planetsOrder[i];
        		f(this.getPlanet(name));
        	}
        },

        forEachPlanetBefore: function(planetName, f) {
        	for(var i=0; i<this.planetsOrder.length; i++) {
        		var name = this.planetsOrder[i];
        		if(name !== planetName) {
        			f(this.getPlanet(name));
        		}
        		else {
        			break;
        		}
        	}
        },

        /**
         * Moves the entire system to a top-left corner x and y position.
         * @param {number} x Horizontal position
         * @param {number} y Vertical position
         * @param {number} d Distance between planets
         */
        move: function(x, y) {
        	var d = this.distance;
        	var m = this.multiplier;
        	var self = this;
	
        	x += -(Constants.IMG_SIZE / 2) + (this.distance / 2);

        	this.forEachPlanet(function(planet) {
        	    x += planet.getDiameter(m) / 2;
        		self.planetPositions[planet.id] = { x: x, y: y };
        		planet.move(x, y);
        		x += d + planet.getDiameter(m) / 2;
        	});
        },

        /**
         * Scales the system
         * @param {float} m Multiplier
         */
        scale: function(m) {
        	this.multiplier = m;
	
        	this.forEachPlanet(function(planet) {
        		planet.scale(planet.m * m);
        	});
        },

        /**
         * Moves and scales the system so that it fits the width and height passed in as arguments.
         * @param {number} w Total width to fit
         * @param {number} h Total height to fit
         */
        fit: function(w, h) {
            if(w < 1100) {
        	    this.distance = 60;
        	} else if(w < 1300) {
        	    this.distance = 70;
        	} else if(w < 1500) {
        	    this.distance = 80;
        	} else {
        	    this.distance = 100;
        	}
    
        	var nbPlanets = this.planetsOrder.length;
        	var availableWidth = w - (nbPlanets * this.distance);
        	var diameterSum = 0;
	
        	if (availableWidth > w || availableWidth < 0) {
        		this.distance = 100;
        		availableWidth = w - (nbPlanets * this.distance);
        	}
	
        	this.forEachPlanet(function(planet) {
        		diameterSum += planet.getDiameter();
        	});
	
        	var k = availableWidth / diameterSum;
	
        	this.scale(k);
        	this.move(0, (h / 2) - (Constants.IMG_SIZE / 2));
        },

        /**
         * Get the total width (in pixels) from the left of the system to the specified planet.
         * This sums up each planet diameter and distances between planets, up to the planet passed in argument.
         * @return {number} Distance
         */
        getDistanceTo: function(planetName) {
        	var width = 0;
        	var d = this.distance;
        	var m = this.multiplier;
	
        	this.forEachPlanetBefore(planetName, function(planet) {
        		width += planet.getDiameter(m) + d;
        	});
        	return width;
        },

        getPlanetPosition: function(planetName) {
        	var pos = this.planetPositions[planetName];
	
        	pos.x += Constants.IMG_SIZE / 2;
        	pos.y += Constants.IMG_SIZE / 2;
	
        	return pos;
        },

        getPlanetDiameter: function(planetName) {
    	    return this.getPlanet(planetName).getDiameter(this.multiplier);
        },

        getPlanetScale: function(planetName) {
    	    return this.getPlanet(planetName).m * this.multiplier;
        },

        getPlanetDistanceToSun: function(index) {
            return this.planetsDistance[index];
        }
    });
    
    return SolarSystem;
});
