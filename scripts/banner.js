/**
 * TACTIC™ Creative Library
 * Copyright (C) 2023 TACTIC™ Real-Time Marketing <https://tacticrealtime.com/>
 * Licensed under GNU GPL <https://tacticrealtime.com/license/sdk/>
 */

(/**
 * @param {tactic} tactic
 */
function (tactic) {

	var

		// Lend TACTIC container namespace.
		container = tactic.container,

		// Lend TACTIC utility namespace.
		utils = (tactic.utils || tactic.utilities),

		/**
		 * @type {Array}
		 */
		images = [],

		/**
		 * @type {Object}
		 */
		styles = {},

		/**
		 * @type {String}
		 */
		mode = null,

		/**
		 * @type {String}
		 */
		purpose = null,

		/**
		 * @type {String}
		 */
		compression = null,

		/**
		 * @type {Object}
		 */
		editor = {},

		/**
		 * Watch for all kinds of layer events.
		 *
		 * @function
		 * @param event {Event}
		 * @param event.type {String}
		 * @param event.detail {Object}
		 */
		bannerEventHandler = function (event) {

			var

				/**
				 * @type {(tactic.builder.layers.AbstractLayer|tactic.builder.layers.BannerLayer|tactic.builder.layers.SequenceLayer|tactic.builder.layers.FrameLayer|tactic.builder.layers.ImageLayer|tactic.builder.layers.TextLayer|tactic.builder.layers.VideoLayer)}
				 */
				layer = this;

			// Validate layer target and event type.
			if (layer.target && event.type) {

				// Look for layer key.
				switch (layer.key) {

					// In case it is root banner.
					case ('BN'):

						// Look for event type.
						switch (event.type) {

							// If layer was created.
							case ('set'):

								// Initialise layer.
								layer.init();

								break;

							// If layer was successfully propertised.
							case ('propped'):

								// Set banner mode globally.
								mode = layer.root.props.mode.get();

								// Add "mode_debug" attribute to root layer in order to highlight layer bounds.
								layer.addAttr('mode_' + mode, { name: 'mode_' + mode, global: true });

								// Set banner purpose globally.
								purpose = layer.root.props.purpose.get();

								// Add "mode_debug" attribute to root layer in order to highlight layer bounds.
								layer.addAttr('purpose_' + purpose, { name: 'purpose_' + purpose, global: true });

								// Set banner compression globally.
								compression = layer.root.props.compression.get();

								// Add "compression" attribute to root layer.
								layer.addAttr('compression_' + compression, { name: 'compression_' + compression, global: true });

								var

									/**
									 * @type {String}
									 */
									name = 'name_' + layer.getMacros()['name'];

								// Add "compression" attribute to root layer.
								layer.addAttr(name, { name: name, global: true });

								break;

							// If layer was successfully initialised.
							case ('init'):

								// Preload feeds.
								layer.preload();

								break;

							// If layer was successfully preloaded.
							case ('preload'):

								// Build layer structure.
								layer.build();

								// Actuate root banner layer.
								layer.actuate();

								break;

							// In case of layer build event (when layer data is parsed and new layer instance needs to be created).
							case ('build'):

								// Check if additional detail is passed.
								// You are able to add new layer below and return it back to Banner constructor the way you want.
								// If nothing returned to Banner constructor, Banner will try to create new layer automatically.
								if (event.detail) {

									// Look for layer key and do manipulations with data layers.
									switch (event.detail.key) {

										// Look for sequence layer.
										case 'SQ':

											// // Check if primary feed is available.
											// if (utils.getObjectDeep(layer, 'root.feeds.0.data', false, null)) {
											//
											// 	// Duplicate feed frames.
											// 	event.detail.data = addFeedFrames(event.detail.data, layer.root.feeds);
											//
											// }

											// Validate if sequence has to be adjusted before initialisation.
											event.detail.data = validateSequencePrioritisation(event.detail.data);

											// Find and split frames if required.
											event.detail.data = addModalFrames(event.detail.data);

											// Find and split frames if required.
											event.detail.data = splitFrames(event.detail.data);

											// Apply custom HTML adjustments before creating sequence layer.
											// Duplicate sequence frames (in case you don't have all elements set manually in HTML).
											cloneDomElement(event.detail.parent.getTarget(event.detail.key), event.detail.key, event.detail.data.frames.length);

											// Check if banner is in debug mode.
											if (mode === 'debug') {

												// Check if banner can jump to another frame.
												if (editor.jump) {

													// Try to set sequence frame to the one selected in content editor.
													event.detail.data.params.play.from = editor.frame;

													// Check if some element is selected in content editor.
													if (!utils.isEmptyString(editor.scope[1].split('_').pop()) || editor.pause) {

														// Pause sequence after start so frames change only on swipe event.
														event.detail.data.params.pause.after.time = 100;

													}

												}

											}

											return;

										// Look for underlay video layer.
										case 'BG_VID_0':

											try {

												var

													/**
													 * @type {(tactic.builder.layers.VideoLayer)}
													 */
													BG_VID_0_layer = event.detail;


												// Create video poster image, so it loads before the video.
												// Check if background image is not defined.
												if (BG_VID_0_layer && BG_VID_0_layer.data && BG_VID_0_layer.data.params.poster != false && !BG_VID_0_layer.parent.parent.getLayer('BG_IMG_0', 1)) {

													// Create new background image using video data.
													BG_VID_0_layer.parent.parent.getLayer('BG_IMG').addLayer(tactic.builder.layers.ImageLayer, 'BG_IMG_0', convertVideoToImage(utils.cloneObject(BG_VID_0_layer.data)), bannerEventHandler);

												}

											} catch (e) {
											}

											return;

									}

								}

								return;

							// If layer was successfully actuated.
							case ('actuate'):

								// Add "actuated" attribute to set the banner display to block.
								layer.addAttr('actuated');

								// Check if Banner is in image capture mode, means snapshot can be taken on dedicated stopping frame.
								if ((['capture', 'capture-image', 'capture-gif'].indexOf(mode) !== -1)) {

									// Add "snapshot" attribute.
									layer.addAttr('snapshot', { name: 'snapshot', global: true });

								}

								// Check if banner is in debug mode.
								if (mode === 'debug') {

									// Check if one of the elements is selected in the editor.
									if (!utils.isEmptyString(editor.scope[1])) {

										layer.addAttr('mode_debug_' + editor.scope[1]);

									}

									// Check if banner grid has to be enabled
									if (editor.grid) {

										// Add "snapshot" attribute.
										layer.addAttr('mode_debug_grid');

									}

									// Bind mouse over event.
									layer.events.mouseover_custom = utils.addEventSimple(layer.target, 'mouseover', function () {

										// Remove "mode_debug" attribute from root layer to release debug view on banner mouse over.
										layer.removeAttr('mode_' + mode);

									});

									// Bind mouse out event.
									layer.events.mouseout_custom = utils.addEventSimple(layer.target, 'mouseout', function () {

										// Add "mode_debug" attribute to root layer in order to highlight layer bounds.
										layer.addAttr('mode_' + mode, { name: 'mode_' + mode, global: true });

									});

								}

								// Now load primary banner layer.
								// Proper font load utility requires all layers to be initialised before banner load function.
								// This will allow banner to index fonts that are in use and preload those before appending texts.
								// Custom fonts have to be preloaded in order to avoid wrong text holder positioning and styling (kerning, line heights).
								layer.load();

								break;

							// In case Banner is loaded, means static assets like fonts and images are loaded.
							// By default, Banner won't wait for any assets unless you indicate those in Banner parameters.
							case ('load'):

								// Initialise canvas layer to set global attributes.
								// Required to identify style load list.
								layer.getLayer('CV').init();

								// Load dynamic styles and proceed initialisation after loaded.
								loadDynamicStyles(layer, function () {

									// Initialise all nested banner layers.
									// Execute method recursively on all nested banner layers and frames.
									layer.getLayer('CV').execute('init', false);

									// Check if Banner does not support CSS animation.
									// Check if Banner is in capture mode.
									if (layer.inanimate === true || (['capture', 'capture-image', 'capture-gif'].indexOf(mode) !== -1)) {

										// Add "anim_no" attribute to root layer in order to stop all transitions.
										// NB! Required for proper snapshot capture, as PhantomJS does not support CSS animations.
										layer.addAttr('anim_no');

									}

									// Check if Banner is in image capture mode, means snapshot can be taken on dedicated stopping frame.
									if ((['capture', 'capture-image'].indexOf(mode) !== -1)) {

										// Stop banner (will display stopping frame).
										layer.stop();

									}

								});

								break;

							// In case if banner is resized.
							case ('resize'):

								// Check if banner is responsive.
								if (container.NAME === 'RxR') {

									// Hide banner.
									layer.removeAttr('actuated');

									// Hide banner.
									layer.removeAttr('ready');

									// Destroy all layers.
									layer.execute('destroy', false);

									// Reveal banner.
									layer.addAttr('actuated');

									// Initialise canvas layer to set global attributes.
									// Required to identify style load list.
									layer.getLayer('CV').init();

									// Load dynamic styles and proceed initialisation after loaded.
									loadDynamicStyles(layer, function () {

										// Initialise all nested banner layers.
										// Execute method recursively on all nested banner layers and frames.
										layer.getLayer('CV').execute('init', false);

									});

								}

								break;

							// In case Banner is interacted.
							case ('interaction'):

								// Remove "anim_no_dur" attribute to root layer in order to reveal animations.
								layer.removeAttr('anim_no_dur');

								break;

							// In case Banner is stopped.
							// NB! Creative will stop automatically in 30 seconds. This is required by the most ad networks.
							case ('stop'):

								// Check if no user interaction spotted and banner is not in debug mode.
								if (!layer.interacted && mode !== 'debug') {

									// Add "anim_no_dur" attribute to root layer in order to make all transitions seamless.
									layer.addAttr('anim_no_dur');

								}

								// Pause all banner playbacks and sequences.
								// Execute method recursively on all nested banner layers and frames.
								layer.execute('stop', false, [layer.interacted]);

								break;

						}

						break;

					// In case it is primary sequence.
					case ('SQ'):

						// Check what happened.
						switch (event.type) {

							// If sequence starts playing.
							case ('set'):

								break;

							// If sequence starts playing.
							case ('play'):

								// Set "paused" state class.
								layer.removeAttrs('SQ_paused');

								break;

							// If layer was initialised.
							case ('init'):

								// Check if layer is playable.
								if (layer.playable()) {

									// Invoke sequence load processes on every frame change.
									// Function will decide which frames have to be loaded depending on parameters and execute load command on all nested layers.
									// Default setup will pre-load next frame in advance.
									layer.load();

									// Check if capture mode is enabled.
									if (['capture', 'capture-image', 'capture-video', 'capture-gif'].indexOf(mode) !== -1) {

										// Wait with playing sequence before images loaded.
										waitImageLoad(layer, function () {
											layer.play();
										});

									}

									else {

										layer.play();

									}

								}

								break;

							// If sequence paused.
							case ('pause'):

								// Stop entire banner.
								// layer.root.stop();

								// Set "paused" state class.
								layer.addAttrs('SQ_paused');

								break;

							// If sequence frame has changed.
							case ('change'):
							case ('repeat'):

								// Check if next and previous frames are the same layer.
								if (layer.next === layer.previous && layer.previous) {

									// Remove current frame class.
									layer.previous.removeAttrs([
										'SQ_current'
									]);

									// Set previous and next frame classes.
									layer.previous.addAttrs([
										'SQ_previous', 'SQ_next'
									]);

								}
								else {

									// Check if previous sequence frame exists.
									if (layer.previous) {

										// Remove current and next frame classes.
										layer.previous.removeAttrs([
											'SQ_current', 'SQ_next'
										]);

										// Set previous frame classes.
										layer.previous.addAttrs([
											'SQ_previous'
										]);

									}

									// Check if next sequence frame exists.
									if (layer.next) {

										// Remove current and previous frame classes.
										layer.next.removeAttrs([
											'SQ_previous', 'SQ_current'
										]);

										// Set next frame class.
										layer.next.addAttrs([
											'SQ_next'
										]);

									}

								}

								// Check if current frame exists.
								if (layer.current) {

									// Remove next and previous frame classes.
									layer.current.removeAttrs([
										'SQ_previous', 'SQ_next'
									]);

									// Set current frame class.
									layer.current.addAttrs([
										'SQ_current'
									]);

								}

								// Check if frame passed loop.
								if (layer.looped) {

									// Add "looped" class.
									layer.addAttrs('SQ_looped');

								}
								else {

									// Remove "looped" class.
									layer.current.removeAttrs('SQ_looped');

								}

								// Check if sequence frame is repeated.
								if (layer.repeated) {

									// Set "repeated" state class (use to skip animation).
									// You can use it to skip animation duration.
									layer.addAttrs('SQ_repeated');

								}
								else {

									// Remove "repeated" class.
									layer.removeAttrs('SQ_repeated');

								}

								// Remove all direction classes, before assigning new ones.
								layer.removeAttrs([
									'SQ_forwards', 'SQ_backwards'
								]);

								// Check if sequence moves forwards.
								if (layer.direction > 0) {

									// Add "forwards" direction class.
									layer.addAttrs('SQ_forwards');

								}

								// Or moves backwards.
								else if (layer.direction < 0) {

									// Add "backwards" direction class.
									layer.addAttrs('SQ_backwards');

								}

								// Secure frame load.
								layer.load();

								// Apply frame index to control static animations from CSS.
								try {

									if (layer.previous) {

										// Expand background layer.
										layer.removeAttr('SQ_frame_' + layer.previous.index);

									}

									if (layer.current) {

										// Expand background layer.
										layer.addAttr('SQ_frame_' + layer.current.index);

									}

								} catch (e) {
								}

								validateSequenceAppearance(layer);

								// Check if Banner is in capture mode, means snapshot has to be taken.
								// Check if duration is positive.
								if ((['capture', 'capture-image', 'capture-video', 'capture-gif'].indexOf(mode) !== -1) && layer.current.params.duration >= 1000) {

									// Check if frame is repeated and capture mode is in GIF state to avoid double frame after banner stops.
									if (!(layer.repeated && mode === 'capture-gif')) {

										// Execute frame capture.
										layer.root.capture({ delay: (layer.current.params.duration - 100), duration: layer.current.params.duration });

									}

								}

								break;

							// If sequence frame has stopped.
							case ('stop'):
								try {

									// Check if Banner is in capture mode, execute event to stop capturing before server timeout.
									if (['capture', 'capture-image', 'capture-video', 'capture-gif'].indexOf(mode) !== -1) {

										// Execute capturing end event without delay.
										layer.root.end({ delay: (layer.current.params.duration) });

									}

								} catch (e) {
								}

								break;

						}

						break;

					// In case of all other layers.
					default:

						// Look for event type.
						switch (event.type) {

							// If layer was initialised.
							case ('set'):

								// Add hidden attribute.
								layer.addAttr('hidden');

								break;

							// If layer was propped.
							case ('propped'):

								// Look for layers key.
								switch (layer.key) {

									// Look for needed layer keys.
									case 'SQ_0':
									case 'SQ_1':
									case 'SQ_2':
									case 'SQ_3':
									case 'SQ_4':
									case 'SQ_5':
									case 'SQ_6':
									case 'SQ_7':
									case 'SQ_8':
									case 'SQ_9':
									case 'SQ_10':
									case 'SQ_11':
									case 'SQ_12':
									case 'SQ_13':
									case 'SQ_14':
									case 'SQ_15':
									case 'SQ_16':
									case 'SQ_17':
									case 'SQ_18':
									case 'SQ_19':
									case 'SQ_20':
									case 'SQ_21':
									case 'SQ_22':
									case 'SQ_23':
									case 'SQ_24':
									case 'SQ_25':
									case 'SQ_26':
									case 'SQ_27':
									case 'SQ_28':
									case 'SQ_29':
									case 'SQ_30':
									case 'SQ_31':
									case 'SQ_32':

										validateFrameVisibility(layer);

										break;

								}

								break;

							// If layer was initialised.
							case ('parammed'):

								// Look for layers key.
								switch (layer.key) {

									// Look for canvas layer.
									case 'CV':

										validateDealerAppearance(layer);

										break;

								}

								break;

							// If layer was initialised.
							case ('init'):

								// Check if layer can be loaded.
								// We don't want to load all frames of the sequence by default.
								if (!layer.sequence) {

									// Load layer.
									layer.load();

								}

								// Look for layers key.
								switch (layer.key) {

									// Look for click action layers.
									// Also look for modal elements that are located above click action layers (e.g. disclaimer, as it requires scroll functionality).
									case 'CL':
									case 'LG':
									case 'VS':

										try {

											var

												/**
												 * @type {(tactic.builder.layers.SequenceLayer)}
												 */
												SQ_layer = layer.root.getLayer('SQ', 2);

											// Check if sequence layer is available.
											if (SQ_layer) {

												// Bind banner mouse or touch move event on body.
												// NB! This requires Banner instance to be initialised.
												layer.gestures.gesture_custom = new utils.GestureListener(layer.target, function (action, event, start_event) {

													var

														/**
														 * @type {Number}
														 */
														offset = -((start_event.pageX || start_event.clientX) - (event.pageX || event.clientX));

													switch (action) {

														// If element was clicked.
														case ('click'):

															// Trigger click event, pass current frame number.
															clickEventHandler(layer, SQ_layer.current.clicktag.url);

															// Pause sequence.
															SQ_layer.pause();

															break;

														// If element movement started.
														case ('start'):

															// Pause sequence.
															SQ_layer.pause();

															// Add identifier that gesture is happening.
															SQ_layer.addAttr('SQ_move');

															break;

														// If element was moved.
														case ('move'):

															break;

														// If element movement stopped.
														case ('stop'):

															// Remove identifier that gesture is happening.
															SQ_layer.removeAttr('SQ_move');

															// If no swipe action detected.
															if (offset < -20) {

																// Change sequence to next frame.
																SQ_layer.changeNext();

															}

															// If swiped right.
															else if (offset > 20) {

																// Change sequence to previous frame.
																SQ_layer.changePrevious();

															}

															else {

																// Change sequence to current frame.
																// SQ_layer.change(SQ_layer.current.index);

															}

															break;

													}

												});

											}

											// If sequence is not defined.
											else {

												// Bind banner click event on click layer.
												// NB! This requires Banner instance to be initialised.
												layer.events.click_custom = utils.addEventSimple(document.body, 'click', function () {

													// Trigger click event, do not pass frame number.
													clickEventHandler(layer);

												});

											}

											// Bind mouse over event.
											layer.events.mouseout_custom = utils.addEventSimple(layer.target, 'mouseout', function () {
												hideModalElements(layer);
											});

										} catch (e) {
										}

										break;

									// Look for disclaimer action layers (open).
									case 'CL_PS_TXT_1':

										// Bind click event.
										layer.events.click_custom = utils.addEventSimple(layer.target, 'click',  function () {
											showModalElement(layer, 'VS');
										});

										// Bind mouse over event.
										layer.events.mouseover_custom = utils.addEventSimple(layer.target, 'mouseover', function () {
											showModalElement(layer, 'VS');
										});

										break;

									// Look for disclaimer action layer (close).
									case 'CX':

										// Bind mouse over event.
										layer.events.mouseout_custom = utils.addEventSimple(layer.target, 'mouseout', function () {
											hideModalElements(layer);
										});

										// Bind click event.
										layer.events.click_custom = utils.addEventSimple(layer.target, 'click',  function () {
											hideModalElements(layer);
										});

										break;

									// Look for text layer containers.
									case 'MS_TXT':
									case 'ES_TXT':
									case 'PS_TXT':
									case 'CS_TXT':
									case 'VS_TXT':
									case 'LS_TXT':

										applyLayerAlignment(layer);

										break;

									// Look for image layer containers.
									case 'LG_IMG':
									case 'UG_IMG':
									case 'BG_IMG':
									case 'FG_IMG':
									case 'VS_IMG':

										applyLayerAlignment(layer);

										validateImageLayerEmpty(layer);

										break;

								}

								break;

							// If layer was initialised.
							case ('enabled'):

								// Add "disabled" attribute to hide layer.
								layer.removeAttr('disabled');

								break;

							case ('beforeload'):

								// Identify if layer is of image type
								if (layer.type === 'ImageLayer') {

									// Push layer to load wait list.
									// Required to wait for image load in capture/snapshot mode.
									images.push(layer);

								}

								break;

							// If layer was successfully loaded or entered.
							case ('load'):
							case ('enter'):

								// Check if layer is loaded.
								if (event.type === 'load') {

									// Add load mode attribute to layer.
									layer.addAttr('loaded');

								}

								// Check if layer is available.
								// Will return false if sequenced and not on current frame.
								if (layer.available()) {

									// Check if banner is in debug mode.
									if (mode === 'debug' && layerIsSelected(layer)) {

										// Add debug mode attribute to layer.
										layer.addAttr('debug');

									}

									// Add animation class to fade in.
									layer.addAttrs('active');

									// Remove hidden attribute.
									layer.removeAttr('hidden');

									// Apply layer animation.
									applyLayerAnimation(layer, 'in');

									// Apply image mask.
									if (layer.type === 'ImageLayer') {

										// Reset masking appearance.
										applyImageMask(layer);

									}

									// Apply video load state.
									if (layer.type === 'VideoLayer') {

										applyVideoLoaded(layer);

									}

									// Look for layers key.
									switch (layer.key) {

										// Look for condition layers.
										case 'PS_TXT_1':

											applyGesturePosition(layer);

											break;

									}

								}

								break;

							// If layer is entered.
							case ('leave'):

								// Apply layer animation.
								applyLayerAnimation(layer, 'out');

								// Remove active class.
								layer.removeAttr('active');

								// Remove debug class.
								layer.removeAttr('debug');

								break;

							// If layer is empty.
							case ('empty'):

								emptyLayerHandler(layer);

								break;

							// If layer is disabled.
							case ('disabled'):

								disabledLayerHandler(layer);

								break;

						}

						break;

				}

			}

		},

		/**
		 * Load dynamic styles.
		 *
		 * @function
		 */
		loadDynamicStyles = function (layer, callback) {
			try {

				var

					/**
					 * @type {Number}
					 */
					loaded = 0,

					/**
					 * @type {Number}
					 */
					to_load = 1,

					/**
					 * @function
					 */
					onSuccess = function (key) {
						styles[key] = true;
						loaded++;
						checkLoadState();
					},

					/**
					 * @function
					 */
					onError = function (key) {
						styles[key] = false;
						loaded++;
						checkLoadState();
					},

					/**
					 * @function
					 */
					loadStyle = function (url) {

						if (utils.isUndefined(styles[url])) {

							var

								/**
								 * @type {Element}
								 */
								style = document.createElement('link');

							style.href = url;
							style.type = 'text/css';
							style.rel = 'stylesheet';

							style.onload = function () {

								// Trigger callback.
								onSuccess(url);

							}

							style.onerror = function () {

								// Trigger callback.
								onError(url);

							}

							document.getElementsByTagName('head')[0].appendChild(style);

						}

						else {

							// Trigger callback.
							onError(url);

						}

					},

					/**
					 * @function
					 */
					checkLoadState = function () {

						if (loaded >= to_load) {
							callback();
						}

					};

				// var
				//
				// 	/**
				// 	 * @type {String}
				// 	 */
				// 	tension = (container.NAME === 'RxR') ? 'all' : layer.getLayer('CV').props.tension.get();
				//
				// loadStyle( tactic.url.package + '/styles/layout_tens_' + tension + '.min.css');

				var

					/**
					 * @type {String}
					 */
					brand = 'eika';

				try {

					if (layer.data.macros.brand.value !== 'auto') {

						brand = layer.data.macros.brand.value;

					}

				} catch (e) {
				}

				loadStyle( tactic.url.package + '/styles/theme_' + brand + '.min.css');

			} catch (e) {

				// Trigger callback.
				callback();

			}
		},

		/**
		 * Identify end transition name depending on a browser.
		 *
		 * @function
		 */
		whichTransitionEndEvent = function () {

			var

				/**
				 * @type {Element|Node}
				 */
				element = document.createElement('div'),

				/**
				 * @type {Object}
				 */
				handlers = {
					'transition': 'transitionend',
					'OTransition': 'oTransitionEnd',
					'MozTransition': 'transitionend',
					'WebkitTransition': 'webkitTransitionEnd'
				};

			for (var i in handlers) {
				if (element.style[i] !== undefined) {
					return handlers[i];
				}
			}

		},

		/**
		 * Duplicate HTML DOM element.
		 *
		 * @function
		 * @param {Element|Node} target
		 * @param {String} key
		 * @param {Number} times
		 */
		cloneDomElement = function (target, key, times) {

			try {

				var

					/**
					 * Find preset in sequence target.
					 *
					 * @type {Element|Node}
					 */
					preset = utils.getElementsByKey(target, key + '_0')[0];

				// Check if preset was found.
				if (preset) {

					// Loop frame times.
					for (var index = 1; index < times; index++) {

						// Check if element is not available in the document DOM.
						if (!document.querySelector('[data-key=' + key + '_' + index + ']')) {

							var

								/**
								 * Clone initial frame preset.
								 *
								 * @type {(Element|Node)}
								 */
								clone = preset.cloneNode(true);

							// Set layer key.
							clone.setAttribute("data-key", key + '_' + index);

							// Append sequence frame clone to sequence holder.
							target.appendChild(clone);

						}

					}

				}

			} catch (error) {
			}
		},

		/**
		 * Create image poster data depending on video data.
		 *
		 * @type {Function}
		 * @param {Object} data
		 * @return {Object}
		 */
		convertVideoToImage = function (data) {

			var

				/**
				 * @type {Object}
				 */
				image_layer = data;

			try {

				// Check if data is provided.
				if (data && image_layer) {

					image_layer.type = 'ImageLayer';
					image_layer.params.polite = false;
					if (image_layer.params.wrapper) {
						image_layer.params.wrapper = image_layer.params.wrapper.split('VID').join('IMG');
					}
					if (image_layer.params.holder) {
						image_layer.params.holder = image_layer.params.holder.split('VID').join('IMG');
					}
					// new_data.params.align = data.params.align;
					// new_data.params.format = data.params.format;
					// new_data.params.resize = data.params.resize;
					// new_data.params.quality = data.params.quality;

					// Check if data has sources.
					if (data.sources) {

						// Loop all data sources.
						utils.each(data.sources,

							/**
							 * @param {Object} source
							 * @param {String} source.edit_url
							 * @param {String} source.thumb_url
							 * @param {Number} source.width
							 * @param {Number} source.height
							 * @param {Number} source_key
							 */
							function (source, source_key) {

								// Check if source is set.
								if (source) {

									// Convert video source to image source.
									image_layer.sources[source_key] = {
										width: source.width,
										height: source.height,
										url: (source.edit_url || source.thumb_url)
									};

								}

							}
						);

					}

					// Check if data has exceptions.
					if (data.excepts) {

						// Loop all data exceptions.
						utils.each(data.excepts,

							/**
							 * @param {Object} except
							 * @param {String} except_key
							 */
							function (except, except_key) {

								// Check if exception is not empty.
								if (except && except_key !== 'preset') {

									// Convert exception.
									image_layer.excepts[except_key] = convertVideoToImage(except);

								}
							}
						);

					}

				}

			} catch (e) {
			}

			return image_layer;
		},

		/**
		 * Check if layer source is the same as on the next or previous frame.
		 *
		 * @type {Function}
		 * @param {String} key
		 * @param {tactic.builder.layers.FrameLayer} frame_1
		 * @param {tactic.builder.layers.FrameLayer} frame_2
		 * @return {Boolean}
		 */
		layerIsIdentical = function (key, frame_1, frame_2) {

			var

				/**
				 * @type {Boolean}
				 */
				identical = false;

			try {

				// Check if frames provided.
				if (frame_1 && frame_2) {

					var

						/**
						 * @type {tactic.builder.layers.AbstractLayer}
						 */
						layer_1 = frame_1.getLayer(key, 10),

						/**
						 * @type {tactic.builder.layers.AbstractLayer}
						 */
						layer_2 = frame_2.getLayer(key, 10);

					// Check if source is the same as on previous frame.
					if ((layer_1 && layer_2) && (layer_1.type === layer_2.type)  && (layer_1.enabled === layer_2.enabled) && (layer_1.type === layer_2.type) && (JSON.stringify(layer_1.sources) === JSON.stringify(layer_2.sources)) && (JSON.stringify(layer_1.excepts) === JSON.stringify(layer_2.excepts))) {

						if (layer_1.type === 'TextLayer') {

							var

								/**
								 * @type {Object}
								 */
								macros_1 = frame_1.getMacros(),

								/**
								 * @type {Object}
								 */
								macros_2 = frame_2.getMacros();

							// if ((macros_1.SQ_split === macros_2.SQ_split) && (macros_1.SQ_split_parent === macros_2.SQ_split_parent)) {
							if ((macros_1.SQ_split === macros_2.SQ_split)) {

								identical = true;

							}

						} else {

							identical = true;

						}

					}

				}

			} catch (e) {
			}

			return identical;
		},

		/**
		 * Check if layer is selected in the editor.
		 *
		 * @type {Function}
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 * @return {Boolean}
		 */
		layerIsSelected = function (layer) {
			try {

				// Look if editor scope is the same as layer key.
				if (layer.key.split('_')[0]  === editor.element && editor.element.length > 0) {

					// Check if layer is sequenced, means we have to be sure to select proper frame.
					if (layer.sequence) {

						// Check if layer sequence is the same as in the content editor.
						if (layer.sequence.current.index === editor.frame || layer.sequence.current.getMacros()['SQ_split_parent'] === editor.frame) {
							return true;
						}

					}
					else {
						return true;
					}

				}

			} catch (e) {
			}

			return false;
		},

		/**
		 * Make layer ready.
		 *
		 * @type {Function}
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 * @return {Boolean}
		 */
		makeLayerReady = function (layer) {
			try {

				if (layer.getAttrs().indexOf('ready') === -1) {

					layer.addAttr('ready');

				}

			} catch (e) {
			}
		},

		/**
		 * Define frame splitting logics.
		 *
		 * @function
		 * @param {Object} data
		 */
		splitFrames = function (data) {
			try {

				var

					/**
					 * @type {Number}
					 */
					frames_added = 0,

					/**
					 * @type {Number}
					 */
					frames_added_before = 0;

				for (var frame_key = 0; frame_key < data.frames.length; frame_key++) {

					var

						/**
						 * @type {Object}
						 */
						frame = data.frames[frame_key];

					try {

						var

							/**
							 * @type {Array}
							 */
							filter = frame.groups['SQ_setup'].macros['SQ_filter'].value.split('_'),

							/**
							 * @function
							 * @param {Object} frame
							 * @param {Number} key
							 * @param {Array} filter
							 * @param {Number} variation
							 * @param {Number} parent_key
							 */
							cloneFrame = function (frame, key, filter, variation, parent_key) {

								var

									/**
									 * @type {Object}
									 */
									frame_clone = utils.cloneObject(frame);

								// Set filter so duplicated format is visible in micro formats only.
								frame_clone.groups['SQ_setup'].macros['SQ_filter'].value = filter[1];
								frame_clone.groups['SQ_setup'].macros['SQ_split'].value = variation;
								frame_clone.groups['SQ_setup'].macros['SQ_split_parent'].value = parent_key;

								data.frames.splice(key, 0, frame_clone);

								frames_added++;

								return frame_clone;
							}

						// Identify if frame has to be splitted.
						if (filter[0] === 'split') {

							// Identify if frame can be splitted;
							if ((frame.groups['SQ_setup'].macros['SQ_type'].value === 'split') && (filter[1] === 'all' || filter[1] === 'limited' || filter[1] === 'micro' || filter[1] === 'small') && (frame.layers['MS'].layers['MS_OBJ'].layers['MS_TXT'].layers[1].enabled)) {

								// Set filter so initial frame is excluded from split filter.
								frame.groups['SQ_setup'].macros['SQ_filter'].value = filter[1] + '_exc';
								frame.groups['SQ_setup'].macros['SQ_split_parent'] = {
									value: frame_key
								};

								// Reduce frame duration.
								frame.params.duration = Math.round(frame.params.duration / 1.5);

								cloneFrame(frame, (frame_key + 1), filter, 0, frame_key);
								cloneFrame(frame, (frame_key + 2), filter, 1, frame_key);

								if ((editor.frame + frames_added_before) > frame_key) {
									frames_added_before = frames_added_before + 2;
								}

							}

						}

					} catch (e) {
					}

				}

				editor.frame = (editor.frame + frames_added_before);

			} catch (e) {
			}

			return data;
		},

		/**
		 * Add common frames to the end.
		 *
		 * @function
		 * @param {Object} data
		 * @param {Array} feeds
		 */
		addFeedFrames = function (data, feeds) {

			// try {
			//
			// 	var
			//
			// 		/**
			// 		 * @type {Number}
			// 		 */
			// 		frames_added = 0,
			//
			// 		/**
			// 		 * @type {Number}
			// 		 */
			// 		frames_added_before = 0;
			//
			// 	// Check if feeds are provided.
			// 	if (feeds) {
			//
			// 		// Loop all frames in the sequence.
			// 		for (var frame_key = 0; frame_key < data.frames.length; frame_key++) {
			//
			// 			var
			//
			// 				/**
			// 				 * @type {Object}
			// 				 */
			// 				frame = data.frames[frame_key],
			//
			// 				/**
			// 				 * @type {Object}
			// 				 */
			// 				feed_macros= frame.groups['SQ_feed'].macros;
			//
			// 			if (frame.groups['SQ_setup'].macros['SQ_type'].value === 'product' && feed_macros['SQ_feed'].value === true && feed_macros['SQ_feed_propagate'].value === true) {
			//
			// 				// Set propagation to false.
			// 				data.frames[frame_key].groups['SQ_feed'].macros['SQ_feed_propagate'].value = false;
			//
			// 				var
			//
			// 					/**
			// 					 * @type {Object}
			// 					 */
			// 					feed = feeds[feed_macros['SQ_feed_id'].value];
			//
			// 				// Check if particular feed is available.
			// 				if (feed && feed.enabled && feed.data && feed.data.items && feed.data.items.length > 1) {
			//
			// 					for (var item_key = 1; item_key < feed.data.items.length; item_key++) {
			//
			// 						var
			//
			// 							/**
			// 							 * @type {Object}
			// 							 */
			// 							frame_clone = utils.cloneObject(frame);
			//
			// 						data.frames.splice((frame_key + item_key), 0, frame_clone);
			//
			// 						frames_added++;
			//
			// 						if ((editor.frame + frames_added_before) > (frame_key + item_key)) {
			// 							frames_added_before = frames_added_before + 1;
			// 						}
			//
			// 					}
			//
			// 				}
			//
			// 			}
			//
			// 		}
			//
			// 	}
			//
			// 	editor.frame = (editor.frame + frames_added_before);
			//
			// } catch (e) {
			// }

			return data;
		},

		/**
		 * Add common frames to the end.
		 *
		 * @function
		 * @param {Object} data
		 */
		addModalFrames = function (data) {

			// try {
			//
			// 	var
			//
			// 		disclaimer_frame = utils.cloneObject(data.frames[data.frames.length - 1]);
			//
			// 	disclaimer_frame.enabled = true;
			// 	disclaimer_frame.params.duration = 4000;
			// 	disclaimer_frame.groups['SQ_setup'].macros['SQ_type'].value = 'disclaimer';
			// 	disclaimer_frame.layers = {
			// 		"FG": {
			// 			"type": "JointLayer",
			// 			"enabled": false
			// 		},
			// 		"MS": {
			// 			"type": "JointLayer",
			// 			"enabled": false
			// 		}
			// 	};
			//
			// 	data.frames.push(disclaimer_frame);
			//
			// } catch (e) {
			// }

			return data;
		},

		/**
		 * @type {Function}
		 * @param layer {tactic.builder.layers.AbstractLayer}
		 * @param callback {Function}
		 */
		waitImageLoad = function (layer, callback) {

			var

				validation_interval = 10,

				/**
				 * @type {Function}
				 */
				validateLoadState = function () {

					var

						/**
						 * @type {Number}
						 */
						load_count= images.length;

					// Loop all images.
					utils.each(images,

						/**
						 * @param {Object} image_layer
						 */
						function (image_layer) {

							if (image_layer.loaded) {
								load_count--;
							}

						}

					);

					if (load_count <= 0) {

						// Clear wait delay timeout.
						layer.timeline.clearTimeout(layer.timers.wait_delay);
						layer.timeline.clearTimeout(layer.timers.wait);

						// Load complete, proceed banner playback.
						callback();

					} else {

						// Set load check timer.
						layer.timers.wait = layer.timeline.setTimeout(function () {

							// Check load state again.
							validateLoadState();

						}, validation_interval, true);

					}

				};

			// Secure endless wait.
			layer.timers.wait = layer.timeline.setTimeout(function () {

				validateLoadState();

			}, validation_interval, true);

			// Secure endless wait.
			layer.timers.wait_delay = layer.timeline.setTimeout(function () {

				// Clear wait timeouts.
				layer.timeline.clearTimeout(layer.timers.wait_delay);
				layer.timeline.clearTimeout(layer.timers.wait);

				// Load complete, proceed banner playback.
				callback();

			}, 10000, true);

		},

		/**
		 * Apply image layer mask.
		 *
		 * @function
		 * @param {tactic.builder.layers.ImageLayer} layer
		 */
		applyImageMask = function (layer) {
			try {

				// Check if layer is enabled.
				if (layer.enabled) {

					// Check if natural masking mode is set.
					if (layer.wrapper.macros.local[layer.wrapper.key + '_mask'] === 'auto') {

						var

							/**
							 * @type {Array}
							 */
							blanks = layer.props.position.blanks,

							/**
							 * @type {Number}
							 */
							blanks_count = 0,

							/**
							 * @type {String}
							 */
							mask_name = '';

						for (var i in blanks) {
							if (blanks[i] != 0 && blanks[i] != 1) {
								blanks_count++;

								if (i == 0) {
									mask_name = mask_name + 't';
								}
								else if (i == 1) {
									mask_name = mask_name + 'r';
								}
								else if (i == 2) {
									mask_name = mask_name + 'b';
								}
								else if (i == 3) {
									mask_name = mask_name + 'l';
								}

							}
						}

						// Add a symbol to the end to get CSS class selector working properly.
						mask_name = mask_name + '_';

						if (blanks_count >= 4) {
							// if (blanks_count >= 3) {

							layer.wrapper.addAttr(layer.key + '_mask_linear_all_', { name: true});

						}

						else if (blanks_count > 0) {

							layer.wrapper.addAttr(layer.key + '_mask_linear_' + mask_name, { name: true});

						}

					}

					// Check if natural masking mode is set.
					if (layer.wrapper.macros.local[layer.wrapper.key + '_mask_mode'] === 'natural') {

						var

							/**
							 * @type {String}
							 */
							mask_size = layer.asset.ghost.width + 'px ' + layer.asset.ghost.height + 'px',

							/**
							 * @type {String}
							 */
							mask_position = -(layer.props.position.left - layer.asset.ghost.left) + 'px ' + -(layer.props.position.top - layer.asset.ghost.top) + 'px';

						// Add style that corrects masking position.
						layer.wrapper.addAttr(layer.key + '_mask_size', {
							'selector': [
								'[data-key*=_ASSET]'
							],
							'css': {
								'mask-size': mask_size,
								'-webkit-mask-size': mask_size,
								'mask-position': mask_position,
								'-webkit-mask-position': mask_position
							}
						});

					}

				}

			} catch (e) {
			}
		},

		/**
		 * Indicate video load state.
		 *
		 * @function
		 * @param {tactic.builder.layers.VideoLayer} layer
		 */
		applyVideoLoaded = function (layer) {
			try {

				// Check if layer is enabled.
				if (layer.enabled) {

					// Indicate that video is loaded.
					layer.wrapper.addAttr(layer.key + '_loaded');

				}

			} catch (e) {
			}
		},

		/**
		 * Analyse and set layer animation state.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 * @param {String} anim_type
		 */
		applyLayerAnimation  = function (layer, anim_type) {
			try {

				var

					/**
					 * @type {tactic.builder.layers.SequenceLayer}
					 */
					sequence = layer.sequence,

					/**
					 * @type {Boolean}
					 */
					layer_identical;

				// Look for layer key.
				switch (anim_type) {

					// In case it is root banner.
					case ('in'):

						// Frame switch already happened, check previous frame (old frame) with frame where ingoing (new frame) element is located.
						layer_identical = sequence ? layerIsIdentical(layer.key, sequence.frames[layer.frame], sequence['previous']) : false;

						// Loop all animations.
						utils.each(layer.getAnims(),

							/**
							 * @param {Object} anim
							 * @param {String} anim_key
							 */
							function (anim, anim_key) {

								var

									/**
									 * @type {tactic.builder.layers.AbstractLayer}
									 */
									anim_layer = anim.target,

									/**
									 * @type {String}
									 */
									anim_name = anim.name,

									/**
									 * @type {Object}
									 */
									anim_end_event = anim_layer.events.anim_end;

								// Check if animation end event exists.
								if (anim_end_event) {

									// Remove animation end event.
									utils.removeEventSimple(anim_end_event.target, anim_end_event.type, anim_end_event.callback);

								}

								// Check if animation can be skipped.
								if (layer_identical && anim.skip) {

									// Add animation class to fade in.
									anim_layer.addAttr(anim_name + '_skip');

								} else {

									// Remove animation class to fade in.
									anim_layer.removeAttr(anim_name + '_skip');

								}

								// Add animation class to fade in.
								anim_layer.removeAttr(anim_name + '_out');

								// Add animation class to fade in.
								anim_layer.addAttr(anim_name + '_in');

							}

						);

						break;

					// In case it is root banner.
					case ('out'):

						// Frame switch already happened, check current frame (new frame) with frame where outgoing element is located (old frame).
						layer_identical = sequence ? layerIsIdentical(layer.key, sequence.frames[layer.frame], sequence['current']) : false;

						// Loop all animations.
						utils.each(layer.getAnims(),

							/**
							 * @param {Object} anim
							 * @param {String} anim_key
							 */
							function (anim, anim_key) {

								var

									/**
									 * @type {tactic.builder.layers.AbstractLayer}
									 */
									anim_layer = anim.target,

									/**
									 * @type {String}
									 */
									anim_name = anim.name,

									/**
									 * @type {Object}
									 */
									anim_end = anim_layer.events.anim_end,

									/**
									 * Remove animation attributes when transition ends.
									 * @function
									 */
									removeAnimEndListener = function() {

										// Check if animation end event exists.
										if (anim_end) {

											// Remove load event listener.
											utils.removeEventSimple(anim_end.target, anim_end.type, anim_end.callback);

										}

									},

									/**
									 * Remove animation attributes when transition ends.
									 * @function
									 */
									animEndHandler = function () {

										removeAnimEndListener();

										// Remove animation class to fade in.
										anim_layer.removeAttr(anim_name + '_out');

										// Add hidden attribute.
										anim_layer.addAttr('hidden');

									};

								// Clear animation end event listener.
								removeAnimEndListener();

								// Check if previous layer is identical.
								if (layer_identical && anim.skip) {

									// Remove animation class to fade in.
									anim_layer.addAttr(anim_name + '_skip');

								} else {

									// Add animation class to fade in.
									anim_layer.addAttr(anim_name + '_out');

									// Remove animation class to fade in.
									anim_layer.removeAttr(anim_name + '_skip');

								}

								// Add animation class to fade in.
								anim_layer.removeAttr(anim_name + '_in');

								// Listen for animation end event.
								anim_layer.events.anim_end = utils.addEventSimple(anim_layer.target, whichTransitionEndEvent(), animEndHandler);

							}

						);

						break;

				}

			} catch (e) {}
		},

		/**
		 * Set size and position of top layer gesture.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		applyGesturePosition = function(layer) {
			try {

				if (layer.root) {

					var

						/**
						 * @type {tactic.builder.layers.AbstractLayer}
						 */
						CL_layer = layer.root.getLayer('CL_' + layer.key, 2);

					if (CL_layer.target) {

						var

							/**
							 * @type {Object}
							 */
							CL_layer_style = CL_layer.target.style;

						if (layer.enabled && layer.target && layer.target.style.display !== 'none' && layer.macros.local['gesture_hover'] === true) {

							var

								/**
								 * @type {Object}
								 */
								layer_rect = (layer.target.getElementsByTagName('p')[0]).getBoundingClientRect();

							// Check if layer is displayed.
							if (layer_rect.width > 0 && layer_rect.height > 0) {

								CL_layer_style.left = layer_rect.left + 'px';
								CL_layer_style.top = layer_rect.top + 'px';
								CL_layer_style.width = layer_rect.width + 'px';
								CL_layer_style.height = layer_rect.height + 'px';

							}

							// Add layer gesture identifier (to enable underline).
							layer.addAttr('gesture');

						}

						else {

							CL_layer_style.left = CL_layer_style.top = CL_layer_style.width = CL_layer_style.height = '0px';

							// Remove layer gesture identifier (to enable underline).
							layer.removeAttr('gesture');

						}

					}

				}

			} catch (e) {
			}
		},

		/**
		 * Set layer alignment depending on CSS definition.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		applyLayerAlignment = function (layer) {
			try {

				// Check if layer is enabled.
				if (layer.enabled) {

					// Add horizontal and vertical alignment class to the layer. Required to align shadow by CSS.
					layer.addAttr(layer.key + '_align_x_' + utils.getStyle(layer.target, 'textAlign'));
					layer.addAttr(layer.key + '_align_y_' + utils.getStyle(layer.target, 'verticalAlign'));

				}

			} catch (e) {
			}
		},

		/**
		 @function
		 @param {tactic.builder.layers.AbstractLayer} layer
		 @param {String} name
		 @param {String} value
		 */
		applyLayerVariableAttr = function (layer, name, value) {
			try {

				// Check if attribute has to be replaced.
				if (!layer.custom[name] || layer.custom[name] !== value) {

					// In case of dealer frame, hide specific elements.
					// Remove old theme attribute.
					layer.removeAttr(layer.custom[name]);

					// Set new color attribute reference.
					layer.custom[name] = value;

					// Add new theme attribute.
					layer.addAttr(value);

				}

			} catch (e) {
			}
		},

		/**
		 * Validate unusual behaviour and/or appearance of frames.
		 *
		 * @function
		 * @param {tactic.builder.layers.SequenceLayer} layer
		 */
		validateSequenceAppearance = function (layer) {

			try {

				var

					/**
					 * @type {(tactic.builder.layers.JointLayer)}
					 */
					CV_layer = layer.root.getLayer('CV', 2),

					/**
					 * @type {(tactic.builder.layers.JointLayer)}
					 */
					SQ_layer_current = layer.current,

					/**
					 * @type {Object}
					 */
					SQ_layer_macros = SQ_layer_current.getMacros(),

					/**
					 * @type {String}
					 */
					SQ_type = 'SQ_type_' + SQ_layer_macros['SQ_type'];

				// Pass sequence type to the CV layer.
				applyLayerVariableAttr(CV_layer, 'SQ_type', SQ_type);

				// Pass sequence layout attributes to the CV layer.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['SQ'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						applyLayerVariableAttr(CV_layer, key + '_layout', key + '_layout_' + SQ_layer_macros[key + '_layout']);

					}
				);

				// Pass sequence theme attributes to the CV layer.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['CV'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						applyLayerVariableAttr(CV_layer, key + '_theme', key + '_theme_' + SQ_layer_macros['SQ_' + key + '_theme']);

					}
				);

				// Pass background color attributes to the dedicated layers.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['UL', 'IL', 'EL', 'VS'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						var

							/**
							 * @type {(tactic.builder.layers.JointLayer)}
							 */
							target_layer = CV_layer.getLayer(key + '_BG', 4);

						applyLayerVariableAttr(target_layer, key + '_bg', 'bg_' + SQ_layer_macros['SQ_' + key + '_bg']);

					}
				);

				// Pass sequence color attributes to the CV layer.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['OL'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						var

							/**
							 * @type {(tactic.builder.layers.JointLayer)}
							 */
							target_layer = CV_layer.getLayer(key + '_GR', 4);

						applyLayerVariableAttr(target_layer, key + '_gr', 'gr_' + SQ_layer_macros['SQ_' + key + '_gr']);

					}
				);

				// Pass sequence color attributes to the targeted layers.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['LG'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						var

							/**
							 * @type {(tactic.builder.layers.AbstactLayer)}
							 */
							target_layer = CV_layer.getLayer(key + '_OBJ', 4),

							/**
							 * @type {String}
							 */
							value_color = SQ_layer_macros['SQ_' + key + '_lg'],

							/**
							 * @type {String}
							 */
							value_shadow = SQ_layer_macros['SQ_' + key + '_sh'];

						// Apply text color and shadow.
						applyLayerVariableAttr(target_layer, key + '_lg', 'lg_' + value_color);
						applyLayerVariableAttr(target_layer, key + '_sh', 'sh_' + value_shadow);

					}
				);

				// Pass sequence color attributes to the targeted layers.
				// This is required if components elements have to change their appearance in the scope of specific frame type.
				utils.each(['MS', 'PS', 'CS', 'VS'],

					/**
					 * @param {Object} key
					 */
					function (key, ) {

						var

							/**
							 * @type {(tactic.builder.layers.AbstactLayer)}
							 */
							target_layer,

							/**
							 * @type {String}
							 */
							value_style = SQ_layer_macros['SQ_' + key + '_st'],

							/**
							 * @type {String}
							 */
							value_shadow = SQ_layer_macros['SQ_' + key + '_sh'],

							/**
							 * @type {String}
							 */
							value_button = SQ_layer_macros['SQ_' + 'BS' + '_bt'];

						// Look for layer key.
						switch (key) {

							// In case it is root banner.
							case ('MS'):

								target_layer = SQ_layer_current.getLayer(key + '_OBJ', 4);

								break;

							case ('PS'):

								// Take values from MS element.
								value_style = SQ_layer_macros['SQ_' + 'MS' + '_st'];
								value_shadow = SQ_layer_macros['SQ_' + 'MS' + '_sh'];

								target_layer = CV_layer.getLayer(key + '_OBJ', 4);

								break;

							case ('CS'):

								// Take values from PS element.
								value_style = SQ_layer_macros['SQ_' + 'PS' + '_st'];
								value_shadow = SQ_layer_macros['SQ_' + 'PS' + '_sh'];

								target_layer = CV_layer.getLayer(key + '_OBJ', 4);

								break;

							default:

								target_layer = CV_layer.getLayer(key + '_OBJ', 4);

								break;

						}

						// Apply text color and shadow.
						applyLayerVariableAttr(target_layer, key + '_st', 'st_' + value_style);
						applyLayerVariableAttr(target_layer, key + '_sh', 'sh_' + value_shadow);

						// Button color is the same for all elements.
						applyLayerVariableAttr(target_layer, key + '_bt', 'bt_' + value_button);

					}
				);

				// Set video playback. Pause or play video if FG element is/not set.
				try {

					var

						/**
						 * @type {tactic.builder.layers.VideoLayer}
						 */
						BG_VID_0_layer = CV_layer.getLayer('BG_VID_0', 6);

					// Check if video can be played.
					if (BG_VID_0_layer.playable() && (!SQ_layer_current.getLayer('FG_IMG_0', 3))) {

						// Play video.
						BG_VID_0_layer.play();

					}

					else {

						// Pause video.
						BG_VID_0_layer.pause();

					}

				} catch (e) {
				}

				// Set BG visibility.
				try {

					// Check if background has to be hidden.
					if (!SQ_layer_current.getLayer('FG_IMG_0', 3)) {

						CV_layer.removeAttr('BG_hide');

					}

					else {

						CV_layer.addAttr('BG_hide');

					}

				} catch (e) {
				}

				// Refresh gesture element positions to ensure that gesture target layer in the right place across frames.
				try {

					applyGesturePosition(CV_layer.getLayer('PS_TXT_1', 4));

				} catch (e) {
				}

				// Show and hide specific elements and modal overlays according to the sequence frame type.
				try {

					// Check if disclaimer has to be shown/hidden.
					if (SQ_type === 'SQ_type_disclaimer') {

						// Validate if disclaimer element is available.
						if (CV_layer.root.getLayer('VS', 2).available()) {

							showModalElement(layer, 'VS');

						} else {

							layer.changeNext();

						}

					}

					else {

						hideModalElements(layer);

					}

				} catch (e) {
				}

			} catch (e) {
			}

			makeLayerReady(layer.root);

		},

		/**
		 * @function
		 * @param {Object} data
		 * @return {Object}
		 */
		validateSequencePrioritisation = function (data) {
			try {

				var

					/**
					 * @type {Object}
					 */
					FG_options = {};

				// Loop all frames and create structure of the elements.
				utils.each(data.frames,

					/**
					 * @param {Object} SQ_frame
					 */
					function (SQ_frame) {

						// Identify if image on this frame is available.
						if (SQ_frame.layers['FG'] && SQ_frame.layers['FG'].layers['FG_OBJ'].layers['FG_IMG'].layers[0]) {

							// Check if FG option is already created.
							if (!FG_options[SQ_frame.groups['SQ_setup'].macros['SQ_priority'].value]) {

								var

									/**
									 * @type {Object}
									 */
									FG_clone = utils.cloneObject(SQ_frame.layers['FG']);

								// Adjust animation value, so the image does not repeat animation.
								FG_clone.layers['FG_OBJ'].layers['FG_IMG'].groups['FI_anim'].macros['FI_anim_skip'].value = true;

								// Add image options to dedicated array.
								FG_options[SQ_frame.groups['SQ_setup'].macros['SQ_priority'].value] = FG_clone;

							}

						}

					}
				);

				// Loop all frames and replace required elements.
				utils.each(data.frames,

					/**
					 * @param {Object} SQ_frame
					 */
					function (SQ_frame) {

						if (SQ_frame.layers['FG'] && SQ_frame.layers['FG'].layers['FG_OBJ'].layers['FG_IMG'].layers[0]) {

							if (compression === 'high' && (SQ_frame.groups['SQ_setup'].macros['SQ_priority'].value === 'medium' || SQ_frame.groups['SQ_setup'].macros['SQ_priority'].value === 'low')) {

								if (FG_options['high']) {

									SQ_frame.layers['FG'] = FG_options['high'];

								}

								else {

									SQ_frame.layers['FG'].layers['FG_OBJ'].layers['FG_IMG'].layers[0] = null;

								}

							} else if (compression === 'medium' && SQ_frame.groups['SQ_setup'].macros['SQ_priority'].value === 'low') {

								if (FG_options['medium']) {

									SQ_frame.layers['FG'] = FG_options['medium'];

								} else if (FG_options['high']) {

									SQ_frame.layers['FG'] = FG_options['high'];

								}

								else {

									SQ_frame.layers['FG'].layers['FG_OBJ'].layers['FG_IMG'].layers[0] = null;

								}

							}

						}

					}
				);

			} catch (e) {
			}

			return data;
		},

		/**
		 * Validate if specific layers have to be disabled according to the filtering criteria.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		validateFrameVisibility = function (layer) {
			try {

				var

					/**
					 * @type {Object}
					 */
					SQ_macros_local = layer.macros.local,

					/**
					 * @type {Object}
					 */
					SQ_macros_global = layer.macros.global,

					/**
					 * @type {Object}
					 */
					SQ_attrs = layer.getAttrs(),

					/**
					 * @type {Object}
					 */
					CV_attrs = layer.root.getLayer('CV').getAttrs();

				if (SQ_macros_local['SQ_filter'] === 'hidden') {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if ((SQ_macros_local['SQ_filter'] === 'micro' && (SQ_attrs.indexOf('CV_scale_xs') === -1)) || (SQ_macros_local['SQ_filter'] === 'micro_exc' && (SQ_attrs.indexOf('CV_scale_xs') !== -1))) {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if ((SQ_macros_local['SQ_filter'] === 'small' && (SQ_attrs.indexOf('CV_scale_s') === -1 && SQ_attrs.indexOf('CV_scale_xs') === -1)) || (SQ_macros_local['SQ_filter'] === 'small_exc' && (SQ_attrs.indexOf('CV_scale_s') !== -1 || SQ_attrs.indexOf('CV_scale_xs') !== -1))) {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if ((SQ_macros_local['SQ_filter'] === 'large' && (SQ_attrs.indexOf('CV_scale_l') === -1 && SQ_attrs.indexOf('CV_scale_xl') === -1)) || (SQ_macros_local['SQ_filter'] === 'large_exc' && (SQ_attrs.indexOf('CV_scale_l') !== -1 || SQ_attrs.indexOf('CV_scale_xl') !== -1))) {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if ((SQ_macros_local['SQ_filter'] === 'snapshot' && SQ_attrs.indexOf('snapshot') === -1) || (SQ_macros_local['SQ_filter'] === 'snapshot_exc' && SQ_attrs.indexOf('snapshot') !== -1)) {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if ((SQ_macros_local['SQ_filter'] === 'limited' && (SQ_attrs.indexOf('CV_scale_xs') === -1)) ||
					(SQ_macros_local['SQ_filter'] === 'limited_exc' && (SQ_attrs.indexOf('CV_scale_xs') !== -1))
				) {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

				if (SQ_macros_local['SQ_filter'] === 'all_exc') {

					// Mark that frame should not be visible.
					// This can be overwritten by standard way of appearance setup (with exceptions, from appearance tab).
					layer.enabled = false;

				}

			} catch (e) {
			}
		},

		/**
		 * As image layers can not be reached if null, therefore empty class is not available we have to check for source.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		validateImageLayerEmpty = function (layer) {
			try {

				// Check if image source is not set.
				if (layer.enabled) {

					var

						empty_layer_holder = layer.sequence ? layer.sequence.frames[layer.frame] : layer.root.getLayer('CV', 1);

					// if (layer.data.layers[0] === null) {
					//
					// 	// Add empty layer class to the sequence.
					// 	empty_layer_holder.addAttr( layer.key + '_empty', { name: layer.key + '_empty', global: true });
					//
					// }

					// Loop all data sources.
					utils.each(layer.data.layers,

						/**
						 * @param {Object} inc_layer
						 * @param {Object} inc_layer_key
						 */
						function (inc_layer, inc_layer_key) {

							// Check if source is set.
							if (!inc_layer) {

								// Add empty layer class to the sequence.
								empty_layer_holder.addAttr(layer.key + '_' + inc_layer_key + '_disabled', { name: layer.key +  '_' + inc_layer_key + '_disabled', global: true });

							}

						}
					);


				}

			} catch (e) {
			}
		},

		/**
		 * Validate if dealer image and/or text is provided.
		 *
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		validateDealerAppearance = function (layer) {

			try {

				var

					/**
					 * @type {String}
					 */
					BN_macros = layer.root.getMacros();

				if (!BN_macros['dealer_logo_url'] || (BN_macros['dealer_logo_url'] && !utils.isUrl(BN_macros['dealer_logo_url']))) {

					// Delete invalid macro value, so it doesn't not generate network error.
					BN_macros['dealer_logo_url'] = '';

					// Add CSS class identifier.
					layer.root.addAttr('dealer_logo_empty', { name: 'dealer_logo_empty', global: true});

				}

				if (!BN_macros['dealer_name'] || utils.isEmptyString(BN_macros['dealer_name'])) {

					// Delete invalid macro value, so it doesn't not generate network error.
					// BN_macros['dealer_name'] = '';

					// Add CSS class identifier.
					layer.root.addAttr('dealer_name_empty', { name: 'dealer_name_empty', global: true});

				}

				// if (!BN_macros['dealer_city'] || utils.isEmptyString(BN_macros['dealer_city'])) {
				//
				// 	// Delete invalid macro value, so it doesn't not generate network error.
				// 	// BN_macros['dealer_city'] = '';
				//
				// 	// Add CSS class identifier.
				// 	layer.root.addAttr('dealer_city_empty', { name: 'dealer_city_empty', global: true});
				//
				// }

			} catch (e) {
			}
		},

		/**
		 * @type {Function}
		 * @param layer {tactic.builder.layers.AbstractLayer}
		 * @param key {String}
		 */
		showModalElement = function (layer, key) {
			try {

				var

					/**
					 * @type {(tactic.builder.layers.JointLayer)}
					 */
					CV_layer = layer.root.getLayer('CV', 2),

					/**
					 * @type {(tactic.builder.layers.SequenceLayer)}
					 */
					SQ_layer = layer.root.getLayer('SQ', 2);

				// Check if sequence has to be paused.
				if (SQ_layer !== layer) {

					CV_layer.addAttr(key + '_gesture');

					SQ_layer.pause();

				}

				CV_layer.addAttr(key + '_active');

			} catch (e) {
			}
		},

		/**
		 * @type {Function}
		 * @param layer {tactic.builder.layers.AbstractLayer}
		 */
		hideModalElements = function (layer) {
			try {

				var

					/**
					 * @type {(tactic.builder.layers.JointLayer)}
					 */
					CV_layer = layer.root.getLayer('CV', 2),

					/**
					 * @type {(tactic.builder.layers.SequenceLayer)}
					 */
					SQ_layer = layer.root.getLayer('SQ', 2);

				// Check if sequence has to be played back.
				if (SQ_layer !== layer) {

					SQ_layer.play();

				} else if (SQ_layer.current.index !== layer.frame) {

					CV_layer.removeAttr('VS_gesture');
					CV_layer.removeAttr('VS_active');

				}

			} catch (e) {
			}
		},

		/**
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		emptyLayerHandler = function (layer) {
			try {

				// Add empty attribute to the frame layer, so other layers know the scope.
				layer.addAttr('empty');

				var

					/**
					 * @type {String}
					 */
					key = layer.key,

					/**
					 * @type {String}
					 */
					alias = layer.alias,

					/**
					 * @type {tactic.builder.layers.AbstractLayer}
					 */
					holder_layer = layer.sequence ? layer.sequence.frames[layer.frame] : layer.root.getLayer('CV', 2);

				if (holder_layer.enabled && layer.parent.enabled) {

					// Add empty layer class to the sequence.
					holder_layer.addAttr( (alias ? alias : key) + '_empty', { name: (alias ? alias : key) + '_empty', global: true });

					// Add disabled layer class to the sequence.
					holder_layer.addAttr( (alias ? alias : key) + '_disabled', { name: (alias ? alias : key) + '_disabled', global: true });

				}

			} catch (e) {
			}
		},

		/**
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 */
		disabledLayerHandler = function (layer) {
			try {

				// Add disabled attribute to the frame layer, so other layers know the scope.
				layer.addAttr('disabled');

				var

					/**
					 * @type {String}
					 */
					key = layer.key,

					/**
					 * @type {String}
					 */
					alias = layer.alias,

					/**
					 * @type {tactic.builder.layers.AbstractLayer}
					 */
					holder_layer = layer.sequence ? layer.sequence.frames[layer.frame] : layer.root.getLayer('CV', 2);

				if (holder_layer.enabled && layer.parent.enabled) {

					// Add empty layer class to the sequence.
					holder_layer.addAttr( (alias ? alias : key) + '_disabled', { name: (alias ? alias : key) + '_disabled', global: true });

				}

			} catch (e) {
			}
		},

		/**
		 * @function
		 * @param {(Event)} event
		 */
		errorEventHandler = function (event) {

			// Track local event.
			container.trackEventNativeDef('log', 'error', 'ERR_ADVERT_CRITICAL');

			// Show fallback image.
			container.showFallback();

		},

		/**
		 * @function
		 * @param {tactic.builder.layers.AbstractLayer} layer
		 * @param {String} [url] Alternative click tag URL.
		 */
		clickEventHandler = function (layer, url) {

			var

				/**
				 * Get layer's click tag.
				 * @type {Object}
				 */
				click_tag = layer.getClickTag(url);

			// Open click tag using TACTIC container.
			// NB! It is important to not to use window.open() in order to handle specific vendor click tag settings.
			container.clickThrough(click_tag.url, click_tag.vars);

		};

	// Wait for TACTIC container initialisation ready scope event.
	// Start banner initialisation when container is ready, but wait with element build before fonts are loaded.
	container.ready(

		/**
		 * @param {Object} data
		 * @param {Object} data.editor
		 * @param {Object} data.banner
		 */
		function (data) {

			// Bind error event on window.
			utils.addEventSimple(window, 'error', errorEventHandler);

			// Bind error event on body.
			utils.addEventSimple(document.body, 'error', errorEventHandler);

			// Set editor scope data.
			editor = data.editor;

			// Create new Banner instance(s).
			// Include Banner instance to window namespace for easy access from console.
			// All further events and actions will be handled with callback handler.
			utils.each((['BN']),

				/**
				 * @param {String} banner_key
				 */
				function (banner_key) {

					// Create new Banner instance.
					// Duplicate date in case it is banner clone.
					// All further events and actions will be handled with callback handler.
					window.banner = window[banner_key] = new tactic.builder.layers.BannerLayer(banner_key, data.banner, bannerEventHandler);

				}
			);

		}
	);

})(tactic);
