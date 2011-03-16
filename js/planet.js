
define(["transformable", "constants"], function(Transformable, Constants) {

	var Planet = Transformable.extend({
		getName: function() {
			return this.id;
		},

		getDiameter: function(scale) {
			if (scale === undefined) {
				scale = 1;
			}
			var diameter = Constants.IMG_SIZE * this.m * scale;
			return diameter;
		}
	});

	return Planet;
});