# [TACTIC™ Boilerplate](https://tacticrealtime.com/)
# Dynamic Creatives

TACTIC™ Boilerplate is a part of TACTIC™ Creative SDK. Boilerplate provides you with a set of instruments and creative examples that shows you how to put together custom Dynamic Creatives. You have full control of the layout, size and content. You can create your own creatives depending on your individual needs.

Boilerplate package is designed to help developers to create, test and debug custom dynamic creatives before they will be uploaded to TACTIC™ application. The package includes development environment which allows to emulate TACTIC™ application's content editor and creative's public methods.

The package can be also used as an example and guide for development of dynamic creatives in general. It will explain how to recursively build complex frames and layers, place various assets, open click tags and much more. Package will also give you a hint on how to create multiple banner sizes which use common styles, scripts and single data source. Note that you can edit existing example or make your own creative from scratch. You're not obliged to use suggested creative example or creative data (with the only limitation for JSON asset data structure that come from predefined application's image and video picker directives).

## Solution
TACTIC™ Boilerplate allows to set dynamic creative data structure and see how data affects banner appearance at the same time. Boilerplate emulates application content (data) editor, so that the developer can build data structure, analyse content editor behaviour and develop banners at the same time, without the need to compile whole TACTIC™ application.

Content editor provides basic data inputs, such as image or video pickers, text inputs, drop downs, buttons etc. Use them to create content editor layout and data points. Boilerplate will provide this data for the banner, so you can change its appearance, behaviour, and place various assets into predefined placeholders.

After you are done with your dynamic creative, upload it to TACTIC™ Application. We will analyse, validate and perform quality assurance for you. If no issues will be found, creative will become available for the dedicated brand in the application, and can be used to create new adverts.

## Package Structure
You are free to use any kind of file structure within the package. Below is the description of various components for this particular Boilerplate package:

|    File    |   Description  |
|------------|----------------|
| manifest.json | Describes package structure and indicates file relations. Includes default create data. |
| index.html | Application's content editor environment emulator with included banner preview. |
| editor.html | Creative content editor structure. |
| fallback.html | Responsive HTML fallback that is used for automatic fallback generation. |
| scripts/vendor/tactic/library.js | Declaration of default TACTIC™ Library methods. |
| scripts/vendor/tactic/builder2.js | TACTIC™ Builder that help to place text, image and video assets into banner DOM. |
| scripts/banner.js | Banner initialisation script. Compiles banner, sets event binders, tacking points and user interaction logic. |
| styles/preset.css | Default CSS style preset for common HTML tags. |
| styles/layout.css | CSS styles that are common to all banner sizes. |
| 300x250.html | Banner size wrapper that combines scripts, HTML and CSS. |
| 300x250.png | Static fallback image. |
| assets/ | Folder to store banner assets like logotype, fonts and/ or any kind of other static assets to be used in the banner. |
| //crv-sdk.trtm.io/.../tactic.js | TACTIC™ Library scripts. Loads creative bundle, advert data and network adapter. Script is included automatically while running creative locally with boilerplate environment and when creative package is uploaded to application. |
| //crv-sdk.trtm.io/.../emulator.js | Script emulates TACTIC™ Library if banner is accessed locally without boilerplate environment. |

## Installation
First of all, install necessary development dependencies by running
``` sh
npm install
```

Boilerplate uses a local server to run. To run local server execute command:
``` sh
npm run serve
```
This command launches server on some available port and opens editor page in browser.

## Validation
For running validation of creative run the following command:
``` sh
npm run validate
```

Validation consists of three parts: formats validation, security validation and preview validation.
If you found errors on some stages and fixed them you can run only specific validation by executing on of three commands:

`npm run validate-formats` for formats validation

`npm run validate-security` for security validation

`npm run validate-preview` for preview validation

For detailed description of validation errors please see [this page](https://github.com/tacticrealtime/creative-validator/blob/master/ERROR_LIST.md).

## Packaging
For packaging your creative into .zip file before uploading to Tactic run the following command:
``` sh
npm run zip
```

## Minification
Loading size is usually limited by advertising networks. Minification helps to fulfill these requirments and decrease traffic.
By default minification is disabled in this boilerplate. To enable it please replace links to indexes in `manifest.json` to `.min.html` versions. For example `"index": "300x250/index.html",` should become `"index": "300x250/index.min.html",`.
Now you can run `npm run min` to generate minified versions of html, css and js files in creative. If you are using minified `manifest.json` please remember to run `npm run min` before testing your advert after any changes.
If you are enabled minification you can run `npm run minzip` command to minify and package your creative at once.
It is advised to enable minification only before uploading your creative to Tactic because during development it is easier to work without minification.
If you enabled minification you can change links in `manifest.json` back to not minified versions of indexes and continue work with them.
``` sh
npm run min
```

## Fallback Generation
Utility for automatic generation of fallback images for the creatives.
Fallback generator checks manifest.json for formats, generates a fallback image and saves it to a defined fallback path.
By default, the fallback generator will try to look for ./assets/logotype.png image and will use it in fallback.html for image generation.
If you specify a custom HTML-file path fallback generator will open your HTML-file, resize its viewport based on the defined formats and generate an image.
``` sh
npm run fallback
```

## Manifest Declaration
Manifest file explains creative structure. It has to be located in creative's package root and named `manifest.json`. Define default content in `data` object and change it using content editor `editor.html`.
``` json
{
  "type": "MANIFEST",
  "version": "1.0",
  "author": "Author Name",
  "brand": "Brand Name",
  "name": "Boilerplate",
  "created": "08/11/2017",
  "updated": "15/11/2017",
  "editor": {
    "url": "editor.html",
    "version": "1.1"
  },
  "sizes": [
    {
      type: "STATIC",
      "name": "140x350",
      "width": 140,
      "height": 350,
      "index": "140x350/index.html",
      "fallback": {
        "static": "140x350/fallback.png"
      }
    }
  ],
  "data": {
    "key": "Your dynamic value here"
  }
}
```

## Content Editor
Creative content editor `editor.html` provides various data inputs that you can use to give application user ability to edit dynamic content.
For detailed content editor example please see [this page](https://github.com/tacticrealtime/creative-editor/).
#### Base
Use `block`, `block-label` and `block-group` tags to create content editor structure.
``` html
<block title="Block">
    <block-label title="Group"></block-label>
    <block-group>
    	...
    </block-group>
</block>
```
#### Text Field
Use `text-field` tag to give user ability to define single line text values.
``` html
<block-field title="My Text">
    <text-field placeholder="Value" model="$data.text"></text-field>
</block-field>
```
#### Text Area
Use `text-field` tag to give user ability to define multi-line text values.
``` html
<block-field title="My Text">
    <text-area placeholder="Value" model="$data.text"></text-area>
</block-field>
```
#### Switch Button
``` html
<block-field title="Switch">
    <switch-button model="$data.switch">
		<switch-button-option value="value1">Value 1</switch-button-option>
		<switch-button-option value="value2">Value 2</switch-button-option>
	</switch-button>
</block-field>
```
#### Toggle Button
``` html
<block-field title="Toggle">
    <toggle-button model="$data.toggle" on="On" off="Off"></toggle-button>
</block-field>
```
#### Dropdown Select
``` html
<block-field title="Select">
   <dropdown-select model="$data.dropdown">
		<optgroup label="Group">
			<option value="value1">Option 1</option>
		</optgroup>
		<option value="value2">Option 2</option>
	</dropdown-select>
</block-field>
```
#### Image Picker
Use `image-picker` tag to give user ability to define image data. You are able to disable any kind of available image settings and define default parameters.
``` html
<block-field title="My Image">
    <image-picker model="$data.image"
			settings="{'defaults': {'params': {'scale': 'fill', 'polite': true}}, 'cropping': { 'ratios': {'300x250': {'label': '300x250', 'value': '300x250'}}}}"
			no-crop="false" no-align="false" no-cover="false" no-load="false"></image-picker>
</block-field>
```
#### Video Picker
Use `video-picker` tag to give user ability to define video data. You are able to disable any kind of available image settings and define default parameters.
``` html
<block-field title="My Video">
    <image-picker model="$data.video"
			settings="{'defaults': {'params': {'scale': 'fill', 'polite': true, 'mute': true, 'controls': false, 'autoplay': true}}, 'cropping': { 'ratios': {'300x250': {'label': '300x250', 'value': '300x250'}}}}"
			no-crop="false" no-align="false" no-cover="false" no-load="false" no-autoplay="true" no-controls="true" no-mute="true" no-loop="false"></image-picker>
</block-field>
```
#### Color Picker
Use `color-picker` tag to give user ability to define color.
``` html
<block-field title="My Color">
    <color-field placeholder="HEX / RGB / RGBA" model="$data.color"></color-field>
</block-field>
```

## API Methods
JavaScript `tactic` namespace with container external methods is always available in the banner. Use it to open click tags, track events or perform any other ad vendor related actions without thinking about ad vendors API differences.
#### tactic.container.ready(callback : Function) : void
``` js
// Wait for TACTIC Container initialisation ready state.
tactic.container.ready(function (data) {

    var
		/**
		 * Initialise your banner as soon as you get data.
		 * @type {Creative}
		 */
		banner = new YourBannerInitialiser(data);

});
```
#### tactic.container.clickThrough(url : String, [vars : Object], [params : Object]) : String
Open specific destination with additional parameters. Ad vendor click tag URL will be merged with requested URL automatically.
``` js
tactic.container.clickThrough('https://www.yourdestination.com/', {

	/**
	 * Indicate URL variables to be added to destination URL.
	 * @type {String}
	*/
	utm_campaign: 'campaignName'

}, {

	/**
	 * Indicate window target.
	 * @type {String}
	*/
	target: '_blank',

	/**
	 * Indicate if URL variables have to be encoded. Default value is 'false'.
	 * @type {Boolean}
	 */
	encode: true,

	/**
	 * Indicate if requested URL variables have to be merged with initial ad vendor variables. Default value is 'true'.
	 * @type {Boolean}
	 */
	merge: true

});
```
Open initial ad vendor click tag.
``` js
tactic.container.clickThrough(null);
```
#### tactic.container.requestResize(width : Number, height : Number, [x : Number], [y : Number]) : Boolean
Resize banner window (if supported by ad vendor). Will return 'true' on success.
``` js
tactic.container.requestResize(300, 600);
```
#### tactic.container.requestExpand() : Boolean
Request banner expand (if supported by ad vendor). Will return 'true' on success.
``` js
tactic.container.requestExpand();
```
#### tactic.container.requestCollapse() : Boolean
Request banner collapse (if supported by ad vendor). Will return 'true' on success.
``` js
tactic.container.requestCollapse();
```
#### tactic.container.requestClose() : Boolean
Close banner (if supported by ad vendor). Will return 'true' on success.
``` js
tactic.container.requestClose();
```
#### tactic.container.one(event : String, callback : Function) : Boolean
Ad event listeners to API events.
``` js
tactic.container.one(tactic.container.EVT_ADAPTER_POLITE, function() {
    // Place heavy content into the banner on polite load ready event.
});
```
#### tactic.url.sanitize(url : String) : String
Sanitize your URL to get correct protocol.
``` js
tactic.url.sanitize('//crv-res.trtm.io/samples/images/table-laptop-coffee-640.jpg');
// Will return 'https://crv-res.trtm.io/samples/images/table-laptop-coffee-640.jpg?__tbi=0'
```

## API Layers
To ease work with assets, we created common elements that will utilise all content editor features.
#### tactic.layers.BannerLayer(key : String, data : Object, [callback : Function], [overrides : Object]) : void
Creates banner instance, will try to parse and build layers identified in advert data automatically.
``` html
<body></body>
```
``` js
var

	/**
	 * Define banner data.
	 * @type {Object}
	 */
	data       = {

		/**
		 * @type {String}
		 */
		type: "BannerLayer",

		/**
		 * Indicate banner click tag parameters.
		 * Use "BannerLayer.getClickTag()" method later to get clicktag value and URL variables.
		 *
		 * @type {Object}
		 */
		clicktag: {

			/**
			 * @type {Boolean}
			 */
			override: true,

			/**
			 * Indicate if requested URL variables have to be merged with initial network variables. Default value is 'true'.
			 *
			 * @type {Boolean}
			 */
			synchronise: true,

			/**
			 * Indicate if URL variables have to be encoded. Default value is 'true'.
			 *
			 * @type {Boolean}
			 */
			encode: true,

			/**
			 * Indicate redirect URL value.
			 *
			 * @type {String}
			 */
			url: "https://www.tacticrealtime.com/",

			/**
			 * Indicate alternative click tags (e.g. if you need different click tag per banner frame).
			 *
			 * @type {Array}
			 */
			options: [
				{

					/**
					 * @type {String}
					 */
					url: "https://www.tacticrealtime.com/platform/"

				}
			]
		},

		/**
		 * Indicate banner UTM definition values.
		 * Will be added as URL variables to destination URL on BannerLayer.getClickTag() method call.
		 *
		 * @type {Object}
		 */
		definition: {

			/**
			 * @type {String}
			 */
			utm_campaign: "",

			/**
			 * @type {String}
			 */
			utm_content: "",

			/**
			 * @type {String}
			 */
			utm_medium: "",

			/**
			 * @type {String}
			 */
			utm_source: "",

			/**
			 * @type {String}
			 */
			utm_term: ""

		},

		/**
		 * Define banner parameters.
		 * @type {Object}
		 */
		params: {

			/**
			 * @type {Object}
			 */
			wait: {

				/**
				 * Indicate if banner has to wait for font load complete event.
				 * @type {Array}
				 */
				fonts: [

					/**
					 * Indicate font face to wait for.
					 *
					 * @type {String}
					 */
					"OpenSans"

				]

			}
		},

		/**
		 * @type {Object}
		 */
		layers: {

			// Recursive layer structure.

		}

	};

var

	/**
	 * Create new Banner layer.
	 * @type {tactic.layers.BannerLayer}
	 */
	banner = new tactic.layers.BannerLayer('BN', data, function (event) {

		// Look for event type.
		switch (event.type) {

			case 'init':

				// Load text on init.
				this.load();

				break;

			case 'load':

				// Do something on load complete event.
				// For example output created image object to console.
				console.log(this);

				break;

		}

	});
```


#### tactic.layers.TextLayer(key : String, data : Object, [callback : Function], [parent : Object], [overrides : Object]) : void
Inject text into banner's DOM element. Method will automatically resize text if it doesn't fit container bounds.
``` html
<body>
    <div data-key="TXT_WRAPPER" style="width: 240px; height: 120px;">
    	<table>
    		<tr>
    			<td data-key="TXT_HOLDER">
					<div data-ket="TXT"></div>
    			</td>
    		</tr>
    	</table>
    </div>
</body>
```
``` js
var

	/**
	 * Define text data.
	 * @type {Object}
	 */
	data       = {

		/**
		 * @type {String}
		 */
		type: "TextLayer",

		/**
		 * Define layer parameters.
		 * @type {Object}
		 */
		params: {

			/**
			 * Identify text holder, it will be used to apply font size value while automatic text size adjustment.
			 * @type {Array}
			 */
			holder: 'TXT_HOLDER',

			/**
			 * Identify text wrapper, it will be used as text area size indicator while automatic text size adjustment.
			 * @type {Array}
			 */
			wrapper: 'TXT_WRAPPER',

			/**
			 * Identify if text element has to be wrapper in additional HTML tags.
			 * @type {Array}
			 */
			tags: [
				'p'
			],

			/**
			 * Identify line break params.
			 * @type  {Object}
			 */
			line: {

				/**
				 * Identify HTML element before line break.
				 * @type  {String}
				 */
				before: '',

				/**
				 * Identify HTML element after line break.
				 * @type  {String}
				 */
				after: '<br/>'

			}

		},

		/**
		 * Identify text source options.
		 * Text with smaller length will be selected if application will identify that big text can't fit container.
		 * @type {Array}
		 */
		sources: [
			{
				text: 'Hello World! Text option with long text here.'
			},
			{
				text: 'Hello World!'
			}
		]

	};

var

	/**
	 * Create new Text layer.
	 * @type {Text}
	 */
	layer = new tactic.layers.TextLayer('TXT', data, function () {

		// Look for event type.
		switch (event.type) {

			case 'init':

				// Load text on init.
				this.load();

				break;

			case 'load':

				// Do something on load complete event.
				// For example output created image object to console.
				console.log(this);

				break;

		}

	});
```
#### tactic.layers.ImageLayer(key : String, data : Object, [callback : Function], [parent : Object], [overrides : Object]) : void
Inject image into banner's DOM element.
``` html
<body>
    <div date-key="IMG" style="width: 240px; height: 240px;"></div>
</body>
```
``` js
var

	/**
	 * Define image data.
	 * @type {Object}
	 */
	data  = {

		/**
		 * @type {String}
		 */
		type: "ImageLayer",

		/**
		 * Define layer parameters.
		 * @type {Object}
		 */
		params: {

			/**
			 * Identify if image element has to be wrapper in additional HTML tags.
			 * @type {Array}
			 */
			tags: [
				'div'
			],

			/**
			 * Identify cropping settings in percent from edges (top, right, bottom, left).
			 * @type {Array}
			 */
			crop: [
				0,
				0.2,
				0,
				0.2
			],

			/**
			 * Identify alignment settings.
			 * @type {Array}
			 */
			align: [

				/**
				 * Possible values: 'left', 'center', 'right'.
				 * @type {String}
				 */
				'center',

				/**
				 * Possible values: 'top', 'middle', 'bottom'.
				 * @type {String}
				 */
				'middle'

			],

			/**
			 * Identify if image has to fill or fit container.
			 * Possible values:  'fill', 'fit'.
			 * @type {String}
			 */
			scale: 'fill',

			/**
			 * Identify if image has to be loaded politely.
			 * @type {Boolean}
			 */
			polite: true,

			/**
			 * Identify if image has to be placed as background image.
			 * @type {Boolean}
			 */
			background: false,

			/**
			 * Identify if image has to be resized, cropped and aligned.
			 * @type {Boolean}
			 */
			resize: true

		},

		/**
		 * Identify image source options.
		 * @type {Array}
		 */
		sources: [
			{
				width:  640,
				height: 427,
				url:    'http://crv-res.trtm.io/samples/images/table-laptop-coffee-640.jpg'
			},
			{
				width:  320,
				height: 214,
				url:    'http://crv-res.trtm.io/samples/images/table-laptop-coffee-320.jpg'
			}
		]

	};

var

	/**
	 * Create new Image layer.
	 * @type {Text}
	 */
	layer = new tactic.layers.ImageLayer('IMG', data, function (event) {

		// Look for event type.
		switch (event.type) {

			case 'init':

				// Load image on init.
				this.load();

				break;

			case 'load':

				// Do something on load complete event.
				// For example output created image object to console.
				console.log(this);

				break;

		}

	});
```
#### tactic.layers.VideoLayer(key : String, data : Object, [callback : Function], [parent : Object], [overrides : Object]) : void
Inject video into banner's DOM element.
``` html
<body>
    <div date-key="VIDEO" style="width: 640px; height: 480px;"></div>
</body>
```
``` js
var

	/**
	 * Define video data.
	 * @type {Object}
	 */
	data  = {

		/**
		 * @type {String}
		 */
		type: "VideoLayer",

		/**
		 * Define layer parameters.
		 * @type {Object}
		 */
		params: {

			/**
			 * Identify if image element has to be wrapper in additional HTML tags.
			 * @type {Array}
			 */
			tags: [
				'div'
			],

			/**
			 * Identify cropping settings in percent from edges (top, right, bottom, left).
			 * @type {Array}
			 */
			crop: [
				0,
				0.2,
				0,
				0.2
			],

			/**
			 * Identify alignment settings.
			 * @type {Array}
			 */
			align: [

				/**
				 * Possible values: 'left', 'center', 'right'.
				 * @type {String}
				 */
				'center',

				/**
				 * Possible values: 'top', 'middle', 'bottom'.
				 * @type {String}
				 */
				'middle'

			],

			/**
			 * Identify if image has to fill or fit container.
			 * Possible values:  'fill', 'fit'.
			 * @type {String}
			 */
			scale: 'fill',

			/**
			 * Identify if image has to be loaded politely.
			 * @type {Boolean}
			 */
			polite: true,

			/**
			 * Define if video controls have to be displayed.
			 * @type {Boolean}
			 */
			controls: true,

			/**
			 * Define preload mode.
			 * Same as defaults for video HTML element (https://www.w3schools.com/tags/att_video_preload.asp).
			 * Possible values:  'auto', 'metadata', 'none'.
			 * @type {String}
			 */
			preload: 'metadata',

			/**
			 * Identify if video has to be played inline.
			 * @type {Boolean}
			 */
			inline: true,

			/**
			 * Identify if video has to be played automatically.
			 * @type {Boolean}
			 */
			autoplay: true,

			/**
			 * Identify if video will proceed playing after it ends.
			 * @type {Boolean}
			 */
			loop: true,

			/**
			 * Define video volume.
			 * @type {Number}
			 */
			volume: 0.6,

			/**
			 * Identify if video has to be muted.
			 * @type {Boolean}
			 */
			muted: true

		},

		/**
		 * @type {Array}
		 */
		sources: [
			{
				width:  640,
				height: 360,
				url:    'http://crv-res.trtm.io/samples/videos/bbb-640.mp4'
			},
			{
				width:  320,
				height: 180,
				url:    'http://crv-res.trtm.io/samples/videos/bbb-320.mp4'
			}
		]

	};

var

	/**
	 * Create new Video layer.
	 * @type {Text}
	 */
	layer = new tactic.layers.VideoLayer('VIDEO', data, function (event) {

		// Look for event type.
		switch (event.type) {

			case 'init':

				// Load video on init.
				this.load();

				break;

			case 'load':

				// Play video on load complete event.
				this.play();

				break;

		}

	});
```

## API Utilities
We provide a set of utilities that you are able to use to ease development of your banner.
#### tactic.utils.watchFont(font : String, callback: Function, [timeout : Number]) : void
Wait for font load.
``` css
@font-face {
	font-family: 'font_light';
	src:         url('../assets/fonts/opensans-regular.eot');
	src:         url('../assets/fonts/opensans-regular.eot?#iefix') format('embedded-opentype'),
	             url('../assets/fonts/opensans-regular.woff2') format('woff2'),
                 url('../assets/fonts/opensans-regular.woff') format('woff'),
	             url('../assets/fonts/opensans-regular.ttf') format('truetype');
	font-weight: normal;
	font-style:  normal;
}

*.font_light {
	font-family: 'font_light', sans-serif;
}
```
``` js
tactic.utils.watchFont('font_light', function(font, success) {
    // Check if load was successful.
    if (success) {
        // Output successful status to console.
        console.log('Font "' + font + '" is loaded.');
    }
}, 1000);
```
#### tactic.utils.replaceMacros(object : (Object|Array|String), macros: Object, [depth : Number]) : (Object|Array|String)
Utility replaces text macros in strings and objects recursively. Will return same object, but with replaced macros.
``` js
var

	/**
	 * @type {String}
	 */
    rawText = 'The quick {foxColor} fox jumps overlay the lazy dog.',

	/**
	 * @type {Object}
	 */
    macros = {

    	/**
    	 * @type {String}
    	 */
        foxColor: 'brown'

    };

var

	/**
	 * Execute utility and replace raw text with available macros.
	 * @type {String}
	 */
    replacedText = tactic.utils.replaceMacros(rawText, macros);

// Log updated text to console, will output 'The quick brown fox jumps overlay the lazy dog.'.
console.log(replacedText);
```

## Technologies
Boilerplate uses a number of open source projects and languages to work properly:
- [HTML](https://www.w3schools.com/html/html_intro.asp) - creative markup.
- [CSS](https://www.w3schools.com/css/) - creative styling and animation.
- [JavaScript](https://www.javascript.com) - creative core and functionality.
- [AngularJS](https://angularjs.org) - creative content editor.
- [JSON](https://json.org) - creative data format.

## Limitations
The Boilerplate package limitations are as follows:
- You are limited to use HTML, CSS and JavaScript languages only.
- Scripts, styles, static assets and any other includes have to be stored within the package. You are not able to use external requests (except trtm.io domain).
- Boilerplate package structure has to be described in "manifest.json".
- Creative content editor has to be assembled in "editor.html".
- Do not include "node_modules" and system files like ".DS_Store" or "Thumbs.db" into package when uploading creative to application.
- Maximum package size is limited to 10MB.

## To-dos
 - Make JSON schema

## Licence
https://tacticrealtime.com/license/sdk/

## Hints
The main challenge of designing a template is fitting banner elements into all formats and saving their aspect ratio at the same time. By keeping creative simple, you are facilitating the accomplishment of a task.
#### Save Production Time
There are several practices of optimised banner production process. One of those lies in dividing all banner formats into several basic ones – square (480x400), tall (120x600), and wide (980x120). Use those sizes to do wire framing and layout of required banner elements. It will be much easier to design the rest of the formats when you have basic ones ready.
#### Keep It Small
The weight of the banner is one of the most important characteristics. The majority of advertisers require single banner size to be less than hundred kilobytes. To achieve this and increase banner load speed, avoid using special web fonts and try to go for HTML/CSS rendering instead of images.
#### Text Asset Specifics
Text is one of most problematic elements of the banner. Narrow formats have a lack of space for long words and it is barely possible to adjust those when text is dynamic. As a best practice, set maximum text length and use it in all formats, so it looks natural and easy to read. Please note that TACTIC™ offers automatic text adjustment feature that helps to fit text within marked area by reducing font size.
#### Image Asset Specifics
Huge amount of various banner formats creates several problems for pixel-perfect fitment of dynamic images. While designing a template, you have to keep in mind that TACTIC™ offers several features for image positioning and cropping. Every image can be cropped and aligned for square, portrait and landscape formats independently.
#### Animation
Animation becomes very sensitive case for mobile devices because of high PPU usage. Some advertisers have strict limitations which have to be analysed before designing a template. Avoiding unnecessary animation will help to fit most of advertiser guidelines and increase user experience.
#### Frames
It is possible to use frames for any banner element in the creative. Frames can be switched automatically, by interaction with user, or both. We offer ready-made solution for frame controls in the Boilerplate package example.

For more information, see TACTIC™ [help page](https://help.tacticrealtime.com/) or contact [creative development team](https://tacticrealtime.com/?r=company-tallinn).

Copyright (C) 2017 TACTIC™ Real-Time Marketing
