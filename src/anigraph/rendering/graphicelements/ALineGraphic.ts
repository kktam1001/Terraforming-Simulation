import {ALineSegmentsGraphic} from "./ALineSegmentsGraphic";
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {Line2} from "three/examples/jsm/lines/Line2";
import {ASerializable} from "../../base";
import {VertexArray} from "../../geometry";
import {Color} from "../../math";
import * as THREE from "three";
import {AMaterial} from "../material";

@ASerializable("ALineGraphic")
export class ALineGraphic extends ALineSegmentsGraphic{
    get geometry():LineGeometry{
        return this._geometry as LineGeometry;
    }
    get threejs():Line2{
        return this._element as Line2;
    }
    _createLineGeometry() {
        this._geometry = new LineGeometry();
    }

    setColors(rgba: number[]|Float32Array) {
        // converts [ r1, g1, b1,  r2, g2, b2, ... ] to pairs format
        const length = rgba.length - 4;
        const colors = new Float32Array(2 * length);

        for (let i = 0; i < length; i += 4) {
            colors[2 * i] = rgba[i];
            colors[2 * i + 1] = rgba[i + 1];
            colors[2 * i + 2] = rgba[i + 2];
            colors[2 * i + 3] = rgba[i + 3];

            colors[2 * i + 4] = rgba[i + 4];
            colors[2 * i + 5] = rgba[i + 5];
            colors[2 * i + 6] = rgba[i + 6];
            colors[2 * i + 7] = rgba[i + 7];

        }
        super.setColors(colors);
    }


    static Create(verts?:VertexArray<any>, material?:Color|THREE.Color|THREE.Material|THREE.Material[]|AMaterial, lineWidth?:number){
        // let newElement = new this(verts, material);
        // newElement.init();
        let newElement = new this();
        newElement.init(verts, material);
        if(lineWidth !== undefined){
            newElement.setLineWidth(lineWidth);
        }
        return newElement;
    }

}

