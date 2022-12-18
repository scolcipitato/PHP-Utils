import * as vscode from 'vscode';
import path = require('path');
import os = require('os');
import fs = require('fs');


export function activate(context: vscode.ExtensionContext) {
	createTemplateDir();

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
		vscode.commands.registerCommand('PHP-Utils.insertPHP__ToString', () => {
			insert(getToStringTemplate);
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHP__construct', () => {
			insert(getConstructTemplate);
	}));
}

/**
 * 
 * @param fnc a function with one parameter that must be Lineor Line[]
 */
function insert(fnc: (line: any) => string): void {
	let editor = vscode.window.activeTextEditor;
	if(editor == null) { showErrorMessage('Error with the editor'); return; }

	let lines = fromSelectionToLines(editor);
	
	let template: string;
	try {
		template = renderMultipleTemplate(lines, fnc);
	} catch(e) {
		template = renderSigleTemplate(lines, fnc);
	}
	if (!template) { showErrorMessage('Missing template'); return; }
	try {
		let closingLine = closingClassLine(editor);
		editor.edit(function(edit: vscode.TextEditorEdit) {
				if(closingLine == null) { showErrorMessage('Line selector error'); return;}
				edit.replace(new vscode.Position(closingLine.lineNumber, 0), template);
		}).then(
			success => showInformationMessage('Function generated successfully.'),
			error => showErrorMessage('Error while generating functions: ' + error)
		);
	} catch(e) {
		showErrorMessage(String(e));
	}
}

/**
 * From selected line in the editor return the line as Line object
 * @param editor 
 * @returns lines: Line[]
 */
function fromSelectionToLines(editor: vscode.TextEditor): Line[] {
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

/**
 * Find the last line of your php file
 */
function closingClassLine(editor: vscode.TextEditor) {
	for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
		if (editor.document.lineAt(lineNumber).text.trim().startsWith('}')) {
			return editor.document.lineAt(lineNumber);
		}
	}
	throw new Error("Impossible finding the line for inserting text");
}


/**
 * Class that store information on the arribute of a class
 */
class Line {
	visibility: string;
	type: string;
	name: string;
	spacing: string;

	constructor(line: string) {
		let sepLine = line.trim().replace(/(?:\W)(?<![\$\ ])/g, '').replace(/\s{2,}/g, ' ').split(' ');
		this.spacing = line.substr(0, /\w/.exec(line)?.index);
		const vis = ["public", "private", "protected"]
		if(vis.indexOf(sepLine[0]) >= 0) {
			this.visibility = vis[vis.indexOf(sepLine[0])];
		} else {
			throw new Error('The selected line is not an attribute of a class');
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

	getNameFirstLetterUpper() {
		return this.name[0].toUpperCase() + this.name.substring(1);
	}

	getNameCamel() {
		return this.getNameFirstLetterUpper().replace(/([_][a-z])/ig, ($1) => {
			return $1.toUpperCase()
				.replace('_', '');
		})
	}

	getSpacing() {
		return this.spacing;
	}
}


/*
	OUTPUT FUNCTION
*/

function showErrorMessage(msg: string) {
	vscode.window.showErrorMessage("PHP Utils: " + msg);
}

function showInformationMessage(msg: string) {
	vscode.window.showInformationMessage("PHP Utils: " + msg);
}


/*
	CUSTOM TEMPLATE FUNCTION
*/

function templateDefaultDir() {
	let dir: string;
	switch(process.platform) {
		case 'darwin':
			dir = path.join(os.homedir(), 'Library', 'Application Support');
			break;
		case 'linux':
			dir = path.join(os.homedir(), '.config');
			break;
		case 'win32':
			dir = process.env.APPDATA ? process.env.APPDATA : "";
			break;
		default:
			showErrorMessage("OS not supported");
			throw new Error("OS not supported");
	}
	return path.join(dir, 'Code', 'User', 'PHP-Utils');

}

function exists(toTest: string | null) {
	if(toTest != null) {
		return fs.existsSync(toTest);
	}
	return false;
}

function getTemplate(file: string) {
	if(file == "") {
		return null;
	}
	return path.join(templateDefaultDir(), file);
}

function createTemplateDir() {
	let templateDir = templateDefaultDir();

	if(!exists(templateDir)) {
		fs.mkdir(templateDir, (err) => {
			showErrorMessage("Something went wrong while creating the needed directory");
			throw new Error("Something went wrong while creating the needed directory");
		})
	}
}

function getTemplateFileName(type: string) {
	let res: string | undefined = vscode.workspace.getConfiguration('PHP-Utils').get(type);
	return res ? res : "";
}


/*
	RENDERING FUNCTION
*/

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


/*
	TEMPLATE FUNCTION
*/

function getGetterTemplate(line: Line) {
	let fileName = getTemplate(getTemplateFileName('getterTemplate'));
	if(exists(fileName) && fileName) {
		let fnc = require(fileName);
		return fnc(line);
	}
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

function getSetterTemplate(line: Line) {
	let fileName = getTemplate(getTemplateFileName('setterTemplate'));
	if(exists(fileName) && fileName) {
		let fnc = require(fileName);
		return fnc(line);
	}
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

function getGetterSetterTemplate(line: Line) {
	return getGetterTemplate(line) + getSetterTemplate(line);
}

function getToStringTemplate(lines: Line[]) {
	let fileName = getTemplate(getTemplateFileName('toStringTemplate'));
	if(exists(fileName) && fileName) {
		let fnc = require(fileName);
		return fnc(lines);
	}
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

function getConstructTemplate(lines: Line[]) {
	let fileName = getTemplate(getTemplateFileName('constructTemplate'));
	if(exists(fileName) && fileName) {
		let fnc = require(fileName);
		return fnc(lines);
	}
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

// this method is called when your extension is deactivated
export function deactivate() {}
