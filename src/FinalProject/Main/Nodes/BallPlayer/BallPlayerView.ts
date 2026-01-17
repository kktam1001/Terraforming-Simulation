import { BallPlayerModel } from "./BallPlayerModel";
import { TriangleMeshCharacterView } from "./TriangleMeshCharacterView";
import { ATriangleMeshGraphic } from "../../../../anigraph";

export class BallPlayerView extends TriangleMeshCharacterView {
    get model(): BallPlayerModel {
        return this._model as BallPlayerModel;
    }

    init() {
        this.meshGraphic = new ATriangleMeshGraphic(
            this.model.verts,
            this.mainMaterial.threejs
        );
        this.registerAndAddGraphic(this.meshGraphic);
        this.setTransform(this.model.transform);
    }

    update() {
        this.setTransform(this.model.transform);
    }
}

