/*JavaScript for the exam project of Data Visualization in the autumn semester of 2023 at Oslo Metropolitan University
Author(s)		: Lukas Mirow
Date of creation	: 2023-12-03
*/


const PARAMS = ["show_attack", "show_base_egg_steps", "show_base_happiness", "show_capture_rate", "show_defense", "show_experience_growth", "show_height_m", "show_hp", "show_percentage_male", "show_sp_attack", "show_sp_defense", "show_speed", "show_weight_kg"];
const SPRITE_WIDTH = 100;
const SPRITE_HEIGHT = 100;
const MIN_BUBBLE_SIZE = 10;
const MAX_BUBBLE_SIZE = 25;
const PARAMS_PREFIX = 5;
const BUTTONS_POSTFIX = 4;


//Update visualization
function update_vis()
{

	//Count params to visualize
	var usp = new URLSearchParams(window.location.search);
	var bubble_count = 0;
	for (const param of PARAMS)
		if (usp.get(param) == "true")
			bubble_count++;

	//Filter by the requested characteristics
	//Creates a list of objects. The objects represend a chosen characteristic and includes every Pokemon's data for this characteristic
	var bubble_data_arr = []
	for (const param of PARAMS)
	{
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

	//Create a D3 scales for mapping data values to bubble sizes
	for (var i = 0; i < bubble_data_arr.length; i++)
		bubble_data_arr[i].radius_scale = d3.scaleLinear()
			.domain([0, d3.max(bubble_data_arr[i].values)])
			.range([MIN_BUBBLE_SIZE, MAX_BUBBLE_SIZE]);
	console.debug(bubble_data_arr)

	//Select the SVG container
	const svg = d3.select('#bubble-chart');

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
	svg.selectAll('circle')
		.data(bubble_data_arr)
		.enter()
		.append('circle')
		.attr('class', 'bubble')
		.attr('cx', (d, i) => center_x + Math.cos(i * angleStep) * SPRITE_WIDTH)
		.attr('cy', (d, i) => center_y + Math.sin(i * angleStep) * SPRITE_HEIGHT)
		.attr('r', d => d.radius_scale(d.values[i]));

	//Add an image to the center
	svg.append('image')
		.attr('x', center_x - SPRITE_WIDTH/2) // Adjust the positioning as needed
		.attr('y', center_y - SPRITE_HEIGHT/2) // Adjust the positioning as needed
		.attr('width', SPRITE_WIDTH)
		.attr('height', SPRITE_HEIGHT)
		.attr('xlink:href', 'sprites/poke_capture_0258_000_mf_n_00000000_f_n.png');
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
