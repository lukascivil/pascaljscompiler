/**
 * @author Lucas Cordeiro da Silva
 * @property 1- Léxico
 */

"use strict";
var _ = require('underscore')._;
var fs = require('fs');
var colors = require('colors');

/**
 * Compilador Pascal
 */
var compilerPascal = (function() {

    /**
     * 
     * @param {String} filepath 
     * @param {Function} callback 
     */
    function init(filepath, callback) {
        var program_tokens; //Lexical 
        var parsertree; //Sintatical

        fs.readFile(filepath, 'utf8', function(err, data) {
            if (err) throw err;

            //1 ------------------------------
            program_tokens = lexico(data);
            // _.each(program_tokens, function(token, key) {
            //     console.log("\n " + key + " -  token: " + colors.green(token.value) + "  tipo: " + (token.type != "ERROR" ? colors.green(token.type) : colors.red(token.type)) + "  line: " + colors.green(token.caret_line) + "  coluna: " + colors.green(token.caret_coll));
            // });

            //2 ------------------------------
            parsertree = sintatico(program_tokens); //Return a tree or throw an error
            if (parsertree)
                console.log(colors.blue("NÃO HÁ ERRO SINTÁTICO!"));

            callback();
        });
    }

    /**
     * 
     * @param {String} code
     * Recebe o códifo em pascal como parametro 
     */
    function lexico(code) {

        /**
         *GLOBAL VARIABLE FOR LEXICAL SCANNER
         *
         */
        var caret_position = 0;
        var caret_lastposition = code.length;
        var caret_line = 1;
        var caret_coll = 1;
        var tokens_analyzed = [];
        var token_analyzed = null;

        /**
         * 
         * @param {String} palavra
         * Recebe um TERMINAL para ser classificado
         */
        function clasifyText(palavra) {
            switch (palavra.toUpperCase()) {
                case "PROGRAM":
                    return 'PROGRAM';
                    break;

                case "FUNCTION":
                    return 'FUNCTION';
                    break;

                case "VAR":
                    return 'VAR';
                    break;

                case "BEGIN":
                    return 'BEGIN';
                    break;

                case "END":
                    return 'END';
                    break;

                case "WHILE":
                    return 'WHILE';
                    break;

                case "PRINT":
                    return 'PRINT';
                    break;

                case "READ":
                    return 'READ';
                    break;

                case "IF":
                    return 'IF';
                    break;

                case "THEN":
                    return 'THEN';
                    break;

                case "WRITE":
                    return 'WRITE';
                    break;

                case "CONST":
                    return 'CONST';
                    break;

                case "TYPE":
                    return 'TYPE';
                    break;

                case "INTEGER":
                    return 'INTEGER';
                    break;

                case "REAL":
                    return 'REAL';
                    break;

                case "ARRAY":
                    return 'ARRAY';
                    break;

                case "OF":
                    return 'OF';
                    break;

                default:
                    return "VARIAVEL";
                    break;
            }
        }

        /**
         * 
         * @param {char} symbol 
         * Recebe um TERMINAL para ser classificado
         */
        function clasifySymbol(symbol) {
            switch (symbol) {
                case ".":
                    caret_coll++;
                    caret_position++;
                    return { value: '.', type: "SIMBOLO" };
                    break;

                case ",":
                    caret_coll++;
                    caret_position++;
                    return { value: ',', type: "SIMBOLO" };
                    break;

                case ";":
                    caret_coll++;
                    caret_position++;
                    return { value: ';', type: "SIMBOLO" };
                    break;

                case ":":
                    if (code[caret_position + 1] == "=") {
                        caret_coll++;
                        caret_coll++;
                        caret_position++;
                        caret_position++;
                        return { value: ':=', type: "SIMBOLO" };
                    }

                    caret_coll++;
                    caret_position++;
                    return { value: ':', type: "SIMBOLO" };
                    break;

                case "+":
                    caret_coll++;
                    caret_position++;
                    return { value: '+', type: "SIMBOLO_MATEMATICO" };
                    break;

                case "-":
                    caret_coll++;
                    caret_position++;
                    return { value: '-', type: "SIMBOLO_MATEMATICO" };
                    break;

                case "*":
                    caret_coll++;
                    caret_position++;
                    return { value: '*', type: "SIMBOLO_MATEMATICO" };
                    break;

                case "/":
                    if (code[caret_position + 1] == "/") {
                        caret_coll++;
                        caret_coll++;
                        caret_position++;
                        caret_position++;

                        return { value: '//', type: "SIMBOLO" };
                    }

                    caret_coll++;
                    caret_position++;
                    return { value: '/', type: "SIMBOLO_MATEMATICO" };
                    break;

                case "=":
                    caret_coll++;
                    caret_position++;
                    return { value: '=', type: "SIMBOLO_LOGICO" };
                    break;

                case "!":
                    caret_coll++;
                    caret_position++;
                    return { value: '!', type: "SIMBOLO_LOGICO" };
                    break;

                case "<":
                    caret_coll++;
                    caret_position++;
                    return { value: '<', type: "SIMBOLO_LOGICO" };
                    break;

                case ">":
                    caret_coll++;
                    caret_position++;
                    return { value: '>', type: "SIMBOLO_LOGICO" };
                    break;

                case "(":
                    caret_coll++;
                    caret_position++;
                    return { value: '(', type: "SIMBOLO" };
                    break;

                case ")":
                    caret_coll++;
                    caret_position++;
                    return { value: ')', type: "SIMBOLO" };
                    break;

                case "[":
                    caret_coll++;
                    caret_position++;
                    return { value: '[', type: "SIMBOLO" };
                    break;

                case "]":
                    caret_coll++;
                    caret_position++;
                    return { value: ']', type: "SIMBOLO" };
                    break;

                case '"':
                    caret_coll++;
                    caret_position++;
                    return { value: '"', type: "SIMBOLO" };
                    break;

                default:
                    return { value: '', type: "EMPTY" };
                    break;
            }
        }

        /**
         * 
         * @param {String} value
         * Recebe uma String inicial de valor "". 
         */
        function getToken(value) {

            //var value = "";
            var type = "";
            var token = "";
            var token_found = false;

            /**
             * ENTREASPAS
             */
            if (!_.isEmpty(tokens_analyzed)) {
                if (tokens_analyzed[tokens_analyzed.length - 1].value == '"' && tokens_analyzed[tokens_analyzed.length - 3].value != '"') {

                    while (caret_position < caret_lastposition && !code[caret_position].match('"')) {
                        value += code[caret_position];
                        caret_position++;
                    }

                    token = { value: value, type: "ENTREASPAS", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };

                    if (token.value != "") {
                        return token;
                    }
                }
            }

            /**
             * Variável
             */
            while (caret_position < caret_lastposition && code[caret_position].match(/[a-z]/i)) {
                token_found = true;
                value += code[caret_position];
                caret_position++;
                caret_coll++;
            }

            if (token_found) {
                if (caret_position < caret_lastposition) {
                    if (code[caret_position].match(/^\d+$/)) {
                        token = getToken(value); //Recursao para pegar parte numerica da variavel
                        value = token.value;
                    }

                    if (code[caret_position].match(/[a-z]/i)) {
                        token = getToken(value); //Recursao para pegar parte de texto após a parte numerica, caso Exista.
                        value = token.value;
                    }
                }

                type = clasifyText(value);

                token = { value: value, type: type, caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };
                return token;
            }

            /**
             * Número
             */
            while (caret_position < caret_lastposition && code[caret_position].match(/^\d+$/)) {
                token_found = true;
                value += code[caret_position];
                caret_position++;
                caret_coll++;
            }

            if (token_found) {
                token = { value: value, type: "NUMERO", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };
                return token;
            }

            /**
             * Quebra de Linha
             */
            while (caret_position < caret_lastposition && code[caret_position].match(/[\n\r]/g)) {
                if (code[caret_position].toString() == '\r') {
                    //token += "/r";
                } else if (code[caret_position].toString() == '\n') {
                    caret_coll = 1;
                    //token += "/n";
                    caret_line++;
                }

                caret_position++;
                token_found = true;
            }

            if (token_found) {
                token = getToken(""); // Recursion
                //token = { value: token, type: "BREAKLINE", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };
                return token;
            }

            /**
             * Espaço em Branco
             */
            while (caret_position < caret_lastposition && code[caret_position].match(/[^\S\x0a\x0d]/)) {
                //token += "space";
                caret_coll++;
                caret_position++;
                token_found = true;
            }

            if (token_found) {
                token = getToken(""); // Recursion
                //token = { value: token, type: "WHITE SPACE", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };
                return token;
            }


            /**
             * Símbolos
             */
            var symbol = clasifySymbol(code[caret_position]); // return {value: , type: }
            //value = "";

            //Comentário
            if (symbol.value == "//") {

                //Anda comentario
                while (caret_position < caret_lastposition && !code[caret_position].match(/[\n]/g)) {
                    caret_position++;
                }

                //Anda \n
                if (caret_position < caret_lastposition && code[caret_position].toString() == '\n') {
                    caret_coll = 1;
                    caret_line++;
                    caret_position++;
                }

                token = getToken(""); // Recursao para pegar algum token válido após o (comentário + \n)
                return token;
            } else { //Qualquer outro simbolo
                token = { value: symbol.value, type: symbol.type, caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };

                if (token.value != "") {
                    return token;
                }
            }

            /**
             * caret_lastposition == EOF
             */
            if (caret_position == caret_lastposition) {
                value = "EOF";
                token = { value: value, type: "EOF", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };
                return token;
            }

            /**
             * Token não existe no Alfabeto
             */
            value = code[caret_position];
            caret_coll++;
            caret_position++;
            token = { value: value, type: "ERROR", caret_position: caret_position, caret_line: caret_line, caret_coll: caret_coll };

            return token;
        }

        //chamar getToken com ("") por causa da recursao
        while (token_analyzed = getToken("")) {
            tokens_analyzed.push(token_analyzed);

            if (token_analyzed.value == "EOF" || token_analyzed.type == "ERROR") {
                break;
            }
        }

        return tokens_analyzed;
    }

    /**
     * O analisador sintatico ja recebe uma lista de tokens gerada pelo analisador lexico
     */
    function sintatico(program_tokens) {

        var parser_position = 0;
        var token_expected = null;
        var erro_count = 0;

        function nextToken() {
            parser_position++;
            return program_tokens[parser_position];
        }

        function previousToken() {
            parser_position--;
            return program_tokens[parser_position];
        }

        function erro(known) {
            erro_count++;
            var token_found = program_tokens[parser_position];
            if (known)
                console.log("\n ERRO SINTATICO -  token: " + colors.green(token_found.value) + "  tipo: " + colors.red(token_found.type) + "  line: " + colors.red(token_found.caret_line) + "  coluna: " + colors.red(token_found.caret_coll) + " esperado: " + colors.red(token_expected));
            else
                console.log("\n ERRO SINTATICO -  token: " + colors.green(token_found.value) + "  tipo: " + colors.red(token_found.type) + "  line: " + colors.red(token_found.caret_line) + "  coluna: " + colors.red(token_found.caret_coll));
        }

        function recognizeByValue(value) {
            token_expected = value;
            if (program_tokens[parser_position].value.toUpperCase() == value.toUpperCase())
                return true; // Ou seja, faz nada
            return false;
        }

        function recognizeByType(type) {
            token_expected = type;
            if (program_tokens[parser_position].type == type)
                return true; // Ou seja, faz nada
            return false;
        }

        /**
         * Gramatica livre de contexto 
         */
        var BNF = {
            PROGRAMA: function() {
                if (recognizeByValue("PROGRAM")) {
                    nextToken();
                    if (BNF.IDENTIFICADOR()) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.CORPO()) {
                                if (recognizeByValue("EOF")) {
                                    return true;
                                } else {
                                    //Se já ocorreu algum erro então não imprime
                                    if (erro_count == 0)
                                        erro(false);
                                    return false;
                                }
                            } else {
                                //Se já ocorreu algum erro então não imprime
                                if (erro_count == 0)
                                    erro(false);
                                return false;
                            }
                        } else {
                            erro(true);
                        }
                    }
                } else {
                    erro(true);
                }
            },

            IDENTIFICADOR: function() {
                if (recognizeByType("VARIAVEL")) {
                    nextToken();
                    return true;
                }
                return false;
            },

            CORPO: function() {
                if (BNF.DECLARACOES()) {
                    if (BNF.BLOCO()) {
                        return true;
                    }
                } else {
                    if (BNF.BLOCO()) {
                        return true;
                    }
                }
                return false;
            },

            DECLARACOES: function() { //terminar, eu acho que é tudo OU e nao E o problema de nao reconhecer o codigo do plano de estudo está aqui
                BNF.DEF_CONST();
                BNF.DEF_TIPO();
                BNF.DEF_VAR();
                BNF.DEF_FUNC();
                return true;
            },

            DEF_VAR: function() {
                if (recognizeByValue("VAR")) {
                    nextToken();
                    if (BNF.VARIAVEL()) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.VARIAVEIS()) {
                                return true;
                            } else {
                                return false;
                            }
                        } else {
                            erro(true);
                            return false;
                        }
                    }
                    return false;
                } else {
                    //erro(); terminar
                }

                return true;
            },

            DEF_CONST: function() {
                if (recognizeByValue("CONST")) {
                    nextToken();
                    if (BNF.CONSTANTE()) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.CONSTANTES()) {
                                return true;
                            }
                            return false;
                        } else {
                            erro(true);
                            return false;
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else {
                    //erro(); terminar
                    return false;
                }
                return true;
            },

            DEF_TIPO: function() {
                if (recognizeByValue("TYPE")) {
                    nextToken();
                    if (BNF.TIPO()) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.TIPOS()) {
                                return true;
                            }
                            return false;
                        } else {
                            erro(true);
                            return false;
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else {
                    //erro(); terminar
                    return false;
                }
                return true;
            },

            DEF_FUNC: function() {
                if (recognizeByValue("FUNCTION")) {
                    nextToken();
                    if (BNF.FUNCAO()) {
                        if (BNF.FUNCOES()) {
                            return true;
                        }
                        return false;
                    } else {
                        return false;
                    }
                } else {
                    //erro(); terminar
                    return false;
                }
                return true;
            },

            CONSTANTES: function() {
                if (BNF.CONSTANTE()) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.CONSTANTES()) {
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return true;
            },

            CONSTANTE: function() {
                if (BNF.IDENTIFICADOR()) {
                    if (recognizeByValue("=")) {
                        nextToken();
                        console.log("cacacacaca");
                        if (BNF.CONST_VALOR()) {
                            console.log("tem que entrar aquiiiiiiiiiiii");
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return false;
            },

            CONST_VALOR: function() { //terminar
                console.log("to no meio");
                if (recognizeByValue('"')) {
                    nextToken();
                    if (recognizeByType("ENTREASPAS")) {
                        nextToken();
                        if (recognizeByValue('"')) {
                            nextToken();
                            return true;
                        } else {
                            erro(true);
                        }
                    }
                } else if (BNF.NOME_NUMERO()) {
                    console.log("to no meio1");
                    if (BNF.EXP_MATEMATICA()) {
                        console.log("to no meio2");
                        return true;
                    }
                }
                return false;
            },

            NUMERO: function() {
                if (recognizeByType("NUMERO")) {
                    nextToken();
                    return true;
                }
                return false;
            },

            TIPOS: function() {
                if (BNF.TIPO()) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.TIPOS()) {
                            return true;
                        }
                        return false;
                    }
                    erro(true);
                    return false;
                }
                return true;
            },

            TIPO: function() {
                if (BNF.IDENTIFICADOR()) {
                    if (recognizeByValue("=")) {
                        nextToken();
                        if (BNF.TIPO_DADO()) {
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return false;
            },

            TIPO_DADO: function() {
                if (recognizeByValue("INTEGER")) {
                    nextToken();
                    return true;
                } else if (recognizeByValue("REAL")) {
                    nextToken();
                    return true;
                } else if (recognizeByValue("ARRAY")) {
                    nextToken();
                    if (recognizeByValue("[")) {
                        nextToken();
                        if (recognizeByType("NUMERO")) {
                            nextToken();
                            if (recognizeByValue("]")) {
                                nextToken();
                                if (recognizeByValue("OF")) {
                                    nextToken();
                                    if (BNF.TIPO_DADO()) {
                                        return true;
                                    }
                                } else {
                                    erro(true);
                                }
                            } else {
                                erro(true);
                            }
                        } else {
                            erro(true);
                        }
                    } else {
                        erro(true);
                    }
                } else if (BNF.IDENTIFICADOR()) { //terminar, por que identificador aqui??? nao entendi
                    console.log("caiu como identificador");
                    return true;
                }
                return false;
            },

            VARIAVEIS: function() {
                if (BNF.VARIAVEL()) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.VARIAVEIS()) {
                            return true;
                        }
                        return false;
                    } else {
                        erro();
                        return false;
                    }
                }
                return true;
            },

            VARIAVEL: function() {
                if (BNF.IDENTIFICADOR()) {
                    if (BNF.LISTA_ID()) {
                        if (recognizeByValue(":")) {
                            nextToken();
                            console.log("tipinho");
                            if (BNF.TIPO_DADO()) {
                                console.log("tipinho222222222222222222222222222222222");
                                return true;
                            }
                        } else {
                            erro(true);
                        }
                    }
                }
                return false;
            },

            LISTA_ID: function() {
                if (recognizeByValue(",")) {
                    nextToken();
                    if (BNF.IDENTIFICADOR()) {
                        if (BNF.LISTA_ID()) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                }
                return true;
            },

            FUNCOES: function() {
                if (BNF.FUNCAO()) {
                    if (BNF.FUNCOES()) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            FUNCAO: function() {
                if (BNF.NOME_FUNCAO()) {
                    if (BNF.BLOCO_FUNCAO()) {
                        return true;
                    }
                }
                return false;
            },

            NOME_FUNCAO: function() {
                if (BNF.TIPO_DADO()) {
                    if (BNF.IDENTIFICADOR()) {
                        if (recognizeByValue("(")) {
                            nextToken();
                            if (BNF.VARIAVEIS()) {
                                if (recognizeByValue(")")) {
                                    nextToken();
                                    return true;
                                } else {
                                    erro(true);
                                }
                            }
                        } else {
                            erro(true);
                        }
                    }
                }
                return false;
            },

            BLOCO_FUNCAO: function() {
                if (BNF.DEF_VAR()) {
                    if (BNF.BLOCO()) {
                        return true;
                    }
                } else {
                    if (BNF.BLOCO()) {
                        return true;
                    }
                }
                return false;
            },

            BLOCO: function() {
                if (recognizeByValue("BEGIN")) {
                    console.log("comandos");
                    nextToken();
                    if (BNF.COMANDOS()) {
                        return true;
                    }
                } else {
                    console.log("comando");
                    if (BNF.COMANDO()) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            return true;
                        } else {
                            erro(true);
                        }
                    }
                }
                return false;
            },

            COMANDOS: function() {
                if (BNF.COMANDO()) {
                    console.log("aqui0");
                    console.log("ponto e virgula problem");
                    if (recognizeByValue(";")) {
                        console.log("ponto e virgula problem resolvido");
                        nextToken();
                        if (BNF.COMANDOS()) {
                            console.log("aqui1");
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                } else {
                    if (recognizeByValue("END")) {
                        nextToken();
                        return true;
                    }
                }
                return false;
            },

            COMANDO: function() {
                if (recognizeByValue("WHILE")) {
                    console.log("WHILE");
                    nextToken();
                    if (BNF.EXP_LOGICA()) {
                        if (BNF.BLOCO()) {
                            return true;
                        }
                    }
                    erro(false);
                } else if (recognizeByValue("IF")) {
                    console.log("IF");
                    nextToken();
                    if (BNF.EXP_LOGICA()) {
                        if (recognizeByValue("THEN")) {
                            nextToken();
                            if (BNF.BLOCO()) {
                                if (BNF.SENAO()) {
                                    return true;
                                }
                            } else {
                                erro(false);
                            }
                        } else {
                            erro(true);
                        }
                    } else {
                        erro(false);
                    }
                } else if (recognizeByValue("WRITE")) {
                    console.log("WRITE");
                    nextToken();
                    if (BNF.CONST_VALOR()) {
                        console.log("write completao");
                        return true;
                    }
                    erro(false);
                } else if (recognizeByValue("READ")) {
                    nextToken();
                    console.log("READ1");
                    if (BNF.NOME()) {
                        console.log("READ2");
                        return true;
                    }
                    erro(false);
                } else if (BNF.NOME()) {
                    console.log("NOME");
                    if (recognizeByValue(":=")) {
                        nextToken();
                        console.log("cafeeeeeeeeeeeeeeeeesass");
                        if (BNF.VALOR()) {
                            console.log("tam := 255; foi reconhecido");
                            return true;
                        } else {
                            erro(false);
                        }
                    } else {
                        erro(true);
                    }
                }

                console.log("consertar aquiiiiii");
                return false;
            },

            SENAO: function() {
                if (recognizeByValue("ELSE")) {
                    nextToken();
                    if (BNF.BLOCO()) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            VALOR: function() {
                if (BNF.IDENTIFICADOR()) {
                    console.log("_____________________");
                    if (BNF.VALOR_2()) {
                        console.log("identificador + valor_2");
                        return true;
                    }
                } else {
                    if (BNF.NUMERO()) {
                        if (BNF.EXP_MATEMATICA()) {
                            console.log("NUMERO + EXP_MATEMATICA");
                            return true;
                        }
                    }
                }
                return false;
            },

            VALOR_2: function() {
                if (recognizeByValue("(")) {
                    nextToken();
                    if (BNF.PARAMETRO()) {
                        if (recognizeByValue(")")) {
                            nextToken();
                            return true;
                        } else {
                            erro(true);
                        }
                    }
                } else {
                    if (BNF.INDICE()) {
                        if (BNF.EXP_MATEMATICA()) {
                            return true;
                        }
                    }
                }
                return false;
            },

            PARAMETRO: function() {
                if (BNF.NOME_NUMERO()) {
                    if (BNF.LISTA_PARAM()) {
                        return true;
                    }
                }
                return false;
            },

            LISTA_PARAM: function() {
                if (recognizeByValue(",")) {
                    nextToken();
                    if (BNF.PARAMETRO()) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            EXP_LOGICA: function() {
                if (BNF.NOME_NUMERO()) {
                    if (BNF.EXP_MATEMATICA()) {
                        if (BNF.EXP_LOGICA_2()) {
                            return true;
                        }
                    }
                }
                return false;
            },

            EXP_LOGICA_2: function() {
                if (BNF.OP_LOGICO()) {
                    if (BNF.EXP_LOGICA()) {
                        return true;
                    }
                    return false;
                }

                return true;
            },

            EXP_MATEMATICA: function() {
                console.log("tentareiiiiiiiiiiiiiii");
                if (BNF.OP_MATEMATICO()) {
                    console.log("to no meio3");
                    if (BNF.NOME_NUMERO()) {
                        console.log("to no meio4");
                        if (BNF.EXP_MATEMATICA()) {
                            console.log("to no meio5");
                            return true;
                        }
                        return false;
                    }
                    return false
                }
                return true;
            },

            OP_LOGICO: function() {
                if (recognizeByType("SIMBOLO_LOGICO")) {
                    nextToken();
                    return true;
                }
                //erro(); terminar
                return false;
            },

            OP_MATEMATICO: function() {
                if (recognizeByType("SIMBOLO_MATEMATICO")) {
                    nextToken();
                    return true;
                }
                //erro(); terminar
                return false;
            },

            NOME_NUMERO: function() {
                if (BNF.NOME()) {
                    return true;
                } else {
                    if (BNF.NUMERO()) {
                        return true;
                    }
                }
                return false;
            },

            NOME: function() {
                if (BNF.IDENTIFICADOR()) {
                    if (BNF.INDICE()) {
                        return true;
                    }
                }
                return false;
            },

            INDICE: function() {
                if (recognizeByValue("[")) {
                    nextToken();
                    if (BNF.NOME_NUMERO()) {
                        if (recognizeByValue("]")) {
                            nextToken();
                            return true;
                        } else {
                            erro(true);
                            return false;
                        }
                    }
                    return false;
                }
                return true;
            }
        }

        //Start
        //console.log(program_tokens);
        return BNF.PROGRAMA();
    }

    return {
        init: init
    }
})();

// -----------------------------------------
var filepath = "pascal.pas";

compilerPascal.init(filepath,
    function(response) { // finished Assync Function
        //console.log(response);
    });