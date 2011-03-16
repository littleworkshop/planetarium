
define(function() {
	/**
	 * Transformable represents a DOM element on which CSS3 transforms are applied.
	 */
	var Transformable = Class.extend({
		init: function(id, scale, angle) {
			this.id = id;
			this.m = scale;
			this.s = scale;
			this.r = angle;

			this.x = 0;
			this.y = 0;

			this.transform();
		},

		transform: function() {
			var id = this.id,
				x = this.x,
				y = this.y,
				s = this.s;
			r = this.r;

			function doTransform(prefix) {
				$("#" + id).css(prefix + "transform", "translateX(" + x + "px) translateY(" + y + "px) scale(" + s + ") rotate(" + r + "deg)");
			}
			doTransform("-moz-");
			doTransform("-webkit-");
			doTransform("-o-");
		},

		move: function(x, y) {
			this.x = x;
			this.y = y;
			this.transform();
		},

		moveX: function(x) {
			this.x = x;
			this.transform();
		},

		moveY: function(y) {
			this.y = y;
			this.transform();
		},

		scale: function(s) {
			this.s = s;
			this.transform();
		}
	});

	return Transformable;
});
