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

/* global $, spa, getComputedStyle */

spa.chat = (function(){
	// Begin module scope variables
	var
		configMap = {
			main_html: String()
				+ '<div class="spa-chat">'
				    + '<div class="spa-chat-head">'
				        + '<div class="spa-chat-toogle">+</div>'
                        + '<div class="spa-chat-head-title">'
                            + 'Chat'
                        + '</div>'
                    + '</div>'
                    + '<div class="spa-chat-closer">X</div>'
                    + '<div class="spa-chat-sizer">'
                        + '<div class="spa-chat-msgs"></div>'
                        + '<div class="spa-chat-box">'
                             + '<input type="text"/>'
                             + '<div>send</div>'
                        + '</div>'
                    + '</div>'
                + '</div>',
            setteable_map : {
                slider_open_time: true,
                slider_close_time: true,
                slider_opened_em: true,
                slider_closed_em: true,
                slider_opened_title: true,
                slider_closed_title: true,

                chat_model: true,
                people_model: true,
                set_chat_anchor: true,
            },

            slider_open_time: 250,
            slider_close_time: 250,
            slider_opened_em: 18,
            slider_closed_em: 2,
            slider_opened_min_em : 10,
            window_height_min_em : 20,
            slider_opened_title: "Click to close",
            slider_closed_title: "Click to open",

            chat_model: null,
            people_model: null,
            set_chat_anchor: null,
		},
		stateMap = { 
            $append_target :null,
            position_type : 'closed',
            px_per_em: 0,
            slider_hidden_px: 0,
            slider_closed_px: 0,
            slider_opended_px: 0
        },
		jqueryMap={}, 
        setJqueryMap, getEmSize,setPxSizes, setSliderPosition,
        onClickToggle,configModule, initModule, removeSlider, handleResizes;
	// End module scope variables

	// Begin utility methods-----------------
    // Purpose:Convert em units to pixel so we can use measurements in Jquery
    getEmSize = function(elem){
        return Number(
            getComputedStyle(elem,'').fontSize.match(/\d*\.?\d*/)[0]
        );
    }
    // End utility methods-------------------
    
    // Begin DOM methods---------------------
    	// setJqueryMap method Purpose:cache DOM elements for future use
        setJqueryMap = function(){
    		var 
            $append_target = stateMap.$append_target,
            $slider = $append_target.find('.spa-chat');

            jqueryMap = {
                $slider : $slider,
                $head : $slider.find('.spa-chat-head'),
                $toggle : $slider.find('.spa-chat-head-toggle'),
                $title : $slider.find('.spa-chat-head-title'),
                $sizer : $slider.find('.spa-chat-sizer'),
                $msgs : $slider.find('.spa-chat-msgs'),
                $box : $slider.find('.spa-chat-box'),
                $input : $slider.find('.spa-chat-input input[type=text]'),
            };
        };
        // Begin setPxSizes method
        // Purpose: Calculate the pixel sizes for elements managed by this module
        setPxSizes = function(){
            var px_per_em, opened_height_em, window_height_em;
            px_per_em = getEmSize(jqueryMap.$slider.get(0));
            opened_height_em = configMap.slider_opened_em;
            window_height_em = Math.floor(
                ($(window).height() / px_per_em) + 0.5
            );
            opened_height_em = window_height_em > configMap.window_height_min_em ? configMap.slider_opened_em : configMap.slider_opened_min_em;
            stateMap.px_per_em = px_per_em;
            stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
            stateMap.slider_opended_px = opened_height_em * px_per_em;
            jqueryMap.$sizer.css({
                height: (opened_height_em - 2) * px_per_em
            });
        }
        // Begin handleResizes method
        // purpose  given a window resize event, adjust the presentation provide by this module if needed
        handleResizes = function(){
            if(!jqueryMap.$slider){ return false;}
            setPxSizes();
            if(stateMap.position_type === 'opened'){
                jqueryMap.$slider.css({ height : stateMap.slider_opened_px});
            }
            return true;
        }

        // Begin setSliderPosition method
        // Purpose: Move the chat to the requested position
        // return true -- the requested position was achieved
        // return false -- the requested position was not achieved 
        setSliderPosition = function(position_type, callback){
            console.log("slider");
            var 
                height_px, animate_time, slider_title, toggle_text;
            //return true if the slider already in requested position
            if(stateMap.position_type === position_type){
                return true;
            }
            //prepare animate parameters
            switch (position_type){
                case 'opened':
                    height_px = stateMap.slider_opended_px;
                    animate_time =  configMap.slider_open_time;
                    slider_title = configMap.slider_opened_title;
                    toggle_text = '=';
                break;

                case 'hidden':
                    height_px = 0;
                    animate_time = configMap.slider_open_time;
                    slider_title = '';
                    toggle_text = '+';
                break;

                case 'closed':
                    height_px = stateMap.slider_closed_px;
                    animate_time = configMap.slider_close_time;
                    slider_title = configMap.slider_closed_title;;
                    toggle_text = '+';
                break
                //Bail for unkwon position_type
                default: return false;
            }
            //Animate slider position change
            stateMap.position_type = '';
            jqueryMap.$slider.animate(
                { height : height_px},
                animate_time,
                function(){
                    jqueryMap.$toggle.prop('title', slider_title);
                    jqueryMap.$toggle.text(toggle_text);
                    stateMap.position_type = position_type;
                    if(callback){ callback(jquery.$slider);}
                }
            );
            return true;
        };
    // End DOM methods-----------------------

    // Begin event handlers methods-----------
    onClickToggle = function(event){
        var set_chat_anchor = configMap.set_chat_anchor;
        if(stateMap.position_type === 'opened'){
            set_chat_anchor('closed');
        }
        else if(stateMap.position_type === 'closed'){
            set_chat_anchor('opened');
        }return false;
    }
    // End event handlers methods-------------

    // Begin public methods-------------------
    	// configModule method---Purpose: Adjust configuration of allowed keys
    	configModule = function(input_map){
            console.log("config");
    		spa.util.setConfigMap({     //See spa.util.js
    			input_map : input_map,
    			setteable_map : configMap.setteable_map,
    			config_map : configMap
    		});
    		return true;
    	};
    	//Begin initModule method
        // Purpose: Initialize the module
        // Arguments $append_target a Jquery collection that represent a single DOM container
                // 
    	initModule = function($append_target){
            console.log("init");
    		$append_target.append(configMap.main_html);
    		stateMap.$append_target = $append_target;
    		setJqueryMap();
            setPxSizes();

            // initialize chat slider to default title and state
            jqueryMap.$toggle.prop('title' , configMap.slider_closed_title);
            jqueryMap.$head.click(onClickToggle);
            stateMap.position_type = 'closed';
            return true;
    	}
        //Begin removeSlider method
        // Purpose Remove chatslider Dom element revert to initial state remoce callback
        removeSlider = function() {
            // unwind initialization and state
            // remove DOM container(this removes event bindings too)
            if(jqueryMap.$slider){
                jqueryMap.$slider.remove();
                jqueryMap = {};
            }
            stateMap.$append_target = null;
            stateMap.position_type = 'closed';

            //unwind configurations
            configMap.chat_model = null;
            configMap.people_model = null;
            configMap.set_chat_anchor = null;
            return true
        }
    // Return public methods of SPA.CHAT module
    return{
        setSliderPosition : setSliderPosition,
    	configModule : configModule,
    	initModule : initModule,
        removeSlider : removeSlider,
        handleResizes : handleResizes
    };
    // End public methods---------------------
}());