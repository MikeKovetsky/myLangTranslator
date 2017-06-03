function SyntaxAnalyzer(lexemes) {
    this.errors = [];
    this.numLexeme = 0;

    this.analyze = function () {
        program();
    };

    var self = this;

    var isInRange = function () {
        return self.numLexeme < lexemes.length ;
    };

    var getLexemeLine = function () {
        return lexemes[self.numLexeme] ? lexemes[self.numLexeme].lineNumber : '';
    };

    var addError = function (errText) {
        self.errors.push('строка ' + getLexemeLine() + '. ' + errText);
    };

    var getLexemeCode = function () {
        return lexemes[self.numLexeme].lexemeCode;
    };

    var checkLexeme = function (lexemeCode, errText) {
        // improve to get array
        if (isInRange() && getLexemeCode() === lexemeCode) {
            self.numLexeme++;
            return true;
        } else {
            if (errText) {
                addError(errText);
                return false;
            } else {
                return true;
            }
        }
    };


    var program = function () {
        if (checkLexeme(1, 'программа должна начинаться со слова program')) { //program
            if (checkLexeme(32, 'отсутствует название программы program()')) { //IDN
                if (checkLexeme(34, 'отступ')) { //П
                    if (declarationList()) {
                        if (checkLexeme(2, 'отсутствует begin у списка операторов')) { //begin
                            // if (checkLexeme(34, 'отступ после')) {
                                if (operatorsList()) {
                                    if (checkLexeme(3, 'отсутсвует end в конце списка операторов')) { //end
                                        console.log('Нет ошибок');
                                        return true;
                                    }
                                }
                            // }
                        }
                    }
                }
            }
        }
    };



    var declaration = function () {
        if (checkLexeme(4, 'Неверный тип')) { //int
            if (idnList()) {
                return true;
            }
        }
    };

    var idnList = function () {
        if (checkLexeme(32, 'Не идентификатор!')) {
            while (isInRange() && getLexemeCode() === 15) { //,
                self.numLexeme++;
                if (checkLexeme(32, 'Не идентификатор!')) {
                }
            }
            return true;
        }
    };

    var declarationList = function () {
        if (declaration()) {
            if (checkLexeme(34, 'Отсутствует список операторов')) {
                while (isInRange() && getLexemeCode()!== 2) {
                    if (declaration()) {
                        if (checkLexeme(34, 'переход на новую строку')) {
                            // return true;
                        }
                    }
                }
                return true;
            }
        }
    };

    var operatorsList = function () {
        if (isInRange() && getLexemeCode() === 3) {
            console.log('eroor');
        } else {
            if (operator()) {
                if (checkLexeme(34, 'Отсутствует список операторов')) {
                    while (isInRange() && getLexemeCode() !== 9) {
                        if (getLexemeCode() == 3) return true;
                        if (getLexemeCode() == 13) return true;
                        if (getLexemeCode() == 14) return true;
                        if (operator()) {
                            if (checkLexeme(34, 'переход на новую строку')) {
                                // return true;
                            }
                        }
                    }
                    return true;
                }
            }
        }
    }

    var operator = function () {
        if (isInRange() && getLexemeCode() === 11) { // out
            self.numLexeme++;
            if (checkLexeme(21, 'Нет скобочки =(((( ')) {
                if (idnList()) {
                    if (checkLexeme(22, 'Нет скобочки ) ')) {
                        return true;
                    }
                }
            }
        } else if (isInRange() && getLexemeCode() === 10) { //in
            self.numLexeme++;
            if (checkLexeme(21, 'Нет скобочки =(((( ')) {
                if (idnList()) {
                    if (checkLexeme(22, 'Нет скобочки ) ')) {
                        return true;
                    }
                }
            }
        } else if (isInRange() && getLexemeCode() === 32) {
            self.numLexeme++;
            if (checkLexeme(16, '')) {
                if (expression()) {
                    return true;
                }
            }
        } else if (isInRange() && getLexemeCode() === 5) { //for
            self.numLexeme++;
            if (checkLexeme(32, 'ожидается IDN')) {
                if (checkLexeme(16, 'пропущено =')) {
                    if (expression()) {
                        if (checkLexeme(6, 'ожидается to')) {
                            if (expression()) {
                                if (checkLexeme(7, 'нужен step')) {
                                    if (expression()) {
                                        if (checkLexeme(8, 'ожидается do')) {
                                            if (operatorsList()) {
                                                if (checkLexeme(9, 'потерял next')) {
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if (isInRange() && getLexemeCode() === 12) { //if
            self.numLexeme++;
            if (boolExpression()) {
                if (checkLexeme(34, 'Должен быть П')) {
                    if (operatorsList()) {
                        if (checkLexeme(13, 'пропустили else')) {
                            if (operatorsList()) {
                                if (checkLexeme(14, 'пропустили endif')) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    var boolExpression = function () {
        if (boolTerminal()) {
            while (isInRange() && getLexemeCode() === 30) { // ||
                self.numLexeme++;
                boolTerminal();
            }
            return true;
        }
    };

    var boolTerminal = function () {
        if (boolMultiplier()) {
            while (isInRange() && getLexemeCode() == 25) { // &&
                self.numLexeme++;
                boolTerminal();
            }
            return true;
        }
    };

    var boolMultiplier = function () {
        if (isInRange() && getLexemeCode() == 21) { // (
            self.numLexeme++;
            if (boolExpression()) {
                if (checkLexeme(22, 'отсутствует закрывающая скобка')) { // )
                    return true;
                }
            }
        } else if (isInRange() && getLexemeCode() === 35) { // !
            self.numLexeme++;
            if (boolMultiplier()) {
                return true;
            } else {
                addError('должен быть логический множитель после not boolMultiplier()');
            }
        } else if (relation()) {
            return true;
        }
        addError('должен быть логический множитель');
    };

    var relation = function () {
        if (expression()) {
            if (relationSign()) {
                if (expression()) {
                    return true;
                } else {
                    addError('отсутствует выражение после знака отношения relation()');
                }
            } else {
                addError('отсутствует знак отношения relation()');
            }
        } else {
            addError('отсутствует выражение relation()');
        }
    };

    var relationSign = function () {
        if (isInRange() && (getLexemeCode() == 23 ||
            getLexemeCode() == 24 || getLexemeCode() == 26 ||
            getLexemeCode() == 28 || getLexemeCode() == 29 ||
            getLexemeCode() == 27)) {
            self.numLexeme++;
            return true;
        } else {
            addError('має бути знак відношення tokenRelation()');
        }
    };

    var expression = function () {
        if (terminal()) {
            while (isInRange() && (getLexemeCode() == 17 || getLexemeCode() == 18)) { // + -
                self.numLexeme++;
                terminal();
            }
            return true;
        } else {
            addError("отсутствует терминал expression()");
        }
    };

    var terminal = function () {
        if (multiplier()) {
            while (isInRange() && (getLexemeCode() == 19 || getLexemeCode() == 20)) { // * /
                self.numLexeme++;
                multiplier();
            }
            return true;
        } else {
            addError('отсутствует множитель terminal()');
        }
    };

    var multiplier = function () {
        if (subMultiplier()) {
            while (isInRange() && getLexemeCode() === 31) { // степень
                self.numLexeme++;
                subMultiplier();
            }
            return true;
        }
    };

    var subMultiplier = function () {
        if (isInRange() && getLexemeCode() == 21) { // (
            self.numLexeme++;
            if (expression()) {
                if (checkLexeme(22, 'осутствует закрывающая скобка multiplier()')) { // )
                    return true;
                }
            }

        } else if (isInRange() && (getLexemeCode() == 32 || getLexemeCode() == 33)) { // IDN || CON
            self.numLexeme++;
            return true;
        } else if (isInRange() && getLexemeCode() == 21) {
            self.numLexeme++;
            if (expression()) {
                if (checkLexeme(22, 'Нет закрывающей скобки')) {

                }
            }
        } else {
            addError("должен быть IDN или CON или открывающая скобка для выражения multiplier()");
        }
    }

}

