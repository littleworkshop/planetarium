
define(["raphael"], function(R) {
    
    var SatelliteSystem = Class.extend({
        ANIMATION_INTERVAL: 20,
        DEFAULT_PLANET_RADIUS: 20,
        DEFAULT_PLANET_COLOR: "white",
        DEFAULT_ORBIT_COLOR: "white",

        init: function(divId, width, height, scale) {
            this.r = R(divId, width, height);
            this.scale = scale || 1;
            this.animation = null;
            this.x = (width / 2) * this.scale;
            this.y = (height / 2) * this.scale;
            this.orbitStyle = { stroke: this.DEFAULT_ORBIT_COLOR };
            this.planetStyle = { "stroke-width": 0, fill: this.DEFAULT_PLANET_COLOR };
            this.setPlanetRadius(this.DEFAULT_PLANET_RADIUS);
            this.satellites = {};
        },

        setPlanetRadius: function(radius) {
            this.planetRadius = radius * this.scale;
        },

        forEachSatellite: function(callback) {
            for(var name in this.satellites) {
                if(this.satellites.hasOwnProperty(name)) {
                    callback(this.satellites[name]);
                }
            }
        },

        drawPlanet: function() {
            this.r.circle(this.x, this.y, this.planetRadius).attr(this.planetStyle);
        },

        drawOrbits: function() {
            var self = this,
                f = this.scale;

            this.forEachSatellite(function(s) {
                self.r.circle(self.x, self.y, s.o * f).attr(self.orbitStyle);
            });
        },

        drawSatellites: function() {
            var self = this,
                f = this.scale;

            this.forEachSatellite(function(s) {
                s.e = self.r.circle(self.x + (s.o * f), self.y, s.r * f)
                            .attr({ "stroke-width": 0, fill: s.c})
                            .rotate(s.a, self.x, self.y);
            });
        },

        draw: function() {
            this.drawPlanet();
            this.drawOrbits();
            this.drawSatellites();
        },

        play: function() {
            var self = this;

            if(!this.animation) {
                this.animation = setInterval(function() {
                    self.forEachSatellite(function(s) {
                        s.e.rotate(s.a, self.x, self.y);
                        s.a += s.s;
                    });
                }, this.ANIMATION_INTERVAL);
            }
        },

        pause: function() {
            if(this.animation) {
                clearInterval(this.animation);
                this.animation = null;
            }
        }
    });

    return SatelliteSystem;
});
