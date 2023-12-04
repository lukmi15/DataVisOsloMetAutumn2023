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


//Pad numbers with zeros
//Source: https://stackoverflow.com/questions/6220693/string-format-in-javascript
function zeroPad(nr, base)
{
	var len = (String(base).length - String(nr).length)+1;
	return len > 0? new Array(len).join('0')+nr : nr;
}

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

//Update visualization
function update_vis()
{

	//Filter by the requested characteristics
	//Creates a list of objects. The objects represend a chosen characteristic and includes every Pokemon's data for this characteristic
	var bubble_data_arr = []
	var usp = new URLSearchParams(window.location.search);
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
	console.debug(bubble_data_arr)

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
		const center_x = svg.attr('width') / 2;
		const center_y = svg.attr('height') / 2;

		//Cirlcular pattern
		const angleStep = (2 * Math.PI) / bubble_data_arr.length;

		//Draw lines from bubbles to the center
		svg.selectAll('line')
			.data(bubble_data_arr)
			.enter()
			.append('line')
			.attr('class', 'line')
			.attr('x1', center_x)
			.attr('y1', center_y)
			.attr('x2', (d, i) => center_x + Math.cos(i * angleStep) * SPRITE_WIDTH)
			.attr('y2', (d, i) => center_y + Math.sin(i * angleStep) * SPRITE_HEIGHT);

		//Create circles for each data point in a circular pattern
		var bubbles = svg.selectAll('circle').data(bubble_data_arr).enter()
		bubbles.append('circle')
			.attr('class', d => "bubble " + d.name + "_bubble")
			.attr('cx', (d, i) => center_x + Math.cos(i * angleStep) * SPRITE_WIDTH)
			.attr('cy', (d, i) => center_y + Math.sin(i * angleStep) * SPRITE_HEIGHT)
			.attr('r', d => Math.sqrt(d.radius_scale(d.values[j])))
			.attr('title', d => document.getElementById("show_" + d.name + "_btn").innerHTML + ": " + d.values[j] + "\n")
			.attr('index', j)
			.on('mouseover', showTooltip)
			.on('mouseout', hideTooltip);

		//Add an image to the center
		svg.append('image')
			.attr('class', 'bubble_img')
			.attr('x', center_x - SPRITE_WIDTH/2)
			.attr('y', center_y - SPRITE_HEIGHT/2)
			.attr('width', SPRITE_WIDTH)
			.attr('height', SPRITE_HEIGHT)
			.attr('xlink:href', 'sprites/' + pokeid2spritepath(j))
			.attr('title', get_description_of_pkmn(j))
			.style('cursor', 'pointer')
			.on('click', showCharacteristicsTooltip);

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
