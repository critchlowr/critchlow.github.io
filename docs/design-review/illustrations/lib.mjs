// Tiny hand-drawn SVG kit: build point lists from primitives, then wobble and
// smooth them into paths so every line looks inked by hand.

export function rng(seed) {
	let s = seed >>> 0 || 1;
	return () => {
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		return (s >>> 0) / 4294967296;
	};
}

const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export const line = (a, b) => [a, b];

export function bez(p0, p1, p2, p3, n = 20) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n,
			u = 1 - t;
		out.push([
			u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
			u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
		]);
	}
	return out;
}

export function quad(p0, p1, p2, n = 12) {
	const out = [];
	for (let i = 0; i <= n; i++) {
		const t = i / n,
			u = 1 - t;
		out.push([
			u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
			u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]
		]);
	}
	return out;
}

/** Elliptical arc, angles in degrees, 0 = +x, 90 = +y (down). */
export function arc(cx, cy, rx, ry, a0, a1, n) {
	n ??= Math.max(8, Math.ceil(Math.abs(a1 - a0) / 6));
	const out = [];
	for (let i = 0; i <= n; i++) {
		const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
		out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
	}
	return out;
}

export const ellipse = (cx, cy, rx, ry) => arc(cx, cy, rx, ry, 0, 360).slice(0, -1);

/** Polygon with rounded corners; r may be a number or an array per vertex. */
export function poly(pts, r = 0, closed = true) {
	const out = [];
	const n = pts.length;
	for (let i = 0; i < n; i++) {
		const p = pts[i];
		const rr = Array.isArray(r) ? r[i] : r;
		const isEnd = !closed && (i === 0 || i === n - 1);
		if (!rr || isEnd) {
			out.push(p);
			continue;
		}
		const prev = pts[(i - 1 + n) % n],
			next = pts[(i + 1) % n];
		const d1 = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
		const d2 = Math.hypot(next[0] - p[0], next[1] - p[1]);
		const k1 = Math.min(rr, d1 / 2) / d1,
			k2 = Math.min(rr, d2 / 2) / d2;
		const a = lerp(p, prev, k1),
			b = lerp(p, next, k2);
		out.push(...quad(a, p, b, 6));
	}
	return out;
}

export const rect = (x, y, w, h, r = 0) =>
	poly(
		[
			[x, y],
			[x + w, y],
			[x + w, y + h],
			[x, y + h]
		],
		r
	);

/** Join segments into one point list, dropping duplicate joints. */
export function join(...segs) {
	const out = [];
	for (const s of segs)
		for (const p of s) {
			const last = out[out.length - 1];
			if (last && Math.hypot(last[0] - p[0], last[1] - p[1]) < 0.01) continue;
			out.push(p);
		}
	return out;
}

function resample(pts, closed, step) {
	const src = closed ? [...pts, pts[0]] : pts;
	const out = [];
	for (let i = 0; i < src.length - 1; i++) {
		const a = src[i],
			b = src[i + 1];
		const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
		const k = Math.max(1, Math.round(d / step));
		for (let j = 0; j < k; j++) out.push(lerp(a, b, j / k));
	}
	if (!closed) out.push(src[src.length - 1]);
	return out;
}

function wobble(pts, closed, amp, seed) {
	if (amp <= 0) return pts;
	const r = rng(seed);
	const n = pts.length;
	// Arc length at each point.
	const s = [0];
	for (let i = 1; i < n; i++)
		s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
	const L =
		s[n - 1] + (closed ? Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]) : 0);
	const f1 = closed ? (2 * Math.PI * Math.max(1, Math.round(L / 70))) / L : (2 * Math.PI) / 70;
	const f2 = closed ? (2 * Math.PI * Math.max(2, Math.round(L / 26))) / L : (2 * Math.PI) / 26;
	const ph1 = r() * 6.28,
		ph2 = r() * 6.28;
	return pts.map((p, i) => {
		const prev = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
		const next = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
		let tx = next[0] - prev[0],
			ty = next[1] - prev[1];
		const tl = Math.hypot(tx, ty) || 1;
		const nx = -ty / tl,
			ny = tx / tl;
		const o = amp * (0.65 * Math.sin(s[i] * f1 + ph1) + 0.35 * Math.sin(s[i] * f2 + ph2));
		return [p[0] + nx * o, p[1] + ny * o];
	});
}

const num = (v) => {
	const r = Math.round(v * 10) / 10;
	return (Object.is(r, -0) ? 0 : r).toString().replace(/^(-?)0\./, '$1.');
};
const pair = (x, y) => {
	const a = num(x),
		b = num(y);
	return a + (b.startsWith('-') ? '' : ' ') + b;
};
const seq = (vals) => vals.map((v, i) => (i && !v.startsWith('-') ? ' ' : '') + v).join('');

function smooth(pts, closed) {
	const n = pts.length;
	if (n < 2) return '';
	const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
	let d = `M${pair(pts[0][0], pts[0][1])}`;
	const last = closed ? n : n - 1;
	// Track the rounded pen position so relative coordinates don't drift.
	let px = Math.round(pts[0][0] * 10) / 10,
		py = Math.round(pts[0][1] * 10) / 10;
	for (let i = 0; i < last; i++) {
		const p0 = at(i - 1),
			p1 = at(i),
			p2 = at(i + 1),
			p3 = at(i + 2);
		const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
		const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
		const vals = [c1[0] - px, c1[1] - py, c2[0] - px, c2[1] - py, p2[0] - px, p2[1] - py].map(num);
		d += 'c' + seq(vals);
		px += +vals[4];
		py += +vals[5];
	}
	return d + (closed ? 'z' : '');
}

export function makeScene({ width, height, ink = '#3b2a1e', sw = 2.4, amp = 0.55, step = 5 }) {
	const parts = [];
	let seed = 7;
	// Parts drawn inside api.group(name, fn) can also be exported on their own as icons.
	let group = null;
	const bounds = (pts, pad) => {
		const xs = pts.map((p) => p[0]),
			ys = pts.map((p) => p[1]);
		return [
			Math.min(...xs) - pad,
			Math.min(...ys) - pad,
			Math.max(...xs) + pad,
			Math.max(...ys) + pad
		];
	};
	const render = (list) => {
		// Merge neighbouring paths that share a style into one element.
		const merged = [];
		for (const p of list) {
			const last = merged[merged.length - 1];
			if (p.d && last?.d && last.attrs === p.attrs) last.d += p.d;
			else merged.push({ ...p });
		}
		return merged.map((p) => p.raw ?? `<path d="${p.d}" ${p.attrs}/>`).join('');
	};
	const wrap = (viewBox, w, h, body) =>
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}"><g stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>\n`;
	const api = {
		/** Filled shape with an inked outline. */
		shape(
			pts,
			{ fill = 'none', stroke = ink, w = sw, closed = true, a = amp, offset = [0, 0] } = {}
		) {
			const rs = resample(pts, closed, step);
			if (fill !== 'none') {
				const fp = wobble(rs, closed, a * 0.8, seed++).map(([x, y]) => [
					x + offset[0],
					y + offset[1]
				]);
				parts.push({ d: smooth(fp, closed), attrs: `fill="${fill}"`, bb: bounds(fp, 0.5), group });
			}
			if (stroke !== 'none') {
				const sp = wobble(rs, closed, a, seed++);
				parts.push({
					d: smooth(sp, closed),
					attrs: `fill="none" stroke="${stroke}" stroke-width="${w}"`,
					bb: bounds(sp, w / 2 + 0.5),
					group
				});
			}
		},
		/** Fill only, no outline (highlights, shading). */
		fill(pts, color, opts = {}) {
			api.shape(pts, { ...opts, fill: color, stroke: 'none' });
		},
		/** Open inked line. */
		stroke(pts, { color = ink, w = sw, a = amp } = {}) {
			api.shape(pts, { fill: 'none', stroke: color, w, closed: false, a });
		},
		dot(cx, cy, r, color = ink) {
			parts.push({
				raw: `<circle cx="${num(cx)}" cy="${num(cy)}" r="${r}" fill="${color}"/>`,
				bb: [cx - r, cy - r, cx + r, cy + r],
				group
			});
		},
		raw(s) {
			if (s) parts.push({ raw: s, group });
		},
		/** Draw fn's parts under a name, so icon(name) can export them alone. */
		group(name, fn) {
			group = name;
			fn();
			group = null;
		},
		svg() {
			return wrap(`0 0 ${width} ${height}`, width, height, render(parts));
		},
		/** One group, cropped to its own bounds. */
		icon(name, pad = 1.5) {
			const list = parts.filter((p) => p.group === name);
			if (!list.length) throw new Error(`no group ${name}`);
			const bbs = list.filter((p) => p.bb).map((p) => p.bb);
			const x0 = Math.floor(Math.min(...bbs.map((b) => b[0])) - pad),
				y0 = Math.floor(Math.min(...bbs.map((b) => b[1])) - pad),
				x1 = Math.ceil(Math.max(...bbs.map((b) => b[2])) + pad),
				y1 = Math.ceil(Math.max(...bbs.map((b) => b[3])) + pad);
			return wrap(`${x0} ${y0} ${x1 - x0} ${y1 - y0}`, x1 - x0, y1 - y0, render(list));
		}
	};
	return api;
}

/** Four-point sparkle. */
export function sparkle(cx, cy, r) {
	const k = r * 0.28;
	return poly([
		[cx, cy - r],
		[cx + k, cy - k],
		[cx + r, cy],
		[cx + k, cy + k],
		[cx, cy + r],
		[cx - k, cy + k],
		[cx - r, cy],
		[cx - k, cy - k]
	]);
}

/** Heart centred on (cx, cy), w wide; sy squashes it vertically. */
export function heart(cx, cy, w, sy = 1) {
	const h = w * 0.9 * sy;
	const top = cy - h * 0.25;
	return join(
		bez(
			[cx, cy + h * 0.5],
			[cx - w * 0.15, cy + h * 0.3],
			[cx - w * 0.55, cy + h * 0.05],
			[cx - w * 0.5, top]
		),
		bez(
			[cx - w * 0.5, top],
			[cx - w * 0.45, cy - h * 0.6],
			[cx - w * 0.05, cy - h * 0.55],
			[cx, top]
		),
		bez(
			[cx, top],
			[cx + w * 0.05, cy - h * 0.55],
			[cx + w * 0.45, cy - h * 0.6],
			[cx + w * 0.5, top]
		),
		bez(
			[cx + w * 0.5, top],
			[cx + w * 0.55, cy + h * 0.05],
			[cx + w * 0.15, cy + h * 0.3],
			[cx, cy + h * 0.5]
		)
	);
}
