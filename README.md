# PHP-Utils README

Genera e inserice nel file i metodi per le classi PHP

## Features

Per generare i metodi e' necessario posizionarsi sulla stessa linea o selezionare le linee di cui si vogliono genereare i metodi.

## Installation

[Downlaod](https://git.scolciserver.com/scolcipitato/PHP-Utils/-/releases)

Per installare l'estensione e' necessario aprire il `CMD` o `Powershell` e recorsi nella cartella in cui si e' scaricato il file `.VSIX`, quindi cipiare e incillare il seguente comando
~~~
code --install-extension PHP-Utils-X.X.X.vsix
~~~

## Requirements

Nessuno.

## Extension Settings

Nada.

## Known Issues

Tutto OK.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.1.0

#### Fix:

- Issue #2

#### Aggiunte:

- Auto indentazione
- Template

### 1.0.0

Initial release


## Template

I template possono essere usati inserenoli nelle cartelle:
- Linux: `~/.config/Code/User/phpGettersSetters`
- OSX: `~/Library/Application Support/Code/User/phpGettersSetters`
- Windows: `Users\{User}\AppData\Roaming\Code\User\phpGettersSetters`

I template devono essere contenuti in un je `.js`, fatto questo sara necessario andare nelle impostazioni e cercare per `PHP-Utils`, e infine cambiare le impostazioni desiderate.

### Template di default

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

Se volete creare i vostri template sara necessario creare il file `.js` deve avere una struttura di base come mostrato.

```javascript
module.exports = (line) => {
    //code here
}
```

Cosi si crea una funzione che puo essere importata e usata per creare il template, e per far cio esiste la classe `Line` la cui ha:
- `getVisibility()` la visibilita dell'attributo [public, private, protected]
- `getType()` il tipo dell'attributo (se presente) [int, float, string, ...]
- `getName()` il nome dell'attributo
- `getNameCamel()` il nome dell'attributo con la prima lettera maiuscola
- `getSpacing()` la distanza tra l'attributo e il margine sinistro di vs code, serve per l'indentazione automatica