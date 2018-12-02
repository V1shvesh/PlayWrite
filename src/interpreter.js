// Dangerous Global Object Reference Array
var OBJECTS = new Array();

// Class Head
class Head {
    // constructor
    constructor()
    {
        this.next = null;
    }
}

// Class Node
class Node { 
    // constructor 
    constructor(element) 
    { 
        // element has strictly to be a number
        this.element = element; 
        this.next = null;
    } 
}

// create Node
function createNode(number) {
    var node = new Node(number);
    return node;
}

// create Head
function createHead() {
    var head = new Head();
    return head;
}

// link
function link(a, b) {
    if (typeof a == "object" && typeof b == "object") {
        a.next = b;
    }
}

// get next node
function getNextNode(a) {
    if (typeof a == "object") {
        return a.next;
    }
}

// get node value
function getValue(a) {
    if (typeof a == "object") {
        if ("element" in a) {
            return a.element;
        }
    }
}

// remove object
function remove(a) {
    if (typeof a == "object") {
        a == undefined;
    }
}

//TODO input function
function getCode() {
    var code = "";
    return code;
}

// returns array of statements
function getStatements(code) {
    return code.split("\n");
}

function objectExists(a) {
    return a in OBJECTS;
}

function getToken(token) {
    if (token.includes("("))
        return token;
    if (objectExists(token))
        return token;
}

function parser(statement) {
    statement = statement.replace(/\s/g, "");
    
    // assignment statements
    if (statement.includes("=")) {
        var tokens = statement.split("=");
        if (tokens.length === 2) {
            if (!objectExists(tokens[0])) {
                var code = tokens[0]+"="+getToken(tokens[1]);
                eval(code);
                OBJECTS.push(tokens[0]);
            }
        }
    } 
    // function calls
    //TODO add checks
    else {
        eval(statement); 
    }
}


function interpreter() {
    var code = getStatements(getCode());
    code.forEach(function(statement) {
        console.log(statement);
        parser(statement);
    });
}

// RUNS HERE
interpreter();
OBJECTS.forEach(function(o) {
  console.log(o);
})
