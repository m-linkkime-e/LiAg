/**
 * LiXin Avatar Generator
 *
 * Based on https://github.com/mrdoob/three.js/
 *
 * Tested on r104
 *
 * @author lixin / https://github.com/Great-Li-Xin
 */

THREE.FindMinGeometry = function () {
};

THREE.FindMinGeometry.prototype = {

    constructor: THREE.FindMinGeometry,

    parse: (function () {

        let vector = new THREE.Vector3();
        let normalMatrixWorld = new THREE.Matrix3();

        return function (scene) {

            let output = Infinity;

            scene.traverse(function (mesh) {

                if (mesh instanceof THREE.Mesh) {

                    const {
                        matrixWorld,
                        geometry: bufferGeometry,
                        skeleton
                    } = mesh;

                    // let geometry = new THREE.Geometry().fromBufferGeometry( bufferGeometry );

                    const bufferIndices = bufferGeometry.getIndex();
                    const bufferSkinIndices = bufferGeometry.getAttribute('skinIndex');
                    const bufferSkinWeights = bufferGeometry.getAttribute('skinWeight');
                    const bufferPositions = bufferGeometry.getAttribute('position');

                    function computeFaceNormal(a, b, c) {
                        const cb = new THREE.Vector3();
                        const ab = new THREE.Vector3();

                        const vA = new THREE.Vector3().fromBufferAttribute(bufferPositions, a);
                        const vB = new THREE.Vector3().fromBufferAttribute(bufferPositions, b);
                        const vC = new THREE.Vector3().fromBufferAttribute(bufferPositions, c);

                        cb.subVectors(vC, vB);
                        ab.subVectors(vA, vB);
                        cb.cross(ab);

                        cb.normalize();

                        return cb;
                    }

                    normalMatrixWorld.getNormalMatrix(matrixWorld);

                    for (let i = 0, len = bufferIndices.count; i < len; i += 3) {
                        const a = bufferIndices.getX(i);
                        const b = bufferIndices.getY(i);
                        const c = bufferIndices.getZ(i);

                        const faceNormal = computeFaceNormal(a, b, c);

                        // this may be redundant
                        vector.copy(faceNormal).applyMatrix3(normalMatrixWorld).normalize();

                        // eslint-disable-next-line no-loop-func
                        [a, b, c].forEach(vertexIndex => {

                            vector.fromBufferAttribute(bufferPositions, vertexIndex);

                            // see https://github.com/mrdoob/three.js/issues/3187
                            let boneIndices = [];
                            boneIndices[0] = bufferSkinIndices.getX(vertexIndex);
                            boneIndices[1] = bufferSkinIndices.getY(vertexIndex);
                            boneIndices[2] = bufferSkinIndices.getZ(vertexIndex);
                            boneIndices[3] = bufferSkinIndices.getW(vertexIndex);

                            let weights = [];
                            weights[0] = bufferSkinWeights.getX(vertexIndex);
                            weights[1] = bufferSkinWeights.getY(vertexIndex);
                            weights[2] = bufferSkinWeights.getZ(vertexIndex);
                            weights[3] = bufferSkinWeights.getW(vertexIndex);

                            let inverses = [];
                            inverses[0] = skeleton.boneInverses[boneIndices[0]];
                            inverses[1] = skeleton.boneInverses[boneIndices[1]];
                            inverses[2] = skeleton.boneInverses[boneIndices[2]];
                            inverses[3] = skeleton.boneInverses[boneIndices[3]];

                            let skinMatrices = [];
                            skinMatrices[0] = skeleton.bones[boneIndices[0]].matrixWorld;
                            skinMatrices[1] = skeleton.bones[boneIndices[1]].matrixWorld;
                            skinMatrices[2] = skeleton.bones[boneIndices[2]].matrixWorld;
                            skinMatrices[3] = skeleton.bones[boneIndices[3]].matrixWorld;

                            let finalVector = new THREE.Vector4();
                            for (let k = 0; k < 4; k++) {
                                let tempVector = new THREE.Vector4(vector.x, vector.y, vector.z);
                                tempVector.multiplyScalar(weights[k]);
                                //the inverse takes the vector into local bone space
                                tempVector.applyMatrix4(inverses[k])
                                //which is then transformed to the appropriate world space
                                    .applyMatrix4(skinMatrices[k]);
                                finalVector.add(tempVector);
                            }
                            if (output > finalVector.y) {
                                output = finalVector.y;
                            }
                        });
                    }
                }
            });
            return output;
        };
    }())
};