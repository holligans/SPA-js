/*
 *spa.uti;.js
 *General Javascript utilities 
*/

/*jslint
browser: true, continue:true,
devel:true, indent: 2, maxerr: 50, 
newcap:true, nomen: true, plusplus: true,
regexp:true, sloppy:true, vars: false,
white: true
*/

/* global $, spa */

spa.util = (function(){
	var makeError, setConfigMap;
	// Begin Public constructor /makeError---------------------- 
	// Purpose:a convenience wrapper to create an error object
	// Arguments:
	// name_text - the error name
	// msg_text - long error message
	// data - optional data attached to error object
    makeError = function(name_text, msg_text, data){
    	var error = new Error();
    	error.name = name_text;
        error.message = msg_text;
        if(data){error.data = data;}
    }
    // End public constructor /makeError----------------------

    // Begin Public method /setConfigMap----------------------
    // Purpose: Common code to set configs in feature modules
    // Arguments:
    // input_map - map of key-values to set in configs
    // setteable_map - map of allowable keys to set
    // config_map - map to apply settings to
    // Return: true
    // Throws : exception if input key not allowed
    setConfigMap = function(arg_map){
    	var
    		input_map = arg_map.input_map,
    		setteable_map = arg_map.setteable_map,
    		config_map = arg_map.config_map,
    		key_name,error;
    	for(key_name in input_map){
    		if(input_map.hasOwnProperty(key_name)){
    			if(setteable_map.hasOwnProperty(key_name)){
    				config_map[key_name] = input_map[key_name];
    			}else{
    				error = makeError('Bad input','Setting config key|'+key_name+'|is not supported');
    				throw error;
    			}
    		}
    	}
    };
    // End public method /setConfigMap-------------------------
    return {
    	makeError : makeError,
    	setConfigMap : setConfigMap
    }
}());