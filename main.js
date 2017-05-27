// program Mishok
// 	int a
// begin
// for i = 1 to 5 step 1 do i + 1 next
// if i < 5
// 	out(i)
// else i + 1 endif
// end

function countElementsWithValue(list, value) {
    var count = 0;
    for (var i = 0; i < list.length; i++) {
        if (list[i] === value) count++;
    }
    return count;
}

function unique(list, fieldName) {
    var result = [];
    var listNames = [];

    for (var i = 0; i < list.length; i++) {
        if (countElementsWithValue(listNames, list[i][fieldName]) === 0) {
            listNames.push(list[i][fieldName]);
            result.push(list[i]);
        }
    }
    return result;
}
var wasDivided = false;
var machineState = 1;
var needsReanalize = false;
var currentLineNumber = 1;
var langLexemesNames = ['program', 'begin', 'end', 'int', 'for', 'to', 'step',
    'do', 'next', 'in', 'out', 'if', 'else', 'endif', ',', '=', '+', '-',
    '*', '/', '(', ')', '>', '<', '&&', '==', '!=', '<=', '>=', '||', '↑', 'idn', 'con', 'П', '!'];
var dataTypes = ['int', 'program'];
var lexemeEnd = false;
var definedIdns = [];
var langLexemes = [];
var wasLexError = false;

var consts = [];
var idns = [];

for (var i = 0; i < langLexemesNames.length; i++) {
    langLexemes.push({
        name: langLexemesNames[i],
        code: i + 1
    });
}

var Symbol = function (symbolText) {
    this.text = symbolText;
    this.isLetter = function () {
        return this.text >= 'A' && this.text <= 'z';
    };
    this.isNumber = function () {
        return parseInt(this.text);
    };
    this.isOneSymbolDelimeter = function () {
        var delimiters = [',', '*', '/', '↑', ' ', '\t', '\n', 'П'];
        return (delimiters.indexOf(this.text) !== -1);
    };
    this.isPositiveNumber = function () {
        return (parseInt(this.text) >= 0);
    };
    this.isBreak = function () {
        return this.text === 'П';
    }
};

var Lexeme = function (lexemeName, type, line) {
    this.lexemeName = lexemeName;
    this.lineNumber = line ? line : currentLineNumber;
    this.type = type ? type : '';
    this.typeCode = '';
    this.dataType = '';

    this.isLineEnd = false;

    this.isLangLexeme = function () {
        if (langLexemesNames.indexOf(this.lexemeName) !== -1) {
            return true;
        }
    }
};

function showError(symbol, msg) {
    if (!symbol) symbol = '';
    if (!msg) msg = '';
    var errorInfo = 'Error on line ' + currentLineNumber + '. Symbol: ' + symbol + '. ' + msg;
    $('#lexical-errors').append(errorInfo + '<br>')
    wasLexError = true;
    throw Error(errorInfo);
}
function addLexeme(lexemes, lexemeName, position, symbol) {
    var wasDivided = false;
    var lexeme = new Lexeme(lexemeName);
    var type = '';
    var inDeclaration = true;
    if (lexeme.isLangLexeme())
        lexeme.type = 'langLexemes';
    else lexeme.type = 'identifier';
    if (parseInt(lexemeName) == lexemeName) lexeme.type = 'const';
    var lexemesNames = [];
    for (var i = 0; i < lexemes.length; i++) {
        lexemesNames.push(lexemes[i].lexemeName);
    }


    if (lexeme.type === 'identifier') {
        if (lexemesNames.indexOf(lexemeName) === -1) {
            for (var i = lexemes.length - 1; i >= 0; i--) {
                if (dataTypes.indexOf(lexemes[i].lexemeName) !== -1) {
                    lexeme.dataType = lexemes[i].lexemeName;
                    definedIdns.push(lexemeName);
                    break;
                }
                else {
                    if (definedIdns.indexOf(lexemes[i].lexemeName) === -1) {
                        // console.log(lexemes[i]);
                        // showError(lexemeName, 'undefined variable: ' + lexemeName);
                    }
                }
            }
        } else {
            var declaration = true;
            if (lexemesNames.indexOf("begin") !== -1) {
                 declaration = false;
            }
            
            if (declaration) {
                showError('Declaration of "' + lexemeName + '" doubled!')
            }
        }
    }
    if (!wasDivided) {
        lexemes.push(lexeme);
    }

}
function getLexemeCodeByName(lexemes, lexemeName) {
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i].lexemeName === lexemeName) {
            return lexemes[i].lexemeCode;
        }
    }
    return -1;
}
function getTypeCodeByName(lexemes, lexemeName) {
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i].lexemeName === lexemeName) {
            return lexemes[i].typeCode;
        }
    }
    return -1;
}
function setLexemeCodes(lexemes) {
    for (var i = 0; i < lexemes.length; i++) {
        for (var j = 0; j < langLexemes.length; j++) {
            if (lexemes[i].lexemeName === langLexemes[j].name) {
                lexemes[i].lexemeCode = langLexemes[j].code;
            }
        }
    }
    return lexemes;
}
function setIdnsConstsCodes(lexemes) {
    var uniqueLexemes = [];
    var currentConstCode = 1;
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i].type === 'const') {
            lexemes[i].lexemeCode = 33;
            var lexemeTypeCode = getTypeCodeByName(uniqueLexemes, lexemes[i].lexemeName);
            if (lexemeTypeCode === -1) {
                uniqueLexemes.push(lexemes[i]);
                lexemes[i].typeCode = currentConstCode;
                currentConstCode++;
            } else {
                lexemes[i].typeCode = lexemeTypeCode;
            }
        }
    }

    uniqueLexemes = [];
    var currentIdnCode = 1;
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i].type === 'identifier') {
            lexemes[i].lexemeCode = 32;
            lexemeTypeCode = getTypeCodeByName(uniqueLexemes, lexemes[i].lexemeName);
            if (lexemeTypeCode === -1) {
                uniqueLexemes.push(lexemes[i]);
                lexemes[i].typeCode = currentIdnCode;
                currentIdnCode++;
            } else {
                lexemes[i].typeCode = lexemeTypeCode;
            }
        }
    }

    return lexemes;
}

function resetMachine() {
    machineState = 1;
    lexemeEnd = true;
}

function state2(currentSymbol) {
    if (!(currentSymbol.isLetter() || currentSymbol.isNumber())) resetMachine();
}
function state3(currentSymbol) {
    if (currentSymbol.isNumber()) state4(currentSymbol);
    // else resetMachine();
}
function state4(currentSymbol) {
    if (!currentSymbol.isNumber()) resetMachine();
    if (currentSymbol.isLetter()) showError(currentSymbol.text, 'Letter goes after number in idn or const');
}
function state5(currentSymbol) {
    if (currentSymbol.text === '=') state6(currentSymbol);
    else resetMachine();
}
function state6(currentSymbol) {
    resetMachine();
}
function state7(currentSymbol) {
    if (currentSymbol.text === '=') state8(currentSymbol);
    else resetMachine();
}
function state8(currentSymbol) {
    resetMachine();
}
function state9(currentSymbol) {
    if (currentSymbol.text === '=') state10(currentSymbol);
    else resetMachine();
}
function state10(currentSymbol) {
    resetMachine();
}
function state11(currentSymbol) {
    if (currentSymbol.text === '=') state12(currentSymbol);
    else resetMachine();
}
function state12(currentSymbol) {
    resetMachine();
}
function state13(currentSymbol) {
    if (currentSymbol.text === '&') state14(currentSymbol);
    else showError(currentSymbol.text);
}
function state14(currentSymbol) {
    resetMachine();
}
function state15(currentSymbol) {
    if (currentSymbol.text === '|') state16(currentSymbol);
    else showError(currentSymbol.text);
}
function state16(currentSymbol) {
    resetMachine();
}
function state17(currentSymbol) {
    resetMachine();
}
function state18(currentSymbol) {
    resetMachine();
}
function state19(currentSymbol) {
    resetMachine();
}

function state1(currentSymbol) {
    if (currentSymbol.isLetter()) {
        state2(currentSymbol);
    } else if (currentSymbol.text === '+' || currentSymbol.text === '-' || currentSymbol.text === '*' || currentSymbol.text === '/') {
        state3(currentSymbol);
    } else if (currentSymbol.isNumber()) {
        state4(currentSymbol);
    } else if (currentSymbol.isOneSymbolDelimeter()) {
        state17(currentSymbol);
    } else if (currentSymbol.text === '<') {
        state5(currentSymbol);
    } else if (currentSymbol.text === '>') {
        state7(currentSymbol);
    } else if (currentSymbol.text === '=') {
        state9(currentSymbol);
    } else if (currentSymbol.text === '!') {
        state11(currentSymbol);
    } else if (currentSymbol.text === '&') {
        state13(currentSymbol);
    } else if (currentSymbol.text === '|') {
        state15(currentSymbol);
    } else if (currentSymbol.text === 'П') {
        state18(currentSymbol);
    } else if (currentSymbol.text === '(' || currentSymbol.text === ')') {
        state19(currentSymbol);
    }
    else
        showError(currentSymbol);
    return currentSymbol;
}


function parseSymbol(symbolText, nextSymbol) {
    var symbol = new Symbol(symbolText);
    symbol = state1(symbol);
    return symbol;
}

function replaceSymbol(string, oldSymbol, newSymbol) {
    var result = '';
    for (var i = 0; i < string.length; i++) {
        if (string[i] === oldSymbol) {
            result += newSymbol;
        } else {
            result += string[i];
        }
    }
    return result;
}
function parseLexemes(sourceCode) {
    var currentLexemName = '';
    var lexemes = [];
    var needsBreak = false;
    var commaWasAdded = false;
    sourceCode = replaceSymbol(sourceCode, '\n', 'П');
    sourceCode = replaceSymbol(sourceCode, '-', ' - ');
    sourceCode = replaceSymbol(sourceCode, '+', ' + ');
    sourceCode = replaceSymbol(sourceCode, '/', ' / ');
    sourceCode = replaceSymbol(sourceCode, '*', ' * ');
    sourceCode = replaceSymbol(sourceCode, '(', ' ( ');
    sourceCode = replaceSymbol(sourceCode, ')', ' ) ');
    for (var i = 0; i < sourceCode.length; i++) {
        var symbol = parseSymbol(sourceCode[i], sourceCode[i + 1]);
        if (lexemeEnd) {
            machineState = 1;
            lexemeEnd = false;
        }
        if (symbol.text === 'П') {
            needsBreak = true;
            resetMachine();
        }
        if (sourceCode[i] === '(') {
        }

        var nextSymbol = new Symbol(sourceCode[i + 1]);

        if (symbol.text === ',') {
        }

        if (symbol.isOneSymbolDelimeter()) {
            if (symbol.text === ',' || !nextSymbol.isOneSymbolDelimeter() || nextSymbol.text === '\t') {
                if (symbol.text !== '\t') {
                    if (!commaWasAdded) {


                        addLexeme(lexemes, currentLexemName);

                        if (symbol.text === ',') {
                            commaWasAdded = true;
                            addLexeme(lexemes, ',');
                        }

                        if (symbol.text === 'П') {
                            addLexeme(lexemes, 'П');
                        }

                        currentLexemName = '';
                        if (needsBreak) {
                            currentLineNumber++;
                            needsBreak = false;
                        }
                    } else commaWasAdded = false;
                }
            }

        } else currentLexemName += symbol.text;
        if (i === sourceCode.length - 1 && currentLexemName) {
            addLexeme(lexemes, currentLexemName);
        }
    }
    return lexemes;
}

function printLexeme(lexeme, number) {
    $('.lexemes-table-body').append(
        '<tr>' +
        '<td>' + number + '</td>' +
        '<td>' + lexeme.lineNumber + '</td>' +
        '<td>' + lexeme.lexemeName + '</td>' +
        '<td>' + lexeme.lexemeCode + '</td>' +
        '<td>' + lexeme.typeCode + '</td>' +
        '</tr>'
    )
}

function printConst(lexeme, number) {
    $('.consts-table-body').append(
        '<tr>' +
        '<td>' + lexeme.typeCode + '</td>' +
        '<td>' + lexeme.lexemeName + '</td>' +
        '</tr>'
    )
}

function printIdn(lexeme, number) {
    $('.idns-table-body').append(
        '<tr>' +
        '<td>' + lexeme.typeCode + '</td>' +
        '<td>' + lexeme.lexemeName + '</td>' +
        '<td>' + lexeme.dataType + '</td>' +
        '</tr>'
    )
}

function printLexemes(lexemes) {
    $('.lexemes-table-body').empty();
    for (var i = 0; i < lexemes.length; i++) {
        printLexeme(lexemes[i], i + 1);
    }
}

function printConsts(lexemes) {
    $('.consts-table-body').empty();
    var uniqueLexemes = unique(lexemes, 'lexemeName');
    var number = 1;
    for (var i = 0; i < uniqueLexemes.length; i++) {
        if (uniqueLexemes[i].type === 'const') {
            printConst(uniqueLexemes[i], number);
            consts.push(uniqueLexemes[i]);
            number++;
        }
    }
}

function printIdns(lexemes) {
    $('.idns-table-body').empty();
    var uniqueLexemes = unique(lexemes, 'lexemeName');
    var number = 1;
    for (var i = 0; i < uniqueLexemes.length; i++) {
        if (uniqueLexemes[i].type === 'identifier') {
            printIdn(uniqueLexemes[i], number);
            idns.push(uniqueLexemes[i]);
            number++;
        }
    }
}

function fixMinus(lexemes) {
    for (var i = 0; i < lexemes.length; i++) {
        if (lexemes[i].type === 'const' || lexemes[i].type === 'identifier') {
            var lexemeType = lexemes[i].type;
        }
        var mathOperations = ['-', '+', '*', '/'];
        if (i > 0 && lexemes[i].type === lexemeType &&
            mathOperations.indexOf(lexemes[i - 1].lexemeName) !== -1 && !((lexemes[i - 2].type === 'const') || (lexemes[i - 2].type === 'identifier') || (lexemes[i - 2].lexemeName === ')'))) {
            var newLexemeName = lexemes[i - 1].lexemeName + lexemes[i].lexemeName;
            var newLexeme = new Lexeme(newLexemeName, lexemeType, lexemes[i - 1].lineNumber);
            newLexeme.lexemeCode = lexemeType === 'const' ? 33 : 32;
            newLexeme.typeCode = lexemes[i].typeCode;
            lexemes.splice(i - 1, 2);
            lexemes.splice(i - 1, 0, newLexeme);
        }
    }
    return lexemes;
}

function printSyntaxErrors(errors) {
    for (var i = 0; i < errors.length; i++) {
        $('#syntaxErrors').append(errors[i] + '<br>');
    }
}

function printMpaLexemes(mpa) {
    mpa.mpaLexemes.forEach(function (lexeme) {
        $('.mpa-table-body').append(
            '<tr>' +
            '<td>' + lexeme.number + '</td>>' +
            '<td>' + lexeme.lexeme.name + '</td>>' +
            '<td>' + lexeme.currentState + '</td>>' +
            '<td>' + lexeme.stack + '</td>>' +
            '</tr>'
        )
    })
}

function analyze(sourceCode) {
    // var sourceCode = 'program Mishok int a,i begin for i = 1 to -5 - 55 step 1 do i + 1 next if i < 5 out(i) else i + 1 endif end';
    machineState = 1;
    currentLineNumber = 1;
    currentLexemeCode = 1;
    definedIdns = [];
    $('.errors-container').empty();
    var lexemes = parseLexemes(sourceCode);
    lexemes = setIdnsConstsCodes(lexemes);
    lexemes = fixMinus(lexemes);
    lexemes = setLexemeCodes(lexemes);
    printLexemes(lexemes);
    printConsts(lexemes);
    printIdns(lexemes);
    var syntaxAnalyzer = new SyntaxAnalyzer(lexemes);
    syntaxAnalyzer.analyze();
    printSyntaxErrors(syntaxAnalyzer.errors);
    // var mpa = new MpaAnalyzer(lexemes, langLexemes);
    // mpa.analyze();
    // printMpaLexemes(mpa);

    let grammar = new PrecedenceRelationshipGrammar(sourceGrammar);
    grammar.setEquality();
    grammar.findAllFirstPluses();
    grammar.findAllLastPluses();
    grammar.setLess();
    grammar.setMore1();
    grammar.setMore2();

    Array.prototype.last = function() {
        return this[this.length-1];
    };
    Array.prototype.clone = function() {
        return this.slice(0);
    };

    let risingAnalyzer = new RisingAnalyzer(grammar, lexemes);
    let risingAnalyzerTable = risingAnalyzer.analyze();
    console.log(risingAnalyzerTable);

    risingAnalyzerTable.forEach((row, index) => {
        $('#risingTable tbody').append(
            `<tr>
                <td>${index + 1}</td>
                <td>${row.getStack()}</td>
                <td>${row.relationSign}</td>
                <td>${row.getChain()}</td>
            </tr>`)
    });
}

$('#source-code').change(function () {
    var sourceCode = $('#source-code').val();
    analyze(sourceCode);
});

$(document).ready(function () {
    var sourceCode = $('#default-value').text();
    $('#source-code').val(sourceCode);
    analyze(sourceCode);
})
