import {
    ASerializable,
    ANodeModel3D,
    VertexArray3D,
    V3, V2,
    Color, Vec3
} from "../../../../anigraph";
import type { TransformationInterface } from "../../../../anigraph";
import { makeNoise2D } from "fast-simplex-noise";

@ASerializable("LowPolyTerrainModel")
export class LowPolyTerrainModel extends ANodeModel3D {
    width: number = 10;
    height: number = 10;
    segmentsX: number = 16;
    segmentsY: number = 16;

    heights: number[][] = [];
    maxHeight: number = 6;

    constructor(
        width?: number,
        height?: number,
        segmentsX?: number,
        segmentsY?: number,
        transform?: TransformationInterface
    ) {
        super();
        if (width !== undefined) this.width = width;
        if (height !== undefined) this.height = height;
        if (segmentsX !== undefined) this.segmentsX = segmentsX;
        if (segmentsY !== undefined) this.segmentsY = segmentsY;
        if (transform) this.setTransform(transform);

        this.initHeights();
    }

    initHeights() {
        this.heights = [];
        for (let y = 0; y <= this.segmentsY; y++) {
            this.heights[y] = [];
            for (let x = 0; x <= this.segmentsX; x++) {
                this.heights[y][x] = 0;
            }
        }
    }

    static Create(
        width?: number,
        height?: number,
        segmentsX?: number,
        segmentsY?: number,
        transform?: TransformationInterface
    ) {
        let terrain = new this(width, height, segmentsX, segmentsY, transform);
        terrain.generateGeometry();
        return terrain;
    }

    generateHills(noiseScale: number = 0.3, amplitude: number = 0.5) {
        const noise2D = makeNoise2D();

        for (let y = 0; y <= this.segmentsY; y++) {
            for (let x = 0; x <= this.segmentsX; x++) {
                const worldX = (x / this.segmentsX) * this.width;
                const worldY = (y / this.segmentsY) * this.height;
                const noiseValue = (noise2D(worldX * noiseScale, worldY * noiseScale) + 1) * 0.5;
                this.heights[y][x] = noiseValue * amplitude;
            }
        }

        this.generateGeometry();
    }


    getHeightAt(worldX: number, worldY: number): number {
        const gridX = ((worldX + this.width / 2) / this.width) * this.segmentsX;
        const gridY = ((worldY + this.height / 2) / this.height) * this.segmentsY;

        const ix = Math.floor(gridX);
        const iy = Math.floor(gridY);

        if (ix < 0 || ix >= this.segmentsX || iy < 0 || iy >= this.segmentsY) {
            return 0;
        }

        const fx = gridX - ix;
        const fy = gridY - iy;

        const h00 = this.heights[iy][ix];
        const h10 = this.heights[iy][ix + 1] ?? h00;
        const h01 = this.heights[iy + 1]?.[ix] ?? h00;
        const h11 = this.heights[iy + 1]?.[ix + 1] ?? h00;

        const h0 = h00 * (1 - fx) + h10 * fx;
        const h1 = h01 * (1 - fx) + h11 * fx;

        return h0 * (1 - fy) + h1 * fy;
    }

    getColorAt(worldX: number, worldY: number): Color {
        const height = this.getHeightAt(worldX, worldY);
        return this.getColorForHeight(height);
    }

    generateGeometry() {
        let verts = VertexArray3D.CreateForRendering(true, true, true);

        const cellWidth = this.width / this.segmentsX;
        const cellHeight = this.height / this.segmentsY;
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        let vertexIndex = 0;

        for (let y = 0; y < this.segmentsY; y++) {
            for (let x = 0; x < this.segmentsX; x++) {
                const x0 = x * cellWidth - halfWidth;
                const x1 = (x + 1) * cellWidth - halfWidth;
                const y0 = y * cellHeight - halfHeight;
                const y1 = (y + 1) * cellHeight - halfHeight;

                // height at corners
                const h1 = this.heights[y][x];
                const h2 = this.heights[y][x + 1];
                const h3 = this.heights[y + 1][x];
                const h4 = this.heights[y + 1][x + 1];

                // four corners of grid
                const p_bottom_left = V3(x0, y0, h1);
                const p_bottom_right = V3(x1, y0, h2);
                const p_top_left = V3(x0, y1, h3);
                const p_top_right = V3(x1, y1, h4);

                const avgHeight = (h1 + h2 + h3 + h4) / 4;
                const color = this.getColorForHeight(avgHeight);

                // random triangle direction
                if (Math.random() > 0.5) {
                    const n1 = p_bottom_right.minus(p_bottom_left).cross(p_top_right.minus(p_bottom_left)).getNormalized();
                    verts.addVertex(p_bottom_left, n1, V2(0, 0), color);
                    verts.addVertex(p_bottom_right, n1, V2(0, 0), color);
                    verts.addVertex(p_top_right, n1, V2(0, 0), color);
                    verts.addTriangleIndices(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                    vertexIndex += 3;

                    const n2 = p_top_right.minus(p_bottom_left).cross(p_top_left.minus(p_bottom_left)).getNormalized();
                    verts.addVertex(p_bottom_left, n2, V2(0, 0), color);
                    verts.addVertex(p_top_right, n2, V2(0, 0), color);
                    verts.addVertex(p_top_left, n2, V2(0, 0), color);
                    verts.addTriangleIndices(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                    vertexIndex += 3;
                } else {
                    const n1 = p_bottom_right.minus(p_bottom_left).cross(p_top_left.minus(p_bottom_left)).getNormalized();
                    verts.addVertex(p_bottom_left, n1, V2(0, 0), color);
                    verts.addVertex(p_bottom_right, n1, V2(0, 0), color);
                    verts.addVertex(p_top_left, n1, V2(0, 0), color);
                    verts.addTriangleIndices(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                    vertexIndex += 3;

                    const n2 = p_top_right.minus(p_bottom_right).cross(p_top_left.minus(p_bottom_right)).getNormalized();
                    verts.addVertex(p_bottom_right, n2, V2(0, 0), color);
                    verts.addVertex(p_top_right, n2, V2(0, 0), color);
                    verts.addVertex(p_top_left, n2, V2(0, 0), color);
                    verts.addTriangleIndices(vertexIndex, vertexIndex + 1, vertexIndex + 2);
                    vertexIndex += 3;
                }
            }
        }

        this._setVerts(verts);
        this.signalGeometryUpdate();
    }

    getColorForHeight(height: number): Color {
        const t = Math.min(1, Math.max(0, height / this.maxHeight));

        // color for terrain dependign on height
        const colors = [
            Color.FromRGBA(0.2, 0.6, 0.5, 1),
            Color.FromRGBA(0.3, 0.75, 0.4, 1),
            Color.FromRGBA(0.5, 0.85, 0.35, 1),
            Color.FromRGBA(0.7, 0.9, 0.4, 1),
            Color.FromRGBA(0.9, 0.85, 0.5, 1),
        ];

        const scale = t * (colors.length - 1);
        const idx = Math.floor(scale);
        const frac = scale - idx;

        if (idx >= colors.length - 1) {
            return colors[colors.length - 1];
        }

        const c1 = colors[idx];
        const c2 = colors[idx + 1];

        return Color.FromRGBA(
            c1.r * (1 - frac) + c2.r * frac,
            c1.g * (1 - frac) + c2.g * frac,
            c1.b * (1 - frac) + c2.b * frac,
            1
        );
    }

    worldToGrid(worldX: number, worldY: number): { x: number, y: number } {
        const gridX = ((worldX + this.width / 2) / this.width) * this.segmentsX;
        const gridY = ((worldY + this.height / 2) / this.height) * this.segmentsY;
        return { x: gridX, y: gridY };
    }

    gridToWorld(gridX: number, gridY: number): { x: number, y: number } {
        const worldX = (gridX / this.segmentsX) * this.width - this.width / 2;
        const worldY = (gridY / this.segmentsY) * this.height - this.height / 2;
        return { x: worldX, y: worldY };
    }

    getCells(point: Vec3, radius: number, heightUpdate: (vec: Vec3, args: any[]) => number, ...args: any[]) {

        const center = this.worldToGrid(point.x, point.y);

        const cellw = this.width / this.segmentsX;
        const cellh = this.height / this.segmentsY;
        const gridRadiusx = radius / cellw;
        const gridRadiusy = radius / cellh;

        const minx = Math.max(0, Math.floor(center.x - gridRadiusx));
        const maxx = Math.min(this.segmentsX, Math.ceil(center.x + gridRadiusx));
        const miny = Math.max(0, Math.floor(center.y - gridRadiusy));
        const maxy = Math.min(this.segmentsY, Math.ceil(center.y + gridRadiusy));

        const visited: Set<string> = new Set();

        // check cells in radius
        for (let gy = miny; gy <= maxy; gy++) {
            for (let gx = minx; gx <= maxx; gx++) {
                const worldPos = this.gridToWorld(gx, gy);

                const vec = point.minus(new Vec3([worldPos.x, worldPos.y, this.heights[gy][gx]]))
                const dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

                if (dist <= radius) {
                    this.heights[gy][gx] += heightUpdate(vec, args);

                    if (gx > 0 && gy > 0) visited.add(`${gx - 1},${gy - 1}`);
                    if (gx < this.segmentsX && gy > 0) visited.add(`${gx},${gy - 1}`);
                    if (gx > 0 && gy < this.segmentsY) visited.add(`${gx - 1},${gy}`);
                    if (gx < this.segmentsX && gy < this.segmentsY) visited.add(`${gx},${gy}`);
                }
            }
        }

        return visited;
    }

    terraform(point: Vec3, radius: number, strength: number) {
        let visited = this.getCells(point, radius, this.baseHeightChange, radius, strength);

        if (visited.size > 0) {
            this.updateVerticesForCells(visited);
        }

        // this.signalGeometryUpdate();
    }

    flatten(point: Vec3, radius: number, normal: Vec3 | undefined, strength: number) {
        let visited = this.getCells(point, radius, this.flattenHeightChange, normal, radius, strength);

        if (visited.size > 0) {
            this.updateVerticesForCells(visited);
        }
    }

    flattenHeightChange(vec: Vec3, args: any[]) {
        let normal = args[0];
        let radius = args[1];
        let strength = args[2];

        if (!normal) {
            return 0;
        }
        normal.normalize();

        let dist = normal.dot(vec);
        let pointDist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
        const falloff = 1 - (pointDist / radius);
        const squared = falloff * falloff;

        if (squared * strength > Math.abs(dist)) {
            return dist;
        }
        if (squared * strength < Math.abs(dist)*0.1) {
            return dist * 0.1;
        }

        return squared * strength * Math.sign(dist);
    }

    baseHeightChange(vec: Vec3, args: any[]) {
        let radius = args[0];
        let strength = args[1];
        let dist = Math.sqrt(vec.x * vec.x + vec.y * vec.y);

        const falloff = 1 - (dist / radius);
        const squared = falloff * falloff;

        return strength * squared;
    }

    static moveZ(index: number, dist: number, verts: VertexArray3D, args: any[]) {
        let strength = args[0];
        let radius = args[1];
        let falloff = 1 - (dist / radius);
        let squared = falloff * falloff;
        let vert = verts.position.getAt(index);
        verts.position.setAt(index, V3(vert.x, vert.y, vert.z + strength * squared));
        return verts.position.getAt(index);
    }

    updateVerticesForCells(cells: Set<string>) {
        const cell_w = this.width / this.segmentsX;
        const cell_h = this.height / this.segmentsY;
        const half_w = this.width / 2;
        const half_h = this.height / 2;

        for (const key of Array.from(cells)) {
            const [x, y] = key.split(',').map(Number);

            const vertexIndex = (y * this.segmentsX + x) * 6;

            const x0 = x * cell_w - half_w;
            const x1 = (x + 1) * cell_w - half_w;
            const y0 = y * cell_h - half_h;
            const y1 = (y + 1) * cell_h - half_h;

            const h1 = this.heights[y][x];
            const h2 = this.heights[y][x + 1];
            const h3 = this.heights[y + 1][x];
            const h4 = this.heights[y + 1][x + 1];

            const avgHeight = (h1 + h2 + h3 + h4) / 4;
            const color = this.getColorForHeight(avgHeight);

            this.verts.position.setAt(vertexIndex, V3(x0, y0, h1));

            this.verts.position.setAt(vertexIndex + 1, V3(x1, y0, h2));

            const v2 = this.verts.position.getAt(vertexIndex + 2);
            const v3 = this.verts.position.getAt(vertexIndex + 3);
            const v4 = this.verts.position.getAt(vertexIndex + 4);
            const v5 = this.verts.position.getAt(vertexIndex + 5);

            this.updateVertexZ(vertexIndex + 2, v2, x0, x1, y0, y1, h1, h2, h3, h4);
            this.updateVertexZ(vertexIndex + 3, v3, x0, x1, y0, y1, h1, h2, h3, h4);

            this.updateVertexZ(vertexIndex + 4, v4, x0, x1, y0, y1, h1, h2, h3, h4);
            this.updateVertexZ(vertexIndex + 5, v5, x0, x1, y0, y1, h1, h2, h3, h4);

            for (let i = 0; i < 6; i++) {
                this.verts.color.setAt(vertexIndex + i, color);
            }
        }

        this.signalGeometryUpdate();
    }

    updateVertexZ(index: number, pos: Vec3, x0: number, x1: number, y0: number, y1: number,
        h1: number, h2: number, h3: number, h4: number) {
        const eps = 0.001;
        let newz = pos.z;

        // set correct z value
        if (Math.abs(pos.x - x0) < eps && Math.abs(pos.y - y0) < eps) newz = h1;
        else if (Math.abs(pos.x - x1) < eps && Math.abs(pos.y - y0) < eps) newz = h2;
        else if (Math.abs(pos.x - x0) < eps && Math.abs(pos.y - y1) < eps) newz = h3;
        else if (Math.abs(pos.x - x1) < eps && Math.abs(pos.y - y1) < eps) newz = h4;

        this.verts.position.setAt(index, V3(pos.x, pos.y, newz));
    }
}

