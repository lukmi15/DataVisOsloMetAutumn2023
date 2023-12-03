/*JavaScript for the exam project of Data Visualization in the autumn semester of 2023 at Oslo Metropolitan University
Author(s)		: Lukas Mirow
Date of creation	: 2023-12-03
*/


const PARAMS = ["show_attack", "show_base_egg_steps", "show_base_happiness", "show_capture_rate", "show_defense", "show_experience_growth", "show_height_m", "show_hp", "show_percentage_male", "show_sp_attack", "show_sp_defense", "show_speed", "show_weight_kg"];
const SPRITE_WIDTH = 100;
const SPRITE_HEIGHT = 100;
const MIN_BUBBLE_SIZE = 10;
const MAX_BUBBLE_SIZE = 50;
const PARAMS_PREFIX = 5;
const BUTTONS_POSTFIX = 3;


//Data
const data =
[
	{"attack": 70, "base_egg_steps": 5120, "base_happiness": 70, "capture_rate": 45, "defense": 50, "experience_growth": 1059860, "height_m": 0.4, "hp": 50, "percentage_male": 88.1, "sp_attack": 50, "sp_defense": 50, "speed": 40, "weight_kg": 7.6},
	{"attack": 85, "base_egg_steps": 5120, "base_happiness": 70, "capture_rate": 45, "defense": 70, "experience_growth": 1059860, "height_m": 0.7, "hp": 70, "percentage_male": 88.1, "sp_attack": 60, "sp_defense": 70, "speed": 50, "weight_kg": 28.0},
	{"attack": 150, "base_egg_steps": 5120, "base_happiness": 70, "capture_rate": 45, "defense": 110, "experience_growth": 1059860, "height_m": 1.5, "hp": 100, "percentage_male": 88.1, "sp_attack": 95, "sp_defense": 110, "speed": 70, "weight_kg": 81.9},
	{"attack": 55, "base_egg_steps": 3840, "base_happiness": 70, "capture_rate": 255, "defense": 35, "experience_growth": 1000000, "height_m": 0.5, "hp": 35, "percentage_male": 50.0, "sp_attack": 30, "sp_defense": 30, "speed": 35, "weight_kg": 13.6},
	{"attack": 90, "base_egg_steps": 3840, "base_happiness": 70, "capture_rate": 127, "defense": 70, "experience_growth": 1000000, "height_m": 1.0, "hp": 70, "percentage_male": 50.0, "sp_attack": 60, "sp_defense": 60, "speed": 70, "weight_kg": 37.0},
];

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
	var bubble_data_arr = []
	for (const param of PARAMS)
	{
		const characteristic = param.substring(5);
		bubble_data_arr.push
		(
			{
				name: characteristic,
				value: data[characteristic]
			}
		);
	}

	//Create a D3 scales for mapping data values to bubble sizes
	var bubble_vals = []
	for (const bubble_data of bubble_data_arr)
		bubble_vals.push(bubble_data.value);
	for (var i = 0; i < bubble_data_arr.length; i++)
		bubble_data_arr[i].radius_scale = d3.scaleLinear()
			.domain([0, d3.max(bubble_vals, d => d.value)])
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
		.attr('x2', (d, i) => center_x + Math.cos(i * angleStep) * (d.radius_scale(d.value) + SPRITE_WIDTH/10))
		.attr('y2', (d, i) => center_y + Math.sin(i * angleStep) * (d.radius_scale(d.value) + SPRITE_HEIGHT/10));

	//Create circles for each data point in a circular pattern
	svg.selectAll('circle')
		.data(bubble_data_arr)
		.enter()
		.append('circle')
		.attr('class', 'bubble')
		.attr('cx', (d, i) => center_x + Math.cos(i * angleStep) * SPRITE_WIDTH)
		.attr('cy', (d, i) => center_y + Math.sin(i * angleStep) * SPRITE_HEIGHT)
		.attr('r', d => d.radius_scale(d.value));

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
