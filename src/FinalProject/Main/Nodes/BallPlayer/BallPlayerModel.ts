import {
    ASerializable,
    V3,
    Vec3,
    VertexArray3D,
    NodeTransform3D,
    ATexture
} from "../../../../anigraph";
import { TriangleMeshCharacterModel } from "./TriangleMeshCharacterModel";
import { CharacterModel } from "../../../../anigraph/starter/nodes/character";

@ASerializable("BallPlayerModel")
export class BallPlayerModel extends TriangleMeshCharacterModel {
    static DEFAULT_RADIUS = 0.3;
    radius!: number;

    get position(): Vec3 {
        return this._transform.getPosition();
    }
    set position(value: Vec3) {
        this._transform.setPosition(value);
    }

    static Create(diffuseMap: ATexture, radius?: number, ...args: any[]) {
        radius = radius ?? BallPlayerModel.DEFAULT_RADIUS;

        let verts = VertexArray3D.Sphere(radius, 24, 16);

        let newModel = new this(verts);
        newModel.radius = radius;
        newModel.init(diffuseMap);

        newModel.setTransform(new NodeTransform3D(V3(0, 0, radius)));

        return newModel;
    }

    init(diffuseMap: ATexture, ...args: any[]) {
        this.setMaterial(CharacterModel.ShaderModel.CreateMaterial(diffuseMap));
    }
}
