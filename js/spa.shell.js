/*
 *spa-shell.js
 *Shell module for SPA
*/

/*jslint
browser: true, continue:true,
devel:true, indent: 2, maxerr: 50, 
newcap:true, nomen: true, plusplus: true,
regexp:true, sloppy:true, vars: false,
white: true
*/

/* global $, spa */

spa.shell = (function(){
	// BEGIN MODULE SCOPE VARIABLES
	var
	configMap = {
		anchor_schema_map:{
			chat : { opened : true, closed : true }
		},
		main_html : String()
			+ '<div class="spa-shell-head">'
				+ '<div class="spa-shell-head-logo"></div>'
				+ '<div class="spa-shell-head-acct"></div>'
				+ '<div class="spa-shell-head-search"></div>'
			+ '</div>'
			+ '<div class="spa-shell-main">'
				+ '<div class="spa-shell-main-nav"></div>'
				+ '<div class="spa-shell-main-content"></div>'
			+ '</div>'
			+ '<div class="spa-shell-foot"></div>'
			+ '<div class="spa-shell-modal"></div>',
		resize_interval : 200,
    },
	stateMap = {
		$container : undefined,
		anchor_map : {},
		resize_idto : undefined
	},
	jqueryMap = {},
	copyAnchorMap, setJqueryMap, changeAnchorPart, onHashchange, 
	setChatAnchor, onClickChat, initModule, onResizer;
	// END MODULE SCOPE VARIABLES

	// BEGIN UTILITY METHODS
	// Return copy of stored anchor map
	copyAnchorMap = function(){
		return $.extend(true,{},stateMap.anchor_map);
	};
	// END UTILITY METHODS

	// BEGIN DOM METHODS

	// State : sets stateMap.is_chat_retracted
	// * true - chat is retracted
	// * false - chat is expanded

	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {
			$container: $container,
		};
	};
	// Begin DOM method/changeAnchorPart // Purpose: Change part of the URI anchor component
	// Arguments: arg_map - the map describing what part of the URI anchor we want changed
	// Returns: boolean true: the anchor portion of the URI was update --- false:the anchor portion cannot be updated
    changeAnchorPart = function(arg_map){
    	var
    		anchor_map_revise = copyAnchorMap(),
    		bool_return = true,
    		key_name, key_name_dep;

    	// Begin merge changes into anchor map
    	KEYVAL:
    	for ( key_name in arg_map ) {
  			if ( arg_map.hasOwnProperty( key_name ) ) {
    			// skip dependent keys during iteration
    			if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }
    			    // update independent key value
    				anchor_map_revise[key_name] = arg_map[key_name];
    				// update matching dependent key
    				key_name_dep = '_' + key_name;
    			if ( arg_map[key_name_dep] ) {
      				anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
    			}else {
        			delete anchor_map_revise[key_name_dep];
        			delete anchor_map_revise['_s' + key_name_dep];
				} 
			}
  		}
  		// End merge changes into anchor map


  		// Begin attempt to update URI; revert if not successful
  		try {
  		  $.uriAnchor.setAnchor( anchor_map_revise );
  		}
  		catch ( error ) {
  		  // replace URI with existing state
  		  $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
  		  bool_return = false;
  		}
  		// End attempt to update URI...
  		return bool_return;
    }
	// END DOM METHODS

	// BEGIN EVENT HANDLERS
	onResizer = function(){
		if(stateMap.resize_idto){ return true;}
		spa.chat.handleResizes();
		stateMap.resize_idto = setTimeout(
			function(){stateMap.resize_idto = undefined;},configMap.resize_interval
		)
		return true;
	}

	// Begin Event handler /onHashchange -- 
	// Purpose : Handles the hashchange event
	onHashchange = function ( event ) {
  		var
    		anchor_map_previous = copyAnchorMap(),
    		anchor_map_proposed,
    		is_ok = true,
    		_s_chat_previous, _s_chat_proposed,
    		s_chat_proposed;
  		// attempt to parse anchor
  		try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
  		catch ( error ) {
    		$.uriAnchor.setAnchor( anchor_map_previous, null, true );
    		return false;
  		}
  		stateMap.anchor_map = anchor_map_proposed;
  		// convenience vars
  		_s_chat_previous = anchor_map_previous._s_chat;
  		_s_chat_proposed = anchor_map_proposed._s_chat;
  		// Begin adjust chat component if changed
  		if ( ! anchor_map_previous || _s_chat_previous !== _s_chat_proposed ){
    		s_chat_proposed = anchor_map_proposed.chat;
    		switch ( s_chat_proposed ) {
      			case 'opened' :
        			is_ok = spa.chat.setSliderPosition('opened');
      				break;
      			case 'closed' :
        			is_ok = spa.chat.setSliderPosition('closed');
      				break;
      			default :
        			spa.chat.setSliderPosition('closed');
        			delete anchor_map_proposed.chat;
        			$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			} 
		}
		// begin revert anchor if slider change denied
		if (!is_ok){
			if(anchor_map_previous){
				$.uriAnchor.setAnchor(anchor_map_previous,null,true);
				stateMap.anchor_map = anchor_map_previous;
			}else{
				delete anchor_map_proposed.chat;
				$uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}
		return false;
	}
    // End adjust chat component if changed

	// END EVENT HANDLERS
    // BEGIN CALLBACKS
    	// begin callback method/setChatAnchor
    	// purpose: change the chat component of the anchor
    	// Arguments:position_type- may be 'closed' or 'opened'
    	// action: changes the URI anchor parameter 'chat' to the requested value 
    	setChatAnchor = function(position_type){
    		return changeAnchorPart({chat:position_type});
    	};
    // END CALLBACKS
	// BEGIN PUBLIC METHODS
	initModule = function($container){
		stateMap.$container = $container;
		$container.html(configMap.main_html);
		setJqueryMap();
        // configure uriAbchor to use our schema
		$.uriAnchor.configModule({ 
			schema_map : configMap.anchor_schema_map 
		});
		// configure and initialize feature modules
		spa.chat.configModule({
			set_chat_anchor : setChatAnchor,
			chat_model : spa.model.chat,
			people_model : spa.model.people
		});
		spa.chat.initModule(jqueryMap.$container);
		$(window).bind('resize', onResizer)
		         .bind( 'hashchange', onHashchange )
		         .trigger( 'hashchange' );
	}
	return {initModule: initModule};
	// END PUBLIC METHODS
}());
