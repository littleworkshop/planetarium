
var log = {
    level: "info",

    info: function(message) {
        if(this.level === "info" || this.level === "debug") {
            if(window.console) {
                console.info(message);
            }
        }
    },

    debug: function(message) {
        if(this.level === "debug") {
            if(window.console) {
                console.log(message);
            }
        }
    },

    error: function(message) {
        if(window.console) {
            console.error(message);
        }
    }
};