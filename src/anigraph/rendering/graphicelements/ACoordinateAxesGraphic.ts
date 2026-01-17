import {AGraphicElement, AGraphicElementBase, AGraphicObject} from "../graphicobject";
import {Color, V3} from "../../math";
import {VertexArray, VertexArray2D, VertexArray3D} from "../../geometry";
import {LineSegmentsGeometry} from "three/examples/jsm/lines/LineSegmentsGeometry";
import {LineSegments2} from "three/examples/jsm/lines/LineSegments2";
import * as THREE from "three";
import {ALineMaterialModel, AMaterial, AShaderMaterial, AThreeJSLineMaterial} from "../material";
import {ASerializable} from "../../base";
import {LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {Line2} from "three/examples/jsm/lines/Line2";
import {ALineSegmentsGraphic} from "./ALineSegmentsGraphic";

@ASerializable("ACoordinateAxesGraphic")
export class ACoordinateAxesGraphic extends AGraphicElement {
    lineMaterial:AMaterial;
    axesScale:number=1;


    get element():Line2{
        return this._element as Line2;
    }

    get geometry(): LineSegmentsGeometry {
        return this._geometry as LineSegmentsGeometry;
    }

    get lineWidth() {
        return this.material.linewidth;
    }

    setLineWidth(lineWidth: number) {
        ((this.lineMaterial._material) as AThreeJSLineMaterial).linewidth = lineWidth;
    }

    onMaterialUpdate(newMaterial: AMaterial) {
        super.onMaterialUpdate(newMaterial);
    }

    onMaterialChange(newMaterial: AMaterial) {
        super.onMaterialUpdate(newMaterial);
    }

    get threejs(): LineSegments2 {
        return this._element as LineSegments2;
    }

    get material(): AThreeJSLineMaterial {
        return this._material as AThreeJSLineMaterial;
    }

    createVertexArray(scale:number){
        let verts = VertexArray3D.CreateForRendering(false, false, true);
        let o = V3();
        let x = V3(scale,0,0);
        let y = V3(0,scale,0);
        let z = V3(0,0,scale);
        let r=Color.Red().Vec4;
        let g = Color.Green().Vec4;
        let b = Color.Blue().Vec4;
        verts.addVertices(
            [o,x,o,y,o,z],
            [r,r,g,g,b,b]
        )
        return verts
    }

    // With Line Segment Geometry
    _createLineGeometry() {
        this._geometry = new LineSegmentsGeometry();
    }

    static Create(...args:any[]) {
        return new this(...args);
    }

    constructor(scale?:number, lineWidth?:number) {
        super();
        this.lineMaterial = ALineMaterialModel.GlobalInstance.CreateMaterial() as AMaterial;
        this.lineMaterial.usesVertexColors=true;
        this._material = this.lineMaterial._material;
        this.axesScale = (scale!==undefined)?scale:1.0;
        if(lineWidth !== undefined) {
            this.setLineWidth(lineWidth);
        }else{
            this.setLineWidth(0.005);
        }
        this.setLineVerts(this.createVertexArray(this.axesScale));
        // this.setGeometry(this.createVertexArray(this.axesScale));
        this.setMaterial(this.lineMaterial);

        // @ts-ignore
        this._element = new Line2(this.geometry, this.material);
        this._element.matrixAutoUpdate = false;
    }

    setLineVerts(verts: VertexArray<any>|number[]) {
        let geometry = verts;
        if (Array.isArray(verts)) {
            // geometry = VertexArray2D.CreateLineSegments2D(verts);
            throw new Error("Setting verts from array not implemented yet")
        }

        if (this._geometry) {
            this._geometry.dispose();
        }
        this._createLineGeometry();
        if ((geometry as VertexArray<any>).nVerts > 0) {
            this.geometry.setPositions((geometry as VertexArray<any>).position.getElementsSlice());
            if((geometry as VertexArray<any>).color !== undefined && (geometry as VertexArray<any>).color.nVerts>0) {
                this.setColors((geometry as VertexArray<any>).color.getElementsSlice());
            }
        }
        if (this._element) {
            this.element.geometry = this._geometry as LineGeometry;
        }
    }

    setColors(rgba: number[] | Float32Array) {
        let colors: Float32Array;
        if (rgba instanceof Float32Array) {
            colors = rgba;
        } else {
            colors = new Float32Array(rgba);
        }
        const instanceColorBuffer = new THREE.InstancedInterleavedBuffer(colors, 8, 1); // rgba, rgba
        this.geometry.setAttribute('instanceColorStart', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 4, 0)); // rgba
        this.geometry.setAttribute('instanceColorEnd', new THREE.InterleavedBufferAttribute(instanceColorBuffer, 4, 4)); // rgba
    }

}

