import { writeFileSync, mkdirSync } from 'node:fs';
import { makeScene, poly, rect, ellipse, arc, bez, join, sparkle, heart } from './lib.mjs';

const C = {
	ink: '#3b2a1e',
	glass: '#e3f0ef',
	white: '#ffffff',
	amber: '#eba54a',
	amberLt: '#f4c27a',
	foam: '#fffaf0',
	foamShade: '#efe2c9',
	bitters: '#a12e1a',
	ice: '#f6fbff',
	steel: '#d3d8de',
	steelDk: '#a2abb5',
	syrup: '#f7e2a0',
	water: '#d9edf2',
	egg: '#f4dfc0',
	eggDk: '#e3c399',
	gold: '#dbae40',
	wood: '#e6bd85',
	woodDk: '#c8914f',
	woodEnd: '#f2d3a0',
	ring: '#b77a3c',
	saw: '#e2583a',
	sawDk: '#b8432a',
	black: '#4a3f36',
	moss: '#5da853',
	mossDk: '#3f8a38',
	tape: '#f5d25a',
	plum: '#916897',
	pencil: '#e0a33a'
};

const W = 440,
	H = 150,
	BASE = 146;

/** An outlined rod: a thick ink stroke with a thinner coloured stroke on top. */
function rod(s, pts, color, w = 2.6) {
	s.stroke(pts, { w: w + 2.4 });
	s.stroke(pts, { color, w, a: 0.25 });
}

/** A bar spoon from the bowl (inside a glass) to the teardrop end. */
function barSpoon(s, from, to) {
	const dx = to[0] - from[0],
		dy = to[1] - from[1];
	const len = Math.hypot(dx, dy);
	const u = [dx / len, dy / len],
		n = [-u[1], u[0]];
	// bowl
	s.shape(
		poly(
			[
				[from[0] - n[0] * 4, from[1] - n[1] * 4],
				[from[0] + u[0] * 12, from[1] + u[1] * 12],
				[from[0] + n[0] * 4, from[1] + n[1] * 4],
				[from[0] - u[0] * 3, from[1] - u[1] * 3]
			],
			3
		),
		{ fill: C.steel, w: 1.8 }
	);
	rod(s, [from, to], C.steel, 2.2);
	// the twist along the upper half
	for (let t = 0.42; t < 0.88; t += 0.045) {
		const p = [from[0] + dx * t, from[1] + dy * t];
		s.stroke(
			[
				[p[0] - n[0] * 2 + u[0] * 1.3, p[1] - n[1] * 2 + u[1] * 1.3],
				[p[0] + n[0] * 2 - u[0] * 1.3, p[1] + n[1] * 2 - u[1] * 1.3]
			],
			{ w: 1.2, a: 0 }
		);
	}
	// teardrop end
	const e = [to[0] + u[0] * 4, to[1] + u[1] * 4];
	s.shape(
		join(
			[[to[0] - u[0] * 1, to[1] - u[1] * 1]],
			bez(
				[to[0], to[1]],
				[e[0] + n[0] * 6, e[1] + n[1] * 6],
				[e[0] + u[0] * 6 + n[0] * 2, e[1] + u[1] * 6 + n[1] * 2],
				[e[0] + u[0] * 6, e[1] + u[1] * 6]
			),
			bez(
				[e[0] + u[0] * 6, e[1] + u[1] * 6],
				[e[0] + u[0] * 6 - n[0] * 2, e[1] + u[1] * 6 - n[1] * 2],
				[e[0] - n[0] * 6, e[1] - n[1] * 6],
				[to[0], to[1]]
			)
		),
		{ fill: C.steel, w: 1.8 }
	);
}

/** Lab beaker: body, rim, spout and graduation marks. Returns the inner bounds. */
function beaker(s, x, top, w, { liquid, level, spoon, ice = [] }) {
	const cx = x + w / 2;
	s.fill(rect(x, top, w, BASE - top, 6), C.glass, { a: 0.3 });
	if (spoon) barSpoon(s, spoon[0], spoon[1]);
	if (liquid) {
		s.fill(
			join(
				[
					[x + 3, level],
					[x + 3, BASE - 6]
				],
				arc(x + 9, BASE - 9, 6, 6, 180, 90),
				arc(x + w - 9, BASE - 9, 6, 6, 90, 0),
				[[x + w - 3, level]]
			),
			liquid,
			{ a: 0.3 }
		);
		s.raw('');
	}
	for (const [ix, iy, sz, rot] of ice) {
		const r = (rot * Math.PI) / 180;
		const pts = [
			[-1, -1],
			[1, -1],
			[1, 1],
			[-1, 1]
		].map(([a, b]) => [
			ix + (a * Math.cos(r) - b * Math.sin(r)) * sz,
			iy + (a * Math.sin(r) + b * Math.cos(r)) * sz
		]);
		s.shape(poly(pts, 3), { fill: C.ice, w: 1.8 });
	}
	if (liquid) s.stroke(arc(cx, level, w / 2 - 3, 3, 0, 180), { w: 1.6, color: C.ink });
	// glass walls and bottom
	s.stroke(
		poly(
			[
				[x, top],
				[x, BASE],
				[x + w, BASE],
				[x + w, top]
			],
			[0, 7, 7, 0],
			false
		)
	);
	s.shape(ellipse(cx, top, w / 2, 4), { fill: 'none' });
	// spout
	s.shape(
		poly(
			[
				[x + 1, top - 2],
				[x - 9, top - 6],
				[x - 1, top + 4]
			],
			2
		),
		{ fill: C.glass, w: 2 }
	);
	// graduations
	for (let i = 0, y = BASE - 14; y > top + 12; i++, y -= 11) {
		s.stroke(
			[
				[x + w - 4, y],
				[x + w - (i % 2 ? 10 : 16), y]
			],
			{ w: 1.5, a: 0.1 }
		);
	}
	// glint
	s.stroke(
		[
			[x + 7, top + 10],
			[x + 7, top + 24]
		],
		{ color: C.white, w: 2.4, a: 0 }
	);
}

function bar() {
	const s = makeScene({ width: W, height: H });

	s.group('beaker', () => {
		// Mixing beaker with ice and a bar spoon.
		beaker(s, 46, 58, 68, {
			liquid: C.amber,
			level: 94,
			spoon: [
				[82, 136],
				[124, 14]
			],
			ice: [
				[68, 96, 8, 12],
				[90, 101, 7, -14]
			]
		});
	});

	s.group('syrup', () => {
		// Small beaker of syrup.
		beaker(s, 134, 102, 40, { liquid: C.syrup, level: 120 });
	});

	s.group('coupe', () => {
		// Egg-white sour in a coupe.
		const cx = 248,
			ry = 8,
			rx = 44,
			cy = 70;
		const bowl = join(
			bez([cx - rx, cy], [cx - rx + 2, cy + 24], [cx - 20, cy + 35], [cx - 4, cy + 37]),
			[[cx + 4, cy + 37]],
			bez([cx + 4, cy + 37], [cx + 20, cy + 35], [cx + rx - 2, cy + 24], [cx + rx, cy]),
			arc(cx, cy, rx, ry, 0, 180)
		);
		s.fill(bowl, C.amber);
		// foam: the whole surface plus a collar below the front rim
		s.fill(
			join(
				arc(cx, cy, rx, ry, 180, 360),
				[[cx + rx - 1.5, cy + 9]],
				arc(cx, cy + 6, rx - 2.5, ry + 3, 0, 180),
				[[cx - rx + 1.5, cy + 9]]
			),
			C.foam
		);
		s.stroke(arc(cx, cy + 6, rx - 2.5, ry + 3, 15, 165), { color: C.foamShade, w: 2.4 });
		for (const [hx, hy] of [
			[cx - 15, cy - 1],
			[cx, cy + 0.5],
			[cx + 15, cy - 1]
		])
			s.shape(heart(hx, hy, 8, 0.6), { fill: C.bitters, stroke: 'none' });
		s.stroke(
			join(
				bez([cx - rx, cy], [cx - rx + 2, cy + 24], [cx - 20, cy + 35], [cx - 4, cy + 37]),
				[[cx + 4, cy + 37]],
				bez([cx + 4, cy + 37], [cx + 20, cy + 35], [cx + rx - 2, cy + 24], [cx + rx, cy])
			)
		);
		s.shape(ellipse(cx, cy, rx, ry), { fill: 'none' });
		s.stroke(bez([cx - 36, cy + 14], [cx - 33, cy + 22], [cx - 26, cy + 28], [cx - 18, cy + 31]), {
			color: C.white,
			w: 2.4,
			a: 0
		});
		rod(
			s,
			[
				[cx, cy + 37],
				[cx, BASE - 5]
			],
			C.glass,
			3.4
		);
		s.shape(ellipse(cx, BASE - 4, 22, 4), { fill: C.glass });
	});

	s.group('egg', () => {
		// An egg and half a shell.
		const ex = 322;
		s.shape(
			join(
				bez([ex, 112], [ex + 9, 112], [ex + 14, 128], [ex + 14, 133]),
				bez([ex + 14, 133], [ex + 14, 141], [ex + 8, BASE], [ex, BASE]),
				bez([ex, BASE], [ex - 8, BASE], [ex - 14, 141], [ex - 14, 133]),
				bez([ex - 14, 133], [ex - 14, 128], [ex - 9, 112], [ex, 112])
			),
			{ fill: C.egg }
		);
		s.stroke(
			[
				[ex - 6, 121],
				[ex - 8, 127]
			],
			{ color: C.white, w: 2.4, a: 0 }
		);
		const sx = 342;
		s.shape(
			join(bez([sx, 130], [sx, 146], [sx + 30, 146], [sx + 30, 130]), [
				[sx + 26, 126],
				[sx + 22, 131],
				[sx + 18, 125],
				[sx + 14, 131],
				[sx + 10, 126],
				[sx + 6, 131],
				[sx + 3, 126]
			]),
			{ fill: C.egg }
		);
	});

	s.group('spoons', () => {
		// Spoon holder with two bar spoons.
		s.fill(rect(388, 106, 28, BASE - 106, 5), C.glass, { a: 0.3 });
		barSpoon(s, [397, 138], [384, 30]);
		barSpoon(s, [408, 138], [424, 38]);
		s.fill(rect(390, 120, 24, BASE - 123, 4), C.water, { a: 0.3 });
		s.stroke(arc(402, 120, 12, 2.5, 0, 180), { w: 1.5 });
		s.stroke(
			poly(
				[
					[388, 106],
					[389, BASE],
					[415, BASE],
					[416, 106]
				],
				[0, 6, 6, 0],
				false
			)
		);
		s.shape(ellipse(402, 106, 14, 3.2), { fill: 'none' });
	});

	// Sticker only: an old fashioned, drawn off to the side of the scene.
	s.group('rocks', () => {
		s.fill(rect(600, 92, 60, 54, 6), C.glass, { a: 0.3 });
		s.fill(rect(603, 108, 54, 35, 5), C.amber, { a: 0.3 });
		const r = (9 * Math.PI) / 180;
		s.shape(
			poly(
				[
					[-1, -1],
					[1, -1],
					[1, 1],
					[-1, 1]
				].map(([a, b]) => [
					626 + (a * Math.cos(r) - b * Math.sin(r)) * 14,
					112 + (a * Math.sin(r) + b * Math.cos(r)) * 14
				]),
				4
			),
			{ fill: C.ice, w: 1.8 }
		);
		s.stroke(arc(630, 108, 27, 3, 0, 180), { w: 1.6 });
		rod(s, join(bez([640, 82], [652, 78], [662, 88], [656, 104])), '#f29a3a', 4.5);
		s.stroke(
			poly(
				[
					[600, 90],
					[602, BASE],
					[658, BASE],
					[660, 90]
				],
				[0, 6, 6, 0],
				false
			)
		);
		s.stroke(
			[
				[604, BASE - 7],
				[656, BASE - 7]
			],
			{ w: 1.6 }
		);
		s.shape(ellipse(630, 90, 30, 4), { fill: 'none' });
		s.stroke(
			[
				[607, 100],
				[607, 122]
			],
			{ color: C.white, w: 2.4, a: 0 }
		);
	});

	// Sparkles.
	s.group('coupe', () => s.shape(sparkle(300, 52, 7), { fill: C.gold, w: 1.8 }));
	s.shape(sparkle(195, 56, 4.5), { fill: C.gold, w: 1.6 });
	s.shape(sparkle(306, 88, 3.5), { fill: C.gold, w: 1.4 });

	return s;
}

/** A board seen from the front, end grain on the left. */
function board(s, x, y, len, h, { face = C.wood, end = C.woodEnd, knot } = {}) {
	s.shape(rect(x + 14, y, len - 14, h, 2), { fill: face });
	s.stroke(
		join(
			bez(
				[x + 22, y + h * 0.36],
				[x + len * 0.35, y + h * 0.28],
				[x + len * 0.5, y + h * 0.48],
				[x + len * 0.78, y + h * 0.38]
			)
		),
		{ color: C.woodDk, w: 1.4 }
	);
	s.stroke(
		join(
			bez(
				[x + len * 0.3, y + h * 0.7],
				[x + len * 0.5, y + h * 0.62],
				[x + len * 0.7, y + h * 0.78],
				[x + len - 8, y + h * 0.68]
			)
		),
		{ color: C.woodDk, w: 1.4 }
	);
	if (knot) s.shape(ellipse(x + knot, y + h * 0.55, 3.2, 2), { fill: C.woodDk, w: 1.4 });
	s.shape(rect(x, y, 14, h, 2), { fill: end });
	for (const r of [4, 8])
		s.stroke(arc(x + 3, y + h - 3, r, r, -90, 0), { color: C.ring, w: 1.3, a: 0.2 });
}

function construction() {
	const s = makeScene({ width: W, height: H });

	s.group('lumber', () => {
		// Lumber stack, a little uneven, with a carpenter's pencil on top.
		board(s, 24, 124, 172, 22, { knot: 120 });
		board(s, 34, 102, 156, 22, { knot: 70 });
		board(s, 28, 80, 146, 22, { knot: 132 });
		s.shape(rect(70, 72, 50, 8, 2), { fill: C.pencil, w: 2 });
		s.shape(
			poly(
				[
					[120, 72],
					[132, 76],
					[120, 80]
				],
				1
			),
			{ fill: C.woodEnd, w: 2 }
		);
		s.dot(131, 76, 1.6);
	});

	// The plank being cut.
	board(s, 206, 126, 228, 20, { knot: 196 });

	s.group('saw', () => {
		// Seen from the motor side: guard behind, motor end cap in front, blade below the shoe.
		const bx = 294,
			by = 120;
		const teeth = [];
		for (let a = 0; a < 360; a += 12) {
			teeth.push(arc(bx, by, 22, 22, a, a, 1)[0]);
			teeth.push(arc(bx, by, 25.5, 25.5, a + 7, a + 7, 1)[0]);
		}
		s.shape(teeth, { fill: C.steel, w: 1.8, a: 0.15 });
		s.stroke(arc(bx, by, 15, 15, 30, 150), { color: C.steelDk, w: 2, a: 0.1 });

		// Upper guard.
		s.shape(join(arc(bx, by, 34, 34, 180, 360)), { fill: C.steelDk });

		// Body and handle.
		s.shape(rect(300, 84, 58, 38, 12), { fill: C.saw });
		const handle = join(
			bez([318, 86], [318, 60], [330, 50], [344, 50]),
			bez([344, 50], [360, 50], [368, 64], [362, 88])
		);
		s.stroke(handle, { w: 13.5 });
		s.stroke(handle, { color: C.saw, w: 9, a: 0.15 });
		s.shape(rect(334, 57, 7, 11, 3), { fill: C.black, w: 1.8 });

		// Motor end cap with vents.
		s.shape(ellipse(318, 100, 21, 21), { fill: C.saw });
		s.shape(ellipse(318, 100, 13, 13), { fill: C.sawDk, w: 2 });
		s.shape(ellipse(318, 100, 5.5, 5.5), { fill: C.black, w: 1.8 });
		for (const a of [200, 235, 270, 305, 340])
			s.stroke(arc(318, 100, 17, 17, a - 8, a + 8, 4), { color: C.ink, w: 1.8, a: 0 });

		// Front knob.
		s.shape(rect(260, 80, 16, 13, 5), { fill: C.black });
		rod(
			s,
			[
				[268, 93],
				[270, 96]
			],
			C.black,
			4
		);

		// Shoe.
		s.shape(rect(248, 120, 124, 6, 2), { fill: C.steel, w: 2 });

		// Cord.
		const cord = join(
			bez([364, 74], [388, 70], [402, 92], [396, 104]),
			bez([396, 104], [390, 116], [408, 124], [428, 116])
		);
		rod(s, cord, C.black, 3.4);
	});

	// Sawdust flying off the front of the blade.
	s.shape(join(bez([226, 126], [229, 119], [240, 118], [246, 126])), { fill: C.woodEnd, w: 1.6 });
	s.group('saw', () => {
		for (const [x, y, r] of [
			[262, 115, 1.7],
			[254, 108, 1.4],
			[248, 116, 1.3],
			[242, 109, 1.1],
			[256, 100, 1],
			[236, 114, 1.2]
		])
			s.dot(x, y, r, C.woodDk);
	});

	return s;
}

/** Draws through s with every point moved by (dx, dy). */
function shifted(s, dx, dy) {
	const m = (pts) => pts.map(([x, y]) => [x + dx, y + dy]);
	return {
		shape: (p, o) => s.shape(m(p), o),
		fill: (p, c, o) => s.fill(m(p), c, o),
		stroke: (p, o) => s.stroke(m(p), o),
		dot: (x, y, r, c) => s.dot(x + dx, y + dy, r, c)
	};
}

function drawChisel(s) {
	// Chisel resting on the board.
	s.shape(
		join(
			bez([78, 113], [60, 111], [40, 110], [32, 113]),
			bez([32, 113], [26, 116], [26, 121], [32, 124]),
			bez([32, 124], [40, 127], [60, 126], [78, 124])
		),
		{ fill: C.woodDk }
	);
	s.stroke(
		[
			[42, 116],
			[68, 115]
		],
		{ color: '#e3b57a', w: 2, a: 0.2 }
	);
	s.shape(rect(76, 112, 8, 13, 2), { fill: C.gold, w: 2 });
	s.shape(rect(84, 115, 6, 7, 1), { fill: C.steelDk, w: 1.8 });
	s.shape(
		poly(
			[
				[90, 115.5],
				[114, 115.5],
				[122, 124],
				[90, 124]
			],
			1
		),
		{ fill: C.steel, w: 2 }
	);
	s.stroke(
		[
			[95, 119],
			[110, 119]
		],
		{ color: C.white, w: 1.6, a: 0 }
	);
}

function drawShavings(s, spots) {
	for (const [x, y, sc] of spots)
		s.shape(
			join(
				bez(
					[x - 9 * sc, y + 6 * sc],
					[x - 12 * sc, y - 6 * sc],
					[x + 8 * sc, y - 9 * sc],
					[x + 9 * sc, y]
				),
				bez(
					[x + 9 * sc, y],
					[x + 9 * sc, y + 6 * sc],
					[x - 2 * sc, y + 8 * sc],
					[x - 3 * sc, y + 2 * sc]
				),
				bez(
					[x - 3 * sc, y + 2 * sc],
					[x - 3 * sc, y - 2 * sc],
					[x + 3 * sc, y - 2 * sc],
					[x + 4 * sc, y + 1 * sc]
				)
			),
			{ fill: C.woodEnd, w: 1.6, closed: false }
		);
}

function atlas() {
	const s = makeScene({ width: W, height: H });

	// The workpiece, with a pencil mark.
	board(s, 22, 124, 244, 22, { face: '#e9c48f', knot: 214 });
	s.stroke(
		[
			[176, 127],
			[176, 143]
		],
		{ w: 1.6 }
	);
	s.stroke(
		[
			[171, 127],
			[176, 133],
			[181, 127]
		],
		{ w: 1.6 }
	);

	s.group('chisel', () => drawChisel(s));

	s.group('square', () => {
		// Combination square standing on the board: blade first, head over it.
		s.shape(rect(150, 20, 11, 100, 1.5), { fill: C.steel, w: 2 });
		for (let i = 0, y = 26; y < 100; i++, y += 5)
			s.stroke(
				[
					[150, y],
					[150 + (i % 4 === 0 ? 7 : i % 2 === 0 ? 5 : 3), y]
				],
				{ w: 1.1, a: 0 }
			);
		s.shape(
			poly(
				[
					[132, 98],
					[166, 98],
					[178, 110],
					[178, 124],
					[132, 124]
				],
				3
			),
			{ fill: C.plum }
		);
		s.shape(rect(139, 105, 16, 7, 3), { fill: '#d3eaa4', w: 1.6 });
		s.dot(149, 108.5, 1.8, C.white);
		s.shape(ellipse(170, 117, 3.4, 3.4), { fill: C.steelDk, w: 1.6 });
	});

	s.group('shavings', () =>
		drawShavings(s, [
			[204, 117, 1],
			[226, 119, 0.8],
			[244, 116, 0.65]
		])
	);

	// Sticker: the chisel on its own offcut with a few shavings, drawn off to the side of
	// the scene so it only appears as an icon.
	s.group('chiselboard', () => {
		const o = shifted(s, 600, 0);
		board(o, 14, 124, 140, 22, { face: '#e9c48f', knot: 118 });
		drawChisel(o);
		drawShavings(o, [
			[134, 116, 0.85],
			[150, 117, 0.6]
		]);
	});

	s.group('tape', () => {
		// Tape measure, tape pulled out to the right.
		s.shape(
			poly(
				[
					[340, 136],
					[408, 136],
					[408, 143],
					[340, 143]
				],
				0.5
			),
			{ fill: C.tape, w: 1.8 }
		);
		for (let i = 0, x = 346; x < 404; i++, x += 4)
			s.stroke(
				[
					[x, 136],
					[x, 136 + (i % 4 === 0 ? 4.5 : 2.5)]
				],
				{ w: 1, a: 0 }
			);
		s.shape(rect(406, 128, 5, 18, 1.5), { fill: C.black, w: 1.6 });
		s.shape(rect(286, 88, 62, 58, 16), { fill: C.moss });
		s.shape(ellipse(315, 117, 14, 14), { fill: C.mossDk, w: 2 });
		s.dot(315, 117, 3, C.ink);
		s.shape(rect(306, 82, 18, 7, 2.5), { fill: C.black, w: 1.8 });
		s.stroke(
			[
				[294, 98],
				[294, 112]
			],
			{ color: '#9ad08f', w: 2.4, a: 0 }
		);
	});

	// One sparkle, for the fresh cut.
	s.shape(sparkle(196, 40, 6), { fill: C.gold, w: 1.8 });
	s.shape(sparkle(124, 72, 3.5), { fill: C.gold, w: 1.4 });

	return s;
}

// usage: node scenes.mjs --icons static/illustrations [--scenes <dir>]
// Icons are single objects cropped to their own bounds: the stickers on the live site's
// job cards. Scenes are the full still lifes, used by the Hybrid mockup.
const arg = (flag) => {
	const i = process.argv.indexOf(flag);
	return i > -1 ? process.argv[i + 1] : undefined;
};
const scenes = { bar: bar(), saw: construction(), bench: atlas() };
const sceneOut = arg('--scenes');
if (sceneOut) {
	mkdirSync(sceneOut, { recursive: true });
	for (const [name, s] of Object.entries(scenes)) writeFileSync(`${sceneOut}/${name}.svg`, s.svg());
}
const iconOut = arg('--icons');
if (iconOut) {
	mkdirSync(iconOut, { recursive: true });
	const icons = {
		bar: ['beaker', 'coupe', 'egg', 'spoons', 'rocks'],
		saw: ['lumber', 'saw'],
		bench: ['chiselboard', 'square', 'tape']
	};
	for (const [scene, names] of Object.entries(icons))
		for (const name of names) writeFileSync(`${iconOut}/${name}.svg`, scenes[scene].icon(name));
}
if (!sceneOut && !iconOut) console.log('usage: node scenes.mjs --icons <dir> [--scenes <dir>]');
