/*JavaScript for the exam project of Data Visualization in the autumn semester of 2023 at Oslo Metropolitan University
Author(s)		: Lukas Mirow
Date of creation	: 2023-12-03
*/


const PARAMS = ["show_attack", "show_base_egg_steps", "show_base_happiness", "show_capture_rate", "show_defense", "show_experience_growth", "show_height_m", "show_hp", "show_percentage_male", "show_pokedex_number", "show_sp_attack", "show_sp_defense", "show_speed", "show_weight_kg"];
const SPRITE_WIDTH = 100;
const SPRITE_HEIGHT = 100;
const MIN_BUBBLE_SIZE = 25;
const MAX_BUBBLE_SIZE = 250;
const PARAMS_PREFIX = 5;
const BUTTONS_POSTFIX = 4;
const BUBBLE_CLASS_NAME_POSTFIX = 7;
const VISUALIZATION_CONTAINER_ID = "bubble_charts"


//Set the parameters of the page, this reloads it
function set_params(new_params_string)
{
	window.location.search = new_params_string;
}

//Create description of a pokemn by pokeid, will be shown when the sprite is clicked
function get_description_of_pkmn(pokeid)
{
	const pkmn = DATA[pokeid - 1];
	ret = "Name: " + pkmn.name + "\n";
	ret += "Pokedex Number: " + pkmn.pokedex_number + "\n";
	for (const param of PARAMS)
	{
		const characteristic = param.substring(PARAMS_PREFIX);
		const pretty_characteristic = document.getElementById(param + "_btn").innerHTML;
		ret += pretty_characteristic + ": " + pkmn[characteristic] + "\n";
	}
	return ret;
}

//Calcuate center x of circle
function calc_center_x_of_circle(center_x, angle_step, iteration)
{
	return center_x + Math.cos(iteration * angle_step) * SPRITE_WIDTH;
}

//Calcuate center y of circle
function calc_center_y_of_circle(center_y, angle_step, iteration)
{
	return center_y + Math.sin(iteration * angle_step) * SPRITE_HEIGHT;
}

//Test if an image file exists
//Source: http://stackoverflow.com/questions/12226410/ddg#12226476
function img_exists(img_path)
{
	var tmp = new Image;
	tmp.src=img_path;
	if (tmp.complete)
		return true;
	return false;
}

//Update visualization
function update_vis()
{

	//Sort depending on user' choice
	var sorted_data = DATA.slice(); //Clone
	if (sorting_direction == "ascending")
		sorted_data.sort(function(a, b) {return a[sort_by] - b[sort_by];});
	else
		sorted_data.sort(function(a, b) {return b[sort_by] - a[sort_by];});

	//Only show the first n elements, depending on user's choice
	sorted_data = sorted_data.slice(0, count_pkmn_to_show);

	//Create D3 scales for mapping data values to bubble sizes
	var characteristic_scales = [];
	for (var i = 0; i < characteristics_to_show.length; i++)
	{
		const characteristic = characteristics_to_show[i];
		var values = [];
		for (var j = 0; j < sorted_data.length; j++)
			values.push(sorted_data[j][characteristic])
		const minv = Math.min.apply(Math, values);
		const maxv = Math.max.apply(Math, values);
		characteristic_scales.push(d3.scaleLinear().domain([minv, maxv]).range([MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE]));
	}

	//Create visualizations
	for (var j = 0; j < sorted_data.length; j++)
	{
		const pkmn_obj = sorted_data[j];

		//Create and select an SVG container
		document.getElementById(VISUALIZATION_CONTAINER_ID).innerHTML += '<svg id="bubble_chart_' + j + '" class="bubble_chart" width="300" height="300"></svg>';
		const svg = d3.select('#bubble_chart_' + j);

		//Remove any existing elements
		svg.selectAll('*').remove();

		//Get the center coordinates of the chart
		const center_x = svg.attr("width") / 2;
		const center_y = svg.attr("height") / 2;

		//Cirlcular pattern
		const angle_step = (2 * Math.PI) / characteristics_to_show.length;

		//Draw lines and bubbles
		for (var i = 0; i < characteristics_to_show.length; i++)
		{
			const characteristic_to_show = characteristics_to_show[i];

			//Draw lines from bubbles to the center
			var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("class", "line");
			line.setAttribute("x1", center_x);
			line.setAttribute("y1", center_y);
			line.setAttribute("x2", calc_center_x_of_circle(center_x, angle_step, i));
			line.setAttribute("y2", calc_center_y_of_circle(center_y, angle_step, i));
			svg.node().appendChild(line);

			//Create circles for each data point in a circular pattern
			if (!pkmn_obj.hasOwnProperty(characteristic_to_show) || pkmn_obj[characteristic_to_show] === null || isNaN(pkmn_obj[characteristic_to_show]) || pkmn_obj[characteristic_to_show] === "") //Don't draw a bubble if the value is empty
			{
				var text = document.createElementNS("http://www.w3.org/2000/svg", "text")
				line.setAttribute("class", characteristic_to_show + "_bubble");
				text.setAttribute('x', calc_center_x_of_circle(center_x, angle_step, i));
				text.setAttribute('y', calc_center_y_of_circle(center_y, angle_step, i));
				text.setAttribute('text-anchor', 'middle');
				text.setAttribute('alignment-baseline', 'middle');
				text.textContent = "no data";
				svg.node().appendChild(text);
			}
			else
			{
				var bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
				bubble.setAttribute("class", "bubble " + characteristic_to_show + "_bubble");
				bubble.setAttribute("cx", calc_center_x_of_circle(center_x, angle_step, i));
				bubble.setAttribute("cy", calc_center_y_of_circle(center_y, angle_step, i));
				bubble.setAttribute("r", Math.sqrt(characteristic_scales[i](pkmn_obj[characteristic_to_show])));
				bubble.setAttribute("title", document.getElementById("show_" + characteristic_to_show + "_btn").innerHTML + ": " + pkmn_obj[characteristic_to_show] + "\n");
				bubble.addEventListener("mouseover", showTooltip);
				bubble.addEventListener("mouseout", hideTooltip);
				svg.node().appendChild(bubble);
			}

		}

		//Add an image to the center
		const pokedex_number = parseInt(sorted_data[j].pokedex_number);
		var bubble_img = svg.append('image');
		bubble_img.attr('class', 'bubble_img');
		bubble_img.attr('x', center_x - SPRITE_WIDTH/2);
		bubble_img.attr('y', center_y - SPRITE_HEIGHT/2);
		bubble_img.attr('width', SPRITE_WIDTH);
		bubble_img.attr('height', SPRITE_HEIGHT);
		var sprite_path = "sprites/";
		const spritefname = pokeid2spritepath(pokedex_number);
		if (spritefname.length == 0)
		{
			//Use MissingNo Sprite
			sprite_path += 'missingno.png';

			//Add "no sprite" text
			var text = document.createElementNS("http://www.w3.org/2000/svg", "text")
			text.setAttribute('x', center_x);
			text.setAttribute('y', center_y);
			text.setAttribute('text-anchor', 'middle');
			text.setAttribute('alignment-baseline', 'middle');
			text.setAttribute('font-weight', 'bold');
			text.textContent = "no sprite";
			svg.node().appendChild(text);

		}
		else
			sprite_path += spritefname;
		bubble_img.attr('xlink:href', sprite_path);
		bubble_img.attr('title', get_description_of_pkmn(pokedex_number));
		bubble_img.style('cursor', 'pointer');
		bubble_img.style('color', 'darkgreen');

		//Add Pokemon's name below the sprite
		var text = document.createElementNS("http://www.w3.org/2000/svg", "text")
		text.setAttribute('x', center_x);
		text.setAttribute('y', center_y + SPRITE_HEIGHT/2 + 8);
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('alignment-baseline', 'middle');
		text.textContent = pkmn_obj.name;
		svg.node().appendChild(text);

	}
}

//Function to show the tooltip
function showTooltip(event)
{
	const tooltip = document.getElementById('tooltip');
	const tooltipText = document.getElementById('tooltip-text');
	tooltipText.textContent = event.target.getAttribute("title");
	tooltip.style.left = (event.pageX + 10) + 'px';
	tooltip.style.top = (event.pageY - 20) + 'px';
	tooltip.style.display = 'block';
}

//Function to hide the tooltip
function hideTooltip()
{
	const tooltip = document.getElementById('tooltip');
	tooltip.style.display = 'none';
}

//Function to show the tooltip with Pokémon characteristics
function showCharacteristicsTooltip(event)
{
	const tooltip = document.getElementById('tooltip');
	const tooltipText = document.getElementById('tooltip-text');
	tooltipText.textContent = event.target.getAttribute("title");
	tooltip.style.left = (event.pageX + 10) + 'px';
	tooltip.style.top = (event.pageY - 20) + 'px';
	tooltip.style.display = 'block';
	event.stopPropagation(); //Prevent bubbling of click event to avoid immediate hide
}

//Update all buttons, called when a button is pressed
function update_buttons()
{
	var usp = new URLSearchParams(window.location.search);
	for (const btn_input of document.getElementById("filter_elements").children)
	{
		const value = btn_input.classList.contains("on")
		const param = btn_input.id.substring(0, btn_input.id.length - BUTTONS_POSTFIX);
		usp.set(param, value);
	}
	set_params("?" + usp.toString());
}

//Update parameter values on button presses
function btn_pressed(caller)
{
	caller.classList.toggle("on");
	update_buttons();
}

//Handle value change on a filter element
function filter_element_value_change(event)
{
	const new_value = event.target.value;
	var usp = new URLSearchParams(window.location.search);
	usp.set(event.target.id, new_value);
	set_params("?" + usp.toString());
}

//Highlight all bubbles of that characteristic
function highlight_other_bubbles(event)
{
	var class_name = null;
	for (const cn of event.target.classList)
		if (cn.substring(cn.length - BUBBLE_CLASS_NAME_POSTFIX) == "_bubble")
			class_name = cn;
	for (const bubble of document.getElementsByClassName(class_name))
		bubble.style.strokeWidth = "3px";
}

//Unhighlight all bubbles of that characteristic
function unhighlight_other_bubbles(event)
{
	var class_name = null;
	for (const cn of event.target.classList)
		if (cn.substring(cn.length - BUBBLE_CLASS_NAME_POSTFIX) == "_bubble")
			class_name = cn;
	for (const bubble of document.getElementsByClassName(class_name))
		bubble.style.strokeWidth = "1px";
}

// Add event listeners to the container element
document.getElementById('bubble_charts').addEventListener
(
	'mouseover',
	function (event)
	{
		if (event.target.classList.contains('bubble'))
		{
			showTooltip(event);
			highlight_other_bubbles(event);
		}
	}
);
document.getElementById('bubble_charts').addEventListener
(
	'mouseout',
	function (event)
	{
		if (event.target.classList.contains('bubble'))
		{
			hideTooltip();
			unhighlight_other_bubbles(event);
		}
	}
);
document.getElementById('bubble_charts').addEventListener
(
	'click',
	function (event)
	{
		if (event.target.classList.contains('bubble_img'))
			showCharacteristicsTooltip(event);
	}
);
document.getElementById('bubble_charts').addEventListener
(
	'click',
	function (event)
	{
		if (!event.target.closest('.bubble_img'))
			hideTooltip();
	}
);

//Set correct values of filtering and sorting elements:
//Filter buttons
var usp = new URLSearchParams(window.location.search);
is_any_param_set = false;
for (const param of PARAMS)
{
	if (usp.get(param) != null)
	{
		is_any_param_set = true;
		break;
	}
}
var characteristics_to_show = [];
//Adjust button colors according to if they are pressed or not
if (is_any_param_set)
	for (const btn_input of document.getElementById("filter_elements").children)
	{
		const param = btn_input.id.substring(0, btn_input.id.length - BUTTONS_POSTFIX);
		if (usp.get(param) == "true")
			btn_input.classList.add("on")
		else
			btn_input.classList.remove("on")
	}

for (const btn_input of document.getElementById("filter_elements").children)
	if (btn_input.classList.contains("on"))
		characteristics_to_show.push(btn_input.id.substring(PARAMS_PREFIX, btn_input.id.length - BUTTONS_POSTFIX));

//Count of Pokemon to show
const pkmn_to_show_input = document.getElementById("pkmnToShow");
var count_pkmn_to_show = usp.get("pkmnToShow");
if (count_pkmn_to_show == null || isNaN(count_pkmn_to_show))
	count_pkmn_to_show = pkmn_to_show_input.value;
else
	pkmn_to_show_input.value = count_pkmn_to_show;
//Characteristic to sort by
const sort_by_input = document.getElementById("sortBy");
var sort_by = usp.get("sortBy");
if (sort_by == null || sort_by.length == 0)
	sort_by = sort_by_input.value;
else
	sort_by_input.value = sort_by;
//Sorting direction
const sorting_direction_input = document.getElementById("sortingDirection");
var sorting_direction = usp.get("sortingDirection");
if (sorting_direction == null || sorting_direction.length == 0)
	sorting_direction = sorting_direction_input.value;
else
	sorting_direction_input.value = sorting_direction;

//Add event listeners to sorting input elements
pkmn_to_show_input.addEventListener("change", filter_element_value_change);
sort_by_input.addEventListener("change", filter_element_value_change);
sorting_direction_input.addEventListener("change", filter_element_value_change);

//Render
update_vis();
