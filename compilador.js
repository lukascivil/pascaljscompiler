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
            //if (parsertree)
            //console.log(colors.green(JSON.stringify(parsertree, null, 4)));

            console.log(semantico.getTable());
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
        var tabela = [];
        var tree = {};

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
                tree.PROGRAMA = {};
                if (recognizeByValue("PROGRAM")) {
                    nextToken();
                    if (BNF.IDENTIFICADOR(tree.PROGRAMA)) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.CORPO(tree.PROGRAMA)) {
                                if (recognizeByValue("EOF")) {
                                    return tree;
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

            IDENTIFICADOR: function(obj) {
                if (recognizeByType("VARIAVEL")) {
                    //obj.IDENTIFICADOR = {};
                    obj[program_tokens[parser_position].value] = {};
                    nextToken();
                    return true;
                }
                return false;
            },

            CORPO: function(obj) {
                obj.CORPO = {};
                if (BNF.DECLARACOES(obj.CORPO)) {
                    if (BNF.BLOCO(obj.CORPO)) {
                        return true;
                    }
                } else {
                    if (BNF.BLOCO(obj.CORPO)) {
                        return true;
                    }
                }
                return false;
            },

            DECLARACOES: function(obj) { //terminar, eu acho que é tudo OU e nao E o problema de nao reconhecer o codigo do plano de estudo está aqui
                obj.DECLARACOES = {};
                var listofIDS = { list: [] };

                BNF.DEF_CONST(obj.DECLARACOES, listofIDS);
                listofIDS.list.forEach(value => {
                    semantico.updateEscopoById({ ID: value, ESCOPO: "global" });
                });

                BNF.DEF_TIPO(obj.DECLARACOES, listofIDS);
                listofIDS.list.forEach(value => {
                    semantico.updateEscopoById({ ID: value, ESCOPO: "global" });
                });

                BNF.DEF_VAR(obj.DECLARACOES, listofIDS);
                listofIDS.list.forEach(value => {
                    semantico.updateEscopoById({ ID: value, ESCOPO: "global" });
                });

                BNF.DEF_FUNC(obj.DECLARACOES);
                return true;
            },

            DEF_VAR: function(obj, listofIDS) {
                obj.DEF_VAR = {};
                if (recognizeByValue("VAR")) {
                    nextToken();
                    if (BNF.VARIAVEL(obj.DEF_VAR, listofIDS)) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.VARIAVEIS(obj.DEF_VAR, listofIDS)) {
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

            DEF_CONST: function(obj, listofIDS) {
                if (recognizeByValue("CONST")) {
                    obj.DEF_CONST = {};
                    nextToken();
                    if (BNF.CONSTANTE(obj.DEF_CONST, listofIDS)) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.CONSTANTES(obj.DEF_CONST, listofIDS)) {
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

            DEF_TIPO: function(obj, listofIDS) {
                if (recognizeByValue("TYPE")) {
                    obj.DEF_TIPO = {};
                    nextToken();
                    if (BNF.TIPO(obj.DEF_TIPO)) {
                        if (recognizeByValue(";")) {
                            nextToken();
                            if (BNF.TIPOS(obj.DEF_TIPO)) {
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

            DEF_FUNC: function(obj) {
                if (recognizeByValue("FUNCTION")) {
                    obj.DEF_FUNC = {};
                    nextToken();
                    if (BNF.FUNCAO(obj.DEF_FUNC)) {
                        if (BNF.FUNCOES(obj.DEF_FUNC)) {
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

            CONSTANTES: function(obj, listofIDS) {
                obj.CONSTANTES = {};
                if (BNF.CONSTANTE(obj.CONSTANTES, listofIDS)) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.CONSTANTES(obj.CONSTANTES, listofIDS)) {
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return true;
            },

            CONSTANTE: function(obj, listofIDS) {
                obj.CONSTANTE = {};
                if (BNF.IDENTIFICADOR(obj.CONSTANTE)) {
                    semantico.add(program_tokens[parser_position - 1].value, "CONST");
                    if (recognizeByValue("=")) {
                        nextToken();
                        if (BNF.CONST_VALOR(obj.CONSTANTE)) {
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return false;
            },

            CONST_VALOR: function(obj) { //terminar
                obj.CONST_VALOR = {};
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
                } else if (BNF.NOME_NUMERO(obj.CONST_VALOR)) {
                    if (BNF.EXP_MATEMATICA(obj.CONST_VALOR)) {
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

            TIPOS: function(obj) {
                obj.TIPOS = {};
                if (BNF.TIPO(obj.TIPOS)) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.TIPOS(obj.TIPOS)) {
                            return true;
                        }
                        return false;
                    }
                    erro(true);
                    return false;
                }
                return true;
            },

            TIPO: function(obj) {
                obj.TIPO = {};
                if (BNF.IDENTIFICADOR(obj.TIPO)) {
                    if (recognizeByValue("=")) {
                        nextToken();
                        if (BNF.TIPO_DADO(obj.TIPO)) {
                            return true;
                        }
                    } else {
                        erro(true);
                    }
                }
                return false;
            },

            TIPO_DADO: function(obj) {
                obj.TIPO_DADO = {};
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
                                    if (BNF.TIPO_DADO(obj.TIPO_DADO)) {
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
                } else if (BNF.IDENTIFICADOR(obj.TIPO_DADO)) { //terminar, por que identificador aqui??? nao entendi
                    return true;
                }
                return false;
            },

            VARIAVEIS: function(obj, listofIDS) {
                obj.VARIAVEIS = {};
                var listofIDS_temp = { list: [] };
                if (BNF.VARIAVEL(obj.VARIAVEIS, listofIDS_temp)) {
                    listofIDS.list = _.union(listofIDS.list, listofIDS_temp.list)
                    listofIDS_temp.list = []; //Clean the list
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.VARIAVEIS(obj.VARIAVEIS, listofIDS)) {
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

            VARIAVEL: function(obj, listofIDS_temp) {
                obj.VARIAVEL = {};
                if (BNF.IDENTIFICADOR(obj.VARIAVEL)) {
                    if (BNF.LISTA_ID(obj.VARIAVEL, listofIDS_temp)) {
                        if (recognizeByValue(":")) {
                            nextToken();
                            if (BNF.TIPO_DADO(obj.VARIAVEL)) {
                                listofIDS_temp.list.forEach(value => {
                                    semantico.updateTipoById({ ID: value, TIPO: program_tokens[parser_position - 1].value });
                                });
                                return true;
                            }
                        } else {
                            erro(true);
                        }
                    }
                }
                return false;
            },

            LISTA_ID: function(obj, listofIDS) {
                var ID = semantico.add(program_tokens[parser_position - 1].value, "VAR");
                listofIDS.list.push(ID);
                obj.LISTA_ID = {};
                if (recognizeByValue(",")) {
                    nextToken();
                    if (BNF.IDENTIFICADOR(obj.LISTA_ID)) {
                        if (BNF.LISTA_ID(obj.LISTA_ID, listofIDS)) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                }
                return true;
            },

            FUNCOES: function(obj) {
                obj.FUNCOES = {};
                if (BNF.FUNCAO(obj.FUNCOES)) {
                    if (BNF.FUNCOES(obj.FUNCOES)) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            FUNCAO: function(obj) {
                obj.FUNCAO = {};
                var funcaoname = {};
                funcaoname.value = "";

                var listofIDS = { list: [] };
                if (BNF.NOME_FUNCAO(obj.FUNCAO, funcaoname)) {
                    if (BNF.BLOCO_FUNCAO(obj.FUNCAO, listofIDS)) {
                        listofIDS.list.forEach(value => {
                            semantico.updateEscopoById({ ID: value, ESCOPO: funcaoname.value });
                        });
                        return true;
                    }
                }
                return false;
            },

            NOME_FUNCAO: function(obj, funcaoname) {
                obj.NOME_FUNCAO = {};
                if (BNF.TIPO_DADO(obj.NOME_FUNCAO)) {
                    if (BNF.IDENTIFICADOR(obj.NOME_FUNCAO)) {
                        var NOME = program_tokens[parser_position - 1].value;
                        var TIPO = program_tokens[parser_position - 2].value;
                        var ID_FUNC = semantico.add(NOME, "FUNCAO", TIPO);
                        var ESCOPO = program_tokens[parser_position - 1].value; //nome da funcao
                        funcaoname.value = ESCOPO;

                        if (recognizeByValue("(")) {
                            nextToken();
                            var listofIDS = { list: [] };
                            if (BNF.VARIAVEIS(obj.NOME_FUNCAO, listofIDS)) {
                                listofIDS.list.forEach(value => {
                                    semantico.updateEscopoById({ ID: value, ESCOPO: ESCOPO });
                                });

                                semantico.updateQtdById({ ID: ID_FUNC, QUANTIDADE: listofIDS.list.length });
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

            BLOCO_FUNCAO: function(obj, listofIDS) {
                obj.BLOCO_FUNCAO = {};
                if (BNF.DEF_VAR(obj.BLOCO_FUNCAO, listofIDS)) {
                    if (BNF.BLOCO(obj.BLOCO_FUNCAO)) {
                        return true;
                    }
                } else {
                    if (BNF.BLOCO(obj.BLOCO_FUNCAO)) {
                        return true;
                    }
                }
                return false;
            },

            BLOCO: function(obj) {
                obj.BLOCO = {};
                if (recognizeByValue("BEGIN")) {
                    nextToken();
                    if (BNF.COMANDOS(obj.BLOCO)) {
                        return true;
                    }
                } else {
                    if (BNF.COMANDO(obj.BLOCO)) {
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

            COMANDOS: function(obj) {
                obj.COMANDOS = {};
                if (BNF.COMANDO(obj.COMANDOS)) {
                    if (recognizeByValue(";")) {
                        nextToken();
                        if (BNF.COMANDOS(obj.COMANDOS)) {
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

            COMANDO: function(obj) {
                obj.COMANDO = {};
                if (recognizeByValue("WHILE")) {
                    nextToken();
                    if (BNF.EXP_LOGICA(obj.COMANDO)) {
                        if (BNF.BLOCO(obj.COMANDO)) {
                            return true;
                        }
                    }
                    erro(false);
                } else if (recognizeByValue("IF")) {
                    nextToken();
                    if (BNF.EXP_LOGICA(obj.COMANDO)) {
                        if (recognizeByValue("THEN")) {
                            nextToken();
                            if (BNF.BLOCO(obj.COMANDO)) {
                                if (BNF.SENAO(obj.COMANDO)) {
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
                    obj.COMANDO["WRITE"] = {};
                    nextToken();
                    if (BNF.CONST_VALOR(obj.COMANDO)) {
                        return true;
                    }
                    erro(false);
                } else if (recognizeByValue("READ")) {
                    obj.COMANDO["READ"] = {};
                    nextToken();
                    if (BNF.NOME(obj.COMANDO)) {
                        if (!semantico.exist(program_tokens[parser_position - 1].value))
                            semantico.erro(program_tokens[parser_position - 1].value, "nao foi declarado");
                        return true;
                    }
                    erro(false);
                } else if (BNF.NOME(obj.COMANDO)) {
                    if (!semantico.exist(program_tokens[parser_position - 1].value))
                        semantico.erro(program_tokens[parser_position - 1].value, "nao foi declarado");
                    if (recognizeByValue(":=")) {
                        obj.COMANDO[":="] = {};
                        nextToken();
                        if (BNF.VALOR(obj.COMANDO)) {
                            return true;
                        } else {
                            erro(false);
                        }
                    } else {
                        erro(true);
                    }
                }

                return false;
            },

            SENAO: function(obj) {
                if (recognizeByValue("ELSE")) {
                    obj.SENAO = {};
                    nextToken();
                    if (BNF.BLOCO(obj.SENAO)) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            VALOR: function(obj) {
                //obj.VALOR = {};
                if (BNF.IDENTIFICADOR(obj)) {
                    var anterior = program_tokens[parser_position - 3];
                    var anterior_tk = anterior.value;
                    var meta_anterior = semantico.query(anterior_tk, "", "", "", "", "");

                    var atual = program_tokens[parser_position - 1];
                    var atual_tk = atual.value;
                    var meta_atual = semantico.query(atual_tk, "", "", "", "", "");

                    // console.log(meta_anterior);
                    // console.log(meta_atual);
                    //console.log("testando query: " + semantico.query("a", "", "", "", "", "exp"));
                    try {

                        //console.log("deu certo no try (" + anterior_tk + ") == (" + atual_tk + ")");
                        //console.log("deu certo no try (" + meta_anterior.TIPO + ") == (" + meta_atual.TIPO + ")");
                        if (meta_anterior.TIPO != meta_atual.TIPO)
                            semantico.erro("(" + anterior_tk + ") & (" + atual_tk + ")", " TIPOS diferentes : (" + meta_anterior.TIPO + ") e (" + meta_atual.TIPO + ") na linha: " + anterior.caret_line);
                    } catch (error) {
                        //console.log("erro no try");
                        semantico.erro("(" + anterior_tk + ")", "Tipos não definidos comparado : ( " + atual_tk + " ) na linha: " + anterior.caret_line);
                    }

                    //console.log(anterior);
                    if (BNF.VALOR_2(obj)) {
                        return true;
                    }
                } else {
                    if (BNF.NUMERO(obj)) {
                        if (BNF.EXP_MATEMATICA(obj)) {
                            return true;
                        }
                    }
                }
                return false;
            },

            VALOR_2: function(obj) {
                obj.VALOR_2 = {};
                if (recognizeByValue("(")) {
                    var funcaonome = program_tokens[parser_position - 1].value;
                    if (!(semantico.isFuncao(funcaonome)))
                        semantico.erro(program_tokens[parser_position - 1].value, "FUNCAO não foi declarada");
                    nextToken();
                    var listofIDS = [];
                    if (BNF.PARAMETRO(obj.VALOR_2, listofIDS)) {
                        if (recognizeByValue(")")) {
                            var meta = semantico.getMeta(funcaonome);

                            listofIDS.forEach(value => {
                                semantico.updateEscopoById({ ID: value, ESCOPO: funcaonome });
                            });

                            if (listofIDS.length > meta.QUANTIDADE)
                                semantico.erro(funcaonome, " FUNCAO não permite mais do que : " + meta.QUANTIDADE + " parâmetros");
                            else if (listofIDS.length < meta.QUANTIDADE)
                                semantico.erro(funcaonome, " FUNCAO não permite menos que : " + meta.QUANTIDADE + " parâmetros");

                            nextToken();
                            return true;
                        } else {
                            erro(true);
                        }
                    }
                } else {
                    if (BNF.INDICE(obj.VALOR_2)) {
                        if (BNF.EXP_MATEMATICA(obj.VALOR_2)) {
                            return true;
                        }
                    }
                }
                return false;
            },

            PARAMETRO: function(obj, listofIDS) {
                obj.PARAMETRO = {};
                if (BNF.NOME_NUMERO(obj.PARAMETRO)) {
                    //semantico.updateTipoById({ ID: value, TIPO: program_tokens[parser_position - 1].value });
                    var ID = semantico.add(program_tokens[parser_position - 1].value, "PARAMETRO");
                    listofIDS.push(ID);
                    if (BNF.LISTA_PARAM(obj.PARAMETRO, listofIDS)) {
                        return true;
                    }
                }
                return false;
            },

            LISTA_PARAM: function(obj, listofIDS) {
                obj.LISTA_PARAM = {};
                if (recognizeByValue(",")) {
                    nextToken();
                    if (BNF.PARAMETRO(obj.LISTA_PARAM, listofIDS)) {
                        return true;
                    }
                    return false;
                }
                return true;
            },

            EXP_LOGICA: function(obj) {
                obj.EXP_LOGICA = {};
                if (BNF.NOME_NUMERO(obj.EXP_LOGICA)) {
                    if (BNF.EXP_MATEMATICA(obj.EXP_LOGICA)) {
                        if (BNF.EXP_LOGICA_2(obj.EXP_LOGICA)) {
                            return true;
                        }
                    }
                }
                return false;
            },

            EXP_LOGICA_2: function(obj) {
                obj.EXP_LOGICA_2 = {};
                if (BNF.OP_LOGICO(obj.EXP_LOGICA_2)) {
                    if (BNF.EXP_LOGICA(obj.EXP_LOGICA_2)) {
                        return true;
                    }
                    return false;
                }

                return true;
            },

            EXP_MATEMATICA: function(obj) {
                obj.EXP_MATEMATICA = {};
                if (BNF.OP_MATEMATICO(obj.EXP_MATEMATICA)) {
                    if (BNF.NOME_NUMERO(obj.EXP_MATEMATICA)) {
                        if (BNF.EXP_MATEMATICA(obj.EXP_MATEMATICA)) {
                            return true;
                        }
                        return false;
                    }
                    return false
                }
                return true;
            },

            OP_LOGICO: function(obj) {
                if (recognizeByType("SIMBOLO_LOGICO")) {
                    obj.OP_MATEMATICO = program_tokens[parser_position].value;
                    nextToken();
                    return true;
                }
                //erro(); terminar
                return false;
            },

            OP_MATEMATICO: function(obj) {
                if (recognizeByType("SIMBOLO_MATEMATICO")) {
                    obj.OP_MATEMATICO = program_tokens[parser_position].value;
                    nextToken();
                    return true;
                }
                //erro(); terminar
                return false;
            },

            NOME_NUMERO: function(obj) {
                obj.NOME_NUMERO = {};
                if (BNF.NOME(obj.NOME_NUMERO)) {
                    return true;
                } else {
                    if (BNF.NUMERO()) {
                        return true;
                    }
                }
                return false;
            },

            NOME: function(obj) {
                //obj.NOME = {};
                if (BNF.IDENTIFICADOR(obj)) {
                    if (BNF.INDICE(obj)) {
                        return true;
                    }
                }
                return false;
            },

            INDICE: function(obj) {
                if (recognizeByValue("[")) {
                    obj.INDICE = {};
                    nextToken();
                    if (BNF.NOME_NUMERO(obj.INDICE)) {
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

        return BNF.PROGRAMA();
    }


    /**
     * 
     */
    var semantico = (function() {
        var table = [];

        function add(NOME, CLASS, TIPO, QUANTIDADE, ORDEM, ESCOPO) {
            var meta = {};

            meta.NOME = NOME;
            meta.CLASS = CLASS;
            meta.TIPO = TIPO;
            meta.QUANTIDADE = QUANTIDADE;
            meta.ORDEM = ORDEM;
            meta.ESCOPO = ESCOPO;

            table.push(meta);
            return (table.length - 1);
        }

        function updateTipoById(meta) {
            table[meta.ID].TIPO = meta.TIPO;
        }

        function updateEscopoById(meta) {
            table[meta.ID].ESCOPO = meta.ESCOPO;
        }

        function updateQtdById(meta) {
            table[meta.ID].QUANTIDADE = meta.QUANTIDADE;
        }

        function erro(tk, tipoErro) {
            console.log(colors.red("ERRO SEMANTICO: ") + tk + " " + tipoErro);
        }

        function getMeta(name) {
            for (var element of table) {
                if (element.NOME == name)
                    return element;
            }

            return null;
        }

        function isFuncao(name) {
            if (table.length == 0)
                return false;

            for (var element of table) {
                if (element.NOME == name)
                    if (element.CLASS == "FUNCAO")
                        return true;
            }

            return false;
        }

        function exist(name) {
            if (table.length == 0)
                return false;

            for (var element of table) {
                if (element.NOME == name)
                    return true;
            }

            return false;
        }

        function query(NOME, CLASS, TIPO, QUANTIDADE, ORDEM, ESCOPO) {

            var paramsfound = 0;
            //prepare
            var params = {};
            if (NOME)
                params.NOME = NOME;
            if (CLASS)
                params.CLASS = CLASS;
            if (TIPO)
                params.TIPO = TIPO;
            if (QUANTIDADE)
                params.QUANTIDADE = QUANTIDADE;
            if (ORDEM)
                params.ORDEM = ORDEM;
            if (ESCOPO)
                params.ESCOPO = ESCOPO;

            var paramstomatch = _.size(params);

            for (var line of table) {
                _.each(params, function(value, index, obj) {
                    //console.log(line);
                    //console.log(line[index] + " == " + value);
                    if (line[index] == value)
                        paramsfound++;

                    // console.log(element);
                    // console.log(index);
                });

                //console.log(paramstomatch + " == " + paramsfound);
                if (paramstomatch == paramsfound)
                    return line;
                else
                    paramsfound = 0;
            }

            return null;
        }

        function getTable() {
            return table;
        }

        return {
            getTable: getTable,
            add: add,
            updateTipoById: updateTipoById,
            updateQtdById: updateQtdById,
            updateEscopoById: updateEscopoById,
            isFuncao: isFuncao,
            getMeta: getMeta,
            exist: exist,
            query: query,
            erro: erro
        }
    })();

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