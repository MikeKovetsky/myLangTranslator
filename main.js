// program Mishok int @ a, @ i
// begin a = 0
// for i = 1 to -5-55 step 1 do i = i + 1
//     next
// if i == 3 out(i)
// in(i)
// else i = i + 1
// out(i)
// endif
// i = 89 + 1
// end

function analyze(sourceCode) {
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

    const lexemeChain = lexemes.map((lexeme) => {
        let type = '';
        switch (lexeme.lexemeCode) {
            case 32: type = 'idn'; break;
            case 33: type = 'con'; break;
            default: type = 'operation'; break;
        }
        return new PolizItem(lexeme.lexemeName, type);
    });

    const polizBuilder = new PolizBuilder();
    const poliz = polizBuilder.build(lexemeChain);
    $('#poliz-chain').empty();
    poliz.chain.forEach(item => {
        $('#poliz-chain').append(item.token + ' ');
    });

    $('#poliz-history tbody').empty();
    polizBuilder.history.forEach(historyItem => {
        $('#poliz-history tbody').append(
            `<tr><td>${historyItem.lexeme.token}</td>
                <td>${historyItem.stack}</td>
                <td>${historyItem.poliz}</td>
            </tr>`
        );
    });

    $('#poliz-labels tbody').empty();
    poliz.polizLabels.forEach(label => {
        $('#poliz-labels tbody').append(
            `<tr><td>${label.label}</td>
                <td>${label.position}</td>
            </tr>`
        );
    });

    const polizExecutor = new PolizExecutor(
        poliz.chain, poliz.polizLabels, poliz.polizCells, idns
    );

    polizExecutor.execute();
    $('#console').empty();
    polizExecutor.outputData.forEach(item => {
        $('#console').append(
            `<div>${item.token} ${item.value}</div>`);
    });

    $('#poliz-execution-history tbody').empty();
    polizExecutor.history.forEach(item => {
        $('#poliz-execution-history tbody').append(
            `<tr><td>${item.lexeme}</td>
                <td>${item.stack}</td>
            </tr>`
        );
    });
    Array.prototype.last = function() {
        return this[this.length-1];
    };
    Array.prototype.clone = function() {
        return this.slice(0);
    };

}

$('#source-code').change(function () {
    analyzeSource();
});

function analyzeSource() {
    const sourceCode = $('#source-code').val();
    analyze(sourceCode);
}
