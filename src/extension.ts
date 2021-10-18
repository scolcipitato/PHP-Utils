import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPGetter', () => {
			insert(getGetterTemplate);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPSetter', () => {
			insert(getSetterTemplate);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPGetterAndSetter', () => {
			insert(getGetterSetterTemplate);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPToString', () => {
			insert(getToStringTemplate, true);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.cmdProva', () => {
			// let editor = vscode.window.activeTextEditor;
			// let selection = editor.selections[0];
			// let txt = editor.document.getText(selection);
			// let world = 'world';
			// let txt = `Hello ${world}`;
			// let config = vscode.workspace.getConfiguration('PHP-Utils');
			vscode.window.showInformationMessage("HI");
			vscode.window.showInformationMessage(String(getToStringTemplate.name));
	}));
}

function insert(fnc: ((line: Line) => string) | ((line: Line[]) => string), molteplicy: boolean = false) {
	let editor = vscode.window.activeTextEditor;
	if(editor == null) { showErrorMessage('Errore editor'); return; }

	let lines = fromSelectionToLines(editor);
	
	let template: string;
	if(molteplicy) {
		template = renderMultipleTemplate(lines, fnc);
	} else {
		template = renderSigleTemplate(lines, fnc);
	}
	if (!template) { showErrorMessage('Template mancante'); return; }
	try {
		let closingLine = closingClassLine(editor);
		editor.edit(function(edit: vscode.TextEditorEdit) {
				if(closingLine == null) { showErrorMessage('Errore line selector'); return;}
				edit.replace(new vscode.Position(closingLine.lineNumber, 0), template);
		}).then(
			success => showInformationMessage('Funzione generata con successo.'),
			error => showErrorMessage('Errore nel generare le funzioni: ' + error)
		);
	} catch(e) {
		showErrorMessage(String(e));
	}
}

function fromSelectionToLines(editor: vscode.TextEditor) {
	let diff;
	let lines = [];
	let txt = [];
	for(let selection of editor.selections) {
		diff = selection.start.line - selection.end.line;
		diff *= (diff > 0) ? 1 : -1;
		for(let i = 0; i <= diff; i++) {
			txt = editor.document.getText(
				new vscode.Selection(selection.start.line+i, 0, selection.start.line+i, editor.document.lineAt(selection.start.line+i).text.length)
			).replace('\r', '').split('\n');
			for(let line of txt) {
				lines.push(new Line(line));
			}
		}
	}
	return lines;
}

function renderSigleTemplate(lines: Line[], fnc: (line: Line) => string) {
	let res = "";
	for(let line of lines) {
		res += fnc(line);
	}
	return res;
}

function renderMultipleTemplate(lines: Line[], fnc: (line: Line[]) => string) {
	return fnc(lines);
}

function closingClassLine(editor: vscode.TextEditor) {
	for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
		if (editor.document.lineAt(lineNumber).text.trim().startsWith('}')) {
			return editor.document.lineAt(lineNumber);
		}
	}
	throw new Error("Impossibile trovare la linea per inserire il testo");
}

function showErrorMessage(msg: string) {
	vscode.window.showErrorMessage("PHP Utils: " + msg);
}

function showInformationMessage(msg: string) {
	vscode.window.showInformationMessage("PHP Utils: " + msg);
}

class Line {
	visibility: string;
	type: string;
	name: string;

	constructor(line: string) {
		let sepLine = line.trim().replace(/(?:\W)(?<![\$\ ])/g, '').split(' ');
		const vis = ["public", "private", "protected"]
		if(vis.indexOf(sepLine[0]) >= 0) {
			this.visibility = vis[vis.indexOf(sepLine[0])];
		} else {
			throw new Error('La riga selezionata non e\' un\'attributo di una classe');
		}
		if(sepLine[1].match(/^\$/) === null) {
			this.type = sepLine[1];
			this.name = sepLine[2].replace('$', '');
		} else {
			this.type = '';
			this.name = sepLine[1].replace('$', '');
		}
	}

	getVisibility() {
		return this.visibility;
	}

	getType() {
		return this.type;
	}

	getName() {
		return this.name;
	}

	getNameCamel() {
		return this.name[0].toUpperCase() + this.name.substr(1);
	}
}


/*
	TEMPLATE FUNCTION
*/

function getGetterTemplate(line: Line) {
	let template;
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
	return template;
}

function getSetterTemplate(line: Line) {
	let template;
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
	return template;
}

function getGetterSetterTemplate(line: Line) {
	return getGetterTemplate(line) + getSetterTemplate(line);
}

function getToStringTemplate(lines: Line[]) {
	let template;
	let string = '';
	let type = true;
	for(let line of lines) {
		type = line.getType() == '' && type;
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
	return template;
}

// this method is called when your extension is deactivated
export function deactivate() {}
