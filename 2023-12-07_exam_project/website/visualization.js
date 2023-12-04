/*JavaScript for the exam project of Data Visualization in the autumn semester of 2023 at Oslo Metropolitan University
Author(s)		: Lukas Mirow
Date of creation	: 2023-12-03
*/


const PARAMS = ["show_attack", "show_base_egg_steps", "show_base_happiness", "show_capture_rate", "show_defense", "show_experience_growth", "show_height_m", "show_hp", "show_percentage_male", "show_sp_attack", "show_sp_defense", "show_speed", "show_weight_kg"];
const SPRITE_WIDTH = 100;
const SPRITE_HEIGHT = 100;
const MIN_BUBBLE_SIZE = 25;
const MAX_BUBBLE_SIZE = 250;
const PARAMS_PREFIX = 5;
const BUTTONS_POSTFIX = 4;
const VISUALIZATION_CONTAINER_ID = "bubble_charts"


//Create description of a pokemn by pokeid, will be shown when the sprite is clicked
function get_description_of_pkmn(pokeid)
{
	const pkmn = DATA[pokeid];
	ret = "Name: " + pkmn.name + "\n";
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

//Update visualization
function update_vis()
{

	//Filter by the requested characteristics
	//Creates a list of objects. The objects represend a chosen characteristic and includes every Pokemon's data for this characteristic
	var bubble_data_arr = []
	var usp = new URLSearchParams(window.location.search);
	const count_pkmn = usp.get("pkmnToShow")
	for (const param of PARAMS)
	{
		if (usp.get(param) != "true")
			continue;
		const characteristic = param.substring(PARAMS_PREFIX);
		const pkmn_characteristic = DATA.map(pkmn => pkmn[characteristic]);
		bubble_data_arr.push
		(
			{
				name: characteristic,
				values: pkmn_characteristic,
			}
		);
	}

	//Create D3 scales for mapping data values to bubble sizes
	for (var i = 0; i < bubble_data_arr.length; i++)
		bubble_data_arr[i].radius_scale = d3.scaleLinear()
			.domain([0, d3.max(bubble_data_arr[i].values)])
			.range([MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE]);

	//Create visualizations
	/* for (var j = 0; j < DATA.length; j++) */
	for (var j = 0; j < 50; j++)
	{

		//Create and select an SVG container
		document.getElementById(VISUALIZATION_CONTAINER_ID).innerHTML += '<svg id="bubble_chart_' + j + '" class="bubble_chart" width="300" height="300"></svg>';
		const svg = d3.select('#bubble_chart_' + j);

		//Remove any existing elements
		svg.selectAll('*').remove();

		//Get the center coordinates of the chart
		const center_x = svg.attr("width") / 2;
		const center_y = svg.attr("height") / 2;

		//Cirlcular pattern
		const angle_step = (2 * Math.PI) / bubble_data_arr.length;

		//Draw lines and bubbles
		for (var i = 0; i < bubble_data_arr.length; i++)
		{

			//Draw lines from bubbles to the center
			var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
			line.setAttribute("class", "line");
			line.setAttribute("x1", center_x);
			line.setAttribute("y1", center_y);
			line.setAttribute("x2", calc_center_x_of_circle(center_x, angle_step, i));
			line.setAttribute("y2", calc_center_y_of_circle(center_y, angle_step, i));
			svg.node().appendChild(line);

			//Create circles for each data point in a circular pattern
			const pkmn_obj = bubble_data_arr[i];
			var bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			bubble.setAttribute("class", "bubble " + pkmn_obj.name + "_bubble");
			bubble.setAttribute("cx", calc_center_x_of_circle(center_x, angle_step, i));
			bubble.setAttribute("cy", calc_center_y_of_circle(center_y, angle_step, i));
			bubble.setAttribute("r", Math.sqrt(pkmn_obj.radius_scale(pkmn_obj.values[j])));
			bubble.setAttribute("title", document.getElementById("show_" + pkmn_obj.name + "_btn").innerHTML + ": " + pkmn_obj.values[j] + "\n");
			bubble.addEventListener("mouseover", showTooltip);
			bubble.addEventListener("mouseout", hideTooltip);
			svg.node().appendChild(bubble);

		}

		//Add an image to the center
		var bubble_img = document.createElementNS("http://www.w3.org/2000/svg", "image");
		bubble_img.setAttribute("class", "bubble_img");
		bubble_img.setAttribute("x", center_x - SPRITE_WIDTH/2);
		bubble_img.setAttribute("y", center_y - SPRITE_HEIGHT/2);
		bubble_img.setAttribute("width", SPRITE_WIDTH);
		bubble_img.setAttribute("height", SPRITE_HEIGHT);
		bubble_img.setAttribute("xlink:href", "sprites/" + pokeid2spritepath(j));
		bubble_img.setAttribute("title", get_description_of_pkmn(j));
		bubble_img.style.cursor = "pointer";
		bubble_img.addEventListener("click", showCharacteristicsTooltip);
		svg.node().appendChild(bubble_img);

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

//Update parameter values on button presses
function btn_pressed(caller)
{
	var usp = new URLSearchParams(window.location.search);
	const ID = caller.id.substring(0, caller.id.length - BUTTONS_POSTFIX);
	var value = (usp.get(ID) == "true");
	usp.set(ID, !value);
	window.location.search = "?" + usp.toString();
}


// Add event listeners to the container element
document.getElementById('bubble_charts').addEventListener
(
	'mouseover',
	function (event)
	{
		if (event.target.classList.contains('bubble'))
			showTooltip(event);
	}
);
document.getElementById('bubble_charts').addEventListener
(
	'mouseout',
	function (event)
	{
		if (event.target.classList.contains('bubble'))
			hideTooltip();
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

//Adjust button colors according to if they are pressed or not
var usp = new URLSearchParams(window.location.search);
for (const param of PARAMS)
{
	if (usp.get(param) == "true")
		document.getElementById(param + "_btn").classList.add("on")
}
