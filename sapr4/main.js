(function () {
    'use strict';
    let grammar = new PrecedenceRelationshipGrammar(sourceGrammar);
    grammar.setEquality();
    grammar.findAllFirstPluses();
    grammar.findAllLastPluses();
    grammar.setLess();
    grammar.setMore1();
    grammar.setMore2();

    console.log(grammar)

    grammar.lexemes.forEach(lexeme => {
        $('.table-header').append('<th>' + lexeme.label + '</th>');
    });

    let tableBodyHtml = '';
    grammar.lexemes.forEach(lexeme => {
        tableBodyHtml += `<tr>`;
        tableBodyHtml += `<td> ${lexeme.label} </td>`;
        grammar.lexemes.forEach(innerLexeme => {
            let relation = lexeme.equalsTo.indexOf(innerLexeme.label) !== -1 ? '=' : '';
            if (!relation) {
                relation = lexeme.lessThan.indexOf(innerLexeme.label) !== -1 ? '<' : '';
            }
            if (!relation) {
                relation = lexeme.moreThan.indexOf(innerLexeme.label) !== -1 ? '>' : '';
            }
            tableBodyHtml += `<td> ${relation} </td>`;
        });
        tableBodyHtml += '</tr>';
    });
    $('.table-body').append(tableBodyHtml);

})();