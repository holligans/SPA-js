/*
 *spa.chat.js
 *Chat feature modelu for SPA
*/

/*jslint
browser: true, continue:true,
devel:true, indent: 2, maxerr: 50, 
newcap:true, nomen: true, plusplus: true,
regexp:true, sloppy:true, vars: false,
white: true
*/

/* global $, spa */

spa.chat = (function(){
	// Begin module scope variables
	var
		configMap = {
			main_html: String()
				+ 'div style="padding:1em; color:#fff;">'
				+ 'Hello prink fuck'
				+ '</div>',
			setteable_map : {}
		},
		stateMap = { $container : null},
		jqueryMap, configModule, initModule;
	// End module scope variables

	// Begin utility methods-----------------
    // End utility methods-------------------
    
    // Begin DOM methods---------------------
    	// setJqueryMap method
    	setJqueryMap = function(){
    		var $container = stateMap.$container;
    		jqueryMap = {$container : $container};
    	};
    // End DOM methods-----------------------

    // Begin event handlers methods-----------
    // End event handlers methods-------------

    // Begin public methods-------------------
    	// configModule method---Purpose: Adjust configuration of allowed keys
    	configModule = function(input_map){
    		spa.util.setConfigMap({     //See spa.util.js
    			input_map : input_map,
    			setteable_map : configMap.setteable_map,
    			config_map : configMap
    		});
    		return true;
    	};
    	//Begin initModule method
    	initModule = function($container){
    		$container.html(configMap.main_html);
    		stateMap.$container = $container;
    		setJqueryMap();
    		return true;
    	}
    // Return public methods of SPA.CHAT module
    return{
    	configModule : configModule,
    	initModule : initModule
    }
    // End public methods---------------------
})