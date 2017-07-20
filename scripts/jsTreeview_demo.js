var g_lastclickedid = '';
var g_teardownLoaded = null;

// treeview class
function Tree_View()
{
	this.node_root = null;
}
//add root
Tree_View.prototype.add_node_root = function (id, name, picture, is_expand, hyperlink, parameters)
{
	this.node_root = new item_node(id, name, picture, is_expand, hyperlink, parameters);
	return this.node_root;
};
//clean root
Tree_View.prototype.clear = function()
{
	this.node_root = null;
};
//get html
Tree_View.prototype.contentHtml = function()
{
	return this.node_root.contentHtml(this.node_root.id, 0, true, false, false, this.node_root.is_expand, true);
};

//--------------------------------------------------------------------------------------------------------------
//node class
function item_node(id, name, picture, is_expand, hyperlink, parameters)
{
	this.id = Number(id); //identification
	this.name = name; //node text
	this.picture = picture; //node picture
	this.is_expand = (is_expand == 'true'); //if expanded on creation
	this.hyperlink = hyperlink; //check if hyperlink
	this.items = []; //child node collection
	this.parameters = parameters;
}
//adds another node for that parent
item_node.prototype.add_node = function(id, name, picture, is_expand, hyperlink, parameters)
{
	var obj = new item_node(id, name, picture, is_expand, hyperlink, parameters);
	this.items[this.items.length] = obj;
	
	return obj;
};
//clean the collection
item_node.prototype.clear = function()
{
	this.items = [];
};
//identify children
item_node.prototype.getIdChildNodes = function()
{
	var arrayId = '';
	for(var i = 0; i < this.items.length; i++)
	{
		arrayId += this.items[i].id + ';';
	}
	
	return arrayId;
};
//get html content
//<param name="id">node identification</param> 
//<param name="indent">node indent number</param> 
//<param name="nodeFirst">check if root</param> 
//<param name="nodeSingle">chack if node has siblings</param> 
//<param name="isImgLine">check if line to be added. when parent node expanded and has sibling</param> 
//<param name="is_expand">check if needs to be expanded</param> 
//<param name="parentNodeSingle">single parent node</param>
item_node.prototype.contentHtml = function (id, indent, nodeFirst, nodeSingle, isImgLine, is_expand, parentNodeSingle, strIndentLine)
{
	var content = '';

	//default indent
	var const_indent = '&nbsp&nbsp&nbsp&nbsp&nbsp';
	
	
	var className = '';
	var lineImg = '';
	var addImgLine = false;
	
	if(!nodeFirst && !nodeSingle)
	{
		addImgLine = true;
	}
	
	if(nodeFirst){ //first node, already expanded
		className = 'nolines_MinusTree';
		strIndentLine = '';
	}
	else
	{
		if(nodeSingle) //single node, or node at last position
		{
			if(this.items.length == 0) //if no child node
			{
				className = 'joinBottomTree';
			}
			else
			{
				if(is_expand) //check if expanded or not
					className = 'minusBottomTree';
				else
					className = 'plusBottomTree';
			}
		}
		else //there are sibling nodes
		{
			if(this.items.length == 0) //if no child node
			{
				className = 'joinTree';
			}
			else
			{
				if(is_expand)
					className = 'minusTree';
				else
					className = 'plusTree';
			}
		}
	}
	
	var eventClick = '';
	if(this.items.length > 0) //string with the function to call for expantion or not
	{
		var arrayId = this.getIdChildNodes();
		eventClick = 'onclick="nodeExpand(document.getElementById(\'' + id + '\'), \'' + arrayId + '\')"';
	}
	
	//creating the new div
	content += '<div id="' + id + '" style="display:@visible@;line-height:18px;"><input id="' + id + 'Hidden" type="hidden" value="' + (is_expand ? '1' : '0') + '" />';
	
	var valueNode = '';
	var valueLink = '';
	
	/*events
	 * onmouseover: focus the label
	 * onmouseout: remove the focus
	 * ondrag: move the node, changing the parent node
	 * ondragenter: highlight the target node for the move
	 * ondragleave: remove the highlight if target node changed
	 * ondrop: change the parent node
	 * onclick: select the node
	 * ondragover: allow drop state
	 */
	var eventHighlight = ' onmouseover="focusLabel(this.id);" onmouseout="unfocusLabel(this.id);" ondrag="labelclickevent(this.id);" ondragenter="highlighttarget(event);" '
	eventHighlight += ' ondragleave="unhighlighttarget(event);" ondrop="Change_Teardown_Parent(event);" onclick="labelclickevent(this.id);"';
	eventHighlight += ' ondragover="allowdrop(event);"';
	//removed hyperlink part
	valueLink = this.name;
	//removed picture part
	valueNode = '<label id="treeviewLabel' + id + '" title="' + id + ' - ' + this.name + '" draggable="true" class="fontTree"' + eventHighlight;
	valueNode += '>' + valueLink + '</label>';		
	
	if(isImgLine) //if needs to create the vertical line
	{	
		strIndentLine += '<label class="lineTree">' + const_indent + '</label>';
		content += strIndentLine + '<label id="' + id + 'ClassNameHidden" class="' + className + '" ' + eventClick + '>' + const_indent + '</label>' + valueNode + '<br>';
//		addImgLine = true;
	}	
	else
	{
		if(!nodeFirst) //if first, don't indent
			strIndentLine += '<label>' + const_indent + '</label>';
		content += strIndentLine + '<label id="' + id + 'ClassNameHidden" class="' + className + '" ' + eventClick + '>' + const_indent + '</label>' + valueNode + '<br>';
	}
	
	var newindent = indent + 1;
	nodeFirst = false;
	
	//go through all the children nodes
	for(var i = 0; i < this.items.length; i++)
	{
		var isNodeSingle = false;
		var strValue = '';
		
		if(i == this.items.length - 1) //check if last node
			isNodeSingle = true;
		
		strValue = this.items[i].contentHtml(this.items[i].id, newindent, nodeFirst, isNodeSingle, addImgLine, (!is_expand ? false: this.items[i].is_expand), nodeSingle, strIndentLine);
		
		//check if expanded
		if (is_expand)
			strValue = strValue.replace('@visible@', 'block');
		else
			strValue = strValue.replace('@visible@', 'none');
	
		content += strValue;
	}
	
	content += '</div>';
	
	return content;
};
//-------------------------------------------------------------------------------------------------------------------
//Makes the + - signs operational
//<param name="objDiv">Div for the node and child nodes</param> 
//<param name="ids">Call all the children identifiers</param>
function nodeExpand(objDiv, ids)
{
	var arrayId = ids.split(';');
	var display = '';
	
	var objHidden = document.getElementById(objDiv.id + 'Hidden');
	var objLabel = document.getElementById(objDiv.id + 'ClassNameHidden');
	
	if(objLabel.className == 'nolines_PlusTree' || objLabel.className == 'nolines_MinusTree')
	{
		if(objLabel.className == 'nolines_PlusTree')
			objLabel.className = 'nolines_MinusTree';
		else
			objLabel.className = 'nolines_PlusTree';
	}
	else if(objLabel.className == 'plusBottomTree' || objLabel.className == 'minusBottomTree')
	{
		if(objLabel.className == 'plusBottomTree')
			objLabel.className = 'minusBottomTree';
		else
			objLabel.className = 'plusBottomTree';		
	}
	else if(objLabel.className == 'plusTree' || objLabel.className == 'minusTree')
	{
		if(objLabel.className == 'plusTree')
			objLabel.className = 'minusTree';
		else
			objLabel.className = 'plusTree';		
	}
	
	//check if needs to hide or show
	if(objHidden.value == '0')
	{
		display = 'block';
		objHidden.value = '1';
	}
	else
	{
		display = 'none';
		objHidden.value = '0';
	}
	
	//hide or show all the children nodes
	for (var i = 0; i < arrayId.length - 1; i++)
	{
		var objNode = document.getElementById(arrayId[i]);
		objNode.style.display = display;
	}
}
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function focusLabel(id)
{
	if(document.getElementById(id) != null)
		document.getElementById(id).style.border = 'thin solid grey';
}
function unfocusLabel(id)
{
	if(document.getElementById(id) != null)
		document.getElementById(id).style.border = 'none';
}
function highlightLabel(id)
{
	if(document.getElementById(id) != null)
		document.getElementById(id).style.backgroundColor = 'LightBlue';
}
function unhighlightLabel(id)
{
	if(document.getElementById(id) != null)
		document.getElementById(id).style.backgroundColor = 'White';
}
function highlighttarget(event)
{
	event.preventDefault();
	if(event.target.id.indexOf("treeviewLabel") >= 0)
		highlightLabel(event.target.id);
}
function unhighlighttarget(event)
{
	event.preventDefault();
	if(event.target.id.indexOf("treeviewLabel") >= 0)
		unhighlightLabel(event.target.id);
}
function allowdrop(event)
{
	event.preventDefault();
}

