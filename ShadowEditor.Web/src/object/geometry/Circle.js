/**
 * 圆
 * @param {*} geometry 几何体
 * @param {*} material 材质
 */
function Circle(geometry = new THREE.CircleBufferGeometry(1, 32), material = new THREE.MeshStandardMaterial()) {
    THREE.Mesh.call(this, geometry, material);

    this.name = '圆';
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

Circle.prototype = Object.create(THREE.Mesh.prototype);
Circle.prototype.constructor = Circle;

export default Circle;