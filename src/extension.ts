import { error } from 'console';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPGetter', () => {
			//code
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPSetter', () => {
			//code
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.insertPHPGetterAndSetter', () => {
			//code
	}));

	context.subscriptions.push(
		vscode.commands.registerCommand('PHP-Utils.cmdProva', () => {
			// let editor = vscode.window.activeTextEditor;
			// let selection = editor.selection;
			// let txt = editor.document.getText(selection);
			// let world = 'world';
			// let txt = `Hello ${world}`;
			let config = vscode.workspace.getConfiguration('PHP-Utils');
			vscode.window.showInformationMessage("HI");
	}));
}

function insert(fnc: () => string) {
	let editor = vscode.window.activeTextEditor;
	if(editor == null) { showErrorMessage('Errore editor'); return;}
	let line = null;
	let closingLine: vscode.TextLine = editor.document.lineAt(0);
	let txt = [];
	let text = "";
	for(let selection of editor.selections) {
		txt = editor.document.getText(selection).replace('\r', '').split('\n');
		for(let ln of txt) {
			line = new Line(ln);
			text = fnc();
			if (!text) { showErrorMessage('Template mancante'); return; }
			try {
				closingLine = closingClassLine(editor);
				editor.edit(function(edit: vscode.TextEditorEdit) {
					edit.replace(new vscode.Position(closingLine.lineNumber, 0), text);
				}).then(
					success => showInformationMessage('Funzione generata con successo.'),
					error => showErrorMessage('Errore nel generare le funzioni: ' + error)
				);
			} catch(e) {
				showErrorMessage(String(e));
			}
		}
	}
}

function closingClassLine(editor: vscode.TextEditor) {
	for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
		if (editor.document.lineAt(lineNumber).text.trim().startsWith('}')) {
			return editor.document.lineAt(lineNumber);
		}
	}
	throw new Error("Impossibile trovare la linea per inserire il testo");
}

// function getGetterTemplate() {
// 	let config = vscode.workspace.getConfiguration('PHP-Utils');

// }

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


// this method is called when your extension is deactivated
export function deactivate() {}
