# PHP-Utils

Generate and insert methods for PHP classes into the file

## Features

To generate the methods it is necessary to position yourself on the same line or select the lines whose methods you want to generate.

## Installation

### Download it from github [releases](https://github.com/scolcipitato/PHP-Utils/releases):
To install the extension you need to open the `CMD` or` Powershell` and go to the folder where you downloaded the `.VSIX` file, then type and type the following command
~~~
code --install-extension PHP-Utils-X.X.X.vsix
~~~

### Download from vs code market
Search for the extension name

## Requirements

Visual studio code

## Extension Settings

* `PHP-Utils.getterTemplate`: Template for getter
* `PHP-Utils.setterTemplate`: Template for setter
* `PHP-Utils.toStringTemplate`: Template for toString
* `PHP-Utils.constructTemplate`: Template for construct


## Known Issues

For now none :)

## Release Notes

### 1.1.1
Translated in english for publishing

### 1.1.0

#### Fix:

- Issue [#2](https://github.com/scolcipitato/PHP-Utils/issues/2)

#### Addition:

- Auto indentation
- Template support

### 1.0.0

Initial release


## Template

Templates can be used by placing them in folders:
- Linux: `~ / .config / Code / User / PHP-Utils`
- OSX: `~ / Library / Application Support / Code / User / PHP-Utils`
- Windows: `Users \ {User} \ AppData \ Roaming \ Code \ User \ PHP-Utils`

The templates must be contained in a je `.js`, after that you will need to go into the settings and search for` PHP-Utils`, and finally change the desired settings.

### Default template

#### Template getter: 
```javascript
module.exports = (line) => {
    let template: string;
	if(line.getType()) {
		template = `
/**
* @return ${line.getType()}
*/
public function get${line.getNameCamel()}(): ${line.getType()} {
	return $this->${line.getName()};
}
`
	} else {
		template = `
public function get${line.getNameCamel()}() {
	return $this->${line.getName()};
}
`
	}
	return template.replace(/\n/gm, '\n' + line.getSpacing()).trimEnd() + '\n';
}
```

#### Template setter: 
```javascript
module.exports = (line) => {
    let template: string;
	if(line.getType()) {
		template = `
/**
* @param ${line.getType()} $${line.getName()}
*/
public function set${line.getNameCamel()}(${line.getType()} $${line.getName()}): void {
	$this->${line.getName()} = $${line.getName()};
}
`
	} else {
		template = `
/**
* @param $${line.getName()}
*/
public function set${line.getNameCamel()}($${line.getName()}) {
	$this->${line.getName()} = $${line.getName()};
}
`
	}
	return template.replace(/\n/gm, '\n' + line.getSpacing()).trimEnd() + '\n';
}
```

#### Template toString: 
```javascript
module.exports = (line) => {
    let template: string;
	let string = '';
	let type = true;
	for(let line of lines) {
		type = line.getType() != '' && type;
		string += `${line.getNameCamel()}: {$this->${line.getName()}}, `;
	}
	string = string.substr(0, string.length-2);
	if(type) {
		template = `
/**
* @return string
*/
public function __toString(): string {
	return "${string}";
}
`
	} else {
		template = `
/**
 * @return string
 */
public function __toString() {
	return "${string}";
}
`
	}
	return template.replace(/\n/gm, '\n' + lines[0].getSpacing()).trimEnd() + '\n';
}
```

#### Template construct: 
```javascript
module.exports = (line) => {
    let string = '';
	let params = '';
	let type = true;
	for(let line of lines) {
		type = line.getType() != '' && type;
		string += `\t$this->${line.getName()} = $${line.getName()};\n`;
	}
	for(let line of lines) {
		if(type) {
			params += `${line.getType()} $${line.getName()}, `;
		} else {
			params += `$${line.getName()}, `;
		}
	}

	params = params.substr(0, params.length-2);

	let template = `
function __construct(${params}) {
${string}
}
`
	return template.replace(/\n/gm, '\n' + lines[0].getSpacing()).trimEnd() + '\n';
}
```

If you want to create your own templates you will need to create the `.js` file which must have a basic structure as shown.

```javascript
module.exports = (line) => {
     // code here
}
```

This creates a function that can be imported and used to create the template, and to do so there is the `Line` class which has:
- `getVisibility ()` the visibility of the [public, private, protected] attribute
- `getType ()` the type of the attribute (if any) [int, float, string, ...]
- `getName ()` the attribute name
- `getNameCamel ()` the attribute name with the first capital letter
- `getSpacing ()` the distance between the attribute and the left margin of vs code, used for automatic indentation