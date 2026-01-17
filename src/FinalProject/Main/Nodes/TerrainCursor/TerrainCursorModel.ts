import {
    ANodeModel3D,
    ASerializable,
    Color, Quaternion,
    V2, V3, Vec3,
    VertexArray3D
} from "../../../../anigraph";
import type {TransformationInterface} from "../../../../anigraph";

@ASerializable("TerrainCursorModel")
export class TerrainCursorModel extends ANodeModel3D{

    circle: VertexArray3D;
    _position: Vec3;
    _direction: Vec3;

    constructor(transform?:TransformationInterface) {
        super();
        this.circle = TerrainCursorModel.CreateCircle(1, 0.1, 32, Color.Red());
        this._position = new Vec3();
        this._direction = new Vec3();
        if(transform){
            this.setTransform(transform);
        }
    }

    set position(position: Vec3) {
        this._position = position;
        this.transform.setPosition(this._position);
    }

    set direction(direction:Vec3) {
        this._direction = direction;
        this.transform._setQuaternionRotation(Quaternion.FromRotationBetweenTwoVectors(Vec3.UnitZ(), this._direction));
    }

    static CreateCircle(radius:number, width: number, segments: number, color: Color,
                        transform?:TransformationInterface, ...args:any[]){
        let verts = VertexArray3D.CreateForRendering(
            true,
            true,
            true);
        let prevAngle = 0;
        let innerRadius = radius-width;
        for (let i = 1; i <= segments; i++) {
            let angle = (i / segments) * Math.PI * 2;
            verts.addVertex(V3(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0),
                Vec3.UnitZ(), V2(0,0), color);
            verts.addVertex(V3(Math.cos(prevAngle) * innerRadius, Math.sin(prevAngle) * innerRadius, 0),
                Vec3.UnitZ(), V2(0,0), color);
            verts.addVertex(V3(Math.cos(prevAngle) * radius, Math.sin(prevAngle) * radius, 0),
                Vec3.UnitZ(), V2(0,0), color);
            verts.addVertex(V3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
                Vec3.UnitZ(), V2(0,0), color);

            verts.addTriangleIndices(4*(i-1),4*(i-1)+1,4*(i-1)+2);
            verts.addTriangleIndices(4*(i-1),4*(i-1)+2,4*(i-1)+3);

            prevAngle = angle;
        }

        return verts;
    }
}



