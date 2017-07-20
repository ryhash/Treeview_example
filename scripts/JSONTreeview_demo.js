//global variables containing the treeview structure
var g_lastclickedid = '';
var g_treeviewLoaded = null;


function resetLastClickedID()
{
	g_lastclickedid = '';
}

//load the treeview information from a JSON file
function loadTreeView(file, callback)
{
	
	var obj_root;
	var old_child;
	var parameters;
	var nParts = 0;
	
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', file, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
}

//Pull the JSON data and creates the treeview
function Populate_Treeview(data)
{
	var temp;
	
	temp = document.getElementById("treeview");
	//console.log((data));
	
	g_treeviewLoaded = new Tree_View();

	//g_treeviewLoaded.node_root.add_node(null, null, null, null, null, null);

	var temp_object = JSON.parse(data);
	g_treeviewLoaded.add_node_root(temp_object.node_root.id, temp_object.node_root.name, temp_object.node_root.picture, temp_object.node_root.is_expand, temp_object.node_root.hyperlink, temp_object.node_root.parameters);
	
	Create_Object_Mask(g_treeviewLoaded.node_root, temp_object.node_root);
	
	//console.log(JSON.stringify(g_treeviewLoaded));

	var objContent = document.getElementById("treeview");
	objContent.innerHTML = g_treeviewLoaded.contentHtml(); 	
}

//Generates the structure to create the treeview
function Create_Object_Mask(treeview_dest, treeview_origin)
{
	for(var i = 0; i < treeview_origin.items.length; i++)
	{
		//id, name, picture, is_expand, hyperlink, parameters
		treeview_dest.items[i] = new item_node(treeview_origin.items[i].id, treeview_origin.items[i].name, treeview_origin.items[i].picture, treeview_origin.items[i].is_expand, treeview_origin.items[i].hyperlink, treeview_origin.items[i].parameters);
		Create_Object_Mask(treeview_dest.items[i], treeview_origin.items[i]);
	}
}

//find the parent node of a certain id
function Find_Parent_Node(id, obj_root)
{
	var obj_parent = null;
	
	if(obj_root.id == id)
	{
		return null;
	}
		
	for(var i = 0; i < obj_root.items.length; i++)
	{
		if(obj_root.items[i].id == id)
		{
			return obj_root;
		}
		else
		{
			obj_parent = Find_Parent_Node(id, obj_root.items[i]);
			if(obj_parent != null)
				return obj_parent;
		}
	}
	return obj_parent;
}

//find the node that contains the id
function Find_Object_by_ID(id, obj_root)
{
	var old_child = null;
	
	if(obj_root.id == id)
	{
		return obj_root;
	}
		
	for(var i = 0; i < obj_root.items.length; i++)
	{
		if(obj_root.items[i].id == id)
		{
			return obj_root.items[i];
		}
		else
		{
			old_child = Find_Object_by_ID(id, obj_root.items[i]);
			if(old_child != null)
				return old_child;
		}
	}
	return old_child;
}

//make sure the node is visible (parent node expanded)
function Ensure_Visibility(selected_ID, objTreeView)
{
	for(var i = 0; i < objTreeView.items.length; i++)
	{
		if(objTreeView.items[i].id == selected_ID)
		{
			labelclickevent(g_lastclickedid);
			objTreeView.items[i].is_expand = true;
			objTreeView.is_expand = true;
			return true;
		}
		if(Ensure_Visibility(selected_ID, objTreeView.items[i]))
		{
			objTreeView.is_expand = true;
			return true;
		}
	}
	return false;
}

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------
/////////////////////////////////////////////////////MOVE_TEARDOWN_PART///////////////////////////////////////////////////////////////////
function Change_Teardown_Parent(event)
{
	event.preventDefault();
	if(event.target.id.indexOf("treeviewLabel") >= 0)
	{
		unhighlightLabel(g_lastclickedid);
		unhighlightLabel(event.target.id);
		if(!confirm('Do you want to move ' + document.getElementById(g_lastclickedid).innerHTML + ' to ' + event.target.innerHTML + '?'))
			return;
	}

	
	var parent_id = Number(event.target.id.replace('treeviewLabel', ''));
	var parent_level;
	
	var id = Number(g_lastclickedid.replace('treeviewLabel', ''));
	
	var old_child = Find_Object_by_ID(id, g_treeviewLoaded.node_root);
	var obj_parent = Find_Object_by_ID(parent_id, g_treeviewLoaded.node_root);
	
	//function to define if the "move" action is valid
	function check_parent_child(obj_root, parent_id)
	{		
		var found = false;
		
		for(var i = 0; i < obj_root.items.length; i++)
		{
			if(obj_root.items[i].id == parent_id)
			{
				return true;
			}
			else
			{
				found = check_parent_child(obj_root.items[i], parent_id);
				if(found)
				{
					return true;
				}
			}
		}	
		return false;
	}

	if(old_child == null || obj_parent == null)
	{
		alert('Error');
		return;
	}
	//can't move if child node is linked to parent node
	else if(id == parent_id || check_parent_child(old_child, parent_id))
	{
		alert('Not valid');
		return;
	}
	
	//move the part in the treeview object
	var obj_old_parent = Find_Parent_Node(id, g_treeviewLoaded.node_root);
	obj_parent.items[obj_parent.items.length] = old_child;
	obj_parent.is_expand = true;
	for(var i = 0; i < obj_old_parent.items.length; i++)
	{
		if(obj_old_parent.items[i] === old_child)
		{
			obj_old_parent.items.splice(i, 1);
			break;
		}
	}


	var objContent = document.getElementById("treeview");
	objContent.innerHTML = g_treeviewLoaded.contentHtml();	
	
	highlightLabel(g_lastclickedid);
}

//---------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------
//////////////////////////////////////////////////////////////////////PART_CLICK_EVENT/////////////////////////////////////////////////////////////////
function labelclickevent(id)
{
	if(g_lastclickedid != '')
	{
		unhighlightLabel(g_lastclickedid);
	}

	g_lastclickedid = id;
	highlightLabel(id);
}
