
define(["jquery"], function($) {
    
    var Counter = Class.extend({
        UPDATE_FREQ: 40,

        init: function(container, start, end, zeroes) {
            this.start = start;
            this.end = end;
            this.zeroes = zeroes || 0;

            if(container) {
                this.el = document.createElement("div");
                container.appendChild(this.el);
                $(this.el).css("opacity", start < end ? start/end : 1);
            }
        },

        onStep: function(callback) {
            this.stepCallback = callback;
        },

        onStop: function(callback) {
            this.stopCallback = callback;
        },

        zeroFill: function(number, width) {
          width -= number.toString().length;
          if (width > 0) {
            return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
          }
          return number;
        },

        run: function() {
            var self = this,
                start = this.start,
                end = this.end;

            setTimeout(function() {
                $(self.el).css("opacity", start < end ? 1 : end/start);
            }, 50);

            var updater = setInterval(function() {
                var value = Math.round($(self.el).css("opacity") * (start < end ? end : start));
                value = self.zeroes > 0 ? self.zeroFill(value, self.zeroes) : value;
                if(self.stepCallback) {
                    self.stepCallback(value);
                }
                if(self.finished) {
                   clearInterval(updater);
                }
            }, this.UPDATE_FREQ);

            var stop = function() {
                self.finished = true;
                if(self.stopCallback) {
                    self.stopCallback();
                }
            };
            this.el.addEventListener("transitionend", stop, true);
            this.el.addEventListener("webkitTransitionEnd", stop, true);
            this.el.addEventListener("oTransitionEnd", stop, true);
        },

        stop: function() {
            this.finished = true;
        }
    });
    
    return Counter;
});
