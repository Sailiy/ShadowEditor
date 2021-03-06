/**
 * 纽结
 * @param {*} geometry 几何体
 * @param {*} material 材质
 */
function TorusKnot(geometry = new THREE.TorusKnotBufferGeometry(2, 0.8, 64, 12, 2, 3), material = new THREE.MeshStandardMaterial()) {
    THREE.Mesh.call(this, geometry, material);

    this.name = '纽结';
    this.castShadow = true;
    this.receiveShadow = true;

    this.userData.physics = this.userData.physics || {
        enabled: false,
        shape: 'btBoxShape',
        mass: 1,
        inertia: {
            x: 0,
            y: 0,
            z: 0,
        }
    };
}

TorusKnot.prototype = Object.create(THREE.Mesh.prototype);
TorusKnot.prototype.constructor = TorusKnot;

export default TorusKnot;