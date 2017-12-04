import AxisChart from './AxisChart';
import { makeSVGGroup, makePath, makeGradient } from '../utils/draw';

export default class LineChart extends AxisChart {
	constructor(args) {
		super(args);
		this.type = 'line';

		if(Object.getPrototypeOf(this) !== LineChart.prototype) {
			return;
		}

		this.setup();
	}

	configure(args) {
		super.configure(args);
		this.config.xAxisMode = args.xAxisMode || 'span';
		this.config.yAxisMode = args.yAxisMode || 'span';

		this.config.dotRadius = args.dotRadius || 4;

		this.config.heatline = args.heatline || 0;
		this.config.regionFill = args.regionFill || 0;
		this.config.showDots = args.showDots || 1;
	}

	configUnits() {
		this.state.unitArgs = {
			type: 'dot',
			args: { radius: this.config.dotRadius }
		};
	}

	setupPreUnitLayers() {
		// Path groups
		this.paths_groups = [];
		this.y.map((d, i) => {
			this.paths_groups[i] = makeSVGGroup(
				this.drawArea,
				'path-group path-group-' + i
			);
		});
	}

	makeDatasetUnits(x_values, y_values, color, dataset_index,
		no_of_datasets, units_group, units_array, unit) {
		if(this.showDots) {
			super.makeDatasetUnits(x_values, y_values, color, dataset_index,
				no_of_datasets, units_group, units_array, unit);
		}
	}

	make_paths() {
		this.y.map(d => {
			this.make_path(d, this.xAxisPositions, d.yUnitPositions, d.color || this.colors[d.index]);
		});
	}

	make_path(d, x_positions, y_positions, color) {
		let points_list = y_positions.map((y, i) => (x_positions[i] + ',' + y));
		let points_str = points_list.join("L");

		this.paths_groups[d.index].textContent = '';

		d.path = makePath("M"+points_str, 'line-graph-path', color);
		this.paths_groups[d.index].appendChild(d.path);

		if(this.heatline) {
			let gradient_id = makeGradient(this.svg_defs, color);
			d.path.style.stroke = `url(#${gradient_id})`;
		}

		if(this.regionFill) {
			this.fill_region_for_dataset(d, color, points_str);
		}
	}

	fill_region_for_dataset(d, color, points_str) {
		let gradient_id = makeGradient(this.svg_defs, color, true);
		let pathStr = "M" + `0,${this.zeroLine}L` + points_str + `L${this.width},${this.zeroLine}`;

		d.regionPath = makePath(pathStr, `region-fill`, 'none', `url(#${gradient_id})`);
		this.paths_groups[d.index].appendChild(d.regionPath);
	}
}
