import * as esprima from 'esprima';

var elementsDic=[] ;

const parseCode = (codeToParse) => {
    elementsDic =[];
    return esprima.parseScript(codeToParse,{loc:true},function (node) {
        var specificHandler = functionDic[node.type];
        if(specificHandler)
        {
            specificHandler(node);
        }
    });
};

const getModel = () => {
    return elementsDic;
};


const functionDic ={
    'Identifier':handleIdentifier,
    'VariableDeclarator':handleVariableDeclarator,
    'Literal':handleLiteral,
    'AssignmentExpression':handleAssignmentExpression,
    'BinaryExpression':handleBinaryExpression,
    'MemberExpression':handleMemberExpression,
    'ReturnStatement':handleReturnStatement,
    'IfStatement':handleIfStatement,
    'WhileStatement':handleWhileStatement,
    'DoWhileStatement':handleDoWhileStatement,
    'UnaryExpression':handleUnaryExpression,
    'FunctionDeclaration':handleFunctionDeclaration,
    'ForStatement':handleForStatement,
    'UpdateExpression':handleUpdateExpression
};

function insertToElementsDic(line,type,name,condition,value) {
    let flag = false;
    for (var i = 0; i < elementsDic.length; i++) {
        if (elementsDic[i].line+elementsDic[i].type+elementsDic[i].value+elementsDic[i].name+elementsDic[i].condition == line+type+value+name+condition) {
            flag = true;}    }
    if (!flag) {
        elementsDic.push({
            line: line,
            type: type,
            name: name,
            condition: condition,
            value: value
        });
    }
}

function handleIdentifier(node)
{
    return node.name;
}

function handleVariableDeclarator(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = node.id.name;
    var condition = '';
    var value = '';
    if(node.init)
    {
        value=functionDic[node.init.type](node.init);
    }
    insertToElementsDic(line,type,name,condition,value);
}

function handleLiteral(node)
{
    return node.raw;
}

function handleAssignmentExpression(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = functionDic[node.left.type](node.left);
    var condition = '';
    var value;
    if(node.operator!='=')
    {
        value = name+ (node.operator[0]) + functionDic[node.right.type](node.right);
    }
    else {
        value = functionDic[node.right.type](node.right);
    }

    insertToElementsDic(line,type,name,condition,value);
}

function handleBinaryExpression(node)
{
    var leftFunction =functionDic[node.left.type];
    var rightFunction = functionDic[node.right.type];
    var left = leftFunction(node.left);
    var right = rightFunction(node.right);
    return (left+' '+node.operator + ' '+ right);
}

function handleMemberExpression(node)
{
    return (functionDic[node.object.type](node.object)+'['+functionDic[node.property.type](node.property)+']');
}

function handleReturnStatement(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = '';
    var condition ='';
    var value = functionDic[node.argument.type](node.argument) ;
    insertToElementsDic(line,type,name,condition,value);
}

function handleIfStatement(node)
{
    if(node.alternate && node.alternate.type == 'IfStatement')
    {
        var lineAlt = node.alternate.loc.start.line;
        var typeAlt = node.alternate.type;
        var nameAlt = '';
        var conditionAlt = functionDic[node.alternate.test.type](node.alternate.test);
        for (var i = 0; i < elementsDic.length; i++) {
            if (elementsDic[i].line+elementsDic[i].type+elementsDic[i].name+elementsDic[i].condition == lineAlt+typeAlt+nameAlt+conditionAlt) {
                elementsDic[i].type = 'ElseIfStatement';}}}
    var line = node.loc.start.line;
    var type = node.type;
    var name = '';
    var condition = functionDic[node.test.type](node.test);
    var value = '';
    insertToElementsDic(line,type,name,condition,value);
}

function handleWhileStatement(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = '';
    var condition = functionDic[node.test.type](node.test);
    var value = '';
    insertToElementsDic(line,type,name,condition,value);
}

function handleDoWhileStatement(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = '';
    var condition = functionDic[node.test.type](node.test);
    var value = '';
    insertToElementsDic(line,type,name,condition,value);
}

function handleUnaryExpression(node)
{
    return node.operator + functionDic[node.argument.type](node.argument);
}

function handleForStatement(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = '';
    var condition = functionDic[node.test.type](node.test);
    var value = '';
    insertToElementsDic(line,type,name,condition,value);
}

function handleUpdateExpression(node)
{
    var line = node.loc.start.line;
    var type = node.type;
    var name = functionDic[node.argument.type](node.argument);
    var condition = '';
    var value = node.operator;
    insertToElementsDic(line,type,name,condition,value);
    if(node.prefix)
    {
        return value+name ;
    }
    return name+ value;

}
function handleFunctionDeclaration(node) {
    var line = node.loc.start.line;
    var type = node.type;
    var name = node.id.name;
    var condition = '';
    var value = '';
    insertToElementsDic(line, type, name, condition, value);
    var index;
    for (index = 0; index < node.params.length; ++index) {
        line = node.loc.start.line;
        type = 'VariableDeclarator';
        name = node.params[index].name;
        condition = '';
        value = '';
        insertToElementsDic(line, type, name, condition, value);
    }
}


export {parseCode,getModel};
