// program Mishok 
// 	int a 
// begin
// for i = 1 to 5 step 1 do i + 1 next
// if i < 5
// 	out(i)
// else i + 1 endif
// end

var machineState = 1; 
var currentLineNumber = 1;
var currentLexemeCode = 1;
var langLexemes = ['program','begin','end','int','for','to','step',
	'do','next','in','out','if','else','endif',',','=','+','-',
	'*','/','(',')','>','<','&&','==','!=','<=','>=','idn','con','^', 'П', '!'];

var Lexeme = function(lexemeName) { 
	this.lexemeName = lexemeName; 
	this.lineNumber = currentLineNumber; 
	this.lexemeCode = currentLexemeCode;
	currentLexemeCode++;
	this.type = '';
	this.typeCode = '';

	this.isLangLexeme = function() {
		if (langLexemes.indexOf(this.lexemeName) !== -1) {
			return true;
		}
	}
} 
function isLetter(symbol) { 
	if (symbol >= 'A' && symbol <= 'z') 
		return true; 
	else return false; 
} 
function isOneSymbolDelimetr(symbol) {
	var delimiters = ['(', ')', ',', '|', '*', '/', '^'];
	if (delimiters.indexOf(symbol) !== -1) {
		return true;
	}
	else return false;
}
function isNumber(symbol) { 
	if (parseInt(symbol)) 
		return true; 
	else return false; 
}
function isPositiveNumber(symbol) { 
	if (parseInt(symbol) >= 0) 
		return true; 
	else return false; 
}
function isMathSign(symbol) {
	// var mathSigns = ['=','+','-','*','/','']
}
function showError(symbol) {
	$('.errors-container').append('Error on line ' + currentLineNumber + ' symbol:'+symbol+'<br>');
}
function isLexemEnd(symbol) {
	var delimiters = [' ', ',', '\t', '\n', '(',')','|','*','/', '^'];
	if (delimiters.indexOf(symbol) !== -1) {
		if (symbol === '\n') {
			currentLineNumber++;
		}
		return true;
	} else {
		showError(symbol);
	}
}

function addLexeme(lexemes, lexemeName) {
	lexeme = new Lexeme(lexemeName);
	var type = '';
	if (lexeme.isLangLexeme()) 
		lexeme.type = 'langLexemes';
	else lexeme.type = 'identifier';
	lexemes.push(lexeme);
}

function parseSymbol(symbol, nextSymbol) {
	var needsReanalyze = false;
	console.log('symbol=   ' + symbol)
	
	function analyzeState() {
		switch (machineState) { 
			case 1: 
				if (isLetter(symbol)) { 
					machineState = 2;
				}
				if (symbol === '+' || symbol === '-') {
					machineState = 3;
				}
				if (isNumber(symbol)) { machineState = 4;}
				if (isOneSymbolDelimetr(symbol)) { isLexemEnd(symbol); return symbol };
				if (symbol === '<') {
					machineState = 5;
				}
				if (symbol === '>') {
					machineState = 6;
				}
				if (symbol === '=') {
					machineState = 7;
				}
				if (symbol === '!') {
					machineState = 8;
				}
				if (symbol === '&') {
					machineState = 9;
				}
				needsReanalyze = true;
				break;
			case 2: 
				if (isLetter(symbol) || isNumber(symbol)) { return symbol; }
				if (isLexemEnd(symbol)) { return false; }
				break;
			case 3: 
				if (isLexemEnd(nextSymbol)) { return symbol; }
				if (isNumber(symbol)) { machineState = 4; needsReanalyze = true; }
				break;
			case 4:
				if (isNumber(symbol)) { return symbol; }
				if (isLexemEnd(symbol)) { return symbol; }
				break;
			case 5: 
				if (nextSymbol === '=') { return '<='; }
				else { return '<'; }
			case 6: 
				if (nextSymbol === '=') { return '=>'; }
				else { return '>'; }
			case 7:
				if (nextSymbol === '=') { return '=='; }
				else { return '='; }
			case 8:
				if (nextSymbol === '=') { return '!='; }
				else { showError(symbol); }
			case 9:
				if (nextSymbol === '&') { return symbol; }
				else { showError(symbol); return; }
			default:
				showError(symbol);
		} 
	}
	var result = analyzeState();
	if ( needsReanalyze ) { result = analyzeState() };
	machineState = 1;
	return result;
}

function parseLexemes(sourceCode) {
	var currentLexemName = ''; 
	var lexemes = [];
	for (var i = 0; i < sourceCode.length; i++) {
		var symbol = parseSymbol(sourceCode[i], sourceCode[i+1]);
		if (symbol) {
			currentLexemName += symbol;
		} else {
			addLexeme(lexemes, currentLexemName);
			currentLexemName = '';
		}
		if (symbol && symbol.length === 2) continue;
	}
	return lexemes;
}

function printLexeme(lexeme, number) {
	$('.lexemes-table-body').append(
		'<tr>'+
			'<td>'+number+'</td>'+
			'<td>'+lexeme.lineNumber+'</td>'+
			'<td>'+lexeme.lexemeName+'</td>'+
			'<td>'+lexeme.lexemeCode+'</td>'+
			'<td>'+lexeme.typeCode+'</td>'+
		'</tr>'
	)
}

function printLexemes(lexemes) {
	$('.lexemes-table-body').empty();
	for (var i = 0; i < lexemes.length; i++) {
		printLexeme(lexemes[i], i)
	}
}

function analyze(sourceCode) {
	machineState = 1; 
	currentLineNumber = 1;
	currentLexemeCode = 1;
	$('.errors-container').empty();
	var lexemes = parseLexemes(sourceCode);
	console.log('lexemes=');
	console.log(lexemes);
	printLexemes(lexemes);
}

$('#source-code').change(function () { 
	var sourceCode = $('#source-code').val();
	analyze(sourceCode);
});

$(document).ready(function() {
	var sourceCode = $('#default-value').text();
	$('#source-code').val( sourceCode );
	analyze(sourceCode);
});
