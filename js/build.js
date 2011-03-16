({
    appDir: "../",
    baseUrl: "js/",
    dir: "../../planetarium-build",
    optimize: "closure",
    optimizeCss: "none",
    
    paths: {
        "jquery": "require-jquery-1.4.4.min"
    },

    modules: [
        {
            name: "main",
            exclude: ["jquery"]
        }
    ]
})